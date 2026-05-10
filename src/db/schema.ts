import Dexie, { type Table } from 'dexie'
import { registerMigrations } from './migrations'

export interface VariableMap {
  [key: string]: string
}

export interface Prompt {
  id: string
  title: string
  description?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  pinnedVersionId?: string
  folderId?: string
  isArchived: boolean
}

export interface PromptVersion {
  id: string
  promptId: string
  versionLabel: string
  content: string
  resolvedContent?: string
  variables: VariableMap
  commitMessage?: string
  createdAt: number
  isCurrent: boolean
}

export interface Tag {
  name: string
  color: string
  createdAt: number
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: number
}

export class PromptDatabase extends Dexie {
  prompts!: Table<Prompt, string>
  promptVersions!: Table<PromptVersion, string>
  tags!: Table<Tag, string>
  folders!: Table<Folder, string>

  constructor() {
    super('prompt-version-manager')
    registerMigrations(this)
  }
}

export const db = new PromptDatabase()
