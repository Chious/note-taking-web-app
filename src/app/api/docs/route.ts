import { NextResponse } from "next/server";

/**
 * @response 200:object:OpenAPI specification
 * @openapi
 */
export async function GET() {
  try {
    // Fetch the generated OpenAPI spec from the public directory
    // In Next.js, files in /public are served at the root ("/openapi.json")
    const res = await fetch("/openapi.json");
    if (!res.ok) {
      throw new Error(`Failed to load OpenAPI spec: ${res.status}`);
    }
    const openApiSpec = await res.json();
    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error("Error reading OpenAPI spec:", error);
    return NextResponse.json(
      { error: "OpenAPI specification not found" },
      { status: 404 }
    );
  }
}
