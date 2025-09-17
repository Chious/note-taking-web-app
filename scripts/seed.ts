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

import { PrismaClient } from "@prisma/client";
import { formatTags } from "../src/types/database";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create sample users with properly hashed passwords
  const user1 = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: await hashPassword("password123"),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "john@example.com",
      password: await hashPassword("password456"),
    },
  });

  console.log("✅ Created sample users");
  console.log("   📧 Test credentials:");
  console.log("      demo@example.com / password123");
  console.log("      john@example.com / password456");

  // Create sample notes
  const sampleNotes = [
    {
      userId: user1.id,
      title: "Welcome to Notes",
      content:
        "This is your first note! You can edit, delete, and organize your notes here.",
      tags: formatTags(["welcome", "getting-started"]),
    },
    {
      userId: user1.id,
      title: "Project Ideas",
      content:
        "1. Build a todo app\n2. Learn TypeScript\n3. Deploy to Cloudflare\n4. Add authentication",
      tags: formatTags(["projects", "ideas", "development"]),
    },
    {
      userId: user1.id,
      title: "Meeting Notes",
      content:
        "Team meeting on 2024-01-15:\n- Discussed new features\n- Set deployment timeline\n- Assigned tasks",
      tags: formatTags(["meetings", "work"]),
      isArchived: true,
    },
    {
      userId: user2.id,
      title: "Recipe Collection",
      content:
        "Favorite recipes to try:\n- Pasta carbonara\n- Chicken tikka masala\n- Chocolate chip cookies",
      tags: formatTags(["recipes", "cooking", "food"]),
    },
    {
      userId: user2.id,
      title: "Travel Plans",
      content:
        "Places to visit:\n- Japan (Tokyo, Kyoto)\n- Iceland (Northern Lights)\n- New Zealand (Hiking)",
      tags: formatTags(["travel", "vacation", "bucket-list"]),
    },
  ];

  for (const noteData of sampleNotes) {
    await prisma.note.create({
      data: noteData,
    });
  }

  console.log("✅ Created sample notes");

  // Display summary
  const userCount = await prisma.user.count();
  const noteCount = await prisma.note.count();

  console.log("\n📊 Seed Summary:");
  console.log(`   Users created: ${userCount}`);
  console.log(`   Notes created: ${noteCount}`);
  console.log("\n🎉 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
