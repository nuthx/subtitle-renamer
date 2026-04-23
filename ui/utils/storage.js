const SUBTITLE_WIDTHS_KEY = "renamer:subtitle-widths"

export function getTableWidths() {
  try {
    const value = localStorage.getItem(SUBTITLE_WIDTHS_KEY)
    return value ? JSON.parse(value) : {}
  } catch {
    return {}
  }
}

export function saveTableWidths(widths) {
  try {
    localStorage.setItem(SUBTITLE_WIDTHS_KEY, JSON.stringify(widths))
  } catch {
    return {}
  }
}

export function clearTableWidths() {
  localStorage.removeItem(SUBTITLE_WIDTHS_KEY)
}
