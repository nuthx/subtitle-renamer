import chardet from "chardet"
import { dirname, join, extname, basename, appConfigDir } from "@tauri-apps/api/path"
import { copyFile, remove, rename, exists, readFile, writeFile } from "@tauri-apps/plugin-fs"
import { invoke } from "@tauri-apps/api/core"
import { getConfig } from "@/utils/config"
import { elapsedTime } from "@/utils/time"
import { toast } from "@/components/toast"

export async function renameSubtitles(fileData, archiveList) {
  const startTime = Date.now()
  const config = await getConfig()
  const videoRows = fileData.filter((row) => row.video)
  const scRows = fileData.filter((row) => row.sc)
  const tcRows = fileData.filter((row) => row.tc)

  if (!videoRows.length) {
    toast.error({ title: "请添加视频文件" })
    return false
  }
  if (!scRows.length && !tcRows.length) {
    toast.error({ title: "请添加字幕文件" })
    return false
  }
  if ((scRows.length && scRows.length !== videoRows.length) || (tcRows.length && tcRows.length !== videoRows.length)) {
    toast.error({ title: "视频与字幕数量不相等" })
    return false
  }
  if (config?.subtitle?.sc_extension === config?.subtitle?.tc_extension) {
    toast.error({ title: "配置无效", description: "简体字幕与繁体字幕的后缀不可相同" })
    return false
  }

  try {
    const moveSub = config.subtitle.move_sub
    const removeSub = config.subtitle.remove_sub
    const pathsToTrash = []

    // 构建新旧路径
    const filePaths = []
    for (const row of fileData) {
      const videoDir = await dirname(row.video)
      const videoExt = await extname(row.video)
      const videoName = await basename(row.video, `.${videoExt}`)

      for (const [lang, subPath, suffix] of [["sc", row.sc, config.subtitle.sc_extension], ["tc", row.tc, config.subtitle.tc_extension]]) {
        if (!subPath) continue
        if (lang === removeSub) continue
        const subExtRaw = await extname(subPath)
        const subExt = config.subtitle.lowercase_extension ? subExtRaw.toLowerCase() : subExtRaw
        const subDir = await dirname(subPath)
        const targetDir = moveSub === "none" ? subDir : videoDir
        const newPath = await join(targetDir, `${videoName}${config.subtitle.union_extension}${suffix}.${subExt}`)

        if (await exists(newPath)) {
          toast.error({ title: "目标文件已存在", description: newPath })
          return false
        } else {
          filePaths.push({ old: subPath, new: newPath })
        }
      }
    }

    for (const path of filePaths) {
      // 使用复制操作来重命名
      await copyFile(path.old, path.new)

      // 非复制模式，或复制模式但字幕在同文件夹时，删除旧字幕
      const oldDir = await dirname(path.old)
      const newDir = await dirname(path.new)
      if (moveSub !== "copy" || oldDir === newDir) {
        pathsToTrash.push(path.old)
      }

      // 检测编码，非 UTF-8 则转换
      const bytes = await readFile(path.new)
      const encoding = chardet.detect(bytes)
      if (encoding && encoding.toLowerCase() !== "utf-8") {
        const text = new TextDecoder(encoding).decode(bytes)
        await writeFile(path.new, new TextEncoder().encode(text))
      }
    }

    // 视频扩展名转小写（字幕扩展名已经在上面根据配置转换过了）
    if (config.subtitle.lowercase_extension) {
      for (const row of fileData) {
        const videoDir = await dirname(row.video)
        const videoExtRaw = await extname(row.video)
        const videoExt = videoExtRaw.toLowerCase()
        if (videoExtRaw !== videoExt) {
          const videoName = await basename(row.video, `.${videoExtRaw}`)
          const newVideoPath = await join(videoDir, `${videoName}.${videoExt}`)
          await rename(row.video, newVideoPath)
        }
      }
    }

    // 收集未命名的简体或繁体字幕等待删除
    if (removeSub !== "none") {
      for (const row of fileData) {
        const subPath = row[removeSub]
        if (subPath) pathsToTrash.push(subPath)
      }
    }

    // 收集压缩包路径等待删除
    if (config.subtitle.remove_zip && archiveList.length > 0) {
      for (const archivePath of archiveList) {
        if (await exists(archivePath)) {
          pathsToTrash.push(archivePath)
        }
      }
    }

    // 批量删除到回收站
    if (pathsToTrash.length > 0) {
      await invoke("move_to_trash", { paths: pathsToTrash }).catch((error) => {
        toast.error({ title: "删除失败", description: error })
      })
    }

    // 删除 cache 文件夹
    const cacheDir = await join(await appConfigDir(), "cache")
    if (await exists(cacheDir)) {
      await remove(cacheDir, { recursive: true })
    }

    toast.success({ title: `重命名完成，耗时 ${elapsedTime(startTime)}` })
    return true
  } catch (error) {
    toast.error({ title: "重命名失败", description: error })
    return false
  }
}
