import { describe, it, expect } from "vitest"
import {
  userProfileUpdateSchema,
  organizationProfileUpdateSchema,
} from "../profile"

describe("Profile Validation Schemas", () => {
  describe("userProfileUpdateSchema", () => {
    it("validates correct user profile update", () => {
      const validInput = {
        emri_i_plote: "John Doe",
        vendndodhja: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows empty vendndodhja (optional)", () => {
      const validInput = {
        emri_i_plote: "John Doe",
        vendndodhja: "",
      }
      const result = userProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows vendndodhja to be omitted", () => {
      const validInput = {
        emri_i_plote: "John Doe",
      }
      const result = userProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing emri_i_plote", () => {
      const invalidInput = {
        vendndodhja: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("emri_i_plote"))).toBe(true)
      }
    })

    it("rejects emri_i_plote shorter than 2 characters", () => {
      const invalidInput = {
        emri_i_plote: "J",
        vendndodhja: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects emri_i_plote longer than 120 characters", () => {
      const invalidInput = {
        emri_i_plote: "A".repeat(121),
        vendndodhja: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects vendndodhja longer than 240 characters", () => {
      const invalidInput = {
        emri_i_plote: "John Doe",
        vendndodhja: "A".repeat(241),
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("trims whitespace from emri_i_plote", () => {
      const input = {
        emri_i_plote: "  John Doe  ",
        vendndodhja: "  Prishtina  ",
      }
      const result = userProfileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.emri_i_plote).toBe("John Doe")
        expect(result.data.vendndodhja).toBe("Prishtina")
      }
    })
  })

  describe("organizationProfileUpdateSchema", () => {
    it("validates correct organization profile update", () => {
      const validInput = {
        emri: "My Organization",
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing emri", () => {
      const invalidInput = {
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects emri shorter than 2 characters", () => {
      const invalidInput = {
        emri: "A",
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects emri longer than 120 characters", () => {
      const invalidInput = {
        emri: "A".repeat(121),
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi shorter than 10 characters", () => {
      const invalidInput = {
        emri: "My Organization",
        pershkrimi: "Short",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi longer than 500 characters", () => {
      const invalidInput = {
        emri: "My Organization",
        pershkrimi: "A".repeat(501),
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid email_kontakti", () => {
      const invalidInput = {
        emri: "My Organization",
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        email_kontakti: "invalid-email",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing person_kontakti", () => {
      const invalidInput = {
        emri: "My Organization",
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing email_kontakti", () => {
      const invalidInput = {
        emri: "My Organization",
        pershkrimi: "This is a valid description",
        interesi_primar: "Environment",
        person_kontakti: "Jane Doe",
        vendndodhja: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("allows interesi_primar to be empty or omitted", () => {
      const validInput1 = {
        emri: "My Organization",
        pershkrimi: "This is a valid description",
        interesi_primar: "",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result1 = organizationProfileUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        emri: "My Organization",
        pershkrimi: "This is a valid description",
        person_kontakti: "Jane Doe",
        email_kontakti: "jane@org.com",
        vendndodhja: "Prishtina",
      }
      const result2 = organizationProfileUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })

    it("trims whitespace from all string fields", () => {
      const input = {
        emri: "  My Organization  ",
        pershkrimi: "  This is a valid description  ",
        interesi_primar: "  Environment  ",
        person_kontakti: "  Jane Doe  ",
        email_kontakti: "  jane@org.com  ",
        vendndodhja: "  Prishtina  ",
      }
      const result = organizationProfileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.emri).toBe("My Organization")
        expect(result.data.person_kontakti).toBe("Jane Doe")
        expect(result.data.email_kontakti).toBe("jane@org.com")
      }
    })
  })
})
