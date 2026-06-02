import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../hooks/useSearch'
import { useSearchStore } from '../../stores/useSearchStore'
import { SearchResults } from './SearchResults'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)
  const { results } = useSearch(query)
  const navigate = useNavigate()
  const hasQuery = query.trim().length > 0

  const handleSelect = (promptId: string) => {
    navigate(`/prompt/${promptId}`)
  }

  return (
    <div className={styles.searchBar}>
      <div className={styles.inputWrap}>
        <input
          id="global-search"
          type="search"
          placeholder="Search prompts..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || results.length === 0) {
              return
            }
            event.preventDefault()
            handleSelect(results[0].id)
          }}
          aria-label="Search prompts"
          aria-keyshortcuts="Control+K Meta+K"
          aria-controls="search-results"
          aria-expanded={hasQuery}
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
      {hasQuery ? (
        <div id="search-results" className={styles.resultsPanel}>
          <SearchResults results={results} query={query} onSelect={handleSelect} />
        </div>
      ) : null}
    </div>
  )
}
