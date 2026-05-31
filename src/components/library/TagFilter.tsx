import { useNavigate } from 'react-router-dom'
import styles from './TagFilter.module.css'
import { usePromptStore } from '../../stores/usePromptStore'
import { useAppStore } from '../../stores/useAppStore'

export function TagFilter() {
  const prompts = usePromptStore((state) => state.prompts)
  const selectedTags = useAppStore((state) => state.selectedTags)
  const setSelectedTags = useAppStore((state) => state.setSelectedTags)
  const tags = Array.from(new Set(prompts.flatMap((prompt) => prompt.tags))).sort()
  const navigate = useNavigate()

  if (tags.length === 0) {
    return <p className={styles.empty}>No tags yet.</p>
  }

  return (
    <div className={styles.tags}>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`${styles.tag} ${
            selectedTags.includes(tag) ? styles.tagActive : ''
          }`.trim()}
          aria-pressed={selectedTags.includes(tag)}
          onClick={() => {
            const nextTags = selectedTags.includes(tag)
              ? selectedTags.filter((item) => item !== tag)
              : [...selectedTags, tag]
            setSelectedTags(nextTags)
            navigate('/')
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
