use std::env;
use std::path::{PathBuf};
// use glob::{glob, Pattern};
// use globset::escape;
// use tauri::fs::Pattern;
use crate::err::{ApiResult, ApiError};
pub fn get_resource_path() -> ApiResult<PathBuf> {
    if tauri::is_dev() {
        let current_path = env::current_dir()?;
        Ok(current_path.join("resources"))
    } else {
        let current_path = env::current_exe()?;
        let base_path = current_path
            .parent()
            .ok_or(ApiError::Error("err parent".to_string()))?;
        Ok(base_path.join("resources"))
    }
}

// pub fn get_subtitles_path(movie_filepath: String) -> ApiResult<Vec<PathBuf>> {
//     let movie_path_buf = PathBuf::from(movie_filepath);
//     let parent_path = movie_path_buf.parent().ok_or(ApiError::Error("err parent".to_string()))?;
//     let file_stem_os = movie_path_buf.file_stem().ok_or(ApiError::Error("err file name".to_string()))?;
//     let file_stem = file_stem_os.to_string_lossy().to_string();
//     let escaped_file_stem = Pattern::escape(&file_stem);
//     let pattern_root = parent_path.join(escaped_file_stem);
//     // let pattern = format!("{}.{{,}}.{{srt,vtt}}", pattern_root.to_string_lossy());
//     // let pattern = "C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].en.vtt";
//     let pattern = "C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw]";
//     let pattern = Pattern::escape(&pattern);
//     let pattern = pattern +  ".";
//     println!("pattern: {}", pattern);
//
//     let exts = vec!["srt", "vtt"];
//     let langs = vec!["en", "ja"];
//
//     let mut files: Vec<PathBuf> = Vec::new();
//     for entry in glob(&pattern)? {
//         let Ok(path_buf) = entry else { continue };
//         println!("{:?}", path_buf);
//         files.push(path_buf);
//         // let file_name = entry.file_name();
//         // let Some(file_name_os) = path_buf.file_name() else { continue };
//         // let file_name = file_name_os.to_string_lossy().to_string();
//         // if !file_name_os.to_string_lossy().starts_with(&file_stem) {
//         //     continue
//         // }
//         // if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
//         //     if ext.eq_ignore_ascii_case("srt") || ext.eq_ignore_ascii_case("vtt") {
//         //         files.push(path);
//         //     }
//         // }
//     }
//     println!("{:?}", files);
//     Ok(files)
// }


// pub fn glob_ex() {
//     let video_path = Path::new(
//         r"C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4"
//     );
//
//     // 1. 확장자 제거
//     let mut base = PathBuf::from(video_path);
//     base.set_extension(""); // 확장자 제거
//
//     // 2. 특수문자 escape (glob 패턴 안전하게 만들기)
//     let escaped = globset::escape(base.to_str().unwrap());
//
//     // 3. 모든 언어 코드 srt 패턴 만들기
//     let pattern = format!("{}*.{{srt,vtt}}", escaped);
//     println!("Searching: {}", pattern);
//
//     // 4. 매칭 실행
//     for entry in glob(&pattern).unwrap() {
//         match entry {
//             Ok(path) => println!("Found: {}", path.display()),
//             Err(e) => println!("Error: {}", e),
//         }
//     }
// }



#[cfg(test)]
mod tests {
    use super::*;
    // #[test]
    // fn test_get_subtitles_path() {
    //     let path = get_subtitles_path("C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4".to_string());
    //
    //     assert!(path.is_ok());
    // }
    //
    // #[test]
    // fn test_glob_ex() {
    //     glob_ex();
    // }
}