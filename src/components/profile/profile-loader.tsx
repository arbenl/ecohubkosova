"use client"

import { useEffect, useState } from "react"
import type { ProfileUser, ProfileOrganization } from "@/services/profile"
import { ProfileRetryUI } from "./profile-retry-ui"

interface ProfileLoaderProps {
  onLoad: (data: {
    userProfile: ProfileUser | null
    organization: ProfileOrganization | null
    error: string | null
    dbUnavailable: boolean
  }) => void
  children?: React.ReactNode
}

export function ProfileLoader({ onLoad, children }: ProfileLoaderProps) {
  const [state, setState] = useState<{
    isLoading: boolean
    error: string | null
    dbUnavailable: boolean
    lastAttempt: number
  }>({
    isLoading: true,
    error: null,
    dbUnavailable: false,
    lastAttempt: Date.now(),
  })

  const fetchProfile = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))

    try {
      const response = await fetch("/api/auth/profile", {
        cache: "no-store",
      })

      const data = await response.json()

      if (!response.ok) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: data.error || "Failed to load profile",
          dbUnavailable: data.dbUnavailable || false,
        }))
        onLoad({
          userProfile: null,
          organization: null,
          error: data.error,
          dbUnavailable: data.dbUnavailable || false,
        })
        return
      }

      setState((s) => ({
        ...s,
        isLoading: false,
        error: null,
        dbUnavailable: data.dbUnavailable || false,
      }))

      onLoad({
        userProfile: data.profile,
        organization: null,
        error: null,
        dbUnavailable: data.dbUnavailable || false,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setState((s) => ({
        ...s,
        isLoading: false,
        error: errorMsg,
        dbUnavailable: false,
      }))
      onLoad({
        userProfile: null,
        organization: null,
        error: errorMsg,
        dbUnavailable: false,
      })
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (state.error) {
    return (
      <div className="py-8">
        <ProfileRetryUI
          error={state.error}
          onRetry={fetchProfile}
          isLoading={state.isLoading}
          dbUnavailable={state.dbUnavailable}
        />
      </div>
    )
  }

  return <>{children}</>
}
