import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * Test authentication
 * @description Test endpoint to verify JWT bearer token authentication
 * @auth bearer
 * @response AuthTestResponseSchema:Authentication successful
 * @responseSet auth
 * @tag Authentication
 * @openapi
 */
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Authentication successful",
    userId,
  });
}
