use std::collections::HashMap;
use std::path::{absolute};
use std::sync::Arc;
use tokio::sync::{oneshot, Mutex, RwLock};
use tokio::io::{AsyncReadExt};
use axum::{Router};
use axum::{Json, body::Bytes, response::{IntoResponse}};
use axum::body::{Body};
use axum::extract::{Path, Query};
use axum::http::header::{ACCEPT_RANGES, CONTENT_LENGTH, CONTENT_RANGE, CONTENT_TYPE};
use axum::response::Response;
use axum::routing::{get, post};
use http::{header, HeaderMap, HeaderValue, StatusCode};
use http_body_util::StreamBody;
use mime_guess::from_path;
use serde::{Deserialize, Serialize};
use serde_json::{json};
use serde_with::{serde_as, skip_serializing_none};
use tower_http::services::ServeDir;
use tower_http::cors::{CorsLayer, Any};
use specta::Type;

use tauri::{Emitter};
use tokio::fs::File;
use tokio::io::AsyncSeekExt;
use tokio_util::io::ReaderStream;
use crate::AppState;
use crate::err::{ApiError, ApiResult};
use crate::utils::get_resource_path;


#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug, Default)]
pub struct ServInfo {
    pub id: String,
    pub ip: String,
    pub port: u16,
    pub path: String,
}


#[allow(dead_code)]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub enum HttpCmd {
    Refresh,
}

#[allow(dead_code)]
#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub struct HttpNotify {
    pub cmd: HttpCmd,
    pub param: Option<String>,
}

#[derive(Clone)]
pub struct HttpServer {
    pub serv_info: ServInfo,
    pub shutdown_tx: Arc<Mutex<Option<oneshot::Sender<ServInfo>>>>,
}

impl HttpServer {
    pub fn new(serv_info: ServInfo) -> HttpServer {
        HttpServer {
            serv_info: serv_info.clone(),
            shutdown_tx: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn shutdown(&mut self) -> ApiResult<()> {
        let mut shutdown_tx = self.shutdown_tx.lock().await;
        if let Some(tx) = shutdown_tx.take() {
            let _ = tx.send(self.serv_info.clone());
        }
        Ok(())
    }

    pub async fn run(&mut self, app_state: Arc<RwLock<AppState>>) -> ApiResult<ServInfo> {
        println!("run: {:?}", &self.serv_info);
        let resource = get_resource_path()?;
        self.serv_info.path = resource.to_string_lossy().to_string();
        // let new_serv_info = ServInfo {
        //     path: resource.to_string_lossy().to_string(),
        //     ..serv_info.clone()
        // };
        let (tx, rx) = oneshot::channel();
        let (shutdown_tx, shutdown_rx) = oneshot::channel();

        let shared_shutdown_tx = Arc::new(Mutex::new(Some(shutdown_tx)));
        let app_state = app_state.clone();
        let serv_info = self.serv_info.clone();

        tokio::spawn(async move {

            let serv_path = absolute(serv_info.path.clone()).unwrap();
            println!("serv_path: {}", &serv_path.to_string_lossy().to_string());
            let abs = serv_path.to_string_lossy().to_string();
            let resource = abs.clone();
            let index_path = format!("{}/index.html", &abs);
            println!("index_path: {}", &index_path);

            let cors = CorsLayer::new()
                .allow_origin(Any)
                .allow_headers(Any)
                .allow_methods(Any);
                // .allow_methods([http::Method::GET, http::Method::HEAD, http::Method::POST, http::Method::PUT, http::Method::DELETE]);

            let serv_dir = ServeDir::new(resource);
            let app = Router::new()
                .route("/get_file", get(get_file))
                .route("/serv_info/{id}", get(get_serv_info)).with_state(app_state.clone())
                .route("/emit_jstr", post(post_emit_jstr)).with_state(app_state.clone())
                .route("/emit", post(post_emit)).with_state(app_state.clone())
                // .route("/", get(move || async move {
                //     axum::response::Html(html)
                // }))
                .fallback_service(serv_dir)
                .layer(cors)
                ;

            let listener = tokio::net::TcpListener::bind(format!("{}:{}", serv_info.ip.clone(), serv_info.port.clone())).await.unwrap();
            let addr = listener.local_addr().unwrap();
            let new_serv_info = ServInfo { id: serv_info.id.clone(), ip: addr.ip().to_string(), port: addr.port(), path: abs.clone() };
            let _ = tx.send(new_serv_info.clone());
            axum::serve(listener, app)
                .with_graceful_shutdown(async move {
                    match shutdown_rx.await {
                        Ok(serv_info) => {
                            println!("shutdown: {:?}", serv_info);
                        },
                        Err(e) => {
                            println!("shutdown {:?}: {:?}", e, new_serv_info);
                        },
                    }
                })
                .await
                .unwrap();
        });
        let new_serv_info = rx.await?;
        println!("new_serv_info: {:?}", &new_serv_info);
        self.serv_info = new_serv_info.clone();
        self.shutdown_tx = shared_shutdown_tx;

        Ok(new_serv_info)
    }

}



async fn get_serv_info(
    axum::extract::State(app_state): axum::extract::State<Arc<RwLock<AppState>>>, Path(id): Path<String>
) -> impl IntoResponse {
    // let state = app_state.read().await;

    let app_state_lock = app_state.read().await;
    let serv_arc = match app_state_lock.http_server_map.get(&id).ok_or(ApiError::Error("not exist id".to_string())) {
        Ok(serv_arc) => serv_arc,
        Err(e) => {
            return Json(json!({
                "error": e.to_string()
            })).into_response()
        },
    };
    let serv = serv_arc.lock().await;
    let serv_info = serv.serv_info.clone();
    Json(serv_info).into_response()

}

async fn post_emit_jstr(axum::extract::State(app_state): axum::extract::State<Arc<RwLock<AppState>>>, body: Bytes) -> impl IntoResponse {
    let state = app_state.read().await;
    let body = match String::from_utf8(body.to_vec()) {
        Ok(s) => s,
        Err(_) => return Json(json!({ "error": "Invalid UTF-8" })).into_response(),
    };
    println!("notify: {}", body);
    let window = match state.window.clone() {
        Some(w) => w,
        None => {
            return Json(json!({
                "error": "No window"
            })).into_response()
        }
    };
    if let Err(e) = window.emit("http", body.clone()) {
        eprintln!("emit error: {}", e);
    }
    Response::builder()
        .status(StatusCode::OK)
        .header(CONTENT_TYPE, HeaderValue::from_static("application/json"))
        .body(Body::from(body))
        .unwrap()
}

async fn post_emit(axum::extract::State(app_state): axum::extract::State<Arc<RwLock<AppState>>>, Json(payload): Json<HttpNotify>) -> impl IntoResponse {
    let state = app_state.read().await;
    let window = match state.window.clone() {
        Some(w) => w,
        None => {
            return Json(json!({
                "error": "No window"
            })).into_response()
        }
    };
    if let Err(e) = window.emit("http", payload.clone()) {
        eprintln!("emit error: {}", e);
    }
    Json(payload).into_response()
}

async fn get_file(Query(params): Query<HashMap<String, String>>,
                  headers: HeaderMap,
// ) -> Result<Response<StreamBody<ReaderStream<impl AsyncRead + Unpin>>>, (StatusCode, String)> {
) -> impl IntoResponse {
    let Some(path) = params.get("path") else {
        return (StatusCode::NOT_FOUND, "File not found".to_string()).into_response();
    };

    let mut file = match File::open(&path).await {
        Ok(f) => f,
        Err(_) => return (StatusCode::NOT_FOUND, "File not found".to_string()).into_response(),
    };

    let file_size = file.metadata().await.map(|m| m.len()).unwrap_or(0);

    let mime_type = from_path(&path).first_or_octet_stream();

    if let Some(range_header) = headers.get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some((start, end)) = parse_range_header(range_str, file_size) {
                let chunk_size = end - start + 1;

                if file.seek(std::io::SeekFrom::Start(start)).await.is_err() {
                    return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to seek file".to_string()).into_response();
                }

                let limited_reader = file.take(chunk_size);
                let stream = ReaderStream::new(limited_reader);
                let body = StreamBody::new(stream);

                let content_range = format!("bytes {}-{}/{}", start, end, file_size);

                return
                    Response::builder()
                    .status(StatusCode::PARTIAL_CONTENT)
                    .header(CONTENT_TYPE, mime_type.to_string())
                    .header(ACCEPT_RANGES, "bytes")
                    .header(CONTENT_LENGTH, chunk_size)
                    .header(CONTENT_RANGE, content_range)
                    .body(Body::from_stream(body))
                    .unwrap()
                    .into_response()
                ;


            }
        }
    }

    let limited_reader = file.take(file_size);
    let stream = ReaderStream::new(limited_reader);
    let body = StreamBody::new(stream);

    Response::builder()
        .header(CONTENT_TYPE, mime_type.to_string())
        .header(ACCEPT_RANGES, "bytes")
        .header(CONTENT_LENGTH, file_size)
        .body(Body::from_stream(body))
        .unwrap()
        .into_response()

}

fn parse_range_header(range: &str, file_size: u64) -> Option<(u64, u64)> {
    if !range.starts_with("bytes=") {
        return None;
    }
    let range = &range[6..];
    let parts: Vec<&str> = range.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].parse::<u64>().ok()?;
    let end = if parts[1].is_empty() {
        file_size - 1
    } else {
        parts[1].parse::<u64>().ok()?
    };

    if start > end || end >= file_size {
        return None;
    }

    Some((start, end))
}
