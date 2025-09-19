import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, notes } from "@/lib/schema";
import { count } from "drizzle-orm";

/**
 * @response HealthResponseSchema:Service healthy
 * @response 500:HealthResponseSchema:Service unhealthy
 * @openapi
 */
export async function GET() {
  try {
    const db = getDb();

    const [userCountResult] = await db.select({ count: count() }).from(users);
    const [noteCountResult] = await db.select({ count: count() }).from(notes);
    
    const userCount = userCountResult.count;
    const noteCount = noteCountResult.count;

    return NextResponse.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
      data: {
        userCount,
        noteCount,
      },
    });
  } catch (error) {
    // Surface details in server logs for troubleshooting
    console.error("/api/health DB check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        error: error instanceof Error ? error.message : "unknown",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
