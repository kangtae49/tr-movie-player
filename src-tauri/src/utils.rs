use std::env;
use std::path::PathBuf;
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

pub fn get_subtitles_path(movie_path: String) -> ApiResult<Vec<PathBuf>> {
    let movie = PathBuf::from(movie_path);
    let parent = movie.parent().ok_or(ApiError::Error("err parent".to_string()))?;
    let file_stem = movie.file_stem().ok_or(ApiError::Error("err file name".to_string()))?;
    let file_stem = file_stem.to_string_lossy().to_string();
    let mut files: Vec<PathBuf> = Vec::new();
    for entry in std::fs::read_dir(parent)? {
        let entry = entry?;
        let path = entry.path();
        println!("{:?}", path);
        // let file_name = entry.file_name();
        let Some(file_name) = path.file_name() else { continue };
        if !file_name.to_string_lossy().starts_with(&file_stem) {
            continue
        }
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if ext.eq_ignore_ascii_case("srt") || ext.eq_ignore_ascii_case("vtt") {
                files.push(path);
            }
        }
    }
    println!("{:?}", files);
    Ok(files)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_get_subtitles_path() {
        let path = get_subtitles_path("C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4".to_string());

        assert!(path.is_ok());
    }
}