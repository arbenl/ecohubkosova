import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const LOGS_DIR = path.join(process.cwd(), "logs")
const OUTPUTS_DIR = path.join(process.cwd(), "mcp-outputs")
const HEALTH_FILENAME = "mcp-health.json"

type McpHealthEntry = {
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

type McpHealthPayload = {
  status?: string
  timestamp?: string
  summary?: string
  allHealthy?: boolean
  availableCount?: number
  healthyCount?: number
  runningCount?: number
  servers: McpHealthEntry[]
  message?: string
}

export const dynamic = "force-dynamic"

function readHealthFile(dir: string): McpHealthPayload | null {
  const filePath = path.join(dir, HEALTH_FILENAME)
  if (!fs.existsSync(filePath)) return null
  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function loadHealth(): McpHealthPayload {
  const fromLogs = readHealthFile(LOGS_DIR)
  const fromOutputs = readHealthFile(OUTPUTS_DIR)
  const payload = fromLogs ?? fromOutputs

  if (payload) {
    return payload
  }

  return {
    status: "MCP Health Snapshot",
    summary: "No report yet",
    allHealthy: false,
    servers: [],
    message: "Run `pnpm dev:orchestrator` to generate MCP health data.",
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "MCP health endpoint disabled in production" },
      { status: 404 }
    )
  }

  const report = loadHealth()
  return NextResponse.json(report)
}
