import { appDataDir } from "@tauri-apps/api/path"
import { openPath } from "@tauri-apps/plugin-opener"
import { resetConfig } from "@/utils/config"
import { SettingsContent, SettingsTitle, SettingsCard, SettingsItem } from "@/components/settings"
import { toast } from "@/components/toast"
import { Button } from "@/components/button"
import { FolderOpenIcon, ArrowClockwiseIcon } from "@phosphor-icons/react"

export function DeveloperSetting() {
  const handleOpenConfig = async () => {
    try {
      const configDir = await appDataDir()
      await openPath(configDir)
    } catch (error) {
      toast.error({ title: "文件夹打开失败", description: error.message })
    }
  }

  const handleResetConfig = async () => {
    try {
      await resetConfig()
      toast.success({ title: "配置已重置" })
    } catch (error) {
      toast.error({ title: "重置配置失败", description: error.message })
    }
  }

  return (
    <SettingsContent>
      <SettingsTitle title="配置管理" />

      <SettingsCard>
        <SettingsItem title="浏览配置文件" subtitle="请勿随意修改配置项。若遇软件启动失败，请完全删除文件夹内全部内容" icon={<FolderOpenIcon />}>
          <Button onClick={handleOpenConfig}>打开</Button>
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="重置配置文件" subtitle="点击后立即重置所有配置项，没有二次弹窗确认。部分配置需重启后生效" icon={<ArrowClockwiseIcon />}>
          <Button onClick={handleResetConfig}>重置</Button>
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
