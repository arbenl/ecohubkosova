"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { changePassword } from "../actions"

interface PasswordFormState {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const initialState: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
}

export function PasswordChangeForm() {
  const t = useTranslations("profile")
  const router = useRouter()
  const [form, setForm] = useState<PasswordFormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleChange =
    (field: keyof PasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await changePassword(form)
      if (result?.error) {
        setError(result.error)
        return
      }

      setSuccess(result?.success ?? t("pwdChangedLogin"))
      setForm(initialState)

      // Send user back to login to re-authenticate with the new password
      setTimeout(() => {
        router.push({ pathname: "/login" })
      }, 300)
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="currentPassword">{t("currPwd")}</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={handleChange("currentPassword")}
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("newPwd")}</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">{t("confirmNewPwd")}</Label>
          <Input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmNewPassword}
            onChange={handleChange("confirmNewPassword")}
            required
            disabled={pending}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500">{t("pwdChangeHint")}</p>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? t("saving") : t("pwdSubmit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={pending}
          onClick={() => setForm(initialState)}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  )
}
