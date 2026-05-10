import styles from './SettingsPage.module.css'
import { Toggle } from '../components/ui/Toggle'

export default function SettingsPage() {
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
            <p>Collapse navigation into icon-only mode.</p>
          </div>
          <Toggle checked={false} onChange={() => undefined} />
        </div>
        <div className={styles.row}>
          <div>
            <h3>Show token estimate</h3>
            <p>Display approximate token counts in the editor.</p>
          </div>
          <Toggle checked={true} onChange={() => undefined} />
        </div>
        <div className={styles.row}>
          <div>
            <h3>Confirm before delete</h3>
            <p>Require confirmation before removing prompts.</p>
          </div>
          <Toggle checked={true} onChange={() => undefined} />
        </div>
      </section>
    </div>
  )
}
