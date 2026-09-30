import {
  DownloadSimpleIcon,
  EmptyIcon,
  FileArchiveIcon,
  FileVideoIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ShieldChevronIcon,
  WarningDiamondIcon,
} from "@phosphor-icons/react"
import { invoke } from "@tauri-apps/api/core"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Combobox } from "@/components/combobox"
import { DropArea } from "@/components/drop"
import { Input } from "@/components/input"
import { Page, PageBlock, PageGroup } from "@/components/page"
import { Select } from "@/components/select"
import { Table } from "@/components/table"
import { toast } from "@/components/toast"
import { PostListContextMenu } from "@/contexts/post-list"
import { SubtitleTableContextMenu } from "@/contexts/subtitle-table"
import { useListen } from "@/hooks/use-listen"
import { moveSubOptions, removeSubOptions } from "@/pages/settings-rename"
import { useConfigStore } from "@/store/config"
import { useDownloadStore } from "@/store/download"
import { useTableStore } from "@/store/table"
import { cn } from "@/utils/cn"
import { addDroppedFiles } from "@/utils/drop"
import { createSubtitleTableData } from "@/utils/highlight"
import { parseAcgripPage } from "@/utils/parse"
import { renameSubtitles } from "@/utils/rename"

const postFileSortOptions = [
  { value: "default", label: "默认" },
  { value: "downloads", label: "下载数量" },
]

export function SubtitleDownload() {
  const tableScope = "download"
  const [cell, setCell] = useState(null)
  const [fileData, setFileData] = useState([]) // 展平为带路径的数组，用于重命名
  const [tableData, setTableData] = useState([]) // 上面数组的基础上移除了路径，只保留文件名
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [postMenu, setPostMenu] = useState(null)
  const [postFileSort, setPostFileSort] = useState("default")
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("")
  const retryAfterVerificationRef = useRef(null)
  const isWaitingForVerificationRef = useRef(false)

  const config = useConfigStore((s) => s.config)
  const saveConfig = useConfigStore((s) => s.saveConfig)
  const fileList = useTableStore((s) => s.download.fileList)
  const archiveList = useTableStore((s) => s.download.archiveList)
  const setFileList = useTableStore((s) => s.setFileList)
  const setArchiveList = useTableStore((s) => s.setArchiveList)
  const moveFileItem = useTableStore((s) => s.moveFileItem)
  const clearAll = useTableStore((s) => s.clearAll)
  const searchResults = useDownloadStore((s) => s.searchResults)
  const isSearching = useDownloadStore((s) => s.isSearching)
  const searchError = useDownloadStore((s) => s.searchError)
  const selectedPost = useDownloadStore((s) => s.selectedPost)
  const postFiles = useDownloadStore((s) => s.postFiles)
  const isLoadingFiles = useDownloadStore((s) => s.isLoadingFiles)
  const filesError = useDownloadStore((s) => s.filesError)
  const setSearching = useDownloadStore((s) => s.setSearching)
  const setSearchResults = useDownloadStore((s) => s.setSearchResults)
  const setSearchError = useDownloadStore((s) => s.setSearchError)
  const setSelectedPost = useDownloadStore((s) => s.setSelectedPost)
  const setLoadingFiles = useDownloadStore((s) => s.setLoadingFiles)
  const setPostFiles = useDownloadStore((s) => s.setPostFiles)
  const setFilesError = useDownloadStore((s) => s.setFilesError)

  // 排序字幕附件
  const sortedPostFiles = useMemo(
    () =>
      postFileSort !== "downloads" ? postFiles : [...postFiles].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)),
    [postFiles, postFileSort],
  )

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

  // 设置过盾验证状态
  const setVerificationWaiting = useCallback((waiting) => {
    isWaitingForVerificationRef.current = waiting
    setIsWaitingForVerification(waiting)
  }, [])

  // 结束当前过盾验证流程
  const clearVerificationRetry = useCallback(() => {
    retryAfterVerificationRef.current = null
    setVerificationWaiting(false)
  }, [setVerificationWaiting])

  // 监听后端会话验证
  useListen("session-verified", async (event) => {
    const retry = retryAfterVerificationRef.current
    if (!retry) return

    if (!event.payload) {
      if (isWaitingForVerificationRef.current) return
      setVerificationWaiting(true)
      await invoke("show_browser")
      return
    }

    if (isWaitingForVerificationRef.current === false) return

    clearVerificationRetry()
  })

  // 监听后端浏览器页面
  useListen("browser-page", (event) => {
    const payload = parseAcgripPage(event.payload)
    if (payload?.kind === "search") {
      clearVerificationRetry()
      setSearchResults(payload.results || [])
    }
    if (payload?.kind === "post") {
      clearVerificationRetry()
      setPostFiles(payload.files || [])
    }
  })

  // 监听后端下载完成
  useListen("download-finished", (event) => {
    clearVerificationRetry()
    handleFileDrop([event.payload])
  })

  // 搜索字幕
  const handleSearch = async (event) => {
    event.preventDefault()
    await (async function search() {
      retryAfterVerificationRef.current = search
      setSubmittedSearchQuery(searchQuery.trim())
      setVerificationWaiting(false)
      setSearching(true)
      try {
        await invoke("search_posts", { query: searchQuery.trim() })
      } catch (error) {
        retryAfterVerificationRef.current = null
        setSearchError(error)
        toast.error({ title: "搜索失败", description: String(error) })
      }
    })()
  }

  // 选择主题贴
  const handlePostSelect = async (post) => {
    setSelectedPost(post)
    await (async function loadPost() {
      retryAfterVerificationRef.current = loadPost
      setVerificationWaiting(false)
      setLoadingFiles(true)
      try {
        await invoke("get_post", { postUrl: post.url })
      } catch (error) {
        retryAfterVerificationRef.current = null
        setFilesError(error)
        toast.error({ title: "附件加载失败", description: String(error) })
      }
    })()
  }

  // 下载字幕文件
  const handleDownloadFile = async (file) => {
    await (async function downloadFile() {
      retryAfterVerificationRef.current = downloadFile
      setVerificationWaiting(false)
      try {
        await invoke("download_subtitle", { fileUrl: file.url })
        toast.success({ title: "开始下载", description: file.name })
      } catch (error) {
        retryAfterVerificationRef.current = null
        toast.error({ title: "下载失败", description: String(error) })
      }
    })()
  }

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
      <PostListContextMenu cell={postMenu} onClose={() => setPostMenu(null)} />

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
                <FolderIcon className="size-7" weight="light" />
              </div>
              <span>请拖入视频或文件夹</span>
            </div>
          )}
        </DropArea>
      </PageBlock>

      <PageGroup className="flex-1">
        <PageBlock className="flex-1 flex-col">
          <form className="flex-center gap-2 h-14 p-3 border-b" onSubmit={handleSearch}>
            <Input placeholder="搜索字幕" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Button
              type="submit"
              variant="primary"
              disabled={isSearching || isWaitingForVerification || !searchQuery.trim()}
            >
              搜索
            </Button>
          </form>

          <div className="flex-1 flex flex-col gap-1 p-2 overflow-auto">
            {!isSearching &&
              !isWaitingForVerification &&
              !searchError &&
              searchResults.length === 0 &&
              (!submittedSearchQuery || submittedSearchQuery !== searchQuery.trim()) && (
                <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                  <MagnifyingGlassIcon className="size-7" weight="light" />
                  <span>输入关键词开始搜索</span>
                </div>
              )}

            {!isSearching &&
              !isWaitingForVerification &&
              !searchError &&
              searchResults.length === 0 &&
              submittedSearchQuery &&
              submittedSearchQuery === searchQuery.trim() && (
                <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                  <EmptyIcon className="size-7" weight="light" />
                  <span>没有搜索结果</span>
                </div>
              )}

            {isWaitingForVerification && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <ShieldChevronIcon className="size-7" weight="light" />
                等待 Cloudflare 验证...
              </div>
            )}

            {isSearching && !isWaitingForVerification && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <MagnifyingGlassIcon className="orbit-icon size-7" weight="light" />
                搜索中...
              </div>
            )}

            {searchError && !isSearching && !isWaitingForVerification && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <WarningDiamondIcon className="size-7" weight="light" />
                {String(searchError)}
              </div>
            )}

            {!isSearching &&
              !isWaitingForVerification &&
              !searchError &&
              searchResults.map((post) => (
                <button
                  type="button"
                  key={post.id}
                  className={cn(
                    "px-3 py-2 text-left rounded-sm transition cursor-pointer hover:bg-muted/40",
                    selectedPost?.id === post.id && "bg-muted/40",
                  )}
                  onClick={() => handlePostSelect(post)}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    setPostMenu({ x: event.clientX, y: event.clientY, post })
                  }}
                >
                  <p className="font-medium line-clamp-2 cursor-pointer">{post.title}</p>
                  <p className="mt-0.5 text-xs text-secondary cursor-pointer">
                    {[post.date, post.views && `${post.views} 查看`, post.replies && `${post.replies} 回复`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </button>
              ))}
          </div>
        </PageBlock>

        <PageBlock className="flex-1 flex-col">
          <div className="flex-center justify-between gap-2 h-14 p-3 border-b">
            <div className="min-w-0">
              <h3 className="font-medium truncate">字幕列表</h3>
              <p className="text-xs text-secondary">共 {postFiles.length} 个附件</p>
            </div>
            <Select options={postFileSortOptions} value={postFileSort} onChange={setPostFileSort} className="w-32" />
          </div>

          <div className="flex-1 flex flex-col gap-1 p-2 overflow-auto">
            {!isLoadingFiles && !filesError && !selectedPost && postFiles.length === 0 && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <FileArchiveIcon className="size-7" weight="light" />
                <span>请选择主题贴</span>
              </div>
            )}

            {!isLoadingFiles && !filesError && selectedPost && postFiles.length === 0 && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <EmptyIcon className="size-7" weight="light" />
                <span>主题贴下没有发现字幕文件</span>
              </div>
            )}

            {isLoadingFiles && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <MagnifyingGlassIcon className="orbit-icon size-7" weight="light" />
                加载中...
              </div>
            )}

            {filesError && !isLoadingFiles && (
              <div className="flex-1 flex-center flex-col gap-3 text-secondary">
                <WarningDiamondIcon className="size-7" weight="light" />
                {String(filesError)}
              </div>
            )}

            {!isLoadingFiles &&
              !filesError &&
              sortedPostFiles.map((file) => (
                <div key={file.url} className="flex-center gap-3 px-3 py-2 rounded-sm transition hover:bg-muted/40">
                  <FileArchiveIcon className="size-6 text-secondary shrink-0" weight="light" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{file.name}</p>
                    {file.description && <p className="mt-0.5 text-xs text-secondary truncate">{file.description}</p>}
                    <p className="mt-0.5 text-xs text-secondary">
                      {[file.size, file.downloads && `${file.downloads} 下载`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Button className="w-8 p-0" onClick={() => handleDownloadFile(file)}>
                    <DownloadSimpleIcon className="size-4" />
                  </Button>
                </div>
              ))}
          </div>
        </PageBlock>
      </PageGroup>

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
