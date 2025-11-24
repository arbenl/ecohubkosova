import { notFound } from "next/navigation"
import { McpStatusClient } from "./McpStatusClient"

export const metadata = {
  title: "MCP Servers Status",
  description: "Developer-only view of MCP server availability for EcoHub Kosova.",
}

export default function McpStatusPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return (
    <div className="space-y-6">
      <McpStatusClient />
    </div>
  )
}
