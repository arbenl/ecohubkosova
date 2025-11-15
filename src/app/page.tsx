// Update: src/app/page.tsx
import { redirect } from "next/navigation"

export default async function HomeRedirect() {
  // Redirect to landing page to let users explore before auth
  redirect("/home")
}