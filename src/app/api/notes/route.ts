import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getDb } from '@/lib/db';
import { notes, tags, noteTags, type Note } from '@/lib/schema';
import { CreateNoteSchema, NoteSearchSchema } from '@/schemas/notes';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import {
  validateEditorContent,
  stringifyEditorContent,
  extractTextFromEditorContent,
  parseEditorContent,
} from '@/lib/editor-utils';
import z from 'zod';

export const NotesQueryParams = z.object({
  title: z.string().optional().describe('Filter by note title'),
  content: z.string().optional().describe('Filter by note content'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
  archived: z.boolean().optional().describe('Filter by archive status'),
  limit: z.number().optional().describe('Limit number of results'),
  offset: z.number().optional().describe('Offset for pagination'),
});

/**
 * Get notes with optional filters
 * @description Retrieve notes with optional filters for title, content, tags, and archive status
 * @params NoteSearchSchema
 * @response NotesResponseSchema:Notes retrieved successfully
 * @auth apikey
 * @tag Notes
 * @openapi
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      query: searchParams.get('query') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      isArchived:
        searchParams.get('isArchived') === 'true'
          ? true
          : searchParams.get('isArchived') === 'false'
          ? false
          : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Validate query parameters
    const validatedParams = NoteSearchSchema.parse(queryParams);
    const db = getDb();

    // Build the base query
    const whereConditions = [eq(notes.userId, session.user.id)];

    // Add archive filter
    if (validatedParams.isArchived !== undefined) {
      whereConditions.push(eq(notes.isArchived, validatedParams.isArchived));
    }

    // Build base query conditions (without text search for now)
    const baseWhereConditions = [...whereConditions];

    // Get notes with tag filtering if needed
    let allNotes: Note[];
    if (validatedParams.tags && validatedParams.tags.length > 0) {
      // Complex query with tag filtering
      const taggedNoteIds = await db
        .select({ noteId: noteTags.noteId })
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(
          and(
            eq(tags.userId, session.user.id),
            inArray(tags.name, validatedParams.tags)
          )
        );

      const noteIds = taggedNoteIds.map(row => row.noteId);

      if (noteIds.length === 0) {
        allNotes = [];
      } else {
        baseWhereConditions.push(inArray(notes.id, noteIds));
        allNotes = await db
          .select()
          .from(notes)
          .where(and(...baseWhereConditions))
          .orderBy(desc(notes.lastEdited));
      }
    } else {
      // Simple query without tag filtering
      allNotes = await db
        .select()
        .from(notes)
        .where(and(...baseWhereConditions))
        .orderBy(desc(notes.lastEdited));
    }

    // Apply text search filter (search in both title and content)
    let filteredNotes = allNotes;
    if (validatedParams.query) {
      const searchQuery = validatedParams.query.toLowerCase();
      filteredNotes = allNotes.filter(note => {
        // Search in title
        const titleMatch = note.title.toLowerCase().includes(searchQuery);

        // Search in content
        let contentMatch = false;
        try {
          const content = parseEditorContent(note.content as string);
          const contentText = extractTextFromEditorContent(content);
          contentMatch = contentText.toLowerCase().includes(searchQuery);
        } catch (error) {
          // If content parsing fails, skip content search for this note
          console.warn(`Failed to parse content for note ${note.id}:`, error);
        }

        return titleMatch || contentMatch;
      });
    }

    // Apply pagination to filtered results
    const total = filteredNotes.length;
    const offset = (validatedParams.page - 1) * validatedParams.limit;
    const noteResults = filteredNotes.slice(
      offset,
      offset + validatedParams.limit
    );

    // Get tags for each note
    const notesWithTags = await Promise.all(
      noteResults.map(async note => {
        const noteTags_result = await db
          .select({ name: tags.name })
          .from(noteTags)
          .innerJoin(tags, eq(noteTags.tagId, tags.id))
          .where(eq(noteTags.noteId, note.id));

        return {
          ...note,
          content: note.content,
          tags: noteTags_result.map(tag => tag.name),
        };
      })
    );

    return NextResponse.json({
      message: 'Notes retrieved successfully',
      data: {
        notes: notesWithTags,
        total,
        page: validatedParams.page,
        limit: validatedParams.limit,
      },
    });
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve notes' },
      { status: 500 }
    );
  }
}

/**
 * Create note
 * @description Create a new note with title, content, and optional tags
 * @body CreateNoteSchema
 * @response 201:NoteResponseSchema:Note created successfully
 * @auth apikey
 * @tag Notes
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateNoteSchema.parse(body);

    // Validate Editor.js content
    const validatedContent = validateEditorContent(validatedData.content);

    const db = getDb();
    const noteId = createId();
    const now = new Date().toISOString();

    // Create the note
    const [newNote] = await db
      .insert(notes)
      .values({
        id: noteId,
        userId: session.user.id,
        title: validatedData.title,
        content: stringifyEditorContent(validatedContent),
        isArchived: false,
        createdAt: now,
        updatedAt: now,
        lastEdited: now,
      })
      .returning();

    // Handle tags
    const createdTags = [];
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        // Check if tag exists for this user
        let [existingTag] = await db
          .select()
          .from(tags)
          .where(and(eq(tags.name, tagName), eq(tags.userId, session.user.id)))
          .limit(1);

        // Create tag if it doesn't exist
        if (!existingTag) {
          [existingTag] = await db
            .insert(tags)
            .values({
              id: createId(),
              name: tagName,
              userId: session.user.id,
              createdAt: now,
              updatedAt: now,
            })
            .returning();
        }

        // Create note-tag relationship
        await db.insert(noteTags).values({
          noteId: noteId,
          tagId: existingTag.id,
        });

        createdTags.push(tagName);
      }
    }

    return NextResponse.json(
      {
        message: 'Note created successfully',
        note: {
          ...newNote,
          content: validatedContent,
          tags: createdTags,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/notes error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
