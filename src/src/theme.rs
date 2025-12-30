use anyhow::{Context, Result};
use tauri::{Theme, WebviewWindow, Window};
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub fn set_theme_inner(window: Window, theme: String) -> Result<()> {
    let theme_value = match theme.as_str() {
        "light" => Some(Theme::Light),
        "dark" => Some(Theme::Dark),
        _ => None,
    };
    window.set_theme(theme_value).context("设置主题失败")
}

pub fn apply_window_effect(window: &WebviewWindow) {
    #[cfg(target_os = "macos")]
    apply_vibrancy(window, NSVisualEffectMaterial::HudWindow, None, None)
        .expect("Failed to apply vibrancy");

    #[cfg(target_os = "windows")]
    apply_mica(window, None).expect("Failed to apply mica");
}
