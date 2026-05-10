import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Settings } from 'lucide-react'
import styles from './TopBar.module.css'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAppStore } from '../../stores/useAppStore'

export function TopBar() {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey
      if (!isModifier) {
        return
      }

      const key = event.key.toLowerCase()
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTyping =
        tag === 'input' || tag === 'textarea' || target?.isContentEditable

      if (isTyping && key !== 'k') {
        return
      }

      if (key === 'k') {
        event.preventDefault()
        const searchInput = document.getElementById('global-search') as
          | HTMLInputElement
          | null
        searchInput?.focus()
        searchInput?.select()
        return
      }

      if (key === 'n' && !event.shiftKey) {
        event.preventDefault()
        navigate('/prompt/new')
        return
      }

      if (key === 'l' && event.shiftKey) {
        event.preventDefault()
        toggleTheme()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [navigate, toggleTheme])

  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <Link to="/" className={styles.brandName}>
          Prompt Version Manager
        </Link>
        <Badge label="local-first" tone="accent" />
      </div>
      <div className={styles.actions}>
        <Link to="/prompt/new" className={`${styles.linkButton} ${styles.newPrompt}`}>
          <Plus className={styles.icon} aria-hidden="true" />
          New prompt
        </Link>
        <Link to="/settings" className={`${styles.linkButton} ${styles.settings}`}>
          <Settings className={styles.icon} aria-hidden="true" />
          Settings
        </Link>
        <Button variant="outline" onClick={toggleTheme} aria-label="Toggle theme">
          Theme: {theme}
        </Button>
      </div>
    </header>
  )
}
