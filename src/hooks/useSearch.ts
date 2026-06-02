import { useMemo } from 'react'
import Fuse, { type FuseResultMatch } from 'fuse.js'
import { usePromptStore } from '../stores/usePromptStore'
import type { SearchResult } from '../stores/useSearchStore'

interface SearchablePrompt {
  id: string
  title: string
  description: string
  tags: string[]
  content: string
}

const SNIPPET_LIMIT = 140

const matchKeyPriority: Record<string, number> = {
  content: 0,
  description: 1,
  title: 2,
  tags: 3,
}

const buildSnippet = (
  item: SearchablePrompt,
  matches?: readonly FuseResultMatch[],
): string => {
  if (matches && matches.length > 0) {
    const match = [...matches].sort(
      (a, b) =>
        (matchKeyPriority[a.key ?? ''] ?? 9) - (matchKeyPriority[b.key ?? ''] ?? 9),
    )[0]
    const value = String(match.value ?? '')
    const indices = match.indices?.[0]
    if (indices) {
      const [start, end] = indices
      const pad = 40
      const sliceStart = Math.max(0, start - pad)
      const sliceEnd = Math.min(value.length, end + pad)
      let snippet = value.slice(sliceStart, sliceEnd).replace(/\s+/g, ' ').trim()
      if (sliceStart > 0) {
        snippet = `...${snippet}`
      }
      if (sliceEnd < value.length) {
        snippet = `${snippet}...`
      }
      if (snippet) {
        return snippet
      }
    }
    if (match.key === 'tags' && item.tags.length > 0) {
      return item.tags.join(', ')
    }
  }

  const fallback = item.content.trim() || item.description.trim()
  if (!fallback) {
    return 'No content yet.'
  }
  return fallback.length > SNIPPET_LIMIT
    ? `${fallback.slice(0, SNIPPET_LIMIT).trimEnd()}...`
    : fallback
}

export function useSearch(query: string): { results: SearchResult[] } {
  const prompts = usePromptStore((state) => state.prompts)
  const versions = usePromptStore((state) => state.versions)

  const documents = useMemo<SearchablePrompt[]>(() => {
    return prompts.map((prompt) => {
      const current = versions.find(
        (version) => version.promptId === prompt.id && version.isCurrent,
      )
      return {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description ?? '',
        tags: prompt.tags,
        content: current?.content ?? '',
      }
    })
  }, [prompts, versions])

  const index = useMemo(() => {
    return new Fuse(documents, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'tags', weight: 1.5 },
        { name: 'description', weight: 1 },
        { name: 'content', weight: 1 },
      ],
      includeMatches: true,
      threshold: 0.35,
      ignoreLocation: true,
    })
  }, [documents])

  const results = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return []
    }

    return index.search(trimmed).map((result) => ({
      id: result.item.id,
      title: result.item.title,
      snippet: buildSnippet(result.item, result.matches),
    }))
  }, [index, query])

  return { results }
}
