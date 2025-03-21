import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { verifyAuth, getTokenFromHeader } from "@/lib/auth"

// Add paths that should be protected by authentication
const protectedPaths = ["/dashboard", "/api/fraud"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((prefix) => path.startsWith(prefix))

  if (isProtectedPath) {
    // For API routes, check Authorization header
    if (path.startsWith("/api/")) {
      const authHeader = request.headers.get("authorization")
      const token = getTokenFromHeader(authHeader)

      if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }

      const payload = await verifyAuth(token)

      if (!payload) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }
    }
    // For page routes, we'll let the client-side handle auth
    // This is just a fallback in case someone tries to access directly
    else {
      // In a real app, you would verify the cookie/session here
      // For this demo, we'll just let the client-side handle it
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/fraud/:path*"],
}

