import { create } from "zustand"

export const useSubtitleStore = create((set) => ({
  fileList: {},
  archiveList: [],

  setFileList: (updater) => set((state) => ({
    fileList: updater(state.fileList)
  })),
  setArchiveList: (updater) => set((state) => ({
    archiveList: updater(state.archiveList)
  })),

  clearAll: () => set({
    fileList: {},
    archiveList: []
  })
}))
