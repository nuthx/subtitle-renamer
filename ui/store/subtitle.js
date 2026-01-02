import { create } from "zustand"

export const useSubtitleStore = create((set) => ({
  fileList: {},
  archiveList: [],

  setFileList: (fileList) => set({ fileList }),
  setArchiveList: (archiveList) => set({ archiveList }),

  clearAll: () => set({
    fileList: {},
    archiveList: []
  })
}))
