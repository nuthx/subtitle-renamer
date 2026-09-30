import { create } from "zustand"

const createTableState = () => ({
  fileList: {},
  archiveList: [],
})

export const useTableStore = create((set) => ({
  rename: createTableState(),
  download: createTableState(),

  setFileList: (scope, updater) =>
    set((state) => ({
      [scope]: {
        ...state[scope],
        fileList: updater(state[scope].fileList),
      },
    })),
  setArchiveList: (scope, updater) =>
    set((state) => ({
      [scope]: {
        ...state[scope],
        archiveList: updater(state[scope].archiveList),
      },
    })),
  moveFileItem: (scope, key, from, to) =>
    set((state) => {
      const nextList = [...state[scope].fileList[key]]
      nextList.splice(to, 0, nextList.splice(from, 1)[0])

      return {
        [scope]: {
          ...state[scope],
          fileList: {
            ...state[scope].fileList,
            [key]: nextList,
          },
        },
      }
    }),

  clearAll: (scope) =>
    set({
      [scope]: createTableState(),
    }),
}))
