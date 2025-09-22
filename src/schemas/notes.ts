import { z } from "zod";

// Editor.js block data schemas
export const HeaderBlockDataSchema = z.object({
  text: z.string().describe("Header text content"),
  level: z.number().int().min(1).max(6).describe("Header level (1-6)"),
});

export const ParagraphBlockDataSchema = z.object({
  text: z.string().describe("Paragraph text content"),
});

export const ListBlockDataSchema = z.object({
  style: z.enum(["ordered", "unordered"]).describe("List style"),
  items: z.array(z.string()).describe("List items"),
});

export const QuoteBlockDataSchema = z.object({
  text: z.string().describe("Quote text content"),
  caption: z.string().optional().describe("Quote caption/author"),
  alignment: z.enum(["left", "center"]).optional().describe("Quote alignment"),
});

export const DelimiterBlockDataSchema = z.object({}).describe("Delimiter block (no data)");

// Union type for all possible block data
export const BlockDataSchema = z.union([
  HeaderBlockDataSchema,
  ParagraphBlockDataSchema,
  ListBlockDataSchema,
  QuoteBlockDataSchema,
  DelimiterBlockDataSchema,
]);

// Editor.js block schema
export const EditorBlockSchema = z.object({
  id: z.string().describe("Unique block identifier"),
  type: z.enum(["header", "paragraph", "list", "quote", "delimiter"]).describe("Block type"),
  data: BlockDataSchema.describe("Block-specific data"),
});

// Editor.js content schema
export const EditorContentSchema = z.object({
  time: z.number().describe("Content creation/modification timestamp"),
  blocks: z.array(EditorBlockSchema).describe("Array of content blocks"),
  version: z.string().describe("Editor.js version"),
});

// Note creation/update schemas
export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").describe("Note title"),
  content: EditorContentSchema.describe("Note content in Editor.js format"),
  tags: z.array(z.string()).optional().default([]).describe("Array of tag names"),
});

export const UpdateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").optional().describe("Note title"),
  content: EditorContentSchema.optional().describe("Note content in Editor.js format"),
  tags: z.array(z.string()).optional().describe("Array of tag names"),
  isArchived: z.boolean().optional().describe("Archive status"),
});

// Note response schema
export const NoteSchema = z.object({
  id: z.string().describe("Unique note identifier"),
  userId: z.string().describe("Owner user ID"),
  title: z.string().describe("Note title"),
  content: EditorContentSchema.describe("Note content in Editor.js format"),
  tags: z.array(z.string()).describe("Array of tag names"),
  isArchived: z.boolean().describe("Archive status"),
  createdAt: z.string().describe("Creation timestamp"),
  updatedAt: z.string().describe("Last update timestamp"),
  lastEdited: z.string().describe("Last edit timestamp"),
});

// Notes list response schema
export const NotesListSchema = z.object({
  notes: z.array(NoteSchema).describe("Array of notes"),
  total: z.number().int().min(0).describe("Total number of notes"),
  page: z.number().int().min(1).describe("Current page number"),
  limit: z.number().int().min(1).describe("Items per page"),
});

// Search/filter schemas
export const NoteSearchSchema = z.object({
  query: z.string().optional().describe("Search query"),
  tags: z.array(z.string()).optional().describe("Filter by tags"),
  isArchived: z.boolean().optional().describe("Filter by archive status"),
  page: z.number().int().min(1).optional().default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).optional().default(20).describe("Items per page"),
});

// Tag schemas
export const TagSchema = z.object({
  id: z.string().describe("Unique tag identifier"),
  name: z.string().describe("Tag name"),
  userId: z.string().describe("Owner user ID"),
  noteCount: z.number().int().min(0).describe("Number of notes with this tag"),
  createdAt: z.string().describe("Creation timestamp"),
  updatedAt: z.string().describe("Last update timestamp"),
});

export const TagsListSchema = z.object({
  tags: z.array(TagSchema).describe("Array of tags"),
  total: z.number().int().min(0).describe("Total number of tags"),
});

// API response schemas
export const NoteResponseSchema = z.object({
  message: z.string().describe("Response message"),
  note: NoteSchema,
});

export const NotesResponseSchema = z.object({
  message: z.string().describe("Response message"),
  data: NotesListSchema,
});

export const TagsResponseSchema = z.object({
  message: z.string().describe("Response message"),
  data: TagsListSchema,
});

// Type exports for TypeScript usage
export type HeaderBlockData = z.infer<typeof HeaderBlockDataSchema>;
export type ParagraphBlockData = z.infer<typeof ParagraphBlockDataSchema>;
export type ListBlockData = z.infer<typeof ListBlockDataSchema>;
export type QuoteBlockData = z.infer<typeof QuoteBlockDataSchema>;
export type DelimiterBlockData = z.infer<typeof DelimiterBlockDataSchema>;
export type BlockData = z.infer<typeof BlockDataSchema>;
export type EditorBlock = z.infer<typeof EditorBlockSchema>;
export type EditorContent = z.infer<typeof EditorContentSchema>;
export type CreateNote = z.infer<typeof CreateNoteSchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type NotesList = z.infer<typeof NotesListSchema>;
export type NoteSearch = z.infer<typeof NoteSearchSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type TagsList = z.infer<typeof TagsListSchema>;
export type NoteResponse = z.infer<typeof NoteResponseSchema>;
export type NotesResponse = z.infer<typeof NotesResponseSchema>;
export type TagsResponse = z.infer<typeof TagsResponseSchema>;
