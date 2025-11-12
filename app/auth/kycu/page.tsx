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
import { signIn } from "./actions" // Import the Server Action

const formSchema = z.object({
  email: z.string().email({ message: "Ju lutemi shkruani një adresë email të vlefshme." }),
  password: z.string().min(6, { message: "Fjalëkalimi duhet të ketë të paktën 6 karaktere." }),
})

export default function KycuPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
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

    const result = await signIn(values.email, values.password)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
    // If successful, the server action will handle the redirect,
    // so no need to set isSubmitting to false here.
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
