import { useEffect, useMemo } from 'react'
import styles from './LibraryPage.module.css'
import { PromptGrid } from '../components/library/PromptGrid'
import { usePromptStore } from '../stores/usePromptStore'
import type { PromptCardData } from '../components/library/PromptCard'
import { ImportDropzone } from '../components/export/ImportDropzone'
import { useAppStore } from '../stores/useAppStore'

export default function LibraryPage() {
  const prompts = usePromptStore((state) => state.prompts)
  const versions = usePromptStore((state) => state.versions)
  const folders = usePromptStore((state) => state.folders)
  const loadPrompts = usePromptStore((state) => state.loadPrompts)
  const setActivePromptId = useAppStore((state) => state.setActivePrompt)
  const selectedFolderId = useAppStore((state) => state.selectedFolderId)
  const selectedTags = useAppStore((state) => state.selectedTags)
  const setSelectedFolderId = useAppStore((state) => state.setSelectedFolderId)
  const setSelectedTags = useAppStore((state) => state.setSelectedTags)

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  useEffect(() => {
    setActivePromptId(null)
  }, [setActivePromptId])

  const filteredPrompts = useMemo(() => {
    if (!selectedFolderId) {
      return prompts
    }
    if (selectedFolderId === 'no-folder') {
      return prompts.filter((prompt) => !prompt.folderId)
    }
    return prompts.filter((prompt) => prompt.folderId === selectedFolderId)
  }, [prompts, selectedFolderId])

  const fullyFilteredPrompts = useMemo(() => {
    if (selectedTags.length === 0) {
      return filteredPrompts
    }
    return filteredPrompts.filter((prompt) =>
      selectedTags.some((tag) => prompt.tags.includes(tag)),
    )
  }, [filteredPrompts, selectedTags])

  const filteredVersionCount = useMemo(() => {
    if (!selectedFolderId) {
      return versions.length
    }
    const promptIds = new Set(filteredPrompts.map((prompt) => prompt.id))
    return versions.filter((version) => promptIds.has(version.promptId)).length
  }, [fullyFilteredPrompts, selectedFolderId, versions])

  const promptCards = useMemo<PromptCardData[]>(() => {
    const folderMap = new Map(folders.map((folder) => [folder.id, folder.name]))

    return fullyFilteredPrompts.map((prompt) => {
      const current = versions.find(
        (version) => version.promptId === prompt.id && version.isCurrent,
      )
      return {
        id: prompt.id,
        title: prompt.title,
        content: current?.content ?? '',
        tags: prompt.tags,
        folderName: prompt.folderId ? folderMap.get(prompt.folderId) ?? null : null,
        updatedAt: prompt.updatedAt,
        versionLabel: current?.versionLabel ?? 'v1',
      }
    })
  }, [fullyFilteredPrompts, versions, folders])

  const hasFilters = Boolean(selectedFolderId || selectedTags.length > 0)

  const handleClearFilters = () => {
    setSelectedFolderId(null)
    setSelectedTags([])
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Prompt library</h1>
          <p>Keep every version, compare changes, and share snapshots.</p>
        </div>
        <div className={styles.headerActions}>
          {hasFilters ? (
            <button type="button" className={styles.clearFilters} onClick={handleClearFilters}>
              Clear filters
            </button>
          ) : null}
          <div className={styles.stats}>
            <div>
              <span>{promptCards.length}</span>
              <p>Prompts</p>
            </div>
            <div>
              <span>{filteredVersionCount}</span>
              <p>Versions</p>
            </div>
          </div>
        </div>
      </header>
      {promptCards.length === 0 ? (
        <p className={styles.empty}>No prompts yet. Create a new prompt to get started.</p>
      ) : (
        <PromptGrid prompts={promptCards} />
      )}
      <section className={styles.imports}>
        <h2>Import prompts</h2>
        <ImportDropzone />
      </section>
    </div>
  )
}
