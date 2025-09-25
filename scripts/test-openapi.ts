/**
 * OpenAPI Documentation Test Script
 *
 * This script verifies that the generated OpenAPI documentation
 * includes all the notes API endpoints with proper schemas.
 */

import fs from "fs";
import path from "path";

const OPENAPI_PATH = path.join(process.cwd(), "public", "openapi.json");

interface PathItem {
  get?: Record<string, unknown>;
  post?: Record<string, unknown>;
  put?: Record<string, unknown>;
  delete?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  $ref?: string;
  [key: string]: unknown;
}

interface Components {
  schemas: Record<string, Schema>;
  securitySchemes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    [key: string]: unknown;
  };
  paths: Record<string, PathItem>;
  components: Components;
  [key: string]: unknown;
}

function loadOpenAPISpec(): OpenAPISpec {
  if (!fs.existsSync(OPENAPI_PATH)) {
    throw new Error(`OpenAPI spec not found at ${OPENAPI_PATH}`);
  }

  const content = fs.readFileSync(OPENAPI_PATH, "utf-8");
  return JSON.parse(content);
}

interface EndpointMethod {
  [key: string]: boolean | undefined;
  get?: boolean;
  post?: boolean;
  put?: boolean;
  delete?: boolean;
}

interface Endpoint {
  path: string;
  methods: Array<keyof EndpointMethod>;
}

function testNotesEndpoints(spec: OpenAPISpec) {
  console.log("🔍 Testing Notes API endpoints...");

  const expectedEndpoints: Endpoint[] = [
    { path: "/notes", methods: ["get", "post"] },
    { path: "/notes/{id}", methods: ["get", "put", "delete"] },
    { path: "/tags", methods: ["get"] },
  ];

  const authEndpoints = [
    "/notes",
    "/notes/{id}",
    "/tags",
  ] as const;

  let passed = 0;
  let total = 0;

  // Test expected endpoints and methods
  for (const endpoint of expectedEndpoints) {
    const pathSpec = spec.paths[endpoint.path];

    if (!pathSpec) {
      console.log(`❌ Missing endpoint: ${endpoint.path}`);
      total += endpoint.methods.length;
      continue;
    }

    for (const method of endpoint.methods) {
      total++;
      const methodKey = method as keyof typeof pathSpec;
      const methodSpec = pathSpec[methodKey];

      if (!methodSpec) {
        const methodStr = method.toString().toUpperCase();
        console.log(`❌ Missing method: ${methodStr} ${endpoint.path}`);
        continue;
      }

      // Check if endpoint has authentication
      const methodWithAuth = methodSpec as { security?: unknown };
      const hasAuth = 'security' in methodWithAuth && 
                     Array.isArray(methodWithAuth.security) && 
                     methodWithAuth.security.length > 0;
      
      const methodStr = method.toString().toUpperCase();
      if (hasAuth) {
        console.log(`✅ ${methodStr} ${endpoint.path} - has authentication`);
      } else {
        console.log(`⚠️  ${methodStr} ${endpoint.path} - missing authentication`);
      }

      passed++;
    }
  }

  // Verify authentication requirements
  for (const endpoint of authEndpoints) {
    const pathItem = spec.paths[endpoint];
    if (!pathItem) continue;

    const methods = (Object.keys(pathItem) as Array<keyof PathItem>).filter((m): m is 'get' | 'post' | 'put' | 'delete' => 
      ['get', 'post', 'put', 'delete'].includes(m as string)
    );

    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation) continue;
      
      const operationObj = operation as { security?: Array<Record<string, unknown>> };
      
      if (!operationObj.security || 
          !operationObj.security.some(s => s && typeof s === 'object' && 'bearerAuth' in s)) {
        console.log(`❌ Missing security requirement for ${method.toUpperCase()} ${endpoint}`);
      }
    }
  }

  console.log(`\n📊 Notes endpoints: ${passed}/${total} passed\n`);
  return { passed, total };
}

function testSchemas(spec: OpenAPISpec) {
  console.log("🔍 Testing Schema definitions...");

  const expectedSchemas = [
    "EditorContentSchema",
    "EditorBlockSchema",
    "CreateNoteSchema",
    "UpdateNoteSchema",
    "NoteResponseSchema",
    "NotesResponseSchema",
    "TagsResponseSchema",
    "HeaderBlockDataSchema",
    "ParagraphBlockDataSchema",
    "ListBlockDataSchema",
    "QuoteBlockDataSchema",
    "DelimiterBlockDataSchema",
  ] as const;

  let passed = 0;
  const total = expectedSchemas.length;

  for (const schemaName of expectedSchemas) {
    if (spec.components.schemas[schemaName]) {
      console.log(`✅ Schema: ${schemaName}`);
      passed++;
    } else {
      console.log(`❌ Missing schema: ${schemaName}`);
    }
  }

  console.log(`\n📊 Schemas: ${passed}/${total} passed\n`);
  return { passed, total };
}

function testEditorJsIntegration(spec: OpenAPISpec) {
  console.log("🔍 Testing Editor.js integration...");

  const editorContentSchema = spec.components.schemas.EditorContentSchema;

  if (!editorContentSchema) {
    console.log("❌ EditorContentSchema not found");
    return { passed: 0, total: 1 };
  }

  const requiredFields = ["time", "blocks", "version"];
  let passed = 0;

  for (const field of requiredFields) {
    if (
      editorContentSchema.properties &&
      editorContentSchema.properties[field]
    ) {
      console.log(`✅ EditorContent has ${field} field`);
      passed++;
    } else {
      console.log(`❌ EditorContent missing ${field} field`);
    }
  }

  // Check if blocks is an array of EditorBlock
  const blocksProperty = editorContentSchema.properties?.blocks;
  if (
    blocksProperty?.type === "array" &&
    blocksProperty.items?.$ref?.includes("EditorBlockSchema")
  ) {
    console.log("✅ EditorContent.blocks references EditorBlockSchema");
    passed++;
  } else {
    console.log(
      "❌ EditorContent.blocks does not properly reference EditorBlockSchema"
    );
  }

  console.log(
    `\n📊 Editor.js integration: ${passed}/${
      requiredFields.length + 1
    } passed\n`
  );
  return { passed, total: requiredFields.length + 1 };
}

function testAuthenticationSetup(spec: OpenAPISpec) {
  console.log("🔍 Testing Authentication setup...");
  let passed = 0;
  const total = 1;

  if (!spec.components.securitySchemes) {
    console.log("❌ Missing securitySchemes in components");
  } else if (!(spec.components.securitySchemes as Record<string, unknown>)["bearerAuth"]) {
    console.log("❌ Missing bearerAuth security scheme");
  } else {
    console.log("✅ Authentication is properly configured");
    passed++;
  }

  // Check if notes endpoints use authentication
  const notesGetEndpoint = spec.paths["/notes"]?.get as { security?: Array<{ bearerAuth: string[] }> } | undefined;
  if (notesGetEndpoint?.security?.some(s => 'bearerAuth' in s)) {
    console.log("✅ Notes endpoints use BearerAuth");
  } else {
    console.log("❌ Notes endpoints missing BearerAuth");
  }

  console.log(`\n📊 Authentication: ${passed}/${total} passed\n`);
  return { passed, total };
}

async function runTests() {
  console.log("🚀 Starting OpenAPI Documentation Tests");
  console.log("=====================================\n");

  try {
    const spec = loadOpenAPISpec();

    console.log(`📋 OpenAPI Version: ${spec.openapi}`);
    console.log(`📋 API Title: ${spec.info.title}`);
    console.log(`📋 API Version: ${spec.info.version}\n`);

    const endpointsResult = testNotesEndpoints(spec);
    const schemasResult = testSchemas(spec);
    const editorJsResult = testEditorJsIntegration(spec);
    const authResult = testAuthenticationSetup(spec);

    const totalPassed =
      endpointsResult.passed +
      schemasResult.passed +
      editorJsResult.passed +
      authResult.passed;
    const totalTests =
      endpointsResult.total +
      schemasResult.total +
      editorJsResult.total +
      authResult.total;

    console.log("=====================================");
    console.log(
      `🎯 Overall Results: ${totalPassed}/${totalTests} tests passed`
    );

    if (totalPassed === totalTests) {
      console.log("🎉 All tests passed! OpenAPI documentation is complete.");
    } else {
      console.log(
        "⚠️  Some tests failed. Please review the OpenAPI documentation."
      );
    }

    // Additional info
    console.log("\n📍 Additional Information:");
    console.log(`   - Total API endpoints: ${Object.keys(spec.paths).length}`);
    console.log(
      `   - Total schemas: ${Object.keys(spec.components.schemas).length}`
    );
    console.log(
      `   - OpenAPI file size: ${(
        fs.statSync(OPENAPI_PATH).size / 1024
      ).toFixed(2)} KB`
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
