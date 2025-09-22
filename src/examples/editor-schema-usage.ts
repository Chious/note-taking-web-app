/**
 * Example usage of the new Editor.js schemas and utilities
 * This file demonstrates how to work with the updated note content format
 */

import { 
  EditorContent, 
  CreateNote, 
  UpdateNote,
  EditorContentSchema,
  CreateNoteSchema,
  UpdateNoteSchema 
} from '@/schemas/notes';
import { 
  validateEditorContent, 
  parseEditorContent, 
  stringifyEditorContent,
  extractTextFromEditorContent,
  createEmptyEditorContent,
  createSimpleEditorContent 
} from '@/lib/editor-utils';

// Example 1: Creating Editor.js content that matches your log data
const exampleEditorContent: EditorContent = {
  time: 1758510184240,
  blocks: [
    {
      id: "imVfI2nrgM",
      type: "header",
      data: {
        text: "Title",
        level: 2
      }
    },
    {
      id: "jeeihO4yvs",
      type: "list",
      data: {
        style: "unordered",
        items: ["First item", "Second item", "Third item"]
      }
    }
  ],
  version: "2.31.0"
};

// Example 2: Validating Editor.js content
try {
  const validatedContent = validateEditorContent(exampleEditorContent);
  console.log('✅ Content is valid:', validatedContent);
} catch (error) {
  console.error('❌ Content validation failed:', error);
}

// Example 3: Creating a note with the new schema
const createNoteExample: CreateNote = {
  title: "My First Note",
  content: exampleEditorContent,
  tags: ["work", "important", "draft"]
};

// Validate the create note request
try {
  const validatedNote = CreateNoteSchema.parse(createNoteExample);
  console.log('✅ Create note request is valid:', validatedNote);
} catch (error) {
  console.error('❌ Create note validation failed:', error);
}

// Example 4: Updating a note
const updateNoteExample: UpdateNote = {
  title: "Updated Title",
  content: {
    time: Date.now(),
    blocks: [
      {
        id: "newBlockId",
        type: "paragraph",
        data: {
          text: "This is updated content"
        }
      }
    ],
    version: "2.31.0"
  },
  tags: ["updated", "work"]
};

// Example 5: Working with different block types
const complexEditorContent: EditorContent = {
  time: Date.now(),
  blocks: [
    {
      id: "header1",
      type: "header",
      data: {
        text: "Main Title",
        level: 1
      }
    },
    {
      id: "para1",
      type: "paragraph",
      data: {
        text: "This is a paragraph with some content."
      }
    },
    {
      id: "quote1",
      type: "quote",
      data: {
        text: "This is a quote block",
        caption: "Author Name",
        alignment: "left"
      }
    },
    {
      id: "list1",
      type: "list",
      data: {
        style: "ordered",
        items: [
          "First ordered item",
          "Second ordered item",
          "Third ordered item"
        ]
      }
    },
    {
      id: "delimiter1",
      type: "delimiter",
      data: {}
    }
  ],
  version: "2.31.0"
};

// Example 6: Extracting text for search
const searchableText = extractTextFromEditorContent(complexEditorContent);
console.log('Searchable text:', searchableText);

// Example 7: Converting to/from JSON for database storage
const contentAsJson = stringifyEditorContent(complexEditorContent);
console.log('JSON for database:', contentAsJson);

const parsedContent = parseEditorContent(contentAsJson);
console.log('Parsed back from JSON:', parsedContent);

// Example 8: Creating empty content
const emptyContent = createEmptyEditorContent();
console.log('Empty content:', emptyContent);

// Example 9: Creating simple content
const simpleContent = createSimpleEditorContent("Hello, this is a simple note!");
console.log('Simple content:', simpleContent);

// Example 10: Schema validation with error handling
function validateAndProcessNote(rawData: unknown) {
  try {
    // Validate the entire create note request
    const validNote = CreateNoteSchema.parse(rawData);
    
    // Extract searchable text
    const searchText = extractTextFromEditorContent(validNote.content);
    
    // Convert content to JSON for storage
    const contentJson = stringifyEditorContent(validNote.content);
    
    return {
      success: true,
      note: validNote,
      searchText,
      contentJson
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

// Test the validation function
const testData = {
  title: "Test Note",
  content: exampleEditorContent,
  tags: ["test"]
};

const result = validateAndProcessNote(testData);
console.log('Validation result:', result);

export {
  exampleEditorContent,
  createNoteExample,
  updateNoteExample,
  complexEditorContent,
  validateAndProcessNote
};
