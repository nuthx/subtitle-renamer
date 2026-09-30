import { BrowserIcon } from "@phosphor-icons/react"
import { openUrl } from "@tauri-apps/plugin-opener"
import { useCallback } from "react"

import { ContextItem, ContextMenu } from "@/components/context-menu"
import { toast } from "@/components/toast"

export function PostListContextMenu({ cell, onClose }) {
  const handleOpenPost = useCallback(async () => {
    try {
      await openUrl(cell.post.url)
    } catch (error) {
      toast.error({ title: "无法在网页中打开", description: error.message || String(error) })
    }
  }, [cell])

  return (
    <ContextMenu cell={cell} onClose={onClose}>
      {cell && <ContextItem title="在网页中打开" icon={<BrowserIcon className="size-4" />} onClick={handleOpenPost} />}
    </ContextMenu>
  )
}
