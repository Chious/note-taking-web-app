import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the database before importing anything else
import { mockGetDb } from "@/test/lib/db.mock";

vi.mock("@/lib/db", () => ({
  getDb: mockGetDb,
}));

import { POST } from "@/app/api/login/route";
import { verifyToken } from "@/lib/auth";

describe("/api/login", () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrisma = mockGetDb();

    // Setup default mock responses - mock user that exists
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "test-user-id",
      email: "test@example.com",
      password: "$2b$12$.UAKkrAYGvSzzHfAc8AbC.rxa3Mc4p2OsoF/DNtu1mv/hnvz1eClK", // "password123"
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("should login user with correct credentials", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "password123", // This matches the hashed password in mock data
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Login successful");
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(requestBody.email);
    expect(data.user.id).toBeDefined();
    expect(data.user.password).toBeUndefined(); // Password should not be returned

    // Verify the JWT token is valid
    const tokenPayload = verifyToken(data.token);
    expect(tokenPayload).toBeDefined();
    expect(tokenPayload?.userId).toBe(data.user.id);
  });

  it("should reject login with incorrect email", async () => {
    // Mock no user found
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const requestBody = {
      email: "nonexistent@example.com",
      password: "password123",
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid email or password");
  });

  it("should reject login with incorrect password", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "wrongpassword",
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid email or password");
  });

  it("should validate email format", async () => {
    const requestBody = {
      email: "invalid-email",
      password: "password123",
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
    expect(data.details[0].field).toBe("email");
    expect(data.details[0].message).toBe("Invalid email address");
  });

  it("should validate required password", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "", // Empty password
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
    expect(data.details[0].field).toBe("password");
    expect(data.details[0].message).toBe("Password is required");
  });

  it("should handle missing email", async () => {
    const requestBody = {
      password: "password123",
      // email is missing
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should handle missing password", async () => {
    const requestBody = {
      email: "test@example.com",
      // password is missing
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should handle invalid JSON", async () => {
    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Login failed. Please try again.");
  });

  it("should handle database errors", async () => {
    // Mock database error
    mockPrisma.user.findUnique.mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const requestBody = {
      email: "test@example.com",
      password: "password123",
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Login failed. Please try again.");
  });

  it("should handle JWT_SECRET missing error", async () => {
    // Temporarily remove JWT_SECRET
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    const requestBody = {
      email: "test@example.com",
      password: "password123",
    };

    const request = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Server configuration error");

    // Restore JWT_SECRET
    process.env.JWT_SECRET = originalSecret;
  });
});
