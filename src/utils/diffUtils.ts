import { diffWords, type Change } from 'diff'

export type DiffChunk = Change

/**
 * Compute a word-level diff between two versions of content.
 */
export function computeWordDiff(previous: string, next: string): DiffChunk[] {
  return diffWords(previous, next)
}
