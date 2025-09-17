import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { AuthTestResponseSchema } from "@/schemas/auth";

/**
 * @auth bearer
 * @response AuthTestResponseSchema:Authentication successful
 * @responseSet auth
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
