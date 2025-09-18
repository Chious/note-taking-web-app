import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/test-auth/route";
import { generateToken } from "@/lib/auth";

describe("/api/test-auth", () => {
  beforeEach(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
  });

  it("should return user ID for valid token", async () => {
    const userId = "test-user-123";
    const token = generateToken(userId);

    const request = new Request("http://localhost:3000/api/test-auth", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Authentication successful");
    expect(data.userId).toBe(userId);
  });

  it("should return 401 for missing authorization header", async () => {
    const request = new Request("http://localhost:3000/api/test-auth", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 401 for invalid token format", async () => {
    const request = new Request("http://localhost:3000/api/test-auth", {
      method: "GET",
      headers: {
        Authorization: "InvalidFormat token",
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 401 for invalid token", async () => {
    const request = new Request("http://localhost:3000/api/test-auth", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid.jwt.token",
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 401 for malformed Bearer token", async () => {
    const request = new Request("http://localhost:3000/api/test-auth", {
      method: "GET",
      headers: {
        Authorization: "Bearer",
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });
});
