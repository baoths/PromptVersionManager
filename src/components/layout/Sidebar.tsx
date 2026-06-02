import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { SearchBar } from '../search/SearchBar'
import { TagFilter } from '../library/TagFilter'
import { Modal } from '../ui/Modal'
import { collectFolderTreeIds, usePromptStore } from '../../stores/usePromptStore'
import { useAppStore } from '../../stores/useAppStore'
import type { Folder } from '../../db/schema'

export function Sidebar() {
  const compactSidebar = useAppStore((state) => state.compactSidebar)
  const selectedFolderId = useAppStore((state) => state.selectedFolderId)
  const setSelectedFolderId = useAppStore((state) => state.setSelectedFolderId)
  const setSelectedTags = useAppStore((state) => state.setSelectedTags)
  const folders = usePromptStore((state) => state.folders)
  const prompts = usePromptStore((state) => state.prompts)
  const createFolder = usePromptStore((state) => state.createFolder)
  const deleteFolder = usePromptStore((state) => state.deleteFolder)
  const loadPrompts = usePromptStore((state) => state.loadPrompts)
  const confirmBeforeDelete = useAppStore((state) => state.confirmBeforeDelete)
  const [folderName, setFolderName] = useState('')
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)
  const navigate = useNavigate()

  const countPromptsInFolder = (folderId: string) => {
    const folderIds = new Set(collectFolderTreeIds(folderId, folders))
    return prompts.filter((prompt) => prompt.folderId && folderIds.has(prompt.folderId))
      .length
  }

  const handleCreateFolder = async () => {
    const nextName = folderName.trim()
    if (!nextName) {
      return
    }
    await createFolder(nextName)
    setFolderName('')
  }

  const handleDeleteFolder = (folder: Folder) => {
    if (confirmBeforeDelete) {
      setFolderToDelete(folder)
      return
    }
    void confirmDeleteFolder(folder.id)
  }

  const confirmDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId)
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null)
    }
    setFolderToDelete(null)
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
          <button
            type="button"
            className={`${styles.navButton} ${
              selectedFolderId === 'no-folder' ? styles.active : ''
            }`.trim()}
            onClick={() => {
              setSelectedFolderId('no-folder')
              navigate('/')
            }}
          >
            No folder
          </button>
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
            folders.map((folder) => (
              <div key={folder.id} className={styles.folderRow}>
                <button
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
                <button
                  type="button"
                  className={styles.folderDelete}
                  onClick={() => handleDeleteFolder(folder)}
                  aria-label={`Delete folder ${folder.name}`}
                >
                  Delete
                </button>
              </div>
            ))
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
      <Modal
        open={folderToDelete !== null}
        title="Delete folder"
        onClose={() => setFolderToDelete(null)}
      >
        {folderToDelete ? (
          <div className={styles.deleteFolderForm}>
            <p>
              Delete "{folderToDelete.name}"?
              {countPromptsInFolder(folderToDelete.id) > 0
                ? ` ${countPromptsInFolder(folderToDelete.id)} prompt(s) in this folder will be moved to No folder.`
                : ' This folder is empty.'}
            </p>
            <div className={styles.deleteFolderActions}>
              <button type="button" onClick={() => setFolderToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteFolder(folderToDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </aside>
  )
}
