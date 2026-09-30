mod browser;
mod extract;
mod file_time;
#[cfg(target_os = "macos")]
mod menu;
mod theme;
mod trash;

use tauri::{generate_context, generate_handler, AppHandle, Builder, Manager, Window};
use tauri_plugin_store::StoreExt;
use tauri_plugin_window_state::{StateFlags, WindowExt};
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
    trash::move_to_trash_inner(paths)
}

#[tauri::command]
fn modify_time(source_path: String, target_path: String) -> Result<(), String> {
    file_time::modify_time_inner(&source_path, &target_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn show_browser(app: AppHandle) -> Result<(), String> {
    browser::show_browser_inner(app)
}

#[tauri::command]
fn hide_browser(app: AppHandle) -> Result<(), String> {
    browser::hide_browser_inner(app)
}

#[tauri::command]
fn search_posts(app: AppHandle, query: String, page_url: Option<String>) -> Result<(), String> {
    browser::search_posts_inner(app, &query, page_url.as_deref())
}

#[tauri::command]
fn get_post(app: AppHandle, post_url: String) -> Result<(), String> {
    browser::get_post_inner(app, &post_url)
}

#[tauri::command]
fn download_subtitle(app: AppHandle, file_url: String) -> Result<(), String> {
    browser::download_subtitle_inner(app, &file_url)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .skip_initial_state("main")
                .skip_initial_state("acgrip-browser")
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(generate_handler![
            set_theme,
            extract_archive,
            move_to_trash,
            modify_time,
            show_browser,
            hide_browser,
            search_posts,
            get_post,
            download_subtitle
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // 预创建浏览器窗口
            browser::create_hidden_window(app.handle()).map_err(std::io::Error::other)?;

            // 获取配置
            let store = app.store("config.json").ok();
            let remember_window = store
                .as_ref()
                .and_then(|s| s.get("remember_window"))
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            let enable_vibrancy = store
                .as_ref()
                .and_then(|s| s.get("window_vibrancy"))
                .and_then(|v| v.as_bool())
                .unwrap_or(true);

            // 恢复窗口状态
            if remember_window {
                let _ = window.restore_state(StateFlags::all());
            }

            // 应用窗口材质
            if enable_vibrancy {
                #[cfg(target_os = "windows")]
                {
                    let _ = apply_mica(&window, None)
                        .or_else(|_| apply_acrylic(&window, None))
                        .or_else(|_| apply_blur(&window, None));
                }

                #[cfg(target_os = "macos")]
                {
                    let _ = apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None);
                }
            }

            // 创建 macOS 菜单
            #[cfg(target_os = "macos")]
            if let Ok(menu) = menu::create_menu(app) {
                let _ = app.set_menu(menu);
            }

            // 初始化完成后再显示窗口
            let _ = window.show();

            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
