import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { LoginRequestSchema } from '@/schemas/auth';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

/**
 * Login
 * @description Login with email and password
 * @auth none
 * @body LoginRequestSchema
 * @response LoginResponseSchema:Login successful
 * @responseSet auth
 * @openapi
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const { email, password } = LoginRequestSchema.parse(body);

    console.log('email', email);
    console.log('password', password);

    // Find user by email
    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle JWT secret missing error
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
