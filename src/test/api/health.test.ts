import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/health/route";
import { createTestDb } from "../helpers/testDb";
import * as dbModule from "@/lib/db";
import { users, notes } from "@/lib/schema";

describe("Health API", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(async () => {
    db = createTestDb();
    vi.spyOn(dbModule, "getDb").mockReturnValue(
      db as unknown as ReturnType<typeof dbModule.getDb>
    );
  });

  describe("GET /api/health", () => {
    it("should return healthy status with counts", async () => {
      // Seed some test data
      await db.insert(users).values([
        {
          id: "user-1",
          email: "user1@example.com",
          password: "hashed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "user-2",
          email: "user2@example.com",
          password: "hashed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      await db.insert(notes).values([
        {
          id: "note-1",
          title: "Note 1",
          content: JSON.stringify({
            time: Date.now(),
            version: "2.28.2",
            blocks: [{ id: "b1", type: "paragraph", data: { text: "Content 1" } }],
          }),
          userId: "user-1",
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        },
        {
          id: "note-2",
          title: "Note 2",
          content: JSON.stringify({
            time: Date.now(),
            version: "2.28.2",
            blocks: [{ id: "b2", type: "paragraph", data: { text: "Content 2" } }],
          }),
          userId: "user-2",
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        },
        {
          id: "note-3",
          title: "Note 3",
          content: JSON.stringify({
            time: Date.now(),
            version: "2.28.2",
            blocks: [{ id: "b3", type: "paragraph", data: { text: "Content 3" } }],
          }),
          userId: "user-1",
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        },
      ]);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe("ok");
      expect(body.db).toBe("connected");
      expect(body.timestamp).toBeDefined();
      expect(body.data.userCount).toBe(2);
      expect(body.data.noteCount).toBe(3);
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });

    it("should return healthy status with zero counts when no data", async () => {
      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe("ok");
      expect(body.db).toBe("connected");
      expect(body.data.userCount).toBe(0);
      expect(body.data.noteCount).toBe(0);
    });

    it("should handle database connection errors", async () => {
      // Mock database error
      vi.spyOn(dbModule, "getDb").mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.status).toBe("error");
      expect(body.db).toBe("disconnected");
      expect(body.error).toBe("Database connection failed");
      expect(body.timestamp).toBeDefined();
    });

    it("should handle unknown database errors", async () => {
      // Mock unknown error (not an Error instance)
      vi.spyOn(dbModule, "getDb").mockImplementation(() => {
        throw "Unknown error";
      });

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.status).toBe("error");
      expect(body.db).toBe("disconnected");
      expect(body.error).toBe("unknown");
    });

    it("should not require authentication", async () => {
      // Health endpoint should work without authentication
      const res = await GET();

      expect(res.status).toBe(200);
    });

    it("should return consistent response structure", async () => {
      const res = await GET();
      const body = await res.json();

      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("db");
      expect(body).toHaveProperty("timestamp");
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("userCount");
      expect(body.data).toHaveProperty("noteCount");
      expect(typeof body.data.userCount).toBe("number");
      expect(typeof body.data.noteCount).toBe("number");
    });
  });
});
