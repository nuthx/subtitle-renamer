use anyhow::{anyhow, bail, Context, Result};
use encoding_rs::{BIG5, GBK};
use std::fs::{self, File};
use std::hash::{DefaultHasher, Hash, Hasher};
use std::io;
use std::path::{Path, PathBuf};
use std::str;
use tauri::{AppHandle, Manager};
use walkdir::WalkDir;
use zip::ZipArchive;

pub fn extract_archive_inner(app: AppHandle, archive_path: String) -> Result<Vec<String>> {
    let path = Path::new(&archive_path);
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or_default()
        .to_lowercase();

    // 检查格式是否支持
    if !matches!(ext.as_str(), "zip" | "7z" | "rar") {
        bail!("不支持的格式: {}", ext);
    }

    // 用路径哈希生成唯一的文件夹路径
    let mut hasher = DefaultHasher::new();
    archive_path.hash(&mut hasher);
    let output_dir = app
        .path()
        .app_config_dir()
        .context("获取配置目录失败")?
        .join("cache")
        .join(format!(
            "{}_{:x}",
            path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("archive"),
            hasher.finish() & 0xFFFFFFFF
        ));
    fs::create_dir_all(&output_dir).context("创建目录失败")?;

    // 同时使用三种程序解压，避免后缀错误
    let results = [
        ("zip", extract_zip(&archive_path, &output_dir)),
        ("7z", extract_7z(&archive_path, &output_dir)),
        ("rar", extract_rar(&archive_path, &output_dir)),
    ];

    // 如果有成功的就返回
    if results.iter().any(|(_, r)| r.is_ok()) {
        Ok(WalkDir::new(&output_dir)
            .into_iter()
            .flatten()
            .filter(|e| e.file_type().is_file())
            .map(|e| e.path().to_string_lossy().into_owned())
            .collect())
    } else {
        results
            .iter()
            .find(|(format, _)| *format == ext.as_str())
            .and_then(|(_, r)| r.as_ref().err())
            .map_or_else(|| Err(anyhow!("解压失败")), |e| Err(anyhow!("{:?}", e)))
    }
}

fn extract_zip(archive_path: &str, output_dir: &Path) -> Result<()> {
    let mut archive = ZipArchive::new(File::open(archive_path).context("打开压缩包失败")?)?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;

        // 尝试解码文件名：UTF-8 → GBK → BIG5
        let raw = file.name_raw();
        let file_name = str::from_utf8(raw).map(str::to_owned).unwrap_or_else(|_| {
            let (s, _, had_errors) = GBK.decode(raw);
            if had_errors {
                BIG5.decode(raw).0.into_owned()
            } else {
                s.into_owned()
            }
        });

        // 创建解压目录并写入文件
        let out_path = output_dir.join(&file_name);
        fs::create_dir_all(out_path.parent().unwrap_or(output_dir))?;

        if !file.is_dir() {
            io::copy(&mut file, &mut File::create(&out_path)?)?;
        }
    }
    Ok(())
}

fn extract_7z(archive_path: &str, output_dir: &PathBuf) -> Result<()> {
    sevenz_rust::decompress_file(archive_path, output_dir).context("解压失败")
}

fn extract_rar(archive_path: &str, output_dir: &Path) -> Result<()> {
    let mut archive = unrar::Archive::new(archive_path)
        .open_for_processing()
        .context("打开压缩包失败")?;

    while let Some(header) = archive.read_header().context("读取压缩包元信息失败")? {
        archive = header.extract_with_base(output_dir).context("解压失败")?;
    }
    Ok(())
}
