import type { PromptDatabase } from './schema'

export function registerMigrations(db: PromptDatabase) {
  db.version(1).stores({
    prompts: '&id, updatedAt, *tags, folderId, isArchived',
    promptVersions: '&id, promptId, createdAt, isCurrent',
    tags: '&name',
    folders: '&id, parentId',
  })
}
