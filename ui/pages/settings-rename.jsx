import {
  CopyIcon,
  FileArchiveIcon,
  FileDashedIcon,
  FolderSimpleDashedIcon,
  FoldersIcon,
  GlobeIcon,
  GlobeSimpleIcon,
  ProhibitIcon,
  TextAaIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { Combobox } from "@/components/combobox"
import { Input } from "@/components/input"
import { Select } from "@/components/select"
import { SettingsCard, SettingsContent, SettingsItem, SettingsTitle } from "@/components/settings"
import { Switch } from "@/components/switch"
import { useConfigStore } from "@/store/config"

export const moveSubOptions = [
  { value: "copy", label: "复制字幕" },
  { value: "cut", label: "剪切字幕" },
]

export const removeSubOptions = [
  { value: "none", label: "不删除字幕" },
  { value: "sc", label: "删除简体" },
  { value: "tc", label: "删除繁体" },
]

export function RenameSetting() {
  const config = useConfigStore((s) => s.config)
  const saveConfig = useConfigStore((s) => s.saveConfig)

  if (!config) return null

  return (
    <SettingsContent>
      <SettingsTitle title="文件添加" />

      <SettingsItem
        title="文件夹递归"
        subtitle="拖入文件夹时，继续识别所有子文件夹中的视频和字幕"
        icon={<FoldersIcon />}
      >
        <Switch
          checked={config?.detect_folder_recursively}
          onChange={(checked) => saveConfig("detect_folder_recursively", checked)}
        />
      </SettingsItem>

      <SettingsItem
        title="文件夹过滤"
        subtitle="同时拖入包含视频、字幕或压缩包的多种文件时，自动排除文件夹"
        icon={<FolderSimpleDashedIcon />}
      >
        <Switch checked={config?.skip_folder_mixed} onChange={(checked) => saveConfig("skip_folder_mixed", checked)} />
      </SettingsItem>

      <SettingsCard>
        <SettingsItem
          title="排除视频文件名"
          subtitle="是否排除文件名含特定内容的视频。使用 | 或正则表达式来匹配多个内容"
          icon={<ProhibitIcon />}
        >
          <Input
            value={config?.exclude_video}
            onChange={(e) => saveConfig("exclude_video", e.target.value)}
            placeholder="不排除视频"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="排除字幕文件名"
          subtitle="是否排除文件名含特定内容的字幕(不对压缩包生效)。使用 | 或正则表达式来匹配多个内容"
          icon={<ProhibitIcon />}
        >
          <Input
            value={config?.exclude_subtitle}
            onChange={(e) => saveConfig("exclude_subtitle", e.target.value)}
            placeholder="不排除字幕"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="字幕识别" />

      <SettingsCard>
        <SettingsItem
          title="简繁识别"
          subtitle="添加文件时，自动识别字幕语言为简体或繁体。禁用后，所有字幕均视作简体字幕"
          icon={<GlobeIcon />}
        >
          <Switch checked={config?.detect_language} onChange={(checked) => saveConfig("detect_language", checked)} />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="轻量识别"
          subtitle="优先根据文件名中的 sc/tc/chs/cht 等扩展名识别简繁类型，匹配失败再通过内容进行识别"
          icon={<GlobeSimpleIcon />}
        >
          <Switch checked={config?.lite_detect} onChange={(checked) => saveConfig("lite_detect", checked)} />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="重命名" />

      <SettingsCard>
        <SettingsItem
          title="转换为小写扩展名"
          subtitle="重命名时将视频与字幕文件的扩展名都转换为小写"
          icon={<TextAaIcon />}
        >
          <Switch
            checked={config?.lowercase_extension}
            onChange={(checked) => saveConfig("lowercase_extension", checked)}
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="移动字幕" subtitle="重命名完成后，是否移动字幕到视频文件夹" icon={<CopyIcon />}>
          <Select
            options={moveSubOptions}
            value={config?.move_sub}
            onChange={(value) => saveConfig("move_sub", value)}
            className="w-48"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem title="删除字幕" subtitle="重命名完成后，是否删除指定的字幕文件" icon={<TrashIcon />}>
          <Select
            options={removeSubOptions}
            value={config?.remove_sub}
            onChange={(value) => saveConfig("remove_sub", value)}
            className="w-48"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="删除压缩包"
          subtitle="重命名完成后，是否删除字幕压缩包。仅当拖入字幕压缩包时生效"
          icon={<FileArchiveIcon />}
        >
          <Switch checked={config?.remove_zip} onChange={(checked) => saveConfig("remove_zip", checked)} />
        </SettingsItem>
      </SettingsCard>

      <SettingsTitle title="后缀" />

      <SettingsCard>
        <SettingsItem
          title="统一后缀"
          subtitle="重命名字幕时，在扩展名前为所有语言字幕添加后缀"
          icon={<FileDashedIcon />}
        >
          <Combobox
            options={config?.union_extension_options}
            value={config?.union_extension}
            onChange={(value) => saveConfig("union_extension", value)}
            onOptionsChange={(options) => saveConfig("union_extension_options", options)}
            placeholder="无后缀"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="简体字幕后缀"
          subtitle="重命名字幕时，在扩展名前为简体字幕添加后缀"
          icon={<FileDashedIcon />}
        >
          <Combobox
            options={config?.sc_extension_options}
            value={config?.sc_extension}
            onChange={(value) => saveConfig("sc_extension", value)}
            onOptionsChange={(options) => saveConfig("sc_extension_options", options)}
            placeholder="无后缀"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>

      <SettingsCard>
        <SettingsItem
          title="繁体字幕后缀"
          subtitle="重命名字幕时，在扩展名前为繁体字幕添加后缀"
          icon={<FileDashedIcon />}
        >
          <Combobox
            options={config?.tc_extension_options}
            value={config?.tc_extension}
            onChange={(value) => saveConfig("tc_extension", value)}
            onOptionsChange={(options) => saveConfig("tc_extension_options", options)}
            placeholder="无后缀"
            className="w-72"
          />
        </SettingsItem>
      </SettingsCard>
    </SettingsContent>
  )
}
