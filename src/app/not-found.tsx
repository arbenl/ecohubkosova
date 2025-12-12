"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-emerald-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900">Page not found / Faqja nuk u gjet</h2>
        <p className="text-gray-500">
          The page you are looking for does not exist or has been moved.
          <br />
          Faqja që kërkoni nuk ekziston ose është zhvendosur.
        </p>
        <Button asChild className="eco-gradient text-white rounded-full px-8">
          <Link href="/">Back to Home / Kthehu në Ballinë</Link>
        </Button>
      </div>
    </div>
  )
}
