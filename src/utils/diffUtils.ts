import { diffLines, type Change } from 'diff'

export type DiffChunk = Change

/**
 * Compute a word-level diff between two versions of content.
 */
export function computeLineDiff(previous: string, next: string): DiffChunk[] {
  return diffLines(previous, next)
}
