/**
 * Database Seed Script
 *
 * This script populates the database with sample data for development.
 * Passwords are properly hashed using bcryptjs before storage.
 *
 * Test Credentials:
 * - demo@example.com / password123
 * - john@example.com / password456
 *
 * Run with: npm run db:seed
 */

import { execFileSync } from "node:child_process";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "../src/lib/auth";
import { stringifyEditorContent } from "../src/lib/editor-utils";

function run(sql: string) {
  // Use execFileSync with args array to avoid shell interpolation (which broke $ in bcrypt hashes)
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "noteapp", "--local", "--command", sql],
    { stdio: "inherit", shell: false }
  );
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Create sample users with properly hashed passwords
  const user1Id = createId();
  const user2Id = createId();
  const user1Pass = await hashPassword("password123");
  const user2Pass = await hashPassword("password456");

  const now = new Date().toISOString();
  
  run(
    `INSERT INTO User (id, email, password, createdAt, updatedAt) VALUES (` +
      `'${user1Id}', 'demo@example.com', '${escapeSql(
        user1Pass
      )}', '${now}', '${now}'` +
      `)`
  );
  run(
    `INSERT INTO User (id, email, password, createdAt, updatedAt) VALUES (` +
      `'${user2Id}', 'john@example.com', '${escapeSql(
        user2Pass
      )}', '${now}', '${now}'` +
      `)`
  );

  console.log("✅ Created sample users");
  console.log("   📧 Test credentials:");
  console.log("      demo@example.com / password123");
  console.log("      john@example.com / password456");

  // Create sample notes with Editor.js content format
  const sampleNotes = [
    {
      userId: user1Id,
      title: "Welcome to Notes",
      content: stringifyEditorContent({
        time: Date.now(),
        blocks: [
          {
            id: "welcome1",
            type: "header",
            data: { text: "Welcome to Notes", level: 1 }
          },
          {
            id: "welcome2",
            type: "paragraph",
            data: { text: "This is your first note! You can edit, delete, and organize your notes here." }
          }
        ],
        version: "2.31.0"
      }),
      tags: ["welcome", "getting-started"],
    },
    {
      userId: user1Id,
      title: "Project Ideas",
      content: stringifyEditorContent({
        time: Date.now(),
        blocks: [
          {
            id: "project1",
            type: "header",
            data: { text: "Project Ideas", level: 2 }
          },
          {
            id: "project2",
            type: "list",
            data: {
              style: "ordered",
              items: [
                "Build a todo app",
                "Learn TypeScript", 
                "Deploy to Cloudflare",
                "Add authentication"
              ]
            }
          }
        ],
        version: "2.31.0"
      }),
      tags: ["projects", "ideas", "development"],
    },
    {
      userId: user1Id,
      title: "Meeting Notes",
      content: stringifyEditorContent({
        time: Date.now(),
        blocks: [
          {
            id: "meeting1",
            type: "header",
            data: { text: "Team Meeting - 2024-01-15", level: 2 }
          },
          {
            id: "meeting2",
            type: "list",
            data: {
              style: "unordered",
              items: [
                "Discussed new features",
                "Set deployment timeline",
                "Assigned tasks"
              ]
            }
          }
        ],
        version: "2.31.0"
      }),
      tags: ["meetings", "work"],
      isArchived: true,
    },
    {
      userId: user2Id,
      title: "Recipe Collection",
      content: stringifyEditorContent({
        time: Date.now(),
        blocks: [
          {
            id: "recipe1",
            type: "header",
            data: { text: "Favorite Recipes to Try", level: 2 }
          },
          {
            id: "recipe2",
            type: "list",
            data: {
              style: "unordered",
              items: [
                "Pasta carbonara",
                "Chicken tikka masala",
                "Chocolate chip cookies"
              ]
            }
          }
        ],
        version: "2.31.0"
      }),
      tags: ["recipes", "cooking", "food"],
    },
    {
      userId: user2Id,
      title: "Travel Plans",
      content: stringifyEditorContent({
        time: Date.now(),
        blocks: [
          {
            id: "travel1",
            type: "header",
            data: { text: "Places to Visit", level: 2 }
          },
          {
            id: "travel2",
            type: "list",
            data: {
              style: "unordered",
              items: [
                "Japan (Tokyo, Kyoto)",
                "Iceland (Northern Lights)",
                "New Zealand (Hiking)"
              ]
            }
          }
        ],
        version: "2.31.0"
      }),
      tags: ["travel", "vacation", "bucket-list"],
    },
  ];

  // Create a map to store tag IDs to avoid duplicates
  const tagMap = new Map<string, string>();

  // Helper function to get or create a tag
  function getOrCreateTag(tagName: string, userId: string): string {
    const key = `${userId}:${tagName}`;
    if (tagMap.has(key)) {
      return tagMap.get(key)!;
    }
    
    const tagId = createId();
    const now = new Date().toISOString();
    run(
      `INSERT INTO Tag (id, name, userId, createdAt, updatedAt) VALUES (` +
        `'${tagId}', '${escapeSql(tagName)}', '${userId}', '${now}', '${now}'` +
        `)`
    );
    tagMap.set(key, tagId);
    return tagId;
  }

  for (const noteData of sampleNotes) {
    const noteId = createId();
    const { userId, title, content, tags } = noteData;
    const archived = (noteData as { isArchived?: boolean }).isArchived ? 1 : 0;
    const noteTime = new Date().toISOString();
    
    // Insert the note (without tags column)
    run(
      `INSERT INTO Note (id, userId, title, content, isArchived, createdAt, updatedAt, lastEdited) VALUES (` +
        `'${noteId}', '${userId}', '${escapeSql(title)}', '${escapeSql(
          content
        )}', ${archived}, '${noteTime}', '${noteTime}', '${noteTime}'` +
        `)`
    );

    // Create tags and note-tag relationships
    for (const tagName of tags) {
      const tagId = getOrCreateTag(tagName, userId);
      run(
        `INSERT INTO NoteTag (noteId, tagId) VALUES ('${noteId}', '${tagId}')`
      );
    }
  }

  console.log("✅ Created sample notes with tags");

  // Display summary (printed by Wrangler)
  console.log("\n📊 Seed Summary (from D1):");
  run(`SELECT COUNT(*) AS users FROM User;`);
  run(`SELECT COUNT(*) AS notes FROM Note;`);
  run(`SELECT COUNT(*) AS tags FROM Tag;`);
  run(`SELECT COUNT(*) AS note_tag_relations FROM NoteTag;`);
  console.log("\n🎉 Database seeding completed successfully!");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
