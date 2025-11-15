"use client"

import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export interface AuthErrorProps {
  error: string | null
  message?: string | null
}

/**
 * Shared error/message display component for auth pages
 */
export function AuthAlert({ error, message }: AuthErrorProps) {
  if (!error && !message) return null

  return (
    <Alert variant={error ? "destructive" : "default"} className="mb-6 rounded-xl border-l-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="ml-2">{error || message}</AlertDescription>
    </Alert>
  )
}

export interface AuthSubmitButtonProps {
  isSubmitting: boolean
  loadingText: string
  submitText: string
  icon?: React.ReactNode
  className?: string
}

/**
 * Shared submit button component for auth forms
 */
export function AuthSubmitButton({
  isSubmitting,
  loadingText,
  submitText,
  icon,
  className,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={
        className ||
        "w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
      }
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          {loadingText}
        </div>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {submitText}
        </>
      )}
    </Button>
  )
}

export interface OAuthButtonProps {
  isSubmitting: boolean
  provider: "google" | "github"
  onClick: () => Promise<void>
  loadingText?: string
}

/**
 * Shared OAuth button component for auth flows
 */
export function OAuthButton({ isSubmitting, provider, onClick, loadingText }: OAuthButtonProps) {
  const labels = {
    google: { text: "Kyçu me Google", loading: loadingText || "Duke u ridrejtuar..." },
    github: { text: "Kyçu me GitHub", loading: loadingText || "Duke u ridrejtuar..." },
  }

  const label = labels[provider]

  return (
    <button
      onClick={onClick}
      disabled={isSubmitting}
      type="button"
      className="w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          {label.loading}
        </>
      ) : (
        <>
          {provider === "google" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.38 0-1.5.62-1.5 1.4V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
            </svg>
          )}
          {label.text}
        </>
      )}
    </button>
  )
}
