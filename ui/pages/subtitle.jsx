import { basename, dirname } from "@tauri-apps/api/path"
import { openPath } from "@tauri-apps/plugin-opener"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { useState, useCallback, useEffect } from "react"
import { useConfig } from "@/hooks/useConfig"
import { useSubtitleStore } from "@/store/subtitle"
import { detectFiles } from "@/utils/detect"
import { renameSubtitles } from "@/utils/rename"
import { elapsedTime } from "@/utils/time"
import { sortFiles } from "@/utils/sort"
import { highlightDiff } from "@/utils/highlight"
import { toast } from "@/components/toast"
import { Page, PageBlock } from "@/components/page"
import { ContextMenu, ContextItem, ContextSeparator } from "@/components/context-menu"
import { DropArea } from "@/components/drop"
import { Table } from "@/components/table"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import { FileVideoIcon, FileTextIcon, FileArchiveIcon, ArrowsClockwiseIcon, ArrowFatUpIcon, FileMinusIcon, StackMinusIcon, FolderOpenIcon, CopyIcon, PathIcon } from "@phosphor-icons/react"

const colKeys = ["video", "sc", "tc"]

export function SubtitleRename() {
  const [cell, setCell] = useState(null)
  const [fileData, setFileData] = useState([]) // 展平为带路径的数组，用于重命名
  const [tableData, setTableData] = useState([]) // 上面数组的基础上移除了路径，只保留文件名

  const { config } = useConfig()
  const { fileList, archiveList, setFileList, setArchiveList, clearAll } = useSubtitleStore()

  const tableColumns = config?.subtitle?.detect_language
    ? [
        { key: "video", title: "视频文件" },
        { key: "sc", title: "简体字幕" },
        { key: "tc", title: "繁体字幕" }
      ]
    : [
        { key: "video", title: "视频文件" },
        { key: "sc", title: "字幕文件" }
      ]

  useEffect(() => {
    const processData = async () => {
      const entries = Object.entries(fileList)
      const maxLength = Math.max(0, ...entries.map(([, v]) => v?.length || 0))

      const data = Array.from({ length: maxLength }, (_, i) =>
        Object.fromEntries(entries.map(([k, v]) => [k, v?.[i] || ""]))
      )

      const result = await Promise.all(
        data.map((row) =>
          Promise.all(
            Object.entries(row).map(async ([k, v]) => [k, v ? await basename(v) : ""])
          ).then(Object.fromEntries)
        )
      )

      if (config?.subtitle?.highlight_diff) {
        setFileData(data)
        setTableData(highlightDiff(result, config.subtitle.highlight_ignore_case, config.subtitle.highlight_numbers_only))
      } else {
        setFileData(data)
        setTableData(result)
      }
    }
    processData()
  }, [fileList, config])

  // 拖拽添加文件
  const handleFileDrop = useCallback(async (paths) => {
    if (!paths || paths.length === 0) return

    const dropPromise = (async () => {
      const startTime = Date.now()
      const { files, archives, addedCount, filteredCount, duplicateCount, excludedCount } = await detectFiles(paths, fileList, archiveList)

      const reasons = []
      if (filteredCount > 0) reasons.push(`${filteredCount} 个无效文件`)
      if (duplicateCount > 0) reasons.push(`${duplicateCount} 个重复文件`)
      if (excludedCount > 0) reasons.push(`${excludedCount} 个设置中排除的文件`)
      const filterText = reasons.length ? `过滤了 ${reasons.join("和 ")}` : ""

      if (addedCount === 0) {
        throw new Error(`${filterText}，耗时 ${elapsedTime(startTime)}`)
      } else {
        setFileList(() => files)
        setArchiveList(() => archives)
        return { message: `添加了 ${addedCount} 个文件${filterText && `，${filterText}`}，耗时 ${elapsedTime(startTime)}` }
      }
    })()

    toast.promise(dropPromise, {
      loading: { title: "正在添加文件" },
      success: { title: (data) => data.message, duration: 1000 },
      error: { type: "warning", title: (error) => error.message || String(error) }
    })
  }, [fileList, archiveList, setFileList, setArchiveList])

  // 打开文件位置
  const handleOpenLocation = useCallback(async () => {
    try {
      const dir = await dirname(fileData[cell.row]?.[colKeys[cell.col]])
      await openPath(dir)
    } catch (error) {
      toast.error({ title: "无法打开文件夹", description: error.message || String(error) })
    }
  }, [cell, fileData])

  // 复制文件名
  const handleCopyFileName = useCallback(async () => {
    try {
      const fileName = await basename(fileData[cell.row]?.[colKeys[cell.col]])
      await writeText(fileName)
      toast.success({ title: "已复制文件名" }, { duration: 800 })
    } catch (error) {
      toast.error({ title: "复制失败", description: error.message || String(error) })
    }
  }, [cell, fileData])

  // 复制文件路径
  const handleCopyFilePath = useCallback(async () => {
    try {
      await writeText(fileData[cell.row]?.[colKeys[cell.col]])
      toast.success({ title: "已复制文件路径" }, { duration: 800 })
    } catch (error) {
      toast.error({ title: "复制失败", description: error.message || String(error) })
    }
  }, [cell, fileData])

  // 更改字幕类型
  const handleChangeType = useCallback(() => {
    const sourceKey = colKeys[cell.col]
    const targetKey = cell.col === 1 ? "tc" : "sc"
    const value = fileList[sourceKey]?.[cell.row]
    setFileList((prev) => ({
      ...prev,
      [sourceKey]: (prev[sourceKey] || []).filter((_, i) => i !== cell.row),
      [targetKey]: [...(prev[targetKey] || []), value].sort(sortFiles)
    }))
  }, [cell, fileList, setFileList])

  // 内容移动
  const handleMove = useCallback((offset) => {
    const key = colKeys[cell.col]
    const targetRow = cell.row + offset
    setFileList((prev) => ({
      ...prev,
      [key]: prev[key].map((v, i) => i === cell.row ? prev[key][targetRow] : i === targetRow ? prev[key][cell.row] : v
      )
    }))
  }, [cell, setFileList])

  // 删除单个内容
  const handleDeleteItem = useCallback(() => {
    const key = colKeys[cell.col]
    setFileList((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== cell.row)
    }))
  }, [cell, setFileList])

  // 删除整行
  const handleDeleteRow = useCallback(() => {
    setFileList((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, arr]) => [key, arr.filter((_, i) => i !== cell.row)])
      )
    )
  }, [cell, setFileList])

  // 重命名字幕
  const handleRename = async () => {
    const success = await renameSubtitles(fileData, archiveList)
    if (success) clearAll()
  }

  return (
    <Page className="flex flex-col h-screen bg-transparent">
      <ContextMenu cell={cell} onClose={() => setCell(null)}>
        {cell && (() => {
          const colData = fileList[colKeys[cell.col]] || []
          const hasContent = !!colData[cell.row]
          const canMoveUp = hasContent && cell.row > 0
          const canMoveDown = hasContent && cell.row < colData.length - 1
          const isSubtitle = [1, 2].includes(cell.col)
          const detectLanguage = config?.subtitle?.detect_language
          return (
            <>
              {hasContent && <ContextItem title="打开文件位置" icon={<FolderOpenIcon className="size-4" />} onClick={handleOpenLocation} />}
              {hasContent && <ContextSeparator />}
              {hasContent && <ContextItem title="复制文件名" icon={<CopyIcon className="size-4" />} onClick={handleCopyFileName} />}
              {hasContent && <ContextItem title="复制文件路径" icon={<PathIcon className="size-4" />} onClick={handleCopyFilePath} />}
              {hasContent && <ContextSeparator />}
              {canMoveUp && <ContextItem title="上移一行" icon={<ArrowFatUpIcon className="size-4" />} onClick={() => handleMove(-1)} />}
              {canMoveDown && <ContextItem title="下移一行" icon={<ArrowFatUpIcon className="size-4 rotate-180" />} onClick={() => handleMove(1)} />}
              {isSubtitle && hasContent && detectLanguage && <ContextItem title={cell.col === 1 ? "更改为繁体字幕" : "更改为简体字幕"} icon={<ArrowsClockwiseIcon className="size-4" />} onClick={handleChangeType} />}
              {(canMoveUp || canMoveDown || (isSubtitle && hasContent && detectLanguage)) && <ContextSeparator />}
              {hasContent && <ContextItem title={cell.col === 0 ? "删除该视频" : "删除该字幕"} icon={<FileMinusIcon className="size-4" />} onClick={handleDeleteItem} danger />}
              <ContextItem title="删除此行" icon={<StackMinusIcon className="size-4" />} onClick={handleDeleteRow} danger />
            </>
          )
        })()}
      </ContextMenu>

      <PageBlock className="flex-1 p-0">
        <DropArea title="松手以添加视频或字幕" onFileDrop={handleFileDrop}>
          {tableData.length > 0
            ? (
                <Table columns={tableColumns} data={tableData} onContextMenu={setCell} />
              )
            : (
                <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                  <div className="flex-center gap-3">
                    <FileVideoIcon className="size-7" weight="light" />
                    <FileTextIcon className="size-7" weight="light" />
                    <FileArchiveIcon className="size-7" weight="light" />
                  </div>
                  <span>请拖入视频、字幕或字幕压缩包</span>
                </div>
              )}
        </DropArea>
      </PageBlock>

      <PageBlock className="items-center justify-end gap-3 p-4" last>
        <div className="flex-1 flex items-center gap-2">
          {config?.subtitle?.config_badge_union_extension && config?.subtitle?.union_extension && (
            <Badge variant="outline">添加后缀 {config.subtitle.union_extension}</Badge>
          )}
          {config?.subtitle?.config_badge_move_sub && config?.subtitle?.move_sub && (
            <Badge variant="outline">
              {config.subtitle.move_sub === "none" && "保持原位"}
              {config.subtitle.move_sub === "copy" && "复制字幕"}
              {config.subtitle.move_sub === "cut" && "剪切字幕"}
            </Badge>
          )}
          {config?.subtitle?.config_badge_remove_sub && config?.subtitle?.remove_sub !== "none" && (
            <Badge variant="outline">{config.subtitle.remove_sub === "sc" ? "删除简体" : "删除繁体"}</Badge>
          )}
        </div>

        <Button className="w-26" onClick={() => clearAll()}>清空列表</Button>
        <Button variant="primary" className="w-26" onClick={handleRename}>重命名</Button>
      </PageBlock>
    </Page>
  )
}
