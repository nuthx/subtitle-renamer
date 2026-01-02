import { load } from "@tauri-apps/plugin-store"

const DEFAULT_CONFIG = {
  general: {
    theme: "system",
    remember_window: false
  },
  subtitle: {
    detect_language: true,
    union_extension: "",
    union_extension_options: [],
    sc_extension: "",
    sc_extension_options: [".sc", ".chs", ".zh-Hans"],
    tc_extension: ".tc",
    tc_extension_options: [".tc", ".cht", ".zh-Hant"],
    lowercase_extension: true,
    move_sub: "cut",
    remove_sub: "none",
    remove_zip: true
  }
}

let storeInstance = null

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load("config.json", { autoSave: true })
  }
  return storeInstance
}

export async function initConfig() {
  const store = await getStore()
  for (const [section, defaults] of Object.entries(DEFAULT_CONFIG)) {
    const existing = await store.get(section)
    await store.set(section, { ...defaults, ...existing })
  }
}

export async function getConfig() {
  const store = await getStore()
  const result = {}
  for (const [section, defaults] of Object.entries(DEFAULT_CONFIG)) {
    const data = await store.get(section)
    result[section] = { ...defaults, ...data }
  }
  return result
}

export async function saveConfig(section, key, value) {
  const store = await getStore()
  const data = await store.get(section)
  await store.set(section, { ...data, [key]: value })
}

export async function resetConfig() {
  const store = await getStore()
  for (const [section, defaults] of Object.entries(DEFAULT_CONFIG)) {
    await store.set(section, defaults)
  }
}
