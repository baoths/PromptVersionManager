import { dump } from 'js-yaml'
import type { Prompt, PromptVersion, VariableMap } from '../db/schema'
import { resolveVariables } from './variableParser'

/**
 * Export a prompt and all versions as JSON.
 */
export function toJSON(prompt: Prompt, versions: PromptVersion[]): string {
  return JSON.stringify({ prompt, versions }, null, 2)
}

/**
 * Export a single version as Markdown with YAML frontmatter.
 */
export function toMarkdown(prompt: Prompt, version: PromptVersion): string {
  const frontmatter = {
    id: prompt.id,
    title: prompt.title,
    version: version.versionLabel,
    tags: prompt.tags,
    variables: version.variables,
    createdAt: new Date(prompt.createdAt).toISOString(),
    updatedAt: new Date(prompt.updatedAt).toISOString(),
    commitMessage: version.commitMessage ?? '',
  }

  const yaml = dump(frontmatter, { lineWidth: 0 }).trimEnd()
  return `---\n${yaml}\n---\n\n${version.content}`
}

/**
 * Export a prompt and all versions as XML.
 */
export function toXML(prompt: Prompt, versions: PromptVersion[]): string {
  const versionXml = versions
    .map(
      (version) =>
        `  <version label="${version.versionLabel}" current="${version.isCurrent}">\n` +
        `    <content><![CDATA[${version.content}]]></content>\n` +
        `    <variables>${Object.entries(version.variables)
          .map(([key, value]) => `<var name="${key}">${value}</var>`)
          .join('')}</variables>\n` +
        `  </version>`,
    )
    .join('\n')

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<prompt id="${prompt.id}">\n` +
    `  <title>${prompt.title}</title>\n` +
    `  <tags>${prompt.tags.map((tag) => `<tag>${tag}</tag>`).join('')}</tags>\n` +
    `  <versions>\n${versionXml}\n  </versions>\n` +
    `</prompt>`
  )
}

/**
 * Export a single version in AI-agent compatible JSON.
 */
export function toAIAgent(prompt: Prompt, version: PromptVersion): string {
  return JSON.stringify(
    {
      schema_version: '1.0',
      id: prompt.id,
      title: prompt.title,
      version: version.versionLabel,
      content: version.content,
      variables: version.variables,
      tags: prompt.tags,
      metadata: {
        createdAt: new Date(prompt.createdAt).toISOString(),
        updatedAt: new Date(prompt.updatedAt).toISOString(),
        commitMessage: version.commitMessage ?? '',
      },
    },
    null,
    2,
  )
}

/**
 * Export plain text with optional variable substitution.
 */
export function toPlainText(version: PromptVersion, vars: VariableMap = {}): string {
  return resolveVariables(version.content, vars)
}
