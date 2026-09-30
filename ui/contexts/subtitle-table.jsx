import {
  ArrowFatUpIcon,
  ArrowsClockwiseIcon,
  CopyIcon,
  FileMinusIcon,
  FolderOpenIcon,
  PathIcon,
  StackMinusIcon,
} from "@phosphor-icons/react"
import { basename, dirname } from "@tauri-apps/api/path"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { openPath } from "@tauri-apps/plugin-opener"
import { useCallback } from "react"

import { ContextItem, ContextMenu, ContextSeparator } from "@/components/context-menu"
import { toast } from "@/components/toast"
import { useConfigStore } from "@/store/config"
import { useTableStore } from "@/store/table"

const colKeys = ["video", "sc", "tc"]

export function SubtitleTableContextMenu({ cell, fileData, tableScope, onClose }) {
  const config = useConfigStore((s) => s.config)
  const fileList = useTableStore((s) => s[tableScope].fileList)
  const setFileList = useTableStore((s) => s.setFileList)
  const moveFileItem = useTableStore((s) => s.moveFileItem)

  const handleOpenLocation = useCallback(async () => {
    try {
      const dir = await dirname(fileData[cell.row]?.[colKeys[cell.col]])
      await openPath(dir)
    } catch (error) {
      toast.error({ title: "无法打开文件夹", description: error.message || String(error) })
    }
  }, [cell, fileData])

  const handleCopyFileName = useCallback(async () => {
    try {
      const fileName = await basename(fileData[cell.row]?.[colKeys[cell.col]])
      await writeText(fileName)
      toast.success({ title: "已复制文件名" }, { duration: 800 })
    } catch (error) {
      toast.error({ title: "复制失败", description: error.message || String(error) })
    }
  }, [cell, fileData])

  const handleCopyFilePath = useCallback(async () => {
    try {
      await writeText(fileData[cell.row]?.[colKeys[cell.col]])
      toast.success({ title: "已复制文件路径" }, { duration: 800 })
    } catch (error) {
      toast.error({ title: "复制失败", description: error.message || String(error) })
    }
  }, [cell, fileData])

  const handleChangeType = useCallback(() => {
    const sourceKey = colKeys[cell.col]
    const targetKey = cell.col === 1 ? "tc" : "sc"
    const value = fileList[sourceKey]?.[cell.row]
    setFileList(tableScope, (prev) => ({
      ...prev,
      [sourceKey]: (prev[sourceKey] || []).filter((_, i) => i !== cell.row),
      [targetKey]: [...(prev[targetKey] || []), value].sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true })),
    }))
  }, [cell, fileList, setFileList, tableScope])

  const handleMove = useCallback(
    (offset) => {
      const key = colKeys[cell.col]
      moveFileItem(tableScope, key, cell.row, cell.row + offset)
    },
    [cell, moveFileItem, tableScope],
  )

  const handleDeleteItem = useCallback(() => {
    const key = colKeys[cell.col]
    setFileList(tableScope, (prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== cell.row),
    }))
  }, [cell, setFileList, tableScope])

  const handleDeleteRow = useCallback(() => {
    setFileList(tableScope, (prev) =>
      Object.fromEntries(Object.entries(prev).map(([key, arr]) => [key, arr.filter((_, i) => i !== cell.row)])),
    )
  }, [cell, setFileList, tableScope])

  const colData = cell ? fileList[colKeys[cell.col]] || [] : []
  const hasContent = cell && !!colData[cell.row]
  const canMoveUp = hasContent && cell.row > 0
  const canMoveDown = hasContent && cell.row < colData.length - 1
  const isSubtitle = cell && [1, 2].includes(cell.col)
  const detectLanguage = config?.detect_language

  return (
    <ContextMenu cell={cell} onClose={onClose}>
      {cell && (
        <>
          {hasContent && (
            <ContextItem
              title="打开文件位置"
              icon={<FolderOpenIcon className="size-4" />}
              onClick={handleOpenLocation}
            />
          )}
          {hasContent && <ContextSeparator />}
          {hasContent && (
            <ContextItem title="复制文件名" icon={<CopyIcon className="size-4" />} onClick={handleCopyFileName} />
          )}
          {hasContent && (
            <ContextItem title="复制文件路径" icon={<PathIcon className="size-4" />} onClick={handleCopyFilePath} />
          )}
          {hasContent && <ContextSeparator />}
          {canMoveUp && (
            <ContextItem title="上移一行" icon={<ArrowFatUpIcon className="size-4" />} onClick={() => handleMove(-1)} />
          )}
          {canMoveDown && (
            <ContextItem
              title="下移一行"
              icon={<ArrowFatUpIcon className="size-4 rotate-180" />}
              onClick={() => handleMove(1)}
            />
          )}
          {isSubtitle && hasContent && detectLanguage && (
            <ContextItem
              title={cell.col === 1 ? "更改为繁体字幕" : "更改为简体字幕"}
              icon={<ArrowsClockwiseIcon className="size-4" />}
              onClick={handleChangeType}
            />
          )}
          {(canMoveUp || canMoveDown || (isSubtitle && hasContent && detectLanguage)) && <ContextSeparator />}
          {hasContent && (
            <ContextItem
              title={cell.col === 0 ? "删除该视频" : "删除该字幕"}
              icon={<FileMinusIcon className="size-4" />}
              onClick={handleDeleteItem}
              danger
            />
          )}
          <ContextItem title="删除此行" icon={<StackMinusIcon className="size-4" />} onClick={handleDeleteRow} danger />
        </>
      )}
    </ContextMenu>
  )
}
