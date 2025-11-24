import { describe, expect, it, beforeEach, vi } from "vitest"
import { fetchListings } from "./listings"

type CapturedQuery = {
  whereArg?: any
  offsetArgs?: any[]
}

const captured: CapturedQuery = {}

const mockRow = {
  listing: {
    id: "listing-1",
    title: "Metale të Përziera",
    description: "desc",
    price: null,
    currency: "EUR",
    category: "Metale",
    condition: "good",
    city: "Prishtinë",
    region: "Prishtinë",
    flow_type: "OFFER_SELL",
    pricing_type: null,
    visibility: "PUBLIC",
    status: "ACTIVE",
    eco_labels: null,
    tags: null,
    category_id: "cat-1",
    organization_id: "org-1",
    created_by_user_id: "user-1",
    created_at: new Date(),
    quantity: null,
    unit: "",
  },
  category_name_en: "Recyclable materials",
  category_name_sq: "Materiale të riciklueshme",
  organization_name: "REC-KOS",
  organization_email: "info@rec-kos.com",
  organization_contact_person: null,
  organization_metadata: null,
  owner_name: null,
  owner_email: null,
}

vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}))

vi.mock("drizzle-orm", () => {
  const simple = (kind: string) => (col: unknown, val?: unknown) => ({ kind, col, val })
  return {
    and: (...conds: any[]) => ({ kind: "and", conds }),
    or: (...conds: any[]) => ({ kind: "or", conds }),
    ilike: simple("ilike"),
    eq: simple("eq"),
    inArray: (col: unknown, vals: unknown[]) => ({ kind: "inArray", col, vals }),
    asc: simple("asc"),
    desc: simple("desc"),
    sql: (strings: TemplateStringsArray, ...vals: unknown[]) => ({ kind: "sql", strings, vals }),
    type: {} as never,
  }
})

vi.mock("@/lib/drizzle", () => {
  const mockQuery = {
    select: vi.fn(function () {
      return this
    }),
    from: vi.fn(function () {
      return this
    }),
    leftJoin: vi.fn(function () {
      return this
    }),
    where: vi.fn(function (arg: unknown) {
      captured.whereArg = arg
      return this
    }),
    orderBy: vi.fn(function () {
      return this
    }),
    limit: vi.fn(function () {
      return this
    }),
    offset: vi.fn(async function (...args: any[]) {
      captured.offsetArgs = args
      return [mockRow]
    }),
  }
  return {
    db: {
      get: vi.fn(() => mockQuery),
    },
  }
})

vi.mock("@/db/schema", () => ({
  ecoListings: {
    status: "status",
    visibility: "visibility",
    flow_type: "flow_type",
    title: "title",
    description: "description",
    category_id: "category_id",
    condition: "condition",
    city: "city",
    region: "region",
    created_at: "created_at",
  },
  ecoCategories: {
    slug: "cat_slug",
    name_en: "name_en",
    name_sq: "name_sq",
    id: "category_id",
  },
  ecoOrganizations: {
    id: "eco_org_id",
    organization_id: "organization_id",
    metadata: "metadata",
  },
  organizations: {
    name: "org_name",
    contact_email: "org_email",
    contact_person: "org_contact_person",
  },
  users: {
    full_name: "user_full",
    email: "user_email",
    id: "user_id",
  },
  marketplaceListings: {},
  organizationMembers: {},
}))

describe("fetchListings filter construction", () => {
  beforeEach(() => {
    captured.whereArg = undefined
    captured.offsetArgs = undefined
    vi.clearAllMocks()
  })

  it("treats 'all' category as no filter (only ACTIVE + PUBLIC)", async () => {
    await fetchListings({ category: "all" })
    const where = captured.whereArg as { kind: string; conds: any[] }
    expect(where.kind).toBe("and")
    expect(where.conds).toHaveLength(2)
    const cols = where.conds.map((c) => c.col)
    expect(cols).toContain("status")
    expect(cols).toContain("visibility")
  })

  it("applies category slug filter when provided", async () => {
    await fetchListings({ category: "recycled-metals" })
    const where = captured.whereArg as { conds: any[] }
    const slugFilter = where.conds.find((c) => c.col === "cat_slug")
    expect(slugFilter).toBeDefined()
    expect(slugFilter?.val).toBe("recycled-metals")
  })

  it("applies flowType filter when provided", async () => {
    await fetchListings({ flowType: "OFFER_SELL" })
    const where = captured.whereArg as { conds: any[] }
    const flowFilter = where.conds.find((c) => c.col === "flow_type")
    expect(flowFilter?.val).toBe("OFFER_SELL")
  })

  it("applies location filter to city and region via OR", async () => {
    await fetchListings({ location: "Prishtina" })
    const where = captured.whereArg as { conds: any[] }
    const locationFilter = where.conds.find((c) => c.kind === "or")
    expect(locationFilter).toBeDefined()
    expect(locationFilter?.conds?.some((c: any) => c.col === "city")).toBe(true)
    expect(locationFilter?.conds?.some((c: any) => c.col === "region")).toBe(true)
  })
})
