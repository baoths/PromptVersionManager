import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface AppState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  inspectorCollapsed: boolean
  activePromptId: string | null
  compactSidebar: boolean
  showTokenEstimate: boolean
  confirmBeforeDelete: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  toggleInspector: () => void
  setActivePrompt: (id: string | null) => void
  setCompactSidebar: (value: boolean) => void
  setShowTokenEstimate: (value: boolean) => void
  setConfirmBeforeDelete: (value: boolean) => void
}

const defaultTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem('pvm-theme')
  return stored === 'light' ? 'light' : 'dark'
}

const readBool = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') {
    return fallback
  }
  const stored = window.localStorage.getItem(key)
  if (stored === null) {
    return fallback
  }
  return stored === 'true'
}

const writeBool = (key: string, value: boolean) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, String(value))
  }
}

export const useAppStore = create<AppState>((set) => ({
  theme: defaultTheme(),
  sidebarCollapsed: false,
  inspectorCollapsed: false,
  activePromptId: null,
  compactSidebar: readBool('pvm-compact-sidebar', false),
  showTokenEstimate: readBool('pvm-show-token-estimate', true),
  confirmBeforeDelete: readBool('pvm-confirm-before-delete', true),
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
  setCompactSidebar: (value) => {
    writeBool('pvm-compact-sidebar', value)
    set({ compactSidebar: value })
  },
  setShowTokenEstimate: (value) => {
    writeBool('pvm-show-token-estimate', value)
    set({ showTokenEstimate: value })
  },
  setConfirmBeforeDelete: (value) => {
    writeBool('pvm-confirm-before-delete', value)
    set({ confirmBeforeDelete: value })
  },
}))
