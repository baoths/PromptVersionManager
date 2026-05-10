import styles from './VersionPage.module.css'
import { VersionList } from '../components/versions/VersionList'

export default function VersionPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Version history</h1>
        <p>Track every commit and jump between snapshots.</p>
      </header>
      <VersionList />
    </div>
  )
}
