import { useEffect, useMemo, useRef } from 'react'
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
  const { prompt, versions } = usePrompt(id ?? null)

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

  if (!id && !prompt) {
    return <p className={styles.loading}>Creating prompt...</p>
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{prompt?.title ?? 'Untitled Prompt'}</h1>
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
