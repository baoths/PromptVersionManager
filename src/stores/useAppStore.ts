import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface AppState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  inspectorCollapsed: boolean
  activePromptId: string | null
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  toggleInspector: () => void
  setActivePrompt: (id: string | null) => void
}

const defaultTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem('pvm-theme')
  return stored === 'light' ? 'light' : 'dark'
}

export const useAppStore = create<AppState>((set) => ({
  theme: defaultTheme(),
  sidebarCollapsed: false,
  inspectorCollapsed: false,
  activePromptId: null,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pvm-theme', theme)
    }
    set({ theme })
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pvm-theme', next)
      }
      return { theme: next }
    })
  },
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleInspector: () =>
    set((state) => ({ inspectorCollapsed: !state.inspectorCollapsed })),
  setActivePrompt: (id) => set({ activePromptId: id }),
}))
