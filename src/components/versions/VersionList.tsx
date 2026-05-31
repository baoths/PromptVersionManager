import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './VersionList.module.css'
import { VersionBadge } from './VersionBadge'
import { useVersionHistory } from '../../hooks/useVersionHistory'
import { useAppStore } from '../../stores/useAppStore'
import type { PromptVersion } from '../../db/schema'

export function VersionList() {
  const navigate = useNavigate()
  const location = useLocation()
  const activePromptId = useAppStore((state) => state.activePromptId)
  const { versions, currentVersion } = useVersionHistory(activePromptId)
  const [selection, setSelection] = useState<string[]>([])

  useEffect(() => {
    setSelection([])
  }, [activePromptId])

  useEffect(() => {
    setSelection((previous) =>
      previous.filter((id) => versions.some((version) => version.id === id)),
    )
  }, [versions])

  const selectedVersions = useMemo(
    () =>
      selection
        .map((id) => versions.find((version) => version.id === id))
        .filter((version): version is PromptVersion => Boolean(version)),
    [selection, versions],
  )

  const primary = selectedVersions[0] ?? null
  const secondary = selectedVersions[1] ?? null
  const primaryIsCurrent =
    Boolean(primary && currentVersion && primary.id === currentVersion.id)
  const compareFrom = primary
  const compareTo = secondary ?? (primary && !primaryIsCurrent ? currentVersion : null)
  const canCompare = Boolean(compareFrom && compareTo)

  const helperText = (() => {
    if (selection.length === 0) {
      return 'Select one or two versions to compare.'
    }
    if (selection.length === 1) {
      if (primaryIsCurrent || !currentVersion) {
        return 'Select another version to compare with current.'
      }
      return `Comparing ${primary?.versionLabel ?? 'version'} to current.`
    }
    return `Comparing ${primary?.versionLabel ?? 'version'} to ${
      secondary?.versionLabel ?? 'version'
    }.`
  })()

  const handleClear = () => {
    setSelection([])
    if (activePromptId && location.pathname.includes('/diff/')) {
      navigate(`/prompt/${activePromptId}`)
    }
  }

  const handleSelect = (id: string) => {
    setSelection((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id)
      }
      if (previous.length < 2) {
        return [...previous, id]
      }
      return [previous[1], id]
    })
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
          {canCompare && compareFrom && compareTo && activePromptId ? (
            <button
              type="button"
              className={styles.compareButton}
              onClick={() =>
                navigate(
                  `/prompt/${activePromptId}/diff/${compareFrom.versionLabel}/${compareTo.versionLabel}`,
                )
              }
            >
              Open diff
            </button>
          ) : null}
          {selection.length > 0 ? (
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
          const selectedIndex = selection.indexOf(version.id)
          const isSelected = selectedIndex >= 0
          const selectionLabel = !isSelected
            ? null
            : selection.length === 1
              ? 'Selected'
              : selectedIndex === 0
                ? 'Base'
                : 'Compare'
          return (
            <li key={version.id} className={styles.item}>
              <button
                type="button"
                className={`${styles.itemButton} ${
                  isSelected ? styles.selected : ''
                }`.trim()}
                onClick={() => handleSelect(version.id)}
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
