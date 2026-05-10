import { useSearchStore } from '../../stores/useSearchStore'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)
  const hasQuery = query.trim().length > 0

  return (
    <div className={styles.searchBar}>
      <div className={styles.inputWrap}>
        <input
          id="global-search"
          type="search"
          placeholder="Search prompts..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search prompts"
          aria-keyshortcuts="Control+K Meta+K"
        />
        {hasQuery ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            x
          </button>
        ) : null}
      </div>
      <span className={styles.shortcut}>Ctrl + K</span>
    </div>
  )
}
