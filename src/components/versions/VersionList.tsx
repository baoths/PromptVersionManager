import styles from './VersionList.module.css'
import { VersionBadge } from './VersionBadge'
import { useVersionHistory } from '../../hooks/useVersionHistory'
import { useAppStore } from '../../stores/useAppStore'

export function VersionList() {
  const activePromptId = useAppStore((state) => state.activePromptId)
  const { versions } = useVersionHistory(activePromptId)

  if (!activePromptId) {
    return <p className={styles.empty}>Select a prompt to view versions.</p>
  }

  if (versions.length === 0) {
    return <p className={styles.empty}>No versions yet.</p>
  }

  return (
    <ul className={styles.list}>
      {versions.map((version) => (
        <li key={version.id} className={styles.item}>
          <VersionBadge label={version.versionLabel} active={version.isCurrent} />
          <span className={styles.meta}>
            {version.isCurrent ? 'Current' : 'Snapshot'}
          </span>
        </li>
      ))}
    </ul>
  )
}
