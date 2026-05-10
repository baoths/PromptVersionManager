import styles from './PromptGrid.module.css'
import { PromptCard, type PromptCardData } from './PromptCard'

interface PromptGridProps {
  prompts: PromptCardData[]
}

export function PromptGrid({ prompts }: PromptGridProps) {
  return (
    <section className={styles.grid}>
      {prompts.map((prompt, index) => (
        <div
          key={prompt.id}
          className={styles.gridItem}
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <PromptCard data={prompt} />
        </div>
      ))}
    </section>
  )
}
