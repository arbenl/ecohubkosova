import { describe, it, expect } from "vitest"
import { listingCreateSchema } from "../listings"

describe("Listings Validation Schema", () => {
  describe("listingCreateSchema", () => {
    it("validates correct listing creation", () => {
      const validInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("validates listing without price", () => {
      const validInput = {
        title: "Volunteer Needed",
        description: "We need volunteers for our community project",
        category: "Services",
        unit: "hours",
        location: "Prishtina",
        quantity: "10",
        listing_type: "blej",
      }
      const result = listingCreateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects title shorter than 3 characters", () => {
      const invalidInput = {
        title: "AB",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description shorter than 10 characters", () => {
      const invalidInput = {
        title: "Apples",
        description: "Short",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing category", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects empty category", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects negative price", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: -5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts price of 0", () => {
      const validInput = {
        title: "Free Item",
        description: "This is a free item to give away",
        category: "Other",
        price: 0,
        unit: "piece",
        location: "Prishtina",
        quantity: "1",
        listing_type: "blej",
      }
      const result = listingCreateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing unit", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects empty unit", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects location shorter than 2 characters", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "P",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing quantity", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects empty quantity", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid listing_type", () => {
      const invalidInput = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "invalid",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both 'shes' and 'blej' values for listing_type", () => {
      const validInput1 = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result1 = listingCreateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: 5.99,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "blej",
      }
      const result2 = listingCreateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })

    it("converts string price to number", () => {
      const input = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: "5.99",
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.price).toBe("number")
        expect(result.data.price).toBe(5.99)
      }
    })

    it("handles undefined price as optional", () => {
      const input = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: undefined,
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("handles empty string price as optional", () => {
      const input = {
        title: "Organic Apples",
        description: "Fresh organic apples from our farm",
        category: "Agriculture",
        price: "",
        unit: "kg",
        location: "Prishtina",
        quantity: "100",
        listing_type: "shes",
      }
      const result = listingCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })
})
