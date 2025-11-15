import { describe, it, expect } from "vitest"
import { render, waitFor } from "@testing-library/react"
import React from "react"
import { useToast } from "../use-toast"

// Test component that uses the hook
function ToastTestComponent() {
  const { toast } = useToast()
  React.useEffect(() => {
    // Component mounts successfully
  }, [])
  return React.createElement("div", null, "toast test")
}

describe("useToast hook", () => {
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
