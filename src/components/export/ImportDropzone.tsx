import styles from './ImportDropzone.module.css'

export function ImportDropzone() {
  return (
    <div className={styles.dropzone}>
      <p>Drop .json, .md, .xml, or .txt files here to import.</p>
      <button type="button">Browse files</button>
    </div>
  )
}
