import { useAppStore } from '../stores/useAppStore'
import { usePromptStore } from '../stores/usePromptStore'

/** Keep app + prompt store active prompt IDs in sync (inspector, editor route). */
export function setActivePromptId(id: string | null) {
  useAppStore.getState().setActivePrompt(id)
  usePromptStore.setState({ activePromptId: id })
}

export function clearActivePrompt() {
  setActivePromptId(null)
}
