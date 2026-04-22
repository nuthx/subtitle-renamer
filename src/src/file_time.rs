use anyhow::{Context, Result};
use filetime::{set_file_mtime, FileTime};
use std::fs;

pub fn modify_time_inner(source_path: &str, target_path: &str) -> Result<()> {
    let metadata = fs::metadata(source_path)
        .with_context(|| format!("读取源文件元数据失败: {}", source_path))?;

    let modified_time = FileTime::from_last_modification_time(&metadata);

    set_file_mtime(target_path, modified_time)
        .with_context(|| format!("设置目标文件修改时间失败: {}", target_path))?;

    Ok(())
}
