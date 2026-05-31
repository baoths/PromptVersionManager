import { useMemo, useState } from 'react'
import styles from './ExportModal.module.css'
import { Modal } from '../ui/Modal'
import { useExport } from '../../hooks/useExport'
import type { Prompt, PromptVersion } from '../../db/schema'

interface ExportModalProps {
  prompt: Prompt | null
  versions: PromptVersion[]
  currentVersion: PromptVersion | null
}

interface ExportFormat {
  id: string
  label: string
  extension: string
  mime: string
  needsVersion: boolean
  fileNameSuffix: 'all' | 'version'
}

const FORMATS: ExportFormat[] = [
  {
    id: 'json',
    label: 'JSON',
    extension: 'json',
    mime: 'application/json',
    needsVersion: false,
    fileNameSuffix: 'all',
  },
  {
    id: 'markdown',
    label: 'Markdown',
    extension: 'md',
    mime: 'text/markdown',
    needsVersion: true,
    fileNameSuffix: 'version',
  },
  {
    id: 'xml',
    label: 'XML',
    extension: 'xml',
    mime: 'application/xml',
    needsVersion: false,
    fileNameSuffix: 'all',
  },
  {
    id: 'ai-agent',
    label: 'AI-Agent',
    extension: 'ai.json',
    mime: 'application/json',
    needsVersion: true,
    fileNameSuffix: 'version',
  },
  {
    id: 'plain-text',
    label: 'Plain text',
    extension: 'txt',
    mime: 'text/plain',
    needsVersion: true,
    fileNameSuffix: 'version',
  },
]

const sanitizeFileName = (value: string) => {
  const cleaned = value
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'prompt'
}

const downloadFile = (fileName: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function ExportModal({ prompt, versions, currentVersion }: ExportModalProps) {
  const [open, setOpen] = useState(false)
  const { toJSON, toMarkdown, toXML, toAIAgent, toPlainText } = useExport()

  const resolvedCurrent = useMemo(() => {
    return currentVersion ?? versions.find((version) => version.isCurrent) ?? null
  }, [currentVersion, versions])

  const canExport = Boolean(prompt && versions.length > 0)
  const canExportVersion = Boolean(prompt && resolvedCurrent)

  const handleExport = (format: ExportFormat) => {
    if (!prompt || !canExport) {
      return
    }

    const baseName = sanitizeFileName(prompt.title)
    const versionLabel = resolvedCurrent?.versionLabel ?? 'v1'
    const fileNameBase =
      format.fileNameSuffix === 'all'
        ? `${baseName}-all`
        : `${baseName}-${versionLabel}`

    let content = ''
    if (format.id === 'json') {
      content = toJSON(prompt, versions)
    } else if (format.id === 'markdown' && resolvedCurrent) {
      content = toMarkdown(prompt, resolvedCurrent)
    } else if (format.id === 'xml') {
      content = toXML(prompt, versions)
    } else if (format.id === 'ai-agent' && resolvedCurrent) {
      content = toAIAgent(prompt, resolvedCurrent)
    } else if (format.id === 'plain-text' && resolvedCurrent) {
      content = toPlainText(resolvedCurrent, resolvedCurrent.variables)
    }

    if (!content) {
      return
    }

    downloadFile(`${fileNameBase}.${format.extension}`, content, format.mime)
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Export
      </button>
      <Modal open={open} title="Export prompt" onClose={() => setOpen(false)}>
        <p className={styles.note}>
          {prompt
            ? `Exporting "${prompt.title}" and its versions.`
            : 'Open a prompt to export its versions.'}
        </p>
        <div className={styles.list}>
          {FORMATS.map((format) => {
            const disabled = !canExport || (format.needsVersion && !canExportVersion)
            return (
              <button
                key={format.id}
                type="button"
                className={styles.item}
                onClick={() => handleExport(format)}
                disabled={disabled}
              >
                {format.label}
              </button>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
