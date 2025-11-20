/**
 * Next.js instrumentation entry point.
 * Keep this file edge-safe; delegate Node-only work to a separate module.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return
  }

  const { registerNodeInstrumentation } = await import("./instrumentation.node")
  await registerNodeInstrumentation()
}
