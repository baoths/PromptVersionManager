import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { db, type Folder, type Prompt, type PromptVersion, type VariableMap } from '../db/schema'
import { nextVersionLabel } from '../utils/semver'

interface PromptState {
  prompts: Prompt[]
  versions: PromptVersion[]
  folders: Folder[]
  draftContent: string
  activePromptId: string | null
  loadPrompts: () => Promise<void>
  createPrompt: (title?: string) => Promise<string>
  updateDraft: (content: string) => void
  saveDraft: (promptId: string, content: string) => Promise<void>
  commitVersion: (promptId: string, message?: string) => Promise<void>
  updatePromptTitle: (promptId: string, title: string) => Promise<void>
  updatePromptTags: (promptId: string, tags: string[]) => Promise<void>
  updatePromptFolder: (promptId: string, folderId: string | null) => Promise<void>
  updateCurrentVersionVariables: (promptId: string, variables: VariableMap) => Promise<void>
  createFolder: (name: string, parentId?: string) => Promise<string>
  deletePrompt: (id: string) => Promise<void>
  archivePrompt: (id: string) => Promise<void>
  setActivePrompt: (id: string | null) => void
}

const nowLabel = () => new Date().toISOString().slice(0, 10)

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  versions: [],
  folders: [],
  draftContent: '',
  activePromptId: null,
  loadPrompts: async () => {
    const [prompts, versions, folders] = await Promise.all([
      db.prompts.toArray(),
      db.promptVersions.toArray(),
      db.folders.toArray(),
    ])
    set({ prompts, versions, folders })
  },
  createPrompt: async (title) => {
    const id = uuid()
    const createdAt = Date.now()
    const prompt: Prompt = {
      id,
      title: title ?? `Untitled Prompt - ${nowLabel()}`,
      description: '',
      tags: [],
      createdAt,
      updatedAt: createdAt,
      isArchived: false,
    }

    const version: PromptVersion = {
      id: uuid(),
      promptId: id,
      versionLabel: 'v1',
      content: '',
      variables: {},
      createdAt,
      isCurrent: true,
    }

    await db.prompts.add(prompt)
    await db.promptVersions.add(version)
    await get().loadPrompts()
    set({ activePromptId: id, draftContent: '' })
    return id
  },
  updateDraft: (content) => set({ draftContent: content }),
  saveDraft: async (promptId, content) => {
    const current = await db.promptVersions
      .where('promptId')
      .equals(promptId)
      .and((version) => version.isCurrent)
      .first()
    if (!current) {
      return
    }
    await db.promptVersions.update(current.id, { content })
    await get().loadPrompts()
  },
  commitVersion: async (promptId, message) => {
    const versions = await db.promptVersions.where({ promptId }).toArray()
    const current = versions.find((version) => version.isCurrent)
    const nextLabel = nextVersionLabel(current?.versionLabel ?? null)

    if (current) {
      await db.promptVersions.update(current.id, { isCurrent: false })
    }

    const newVersion: PromptVersion = {
      id: uuid(),
      promptId,
      versionLabel: nextLabel,
      content: current?.content ?? '',
      variables: current?.variables ?? {},
      commitMessage: message,
      createdAt: Date.now(),
      isCurrent: true,
    }

    await db.promptVersions.add(newVersion)
    await db.prompts.update(promptId, { updatedAt: Date.now() })
    await get().loadPrompts()
  },
  updatePromptTitle: async (promptId, title) => {
    await db.prompts.update(promptId, { title, updatedAt: Date.now() })
    await get().loadPrompts()
  },
  updatePromptTags: async (promptId, tags) => {
    await db.prompts.update(promptId, { tags, updatedAt: Date.now() })
    await get().loadPrompts()
  },
  updatePromptFolder: async (promptId, folderId) => {
    await db.prompts.update(promptId, {
      folderId: folderId ?? undefined,
      updatedAt: Date.now(),
    })
    await get().loadPrompts()
  },
  updateCurrentVersionVariables: async (promptId, variables) => {
    const current = await db.promptVersions
      .where('promptId')
      .equals(promptId)
      .and((version) => version.isCurrent)
      .first()
    if (!current) {
      return
    }
    await db.promptVersions.update(current.id, { variables })
    await get().loadPrompts()
  },
  createFolder: async (name, parentId) => {
    const id = uuid()
    const folder: Folder = {
      id,
      name,
      parentId,
      createdAt: Date.now(),
    }
    await db.folders.add(folder)
    await get().loadPrompts()
    return id
  },
  deletePrompt: async (id) => {
    await db.prompts.delete(id)
    await db.promptVersions.where({ promptId: id }).delete()
    await get().loadPrompts()
    set({ activePromptId: null, draftContent: '' })
  },
  archivePrompt: async (id) => {
    await db.prompts.update(id, { isArchived: true })
    await get().loadPrompts()
  },
  setActivePrompt: (id) => set({ activePromptId: id }),
}))
