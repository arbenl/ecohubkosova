"use client"

import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default function SentryExamplePage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Sentry Test Page</h1>
      <p className="text-gray-600">This page is for testing Sentry error reporting.</p>

      <Button
        variant="destructive"
        onClick={() => {
          throw new Error("Sentry Example Client Error")
        }}
      >
        Throw Client Error
      </Button>
    </div>
  )
}
