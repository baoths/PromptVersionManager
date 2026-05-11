import { useMemo } from 'react'
import styles from './TemplateResolver.module.css'
import { resolveVariables } from '../../utils/variableParser'
import { useAppStore } from '../../stores/useAppStore'
import { usePromptStore } from '../../stores/usePromptStore'

export function TemplateResolver() {
  const activePromptId = useAppStore((state) => state.activePromptId)
  const versions = usePromptStore((state) => state.versions)

  const current = useMemo(
    () => versions.find((version) => version.promptId === activePromptId && version.isCurrent),
    [versions, activePromptId],
  )

  if (!activePromptId || !current) {
    return <p className={styles.empty}>No prompt selected.</p>
  }

  if (!current.content.trim()) {
    return <p className={styles.empty}>Add variables to preview resolved text.</p>
  }

  const resolved = resolveVariables(current.content, current.variables)

  return (
    <div className={styles.resolver}>
      <p className={styles.label}>Resolved preview</p>
      <div className={styles.preview}>{resolved}</div>
    </div>
  )
}
