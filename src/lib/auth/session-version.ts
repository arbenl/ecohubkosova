export const SESSION_VERSION_COOKIE = "eco_session_version"

const baseCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}

export const SESSION_VERSION_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export const SESSION_VERSION_COOKIE_CLEAR_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 0,
}
