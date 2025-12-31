mod extract;
#[cfg(target_os = "macos")]
mod menu;
mod theme;

use tauri::{generate_context, generate_handler, AppHandle, Builder, Manager, Window};
#[cfg(target_os = "windows")]
use window_vibrancy::{apply_acrylic, apply_blur, apply_mica};
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

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

            // 在 Windows 下依次尝试应用云母、亚克力、模糊材质
            #[cfg(target_os = "windows")]
            {
                if apply_mica(&window, None).is_err() {
                    if apply_acrylic(&window, None).is_err() {
                        let _ = apply_blur(&window, None);
                    }
                }
            }

            // 应用 macOS 模糊材质
            #[cfg(target_os = "macos")]
            {
                let _ = apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None);
            }

            // 创建 macOS 菜单
            #[cfg(target_os = "macos")]
            if let Ok(menu) = menu::create_menu(app) {
                let _ = app.set_menu(menu);
            }

            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
