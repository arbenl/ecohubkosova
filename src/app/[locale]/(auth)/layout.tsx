import type { ReactNode } from "react"
import { Link } from "@/i18n/routing"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <header className="auth-shell-header">
        <Link href="/" className="auth-shell-brand" aria-label="EcoHub Kosova">
          <span className="auth-shell-brand-mark" aria-hidden="true" />
          <span className="auth-shell-brand-text">EcoHub Kosova</span>
        </Link>
      </header>
      <main className="auth-shell-main">{children}</main>
    </div>
  )
}
