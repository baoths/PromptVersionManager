import styles from './VersionList.module.css'
import { VersionBadge } from './VersionBadge'
import { useVersionHistory } from '../../hooks/useVersionHistory'
import { useAppStore } from '../../stores/useAppStore'

export function VersionList() {
  const activePromptId = useAppStore((state) => state.activePromptId)
  const { versions } = useVersionHistory(activePromptId)

  const items =
    versions.length > 0
      ? versions
      : [
          { id: 'v3', versionLabel: 'v3', isCurrent: true },
          { id: 'v2', versionLabel: 'v2', isCurrent: false },
          { id: 'v1', versionLabel: 'v1', isCurrent: false },
        ]

  return (
    <ul className={styles.list}>
      {items.map((version) => (
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
