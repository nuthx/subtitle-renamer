use serde_json::Value;
use std::collections::HashMap;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::webview::{DownloadEvent, PageLoadEvent};
use tauri::{AppHandle, Emitter, Manager, Url, WebviewUrl, WebviewWindow, WebviewWindowBuilder};
use tauri_plugin_store::StoreExt;

const WINDOW_LABEL: &str = "acgrip-browser";
const HOME_URL: &str = "https://bbs.acgrip.com/";
const SEARCH_URL: &str = "https://bbs.acgrip.com/search.php";

// 用于页面检查的注入脚本
const PAGE_INSPECTION_SCRIPT: &str = r##"
(() => {
  const title = document.title || "";
  const challenge = title.includes("Just a moment")
    || title.includes("Attention Required")
    || document.querySelector("#challenge-running, .cf-challenge-running, .cf-turnstile") !== null
    || document.querySelector("script[src*=\"challenges.cloudflare.com\"], iframe[src*=\"challenges.cloudflare.com\"]") !== null;
  if (challenge || location.hostname !== "bbs.acgrip.com") {
    return null;
  }

  return {
    url: location.href,
    html: document.documentElement?.outerHTML || ""
  };
})()
"##;

pub fn show_browser_inner(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window(WINDOW_LABEL)
        .ok_or_else(|| "浏览器窗口初始化失败，请重启应用".to_string())?;
    let _ = window.unminimize();
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())
}

pub fn hide_browser_inner(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window(WINDOW_LABEL)
        .ok_or_else(|| "浏览器窗口初始化失败，请重启应用".to_string())?;
    window.hide().map_err(|e| e.to_string())
}

pub fn search_posts_inner(
    app: AppHandle,
    query: &str,
    page_url: Option<&str>,
) -> Result<(), String> {
    let mut url = Url::parse(page_url.unwrap_or(SEARCH_URL)).map_err(|e| e.to_string())?;
    if page_url.is_none() {
        url.query_pairs_mut()
            .append_pair("mod", "forum")
            .append_pair("searchsubmit", "yes")
            .append_pair("srchtxt", query.trim());
    }

    navigate_browser_window(&app, url).map(|window| {
        let _ = window.hide();
    })
}

pub fn get_post_inner(app: AppHandle, post_url: &str) -> Result<(), String> {
    let url = Url::parse(post_url).map_err(|e| e.to_string())?;
    navigate_browser_window(&app, url).map(|window| {
        let _ = window.hide();
    })
}

pub fn download_subtitle_inner(app: AppHandle, file_url: &str) -> Result<(), String> {
    let url = Url::parse(file_url).map_err(|e| e.to_string())?;
    if !url.as_str().contains("mod=attachment") {
        return Err("无效的附件地址".to_string());
    }
    navigate_browser_window(&app, url).map(|window| {
        let _ = window.hide();
    })
}

// 创建隐藏的浏览器窗口
pub fn create_hidden_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL) {
        let _ = window.hide();
        return Ok(());
    }

    let url = Url::parse(HOME_URL).map_err(|e| e.to_string())?;
    let pending_downloads = Arc::new(Mutex::new(HashMap::<String, PathBuf>::new()));
    let downloads_for_handler = Arc::clone(&pending_downloads);
    let app_for_downloads = app.clone();
    let app_for_pages = app.clone();

    WebviewWindowBuilder::new(app, WINDOW_LABEL, WebviewUrl::External(url))
        .title("CF过盾小助手")
        .min_inner_size(800.0, 600.0)
        .closable(false)
        .minimizable(false)
        .maximizable(false)
        .center()
        .visible(false)
        .enable_clipboard_access()
        .on_page_load(move |window, payload| {
            if payload.event() != PageLoadEvent::Finished {
                return;
            }

            let browser = window.clone();
            let app = app_for_pages.clone();
            let _ = window.eval_with_callback(PAGE_INSPECTION_SCRIPT, move |raw| {
                let payload = serde_json::from_str::<Value>(&raw)
                    .and_then(|value| match value {
                        Value::String(inner) => serde_json::from_str(&inner),
                        value => Ok(value),
                    })
                    .ok();
                match payload {
                    Some(Value::Null) => {
                        let _ = app.emit("session-verified", false);
                    }
                    Some(Value::Object(payload)) => {
                        let _ = app.emit("session-verified", true);
                        let _ = browser.hide();
                        let _ = app.emit("browser-page", &payload);
                    }
                    _ => {}
                }
            });
        })
        .on_download(move |_, event| {
            match event {
                DownloadEvent::Requested { url, destination } => {
                    let Ok(path) = resolve_download_path(&app_for_downloads, destination) else {
                        return true;
                    };

                    *destination = path.clone();
                    if let Ok(mut downloads) = downloads_for_handler.lock() {
                        downloads.insert(url.to_string(), path);
                    }
                }
                DownloadEvent::Finished { url, path, success } => {
                    let remembered_path = downloads_for_handler
                        .lock()
                        .ok()
                        .and_then(|mut downloads| downloads.remove(url.as_str()));

                    if !success {
                        return true;
                    }

                    if let Some(path) = path.or(remembered_path) {
                        let _ = app_for_downloads.emit("download-finished", path.to_string_lossy());
                    }
                }
                _ => {}
            }
            true
        })
        .build()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

// 在浏览器窗口中打开页面
fn navigate_browser_window(app: &AppHandle, url: Url) -> Result<WebviewWindow, String> {
    let window = app
        .get_webview_window(WINDOW_LABEL)
        .ok_or_else(|| "浏览器窗口初始化失败，请重启应用".to_string())?;

    window.navigate(url).map_err(|e| e.to_string())?;
    Ok(window)
}

// 生成下载路径，并在重名时追加序号
fn resolve_download_path(app: &AppHandle, proposed: &Path) -> Result<PathBuf, String> {
    let downloads = app
        .store("config.json")
        .ok()
        .and_then(|store| store.get("download_directory"))
        .and_then(|download_directory| {
            download_directory
                .as_str()
                .map(str::trim)
                .filter(|directory| !directory.is_empty())
                .map(PathBuf::from)
        })
        .map(Ok)
        .unwrap_or_else(|| {
            app.path()
                .app_config_dir()
                .map(|directory| directory.join("cache"))
        })
        .map_err(|e| e.to_string())?;

    std::fs::create_dir_all(&downloads).map_err(|e| e.to_string())?;

    let file_name = proposed
        .file_name()
        .unwrap_or_else(|| OsStr::new("subtitle_file"));
    let candidate = downloads.join(file_name);

    if !candidate.exists() {
        return Ok(candidate);
    }

    let stem = candidate
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("subtitle_file")
        .to_string();
    let extension = candidate
        .extension()
        .and_then(|value| value.to_str())
        .map(|extension| format!(".{extension}"))
        .unwrap_or_default();

    let mut index = 1;
    loop {
        let candidate = downloads.join(format!("{stem} ({index}){extension}"));
        if !candidate.exists() {
            return Ok(candidate);
        }
        index += 1;
    }
}
