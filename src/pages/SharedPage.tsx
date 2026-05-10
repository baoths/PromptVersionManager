import { useMemo } from 'react'
import styles from './SharedPage.module.css'
import { decodePrompt } from '../utils/urlCodec'

export default function SharedPage() {
  const payload = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const params = new URLSearchParams(window.location.hash.split('?')[1])
    const encoded = params.get('p')
    return encoded ? decodePrompt(encoded) : null
  }, [])

  if (!payload) {
    return <p className={styles.empty}>No shared prompt payload found.</p>
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{payload.title}</h1>
        <p>Shared version {payload.version}</p>
      </header>
      <article className={styles.content}>{payload.content}</article>
    </div>
  )
}
