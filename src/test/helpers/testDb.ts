// tests/helpers/testDb.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";

export function createTestDb() {
  const sqlite = new Database(":memory:"); // in-memory sqlite
  // Ensure FK and create minimal schema for tests
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "Note" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "isArchived" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL,
      "lastEdited" TEXT NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS "Tag" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS "NoteTag" (
      "noteId" TEXT NOT NULL,
      "tagId" TEXT NOT NULL,
      PRIMARY KEY ("noteId", "tagId"),
      FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE,
      FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE
    );
  `);
  const db = drizzle(sqlite, { schema });

  return db;
}
