import styles from './Badge.module.css'

interface BadgeProps {
  label: string
  tone?: 'default' | 'accent'
}

export function Badge({ label, tone = 'default' }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>
}
