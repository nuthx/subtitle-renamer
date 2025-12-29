mod extract;
mod theme;

use tauri::{generate_context, generate_handler, AppHandle, Builder, Manager, Window};

#[tauri::command]
fn set_theme(window: Window, theme: String) -> Result<(), String> {
    theme::set_theme_inner(window, theme).map_err(|e| e.to_string())
}

#[tauri::command]
fn extract_archive(app: AppHandle, archive_path: String) -> Result<Vec<String>, String> {
    extract::extract_archive_inner(app, archive_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn move_to_trash(paths: Vec<String>) -> Result<(), String> {
    trash::delete_all(&paths).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(generate_handler![set_theme, extract_archive, move_to_trash])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            theme::apply_window_effect(&window);
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
