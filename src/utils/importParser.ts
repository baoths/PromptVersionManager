import { load } from 'js-yaml'

export type ImportFormat = 'json' | 'markdown' | 'xml' | 'text' | 'unknown'

export interface ImportResult {
  format: ImportFormat
  payload: unknown
  error?: string
}

/**
 * Parse an imported file into a structured payload based on its extension.
 */
export function parseImport(fileName: string, content: string): ImportResult {
  const lower = fileName.toLowerCase()

  try {
    if (lower.endsWith('.json')) {
      return { format: 'json', payload: JSON.parse(content) }
    }

    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/m.exec(content)
      if (!match) {
        return { format: 'markdown', payload: { frontmatter: null, body: content } }
      }
      return {
        format: 'markdown',
        payload: { frontmatter: load(match[1]), body: match[2].trim() },
      }
    }

    if (lower.endsWith('.xml')) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'application/xml')
      return { format: 'xml', payload: doc }
    }

    if (lower.endsWith('.txt')) {
      return { format: 'text', payload: content }
    }
  } catch (error) {
    return { format: 'unknown', payload: null, error: String(error) }
  }

  return { format: 'unknown', payload: content }
}
