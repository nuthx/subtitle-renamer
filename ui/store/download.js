import { create } from "zustand"

function uniqueBy(items, key) {
  const seen = new Set()
  return items.filter((item) => !seen.has(key(item)) && seen.add(key(item)))
}

export const useDownloadStore = create((set) => ({
  searchQuery: "",
  searchResults: [],
  nextPageUrl: null,
  nextPageLabel: null,
  isLoadingMore: false,
  isSearching: false,
  searchError: null,
  selectedPost: null,
  postFiles: [],
  postNextPageUrl: null,
  postNextPageLabel: null,
  isLoadingMoreFiles: false,
  isLoadingFiles: false,
  filesError: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearching: (isSearching) => set({ isSearching, searchError: null }),
  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setSearchResults: (results, nextPageUrl, nextPageLabel) =>
    set((state) => ({
      searchResults: uniqueBy(state.isLoadingMore ? [...state.searchResults, ...results] : results, (post) => post.id),
      nextPageUrl,
      nextPageLabel,
      isSearching: false,
      isLoadingMore: false,
      searchError: null,
      ...(state.isLoadingMore
        ? {}
        : { selectedPost: null, postFiles: [], postNextPageUrl: null, postNextPageLabel: null }),
    })),
  setSearchError: (searchError) =>
    set({
      searchError,
      isSearching: false,
    }),
  setSelectedPost: (selectedPost) =>
    set({
      selectedPost,
      postFiles: [],
      postNextPageUrl: null,
      postNextPageLabel: null,
      isLoadingMoreFiles: false,
      filesError: null,
    }),
  setLoadingFiles: (isLoadingFiles) => set({ isLoadingFiles }),
  setLoadingMoreFiles: (isLoadingMoreFiles) => set({ isLoadingMoreFiles }),
  setPostFiles: (postFiles, postNextPageUrl = null, postNextPageLabel = null) =>
    set((state) => ({
      postFiles: uniqueBy(
        state.isLoadingMoreFiles ? [...state.postFiles, ...postFiles] : postFiles,
        (file) => file.id || file.url,
      ),
      postNextPageUrl,
      postNextPageLabel,
      isLoadingMoreFiles: false,
      isLoadingFiles: false,
      filesError: null,
    })),
  setFilesError: (filesError) =>
    set({
      filesError,
      isLoadingFiles: false,
    }),
}))
