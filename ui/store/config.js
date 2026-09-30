import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import { create } from "zustand"

const DEFAULT_CONFIG = {
  // 通用
  window_theme: "system",
  window_vibrancy: true,
  remember_window: true,
  config_quick_union_extension: false,
  config_badge_union_extension: false,
  config_badge_move_sub: true,
  config_badge_remove_sub: true,
  highlight_diff: true,
  highlight_ignore_case: false,
  highlight_numbers_only: false,

  // 重命名
  detect_language: true,
  detect_folder_recursively: false,
  skip_folder_mixed: true,
  lite_detect: false,
  exclude_video: "",
  exclude_subtitle: "",
  union_extension: "",
  union_extension_options: [],
  sc_extension: "",
  sc_extension_options: [".sc", ".chs", ".zh-Hans"],
  tc_extension: ".tc",
  tc_extension_options: [".tc", ".cht", ".zh-Hant"],
  lowercase_extension: true,
  move_sub: "cut",
  remove_sub: "none",
  remove_zip: true,

  // 字幕下载
  download_directory: "",
}

let storeInstance = null

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load("config.json", { autoSave: true })
  }
  return storeInstance
}

export const useConfigStore = create((set, get) => ({
  config: null,

  initConfig: async () => {
    const store = await getStore()
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      if ((await store.get(key)) === undefined) {
        await store.set(key, value)
      }
    }
    return await get().refreshConfig()
  },

  getConfig: async () => {
    return get().config ?? (await get().refreshConfig())
  },

  refreshConfig: async () => {
    const store = await getStore()
    const entries = await Promise.all(
      Object.entries(DEFAULT_CONFIG).map(async ([key, value]) => [key, (await store.get(key)) ?? value]),
    )
    const config = Object.fromEntries(entries)
    set({ config })
    return config
  },

  saveConfig: async (key, value) => {
    set((state) => ({
      config: {
        ...state.config,
        [key]: value,
      },
    }))

    const store = await getStore()
    await store.set(key, value)

    if (key === "window_theme") {
      await invoke("set_theme", { theme: value })
    }
  },

  resetConfig: async () => {
    const store = await getStore()
    await store.clear()
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      await store.set(key, value)
    }
    await get().refreshConfig()
  },
}))
