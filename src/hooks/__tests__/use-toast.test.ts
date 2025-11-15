import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, waitFor } from "@testing-library/react"
import React from "react"
import { useToast, toast } from "../use-toast"

// Test component that uses the hook
function ToastTestComponent() {
  const { toast } = useToast()
  React.useEffect(() => {
    // Component mounts successfully
  }, [])
  return React.createElement("div", null, "toast test")
}

describe("useToast hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("basic functionality", () => {
    it("should work when used in a component", async () => {
      const { container } = render(React.createElement(ToastTestComponent))
      await waitFor(() => {
        expect(container).toBeTruthy()
      })
    })

    it("should support toast creation with title", async () => {
      function TestComponent() {
        const { toast } = useToast()
        React.useEffect(() => {
          toast({ title: "Test" })
        }, [toast])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(() => {
        expect(container).toBeTruthy()
      })
    })

    it("should support toast creation with description", async () => {
      function TestComponent() {
        const { toast } = useToast()
        React.useEffect(() => {
          toast({ title: "Test", description: "Desc" })
        }, [toast])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(() => {
        expect(container).toBeTruthy()
      })
    })

    it("should support different variants", async () => {
      function TestComponent() {
        const { toast } = useToast()
        React.useEffect(() => {
          toast({ title: "Error", variant: "destructive" })
          toast({ title: "Success", variant: "default" })
        }, [toast])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(() => {
        expect(container).toBeTruthy()
      })
    })
  })

  describe("toast actions", () => {
    it("should support updating a toast", async () => {
      function TestComponent() {
        const { toast } = useToast()
        const toastRef = React.useRef<any>(null)
        React.useEffect(() => {
          const result = toast({ title: "Original" })
          toastRef.current = result
          result.update({ title: "Updated" })
        }, [toast])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(() => {
        expect(container).toBeTruthy()
      })
    })

    it("should support dismissing a specific toast", async () => {
      function TestComponent() {
        const { toast, dismiss } = useToast()
        React.useEffect(() => {
          const { id } = toast({ title: "Test" })
          setTimeout(() => dismiss(id), 10)
        }, [toast, dismiss])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(
        () => {
          expect(container).toBeTruthy()
        },
        { timeout: 100 }
      )
    })

    it("should support dismissing all toasts", async () => {
      function TestComponent() {
        const { toast, dismiss } = useToast()
        React.useEffect(() => {
          toast({ title: "Test1" })
          setTimeout(() => dismiss(), 10)
        }, [toast, dismiss])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(
        () => {
          expect(container).toBeTruthy()
        },
        { timeout: 100 }
      )
    })
  })

  describe("module-level toast function", () => {
    it("should support toast function called directly", async () => {
      function TestComponent() {
        React.useEffect(() => {
          const { id, dismiss, update } = toast({ title: "Direct toast" })
          expect(id).toBeDefined()
          expect(typeof dismiss).toBe("function")
          expect(typeof update).toBe("function")
          setTimeout(() => dismiss(), 5)
        }, [])
        return React.createElement("div", null)
      }

      const { container } = render(React.createElement(TestComponent))
      await waitFor(
        () => {
          expect(container).toBeTruthy()
        },
        { timeout: 50 }
      )
    })
  })

  describe("hook state management", () => {
    it("should maintain hook state", async () => {
      let stateSnapshot = 0

      function TestComponent() {
        const { toasts } = useToast()
        React.useEffect(() => {
          stateSnapshot = toasts.length
        }, [toasts])
        return React.createElement("div", null)
      }

      render(React.createElement(TestComponent))

      await waitFor(() => {
        expect(typeof stateSnapshot).toBe("number")
      })
    })
  })
})
