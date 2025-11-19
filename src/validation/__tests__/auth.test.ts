import { describe, it, expect } from "vitest"
import { loginSchema, registrationSchema } from "../auth"

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("validates correct login credentials", () => {
      const validInput = {
        email: "user@example.com",
        password: "password123",
      }
      const result = loginSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing email", () => {
      const invalidInput = {
        password: "password123",
      }
      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("email"))).toBe(true)
      }
    })

    it("rejects invalid email format", () => {
      const invalidInput = {
        email: "not-an-email",
        password: "password123",
      }
      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("email"))).toBe(true)
      }
    })

    it("rejects missing password", () => {
      const invalidInput = {
        email: "user@example.com",
      }
      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("password"))).toBe(true)
      }
    })

    it("rejects password shorter than 6 characters", () => {
      const invalidInput = {
        email: "user@example.com",
        password: "pass",
      }
      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("password"))).toBe(true)
      }
    })
  })

  describe("registrationSchema - Individual Role", () => {
    it("validates correct individual registration", () => {
      const validInput = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing full_name", () => {
      const invalidInput = {
        email: "john@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects full_name shorter than 2 characters", () => {
      const invalidInput = {
        full_name: "J",
        email: "john@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid email", () => {
      const invalidInput = {
        full_name: "John Doe",
        email: "invalid-email",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects password shorter than 6 characters", () => {
      const invalidInput = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "pass",
        location: "Prishtina",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects location shorter than 2 characters", () => {
      const invalidInput = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        location: "P",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe("registrationSchema - Organization Roles", () => {
    it("validates correct organization registration (OJQ)", () => {
      const validInput = {
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        location: "Prishtina",
        role: "OJQ",
        organization_name: "My Organization",
        organization_description: "A great organization",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects organization registration without required fields", () => {
      const invalidInput = {
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        location: "Prishtina",
        role: "OJQ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it("rejects missing organization_name for non-individual role", () => {
      const invalidInput = {
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Kompani",
        organization_description: "Description",
        primary_interest: "Tech",
        contact_person: "Jane",
        contact_email: "jane@example.com",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("organization_name"))).toBe(true)
      }
    })

    it("rejects all organization types without required fields", () => {
      const roles = ["OJQ", "Ndërmarrje Sociale", "Kompani"]

      roles.forEach((role) => {
        const invalidInput = {
          full_name: "Jane Doe",
          email: "jane@example.com",
          password: "password123",
          location: "Prishtina",
          role: role,
        }
        const result = registrationSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
      })
    })
  })

  describe("registrationSchema - Optional Fields", () => {
    it("allows newsletter field to be undefined for individuals", () => {
      const validInput = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows newsletter field to be true", () => {
      const validInput = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
        newsletter: true,
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows newsletter field to be false", () => {
      const validInput = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        location: "Prishtina",
        role: "Individ",
        newsletter: false,
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })
})
