export function nextVersionLabel(current: string | null): string {
  if (!current) {
    return 'v1'
  }

  const match = /^v(\d+)$/.exec(current)
  if (!match) {
    return 'v1'
  }

  const value = Number(match[1])
  if (Number.isNaN(value)) {
    return 'v1'
  }

  return `v${value + 1}`
}
