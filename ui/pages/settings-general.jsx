import { useConfig } from "@/hooks/useConfig"
import { SettingsContent, SettingsTitle, SettingsCard, SettingsItem } from "@/components/settings"
import { Select } from "@/components/select"
import { Switch } from "@/components/switch"
import { SunIcon, BrowserIcon, FrameCornersIcon } from "@phosphor-icons/react"

export function GeneralSetting() {
  const { config, saveConfig } = useConfig()

  // 等待配置加载完成后再出页面，否则 Switch 的动画会闪一下
  if (!config) return null

  return (
    <SettingsContent>
      <SettingsTitle title="个性化" />

      <SettingsCard>
        <SettingsItem title="主题模式" subtitle="选择界面的显示风格" icon={<SunIcon />}>
          <Select
            options={[
              { value: "system", label: "跟随系统" },
              { value: "light", label: "浅色" },
              { value: "dark", label: "深色" }
            ]}
            value={config?.general?.theme}
            onChange={(value) => saveConfig("general", "theme", value)}
            className="w-48"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="窗口" />

      <SettingsCard>
        <SettingsItem title="启用窗口材质" subtitle="启用系统的 Mica 或 Vibrancy 等窗口效果。修改后需重启生效" icon={<BrowserIcon />}>
          <Switch
            checked={config?.general?.window_vibrancy ?? true}
            onChange={(checked) => saveConfig("general", "window_vibrancy", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="记住窗口尺寸" subtitle="程序启动时恢复上次关闭时的窗口大小和位置" icon={<FrameCornersIcon />}>
          <Switch
            checked={config?.general?.remember_window}
            onChange={(checked) => saveConfig("general", "remember_window", checked)}
          />
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
