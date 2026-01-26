import { useConfig } from "@/hooks/useConfig"
import { SettingsContent, SettingsTitle, SettingsCard, SettingsItem } from "@/components/settings"
import { Select } from "@/components/select"
import { Combobox } from "@/components/combobox"
import { Switch } from "@/components/switch"
import { TagIcon, HighlighterIcon, NumberCircleFiveIcon, ArrowsClockwiseIcon, ProhibitIcon, TextAaIcon, CopyIcon, TrashIcon, FileArchiveIcon, FileDashedIcon } from "@phosphor-icons/react"
import { Input } from "@/components/input"

export function RenameSetting() {
  const { config, saveConfig } = useConfig()

  if (!config) return null

  return (
    <SettingsContent>
      <SettingsTitle title="内容显示" />

      <SettingsCard>
        <SettingsItem title="显示配置标签" subtitle="在界面左下角显示主要配置状态的标签" icon={<TagIcon />} />
        <SettingsItem title="显示统一后缀名" subtitle="在配置标签中显示统一后缀名" icon={<TagIcon />}>
          <Switch
            checked={config?.subtitle?.config_badge_union_extension}
            onChange={(checked) => saveConfig("subtitle", "config_badge_union_extension", checked)}
          />
        </SettingsItem>
        <SettingsItem title="显示移动字幕选项" subtitle="在配置标签中显示移动字幕的状态选项" icon={<TagIcon />}>
          <Switch
            checked={config?.subtitle?.config_badge_move_sub}
            onChange={(checked) => saveConfig("subtitle", "config_badge_move_sub", checked)}
          />
        </SettingsItem>
        <SettingsItem title="显示删除字幕选项" subtitle="在配置标签中显示删除字幕的状态选项，不删除字幕时不显示" icon={<TagIcon />}>
          <Switch
            checked={config?.subtitle?.config_badge_remove_sub}
            onChange={(checked) => saveConfig("subtitle", "config_badge_remove_sub", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="高亮文件名差异" subtitle="在表格中加粗显示同列文件名之间的差异部分" icon={<HighlighterIcon />}>
          <Switch
            checked={config?.subtitle?.highlight_diff}
            onChange={(checked) => saveConfig("subtitle", "highlight_diff", checked)}
          />
        </SettingsItem>
        <SettingsItem title="忽略大小写" subtitle="对比差异时忽略字母大小写" icon={<TextAaIcon />}>
          <Switch
            checked={config?.subtitle?.highlight_ignore_case}
            onChange={(checked) => saveConfig("subtitle", "highlight_ignore_case", checked)}
          />
        </SettingsItem>
        <SettingsItem title="只对比数字" subtitle="只高亮显示数字部分的差异，忽略其他字符" icon={<NumberCircleFiveIcon />}>
          <Switch
            checked={config?.subtitle?.highlight_numbers_only}
            onChange={(checked) => saveConfig("subtitle", "highlight_numbers_only", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="文件添加" />

      <SettingsCard>
        <SettingsItem title="简繁识别" subtitle="添加文件时，自动识别字幕语言为简体或繁体。禁用后，所有字幕均视作简体字幕" icon={<ArrowsClockwiseIcon />}>
          <Switch
            checked={config?.subtitle?.detect_language}
            onChange={(checked) => saveConfig("subtitle", "detect_language", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="排除视频文件名" subtitle="是否排除文件名含特定内容的视频。使用 | 或正则表达式来匹配多个内容" icon={<ProhibitIcon />}>
          <Input
            value={config?.subtitle?.exclude_video}
            onChange={(e) => saveConfig("subtitle", "exclude_video", e.target.value)}
            placeholder="不排除视频"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="排除字幕文件名" subtitle="是否排除文件名含特定内容的字幕(不对压缩包生效)。使用 | 或正则表达式来匹配多个内容" icon={<ProhibitIcon />}>
          <Input
            value={config?.subtitle?.exclude_subtitle}
            onChange={(e) => saveConfig("subtitle", "exclude_subtitle", e.target.value)}
            placeholder="不排除字幕"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="重命名" />

      <SettingsCard>
        <SettingsItem title="转换为小写扩展名" subtitle="重命名时将视频与字幕文件的扩展名都转换为小写" icon={<TextAaIcon />}>
          <Switch
            checked={config?.subtitle?.lowercase_extension}
            onChange={(checked) => saveConfig("subtitle", "lowercase_extension", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="移动字幕" subtitle="重命名完成后，是否移动字幕到视频文件夹" icon={<CopyIcon />}>
          <Select
            options={[
              { value: "none", label: "保持原位" },
              { value: "copy", label: "复制到视频文件夹" },
              { value: "cut", label: "剪切到视频文件夹" }
            ]}
            value={config?.subtitle?.move_sub}
            onChange={(value) => saveConfig("subtitle", "move_sub", value)}
            className="w-48"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="删除字幕" subtitle="重命名完成后，是否删除指定的字幕文件" icon={<TrashIcon />}>
          <Select
            options={[
              { value: "none", label: "不删除" },
              { value: "sc", label: "删除简体字幕" },
              { value: "tc", label: "删除繁体字幕" }
            ]}
            value={config?.subtitle?.remove_sub}
            onChange={(value) => saveConfig("subtitle", "remove_sub", value)}
            className="w-48"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="删除压缩包" subtitle="重命名完成后，是否删除字幕压缩包。仅当拖入字幕压缩包时生效" icon={<FileArchiveIcon />}>
          <Switch
            checked={config?.subtitle?.remove_zip}
            onChange={(checked) => saveConfig("subtitle", "remove_zip", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="字幕后缀" />

      <SettingsCard>
        <SettingsItem title="统一后缀" subtitle="重命名字幕时，在扩展名前为所有语言字幕添加后缀" icon={<FileDashedIcon />}>
          <Combobox
            options={config?.subtitle?.union_extension_options}
            value={config?.subtitle?.union_extension}
            onChange={(value) => saveConfig("subtitle", "union_extension", value)}
            onOptionsChange={(options) => saveConfig("subtitle", "union_extension_options", options)}
            placeholder="无后缀"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="简体字幕后缀" subtitle="重命名字幕时，在扩展名前为简体字幕添加后缀" icon={<FileDashedIcon />}>
          <Combobox
            options={config?.subtitle?.sc_extension_options}
            value={config?.subtitle?.sc_extension}
            onChange={(value) => saveConfig("subtitle", "sc_extension", value)}
            onOptionsChange={(options) => saveConfig("subtitle", "sc_extension_options", options)}
            placeholder="无后缀"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="繁体字幕后缀" subtitle="重命名字幕时，在扩展名前为繁体字幕添加后缀" icon={<FileDashedIcon />}>
          <Combobox
            options={config?.subtitle?.tc_extension_options}
            value={config?.subtitle?.tc_extension}
            onChange={(value) => saveConfig("subtitle", "tc_extension", value)}
            onOptionsChange={(options) => saveConfig("subtitle", "tc_extension_options", options)}
            placeholder="无后缀"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
