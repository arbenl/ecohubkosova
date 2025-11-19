import { describe, it, expect } from "vitest"
import {
  userProfileUpdateSchema,
  organizationProfileUpdateSchema,
} from "../profile"

describe("Profile Validation Schemas", () => {
  describe("userProfileUpdateSchema", () => {
    it("validates correct user profile update", () => {
      const validInput = {
        full_name: "John Doe",
        location: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows empty location (optional)", () => {
      const validInput = {
        full_name: "John Doe",
        location: "",
      }
      const result = userProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("allows location to be omitted", () => {
      const validInput = {
        full_name: "John Doe",
      }
      const result = userProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing full_name", () => {
      const invalidInput = {
        location: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes("full_name"))).toBe(true)
      }
    })

    it("rejects full_name shorter than 2 characters", () => {
      const invalidInput = {
        full_name: "J",
        location: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects full_name longer than 120 characters", () => {
      const invalidInput = {
        full_name: "A".repeat(121),
        location: "Prishtina",
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects location longer than 240 characters", () => {
      const invalidInput = {
        full_name: "John Doe",
        location: "A".repeat(241),
      }
      const result = userProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("trims whitespace from full_name", () => {
      const input = {
        full_name: "  John Doe  ",
        location: "  Prishtina  ",
      }
      const result = userProfileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.full_name).toBe("John Doe")
        expect(result.data.location).toBe("Prishtina")
      }
    })
  })

  describe("organizationProfileUpdateSchema", () => {
    it("validates correct organization profile update", () => {
      const validInput = {
        name: "My Organization",
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing name", () => {
      const invalidInput = {
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects name shorter than 2 characters", () => {
      const invalidInput = {
        name: "A",
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects name longer than 120 characters", () => {
      const invalidInput = {
        name: "A".repeat(121),
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description shorter than 10 characters", () => {
      const invalidInput = {
        name: "My Organization",
        description: "Short",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description longer than 500 characters", () => {
      const invalidInput = {
        name: "My Organization",
        description: "A".repeat(501),
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid contact_email", () => {
      const invalidInput = {
        name: "My Organization",
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        contact_email: "invalid-email",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing contact_person", () => {
      const invalidInput = {
        name: "My Organization",
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing contact_email", () => {
      const invalidInput = {
        name: "My Organization",
        description: "This is a valid description",
        primary_interest: "Environment",
        contact_person: "Jane Doe",
        location: "Prishtina",
      }
      const result = organizationProfileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("allows primary_interest to be empty or omitted", () => {
      const validInput1 = {
        name: "My Organization",
        description: "This is a valid description",
        primary_interest: "",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result1 = organizationProfileUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        name: "My Organization",
        description: "This is a valid description",
        contact_person: "Jane Doe",
        contact_email: "jane@org.com",
        location: "Prishtina",
      }
      const result2 = organizationProfileUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })

    it("trims whitespace from all string fields", () => {
      const input = {
        name: "  My Organization  ",
        description: "  This is a valid description  ",
        primary_interest: "  Environment  ",
        contact_person: "  Jane Doe  ",
        contact_email: "  jane@org.com  ",
        location: "  Prishtina  ",
      }
      const result = organizationProfileUpdateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("My Organization")
        expect(result.data.contact_person).toBe("Jane Doe")
        expect(result.data.contact_email).toBe("jane@org.com")
      }
    })
  })
})
