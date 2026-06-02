import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './PromptEditor.module.css'
import { usePromptStore } from '../../stores/usePromptStore'
import { parseVariables } from '../../utils/variableParser'
import { VariableBar } from './VariableBar'
import type { VariableMap } from '../../db/schema'
import { useAppStore } from '../../stores/useAppStore'

interface PromptEditorProps {
  promptId: string | null
  initialContent?: string
  initialVariables?: VariableMap
}

export function PromptEditor({
  promptId,
  initialContent = '',
  initialVariables = {},
}: PromptEditorProps) {
  const updateDraft = usePromptStore((state) => state.updateDraft)
  const saveDraft = usePromptStore((state) => state.saveDraft)
  const commitVersion = usePromptStore((state) => state.commitVersion)
  const updateCurrentVersionVariables = usePromptStore(
    (state) => state.updateCurrentVersionVariables,
  )
  const showTokenEstimate = useAppStore((state) => state.showTokenEstimate)
  const [content, setContent] = useState(initialContent)
  const [variableValues, setVariableValues] = useState<VariableMap>(initialVariables)
  const variableTimeoutRef = useRef<number | null>(null)

  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const tokens = Math.ceil(words * 1.33)
    return { words, tokens }
  }, [content])

  const variables = useMemo(() => parseVariables(content), [content])

  const variableKeys = Object.keys(variables).sort().join('\0')
  const [trackedKeys, setTrackedKeys] = useState(variableKeys)
  if (variableKeys !== trackedKeys) {
    setTrackedKeys(variableKeys)
    setVariableValues((previous) => {
      const next: VariableMap = {}
      Object.entries(variables).forEach(([key, defaultValue]) => {
        if (previous[key] !== undefined) {
          next[key] = previous[key]
          return
        }
        if (initialVariables[key] !== undefined) {
          next[key] = initialVariables[key]
          return
        }
        next[key] = defaultValue
      })
      return next
    })
  }

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

  useEffect(() => {
    if (!promptId) {
      return undefined
    }

    if (variableTimeoutRef.current) {
      window.clearTimeout(variableTimeoutRef.current)
    }

    variableTimeoutRef.current = window.setTimeout(() => {
      void updateCurrentVersionVariables(promptId, variableValues)
    }, 400)

    return () => {
      if (variableTimeoutRef.current) {
        window.clearTimeout(variableTimeoutRef.current)
      }
    }
  }, [promptId, variableValues, updateCurrentVersionVariables])

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
      {showTokenEstimate ? (
        <footer className={styles.footer}>
          <span>{stats.words} words</span>
          <span>{stats.tokens} tokens</span>
        </footer>
      ) : null}
      <VariableBar
        variables={variables}
        values={variableValues}
        onChange={(key, value) =>
          setVariableValues((previous) => ({ ...previous, [key]: value }))
        }
      />
    </section>
  )
}
