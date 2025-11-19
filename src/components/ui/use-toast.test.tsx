import { reducer } from "./use-toast"

describe("reducer function", () => {
  it("returns undefined for unknown action", () => {
    const initialState = { toasts: [] }
    const action = { type: "UNKNOWN" as any }
    const result = reducer(initialState, action)
    expect(result).toBeUndefined()
  })

  it("adds toast on ADD_TOAST action", () => {
    const initialState = { toasts: [] }
    const action = {
      type: "ADD_TOAST" as const,
      toast: { id: "1", title: "Test toast" }
    }
    const result = reducer(initialState, action)
    expect(result.toasts).toHaveLength(1)
    expect(result.toasts[0]).toEqual(action.toast)
  })
})