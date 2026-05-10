import type { VariableMap } from '../db/schema'

const VARIABLE_PATTERN = /\{\{([^}:]+)(?::([^}]*))?\}\}/g

/**
 * Parse template variables from prompt content into a name -> default map.
 */
export function parseVariables(content: string): VariableMap {
  const variables: VariableMap = {}
  let match: RegExpExecArray | null = VARIABLE_PATTERN.exec(content)

  while (match) {
    const name = match[1].trim()
    const defaultValue = (match[2] ?? '').trim()
    if (name) {
      variables[name] = defaultValue
    }
    match = VARIABLE_PATTERN.exec(content)
  }

  return variables
}

/**
 * Replace variables in content with provided values or defaults.
 */
export function resolveVariables(content: string, values: VariableMap = {}): string {
  return content.replace(VARIABLE_PATTERN, (_match, name: string, defaultValue: string) => {
    const trimmed = name.trim()
    if (trimmed in values) {
      return values[trimmed]
    }
    return (defaultValue ?? '').trim()
  })
}
