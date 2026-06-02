import { useEffect, useMemo } from 'react'
import { usePromptStore } from '../stores/usePromptStore'
import { setActivePromptId } from '../utils/activePrompt'
import type { Prompt, PromptVersion } from '../db/schema'

interface PromptDetails {
  prompt: Prompt | null
  versions: PromptVersion[]
}

export function usePrompt(promptId: string | null): PromptDetails {
  const { prompts, versions, loadPrompts } = usePromptStore()

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  useEffect(() => {
    setActivePromptId(promptId)
  }, [promptId])

  const prompt = useMemo(
    () => prompts.find((item) => item.id === promptId) ?? null,
    [prompts, promptId],
  )

  const promptVersions = useMemo(
    () => versions.filter((version) => version.promptId === promptId),
    [versions, promptId],
  )

  return { prompt, versions: promptVersions }
}
