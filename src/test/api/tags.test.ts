import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/tags/route";
import { mockSession, clearSession } from "../helpers/mockSession";
import { createTestDb } from "../helpers/testDb";
import * as dbModule from "@/lib/db";
import { users, tags, notes, noteTags } from "@/lib/schema";
import { NextRequest } from "next/server";

describe("Tags API", () => {
  let db: ReturnType<typeof createTestDb>;
  const userId = "user-123";
  const tagId1 = "tag-123";
  const tagId2 = "tag-456";
  const noteId1 = "note-123";
  const noteId2 = "note-456";

  beforeEach(async () => {
    db = createTestDb();
    vi.spyOn(dbModule, "getDb").mockReturnValue(
      db as unknown as ReturnType<typeof dbModule.getDb>
    );
    mockSession(userId);

    // Seed user
    await db.insert(users).values({
      id: userId,
      email: "test@example.com",
      password: "hashed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed tags
    await db.insert(tags).values([
      {
        id: tagId1,
        name: "work",
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: tagId2,
        name: "personal",
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    // Seed notes
    await db.insert(notes).values([
      {
        id: noteId1,
        title: "Work Note",
        content: JSON.stringify({
          time: Date.now(),
          version: "2.28.2",
          blocks: [{ id: "b1", type: "paragraph", data: { text: "Work content" } }],
        }),
        userId: userId,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
      },
      {
        id: noteId2,
        title: "Personal Note",
        content: JSON.stringify({
          time: Date.now(),
          version: "2.28.2",
          blocks: [{ id: "b2", type: "paragraph", data: { text: "Personal content" } }],
        }),
        userId: userId,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
      },
    ]);

    // Seed note-tag relationships
    await db.insert(noteTags).values([
      { noteId: noteId1, tagId: tagId1 }, // work tag has 1 note
      { noteId: noteId2, tagId: tagId1 }, // work tag has 2 notes total
      { noteId: noteId2, tagId: tagId2 }, // personal tag has 1 note
    ]);
  });

  describe("GET /api/tags", () => {
    it("should retrieve all user tags with note counts", async () => {
      const req = new NextRequest("http://localhost/api/tags");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Tags retrieved successfully");
      expect(body.data.total).toBe(2);
      expect(body.data.tags).toHaveLength(2);

      // Check tags are sorted by name
      expect(body.data.tags[0].name).toBe("personal");
      expect(body.data.tags[1].name).toBe("work");

      // Check note counts
      const personalTag = body.data.tags.find((tag: any) => tag.name === "personal");
      const workTag = body.data.tags.find((tag: any) => tag.name === "work");

      expect(personalTag.noteCount).toBe(1);
      expect(workTag.noteCount).toBe(2);
    });

    it("should return empty array when user has no tags", async () => {
      // Clear all tags for this user
      await db.delete(noteTags);
      await db.delete(tags);

      const req = new NextRequest("http://localhost/api/tags");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Tags retrieved successfully");
      expect(body.data.total).toBe(0);
      expect(body.data.tags).toHaveLength(0);
    });

    it("should include tags with zero note count", async () => {
      // Remove all note-tag relationships
      await db.delete(noteTags);

      const req = new NextRequest("http://localhost/api/tags");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.tags).toHaveLength(2);
      expect(body.data.tags[0].noteCount).toBe(0);
      expect(body.data.tags[1].noteCount).toBe(0);
    });

    it("should return 401 for unauthenticated user", async () => {
      clearSession();
      const req = new NextRequest("http://localhost/api/tags");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("should only return tags belonging to the authenticated user", async () => {
      // Create another user with tags
      const otherUserId = "other-user-456";
      await db.insert(users).values({
        id: otherUserId,
        email: "other@example.com",
        password: "hashed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await db.insert(tags).values({
        id: "other-tag-789",
        name: "other-tag",
        userId: otherUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost/api/tags");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.total).toBe(2); // Only current user's tags
      expect(body.data.tags.every((tag: any) => tag.userId === userId)).toBe(true);
      expect(body.data.tags.find((tag: any) => tag.name === "other-tag")).toBeUndefined();
    });

    it("should handle database errors gracefully", async () => {
      // Mock database error
      vi.spyOn(dbModule, "getDb").mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const req = new NextRequest("http://localhost/api/tags");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe("Failed to retrieve tags");
    });
  });
});
