import { create } from "zustand"

export const useDownloadStore = create((set) => ({
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  searchError: null,
  selectedPost: null,
  postFiles: [],
  isLoadingFiles: false,
  filesError: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearching: (isSearching) => set({ isSearching, searchError: null }),
  setSearchResults: (results) =>
    set({
      searchResults: results,
      isSearching: false,
      searchError: null,
      selectedPost: null,
      postFiles: [],
    }),
  setSearchError: (searchError) =>
    set({
      searchError,
      isSearching: false,
    }),
  setSelectedPost: (selectedPost) =>
    set({
      selectedPost,
      postFiles: [],
      filesError: null,
    }),
  setLoadingFiles: (isLoadingFiles) => set({ isLoadingFiles }),
  setPostFiles: (postFiles) =>
    set({
      postFiles,
      isLoadingFiles: false,
      filesError: null,
    }),
  setFilesError: (filesError) =>
    set({
      filesError,
      isLoadingFiles: false,
    }),
}))
