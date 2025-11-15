export const SESSION_VERSION_COOKIE = "eco_session_version"
export const AUTH_STATE_COOKIE = "eco_auth_state"

const baseCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}

export const SESSION_VERSION_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 30,
}

export const SESSION_VERSION_COOKIE_CLEAR_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 0,
}

export const AUTH_STATE_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 7,
}
