import styles from './TagFilter.module.css'
import { usePromptStore } from '../../stores/usePromptStore'

export function TagFilter() {
  const prompts = usePromptStore((state) => state.prompts)
  const tags = Array.from(new Set(prompts.flatMap((prompt) => prompt.tags))).sort()

  if (tags.length === 0) {
    return <p className={styles.empty}>No tags yet.</p>
  }

  return (
    <div className={styles.tags}>
      {tags.map((tag) => (
        <button key={tag} type="button" className={styles.tag}>
          {tag}
        </button>
      ))}
    </div>
  )
}
