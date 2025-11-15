// Update: src/app/page.tsx
import { redirect } from "next/navigation"

export default async function HomeRedirect() {
  // Just redirect to auth - let the route handler or auth flow handle signout
  redirect("/auth/kycu")
}