import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Read the OpenAPI spec from the file system
    const specPath = path.join(process.cwd(), "openapi.json")
    const specContent = fs.readFileSync(specPath, "utf-8")
    const spec = JSON.parse(specContent)

    return NextResponse.json(spec, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
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
