import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import styles from './PromptCard.module.css'
import { Modal } from '../ui/Modal'
import { usePromptStore } from '../../stores/usePromptStore'

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
  const [tagInput, setTagInput] = useState('')
  const navigate = useNavigate()
  const updatePromptTags = usePromptStore((state) => state.updatePromptTags)
  const fullContent = data.content.trim() ? data.content : 'No content yet.'
  const previewLimit = 140
  const isTruncated = fullContent.length > previewLimit
  const previewText = isTruncated
    ? `${fullContent.slice(0, previewLimit).trimEnd()}...`
    : fullContent

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
        <span className={styles.version}>{data.versionLabel}</span>
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
              event.stopPropagation()
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
    </article>
  )
}
