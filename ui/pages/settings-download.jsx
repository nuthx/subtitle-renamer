import { DownloadSimpleIcon } from "@phosphor-icons/react"
import { appConfigDir, dirname, join } from "@tauri-apps/api/path"
import { open } from "@tauri-apps/plugin-dialog"
import { exists } from "@tauri-apps/plugin-fs"
import { openPath } from "@tauri-apps/plugin-opener"
import { useEffect, useState } from "react"

import { Button } from "@/components/button"
import { SettingsCard, SettingsContent, SettingsItem, SettingsTitle } from "@/components/settings"
import { toast } from "@/components/toast"
import { useConfigStore } from "@/store/config"

export function DownloadSetting() {
  const [defaultDirectory, setDefaultDirectory] = useState("")

  const config = useConfigStore((s) => s.config)
  const saveConfig = useConfigStore((s) => s.saveConfig)

  // 获取默认下载目录
  useEffect(() => {
    const loadDefaultDirectory = async () => {
      setDefaultDirectory(await join(await appConfigDir(), "cache"))
    }
    loadDefaultDirectory()
  }, [])

  if (!config) return null

  const handleChooseDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: config?.download_directory || defaultDirectory,
      })
      if (selected) await saveConfig("download_directory", selected)
    } catch (error) {
      toast.error({ title: "文件夹选择失败", description: error.message || String(error) })
    }
  }

  const handleOpenDirectory = async () => {
    try {
      const directoryExists = await exists(config?.download_directory || defaultDirectory)
      await openPath(
        directoryExists
          ? config?.download_directory || defaultDirectory
          : await dirname(config?.download_directory || defaultDirectory),
      )
    } catch (error) {
      toast.error({ title: "文件夹打开失败", description: error.message || String(error) })
    }
  }

  return (
    <SettingsContent>
      <SettingsTitle title="下载" />

      <SettingsCard>
        <SettingsItem
          title="下载位置"
          subtitle={`字幕附件的保存目录。当前路径：${config?.download_directory || defaultDirectory}`}
          icon={<DownloadSimpleIcon />}
        >
          <div className="flex gap-2">
            <Button onClick={handleChooseDirectory}>选择文件夹</Button>
            <Button onClick={handleOpenDirectory}>打开</Button>
          </div>
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
