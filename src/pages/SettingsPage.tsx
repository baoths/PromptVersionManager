import styles from './SettingsPage.module.css'
import { Toggle } from '../components/ui/Toggle'
import { useAppStore } from '../stores/useAppStore'

export default function SettingsPage() {
  const compactSidebar = useAppStore((state) => state.compactSidebar)
  const showTokenEstimate = useAppStore((state) => state.showTokenEstimate)
  const confirmBeforeDelete = useAppStore((state) => state.confirmBeforeDelete)
  const setCompactSidebar = useAppStore((state) => state.setCompactSidebar)
  const setShowTokenEstimate = useAppStore((state) => state.setShowTokenEstimate)
  const setConfirmBeforeDelete = useAppStore((state) => state.setConfirmBeforeDelete)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Control defaults for exports, autosave, and layout.</p>
      </header>
      <section className={styles.panel}>
        <div className={styles.row}>
          <div>
            <h3>Compact sidebar</h3>
            <p>Condense navigation into a narrower sidebar.</p>
          </div>
          <Toggle checked={compactSidebar} onChange={setCompactSidebar} />
        </div>
        <div className={styles.row}>
          <div>
            <h3>Show token estimate</h3>
            <p>Display approximate token counts in the editor.</p>
          </div>
          <Toggle checked={showTokenEstimate} onChange={setShowTokenEstimate} />
        </div>
        <div className={styles.row}>
          <div>
            <h3>Confirm before delete</h3>
            <p>Require confirmation before removing prompts.</p>
          </div>
          <Toggle checked={confirmBeforeDelete} onChange={setConfirmBeforeDelete} />
        </div>
      </section>
    </div>
  )
}
