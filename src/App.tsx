import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import styles from './App.module.css'
import { MainPanel } from './components/layout/MainPanel'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { TemplateResolver } from './components/editor/TemplateResolver'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { VersionList } from './components/versions/VersionList'
import { useAppStore } from './stores/useAppStore'
import DiffPage from './pages/DiffPage'
import EditorPage from './pages/EditorPage'
import LibraryPage from './pages/LibraryPage'
import SettingsPage from './pages/SettingsPage'
import SharedPage from './pages/SharedPage'
import VersionPage from './pages/VersionPage'

export function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <HashRouter>
      <div className={styles.appShell}>
        <TopBar />
        <div className={styles.body}>
          <Sidebar />
          <MainPanel>
            <Routes>
              <Route path="/" element={<LibraryPage />} />
              <Route
                path="/prompt/new"
                element={
                  <ErrorBoundary>
                    <EditorPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/prompt/:id"
                element={
                  <ErrorBoundary>
                    <EditorPage />
                  </ErrorBoundary>
                }
              />
              <Route path="/prompt/:id/versions" element={<VersionPage />} />
              <Route path="/prompt/:id/diff/:v1/:v2" element={<DiffPage />} />
              <Route
                path="/shared"
                element={
                  <ErrorBoundary>
                    <SharedPage />
                  </ErrorBoundary>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainPanel>
          <aside className={styles.inspector} aria-label="Inspector panel">
            <div className={styles.inspectorSection}>
              <h3>Version timeline</h3>
              <VersionList />
            </div>
            <div className={styles.inspectorSection}>
              <h3>Resolve variables</h3>
              <TemplateResolver />
            </div>
          </aside>
        </div>
      </div>
    </HashRouter>
  )
}
