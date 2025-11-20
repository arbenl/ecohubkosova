// Temporary logging for unhandled promise rejections in server/runtime.
// Controlled via ENABLE_UNHANDLED_LOGS to avoid chatty logs in normal operation.
if (process.env.ENABLE_UNHANDLED_LOGS === "true") {
   
  console.error("[UNHANDLED_LOGGER] Enabled unhandledRejection logging")

  process.on("unhandledRejection", (reason, promise) => {
     
    console.error("[UNHANDLED_REJECTION]", { reason, promise })
    if (reason instanceof Error && reason.stack) {
       
      console.error(reason.stack)
    }
  })
}
