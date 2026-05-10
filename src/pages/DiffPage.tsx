import { useParams } from 'react-router-dom'
import styles from './DiffPage.module.css'
import { DiffViewer } from '../components/versions/DiffViewer'
import { usePrompt } from '../hooks/usePrompt'

export default function DiffPage() {
  const { id, v1, v2 } = useParams()
  const { versions } = usePrompt(id ?? null)

  const from = versions.find((version) => version.versionLabel === v1)
  const to = versions.find((version) => version.versionLabel === v2)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Diff viewer</h1>
        <p>Compare any two versions side-by-side or inline.</p>
      </header>
      <DiffViewer
        previous={from?.content ?? 'Old content goes here.'}
        next={to?.content ?? 'New content goes here.'}
      />
    </div>
  )
}
