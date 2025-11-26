/**
 * Regression tests for safeJsonb - prevents double-parsing crash
 *
 * Root cause: postgres-js auto-parses JSONB, then Drizzle's jsonb() tried to parse again.
 * This caused: "SyntaxError: Unexpected non-whitespace character after JSON at position 1034"
 *
 * These tests ensure the fix remains stable across:
 * - Already-parsed objects from postgres-js
 * - String values that need parsing
 * - Invalid JSON that should fallback gracefully
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { createSafeJsonbConfig } from "./safe-jsonb"

describe("safeJsonb - regression tests for JSONB double-parse crash", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe("fromDriver - reading from database", () => {
    it("should handle already-parsed object (postgres-js pre-parsed)", () => {
      const config = createSafeJsonbConfig<{ foo: string }>("test_metadata")
      const mockParsedObject = { foo: "bar", nested: { key: "value" } }

      // Simulate postgres-js returning already-parsed object
      const result = config.fromDriver(mockParsedObject)

      expect(result).toEqual(mockParsedObject)
      expect(result).toBe(mockParsedObject) // Should be same reference
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it("should parse valid JSON string", () => {
      const config = createSafeJsonbConfig<{ count: number }>("test_metadata")
      const jsonString = '{"count": 42, "status": "active"}'

      const result = config.fromDriver(jsonString)

      expect(result).toEqual({ count: 42, status: "active" })
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it("should handle invalid JSON string gracefully (no crash)", () => {
      const config = createSafeJsonbConfig("test_metadata")
      // This is the pattern that caused position 1034 crash
      const invalidJson = '{"valid":"start"' + "x".repeat(1000) + "invalid_continuation"

      const result = config.fromDriver(invalidJson)

      expect(result).toEqual({}) // Fallback to empty object
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[safeJsonb] Failed to parse JSONB value"),
        expect.objectContaining({
          valueLength: invalidJson.length,
          position1034: expect.any(String),
        })
      )
    })

    it("should handle null gracefully", () => {
      const config = createSafeJsonbConfig("test_metadata")

      // @ts-expect-error Testing runtime null handling
      const result = config.fromDriver(null)

      expect(result).toEqual({})
      // null is typeof 'object' but fails the null check, so warns
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[safeJsonb] Unexpected value type"),
        "object"
      )
    })

    it("should handle undefined gracefully", () => {
      const config = createSafeJsonbConfig("test_metadata")

      // @ts-expect-error Testing runtime undefined handling
      const result = config.fromDriver(undefined)

      expect(result).toEqual({})
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[safeJsonb] Unexpected value type"),
        "undefined"
      )
    })

    it("should handle empty string as invalid JSON", () => {
      const config = createSafeJsonbConfig("test_metadata")

      const result = config.fromDriver("")

      expect(result).toEqual({})
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[safeJsonb] Failed to parse JSONB value"),
        expect.any(Object)
      )
    })

    it("should handle number type gracefully", () => {
      const config = createSafeJsonbConfig("test_metadata")

      // @ts-expect-error Testing runtime type safety
      const result = config.fromDriver(12345)

      expect(result).toEqual({})
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[safeJsonb] Unexpected value type"),
        "number"
      )
    })

    it("should not mutate input object", () => {
      const config = createSafeJsonbConfig<{ data: string }>("test_metadata")
      const originalObject = { data: "test", immutable: true }
      const originalCopy = { ...originalObject }

      config.fromDriver(originalObject)

      expect(originalObject).toEqual(originalCopy)
    })

    it("should handle complex nested objects", () => {
      const config = createSafeJsonbConfig("test_metadata")
      const complexObject = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, 3],
              nullValue: null,
              boolValue: true,
            },
          },
        },
      }

      const result = config.fromDriver(complexObject)

      expect(result).toEqual(complexObject)
    })

    it("should handle large JSON at position ~1034 (original bug location)", () => {
      const config = createSafeJsonbConfig("test_metadata")
      // Create JSON that's valid up to position ~1034, then breaks
      const validPart = JSON.stringify({ data: "x".repeat(1000) })
      const jsonString = validPart.slice(0, 1034) + "BREAK" + validPart.slice(1034)

      const result = config.fromDriver(jsonString)

      expect(result).toEqual({})
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[safeJsonb] Failed to parse JSONB value"),
        expect.objectContaining({
          error: expect.any(Error),
          valueLength: jsonString.length,
        })
      )
    })
  })

  describe("toDriver - writing to database", () => {
    it("should stringify objects for database insertion", () => {
      const config = createSafeJsonbConfig<{ foo: string }>("test_metadata")
      const data = { foo: "bar", count: 42 }

      const result = config.toDriver(data)

      expect(result).toBe('{"foo":"bar","count":42}')
      expect(typeof result).toBe("string")
    })

    it("should handle empty objects", () => {
      const config = createSafeJsonbConfig("test_metadata")

      const result = config.toDriver({})

      expect(result).toBe("{}")
    })

    it("should handle nested objects", () => {
      const config = createSafeJsonbConfig("test_metadata")
      const nested = { a: { b: { c: "deep" } } }

      const result = config.toDriver(nested)

      expect(result).toBe('{"a":{"b":{"c":"deep"}}}')
      expect(() => JSON.parse(result)).not.toThrow()
    })
  })

  describe("dataType - schema definition", () => {
    it("should return jsonb as dataType", () => {
      const config = createSafeJsonbConfig("test_metadata")

      expect(config.dataType()).toBe("jsonb")
    })
  })

  describe("type safety", () => {
    it("should preserve TypeScript generic types", () => {
      interface TestMetadata {
        userId: string
        timestamp: number
      }

      const config = createSafeJsonbConfig<TestMetadata>("test_metadata")
      const data: TestMetadata = { userId: "abc123", timestamp: 1234567890 }

      const result = config.fromDriver(data)

      // TypeScript should infer correct type
      expect(result.userId).toBe("abc123")
      expect(result.timestamp).toBe(1234567890)
    })
  })
})
