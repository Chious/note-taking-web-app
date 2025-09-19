import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { RegisterRequestSchema } from "@/schemas/auth";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import z from "zod";

/**
 * @body RegisterRequestSchema
 * @response 201:RegisterResponseSchema:User registered successfully
 * @responseSet auth
 * @add 409:ErrorResponseSchema:Email already in use
 * @openapi
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const { email, password } = RegisterRequestSchema.parse(body);

    // Check if user already exists
    const db = getDb();
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error instanceof Error) {
      // Check for specific database constraint errors
      if (error.message.includes("UNIQUE constraint failed")) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
