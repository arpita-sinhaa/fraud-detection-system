import { jwtVerify } from "jose"

export async function verifyAuth(token) {
  try {
    // In a real app, you would use a proper secret key
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-development-only")

    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

export function getTokenFromHeader(authHeader | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.split(" ")[1]
}

