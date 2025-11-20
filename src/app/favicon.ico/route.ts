import { NextResponse } from "next/server"

export async function GET() {
  // Return a simple 1x1 transparent PNG as a placeholder
  const transparentPixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  )

  return new NextResponse(transparentPixel, {
    status: 200,
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
