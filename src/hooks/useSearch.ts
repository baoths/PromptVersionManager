import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { usePromptStore } from '../stores/usePromptStore'

export function useSearch(query: string) {
  const prompts = usePromptStore((state) => state.prompts)

  const index = useMemo(() => {
    return new Fuse(prompts, {
      keys: ['title', 'description', 'tags'],
      includeMatches: true,
      threshold: 0.3,
    })
  }, [prompts])

  const results = useMemo(() => {
    if (!query.trim()) {
      return []
    }
    return index.search(query)
  }, [index, query])

  return { results }
}
