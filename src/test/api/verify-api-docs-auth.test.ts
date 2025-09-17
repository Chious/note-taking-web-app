import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/verify-api-docs-auth/route";

// Mock environment variables
const originalEnv = process.env;

describe("API Docs Authentication", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("should authenticate with correct credentials", async () => {
    // Set test credentials
    process.env.API_DOCS_USERNAME = "testuser";
    process.env.API_DOCS_PASSWORD = "testpass";

    const request = new Request(
      "http://localhost:3000/api/verify-api-docs-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "testpass",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Authentication successful");
  });

  it("should reject incorrect credentials", async () => {
    // Set test credentials
    process.env.API_DOCS_USERNAME = "testuser";
    process.env.API_DOCS_PASSWORD = "testpass";

    const request = new Request(
      "http://localhost:3000/api/verify-api-docs-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "wronguser",
          password: "wrongpass",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Invalid credentials");
  });

  it("should use default credentials when env vars not set", async () => {
    // Clear environment variables
    delete process.env.API_DOCS_USERNAME;
    delete process.env.API_DOCS_PASSWORD;

    const request = new Request(
      "http://localhost:3000/api/verify-api-docs-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: "admin123",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Authentication successful");
  });

  it("should handle invalid request body", async () => {
    const request = new Request(
      "http://localhost:3000/api/verify-api-docs-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Missing required fields
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Invalid request");
  });
});
