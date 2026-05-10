import { useState } from 'react'
import styles from './ShareModal.module.css'
import { Modal } from '../ui/Modal'

export function ShareModal() {
  const [open, setOpen] = useState(false)
  const url = 'Generated link will appear here.'

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Share
      </button>
      <Modal open={open} title="Share prompt" onClose={() => setOpen(false)}>
        <div className={styles.content}>
          <p>Share a snapshot link for the current version.</p>
          <input type="text" readOnly value={url} />
          <button type="button">Copy link</button>
        </div>
      </Modal>
    </>
  )
}
