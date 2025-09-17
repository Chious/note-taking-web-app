import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * @response 200:object:OpenAPI specification
 * @openapi
 */
export async function GET() {
  try {
    // Read the generated OpenAPI spec from public directory
    const openApiPath = path.join(process.cwd(), "public", "openapi.json");
    const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, "utf8"));
    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error("Error reading OpenAPI spec:", error);
    return NextResponse.json(
      { error: "OpenAPI specification not found" },
      { status: 404 }
    );
  }
}
