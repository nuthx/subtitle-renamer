import { invoke } from "@tauri-apps/api/core"
import { useState, useEffect } from "react"
import { getConfig, saveConfig as saveConfigImpl } from "@/utils/config"

export function useConfig() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    getConfig().then(setConfig)
  }, [])

  const saveConfig = async (section, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev?.[section], [key]: value }
    }))
    await saveConfigImpl(section, key, value)

    // 切换主题
    if (section === "general" && key === "theme") {
      await invoke("set_theme", { theme: value })
    }
  }

  return { config, saveConfig }
}
