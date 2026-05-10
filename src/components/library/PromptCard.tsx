import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import styles from './PromptCard.module.css'
import { Modal } from '../ui/Modal'

export interface PromptCardData {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: number
  versionLabel: string
}

interface PromptCardProps {
  data: PromptCardData
}

export function PromptCard({ data }: PromptCardProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const fullContent = data.content.trim() ? data.content : 'No content yet.'
  const previewLimit = 140
  const isTruncated = fullContent.length > previewLimit
  const previewText = isTruncated
    ? `${fullContent.slice(0, previewLimit).trimEnd()}...`
    : fullContent

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
      <div className={styles.tags}>
        {data.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
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
