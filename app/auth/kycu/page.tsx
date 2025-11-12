"use client"

export const dynamic = "force-dynamic"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "./actions" // Import the Server Action

const formSchema = z.object({
  email: z.string().email({ message: "Ju lutemi shkruani një adresë email të vlefshme." }),
  password: z.string().min(6, { message: "Fjalëkalimi duhet të ketë të paktën 6 karaktere." }),
})

export default function KycuPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get("message")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)
  const inFlightRef = useRef(false)
  const countdownRef = useRef<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (rateLimitSeconds <= 0) {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      return
    }

    if (countdownRef.current) return

    countdownRef.current = window.setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [rateLimitSeconds])

  const isRateLimitError = (message: string | null) =>
    Boolean(message?.toLowerCase().includes("rate limit") || message?.toLowerCase().includes("too many requests"))

  const startRateLimitCountdown = (seconds: number) => {
    setRateLimitSeconds(seconds)
  }

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const signInWithRetry = async (email: string, password: string, maxAttempts = 3) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await signIn(email, password)
      if (!result?.error) {
        return result
      }

      if (isRateLimitError(result.error)) {
        if (attempt === maxAttempts - 1) {
          const delaySeconds = 2 ** (attempt + 1)
          startRateLimitCountdown(delaySeconds * 2)
          throw new Error("Shumë tentativa. Ju lutemi prisni pak dhe provoni përsëri.")
        }
        const waitSeconds = 2 ** (attempt + 1)
        await wait(waitSeconds * 1000)
        continue
      }

      throw new Error(result.error)
    }

    throw new Error("Nuk u arrit kyçja. Ju lutemi provoni përsëri.")
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (inFlightRef.current || rateLimitSeconds > 0) {
      return
    }

    inFlightRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signInWithRetry(values.email, values.password)

      if (result?.error) {
        console.error("Kyçu error:", result.error)
        setError(result.error)
        return
      }

      setRateLimitSeconds(0)
      router.replace("/dashboard")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ndodhi një gabim i papritur. Ju lutemi provoni përsëri."
      console.error("Kyçu error: unexpected failure", error)
      setError(message)
    } finally {
      inFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5">
      <div className="max-w-md mx-auto glass-card rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mirë se erdhe</h1>
          <p className="text-gray-600">Kyçu në llogarinë tënde</p>
        </div>

        {message && (
          <Alert className="mb-6 border-[#00C896]/20 bg-[#00C896]/5">
            <AlertCircle className="h-4 w-4 text-[#00C896]" />
            <AlertDescription className="text-gray-700">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {rateLimitSeconds > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Shumë tentativa kyçjeje. Prisni {rateLimitSeconds}s për ta provuar përsëri.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@example.com"
                      autoComplete="email"
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      {...field}
                      disabled={isSubmitting || rateLimitSeconds > 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Fjalëkalimi</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      {...field}
                      disabled={isSubmitting || rateLimitSeconds > 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
              disabled={isSubmitting || rateLimitSeconds > 0}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Duke u kyçur...
                </div>
              ) : (
                "Kyçu"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Nuk ke llogari?{" "}
            <a href="/auth/regjistrohu" className="text-[#00C896] hover:text-[#00A07E] font-medium transition-colors">
              Regjistrohu këtu
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
