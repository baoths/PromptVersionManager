import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { db, type Folder, type Prompt, type PromptVersion, type VariableMap } from '../db/schema'
import { clearActivePrompt, setActivePromptId } from '../utils/activePrompt'
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
  deleteFolder: (id: string) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  archivePrompt: (id: string) => Promise<void>
  importPrompts: (payloads: ImportPromptPayload[]) => Promise<void>
  setActivePrompt: (id: string | null) => void
}

interface ImportPromptVersion {
  versionLabel?: string
  content: string
  variables?: VariableMap
  commitMessage?: string
  createdAt?: number
  isCurrent?: boolean
}

export interface ImportPromptPayload {
  title: string
  description?: string
  tags?: string[]
  folderId?: string
  createdAt?: number
  updatedAt?: number
  versions: ImportPromptVersion[]
}

const nowLabel = () => new Date().toISOString().slice(0, 10)

export const collectFolderTreeIds = (rootId: string, folders: Folder[]): string[] => {
  const ids = new Set<string>([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const folder of folders) {
      if (folder.parentId && ids.has(folder.parentId) && !ids.has(folder.id)) {
        ids.add(folder.id)
        changed = true
      }
    }
  }
  return Array.from(ids)
}

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
    setActivePromptId(id)
    set({ draftContent: '' })
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
  deleteFolder: async (id) => {
    const folders = await db.folders.toArray()
    const folderIds = collectFolderTreeIds(id, folders)
    const folderIdSet = new Set(folderIds)
    const now = Date.now()

    await db.transaction('rw', db.prompts, db.folders, async () => {
      const prompts = await db.prompts.toArray()
      await Promise.all(
        prompts
          .filter((prompt) => prompt.folderId && folderIdSet.has(prompt.folderId))
          .map((prompt) =>
            db.prompts.update(prompt.id, { folderId: undefined, updatedAt: now }),
          ),
      )
      await db.folders.bulkDelete(folderIds)
    })

    await get().loadPrompts()
  },
  deletePrompt: async (id) => {
    await db.prompts.delete(id)
    await db.promptVersions.where({ promptId: id }).delete()
    await get().loadPrompts()
    clearActivePrompt()
    set({ draftContent: '' })
  },
  archivePrompt: async (id) => {
    await db.prompts.update(id, { isArchived: true })
    await get().loadPrompts()
  },
  importPrompts: async (payloads) => {
    if (payloads.length === 0) {
      return
    }

    const now = Date.now()
    const promptRecords: Prompt[] = []
    const versionRecords: PromptVersion[] = []

    payloads.forEach((payload) => {
      const promptId = uuid()
      const createdAt =
        typeof payload.createdAt === 'number' && Number.isFinite(payload.createdAt)
          ? payload.createdAt
          : now
      const updatedAt =
        typeof payload.updatedAt === 'number' && Number.isFinite(payload.updatedAt)
          ? payload.updatedAt
          : createdAt
      const versions = payload.versions.length > 0 ? payload.versions : []

      promptRecords.push({
        id: promptId,
        title: payload.title || `Imported Prompt - ${nowLabel()}`,
        description: payload.description ?? '',
        tags: payload.tags ?? [],
        createdAt,
        updatedAt: Math.max(updatedAt, createdAt),
        folderId: payload.folderId,
        isArchived: false,
      })

      const normalizedVersions = versions.length
        ? versions
        : [{ content: '', versionLabel: 'v1', variables: {}, isCurrent: true }]

      let currentIndex = normalizedVersions.findIndex((version) => version.isCurrent)
      if (currentIndex < 0) {
        let latestIndex = 0
        let latestTime = normalizedVersions[0]?.createdAt ?? createdAt
        normalizedVersions.forEach((version, index) => {
          const versionTime =
            typeof version.createdAt === 'number' && Number.isFinite(version.createdAt)
              ? version.createdAt
              : createdAt
          if (versionTime >= latestTime) {
            latestTime = versionTime
            latestIndex = index
          }
        })
        currentIndex = latestIndex
      }

      normalizedVersions.forEach((version, index) => {
        versionRecords.push({
          id: uuid(),
          promptId,
          versionLabel: version.versionLabel || `v${index + 1}`,
          content: version.content,
          variables: version.variables ?? {},
          commitMessage: version.commitMessage,
          createdAt:
            typeof version.createdAt === 'number' && Number.isFinite(version.createdAt)
              ? version.createdAt
              : createdAt,
          isCurrent: index === currentIndex,
        })
      })
    })

    await db.transaction('rw', db.prompts, db.promptVersions, async () => {
      await db.prompts.bulkAdd(promptRecords)
      await db.promptVersions.bulkAdd(versionRecords)
    })

    await get().loadPrompts()
  },
  setActivePrompt: (id) => set({ activePromptId: id }),
}))
