import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()

    // Forward the request to the backend API
    const response = await fetch(`${process.env.BACKEND_URL}/api/fraud/transactions?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

