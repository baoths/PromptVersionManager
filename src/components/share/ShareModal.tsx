import { useMemo, useState } from 'react'
import styles from './ShareModal.module.css'
import { Modal } from '../ui/Modal'
import type { Prompt, PromptVersion } from '../../db/schema'
import { useShareLink } from '../../hooks/useShareLink'

interface ShareModalProps {
  prompt: Prompt | null
  version: PromptVersion | null
}

const copyToClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function ShareModal({ prompt, version }: ShareModalProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const payload = useMemo(() => {
    if (!prompt || !version) {
      return null
    }
    return {
      title: prompt.title,
      version: version.versionLabel,
      content: version.content,
      variables: version.variables,
      tags: prompt.tags,
      exportedAt: new Date().toISOString(),
    }
  }, [prompt, version])

  const { url } = useShareLink(payload)
  const canShare = Boolean(url)

  const handleCopy = async () => {
    if (!url) {
      return
    }
    try {
      await copyToClipboard(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Share
      </button>
      <Modal
        open={open}
        title="Share prompt"
        onClose={() => {
          setOpen(false)
          setCopied(false)
        }}
      >
        <div className={styles.content}>
          <p>
            {canShare
              ? 'Share a snapshot link for the current version.'
              : 'Open a prompt to generate a shareable link.'}
          </p>
          <input
            type="text"
            readOnly
            value={url || 'Generated link will appear here.'}
          />
          <div className={styles.actions}>
            <button type="button" onClick={() => void handleCopy()} disabled={!canShare}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
            {copied ? <span className={styles.success}>Copied to clipboard.</span> : null}
          </div>
        </div>
      </Modal>
    </>
  )
}
