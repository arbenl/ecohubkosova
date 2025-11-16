import { describe, it, expect } from "vitest"
import { listingCreateSchema } from "../listings"

describe("Listings Validation Schema", () => {
  describe("listingCreateSchema", () => {
    it("validates correct listing creation", () => {
      const validInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("validates listing without price", () => {
      const validInput = {
        titulli: "Volunteer Needed",
        pershkrimi: "We need volunteers for our community project",
        kategori: "Services",
        njesia: "hours",
        vendndodhja: "Prishtina",
        sasia: "10",
        lloji_listimit: "blej",
      }
      const result = listingCreateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects titulli shorter than 3 characters", () => {
      const invalidInput = {
        titulli: "AB",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi shorter than 10 characters", () => {
      const invalidInput = {
        titulli: "Apples",
        pershkrimi: "Short",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing kategori", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects empty kategori", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects negative price", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: -5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts price of 0", () => {
      const validInput = {
        titulli: "Free Item",
        pershkrimi: "This is a free item to give away",
        kategori: "Other",
        cmimi: 0,
        njesia: "piece",
        vendndodhja: "Prishtina",
        sasia: "1",
        lloji_listimit: "blej",
      }
      const result = listingCreateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects missing njesia", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects empty njesia", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects vendndodhja shorter than 2 characters", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "P",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects missing sasia", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects empty sasia", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid lloji_listimit", () => {
      const invalidInput = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "invalid",
      }
      const result = listingCreateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both 'shes' and 'blej' values for lloji_listimit", () => {
      const validInput1 = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result1 = listingCreateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: 5.99,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "blej",
      }
      const result2 = listingCreateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })

    it("converts string price to number", () => {
      const input = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: "5.99",
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.cmimi).toBe("number")
        expect(result.data.cmimi).toBe(5.99)
      }
    })

    it("handles undefined price as optional", () => {
      const input = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: undefined,
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("handles empty string price as optional", () => {
      const input = {
        titulli: "Organic Apples",
        pershkrimi: "Fresh organic apples from our farm",
        kategori: "Agriculture",
        cmimi: "",
        njesia: "kg",
        vendndodhja: "Prishtina",
        sasia: "100",
        lloji_listimit: "shes",
      }
      const result = listingCreateSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })
})
