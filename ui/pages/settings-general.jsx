import { AppWindowIcon, FrameCornersIcon, HighlighterIcon, SunIcon, TagIcon } from "@phosphor-icons/react"

import { Select } from "@/components/select"
import { SettingsCard, SettingsContent, SettingsItem, SettingsTitle } from "@/components/settings"
import { Switch } from "@/components/switch"
import { useConfigStore } from "@/store/config"

export function GeneralSetting() {
  const config = useConfigStore((s) => s.config)
  const saveConfig = useConfigStore((s) => s.saveConfig)

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
              { value: "dark", label: "深色" },
            ]}
            value={config?.window_theme}
            onChange={(value) => saveConfig("window_theme", value)}
            className="w-48"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="窗口" />

      <SettingsCard>
        <SettingsItem
          title="启用窗口材质"
          subtitle="启用系统的 Mica 或 Vibrancy 等窗口效果。修改后需重启生效"
          icon={<AppWindowIcon />}
        >
          <Switch
            checked={config?.window_vibrancy ?? true}
            onChange={(checked) => saveConfig("window_vibrancy", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="记住窗口尺寸"
          subtitle="程序启动时恢复上次关闭时的窗口大小和位置"
          icon={<FrameCornersIcon />}
        >
          <Switch checked={config?.remember_window} onChange={(checked) => saveConfig("remember_window", checked)} />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="界面" />

      <SettingsCard>
        <SettingsItem title="显示配置标签" subtitle="在界面左下角显示主要配置状态的标签" icon={<TagIcon />} />
        <SettingsItem title="显示统一后缀编辑框" subtitle="在首页显示统一后缀的快捷编辑框">
          <Switch
            checked={config?.config_quick_union_extension}
            onChange={(checked) => saveConfig("config_quick_union_extension", checked)}
          />
        </SettingsItem>
        <SettingsItem title="显示统一后缀名" subtitle="在配置标签中显示统一后缀名">
          <Switch
            checked={config?.config_badge_union_extension}
            onChange={(checked) => saveConfig("config_badge_union_extension", checked)}
          />
        </SettingsItem>
        <SettingsItem title="显示移动字幕选项" subtitle="在配置标签中显示移动字幕的状态选项">
          <Switch
            checked={config?.config_badge_move_sub}
            onChange={(checked) => saveConfig("config_badge_move_sub", checked)}
          />
        </SettingsItem>
        <SettingsItem title="显示删除字幕选项" subtitle="在配置标签中显示删除字幕的状态选项">
          <Switch
            checked={config?.config_badge_remove_sub}
            onChange={(checked) => saveConfig("config_badge_remove_sub", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="高亮文件名差异"
          subtitle="在表格中加粗显示同列文件名之间的差异部分"
          icon={<HighlighterIcon />}
        >
          <Switch checked={config?.highlight_diff} onChange={(checked) => saveConfig("highlight_diff", checked)} />
        </SettingsItem>
        <SettingsItem title="忽略大小写" subtitle="对比差异时忽略字母大小写">
          <Switch
            checked={config?.highlight_ignore_case}
            onChange={(checked) => saveConfig("highlight_ignore_case", checked)}
          />
        </SettingsItem>
        <SettingsItem title="只对比数字" subtitle="只高亮显示数字部分的差异，忽略其他字符">
          <Switch
            checked={config?.highlight_numbers_only}
            onChange={(checked) => saveConfig("highlight_numbers_only", checked)}
          />
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
