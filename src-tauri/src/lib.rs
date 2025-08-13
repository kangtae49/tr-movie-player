mod err;
mod http_server;
mod utils;
mod media;

use std::collections::HashMap;
use std::sync::Arc;
use tauri::{Manager, State, Window};
use tauri_specta::{collect_commands, Builder};
use tokio::sync::{Mutex, RwLock};

use crate::http_server::{HttpServer, ServInfo};
use crate::err::{ApiError, ApiResult};
use crate::media::Subtitle;

#[derive(Clone)]
struct AppState {
    pub window: Option<Window>,
    pub http_server_map: HashMap<String, Arc<Mutex<HttpServer>>>
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
#[specta::specta]
fn get_resource_path() -> ApiResult<String> {
    let p = utils::get_resource_path()?;
    Ok(p.to_string_lossy().to_string())
}

#[tauri::command]
#[specta::specta]
async fn run_http_server(state: State<'_, Arc<RwLock<AppState>>>, serv_info: ServInfo) -> ApiResult<ServInfo> {
    let app_state = state.inner().clone();
    let mut serv = http_server::HttpServer::new(serv_info);
    let serv_info = serv.run(app_state.clone()).await?;
    let id = serv_info.id.clone();
    let new_serv_info = serv_info.clone();
    app_state.write().await.http_server_map.insert(id, Arc::new(Mutex::new(serv)));

    Ok(new_serv_info)
}

#[tauri::command]
#[specta::specta]
async fn shutdown_http_server(state: State<'_, Arc<RwLock<AppState>>>, id: String) -> ApiResult<()> {
    let app_state = state.inner().clone();
    let serv = app_state.write().await.http_server_map.remove(&id).ok_or(ApiError::Error("not exist id".to_string()))?;
    let mut serv = serv.lock().await;
    serv.shutdown().await?;
    println!("shutdown_http_server: {}", id);
    Ok(())
}

#[tauri::command]
#[specta::specta]
async fn get_subtitle_list(movie_filepath: String) -> ApiResult<Vec<Subtitle>> {
    media::get_subtitle_list(movie_filepath)
}

#[tauri::command]
#[specta::specta]
async fn convert_srt_to_vtt(movie_filepath: String) -> ApiResult<String> {
    media::srt_to_vtt(movie_filepath)
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        get_resource_path,
        run_http_server,
        shutdown_http_server,
        get_subtitle_list,
        convert_srt_to_vtt,
    ]);

    #[cfg(debug_assertions)]
    {
        use std::path::Path;
        use std::fs::OpenOptions;
        use std::io::Write;

        use specta_typescript::BigIntExportBehavior;
        use specta_typescript::Typescript;
        use specta::TypeCollection;

        use crate::http_server::{HttpNotify};

        let bindings_path = Path::new("../src/bindings.ts");
        let ts = Typescript::default().bigint(BigIntExportBehavior::Number);
        builder
            .export(ts.clone(), bindings_path)
            .expect("Failed to export typescript bindings");

        let mut types = TypeCollection::default();
        types.register::<HttpNotify>();
        let http_notify_str = ts.clone().export(&types).unwrap();
        let mut file = OpenOptions::new()
            .append(true)
            .create(true)
            .open(bindings_path)
            .unwrap();
        file.write_all(http_notify_str.as_bytes()).unwrap();

    }

    tauri::Builder::default()
        .manage(Arc::new(RwLock::new(AppState {
            window: None,
            http_server_map: HashMap::new()
        })))
        .plugin(tauri_plugin_dialog::init())
        // .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            let window = app.get_window("main").unwrap();
            if let Some(state) = window.app_handle().try_state::<Arc<RwLock<AppState>>>() {
                let state = Arc::clone(&state);
                tauri::async_runtime::spawn(async move {
                    let mut app_state = state.write().await;
                    app_state.window = Some(window.clone());
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
