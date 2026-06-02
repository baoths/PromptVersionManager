import styles from './SearchResults.module.css'
import type { SearchResult } from '../../stores/useSearchStore'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onSelect: (id: string) => void
}

export function SearchResults({ results, query, onSelect }: SearchResultsProps) {
  if (!query.trim()) {
    return null
  }

  if (results.length === 0) {
    return <p className={styles.empty}>No prompts match "{query.trim()}".</p>
  }

  return (
    <ul className={styles.results}>
      {results.map((result) => (
        <li key={result.id}>
          <button type="button" className={styles.resultButton} onClick={() => onSelect(result.id)}>
            <h4>{result.title}</h4>
            <p>{result.snippet}</p>
          </button>
        </li>
      ))}
    </ul>
  )
}
