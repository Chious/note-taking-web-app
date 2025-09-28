import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/app/api/notes/route";
import { mockSession, clearSession } from "../../helpers/mockSession";
import { createTestDb } from "../../helpers/testDb";
import * as dbModule from "@/lib/db";
import { users, notes, tags, noteTags } from "@/lib/schema";
import { NextRequest } from "next/server";

describe("Notes API", () => {
  let db: ReturnType<typeof createTestDb>;
  const userId = "user-123";

  beforeEach(async () => {
    db = createTestDb();
    vi.spyOn(dbModule, "getDb").mockReturnValue(
      db as unknown as ReturnType<typeof dbModule.getDb>
    );
    mockSession(userId);
    // seed user required by FK
    await db.insert(users).values({
      id: userId,
      email: "test@example.com",
      password: "hashed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("POST /api/notes → should create note", async () => {
    const req = new NextRequest("http://localhost/api/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        content: {
          time: Date.now(),
          version: "2.28.2",
          blocks: [{ id: "b1", type: "paragraph", data: { text: "Hello" } }],
        },
        tags: ["t1"],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.note.title).toBe("Test");
  });

  it("GET /api/notes → should return empty initially", async () => {
    const req = new NextRequest("http://localhost/api/notes");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.notes).toHaveLength(0);
  });

  describe("GET /api/notes with filters", () => {
    beforeEach(async () => {
      // Seed some test data
      const tagId1 = "tag-1";
      const tagId2 = "tag-2";

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

      await db.insert(notes).values([
        {
          id: "note-1",
          title: "Work Meeting Notes",
          content: JSON.stringify({
            time: Date.now(),
            version: "2.28.2",
            blocks: [
              {
                id: "b1",
                type: "paragraph",
                data: { text: "Meeting content" },
              },
            ],
          }),
          userId: userId,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        },
        {
          id: "note-2",
          title: "Personal Journal",
          content: JSON.stringify({
            time: Date.now(),
            version: "2.28.2",
            blocks: [
              {
                id: "b2",
                type: "paragraph",
                data: { text: "Journal content" },
              },
            ],
          }),
          userId: userId,
          isArchived: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        },
        {
          id: "note-3",
          title: "Shopping List",
          content: JSON.stringify({
            time: Date.now(),
            version: "2.28.2",
            blocks: [
              { id: "b3", type: "paragraph", data: { text: "Shopping items" } },
            ],
          }),
          userId: userId,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        },
      ]);

      // Add tag relationships
      await db.insert(noteTags).values([
        { noteId: "note-1", tagId: tagId1 },
        { noteId: "note-2", tagId: tagId2 },
      ]);
    });

    it("should filter by title query", async () => {
      const req = new NextRequest("http://localhost/api/notes?query=Meeting");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.notes).toHaveLength(1);
      expect(body.data.notes[0].title).toBe("Work Meeting Notes");
    });

    it("should filter by content query", async () => {
      const req = new NextRequest("http://localhost/api/notes?query=Journal");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.notes).toHaveLength(1); // "Personal Journal" matches both title and content
      expect(body.data.notes[0].title).toBe("Personal Journal");
    });

    it("should search in content only (not in title)", async () => {
      const req = new NextRequest("http://localhost/api/notes?query=items");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.notes).toHaveLength(1);
      expect(body.data.notes[0].title).toBe("Shopping List");
      // "items" is only in content "Shopping items", not in title "Shopping List"
    });

    it("should search in both title and content", async () => {
      const req = new NextRequest("http://localhost/api/notes?query=content");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.notes.length).toBeGreaterThan(0);
      // Should find notes that have "content" in their content field
    });

    it("should filter by archive status", async () => {
      const req = new NextRequest("http://localhost/api/notes?isArchived=true");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.notes).toHaveLength(1);
      expect(body.data.notes[0].title).toBe("Personal Journal");
      expect(body.data.notes[0].isArchived).toBe(true);
    });

    it("should filter by tags", async () => {
      const req = new NextRequest("http://localhost/api/notes?tags=work");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.notes).toHaveLength(1);
      expect(body.data.notes[0].title).toBe("Work Meeting Notes");
      expect(body.data.notes[0].tags).toContain("work");
    });

    it("should handle pagination", async () => {
      // TODO: Implement pagination test logic
    });

    it("should return notes with tags", async () => {
      const req = new NextRequest("http://localhost/api/notes");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      const workNote = body.data.notes.find(
        (note: any) => note.title === "Work Meeting Notes"
      );
      expect(workNote.tags).toEqual(["work"]);
    });
  });

  describe("POST /api/notes validation", () => {
    it("should create note with tags", async () => {
      const req = new NextRequest("http://localhost/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: "Test with Tags",
          content: {
            time: Date.now(),
            version: "2.28.2",
            blocks: [
              { id: "b1", type: "paragraph", data: { text: "Content" } },
            ],
          },
          tags: ["new-tag", "another-tag"],
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.note.tags).toEqual(["new-tag", "another-tag"]);
    });

    it("should return 401 for unauthenticated user", async () => {
      clearSession();
      const req = new NextRequest("http://localhost/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          content: {
            time: Date.now(),
            version: "2.28.2",
            blocks: [{ id: "b1", type: "paragraph", data: { text: "Hello" } }],
          },
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid content format", async () => {
      const req = new NextRequest("http://localhost/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          content: "invalid content format",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Validation failed");
    });

    it("should return 400 for missing required fields", async () => {
      const req = new NextRequest("http://localhost/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          // missing content
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Validation failed");
    });
  });

  it("GET /api/notes → should return 401 for unauthenticated user", async () => {
    clearSession();
    const req = new NextRequest("http://localhost/api/notes");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});
