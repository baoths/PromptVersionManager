import { computeWordDiff } from '../../utils/diffUtils'
import styles from './DiffViewer.module.css'

interface DiffViewerProps {
  previous: string
  next: string
}

export function DiffViewer({ previous, next }: DiffViewerProps) {
  const chunks = computeWordDiff(previous, next)

  return (
    <div className={styles.viewer}>
      {chunks.map((chunk, index) => {
        const className = chunk.added
          ? styles.added
          : chunk.removed
            ? styles.removed
            : styles.unchanged
        return (
          <span key={`${chunk.value}-${index}`} className={className}>
            {chunk.value}
          </span>
        )
      })}
    </div>
  )
}
