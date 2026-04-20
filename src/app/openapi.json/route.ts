import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import {
  diagnosticsNoStoreHeaders,
  diagnosticsNotFoundResponse,
  hasDiagnosticsAccess,
} from "@/lib/diagnostics-access"

export async function GET(request: Request) {
  if (!hasDiagnosticsAccess(request)) {
    return diagnosticsNotFoundResponse()
  }

  try {
    // Read the OpenAPI spec from the file system
    const specPath = path.join(process.cwd(), "docs", "openapi.json")
    const specContent = fs.readFileSync(specPath, "utf-8")
    const spec = JSON.parse(specContent)

    return NextResponse.json(spec, {
      headers: {
        "Content-Type": "application/json",
        ...diagnosticsNoStoreHeaders,
      },
    })
  } catch (error) {
    console.error("Error reading OpenAPI spec:", error)
    return NextResponse.json(
      {
        error: "Failed to load API specification",
      },
      { status: 500 }
    )
  }
}
