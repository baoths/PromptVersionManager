import styles from './SearchResults.module.css'
import type { SearchResult } from '../../stores/useSearchStore'

interface SearchResultsProps {
  results: SearchResult[]
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return <p className={styles.empty}>No matches yet.</p>
  }

  return (
    <ul className={styles.results}>
      {results.map((result) => (
        <li key={result.id}>
          <h4>{result.title}</h4>
          <p>{result.snippet}</p>
        </li>
      ))}
    </ul>
  )
}
