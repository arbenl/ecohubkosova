import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import UsersClientPage from "./users-client-page"

const useAdminUsersMock = vi.fn()

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock("@/hooks/use-admin-users", () => ({
  useAdminUsers: () => useAdminUsersMock(),
}))

vi.mock("./components/user-table", () => ({
  UserTable: ({ users }: { users: Array<{ id: string; full_name: string }> }) => (
    <div data-testid="user-table">{users.map((u) => u.full_name).join(",")}</div>
  ),
}))

vi.mock("./components/user-edit-modal", () => ({
  UserEditModal: ({ user }: { user: { full_name: string } }) => (
    <div data-testid="user-edit-modal">{user.full_name}</div>
  ),
}))

vi.mock("./components/users-header", () => ({
  UsersHeader: () => <div data-testid="users-header" />,
}))

vi.mock("./components/users-search", () => ({
  UsersSearch: () => <div data-testid="users-search" />,
}))

vi.mock("./components/users-empty-state", () => ({
  UsersEmptyState: () => <div data-testid="users-empty-state">empty</div>,
}))

const baseUser = {
  id: "1",
  full_name: "Test Admin",
  email: "admin@test.com",
  location: "Prishtina",
  role: "Admin",
  is_approved: true,
}

describe("UsersClientPage", () => {
  beforeEach(() => {
    useAdminUsersMock.mockReturnValue({
      users: [baseUser],
      editingUser: null,
      setEditingUser: vi.fn(),
      handleDelete: vi.fn(),
      handleUpdate: vi.fn(),
    })
  })

  it("renders users table with provided users", () => {
    render(<UsersClientPage initialUsers={[baseUser]} initialError={null} locale="sq" />)

    expect(screen.getByTestId("users-header")).toBeInTheDocument()
    expect(screen.getByTestId("user-table")).toHaveTextContent("Test Admin")
  })

  it("shows edit modal when editingUser is set", () => {
    useAdminUsersMock.mockReturnValue({
      users: [baseUser],
      editingUser: baseUser,
      setEditingUser: vi.fn(),
      handleDelete: vi.fn(),
      handleUpdate: vi.fn(),
    })

    render(<UsersClientPage initialUsers={[baseUser]} initialError={null} locale="sq" />)

    expect(screen.getByTestId("user-edit-modal")).toBeInTheDocument()
  })
})
