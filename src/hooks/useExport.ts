import {
  toAIAgent,
  toJSON,
  toMarkdown,
  toPlainText,
  toXML,
} from '../utils/exportFormats'

export function useExport() {
  return {
    toJSON,
    toMarkdown,
    toXML,
    toAIAgent,
    toPlainText,
  }
}
