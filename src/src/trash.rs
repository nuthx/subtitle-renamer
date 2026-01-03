use std::fs::remove_file;
use trash::delete;

pub fn move_to_trash_inner(paths: Vec<String>) -> Result<(), String> {
    // 先尝试批量删除到回收站
    if trash::delete_all(&paths).is_ok() {
        return Ok(());
    }

    // 已知使用 SMB 挂载的内容无法移动到回收站
    // 使用循环依次尝试放入回收站或者直接删除文件
    let errors: Vec<String> = paths
        .iter()
        .filter_map(|path| {
            delete(path)
                .or_else(|_| remove_file(path))
                .err()
                .map(|e| format!("{}: {}", path, e))
        })
        .collect();

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors.join(", "))
    }
}
