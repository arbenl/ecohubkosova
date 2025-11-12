"use client"

import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { useSupabase } from "@/lib/auth-provider"

export default function DebugSessionPage() {
  const supabase = useSupabase()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session)
      setLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <h1 className="text-2xl font-semibold mb-4">Session Debug</h1>
      <pre className="bg-slate-900 rounded-lg p-4 overflow-auto text-xs">
        {loading ? "Loading session..." : JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}
