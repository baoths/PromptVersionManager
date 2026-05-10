import { useEffect, useMemo } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { usePromptStore } from '../stores/usePromptStore'
import type { Prompt, PromptVersion } from '../db/schema'

interface PromptDetails {
  prompt: Prompt | null
  versions: PromptVersion[]
}

export function usePrompt(promptId: string | null): PromptDetails {
  const { prompts, versions, loadPrompts, setActivePrompt } = usePromptStore()
  const setActivePromptId = useAppStore((state) => state.setActivePrompt)

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  useEffect(() => {
    setActivePrompt(promptId)
    setActivePromptId(promptId)
  }, [promptId, setActivePrompt, setActivePromptId])

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
