import { useState } from 'react'
import styles from './ExportModal.module.css'
import { Modal } from '../ui/Modal'

const FORMATS = ['JSON', 'Markdown', 'XML', 'AI-Agent', 'Plain text']

export function ExportModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Export
      </button>
      <Modal open={open} title="Export prompt" onClose={() => setOpen(false)}>
        <div className={styles.list}>
          {FORMATS.map((format) => (
            <button key={format} type="button" className={styles.item}>
              {format}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
