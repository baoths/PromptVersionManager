import { create } from 'zustand'

export interface SearchResult {
  id: string
  title: string
  snippet: string
}

interface SearchState {
  query: string
  results: SearchResult[]
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  clear: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  clear: () => set({ query: '', results: [] }),
}))
