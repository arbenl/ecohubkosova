"use client"

import { useEffect, useMemo, useState } from "react"

type McpServerEntry = {
  name: string
  ok: boolean
  status?: string
  message?: string
  implemented?: boolean
  optional?: boolean
  binaryFound?: boolean
  processDetected?: boolean
  commandHint?: string
}

type McpHealthResponse = {
  status?: string
  timestamp?: string
  summary?: string
  allHealthy?: boolean
  availableCount?: number
  healthyCount?: number
  runningCount?: number
  servers?: McpServerEntry[]
  message?: string
}

const statusBadge = (ok: boolean) =>
  ok
    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
    : "bg-rose-100 text-rose-800 border border-rose-200"

const headerChip = (ok?: boolean) =>
  ok
    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
    : "bg-amber-100 text-amber-800 border border-amber-200"

export function McpStatusClient() {
  const [data, setData] = useState<McpHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    try {
      setError(null)
      const res = await fetch("/api/dev/mcp-health", { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`)
      }
      const json = (await res.json()) as McpHealthResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load MCP health")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const servers = data?.servers ?? []
  const healthyCount = servers.filter((s) => s.ok).length
  const totalCount = servers.length

  const statusText = useMemo(() => {
    if (loading) return "Loading..."
    if (error) return "Offline"
    if (servers.length === 0) return "No report yet"
    return data?.summary ?? "Health snapshot"
  }, [loading, error, servers.length, data?.summary])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Developer tooling</p>
            <h1 className="text-2xl font-semibold text-slate-900">MCP Servers</h1>
            <p className="text-sm text-slate-600">Live status of local MCP servers and planned endpoints.</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${headerChip(data?.allHealthy)}`}>
            <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
            {statusText}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            {healthyCount}/{totalCount} servers OK
          </span>
          {data?.timestamp && (
            <span className="text-slate-500">Last generated: {new Date(data.timestamp).toLocaleString()}</span>
          )}
          {data?.message && <span className="text-slate-500">Note: {data.message}</span>}
          {loading && <span className="text-slate-500">Refreshing...</span>}
          {error && <span className="text-rose-600">Error: {error}</span>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {servers.length === 0 && !loading ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
            No MCP health report found. Run <code className="rounded bg-slate-100 px-2 py-1">pnpm dev:orchestrator</code>{" "}
            to generate one.
          </div>
        ) : (
          servers.map((server) => (
            <div
              key={server.name}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="h-1 w-full bg-gradient-to-r from-emerald-200 via-sky-200 to-indigo-200" />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Server</p>
                    <h3 className="text-lg font-semibold text-slate-900">{server.name}</h3>
                    {server.status && (
                      <p className="text-xs text-slate-500">
                        Status: <span className="font-medium text-slate-700">{server.status}</span>
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(server.ok)}`}>
                    {server.ok ? "Active" : "Offline"}
                  </span>
                </div>
                {server.message && <p className="text-sm text-slate-600">{server.message}</p>}
                {server.commandHint && (
                  <p className="text-xs text-slate-500">
                    Start with: <code className="rounded bg-slate-100 px-2 py-1">{server.commandHint}</code>
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    Binary: {server.binaryFound ? "found" : "missing"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    Process: {server.processDetected ? "yes" : "no"}
                  </span>
                  {!server.implemented && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Planned</span>}
                  {server.optional && <span className="rounded-full bg-slate-100 px-2 py-1">Optional</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
