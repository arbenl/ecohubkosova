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
        emri_i_plote: "John Doe",
        email: "john@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing emri_i_plote", () => {
      const invalidInput = {
        email: "john@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects emri_i_plote shorter than 2 characters", () => {
      const invalidInput = {
        emri_i_plote: "J",
        email: "john@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid email", () => {
      const invalidInput = {
        emri_i_plote: "John Doe",
        email: "invalid-email",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects password shorter than 6 characters", () => {
      const invalidInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        password: "pass",
        vendndodhja: "Prishtina",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects vendndodhja shorter than 2 characters", () => {
      const invalidInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        password: "password123",
        vendndodhja: "P",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe("registrationSchema - Organization Roles", () => {
    it("validates correct organization registration (OJQ)", () => {
      const validInput = {
        emri_i_plote: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "OJQ",
        emri_organizates: "My Organization",
        pershkrimi_organizates: "A great organization",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects organization registration without required fields", () => {
      const invalidInput = {
        emri_i_plote: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "OJQ",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it("rejects missing emri_organizates for non-individual role", () => {
      const invalidInput = {
        emri_i_plote: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Kompani",
        pershkrimi_organizates: "Description",
        interesi_primar: "Tech",
        person_kontakti: "Jane",
        email_kontakti: "jane@example.com",
      }
      const result = registrationSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("emri_organizates"))).toBe(true)
      }
    })

    it("rejects all organization types without required fields", () => {
      const roles = ["OJQ", "Ndërmarrje Sociale", "Kompani"]

      roles.forEach((role) => {
        const invalidInput = {
          emri_i_plote: "Jane Doe",
          email: "jane@example.com",
          password: "password123",
          vendndodhja: "Prishtina",
          roli: role,
        }
        const result = registrationSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
      })
    })
  })

  describe("registrationSchema - Optional Fields", () => {
    it("allows newsletter field to be undefined for individuals", () => {
      const validInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows newsletter field to be true", () => {
      const validInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
        newsletter: true,
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows newsletter field to be false", () => {
      const validInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        password: "password123",
        vendndodhja: "Prishtina",
        roli: "Individ",
        newsletter: false,
      }
      const result = registrationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })
})
