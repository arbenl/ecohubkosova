"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo })
    // You can also log error messages to an error reporting service here
    // logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Diçka shkoi keq!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Na vjen keq, por aplikacioni hasi në një gabim të papritur.
          </p>
          <Button asChild>
            <a href="/">Kthehu në Faqen Kryesore</a>
          </Button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-lg overflow-auto">
              <summary className="font-semibold text-gray-800 cursor-pointer">Detaje Gabimi</summary>
              <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
