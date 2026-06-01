import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './EditorPage.module.css'
import { PromptEditor } from '../components/editor/PromptEditor'
import { ExportModal } from '../components/export/ExportModal'
import { ShareModal } from '../components/share/ShareModal'
import { DiffViewer } from '../components/versions/DiffViewer'
import { usePrompt } from '../hooks/usePrompt'
import { usePromptStore } from '../stores/usePromptStore'
import { useAppStore } from '../stores/useAppStore'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const createdRef = useRef(false)
  const createPrompt = usePromptStore((state) => state.createPrompt)
  const updatePromptTitle = usePromptStore((state) => state.updatePromptTitle)
  const updatePromptTags = usePromptStore((state) => state.updatePromptTags)
  const updatePromptFolder = usePromptStore((state) => state.updatePromptFolder)
  const folders = usePromptStore((state) => state.folders)
  const compareVersionId = useAppStore((state) => state.compareVersionId)
  const setCompareVersionId = useAppStore((state) => state.setCompareVersionId)
  const { prompt, versions } = usePrompt(id ?? null)
  const [title, setTitle] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState('')
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

  const compareVersion = useMemo(() => {
    if (!compareVersionId) {
      return null
    }
    const match = versions.find((version) => version.id === compareVersionId) ?? null
    if (match && current && match.id === current.id) {
      return null
    }
    return match
  }, [compareVersionId, current, versions])

  const showDiff = Boolean(compareVersion && current)

  useEffect(() => {
    const nextTitle = prompt?.title ?? ''
    setTitle(nextTitle)
    lastSavedTitleRef.current = nextTitle
  }, [prompt?.title])

  useEffect(() => {
    setFolderId(prompt?.folderId ?? '')
  }, [prompt?.folderId])

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

  const tags = prompt?.tags ?? []

  const handleAddTag = async () => {
    if (!id || !prompt) {
      return
    }
    const nextTag = tagInput.trim()
    if (!nextTag) {
      return
    }
    const nextTags = Array.from(new Set([...tags, nextTag]))
    await updatePromptTags(id, nextTags)
    setTagInput('')
  }

  const handleRemoveTag = async (tag: string) => {
    if (!id || !prompt) {
      return
    }
    const nextTags = tags.filter((item) => item !== tag)
    await updatePromptTags(id, nextTags)
  }

  const handleFolderChange = async (value: string) => {
    if (!id || !prompt) {
      return
    }
    setFolderId(value)
    await updatePromptFolder(id, value || null)
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
          <div className={styles.metaRow}>
            <div className={styles.tagEditor}>
              <div className={styles.tagList}>
                {tags.length === 0 ? (
                  <span className={styles.tagEmpty}>No tags yet.</span>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={styles.tagButton}
                      onClick={() => void handleRemoveTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      {tag}
                      <span aria-hidden="true"> x</span>
                    </button>
                  ))
                )}
              </div>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void handleAddTag()
                    }
                  }}
                  aria-label="Add tag"
                />
                <button type="button" onClick={() => void handleAddTag()}>
                  Add
                </button>
              </div>
            </div>
            <div className={styles.folderPicker}>
              <label htmlFor="folder-select">Folder</label>
              <select
                id="folder-select"
                value={folderId}
                onChange={(event) => void handleFolderChange(event.target.value)}
              >
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p>Draft autosaves every 800ms.</p>
        </div>
        <div className={styles.actions}>
          <ExportModal
            prompt={prompt}
            versions={versions}
            currentVersion={current ?? null}
          />
          <ShareModal prompt={prompt} version={current ?? null} />
        </div>
      </header>
      <div className={`${styles.editorGrid} ${showDiff ? styles.split : ''}`.trim()}>
        <div className={styles.editorPanel}>
          <PromptEditor
            promptId={id ?? null}
            initialContent={current?.content ?? ''}
            initialVariables={current?.variables ?? {}}
          />
        </div>
        {showDiff && compareVersion && current ? (
          <section className={styles.diffPanel} aria-label="Inline diff viewer">
            <header className={styles.diffHeader}>
              <div>
                <h2>Diff viewer</h2>
                <p>
                  Comparing {compareVersion.versionLabel} to {current.versionLabel}
                </p>
              </div>
              <button
                type="button"
                className={styles.diffClose}
                onClick={() => setCompareVersionId(null)}
                aria-label="Close diff viewer"
              >
                Close
              </button>
            </header>
            <DiffViewer previous={compareVersion.content} next={current.content} />
          </section>
        ) : null}
      </div>
    </div>
  )
}
