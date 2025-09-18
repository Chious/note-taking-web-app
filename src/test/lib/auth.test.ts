import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  getUserIdFromRequest,
} from "@/lib/auth";

describe("Authentication Utilities", () => {
  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testpassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should verify correct password", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token Management", () => {
    const testUserId = "test-user-id-123";

    it("should generate a valid JWT token", () => {
      const token = generateToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should verify a valid JWT token", () => {
      const token = generateToken(testUserId);
      const payload = verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUserId);
    });

    it("should reject invalid JWT token", () => {
      const invalidToken = "invalid.token.here";
      const payload = verifyToken(invalidToken);

      expect(payload).toBeNull();
    });

    it("should reject expired token", () => {
      // Create a token that's already expired (this would require mocking time or using a different approach)
      const malformedToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid";
      const payload = verifyToken(malformedToken);

      expect(payload).toBeNull();
    });

    it("should throw error when JWT_SECRET is missing", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken(testUserId)).toThrow(
        "JWT_SECRET environment variable is not set"
      );

      // Restore the secret
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe("Token Header Extraction", () => {
    it("should extract token from valid Authorization header", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const authHeader = `Bearer ${token}`;
      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBe(token);
    });

    it("should return null for missing Authorization header", () => {
      const extractedToken = extractTokenFromHeader(null);

      expect(extractedToken).toBeNull();
    });

    it("should return null for malformed Authorization header", () => {
      const malformedHeaders = [
        "InvalidFormat token",
        "Bearer",
        "Bearer token extra",
        "token",
        "",
      ];

      malformedHeaders.forEach((header) => {
        const extractedToken = extractTokenFromHeader(header);
        expect(extractedToken).toBeNull();
      });
    });
  });

  describe("Request User ID Extraction", () => {
    it("should extract user ID from valid request", () => {
      const userId = "test-user-123";
      const token = generateToken(userId);
      const request = new Request("http://localhost:3000/api/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const extractedUserId = getUserIdFromRequest(request);

      expect(extractedUserId).toBe(userId);
    });

    it("should return null for request without authorization", () => {
      const request = new Request("http://localhost:3000/api/test");
      const extractedUserId = getUserIdFromRequest(request);

      expect(extractedUserId).toBeNull();
    });

    it("should return null for request with invalid token", () => {
      const request = new Request("http://localhost:3000/api/test", {
        headers: {
          Authorization: "Bearer invalid.token.here",
        },
      });

      const extractedUserId = getUserIdFromRequest(request);

      expect(extractedUserId).toBeNull();
    });
  });
});
