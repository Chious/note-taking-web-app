import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to boolean indicating if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 * @param userId - User ID to include in token
 * @returns JWT token string
 */
export function generateToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    return verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 * @param authHeader - Authorization header value
 * @returns JWT token or null if not found
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Get user ID from request headers
 * @param request - Request object
 * @returns User ID or null if not authenticated
 */
export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.userId || null;
}
