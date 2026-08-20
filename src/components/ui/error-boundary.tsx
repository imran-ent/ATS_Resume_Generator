import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[50vh] items-center justify-center p-8">
            <div className="max-w-md rounded-lg border border-danger/30 bg-danger/5 p-8 text-center">
              <AlertTriangle className="mx-auto mb-4 size-8 text-danger" />
              <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
              <p className="mt-2 text-sm text-muted">
                An unexpected error occurred. Your data is safe — try refreshing the page.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-white/90"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}