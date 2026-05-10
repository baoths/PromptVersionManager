import { useMemo } from 'react'
import { usePromptStore } from '../stores/usePromptStore'
import type { PromptVersion } from '../db/schema'

interface VersionHistory {
  versions: PromptVersion[]
  currentVersion: PromptVersion | null
}

export function useVersionHistory(promptId: string | null): VersionHistory {
  const versions = usePromptStore((state) => state.versions)

  const ordered = useMemo(() => {
    return versions
      .filter((version) => version.promptId === promptId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [versions, promptId])

  const currentVersion = ordered.find((version) => version.isCurrent) ?? null

  return { versions: ordered, currentVersion }
}
