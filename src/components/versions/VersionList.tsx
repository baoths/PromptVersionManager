import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './VersionList.module.css'
import { VersionBadge } from './VersionBadge'
import { useVersionHistory } from '../../hooks/useVersionHistory'
import { useAppStore } from '../../stores/useAppStore'

export function VersionList() {
  const navigate = useNavigate()
  const location = useLocation()
  const activePromptId = useAppStore((state) => state.activePromptId)
  const compareVersionId = useAppStore((state) => state.compareVersionId)
  const setCompareVersionId = useAppStore((state) => state.setCompareVersionId)
  const { versions, currentVersion } = useVersionHistory(activePromptId)

  useEffect(() => {
    setCompareVersionId(null)
  }, [activePromptId, setCompareVersionId])

  useEffect(() => {
    if (compareVersionId && !versions.some((version) => version.id === compareVersionId)) {
      setCompareVersionId(null)
    }
  }, [compareVersionId, setCompareVersionId, versions])

  const compareVersion = useMemo(
    () => versions.find((version) => version.id === compareVersionId) ?? null,
    [compareVersionId, versions],
  )

  useEffect(() => {
    if (compareVersion && currentVersion && compareVersion.id === currentVersion.id) {
      setCompareVersionId(null)
    }
  }, [compareVersion, currentVersion, setCompareVersionId])

  const isComparing = Boolean(compareVersion && currentVersion)

  const helperText = (() => {
    if (!currentVersion) {
      return 'No current version available yet.'
    }
    if (!compareVersion) {
      return 'Select an older version to compare with current.'
    }
    return `Comparing ${compareVersion.versionLabel} to current.`
  })()

  const handleClear = () => {
    setCompareVersionId(null)
    if (activePromptId && location.pathname.includes('/diff/')) {
      navigate(`/prompt/${activePromptId}`, { replace: true })
    }
  }

  const handleSelect = (id: string, isCurrent: boolean) => {
    if (isCurrent) {
      setCompareVersionId(null)
      return
    }
    const nextId = compareVersionId === id ? null : id
    setCompareVersionId(nextId)
    if (nextId && activePromptId && location.pathname.includes('/diff/')) {
      navigate(`/prompt/${activePromptId}`, { replace: true })
    }
  }

  if (!activePromptId) {
    return <p className={styles.empty}>Select a prompt to view versions.</p>
  }

  if (versions.length === 0) {
    return <p className={styles.empty}>No versions yet.</p>
  }

  return (
    <div className={styles.panel}>
      <div className={styles.controls}>
        <p className={styles.helper}>{helperText}</p>
        <div className={styles.actions}>
          {isComparing ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <ul className={styles.list}>
        {versions.map((version) => {
          const isSelected = compareVersionId === version.id
          const selectionLabel = isSelected && !version.isCurrent ? 'Compare' : null
          return (
            <li key={version.id} className={styles.item}>
              <button
                type="button"
                className={`${styles.itemButton} ${
                  isSelected ? styles.selected : ''
                }`.trim()}
                onClick={() => handleSelect(version.id, version.isCurrent)}
                aria-pressed={isSelected}
              >
                <div className={styles.itemInfo}>
                  <VersionBadge
                    label={version.versionLabel}
                    active={version.isCurrent}
                  />
                  <span className={styles.status}>
                    {version.isCurrent ? 'Current' : 'Snapshot'}
                  </span>
                </div>
                <div className={styles.meta}>
                  {selectionLabel ? (
                    <span className={styles.selectionBadge}>{selectionLabel}</span>
                  ) : null}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
