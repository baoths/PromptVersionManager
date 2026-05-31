import { useRef, useState } from 'react'
import styles from './ImportDropzone.module.css'
import { useImport } from '../../hooks/useImport'
import {
  usePromptStore,
  type ImportPromptPayload,
} from '../../stores/usePromptStore'
import type { ImportResult } from '../../utils/importParser'
import type { VariableMap } from '../../db/schema'

type StatusTone = 'busy' | 'success' | 'error'
type FileResultStatus = 'success' | 'error'

interface FileResult {
  name: string
  status: FileResultStatus
  detail: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getBaseTitle = (fileName: string) => {
  const base = fileName.replace(/\.[^/.]+$/, '').trim()
  return base || 'Imported prompt'
}

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    )
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const normalizeVariables = (value: unknown): VariableMap => {
  if (!isRecord(value)) {
    return {}
  }
  return Object.entries(value).reduce<VariableMap>((acc, [key, val]) => {
    if (typeof val === 'string') {
      acc[key] = val
      return acc
    }
    if (val !== undefined && val !== null) {
      acc[key] = String(val)
    }
    return acc
  }, {})
}

const parseTimestamp = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return undefined
}

const mapVersion = (value: unknown, index: number) => {
  const record = isRecord(value) ? value : {}
  const versionLabel =
    typeof record.versionLabel === 'string'
      ? record.versionLabel
      : typeof record.version === 'string'
        ? record.version
        : `v${index + 1}`
  return {
    versionLabel,
    content: typeof record.content === 'string' ? record.content : '',
    variables: normalizeVariables(record.variables),
    commitMessage: typeof record.commitMessage === 'string' ? record.commitMessage : undefined,
    createdAt: parseTimestamp(record.createdAt),
    isCurrent: typeof record.isCurrent === 'boolean' ? record.isCurrent : undefined,
  }
}

const fromJsonPayload = (fileName: string, payload: unknown): ImportPromptPayload[] => {
  if (!isRecord(payload)) {
    return []
  }

  const baseTitle = getBaseTitle(fileName)

  if (isRecord(payload.prompt) && Array.isArray(payload.versions)) {
    const promptRecord = payload.prompt
    const versions = payload.versions.map((version, index) => mapVersion(version, index))
    return [
      {
        title:
          typeof promptRecord.title === 'string' ? promptRecord.title : baseTitle,
        description:
          typeof promptRecord.description === 'string' ? promptRecord.description : undefined,
        tags: normalizeTags(promptRecord.tags),
        createdAt: parseTimestamp(promptRecord.createdAt),
        updatedAt: parseTimestamp(promptRecord.updatedAt),
        versions,
      },
    ]
  }

  if (
    typeof payload.schema_version === 'string' &&
    typeof payload.content === 'string'
  ) {
    const metadata = isRecord(payload.metadata) ? payload.metadata : {}
    return [
      {
        title: typeof payload.title === 'string' ? payload.title : baseTitle,
        tags: normalizeTags(payload.tags),
        createdAt: parseTimestamp(metadata.createdAt),
        updatedAt: parseTimestamp(metadata.updatedAt),
        versions: [
          {
            versionLabel:
              typeof payload.version === 'string' ? payload.version : 'v1',
            content: payload.content,
            variables: normalizeVariables(payload.variables),
            commitMessage:
              typeof metadata.commitMessage === 'string'
                ? metadata.commitMessage
                : undefined,
          },
        ],
      },
    ]
  }

  if (typeof payload.title === 'string' && typeof payload.content === 'string') {
    return [
      {
        title: payload.title || baseTitle,
        tags: normalizeTags(payload.tags),
        createdAt: parseTimestamp(payload.exportedAt),
        versions: [
          {
            versionLabel:
              typeof payload.version === 'string' ? payload.version : 'v1',
            content: payload.content,
            variables: normalizeVariables(payload.variables),
          },
        ],
      },
    ]
  }

  return []
}

const fromMarkdownPayload = (fileName: string, payload: unknown): ImportPromptPayload[] => {
  if (!isRecord(payload)) {
    return []
  }

  const baseTitle = getBaseTitle(fileName)
  const frontmatter = isRecord(payload.frontmatter) ? payload.frontmatter : {}
  const body = typeof payload.body === 'string' ? payload.body : ''

  return [
    {
      title: typeof frontmatter.title === 'string' ? frontmatter.title : baseTitle,
      tags: normalizeTags(frontmatter.tags),
      createdAt: parseTimestamp(frontmatter.createdAt),
      updatedAt: parseTimestamp(frontmatter.updatedAt),
      versions: [
        {
          versionLabel:
            typeof frontmatter.version === 'string' ? frontmatter.version : 'v1',
          content: body,
          variables: normalizeVariables(frontmatter.variables),
          commitMessage:
            typeof frontmatter.commitMessage === 'string'
              ? frontmatter.commitMessage
              : undefined,
        },
      ],
    },
  ]
}

const fromXmlPayload = (fileName: string, payload: unknown): ImportPromptPayload[] => {
  if (!(payload instanceof Document)) {
    return []
  }

  if (payload.querySelector('parsererror')) {
    return []
  }

  const baseTitle = getBaseTitle(fileName)
  const promptNode = payload.querySelector('prompt')
  if (!promptNode) {
    return []
  }

  const title = promptNode.querySelector('title')?.textContent?.trim() || baseTitle
  const tags = Array.from(promptNode.querySelectorAll('tags > tag')).map((tag) =>
    (tag.textContent ?? '').trim(),
  )
  const versions = Array.from(promptNode.querySelectorAll('versions > version')).map(
    (node, index) => {
      const versionLabel = node.getAttribute('label') || `v${index + 1}`
      const isCurrent = node.getAttribute('current') === 'true'
      const content = node.querySelector('content')?.textContent ?? ''
      const variables: VariableMap = {}
      node.querySelectorAll('variables > var').forEach((varNode) => {
        const name = varNode.getAttribute('name')
        if (name) {
          variables[name] = (varNode.textContent ?? '').trim()
        }
      })
      return {
        versionLabel,
        content,
        variables,
        isCurrent,
      }
    },
  )

  return [
    {
      title,
      tags: tags.filter(Boolean),
      versions,
    },
  ]
}

const fromTextPayload = (fileName: string, payload: unknown): ImportPromptPayload[] => {
  if (typeof payload !== 'string') {
    return []
  }

  return [
    {
      title: getBaseTitle(fileName),
      versions: [
        {
          versionLabel: 'v1',
          content: payload,
        },
      ],
    },
  ]
}

const toImportPayloads = (
  fileName: string,
  result: ImportResult,
): ImportPromptPayload[] => {
  if (result.format === 'json') {
    return fromJsonPayload(fileName, result.payload)
  }
  if (result.format === 'markdown') {
    return fromMarkdownPayload(fileName, result.payload)
  }
  if (result.format === 'xml') {
    return fromXmlPayload(fileName, result.payload)
  }
  if (result.format === 'text') {
    return fromTextPayload(fileName, result.payload)
  }
  return []
}

export function ImportDropzone() {
  const { parseImport } = useImport()
  const importPrompts = usePromptStore((state) => state.importPrompts)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [status, setStatus] = useState<{ tone: StatusTone; message: string } | null>(
    null,
  )
  const [isDragging, setIsDragging] = useState(false)
  const [fileResults, setFileResults] = useState<FileResult[]>([])

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) {
      return
    }
    setStatus({ tone: 'busy', message: `Importing 0/${files.length} files...` })
    setFileResults([])

    const payloads: ImportPromptPayload[] = []
    const nextResults: FileResult[] = []
    let importedPromptCount = 0

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      setStatus({
        tone: 'busy',
        message: `Importing ${index + 1}/${files.length} files...`,
      })

      try {
        const content = await file.text()
        const result = parseImport(file.name, content)
        if (result.error) {
          nextResults.push({
            name: file.name,
            status: 'error',
            detail: result.error,
          })
          setFileResults([...nextResults])
          continue
        }
        const mapped = toImportPayloads(file.name, result)
        if (mapped.length === 0) {
          nextResults.push({
            name: file.name,
            status: 'error',
            detail: 'Unsupported or empty import data.',
          })
          setFileResults([...nextResults])
          continue
        }
        payloads.push(...mapped)
        importedPromptCount += mapped.length
        nextResults.push({
          name: file.name,
          status: 'success',
          detail: `Imported ${mapped.length} prompt(s).`,
        })
        setFileResults([...nextResults])
      } catch (error) {
        nextResults.push({
          name: file.name,
          status: 'error',
          detail: String(error),
        })
        setFileResults([...nextResults])
      }
    }

    if (payloads.length > 0) {
      try {
        await importPrompts(payloads)
      } catch (error) {
        setStatus({ tone: 'error', message: `Import failed: ${String(error)}` })
        return
      }
    }

    const failedCount = nextResults.filter((result) => result.status === 'error').length
    const successCount = nextResults.length - failedCount

    if (successCount > 0) {
      const failureSuffix =
        failedCount > 0 ? ` ${failedCount} file(s) failed to import.` : ''
      setStatus({
        tone: 'success',
        message: `Imported ${importedPromptCount} prompt(s) from ${successCount} file(s).${failureSuffix}`,
      })
      return
    }

    const firstError = nextResults.find((result) => result.status === 'error')
    setStatus({
      tone: 'error',
      message: firstError?.detail ?? 'No supported imports found.',
    })
  }

  return (
    <div
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`.trim()}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        const files = Array.from(event.dataTransfer.files)
        void handleFiles(files)
      }}
    >
      <p>Drop .json, .md, .xml, or .txt files here to import.</p>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse files
        </button>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept=".json,.md,.markdown,.xml,.txt"
          multiple
          onChange={(event) => {
            const files = event.target.files
            if (files) {
              void handleFiles(Array.from(files))
            }
            event.currentTarget.value = ''
          }}
        />
      </div>
      {status ? (
        <p
          className={`${styles.status} ${
            status.tone === 'error'
              ? styles.statusError
              : status.tone === 'success'
                ? styles.statusSuccess
                : styles.statusBusy
          }`.trim()}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
      {fileResults.length > 0 ? (
        <ul className={styles.results} aria-label="Import results">
          {fileResults.map((result) => (
            <li key={result.name} className={styles.resultItem}>
              <span
                className={`${styles.resultStatus} ${
                  result.status === 'error' ? styles.resultError : styles.resultSuccess
                }`.trim()}
              >
                {result.status === 'error' ? 'Failed' : 'Imported'}
              </span>
              <span className={styles.resultName}>{result.name}</span>
              <span className={styles.resultDetail}>{result.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
