/**
 * Simple API Integration Test Script
 * 
 * This script tests the notes API endpoints with real database operations.
 * Run with: tsx scripts/test-api.ts
 */

import { createSimpleEditorContent } from '../src/lib/editor-utils';

const API_BASE = 'http://localhost:3000/api';

// Test credentials (should match seeded data)
const TEST_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'password123'
};

let authToken: string | null = null;
let testNoteId: string | null = null;

async function login() {
  console.log('🔐 Logging in...');
  
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_CREDENTIALS),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  authToken = data.token;
  console.log('✅ Login successful');
}

async function testCreateNote() {
  console.log('\n📝 Testing note creation...');
  
  const noteData = {
    title: 'API Test Note',
    content: createSimpleEditorContent('This is a test note created via API'),
    tags: ['api-test', 'integration', 'test']
  };

  const response = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create note failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  testNoteId = data.note.id;
  
  console.log('✅ Note created successfully');
  console.log(`   ID: ${testNoteId}`);
  console.log(`   Title: ${data.note.title}`);
  console.log(`   Tags: ${data.note.tags.join(', ')}`);
}

async function testGetNotes() {
  console.log('\n📋 Testing notes retrieval...');
  
  const response = await fetch(`${API_BASE}/notes?page=1&limit=5`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Get notes failed: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('✅ Notes retrieved successfully');
  console.log(`   Total notes: ${data.data.total}`);
  console.log(`   Retrieved: ${data.data.notes.length} notes`);
  
  if (data.data.notes.length > 0) {
    const firstNote = data.data.notes[0];
    console.log(`   First note: "${firstNote.title}" with ${firstNote.tags.length} tags`);
  }
}

async function testGetSingleNote() {
  if (!testNoteId) {
    console.log('⚠️  Skipping single note test - no test note ID');
    return;
  }

  console.log('\n🔍 Testing single note retrieval...');
  
  const response = await fetch(`${API_BASE}/notes/${testNoteId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Get single note failed: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('✅ Single note retrieved successfully');
  console.log(`   Title: ${data.note.title}`);
  console.log(`   Content blocks: ${data.note.content.blocks.length}`);
  console.log(`   Tags: ${data.note.tags.join(', ')}`);
}

async function testUpdateNote() {
  if (!testNoteId) {
    console.log('⚠️  Skipping update test - no test note ID');
    return;
  }

  console.log('\n✏️  Testing note update...');
  
  const updateData = {
    title: 'Updated API Test Note',
    tags: ['updated', 'api-test'],
    isArchived: false
  };

  const response = await fetch(`${API_BASE}/notes/${testNoteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Update note failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  
  console.log('✅ Note updated successfully');
  console.log(`   New title: ${data.note.title}`);
  console.log(`   New tags: ${data.note.tags.join(', ')}`);
}

async function testGetTags() {
  console.log('\n🏷️  Testing tags retrieval...');
  
  const response = await fetch(`${API_BASE}/tags`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Get tags failed: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('✅ Tags retrieved successfully');
  console.log(`   Total tags: ${data.data.total}`);
  
  if (data.data.tags.length > 0) {
    console.log('   Top tags:');
    data.data.tags.slice(0, 5).forEach((tag: any) => {
      console.log(`     - ${tag.name} (${tag.noteCount} notes)`);
    });
  }
}

async function testSearchAndFilter() {
  console.log('\n🔎 Testing search and filtering...');
  
  // Test search by title
  const searchResponse = await fetch(`${API_BASE}/notes?query=API`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (searchResponse.ok) {
    const searchData = await searchResponse.json();
    console.log(`✅ Search by title: found ${searchData.data.notes.length} notes`);
  }

  // Test filter by tags
  const tagFilterResponse = await fetch(`${API_BASE}/notes?tags=api-test`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (tagFilterResponse.ok) {
    const tagData = await tagFilterResponse.json();
    console.log(`✅ Filter by tags: found ${tagData.data.notes.length} notes`);
  }

  // Test filter by archive status
  const archiveFilterResponse = await fetch(`${API_BASE}/notes?isArchived=false`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (archiveFilterResponse.ok) {
    const archiveData = await archiveFilterResponse.json();
    console.log(`✅ Filter by archive status: found ${archiveData.data.notes.length} active notes`);
  }
}

async function testDeleteNote() {
  if (!testNoteId) {
    console.log('⚠️  Skipping delete test - no test note ID');
    return;
  }

  console.log('\n🗑️  Testing note deletion...');
  
  const response = await fetch(`${API_BASE}/notes/${testNoteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete note failed: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('✅ Note deleted successfully');
  console.log(`   Message: ${data.message}`);

  // Verify note is deleted
  const verifyResponse = await fetch(`${API_BASE}/notes/${testNoteId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (verifyResponse.status === 404) {
    console.log('✅ Deletion verified - note no longer exists');
  } else {
    console.log('⚠️  Warning: Note may still exist after deletion');
  }
}

async function runTests() {
  console.log('🚀 Starting API Integration Tests');
  console.log('=====================================');

  try {
    await login();
    await testCreateNote();
    await testGetNotes();
    await testGetSingleNote();
    await testUpdateNote();
    await testGetTags();
    await testSearchAndFilter();
    await testDeleteNote();

    console.log('\n🎉 All tests completed successfully!');
    console.log('=====================================');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
