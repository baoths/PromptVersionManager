import { useEffect, useMemo, useState } from 'react'
import styles from './PromptEditor.module.css'
import { usePromptStore } from '../../stores/usePromptStore'
import { parseVariables } from '../../utils/variableParser'
import { VariableBar } from './VariableBar'

interface PromptEditorProps {
  promptId: string | null
  initialContent?: string
}

export function PromptEditor({ promptId, initialContent = '' }: PromptEditorProps) {
  const updateDraft = usePromptStore((state) => state.updateDraft)
  const saveDraft = usePromptStore((state) => state.saveDraft)
  const commitVersion = usePromptStore((state) => state.commitVersion)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  useEffect(() => {
    updateDraft(content)
    if (!promptId) {
      return
    }
    const handle = window.setTimeout(() => {
      void saveDraft(promptId, content)
    }, 800)
    return () => window.clearTimeout(handle)
  }, [content, promptId, saveDraft, updateDraft])

  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const tokens = Math.ceil(words * 1.33)
    return { words, tokens }
  }, [content])

  const variables = useMemo(() => parseVariables(content), [content])

  return (
    <section className={styles.editor}>
      <header className={styles.header}>
        <div>
          <h2>Prompt editor</h2>
          <p>Draft autosaves to the current version.</p>
        </div>
        <button
          type="button"
          className={styles.commit}
          onClick={() => (promptId ? commitVersion(promptId, 'Snapshot') : null)}
        >
          Save as new version
        </button>
      </header>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your prompt here..."
        rows={16}
        aria-label="Prompt editor"
      />
      <footer className={styles.footer}>
        <span>{stats.words} words</span>
        <span>{stats.tokens} tokens</span>
      </footer>
      <VariableBar variables={variables} />
    </section>
  )
}
