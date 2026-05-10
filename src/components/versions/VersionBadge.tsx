import styles from './VersionBadge.module.css'

interface VersionBadgeProps {
  label: string
  active?: boolean
}

export function VersionBadge({ label, active = false }: VersionBadgeProps) {
  return (
    <span className={`${styles.badge} ${active ? styles.active : ''}`.trim()}>
      {label}
    </span>
  )
}
