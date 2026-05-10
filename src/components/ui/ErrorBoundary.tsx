import type { ReactNode } from 'react'
import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback}>
          <h2>Something went wrong.</h2>
          <p>Try refreshing the page or returning to the library.</p>
        </div>
      )
    }

    return this.props.children
  }
}
