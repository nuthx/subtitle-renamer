import { useConfig } from "@/hooks/useConfig"
import { SettingsContent, SettingsTitle, SettingsCard, SettingsItem } from "@/components/settings"
import { Select } from "@/components/select"
import { Switch } from "@/components/switch"
import { SunIcon, FileDashedIcon, TextAaIcon, CopyIcon, TrashIcon, FileArchiveIcon } from "@phosphor-icons/react"

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
            className="w-60"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="后缀设置" />

      <SettingsCard>
        <SettingsItem title="统一后缀" subtitle="重命名字幕时，在扩展名前为所有语言字幕添加后缀" icon={<FileDashedIcon />}>
          <Select
            options={[
              { value: "", label: "无后缀" },
              { value: ".sc", label: ".sc" },
              { value: ".chs", label: ".chs" },
              { value: ".zh-Hans", label: ".zh-Hans" }
            ]}
            value={config?.subtitle?.union_extension}
            onChange={(value) => saveConfig("subtitle", "union_extension", value)}
            className="w-60"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="简体字幕后缀" subtitle="重命名字幕时，在扩展名前为简体字幕添加后缀" icon={<FileDashedIcon />}>
          <Select
            options={[
              { value: "", label: "无后缀" },
              { value: ".sc", label: ".sc" },
              { value: ".chs", label: ".chs" },
              { value: ".zh-Hans", label: ".zh-Hans" }
            ]}
            value={config?.subtitle?.sc_extension}
            onChange={(value) => saveConfig("subtitle", "sc_extension", value)}
            className="w-60"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="繁体字幕后缀" subtitle="重命名字幕时，在扩展名前为繁体字幕添加后缀" icon={<FileDashedIcon />}>
          <Select
            options={[
              { value: "", label: "无后缀" },
              { value: ".tc", label: ".tc" },
              { value: ".cht", label: ".cht" },
              { value: ".zh-Hant", label: ".zh-Hant" }
            ]}
            value={config?.subtitle?.tc_extension}
            onChange={(value) => saveConfig("subtitle", "tc_extension", value)}
            className="w-60"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="重命名设置" />

      <SettingsCard>
        <SettingsItem title="转换为小写扩展名" subtitle="重命名时将视频与字幕文件的扩展名都转换为小写" icon={<TextAaIcon />}>
          <Switch
            checked={config?.subtitle?.lowercase_extension}
            onChange={(checked) => saveConfig("subtitle", "lowercase_extension", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="移动字幕" subtitle="重命名完成后，是否移动字幕到视频目录" icon={<CopyIcon />}>
          <Select
            options={[
              { value: "none", label: "保持原位" },
              { value: "copy", label: "复制到视频目录" },
              { value: "cut", label: "剪切到视频目录" }
            ]}
            value={config?.subtitle?.move_sub}
            onChange={(value) => saveConfig("subtitle", "move_sub", value)}
            className="w-60"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="删除字幕" subtitle="重命名完成后，是否删除指定的字幕文件" icon={<TrashIcon />}>
          <Select
            options={[
              { value: "none", label: "不删除任何字幕" },
              { value: "sc", label: "删除简体字幕" },
              { value: "tc", label: "删除繁体字幕" }
            ]}
            value={config?.subtitle?.remove_sub}
            onChange={(value) => saveConfig("subtitle", "remove_sub", value)}
            className="w-60"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="压缩包" />

      <SettingsCard>
        <SettingsItem title="删除字幕压缩包" subtitle="重命名完成后，是否删除字幕压缩包。仅当拖入字幕压缩包时生效" icon={<FileArchiveIcon />}>
          <Switch
            checked={config?.subtitle?.remove_zip}
            onChange={(checked) => saveConfig("subtitle", "remove_zip", checked)}
          />
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
