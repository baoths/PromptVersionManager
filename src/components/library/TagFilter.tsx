import styles from './TagFilter.module.css'

const TAGS = ['benchmark', 'voice', 'analysis', 'product', 'sales']

export function TagFilter() {
  return (
    <div className={styles.tags}>
      {TAGS.map((tag) => (
        <button key={tag} type="button" className={styles.tag}>
          {tag}
        </button>
      ))}
    </div>
  )
}
