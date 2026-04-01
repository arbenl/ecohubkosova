"use client"

import type React from "react"
import { useRef, useState } from "react"
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
  const nextStepLockRef = useRef(false)

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

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((current) => ({ ...current, ...updates }))
  }

  /**
   * Handles changes for input and textarea elements.
   * Updates the formData state based on input name and value/checked status.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    // For checkboxes, use the 'checked' property, otherwise use 'value'
    const checked = (e.target as HTMLInputElement).checked
    updateFormData({
      [name]: type === "checkbox" ? checked : value,
    } as Partial<FormData>)
  }

  /**
   * Handles changes for the RadioGroup (user role selection).
   * Updates the 'role' field in formData.
   * @param {UserRole} value - The selected role value.
   */
  const handleRoleChange = (value: UserRole) => {
    updateFormData({ role: value })
  }

  /**
   * Handles advancing to the next step in the multi-step registration form.
   * Performs validation based on the current step.
   */
  const handleNextStep = () => {
    if (nextStepLockRef.current) {
      return
    }

    nextStepLockRef.current = true

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
        nextStepLockRef.current = false
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t("errors.passwordMismatch"))
        nextStepLockRef.current = false
        return
      }
      if (formData.password.length < 6) {
        setError(t("errors.passwordLength"))
        nextStepLockRef.current = false
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
        nextStepLockRef.current = false
        return
      }
    }

    setError(null) // Clear any previous errors
    setStep((currentStep) => {
      nextStepLockRef.current = false
      return currentStep === step ? currentStep + 1 : currentStep
    })
  }

  /**
   * Handles going back to the previous step in the multi-step registration form.
   */
  const handlePrevStep = () => {
    nextStepLockRef.current = false
    setStep((currentStep) => currentStep - 1)
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
      const typeParam = formData.role === "Individ" ? "user" : "org"
      router.push(`/success?type=${typeParam}`) // Redirect to success page upon successful registration
    }
    setLoading(false) // Reset loading state
  }

  return (
    <div className="register-shell">
      <div className="register-container">
        <Card className="register-card">
          <CardHeader className="register-card-header">
            <CardTitle className="register-title">{t("joinUs")}</CardTitle>
            <CardDescription className="register-description">
              {t("step", { step: step.toString(), total: "3" })} -{" "}
              {step === 1 ? t("basicInfo") : step === 2 ? t("orgDetails") : t("termsAndConfirm")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="register-form">
              {step === 1 && (
                <>
                  <div className="register-field">
                    <Label htmlFor="full_name" className="register-label">
                      {t("fullName")}
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="register-input"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <Label htmlFor="email" className="register-label">
                      {t("email")}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("placeholders.email")}
                      className="register-input"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <Label htmlFor="password" className="register-label">
                      {t("password")}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="register-input"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <Label htmlFor="confirmPassword" className="register-label">
                      {t("confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="register-input"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <Label htmlFor="location" className="register-label">
                      {t("location")}
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder={t("placeholders.location")}
                      className="register-input"
                      required
                    />
                  </div>
                  <div className="register-role-section">
                    <Label className="register-label">{t("role")}</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => handleRoleChange(value as UserRole)}
                      className="register-role-list"
                    >
                      <div className="register-role-option">
                        <RadioGroupItem value="Individ" id="individ" />
                        <Label htmlFor="individ" className="register-role-label">
                          <div className="register-role-name">{t("roles.individual")}</div>
                          <div className="register-role-description">
                            {t("roles.individualDesc")}
                          </div>
                        </Label>
                      </div>
                      <div className="register-role-option">
                        <RadioGroupItem value="OJQ" id="ojq" />
                        <Label htmlFor="ojq" className="register-role-label">
                          <div className="register-role-name">{t("roles.ngo")}</div>
                          <div className="register-role-description">{t("roles.ngoDesc")}</div>
                        </Label>
                      </div>
                      <div className="register-role-option">
                        <RadioGroupItem value="Ndërmarrje Sociale" id="ndermarrje" />
                        <Label htmlFor="ndermarrje" className="register-role-label">
                          <div className="register-role-name">{t("roles.socialEnterprise")}</div>
                          <div className="register-role-description">
                            {t("roles.socialEnterpriseDesc")}
                          </div>
                        </Label>
                      </div>
                      <div className="register-role-option">
                        <RadioGroupItem value="Kompani" id="kompani" />
                        <Label htmlFor="kompani" className="register-role-label">
                          <div className="register-role-name">{t("roles.company")}</div>
                          <div className="register-role-description">{t("roles.companyDesc")}</div>
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
                      <div className="register-field">
                        <Label htmlFor="organization_name" className="register-label">
                          {t("orgName")}
                        </Label>
                        <Input
                          id="organization_name"
                          name="organization_name"
                          value={formData.organization_name}
                          onChange={handleChange}
                          placeholder={t("placeholders.orgName")}
                          className="register-input"
                          required
                        />
                      </div>
                      <div className="register-field">
                        <Label htmlFor="organization_description" className="register-label">
                          {t("orgDesc")}
                        </Label>
                        <Textarea
                          id="organization_description"
                          name="organization_description"
                          value={formData.organization_description}
                          onChange={handleChange}
                          placeholder={t("placeholders.orgDesc")}
                          className="register-input register-textarea"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="register-field">
                        <Label htmlFor="primary_interest" className="register-label">
                          {t("primaryInterest")}
                        </Label>
                        <Input
                          id="primary_interest"
                          name="primary_interest"
                          value={formData.primary_interest}
                          onChange={handleChange}
                          placeholder={t("placeholders.primaryInterest")}
                          className="register-input"
                          required
                        />
                      </div>
                      <div className="register-field">
                        <Label htmlFor="contact_person" className="register-label">
                          {t("contactPerson")}
                        </Label>
                        <Input
                          id="contact_person"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder={t("placeholders.contactPersonName")}
                          className="register-input"
                          required
                        />
                      </div>

                      <div className="register-field">
                        <Label htmlFor="contact_email" className="register-label">
                          {t("contactEmail")}
                        </Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          placeholder={t("placeholders.contactPersonEmail")}
                          className="register-input"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="register-individual-step">
                      <div className="register-individual-icon">
                        <svg
                          className="register-individual-icon-svg"
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
                      <h3 className="register-individual-title">{t("readyForNext")}</h3>
                      <p className="register-individual-description">{t("noExtraInfo")}</p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-6">
                    <div className="register-checkbox-row">
                      <Checkbox
                        id="terms"
                        name="terms"
                        checked={formData.terms}
                        onCheckedChange={(checked) => updateFormData({ terms: checked as boolean })}
                        required
                        className="register-checkbox"
                      />
                      <div className="flex-1">
                        <Label htmlFor="terms" className="register-checkbox-label">
                          {t("agreeTo")}{" "}
                          <Link href="/legal/terms" className="register-inline-link">
                            {t("termsOfUse")}
                          </Link>{" "}
                          {t("and")}{" "}
                          <Link href="/privatesia" className="register-inline-link">
                            {t("privacyPolicy")}
                          </Link>
                        </Label>
                      </div>
                    </div>
                    <div className="register-checkbox-row">
                      <Checkbox
                        id="newsletter"
                        name="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) =>
                          updateFormData({ newsletter: checked as boolean })
                        }
                        className="register-checkbox"
                      />
                      <div className="flex-1">
                        <Label htmlFor="newsletter" className="register-checkbox-label">
                          {t("newsletter")}
                        </Label>
                        <p className="register-checkbox-note">{t("newsletterNote")}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="register-error">
                  <div className="register-error-text">{error}</div>
                </div>
              )}

              <div className="register-actions">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="register-secondary-button"
                  >
                    {t("back")}
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    className="register-primary-button"
                    onClick={handleNextStep}
                  >
                    {t("continue")}
                  </Button>
                ) : (
                  <Button type="submit" className="register-primary-button" disabled={loading}>
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
          <CardFooter className="register-footer">
            <div className="register-footer-text">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="register-inline-link register-footer-link">
                {t("loginHere")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
