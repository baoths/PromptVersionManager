import { computeLineDiff } from '../../utils/diffUtils'
import styles from './DiffViewer.module.css'

interface DiffViewerProps {
  previous: string
  next: string
}

export function DiffViewer({ previous, next }: DiffViewerProps) {
  const chunks = computeLineDiff(previous, next)
  const rows: Array<{
    type: 'added' | 'removed' | 'unchanged'
    left: number | null
    right: number | null
    leftContent: string
    rightContent: string
    leftMarker: string
    rightMarker: string
  }> = []
  let leftLine = 1
  let rightLine = 1

  chunks.forEach((chunk) => {
    const lines = chunk.value.split('\n')
    const trimmedLines = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines
    trimmedLines.forEach((line) => {
      const type = chunk.added
        ? 'added'
        : chunk.removed
          ? 'removed'
          : 'unchanged'

      let left: number | null = null
      let right: number | null = null

      if (type === 'added') {
        right = rightLine
        rightLine += 1
      } else if (type === 'removed') {
        left = leftLine
        leftLine += 1
      } else {
        left = leftLine
        right = rightLine
        leftLine += 1
        rightLine += 1
      }

      const content = line.length > 0 ? line : ' '
      rows.push({
        type,
        left,
        right,
        leftContent: type === 'added' ? ' ' : content,
        rightContent: type === 'removed' ? ' ' : content,
        leftMarker: type === 'removed' ? '-' : ' ',
        rightMarker: type === 'added' ? '+' : ' ',
      })
    })
  })

  return (
    <div className={styles.viewer}>
      <div className={styles.table} role="table" aria-label="Diff view">
        {rows.map((row, index) => {
          const rowClass =
            row.type === 'added'
              ? styles.rowAdded
              : row.type === 'removed'
                ? styles.rowRemoved
                : styles.rowUnchanged
          return (
            <div key={`${row.left}-${row.right}-${index}`} className={`${styles.row} ${rowClass}`.trim()}>
              <span className={styles.lineNumber}>{row.left ?? ''}</span>
              <span className={styles.marker}>{row.leftMarker}</span>
              <span className={styles.lineContent}>{row.leftContent}</span>
              <span className={styles.lineNumber}>{row.right ?? ''}</span>
              <span className={styles.marker}>{row.rightMarker}</span>
              <span className={styles.lineContent}>{row.rightContent}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
