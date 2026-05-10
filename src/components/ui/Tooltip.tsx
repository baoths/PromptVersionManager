import type { ReactNode } from 'react'
import styles from './Tooltip.module.css'

interface TooltipProps {
  text: string
  children: ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className={styles.tooltip} data-tooltip={text}>
      {children}
    </span>
  )
}
