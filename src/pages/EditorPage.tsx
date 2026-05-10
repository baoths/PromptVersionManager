import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './EditorPage.module.css'
import { PromptEditor } from '../components/editor/PromptEditor'
import { ExportModal } from '../components/export/ExportModal'
import { ShareModal } from '../components/share/ShareModal'
import { usePrompt } from '../hooks/usePrompt'
import { usePromptStore } from '../stores/usePromptStore'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const createdRef = useRef(false)
  const createPrompt = usePromptStore((state) => state.createPrompt)
  const updatePromptTitle = usePromptStore((state) => state.updatePromptTitle)
  const { prompt, versions } = usePrompt(id ?? null)
  const [title, setTitle] = useState('')
  const titleTimeoutRef = useRef<number | null>(null)
  const lastSavedTitleRef = useRef('')

  useEffect(() => {
    if (id || createdRef.current) {
      return
    }
    createdRef.current = true
    void createPrompt().then((newId) => navigate(`/prompt/${newId}`, { replace: true }))
  }, [id, createPrompt, navigate])

  const current = useMemo(
    () => versions.find((version) => version.isCurrent),
    [versions],
  )

  useEffect(() => {
    const nextTitle = prompt?.title ?? ''
    setTitle(nextTitle)
    lastSavedTitleRef.current = nextTitle
  }, [prompt?.title])

  useEffect(() => {
    if (!id || !prompt) {
      return undefined
    }

    const nextTitle = title.trim()
    if (!nextTitle || nextTitle === lastSavedTitleRef.current) {
      return undefined
    }

    if (titleTimeoutRef.current) {
      window.clearTimeout(titleTimeoutRef.current)
    }

    titleTimeoutRef.current = window.setTimeout(() => {
      lastSavedTitleRef.current = nextTitle
      void updatePromptTitle(id, nextTitle)
    }, 500)

    return () => {
      if (titleTimeoutRef.current) {
        window.clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [title, id, prompt, updatePromptTitle])

  const saveTitle = async () => {
    if (!id || !prompt) {
      return
    }
    const nextTitle = title.trim()
    if (!nextTitle) {
      setTitle(prompt.title)
      return
    }
    if (nextTitle !== prompt.title) {
      lastSavedTitleRef.current = nextTitle
      await updatePromptTitle(id, nextTitle)
    }
  }

  if (!id && !prompt) {
    return <p className={styles.loading}>Creating prompt...</p>
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void saveTitle()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void saveTitle()
                event.currentTarget.blur()
              }
            }}
            placeholder="Untitled Prompt"
            aria-label="Prompt title"
          />
          <p>Draft autosaves every 800ms.</p>
        </div>
        <div className={styles.actions}>
          <ExportModal />
          <ShareModal />
        </div>
      </header>
      <PromptEditor promptId={id ?? null} initialContent={current?.content ?? ''} />
    </div>
  )
}
