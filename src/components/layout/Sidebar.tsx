import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { SearchBar } from '../search/SearchBar'
import { TagFilter } from '../library/TagFilter'

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Sidebar navigation">
      <SearchBar />
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Library</p>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>
            All Prompts
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.active : '')}>
            Settings
          </NavLink>
        </nav>
      </div>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Folders</p>
        <div className={styles.folderList}>
          <button type="button" className={styles.folderItem}>
            Research
          </button>
          <button type="button" className={styles.folderItem}>
            Product Launch
          </button>
          <button type="button" className={styles.folderItem}>
            Experiments
          </button>
        </div>
      </div>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Tags</p>
        <TagFilter />
      </div>
    </aside>
  )
}
