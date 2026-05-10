import { useEffect, useMemo } from 'react'
import styles from './LibraryPage.module.css'
import { PromptGrid } from '../components/library/PromptGrid'
import { usePromptStore } from '../stores/usePromptStore'
import type { PromptCardData } from '../components/library/PromptCard'
import { ImportDropzone } from '../components/export/ImportDropzone'

const demoPrompts: PromptCardData[] = [
  {
    id: 'demo-1',
    title: 'Launch summary prompt',
    content:
      'Summarize the launch plan in 5 bullets with risks and next steps. Include timeline dependencies, budget constraints, and a short recommendation section that highlights the primary owner for each action item.',
    tags: ['product', 'analysis'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    versionLabel: 'v3',
  },
  {
    id: 'demo-2',
    title: 'Voice rewrite',
    content:
      'Rewrite in an assertive, empathetic voice with a clear CTA. Make sure to include a short subject line and a closing sentence that reinforces the urgency without sounding pushy.',
    tags: ['voice', 'sales'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
    versionLabel: 'v2',
  },
]

export default function LibraryPage() {
  const prompts = usePromptStore((state) => state.prompts)
  const versions = usePromptStore((state) => state.versions)
  const loadPrompts = usePromptStore((state) => state.loadPrompts)

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  const promptCards = useMemo<PromptCardData[]>(() => {
    if (prompts.length === 0) {
      return demoPrompts
    }

    return prompts.map((prompt) => {
      const current = versions.find(
        (version) => version.promptId === prompt.id && version.isCurrent,
      )
      return {
        id: prompt.id,
        title: prompt.title,
        content: current?.content ?? '',
        tags: prompt.tags,
        updatedAt: prompt.updatedAt,
        versionLabel: current?.versionLabel ?? 'v1',
      }
    })
  }, [prompts, versions])

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
      <PromptGrid prompts={promptCards} />
      <section className={styles.imports}>
        <h2>Import prompts</h2>
        <ImportDropzone />
      </section>
    </div>
  )
}
