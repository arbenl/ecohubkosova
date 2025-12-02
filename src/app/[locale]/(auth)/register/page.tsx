"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import { useRouter } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { registerUser } from "./actions" // Import the Server Action
import type { Locale } from "@/lib/locales"

type UserRole = "Individ" | "OJQ" | "Ndërmarrje Sociale" | "Kompani"

interface FormData {
  full_name: string
  email: string
  password: string
  confirmPassword: string
  location: string
  role: UserRole
  organization_name?: string
  organization_description?: string
  primary_interest?: string
  contact_person?: string
  contact_email?: string
  terms: boolean
  newsletter: boolean
}

export default function RegjistrohuPage() {
  const t = useTranslations("auth")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const locale = useLocale() as Locale

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    role: "Individ",
    organization_name: "",
    organization_description: "",
    primary_interest: "",
    contact_person: "",
    contact_email: "",
    terms: false,
    newsletter: false,
  })

  /**
   * Handles changes for input and textarea elements.
   * Updates the formData state based on input name and value/checked status.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    // For checkboxes, use the 'checked' property, otherwise use 'value'
    const checked = (e.target as HTMLInputElement).checked
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  /**
   * Handles changes for the RadioGroup (user role selection).
   * Updates the 'role' field in formData.
   * @param {UserRole} value - The selected role value.
   */
  const handleRoleChange = (value: UserRole) => {
    setFormData({ ...formData, role: value })
  }

  /**
   * Handles advancing to the next step in the multi-step registration form.
   * Performs validation based on the current step.
   */
  const handleNextStep = () => {
    if (step === 1) {
      // Step 1 validation: Basic user information
      if (
        !formData.full_name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.location
      ) {
        setError(t("errors.fillAll"))
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t("errors.passwordMismatch"))
        return
      }
      if (formData.password.length < 6) {
        setError(t("errors.passwordLength"))
        return
      }
    }

    if (step === 2 && formData.role !== "Individ") {
      // Step 2 validation: Organization details (only for non-individual roles)
      if (
        !formData.organization_name ||
        !formData.organization_description ||
        !formData.primary_interest ||
        !formData.contact_person ||
        !formData.contact_email
      ) {
        setError(t("errors.fillOrg"))
        return
      }
    }

    setError(null) // Clear any previous errors
    setStep(step + 1) // Move to the next step
  }

  /**
   * Handles going back to the previous step in the multi-step registration form.
   */
  const handlePrevStep = () => {
    setStep(step - 1)
    setError(null) // Clear errors when going back
  }

  /**
   * Handles the final submission of the registration form.
   * Calls the registerUser Server Action.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission behavior

    // Final validation: Terms and conditions must be accepted
    if (!formData.terms) {
      setError(t("errors.acceptTerms"))
      return
    }

    setLoading(true) // Set loading state
    setError(null) // Clear previous errors

    const result = await registerUser({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      location: formData.location,
      role: formData.role,
      organization_name: formData.organization_name,
      organization_description: formData.organization_description,
      primary_interest: formData.primary_interest,
      contact_person: formData.contact_person,
      contact_email: formData.contact_email,
      newsletter: formData.newsletter,
    })

    if (result.error) {
      setError(result.error)
    } else {
      router.push(`/success`) // Redirect to success page upon successful registration
    }
    setLoading(false) // Reset loading state
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5 py-12">
      <div className="container px-4 md:px-6 max-w-lg">
        <Card className="glass-card rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">{t("joinUs")}</CardTitle>
            <CardDescription className="text-gray-600">
              {t("step", { step: step.toString(), total: "3" })} -{" "}
              {step === 1 ? t("basicInfo") : step === 2 ? t("orgDetails") : t("termsAndConfirm")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-700 font-medium">
                      {t("fullName")}
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      {t("email")}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("placeholders.email")}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      {t("password")}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      {t("confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 font-medium">
                      {t("location")}
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder={t("placeholders.location")}
                      className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-700 font-medium">{t("role")}</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => handleRoleChange(value as UserRole)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="Individ" id="individ" />
                        <Label htmlFor="individ" className="flex-1 cursor-pointer">
                          <div className="font-medium">{t("roles.individual")}</div>
                          <div className="text-sm text-gray-500">{t("roles.individualDesc")}</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="OJQ" id="ojq" />
                        <Label htmlFor="ojq" className="flex-1 cursor-pointer">
                          <div className="font-medium">{t("roles.ngo")}</div>
                          <div className="text-sm text-gray-500">{t("roles.ngoDesc")}</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="Ndërmarrje Sociale" id="ndermarrje" />
                        <Label htmlFor="ndermarrje" className="flex-1 cursor-pointer">
                          <div className="font-medium">{t("roles.socialEnterprise")}</div>
                          <div className="text-sm text-gray-500">
                            {t("roles.socialEnterpriseDesc")}
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="Kompani" id="kompani" />
                        <Label htmlFor="kompani" className="flex-1 cursor-pointer">
                          <div className="font-medium">{t("roles.company")}</div>
                          <div className="text-sm text-gray-500">{t("roles.companyDesc")}</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {formData.role !== "Individ" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organization_name" className="text-gray-700 font-medium">
                          {t("orgName")}
                        </Label>
                        <Input
                          id="organization_name"
                          name="organization_name"
                          value={formData.organization_name}
                          onChange={handleChange}
                          placeholder={t("placeholders.orgName")}
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="organization_description"
                          className="text-gray-700 font-medium"
                        >
                          {t("orgDesc")}
                        </Label>
                        <Textarea
                          id="organization_description"
                          name="organization_description"
                          value={formData.organization_description}
                          onChange={handleChange}
                          placeholder={t("placeholders.orgDesc")}
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primary_interest" className="text-gray-700 font-medium">
                          {t("primaryInterest")}
                        </Label>
                        <Input
                          id="primary_interest"
                          name="primary_interest"
                          value={formData.primary_interest}
                          onChange={handleChange}
                          placeholder={t("placeholders.primaryInterest")}
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person" className="text-gray-700 font-medium">
                          {t("contactPerson")}
                        </Label>
                        <Input
                          id="contact_person"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder={t("placeholders.contactPersonName")}
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="text-gray-700 font-medium">
                          {t("contactEmail")}
                        </Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          placeholder={t("placeholders.contactPersonEmail")}
                          className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full eco-gradient flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t("readyForNext")}
                      </h3>
                      <p className="text-gray-500">{t("noExtraInfo")}</p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200">
                      <Checkbox
                        id="terms"
                        name="terms"
                        checked={formData.terms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, terms: checked as boolean })
                        }
                        required
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          {t("agreeTo")}{" "}
                          <Link
                            href="/legal/terms"
                            className="text-[#00C896] hover:text-[#00A07E] underline"
                          >
                            {t("termsOfUse")}
                          </Link>{" "}
                          {t("and")}{" "}
                          <Link
                            href="/privatesia"
                            className="text-[#00C896] hover:text-[#00A07E] underline"
                          >
                            {t("privacyPolicy")}
                          </Link>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200">
                      <Checkbox
                        id="newsletter"
                        name="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, newsletter: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="newsletter"
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          {t("newsletter")}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">{t("newsletterNote")}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="rounded-xl border-gray-200"
                  >
                    {t("back")}
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    className="ml-auto eco-gradient hover:shadow-lg hover:shadow-[#00C896]/25 text-white rounded-xl px-8 py-2 font-semibold transition-all duration-300 hover:scale-[1.02]"
                    onClick={handleNextStep}
                  >
                    {t("continue")}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto eco-gradient hover:shadow-lg hover:shadow-[#00C896]/25 text-white rounded-xl px-8 py-2 font-semibold transition-all duration-300 hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t("registering")}
                      </div>
                    ) : (
                      t("register")
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="text-[#00C896] hover:text-[#00A07E] font-medium transition-colors"
              >
                {t("loginHere")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
