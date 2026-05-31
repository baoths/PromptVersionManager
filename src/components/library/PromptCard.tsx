import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import styles from './PromptCard.module.css'
import { Modal } from '../ui/Modal'
import { usePromptStore } from '../../stores/usePromptStore'
import { useAppStore } from '../../stores/useAppStore'

export interface PromptCardData {
  id: string
  title: string
  content: string
  tags: string[]
  folderName?: string | null
  updatedAt: number
  versionLabel: string
}

interface PromptCardProps {
  data: PromptCardData
}

export function PromptCard({ data }: PromptCardProps) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(data.title)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const [tagInput, setTagInput] = useState('')
  const navigate = useNavigate()
  const updatePromptTags = usePromptStore((state) => state.updatePromptTags)
  const updatePromptTitle = usePromptStore((state) => state.updatePromptTitle)
  const deletePrompt = usePromptStore((state) => state.deletePrompt)
  const confirmBeforeDelete = useAppStore((state) => state.confirmBeforeDelete)
  const fullContent = data.content.trim() ? data.content : 'No content yet.'
  const previewLimit = 140
  const isTruncated = fullContent.length > previewLimit
  const previewText = isTruncated
    ? `${fullContent.slice(0, previewLimit).trimEnd()}...`
    : fullContent

  useEffect(() => {
    setRenameValue(data.title)
  }, [data.title])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) {
        return
      }
      if (menuButtonRef.current?.contains(target)) {
        return
      }
      setMenuOpen(false)
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [menuOpen])

  const handleAddTag = async () => {
    const nextTag = tagInput.trim()
    if (!nextTag) {
      return
    }
    const nextTags = Array.from(new Set([...data.tags, nextTag]))
    await updatePromptTags(data.id, nextTags)
    setTagInput('')
  }

  const handleRemoveTag = async (tag: string) => {
    const nextTags = data.tags.filter((item) => item !== tag)
    await updatePromptTags(data.id, nextTags)
  }

  const handleOpen = () => {
    setMenuOpen(false)
    navigate(`/prompt/${data.id}`)
  }

  const handleRename = () => {
    setMenuOpen(false)
    setRenameOpen(true)
  }

  const handleRenameSave = async () => {
    const nextTitle = renameValue.trim()
    if (!nextTitle) {
      return
    }
    await updatePromptTitle(data.id, nextTitle)
    setRenameOpen(false)
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    if (confirmBeforeDelete) {
      setDeleteOpen(true)
      return
    }
    await deletePrompt(data.id)
  }

  const handleDeleteConfirm = async () => {
    await deletePrompt(data.id)
    setDeleteOpen(false)
  }

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/prompt/${data.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(`/prompt/${data.id}`)
        }
      }}
      aria-label={`Open ${data.title}`}
    >
      <header className={styles.header}>
        <h3>{data.title}</h3>
        <div className={styles.headerActions}>
          <span className={styles.version}>{data.versionLabel}</span>
          <button
            type="button"
            className={styles.menuButton}
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((previous) => !previous)
            }}
            ref={menuButtonRef}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            Edit
          </button>
          {menuOpen ? (
            <div
              ref={menuRef}
              className={styles.menu}
              role="menu"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={handleOpen} role="menuitem">
                Open
              </button>
              <button type="button" onClick={handleRename} role="menuitem">
                Edit name
              </button>
              <button type="button" onClick={handleDelete} role="menuitem">
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </header>
      {isTruncated ? (
        <button
          type="button"
          className={styles.previewButton}
          onClick={(event) => {
            event.stopPropagation()
            setOpen(true)
          }}
          aria-label={`Open full prompt content for ${data.title}`}
        >
          <span className={styles.preview}>{previewText}</span>
        </button>
      ) : (
        <p className={styles.preview}>{previewText}</p>
      )}
      {data.folderName ? (
        <div className={styles.folder}>
          <span>Folder</span>
          <strong>{data.folderName}</strong>
        </div>
      ) : null}
      <div className={styles.tags}>
        {data.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={styles.tag}
            onClick={(event) => {
              event.stopPropagation()
              void handleRemoveTag(tag)
            }}
            aria-label={`Remove ${tag}`}
          >
            {tag}
            <span aria-hidden="true"> x</span>
          </button>
        ))}
      </div>
      <div className={styles.tagInput}>
        <input
          type="text"
          placeholder="Add tag"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.stopPropagation()
              void handleAddTag()
            }
          }}
          onClick={(event) => event.stopPropagation()}
          aria-label="Add tag"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            void handleAddTag()
          }}
        >
          Add
        </button>
      </div>
      <footer className={styles.footer}>
        Updated {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
      </footer>
      <Modal
        open={open}
        title={data.title}
        onClose={() => setOpen(false)}
      >
        <div className={styles.fullContent}>{fullContent}</div>
      </Modal>
      <Modal
        open={renameOpen}
        title="Rename prompt"
        onClose={() => setRenameOpen(false)}
      >
        <div className={styles.renameForm}>
          <label htmlFor={`rename-${data.id}`}>Prompt name</label>
          <input
            id={`rename-${data.id}`}
            type="text"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void handleRenameSave()
              }
            }}
          />
          <div className={styles.renameActions}>
            <button type="button" onClick={() => setRenameOpen(false)}>
              Cancel
            </button>
            <button type="button" onClick={() => void handleRenameSave()}>
              Save
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={deleteOpen}
        title="Delete prompt"
        onClose={() => setDeleteOpen(false)}
      >
        <div className={styles.deleteForm}>
          <p>
            Delete "{data.title}"? This will remove the prompt and all versions.
          </p>
          <div className={styles.deleteActions}>
            <button type="button" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button type="button" onClick={() => void handleDeleteConfirm()}>
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </article>
  )
}
