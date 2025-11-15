import { describe, it, expect } from "vitest"
import {
  adminOrganizationUpdateSchema,
  adminOrganizationMemberUpdateSchema,
  adminUserUpdateSchema,
  adminListingUpdateSchema,
  adminArticleUpdateSchema,
} from "../admin"

describe("Admin Validation Schemas", () => {
  describe("adminOrganizationUpdateSchema", () => {
    it("validates correct organization update", () => {
      const validInput = {
        emri: "Valid Organization",
        pershkrimi: "A valid organization description",
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "john@org.com",
        vendndodhja: "Prishtina",
        lloji: "OJQ",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects emri shorter than 3 characters", () => {
      const invalidInput = {
        emri: "AB",
        pershkrimi: "A valid organization description",
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "john@org.com",
        vendndodhja: "Prishtina",
        lloji: "OJQ",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects emri longer than 150 characters", () => {
      const invalidInput = {
        emri: "A".repeat(151),
        pershkrimi: "A valid organization description",
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "john@org.com",
        vendndodhja: "Prishtina",
        lloji: "OJQ",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi shorter than 10 characters", () => {
      const invalidInput = {
        emri: "Valid Organization",
        pershkrimi: "Too short",
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "john@org.com",
        vendndodhja: "Prishtina",
        lloji: "OJQ",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi longer than 2000 characters", () => {
      const invalidInput = {
        emri: "Valid Organization",
        pershkrimi: "A".repeat(2001),
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "john@org.com",
        vendndodhja: "Prishtina",
        lloji: "OJQ",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid email_kontakti", () => {
      const invalidInput = {
        emri: "Valid Organization",
        pershkrimi: "A valid organization description",
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "invalid-email",
        vendndodhja: "Prishtina",
        lloji: "OJQ",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts all valid organization types", () => {
      const types = ["OJQ", "Ndërmarrje Sociale", "Kompani"]

      types.forEach((type) => {
        const validInput = {
          emri: "Valid Organization",
          pershkrimi: "A valid organization description",
          interesi_primar: "Environment",
          person_kontakti: "John Doe",
          email_kontakti: "john@org.com",
          vendndodhja: "Prishtina",
          lloji: type,
          eshte_aprovuar: true,
        }
        const result = adminOrganizationUpdateSchema.safeParse(validInput)
        expect(result.success).toBe(true)
      })
    })

    it("rejects invalid organization type", () => {
      const invalidInput = {
        emri: "Valid Organization",
        pershkrimi: "A valid organization description",
        interesi_primar: "Environment",
        person_kontakti: "John Doe",
        email_kontakti: "john@org.com",
        vendndodhja: "Prishtina",
        lloji: "InvalidType",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe("adminOrganizationMemberUpdateSchema", () => {
    it("validates correct member update", () => {
      const validInput = {
        roli_ne_organizate: "Coordinator",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationMemberUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects roli_ne_organizate shorter than 2 characters", () => {
      const invalidInput = {
        roli_ne_organizate: "A",
        eshte_aprovuar: true,
      }
      const result = adminOrganizationMemberUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects roli_ne_organizate longer than 150 characters", () => {
      const invalidInput = {
        roli_ne_organizate: "A".repeat(151),
        eshte_aprovuar: true,
      }
      const result = adminOrganizationMemberUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both true and false for eshte_aprovuar", () => {
      const validInput1 = {
        roli_ne_organizate: "Coordinator",
        eshte_aprovuar: true,
      }
      const result1 = adminOrganizationMemberUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        roli_ne_organizate: "Coordinator",
        eshte_aprovuar: false,
      }
      const result2 = adminOrganizationMemberUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })
  })

  describe("adminUserUpdateSchema", () => {
    it("validates correct user update", () => {
      const validInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        vendndodhja: "Prishtina",
        roli: "Individ",
        eshte_aprovuar: true,
      }
      const result = adminUserUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects emri_i_plote shorter than 3 characters", () => {
      const invalidInput = {
        emri_i_plote: "AB",
        email: "john@example.com",
        vendndodhja: "Prishtina",
        roli: "Individ",
        eshte_aprovuar: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects emri_i_plote longer than 150 characters", () => {
      const invalidInput = {
        emri_i_plote: "A".repeat(151),
        email: "john@example.com",
        vendndodhja: "Prishtina",
        roli: "Individ",
        eshte_aprovuar: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid email", () => {
      const invalidInput = {
        emri_i_plote: "John Doe",
        email: "invalid-email",
        vendndodhja: "Prishtina",
        roli: "Individ",
        eshte_aprovuar: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts all valid user roles", () => {
      const roles = ["Individ", "OJQ", "Ndërmarrje Sociale", "Kompani", "Admin"]

      roles.forEach((role) => {
        const validInput = {
          emri_i_plote: "John Doe",
          email: "john@example.com",
          vendndodhja: "Prishtina",
          roli: role,
          eshte_aprovuar: true,
        }
        const result = adminUserUpdateSchema.safeParse(validInput)
        expect(result.success).toBe(true)
      })
    })

    it("rejects invalid user role", () => {
      const invalidInput = {
        emri_i_plote: "John Doe",
        email: "john@example.com",
        vendndodhja: "Prishtina",
        roli: "InvalidRole",
        eshte_aprovuar: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe("adminListingUpdateSchema", () => {
    it("validates correct listing update", () => {
      const validInput = {
        titulli: "Valid Title",
        pershkrimi: "A valid description for listing",
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result = adminListingUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects titulli shorter than 3 characters", () => {
      const invalidInput = {
        titulli: "AB",
        pershkrimi: "A valid description for listing",
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects titulli longer than 150 characters", () => {
      const invalidInput = {
        titulli: "A".repeat(151),
        pershkrimi: "A valid description for listing",
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi shorter than 10 characters", () => {
      const invalidInput = {
        titulli: "Valid Title",
        pershkrimi: "Too short",
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects pershkrimi longer than 2000 characters", () => {
      const invalidInput = {
        titulli: "Valid Title",
        pershkrimi: "A".repeat(2001),
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects negative price", () => {
      const invalidInput = {
        titulli: "Valid Title",
        pershkrimi: "A valid description for listing",
        kategori: "Agriculture",
        cmimi: -10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both 'shes' and 'blej' for lloji_listimit", () => {
      const validInput1 = {
        titulli: "Valid Title",
        pershkrimi: "A valid description for listing",
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "shes",
        eshte_aprovuar: true,
      }
      const result1 = adminListingUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        titulli: "Valid Title",
        pershkrimi: "A valid description for listing",
        kategori: "Agriculture",
        cmimi: 10.5,
        njesia: "kg",
        sasia: "100",
        vendndodhja: "Prishtina",
        lloji_listimit: "blej",
        eshte_aprovuar: true,
      }
      const result2 = adminListingUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })
  })

  describe("adminArticleUpdateSchema", () => {
    it("validates correct article update", () => {
      const validInput = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects titulli shorter than 5 characters", () => {
      const invalidInput = {
        titulli: "Test",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects titulli longer than 180 characters", () => {
      const invalidInput = {
        titulli: "A".repeat(181),
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects permbajtja shorter than 20 characters", () => {
      const invalidInput = {
        titulli: "Valid Article Title is Long",
        permbajtja: "Too short content",
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects permbajtja longer than 10000 characters", () => {
      const invalidInput = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A".repeat(10001),
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both true and false for eshte_publikuar", () => {
      const validInput1 = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result1 = adminArticleUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: false,
        tags: ["tag1", "tag2"],
        foto_kryesore: null,
      }
      const result2 = adminArticleUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })

    it("accepts null tags", () => {
      const validInput = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: null,
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects tags array with more than 15 items", () => {
      const invalidInput = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: Array.from({ length: 16 }, (_, i) => `tag${i + 1}`),
        foto_kryesore: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid foto_kryesore URL", () => {
      const invalidInput = {
        titulli: "Valid Article Title is Long",
        permbajtja: "A valid article content with good length",
        kategori: "Education",
        eshte_publikuar: true,
        tags: ["tag1", "tag2"],
        foto_kryesore: "not-a-url",
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})
