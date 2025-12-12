/**
 * EcoHub Kosova – Structured Logger
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 *
 * A lightweight structured logging utility for production observability.
 * Outputs JSON in production for log aggregation tools (e.g., Vercel, Datadog).
 * Outputs human-readable format in development.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Minimum log level - can be configured via environment variable
const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info"
const IS_PRODUCTION = process.env.NODE_ENV === "production"

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

function formatError(error: unknown): LogEntry["error"] | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
    }
  }
  return undefined
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (error) {
    entry.error = formatError(error)
  }

  return entry
}

function outputLog(entry: LogEntry): void {
  const consoleMethod =
    entry.level === "error" ? console.error : entry.level === "warn" ? console.warn : console.log

  if (IS_PRODUCTION) {
    // JSON output for production log aggregation
    consoleMethod(JSON.stringify(entry))
  } else {
    // Human-readable output for development
    const levelEmoji = {
      debug: "🔍",
      info: "ℹ️ ",
      warn: "⚠️ ",
      error: "❌",
    }
    const prefix = `${levelEmoji[entry.level]} [${entry.level.toUpperCase()}]`

    if (entry.context) {
      consoleMethod(prefix, entry.message, entry.context)
    } else {
      consoleMethod(prefix, entry.message)
    }

    if (entry.error?.stack) {
      consoleMethod(entry.error.stack)
    }
  }
}

/**
 * Structured logger for the application.
 *
 * @example
 * // Basic usage
 * logger.info("User logged in", { userId: "123" })
 *
 * // Error logging with error object
 * logger.error("Failed to fetch data", { endpoint: "/api/users" }, error)
 *
 * // Debug (only shown when LOG_LEVEL=debug)
 * logger.debug("Processing item", { itemId: "456" })
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog("debug")) {
      outputLog(createLogEntry("debug", message, context))
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog("info")) {
      outputLog(createLogEntry("info", message, context))
    }
  },

  warn(message: string, context?: LogContext, error?: unknown): void {
    if (shouldLog("warn")) {
      outputLog(createLogEntry("warn", message, context, error))
    }
  },

  error(message: string, context?: LogContext, error?: unknown): void {
    if (shouldLog("error")) {
      outputLog(createLogEntry("error", message, context, error))
    }
  },

  /**
   * Create a child logger with preset context that will be included in all logs.
   *
   * @example
   * const authLogger = logger.child({ module: "auth" })
   * authLogger.info("Login attempt", { email: "user@example.com" })
   * // Output: { module: "auth", email: "user@example.com" }
   */
  child(baseContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext, error?: unknown) =>
        logger.warn(message, { ...baseContext, ...context }, error),
      error: (message: string, context?: LogContext, error?: unknown) =>
        logger.error(message, { ...baseContext, ...context }, error),
    }
  },
}

// Pre-configured loggers for common modules
export const authLogger = logger.child({ module: "auth" })
export const apiLogger = logger.child({ module: "api" })
export const dbLogger = logger.child({ module: "database" })
