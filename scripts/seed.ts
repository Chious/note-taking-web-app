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
import { formatTags } from "../src/types/database";
import { hashPassword } from "../src/lib/auth";

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

  // Create sample notes
  const sampleNotes = [
    {
      userId: user1Id,
      title: "Welcome to Notes",
      content:
        "This is your first note! You can edit, delete, and organize your notes here.",
      tags: formatTags(["welcome", "getting-started"]),
    },
    {
      userId: user1Id,
      title: "Project Ideas",
      content:
        "1. Build a todo app\n2. Learn TypeScript\n3. Deploy to Cloudflare\n4. Add authentication",
      tags: formatTags(["projects", "ideas", "development"]),
    },
    {
      userId: user1Id,
      title: "Meeting Notes",
      content:
        "Team meeting on 2024-01-15:\n- Discussed new features\n- Set deployment timeline\n- Assigned tasks",
      tags: formatTags(["meetings", "work"]),
      isArchived: true,
    },
    {
      userId: user2Id,
      title: "Recipe Collection",
      content:
        "Favorite recipes to try:\n- Pasta carbonara\n- Chicken tikka masala\n- Chocolate chip cookies",
      tags: formatTags(["recipes", "cooking", "food"]),
    },
    {
      userId: user2Id,
      title: "Travel Plans",
      content:
        "Places to visit:\n- Japan (Tokyo, Kyoto)\n- Iceland (Northern Lights)\n- New Zealand (Hiking)",
      tags: formatTags(["travel", "vacation", "bucket-list"]),
    },
  ];

  for (const noteData of sampleNotes) {
    const id = createId();
    const { userId, title, content, tags } = noteData;
    const archived = (noteData as { isArchived?: boolean }).isArchived ? 1 : 0;
    const noteTime = new Date().toISOString();
    run(
      `INSERT INTO Note (id, userId, title, content, tags, isArchived, createdAt, updatedAt, lastEdited) VALUES (` +
        `'${id}', '${userId}', '${escapeSql(title)}', '${escapeSql(
          content
        )}', '${escapeSql(
          tags
        )}', ${archived}, '${noteTime}', '${noteTime}', '${noteTime}'` +
        `)`
    );
  }

  console.log("✅ Created sample notes");

  // Display summary (printed by Wrangler)
  console.log("\n📊 Seed Summary (from D1):");
  run(`SELECT COUNT(*) AS users FROM User;`);
  run(`SELECT COUNT(*) AS notes FROM Note;`);
  console.log("\n🎉 Database seeding completed successfully!");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
