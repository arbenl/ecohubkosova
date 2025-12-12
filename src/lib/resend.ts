import { Resend } from "resend"

// Create Resend client only if API key is available
// This prevents build-time errors when the key is not set
const apiKey = process.env.RESEND_API_KEY

export const resend = apiKey ? new Resend(apiKey) : null

export const isResendConfigured = !!apiKey
