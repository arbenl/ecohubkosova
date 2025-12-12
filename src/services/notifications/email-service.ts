import { resend, isResendConfigured } from "@/lib/resend"
import ListingApprovedEmail from "@/emails/listing-approved"

const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ecohub-kosova.com"

export async function sendListingApprovedEmail({
  to,
  userName,
  listingTitle,
  listingId,
}: {
  to: string
  userName: string
  listingTitle: string
  listingId: string
}) {
  if (!isResendConfigured || !resend) {
    console.warn("[EmailService] RESEND_API_KEY missing. Skipping email send for:", listingTitle)
    return { success: false, error: "Configuration missing" }
  }

  try {
    const listingUrl = `${baseUrl}/marketplace/${listingId}`

    const { data, error } = await resend.emails.send({
      from: `EcoHub Kosova <${fromEmail}>`,
      to: [to],
      subject: "Listimi u Aprovua - EcoHub Kosova",
      react: ListingApprovedEmail({ userName, listingTitle, listingUrl }),
    })

    if (error) {
      console.error("[EmailService] Failed to send email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[EmailService] Exception sending email:", error)
    return { success: false, error }
  }
}
