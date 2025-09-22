/**
 * API Notes Endpoints Test Suite
 * 
 * Tests all CRUD operations for the notes API endpoints
 * with the new Editor.js content format and relational tags system.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createSimpleEditorContent } from '@/lib/editor-utils';
import type { EditorContent } from '@/schemas/notes';

// Mock data for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockEditorContent: EditorContent = {
  time: Date.now(),
  blocks: [
    {
      id: 'test-block-1',
      type: 'header',
      data: { text: 'Test Note Title', level: 1 }
    },
    {
      id: 'test-block-2',
      type: 'paragraph',
      data: { text: 'This is a test note content.' }
    }
  ],
  version: '2.31.0'
};

const mockCreateNoteData = {
  title: 'Test Note',
  content: mockEditorContent,
  tags: ['test', 'api', 'notes']
};

const mockUpdateNoteData = {
  title: 'Updated Test Note',
  content: createSimpleEditorContent('Updated content'),
  tags: ['updated', 'test'],
  isArchived: false
};

// Mock session for authentication
const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Helper function to mock authenticated requests
function mockAuthenticatedRequest(method: string, url: string, body?: any) {
  const request = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Mock getServerSession to return our mock session
  jest.mock('next-auth', () => ({
    getServerSession: jest.fn().mockResolvedValue(mockSession),
  }));

  return request;
}

describe('Notes API Endpoints', () => {
  let createdNoteId: string;

  beforeAll(async () => {
    // Setup test database or mock database calls
    console.log('Setting up Notes API tests...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up Notes API tests...');
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/notes', () => {
    it('should create a new note with valid data', async () => {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreateNoteData),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.message).toBe('Note created successfully');
      expect(data.note).toHaveProperty('id');
      expect(data.note.title).toBe(mockCreateNoteData.title);
      expect(data.note.content).toEqual(mockCreateNoteData.content);
      expect(data.note.tags).toEqual(mockCreateNoteData.tags);
      
      createdNoteId = data.note.id;
    });

    it('should reject invalid Editor.js content', async () => {
      const invalidData = {
        ...mockCreateNoteData,
        content: { invalid: 'content' }
      };

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Invalid request data');
    });

    it('should require authentication', async () => {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreateNoteData),
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/notes', () => {
    it('should retrieve notes with pagination', async () => {
      const response = await fetch('/api/notes?page=1&limit=10');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toBe('Notes retrieved successfully');
      expect(data.data).toHaveProperty('notes');
      expect(data.data).toHaveProperty('total');
      expect(data.data).toHaveProperty('page');
      expect(data.data).toHaveProperty('limit');
      expect(Array.isArray(data.data.notes)).toBe(true);
    });

    it('should filter notes by tags', async () => {
      const response = await fetch('/api/notes?tags=test,api');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.notes.every((note: any) => 
        note.tags.some((tag: string) => ['test', 'api'].includes(tag))
      )).toBe(true);
    });

    it('should filter notes by archive status', async () => {
      const response = await fetch('/api/notes?isArchived=false');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.notes.every((note: any) => note.isArchived === false)).toBe(true);
    });

    it('should search notes by title', async () => {
      const response = await fetch('/api/notes?query=Test');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.notes.every((note: any) => 
        note.title.toLowerCase().includes('test')
      )).toBe(true);
    });
  });

  describe('GET /api/notes/[id]', () => {
    it('should retrieve a specific note', async () => {
      const response = await fetch(`/api/notes/${createdNoteId}`);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toBe('Note retrieved successfully');
      expect(data.note.id).toBe(createdNoteId);
      expect(data.note).toHaveProperty('title');
      expect(data.note).toHaveProperty('content');
      expect(data.note).toHaveProperty('tags');
      expect(Array.isArray(data.note.tags)).toBe(true);
    });

    it('should return 404 for non-existent note', async () => {
      const response = await fetch('/api/notes/non-existent-id');

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Note not found');
    });
  });

  describe('PUT /api/notes/[id]', () => {
    it('should update a note with valid data', async () => {
      const response = await fetch(`/api/notes/${createdNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUpdateNoteData),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toBe('Note updated successfully');
      expect(data.note.title).toBe(mockUpdateNoteData.title);
      expect(data.note.tags).toEqual(mockUpdateNoteData.tags);
      expect(data.note.isArchived).toBe(mockUpdateNoteData.isArchived);
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { title: 'Partially Updated Title' };
      
      const response = await fetch(`/api/notes/${createdNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialUpdate),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.note.title).toBe(partialUpdate.title);
      // Other fields should remain unchanged
    });

    it('should return 404 for non-existent note', async () => {
      const response = await fetch('/api/notes/non-existent-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUpdateNoteData),
      });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Note not found');
    });
  });

  describe('DELETE /api/notes/[id]', () => {
    it('should delete a note', async () => {
      const response = await fetch(`/api/notes/${createdNoteId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toBe('Note deleted successfully');
    });

    it('should return 404 for non-existent note', async () => {
      const response = await fetch('/api/notes/non-existent-id', {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Note not found');
    });

    it('should verify note is actually deleted', async () => {
      // Try to get the deleted note
      const response = await fetch(`/api/notes/${createdNoteId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/tags', () => {
    it('should retrieve all tags with note counts', async () => {
      const response = await fetch('/api/tags');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toBe('Tags retrieved successfully');
      expect(data.data).toHaveProperty('tags');
      expect(data.data).toHaveProperty('total');
      expect(Array.isArray(data.data.tags)).toBe(true);
      
      if (data.data.tags.length > 0) {
        expect(data.data.tags[0]).toHaveProperty('id');
        expect(data.data.tags[0]).toHaveProperty('name');
        expect(data.data.tags[0]).toHaveProperty('noteCount');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
    });

    it('should handle database connection errors', async () => {
      // This would require mocking database failures
      // Implementation depends on your testing setup
    });
  });

  describe('Authorization', () => {
    it('should prevent access to other users notes', async () => {
      // This would require creating notes with different user IDs
      // and verifying they cannot be accessed by other users
    });
  });
});

// Export test utilities for use in other test files
export {
  mockUser,
  mockEditorContent,
  mockCreateNoteData,
  mockUpdateNoteData,
  mockSession,
};
