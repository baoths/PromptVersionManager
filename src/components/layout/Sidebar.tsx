import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { SearchBar } from '../search/SearchBar'
import { TagFilter } from '../library/TagFilter'
import { usePromptStore } from '../../stores/usePromptStore'
import { useAppStore } from '../../stores/useAppStore'

export function Sidebar() {
  const compactSidebar = useAppStore((state) => state.compactSidebar)
  const selectedFolderId = useAppStore((state) => state.selectedFolderId)
  const setSelectedFolderId = useAppStore((state) => state.setSelectedFolderId)
  const setSelectedTags = useAppStore((state) => state.setSelectedTags)
  const folders = usePromptStore((state) => state.folders)
  const createFolder = usePromptStore((state) => state.createFolder)
  const loadPrompts = usePromptStore((state) => state.loadPrompts)
  const [folderName, setFolderName] = useState('')
  const navigate = useNavigate()

  const handleCreateFolder = async () => {
    const nextName = folderName.trim()
    if (!nextName) {
      return
    }
    await createFolder(nextName)
    setFolderName('')
  }

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  return (
    <aside
      className={`${styles.sidebar} ${compactSidebar ? styles.compact : ''}`.trim()}
      aria-label="Sidebar navigation"
    >
      <SearchBar />
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Library</p>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={() => {
              setSelectedFolderId(null)
              setSelectedTags([])
            }}
          >
            All Prompts
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.active : '')}>
            Settings
          </NavLink>
        </nav>
      </div>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Folders</p>
        <div className={styles.folderList}>
          {folders.length === 0 ? (
            <p className={styles.empty}>No folders yet.</p>
          ) : (
            <>
              <button
                key="no-folder"
                type="button"
                className={`${styles.folderItem} ${
                  selectedFolderId === 'no-folder' ? styles.folderItemActive : ''
                }`.trim()}
                onClick={() => {
                  setSelectedFolderId('no-folder')
                  navigate('/')
                }}
              >
                No folder
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  className={`${styles.folderItem} ${
                    selectedFolderId === folder.id ? styles.folderItemActive : ''
                  }`.trim()}
                  onClick={() => {
                    setSelectedFolderId(folder.id)
                    navigate('/')
                  }}
                >
                  {folder.name}
                </button>
              ))}
            </>
          )}
        </div>
        <div className={styles.folderInput}>
          <input
            type="text"
            placeholder="New folder"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleCreateFolder()
              }
            }}
            aria-label="Create folder"
          />
          <button type="button" onClick={() => void handleCreateFolder()}>
            Add
          </button>
        </div>
      </div>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Tags</p>
        <TagFilter />
      </div>
    </aside>
  )
}
