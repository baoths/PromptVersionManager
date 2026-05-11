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

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  useEffect(() => {
    setActivePromptId(null)
  }, [setActivePromptId])

  const promptCards = useMemo<PromptCardData[]>(() => {
    const folderMap = new Map(folders.map((folder) => [folder.id, folder.name]))

    return prompts.map((prompt) => {
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
  }, [prompts, versions, folders])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Prompt library</h1>
          <p>Keep every version, compare changes, and share snapshots.</p>
        </div>
        <div className={styles.stats}>
          <div>
            <span>{promptCards.length}</span>
            <p>Prompts</p>
          </div>
          <div>
            <span>{versions.length}</span>
            <p>Versions</p>
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
