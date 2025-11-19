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
        name: "Valid Organization",
        description: "A valid organization description",
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "john@org.com",
        location: "Prishtina",
        type: "OJQ",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects name shorter than 3 characters", () => {
      const invalidInput = {
        name: "AB",
        description: "A valid organization description",
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "john@org.com",
        location: "Prishtina",
        type: "OJQ",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects name longer than 150 characters", () => {
      const invalidInput = {
        name: "A".repeat(151),
        description: "A valid organization description",
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "john@org.com",
        location: "Prishtina",
        type: "OJQ",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description shorter than 10 characters", () => {
      const invalidInput = {
        name: "Valid Organization",
        description: "Too short",
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "john@org.com",
        location: "Prishtina",
        type: "OJQ",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description longer than 2000 characters", () => {
      const invalidInput = {
        name: "Valid Organization",
        description: "A".repeat(2001),
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "john@org.com",
        location: "Prishtina",
        type: "OJQ",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid contact_email", () => {
      const invalidInput = {
        name: "Valid Organization",
        description: "A valid organization description",
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "invalid-email",
        location: "Prishtina",
        type: "OJQ",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts all valid organization types", () => {
      const types = ["OJQ", "Ndërmarrje Sociale", "Kompani"]

      types.forEach((type) => {
        const validInput = {
          name: "Valid Organization",
          description: "A valid organization description",
          primary_interest: "Environment",
          contact_person: "John Doe",
          contact_email: "john@org.com",
          location: "Prishtina",
          type: type,
          is_approved: true,
        }
        const result = adminOrganizationUpdateSchema.safeParse(validInput)
        expect(result.success).toBe(true)
      })
    })

    it("rejects invalid organization type", () => {
      const invalidInput = {
        name: "Valid Organization",
        description: "A valid organization description",
        primary_interest: "Environment",
        contact_person: "John Doe",
        contact_email: "john@org.com",
        location: "Prishtina",
        type: "InvalidType",
        is_approved: true,
      }
      const result = adminOrganizationUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe("adminOrganizationMemberUpdateSchema", () => {
    it("validates correct member update", () => {
      const validInput = {
        role_in_organization: "Coordinator",
        is_approved: true,
      }
      const result = adminOrganizationMemberUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects role_in_organization shorter than 2 characters", () => {
      const invalidInput = {
        role_in_organization: "A",
        is_approved: true,
      }
      const result = adminOrganizationMemberUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects role_in_organization longer than 150 characters", () => {
      const invalidInput = {
        role_in_organization: "A".repeat(151),
        is_approved: true,
      }
      const result = adminOrganizationMemberUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both true and false for is_approved", () => {
      const validInput1 = {
        role_in_organization: "Coordinator",
        is_approved: true,
      }
      const result1 = adminOrganizationMemberUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        role_in_organization: "Coordinator",
        is_approved: false,
      }
      const result2 = adminOrganizationMemberUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })
  })

  describe("adminUserUpdateSchema", () => {
    it("validates correct user update", () => {
      const validInput = {
        full_name: "John Doe",
        email: "john@example.com",
        location: "Prishtina",
        role: "Individ",
        is_approved: true,
      }
      const result = adminUserUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects full_name shorter than 3 characters", () => {
      const invalidInput = {
        full_name: "AB",
        email: "john@example.com",
        location: "Prishtina",
        role: "Individ",
        is_approved: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects full_name longer than 150 characters", () => {
      const invalidInput = {
        full_name: "A".repeat(151),
        email: "john@example.com",
        location: "Prishtina",
        role: "Individ",
        is_approved: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid email", () => {
      const invalidInput = {
        full_name: "John Doe",
        email: "invalid-email",
        location: "Prishtina",
        role: "Individ",
        is_approved: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts all valid user roles", () => {
      const roles = ["Individ", "OJQ", "Ndërmarrje Sociale", "Kompani", "Admin"]

      roles.forEach((role) => {
        const validInput = {
          full_name: "John Doe",
          email: "john@example.com",
          location: "Prishtina",
          role: role,
          is_approved: true,
        }
        const result = adminUserUpdateSchema.safeParse(validInput)
        expect(result.success).toBe(true)
      })
    })

    it("rejects invalid user role", () => {
      const invalidInput = {
        full_name: "John Doe",
        email: "john@example.com",
        location: "Prishtina",
        role: "InvalidRole",
        is_approved: true,
      }
      const result = adminUserUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe("adminListingUpdateSchema", () => {
    it("validates correct listing update", () => {
      const validInput = {
        title: "Valid Title",
        description: "A valid description for listing",
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result = adminListingUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects title shorter than 3 characters", () => {
      const invalidInput = {
        title: "AB",
        description: "A valid description for listing",
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects title longer than 150 characters", () => {
      const invalidInput = {
        title: "A".repeat(151),
        description: "A valid description for listing",
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description shorter than 10 characters", () => {
      const invalidInput = {
        title: "Valid Title",
        description: "Too short",
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects description longer than 2000 characters", () => {
      const invalidInput = {
        title: "Valid Title",
        description: "A".repeat(2001),
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects negative price", () => {
      const invalidInput = {
        title: "Valid Title",
        description: "A valid description for listing",
        category: "Agriculture",
        price: -10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result = adminListingUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both 'shes' and 'blej' for listing_type", () => {
      const validInput1 = {
        title: "Valid Title",
        description: "A valid description for listing",
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "shes",
        is_approved: true,
      }
      const result1 = adminListingUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        title: "Valid Title",
        description: "A valid description for listing",
        category: "Agriculture",
        price: 10.5,
        unit: "kg",
        quantity: "100",
        location: "Prishtina",
        listing_type: "blej",
        is_approved: true,
      }
      const result2 = adminListingUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })
  })

  describe("adminArticleUpdateSchema", () => {
    it("validates correct article update", () => {
      const validInput = {
        title: "Valid Article Title is Long",
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects title shorter than 5 characters", () => {
      const invalidInput = {
        title: "Test",
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects title longer than 180 characters", () => {
      const invalidInput = {
        title: "A".repeat(181),
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects content shorter than 20 characters", () => {
      const invalidInput = {
        title: "Valid Article Title is Long",
        content: "Too short content",
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects content longer than 10000 characters", () => {
      const invalidInput = {
        title: "Valid Article Title is Long",
        content: "A".repeat(10001),
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("accepts both true and false for is_published", () => {
      const validInput1 = {
        title: "Valid Article Title is Long",
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result1 = adminArticleUpdateSchema.safeParse(validInput1)
      expect(result1.success).toBe(true)

      const validInput2 = {
        title: "Valid Article Title is Long",
        content: "A valid article content with good length",
        category: "Education",
        is_published: false,
        tags: ["tag1", "tag2"],
        featured_image: null,
      }
      const result2 = adminArticleUpdateSchema.safeParse(validInput2)
      expect(result2.success).toBe(true)
    })

    it("accepts null tags", () => {
      const validInput = {
        title: "Valid Article Title is Long",
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: null,
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("rejects tags array with more than 15 items", () => {
      const invalidInput = {
        title: "Valid Article Title is Long",
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: Array.from({ length: 16 }, (_, i) => `tag${i + 1}`),
        featured_image: null,
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("rejects invalid featured_image URL", () => {
      const invalidInput = {
        title: "Valid Article Title is Long",
        content: "A valid article content with good length",
        category: "Education",
        is_published: true,
        tags: ["tag1", "tag2"],
        featured_image: "not-a-url",
      }
      const result = adminArticleUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})
