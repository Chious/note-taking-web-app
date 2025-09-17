import { NextResponse } from "next/server";
import { AuthRequestSchema } from "@/schemas/auth";

/**
 * @body AuthRequestSchema
 * @response 200:AuthResponseSchema:Authentication successful
 * @response 401:AuthResponseSchema:Invalid credentials
 * @response 400:AuthResponseSchema:Invalid request
 * @openapi
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = AuthRequestSchema.parse(body);

    // Get credentials from environment variables
    const validUsername = process.env.API_DOCS_USERNAME || "admin";
    const validPassword = process.env.API_DOCS_PASSWORD || "admin123";

    // Simple credential validation
    if (username === validUsername && password === validPassword) {
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("API docs auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request",
      },
      { status: 400 }
    );
  }
}
