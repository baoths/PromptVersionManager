import type { ReactNode } from 'react'
import styles from './MainPanel.module.css'

interface MainPanelProps {
  children: ReactNode
}

export function MainPanel({ children }: MainPanelProps) {
  return <main className={`${styles.main} page`}>{children}</main>
}
