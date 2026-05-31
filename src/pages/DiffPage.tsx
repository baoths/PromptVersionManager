import { useParams } from 'react-router-dom'
import styles from './DiffPage.module.css'
import { DiffViewer } from '../components/versions/DiffViewer'
import { usePrompt } from '../hooks/usePrompt'

export default function DiffPage() {
  const { id, v1, v2 } = useParams()
  const { versions } = usePrompt(id ?? null)

  const from = versions.find((version) => version.versionLabel === v1)
  const to = versions.find((version) => version.versionLabel === v2)
  const showWarning = !from || !to

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Diff viewer</h1>
        <p>
          Comparing {v1 ?? 'version'} to {v2 ?? 'version'} in a GitHub-style diff.
        </p>
      </header>
      {showWarning ? (
        <p className={styles.warning}>One or both versions are missing.</p>
      ) : null}
      <DiffViewer
        previous={from?.content ?? 'Old content goes here.'}
        next={to?.content ?? 'New content goes here.'}
      />
    </div>
  )
}
