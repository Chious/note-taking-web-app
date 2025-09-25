import { EditorContent, EditorContentSchema } from '@/schemas/notes';

/**
 * Validates Editor.js content against the schema
 */
export function validateEditorContent(content: unknown): EditorContent {
  return EditorContentSchema.parse(content);
}

/**
 * Safely parses Editor.js content from JSON string
 */
export function parseEditorContent(contentJson: string): EditorContent {
  try {
    const parsed = JSON.parse(contentJson);
    return validateEditorContent(parsed);
  } catch (error) {
    throw new Error(`Invalid Editor.js content format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts Editor.js content to JSON string for database storage
 */
export function stringifyEditorContent(content: EditorContent): string {
  return JSON.stringify(content);
}

/**
 * Extracts plain text from Editor.js content for search purposes
 */
export function extractTextFromEditorContent(content: EditorContent): string {
  const textParts: string[] = [];
  
  for (const block of content.blocks) {
    switch (block.type) {
      case 'header':
        if ('text' in block.data) {
          textParts.push(block.data.text);
        }
        break;
      case 'paragraph':
        if ('text' in block.data) {
          textParts.push(block.data.text);
        }
        break;
      case 'list':
        if ('items' in block.data && Array.isArray(block.data.items)) {
          textParts.push(...block.data.items);
        }
        break;
      case 'quote':
        if ('text' in block.data) {
          textParts.push(block.data.text);
          if ('caption' in block.data && block.data.caption) {
            textParts.push(block.data.caption);
          }
        }
        break;
      case 'delimiter':
        // Delimiter blocks don't contain text
        break;
    }
  }
  
  return textParts.join(' ').trim();
}

/**
 * Creates a default empty Editor.js content structure
 */
export function createEmptyEditorContent(): EditorContent {
  return {
    time: Date.now(),
    blocks: [],
    version: "2.31.0"
  };
}

/**
 * Creates a simple Editor.js content with a single paragraph
 */
export function createSimpleEditorContent(text: string): EditorContent {
  return {
    time: Date.now(),
    blocks: [
      {
        id: generateBlockId(),
        type: "paragraph",
        data: {
          text: text
        }
      }
    ],
    version: "2.31.0"
  };
}

/**
 * Generates a random block ID (similar to Editor.js format)
 */
function generateBlockId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
