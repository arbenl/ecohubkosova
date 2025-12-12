import { describe, expect, it } from "vitest"
import { deleteUser, getUsers, updateUser } from "./actions"

describe("admin/users actions", () => {
  it("exposes user admin server actions", () => {
    expect(getUsers).toBeDefined()
    expect(deleteUser).toBeDefined()
    expect(updateUser).toBeDefined()
  })
})
