import styles from './TemplateResolver.module.css'
import { resolveVariables } from '../../utils/variableParser'

interface TemplateResolverProps {
  content?: string
  values?: Record<string, string>
}

export function TemplateResolver({
  content = 'Hello {{name:there}}, summarize {{topic:the product}} in 3 bullets.',
  values = { name: 'Alex', topic: 'the roadmap' },
}: TemplateResolverProps) {
  const resolved = resolveVariables(content, values)

  return (
    <div className={styles.resolver}>
      <p className={styles.label}>Resolved preview</p>
      <div className={styles.preview}>{resolved}</div>
    </div>
  )
}
