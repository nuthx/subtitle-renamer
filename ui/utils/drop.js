import { detectFiles } from "@/utils/detect"
import { elapsedTime } from "@/utils/time"

export async function addDroppedFiles(paths, fileList, archiveList, tableScope, setFileList, setArchiveList) {
  const startTime = Date.now()
  const { files, archives, addedCount, filteredCount, duplicateCount, excludedCount, skippedFolderCount } =
    await detectFiles(paths, fileList, archiveList)

  const reasons = []
  if (filteredCount > 0) reasons.push(`${filteredCount} 个无效文件`)
  if (duplicateCount > 0) reasons.push(`${duplicateCount} 个重复文件`)
  if (excludedCount > 0) reasons.push(`${excludedCount} 个设置中排除的文件`)
  if (skippedFolderCount > 0) reasons.push(`${skippedFolderCount} 个跳过的文件夹`)
  const filterText = reasons.length ? `过滤了 ${reasons.join("和 ")}` : ""

  if (addedCount === 0) {
    throw new Error(`${filterText || "没有可添加的文件"}，耗时 ${elapsedTime(startTime)}`)
  }

  setFileList(tableScope, () => files)
  setArchiveList(tableScope, () => archives)
  return { message: `添加了 ${addedCount} 个文件${filterText && `，${filterText}`}，耗时 ${elapsedTime(startTime)}` }
}
