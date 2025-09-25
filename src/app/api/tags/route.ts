import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";
import { tags, noteTags } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Get tags
 * @description Retrieve all user tags with note counts and usage statistics
 * @security cookieAuth
 * @response TagsResponseSchema:Tags retrieved successfully
 * @openapi
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get all tags for the user with note counts
    const tagsWithCounts = await db
      .select({
        id: tags.id,
        name: tags.name,
        userId: tags.userId,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
        noteCount: sql<number>`COUNT(${noteTags.noteId})`.as("noteCount"),
      })
      .from(tags)
      .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
      .where(eq(tags.userId, session.user.id))
      .groupBy(tags.id, tags.name, tags.userId, tags.createdAt, tags.updatedAt)
      .orderBy(tags.name);

    return NextResponse.json({
      message: "Tags retrieved successfully",
      data: {
        tags: tagsWithCounts,
        total: tagsWithCounts.length,
      },
    });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tags" },
      { status: 500 }
    );
  }
}
