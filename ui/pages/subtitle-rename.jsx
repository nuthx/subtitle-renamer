import { FileArchiveIcon, FileTextIcon, FileVideoIcon, FolderIcon } from "@phosphor-icons/react"
import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Combobox } from "@/components/combobox"
import { DropArea } from "@/components/drop"
import { Page, PageBlock } from "@/components/page"
import { Table } from "@/components/table"
import { toast } from "@/components/toast"
import { SubtitleTableContextMenu } from "@/contexts/subtitle-table"
import { moveSubOptions, removeSubOptions } from "@/pages/settings-rename"
import { useConfigStore } from "@/store/config"
import { useTableStore } from "@/store/table"
import { addDroppedFiles } from "@/utils/drop"
import { createSubtitleTableData } from "@/utils/highlight"
import { renameSubtitles } from "@/utils/rename"

export function SubtitleRename() {
  const tableScope = "rename"
  const [cell, setCell] = useState(null)
  const [fileData, setFileData] = useState([]) // 展平为带路径的数组，用于重命名
  const [tableData, setTableData] = useState([]) // 上面数组的基础上移除了路径，只保留文件名

  const config = useConfigStore((s) => s.config)
  const saveConfig = useConfigStore((s) => s.saveConfig)
  const fileList = useTableStore((s) => s.rename.fileList)
  const archiveList = useTableStore((s) => s.rename.archiveList)
  const setFileList = useTableStore((s) => s.setFileList)
  const setArchiveList = useTableStore((s) => s.setArchiveList)
  const moveFileItem = useTableStore((s) => s.moveFileItem)
  const clearAll = useTableStore((s) => s.clearAll)

  // 将文件列表转换为表格数据，并根据配置决定是否高亮差异
  useEffect(() => {
    const processData = async () => {
      const data = await createSubtitleTableData(fileList, config)
      setFileData(data.fileData)
      setTableData(data.tableData)
    }
    processData()
  }, [fileList, config])

  // 拖拽添加文件
  const handleFileDrop = useCallback(
    async (paths) => {
      if (!paths || paths.length === 0) return
      const dropPromise = addDroppedFiles(paths, fileList, archiveList, tableScope, setFileList, setArchiveList)
      toast.promise(dropPromise, {
        loading: { title: "正在添加文件" },
        success: { title: (data) => data.message, duration: 1000 },
        error: { type: "warning", title: (error) => error.message || String(error) },
      })
    },
    [fileList, archiveList, setFileList, setArchiveList],
  )

  // 表格重新排序
  const handleTableReorder = useCallback(
    ({ columnKey, fromIndex, targetIndex }) => {
      moveFileItem(tableScope, columnKey, fromIndex, targetIndex)
    },
    [moveFileItem],
  )

  // 切换配置标签状态
  const handleCycleSubtitleConfig = useCallback(
    (key, options) => {
      const currentValue = config?.[key]
      const currentIndex = options.findIndex((option) => option.value === currentValue)
      const nextValue = options[(currentIndex + 1) % options.length].value
      saveConfig(key, nextValue)
    },
    [config, saveConfig],
  )

  // 重命名字幕
  const handleRename = async () => {
    const success = await renameSubtitles(fileData, archiveList)
    if (success) clearAll(tableScope)
  }

  return (
    <Page className="flex flex-col h-screen bg-transparent">
      <SubtitleTableContextMenu cell={cell} fileData={fileData} tableScope={tableScope} onClose={() => setCell(null)} />

      <PageBlock className="flex-1">
        <DropArea title="松手以添加所选内容" onFileDrop={handleFileDrop}>
          {tableData.length > 0 ? (
            <Table
              columns={[
                { key: "video", title: "视频文件" },
                { key: "sc", title: config?.detect_language ? "简体字幕" : "字幕文件" },
                ...(config?.detect_language ? [{ key: "tc", title: "繁体字幕" }] : []),
              ]}
              data={tableData}
              cellIds={fileData}
              onContextMenu={setCell}
              onReorder={handleTableReorder}
            />
          ) : (
            <div className="flex-1 flex-center flex-col gap-3 text-secondary">
              <div className="flex-center gap-3">
                <FileVideoIcon className="size-7" weight="light" />
                <FileTextIcon className="size-7" weight="light" />
                <FileArchiveIcon className="size-7" weight="light" />
                <FolderIcon className="size-7" weight="light" />
              </div>
              <span>请拖入视频、字幕、压缩包或文件夹</span>
            </div>
          )}
        </DropArea>
      </PageBlock>

      <PageBlock className="items-center justify-end gap-3 p-4" last>
        <div className="flex-1 flex items-center gap-2">
          {config?.config_quick_union_extension && (
            <Combobox
              options={config?.union_extension_options}
              value={config?.union_extension}
              onChange={(value) => saveConfig("union_extension", value)}
              onOptionsChange={(options) => saveConfig("union_extension_options", options)}
              placeholder="无后缀"
              className="w-56"
            />
          )}
          {config?.config_badge_union_extension && config?.union_extension && (
            <Badge variant="outline">添加后缀 {config.union_extension}</Badge>
          )}
          {config?.config_badge_move_sub && config?.move_sub && (
            <Badge variant="outline" onClick={() => handleCycleSubtitleConfig("move_sub", moveSubOptions)}>
              {moveSubOptions.find((option) => option.value === config.move_sub)?.label}
            </Badge>
          )}
          {config?.config_badge_remove_sub && config?.remove_sub && (
            <Badge variant="outline" onClick={() => handleCycleSubtitleConfig("remove_sub", removeSubOptions)}>
              {removeSubOptions.find((option) => option.value === config.remove_sub)?.label}
            </Badge>
          )}
        </div>

        <Button className="w-26" onClick={() => clearAll(tableScope)}>
          清空列表
        </Button>
        <Button variant="primary" className="w-26" onClick={handleRename}>
          重命名
        </Button>
      </PageBlock>
    </Page>
  )
}
