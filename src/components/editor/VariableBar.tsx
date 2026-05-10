import type { VariableMap } from '../../db/schema'
import styles from './VariableBar.module.css'

interface VariableBarProps {
  variables: VariableMap
}

export function VariableBar({ variables }: VariableBarProps) {
  const entries = Object.entries(variables)

  if (entries.length === 0) {
    return <p className={styles.empty}>No variables detected.</p>
  }

  return (
    <div className={styles.bar}>
      {entries.map(([key, value]) => (
        <label key={key} className={styles.item}>
          <span>{key}</span>
          <input type="text" defaultValue={value} />
        </label>
      ))}
    </div>
  )
}
