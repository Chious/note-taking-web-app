import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PUT, DELETE } from "@/app/api/notes/[id]/route";
import { mockSession, clearSession } from "../../helpers/mockSession";
import { createTestDb } from "../../helpers/testDb";
import * as dbModule from "@/lib/db";
import { users, notes, tags, noteTags } from "@/lib/schema";
import { NextRequest } from "next/server";

describe("Notes [id] API", () => {
  let db: ReturnType<typeof createTestDb>;
  const userId = "user-123";
  const noteId = "note-123";
  const tagId = "tag-123";

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

    // Seed tag
    await db.insert(tags).values({
      id: tagId,
      name: "test-tag",
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed note
    await db.insert(notes).values({
      id: noteId,
      title: "Test Note",
      content: JSON.stringify({
        time: Date.now(),
        version: "2.28.2",
        blocks: [{ id: "b1", type: "paragraph", data: { text: "Test content" } }],
      }),
      userId: userId,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
    });

    // Seed note-tag relationship
    await db.insert(noteTags).values({
      noteId: noteId,
      tagId: tagId,
    });
  });

  describe("GET /api/notes/[id]", () => {
    it("should retrieve note with tags", async () => {
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`);
      const res = await GET(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Note retrieved successfully");
      expect(body.note.id).toBe(noteId);
      expect(body.note.title).toBe("Test Note");
      expect(body.note.tags).toEqual(["test-tag"]);
      expect(body.note.content).toEqual({
        time: expect.any(Number),
        version: "2.28.2",
        blocks: [{ id: "b1", type: "paragraph", data: { text: "Test content" } }],
      });
    });

    it("should return 404 for non-existent note", async () => {
      const req = new NextRequest("http://localhost/api/notes/non-existent");
      const res = await GET(req, { params: Promise.resolve({ id: "non-existent" }) });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Note not found");
    });

    it("should return 401 for unauthenticated user", async () => {
      clearSession();
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`);
      const res = await GET(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("PUT /api/notes/[id]", () => {
    it("should update note title", async () => {
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: "Updated Title",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Note updated successfully");
      expect(body.note.title).toBe("Updated Title");
    });

    it("should update note content", async () => {
      const newContent = {
        time: Date.now(),
        version: "2.28.2",
        blocks: [{ id: "b2", type: "paragraph", data: { text: "Updated content" } }],
      };

      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          content: newContent,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.note.content).toEqual(newContent);
    });

    it("should update note tags", async () => {
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          tags: ["new-tag", "another-tag"],
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.note.tags).toEqual(["new-tag", "another-tag"]);
    });

    it("should update archive status", async () => {
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          isArchived: true,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.note.isArchived).toBe(true);
    });

    it("should return 404 for non-existent note", async () => {
      const req = new NextRequest("http://localhost/api/notes/non-existent", {
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: "non-existent" }) });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Note not found");
    });

    it("should return 401 for unauthenticated user", async () => {
      clearSession();
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid data", async () => {
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          content: "invalid content format",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await PUT(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Validation failed");
    });
  });

  describe("DELETE /api/notes/[id]", () => {
    it("should delete note successfully", async () => {
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Note deleted successfully");

      // Verify note is deleted
      const checkReq = new NextRequest(`http://localhost/api/notes/${noteId}`);
      const checkRes = await GET(checkReq, { params: Promise.resolve({ id: noteId }) });
      expect(checkRes.status).toBe(404);
    });

    it("should return 404 for non-existent note", async () => {
      const req = new NextRequest("http://localhost/api/notes/non-existent", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "non-existent" }) });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Note not found");
    });

    it("should return 401 for unauthenticated user", async () => {
      clearSession();
      const req = new NextRequest(`http://localhost/api/notes/${noteId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: noteId }) });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });
  });
});
