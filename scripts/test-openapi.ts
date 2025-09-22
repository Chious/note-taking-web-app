/**
 * OpenAPI Documentation Test Script
 * 
 * This script verifies that the generated OpenAPI documentation
 * includes all the notes API endpoints with proper schemas.
 */

import fs from 'fs';
import path from 'path';

const OPENAPI_PATH = path.join(process.cwd(), 'public', 'openapi.json');

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

function loadOpenAPISpec(): OpenAPISpec {
  if (!fs.existsSync(OPENAPI_PATH)) {
    throw new Error(`OpenAPI spec not found at ${OPENAPI_PATH}`);
  }
  
  const content = fs.readFileSync(OPENAPI_PATH, 'utf-8');
  return JSON.parse(content);
}

function testNotesEndpoints(spec: OpenAPISpec) {
  console.log('🔍 Testing Notes API endpoints...');
  
  const expectedEndpoints = [
    { path: '/notes', methods: ['get', 'post'] },
    { path: '/notes/{id}', methods: ['get', 'put', 'delete'] },
    { path: '/tags', methods: ['get'] }
  ];
  
  let passed = 0;
  let total = 0;
  
  for (const endpoint of expectedEndpoints) {
    const pathSpec = spec.paths[endpoint.path];
    
    if (!pathSpec) {
      console.log(`❌ Missing endpoint: ${endpoint.path}`);
      total += endpoint.methods.length;
      continue;
    }
    
    for (const method of endpoint.methods) {
      total++;
      const methodSpec = pathSpec[method];
      
      if (!methodSpec) {
        console.log(`❌ Missing method: ${method.toUpperCase()} ${endpoint.path}`);
        continue;
      }
      
      // Check if endpoint has authentication
      if (methodSpec.security && methodSpec.security.length > 0) {
        console.log(`✅ ${method.toUpperCase()} ${endpoint.path} - has authentication`);
      } else {
        console.log(`⚠️  ${method.toUpperCase()} ${endpoint.path} - missing authentication`);
      }
      
      passed++;
    }
  }
  
  console.log(`\n📊 Notes endpoints: ${passed}/${total} passed\n`);
  return { passed, total };
}

function testSchemas(spec: OpenAPISpec) {
  console.log('🔍 Testing Schema definitions...');
  
  const expectedSchemas = [
    'EditorContentSchema',
    'EditorBlockSchema',
    'CreateNoteSchema',
    'UpdateNoteSchema',
    'NoteResponseSchema',
    'NotesResponseSchema',
    'TagsResponseSchema',
    'HeaderBlockDataSchema',
    'ParagraphBlockDataSchema',
    'ListBlockDataSchema',
    'QuoteBlockDataSchema',
    'DelimiterBlockDataSchema'
  ];
  
  let passed = 0;
  let total = expectedSchemas.length;
  
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
  console.log('🔍 Testing Editor.js integration...');
  
  const editorContentSchema = spec.components.schemas.EditorContentSchema;
  
  if (!editorContentSchema) {
    console.log('❌ EditorContentSchema not found');
    return { passed: 0, total: 1 };
  }
  
  const requiredFields = ['time', 'blocks', 'version'];
  let passed = 0;
  
  for (const field of requiredFields) {
    if (editorContentSchema.properties && editorContentSchema.properties[field]) {
      console.log(`✅ EditorContent has ${field} field`);
      passed++;
    } else {
      console.log(`❌ EditorContent missing ${field} field`);
    }
  }
  
  // Check if blocks is an array of EditorBlock
  const blocksProperty = editorContentSchema.properties?.blocks;
  if (blocksProperty?.type === 'array' && blocksProperty.items?.$ref?.includes('EditorBlockSchema')) {
    console.log('✅ EditorContent.blocks references EditorBlockSchema');
    passed++;
  } else {
    console.log('❌ EditorContent.blocks does not properly reference EditorBlockSchema');
  }
  
  console.log(`\n📊 Editor.js integration: ${passed}/${requiredFields.length + 1} passed\n`);
  return { passed, total: requiredFields.length + 1 };
}

function testAuthenticationSetup(spec: OpenAPISpec) {
  console.log('🔍 Testing Authentication setup...');
  
  let passed = 0;
  let total = 2;
  
  // Check if BearerAuth is defined
  if (spec.components.securitySchemes?.BearerAuth) {
    console.log('✅ BearerAuth security scheme defined');
    passed++;
  } else {
    console.log('❌ BearerAuth security scheme missing');
  }
  
  // Check if notes endpoints use authentication
  const notesGetEndpoint = spec.paths['/notes']?.get;
  if (notesGetEndpoint?.security?.some((s: any) => s.BearerAuth)) {
    console.log('✅ Notes endpoints use BearerAuth');
    passed++;
  } else {
    console.log('❌ Notes endpoints missing BearerAuth');
  }
  
  console.log(`\n📊 Authentication: ${passed}/${total} passed\n`);
  return { passed, total };
}

async function runTests() {
  console.log('🚀 Starting OpenAPI Documentation Tests');
  console.log('=====================================\n');
  
  try {
    const spec = loadOpenAPISpec();
    
    console.log(`📋 OpenAPI Version: ${spec.openapi}`);
    console.log(`📋 API Title: ${spec.info.title}`);
    console.log(`📋 API Version: ${spec.info.version}\n`);
    
    const endpointsResult = testNotesEndpoints(spec);
    const schemasResult = testSchemas(spec);
    const editorJsResult = testEditorJsIntegration(spec);
    const authResult = testAuthenticationSetup(spec);
    
    const totalPassed = endpointsResult.passed + schemasResult.passed + editorJsResult.passed + authResult.passed;
    const totalTests = endpointsResult.total + schemasResult.total + editorJsResult.total + authResult.total;
    
    console.log('=====================================');
    console.log(`🎯 Overall Results: ${totalPassed}/${totalTests} tests passed`);
    
    if (totalPassed === totalTests) {
      console.log('🎉 All tests passed! OpenAPI documentation is complete.');
    } else {
      console.log('⚠️  Some tests failed. Please review the OpenAPI documentation.');
    }
    
    // Additional info
    console.log('\n📍 Additional Information:');
    console.log(`   - Total API endpoints: ${Object.keys(spec.paths).length}`);
    console.log(`   - Total schemas: ${Object.keys(spec.components.schemas).length}`);
    console.log(`   - OpenAPI file size: ${(fs.statSync(OPENAPI_PATH).size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
