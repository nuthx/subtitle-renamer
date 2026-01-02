import { basename } from "@tauri-apps/api/path"
import { useState, useCallback, useEffect } from "react"
import { detectFiles } from "@/utils/detect"
import { renameSubtitles } from "@/utils/rename"
import { elapsedTime } from "@/utils/time"
import { sortFiles } from "@/utils/sort"
import { toast } from "@/components/toast"
import { Page, PageBlock } from "@/components/page"
import { ContextMenu, ContextItem, ContextSeparator } from "@/components/context-menu"
import { DropArea } from "@/components/drop"
import { Table } from "@/components/table"
import { Button } from "@/components/button"
import { FileVideoIcon, FileTextIcon, FileArchiveIcon } from "@phosphor-icons/react"

const colKeys = ["video", "sc", "tc"]

export function SubtitleRename() {
  const [cell, setCell] = useState(null)
  const [fileList, setFileList] = useState({}) // 拖入时生成，便于排序，右键菜单也会操作此对象
  const [fileData, setFileData] = useState([]) // 展平为带路径的数组，用于重命名
  const [tableData, setTableData] = useState([]) // 上面数组的基础上移除了路径，只保留文件名
  const [archiveList, setArchiveList] = useState([]) // 拖入的压缩包路径

  const tableColumns = [
    { key: "video", title: "视频文件" },
    { key: "sc", title: "简体字幕" },
    { key: "tc", title: "繁体字幕" }
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

      setFileData(data)
      setTableData(result)
    }
    processData()
  }, [fileList])

  // 拖拽添加文件
  const handleFileDrop = useCallback(async (paths) => {
    if (!paths || paths.length === 0) return

    const dropPromise = (async () => {
      const startTime = Date.now()
      const { files, archives, addedCount, filteredCount, duplicateCount } = await detectFiles(paths, fileList, archiveList)

      const reasons = []
      if (filteredCount > 0) reasons.push(`${filteredCount} 个无效文件`)
      if (duplicateCount > 0) reasons.push(`${duplicateCount} 个重复文件`)
      const filterText = reasons.length ? `过滤了 ${reasons.join("和 ")}` : ""

      if (addedCount === 0) {
        throw new Error(`${filterText}，耗时 ${elapsedTime(startTime)}`)
      } else {
        setFileList(files)
        setArchiveList(archives)
        return { message: `添加了 ${addedCount} 个文件${filterText && `，${filterText}`}，耗时 ${elapsedTime(startTime)}` }
      }
    })()

    toast.promise(dropPromise, {
      loading: { title: "正在添加文件" },
      success: { title: (data) => data.message },
      error: { type: "warning", title: (err) => err.message }
    })
  }, [fileList, archiveList])

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
  }, [cell, fileList])

  // 内容移动
  const handleMove = useCallback((offset) => {
    const key = colKeys[cell.col]
    const targetRow = cell.row + offset
    setFileList((prev) => ({
      ...prev,
      [key]: prev[key].map((v, i) => i === cell.row ? prev[key][targetRow] : i === targetRow ? prev[key][cell.row] : v
      )
    }))
  }, [cell])

  // 删除单个内容
  const handleDeleteItem = useCallback(() => {
    const key = colKeys[cell.col]
    setFileList((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== cell.row)
    }))
  }, [cell])

  // 删除整行
  const handleDeleteRow = useCallback(() => {
    setFileList((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, arr]) => [key, arr.filter((_, i) => i !== cell.row)])
      )
    )
  }, [cell])

  // 清空列表
  const handleClearList = () => {
    setFileList({})
    setArchiveList([])
  }

  // 重命名字幕
  const handleRename = async () => {
    const success = await renameSubtitles(fileData, archiveList)
    if (success) handleClearList()
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
          return (
            <>
              {isSubtitle && hasContent && <ContextItem title={cell.col === 1 ? "更改为繁体字幕" : "更改为简体字幕"} onClick={handleChangeType} />}
              {isSubtitle && hasContent && <ContextSeparator />}
              {canMoveUp && <ContextItem title="上移一行" onClick={() => handleMove(-1)} />}
              {canMoveDown && <ContextItem title="下移一行" onClick={() => handleMove(1)} />}
              {(canMoveUp || canMoveDown) && <ContextSeparator />}
              {hasContent && <ContextItem title={cell.col === 0 ? "删除该视频" : "删除该字幕"} onClick={handleDeleteItem} danger />}
              <ContextItem title="删除此行" onClick={handleDeleteRow} danger />
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
        <Button className="w-26" onClick={() => handleClearList()}>清空列表</Button>
        <Button variant="primary" className="w-26" onClick={handleRename}>重命名</Button>
      </PageBlock>
    </Page>
  )
}
