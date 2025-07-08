"use client"

import { useState } from "react"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Suspense } from "react"

const formSchema = z.object({
  email: z.string().email({ message: "Ju lutemi shkruani një adresë email të vlefshme." }),
  password: z.string().min(6, { message: "Fjalëkalimi duhet të ketë të paktën 6 karaktere." }),
})

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const { signIn, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Attempting to sign in...")
      const { error } = await signIn(values.email, values.password)

      if (error) {
        console.error("Sign in error:", error)
        setError(error.message)
        setIsSubmitting(false)
      } else {
        console.log("Sign in successful, waiting for redirect...")
        // Don't set isSubmitting to false here - let the auth provider handle the redirect
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Ndodhi një gabim i papritur")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5">
        <div className="max-w-md mx-auto glass-card rounded-2xl shadow-xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="text-center mt-4 text-gray-600">Duke ngarkuar...</div>
        </div>
      </div>
    )
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
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      {...field}
                      disabled={isSubmitting}
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
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
              disabled={isSubmitting}
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

const KycuPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5">
          <div className="max-w-md mx-auto glass-card rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="text-center mt-4 text-gray-600">Duke ngarkuar...</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

export default KycuPage
