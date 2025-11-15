import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAuthForm, useFormFields } from "@/hooks/use-auth-form"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

describe("useAuthForm", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuthForm())

    expect(result.current.error).toBe("")
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.message).toBeNull()
  })

  it("should handle successful form submission", async () => {
    const { result } = renderHook(() => useAuthForm())
    const mockFormAction = vi.fn().mockResolvedValueOnce({ success: true })
    const formData = new FormData()

    await act(async () => {
      await result.current.handleSubmit(mockFormAction, formData)
    })

    expect(mockFormAction).toHaveBeenCalledWith(formData)
    expect(result.current.error).toBe("")
  })

  it("should handle form submission with error", async () => {
    const { result } = renderHook(() => useAuthForm())
    const errorMessage = "Login failed"
    const mockFormAction = vi.fn().mockResolvedValueOnce({ error: errorMessage })
    const formData = new FormData()

    await act(async () => {
      await result.current.handleSubmit(mockFormAction, formData)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isSubmitting).toBe(false)
  })

  it("should handle form submission with message", async () => {
    const { result } = renderHook(() => useAuthForm())
    const message = "Please check your email"
    const mockFormAction = vi.fn().mockResolvedValueOnce({ message })
    const formData = new FormData()

    await act(async () => {
      await result.current.handleSubmit(mockFormAction, formData)
    })

    expect(result.current.error).toBe(message)
  })

  it("should handle form submission exception", async () => {
    const { result } = renderHook(() => useAuthForm())
    const mockFormAction = vi.fn().mockRejectedValueOnce(new Error("Network error"))
    const formData = new FormData()

    await act(async () => {
      await result.current.handleSubmit(mockFormAction, formData)
    })

    expect(result.current.error).toBe("Network error")
    expect(result.current.isSubmitting).toBe(false)
  })

  it("should set error manually", () => {
    const { result } = renderHook(() => useAuthForm())

    act(() => {
      result.current.setError("Custom error")
    })

    expect(result.current.error).toBe("Custom error")
  })
})

describe("useFormFields", () => {
  const initialState = {
    email: "",
    password: "",
    terms: false,
    role: "user",
  }

  it("should initialize with provided state", () => {
    const { result } = renderHook(() => useFormFields(initialState))

    expect(result.current.formData).toEqual(initialState)
  })

  it("should update text input field", () => {
    const { result } = renderHook(() => useFormFields(initialState))

    act(() => {
      const event = {
        target: {
          name: "email",
          value: "test@example.com",
          type: "text",
        },
      } as any

      result.current.handleChange(event)
    })

    expect(result.current.formData.email).toBe("test@example.com")
  })

  it("should handle checkbox input", () => {
    const { result } = renderHook(() => useFormFields(initialState))

    act(() => {
      const event = {
        target: {
          name: "terms",
          checked: true,
          type: "checkbox",
        },
      } as any

      result.current.handleChange(event)
    })

    expect(result.current.formData.terms).toBe(true)
  })

  it("should handle radio group changes", () => {
    const { result } = renderHook(() => useFormFields(initialState))

    act(() => {
      result.current.handleRadioChange("admin", "role")
    })

    expect(result.current.formData.role).toBe("admin")
  })

  it("should reset form to initial state", () => {
    const { result } = renderHook(() => useFormFields(initialState))

    act(() => {
      const event = {
        target: {
          name: "email",
          value: "test@example.com",
          type: "text",
        },
      } as any
      result.current.handleChange(event)
    })

    expect(result.current.formData.email).toBe("test@example.com")

    act(() => {
      result.current.resetForm()
    })

    expect(result.current.formData).toEqual(initialState)
  })

  it("should allow direct formData updates", () => {
    const { result } = renderHook(() => useFormFields(initialState))

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        email: "new@example.com",
      }))
    })

    expect(result.current.formData.email).toBe("new@example.com")
  })
})
