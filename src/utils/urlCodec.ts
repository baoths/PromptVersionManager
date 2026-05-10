import LZString from 'lz-string'
import type { VariableMap } from '../db/schema'

export interface SharedPayload {
  title: string
  version: string
  content: string
  variables: VariableMap
  tags: string[]
  exportedAt: string
}

/**
 * Encode a prompt payload into a URL-safe compressed string.
 */
export function encodePrompt(payload: SharedPayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

/**
 * Decode a URL-safe prompt payload string.
 */
export function decodePrompt(encoded: string): SharedPayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    return json ? (JSON.parse(json) as SharedPayload) : null
  } catch {
    return null
  }
}

/**
 * Build a share URL for a payload using the provided base URL.
 */
export function buildShareURL(payload: SharedPayload, base: string): string {
  return `${base}#/shared?p=${encodePrompt(payload)}`
}
