import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getDb } from '@/lib/db';
import { notes, tags, noteTags, type Note } from '@/lib/schema';
import { CreateNoteSchema, NoteSearchSchema } from '@/schemas/notes';
import { eq, and, desc, like, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import {
  validateEditorContent,
  stringifyEditorContent,
} from '@/lib/editor-utils';
import z from 'zod';

/**
 * Get notes
 * @description Get notes with optional filters
 * @security cookieAuth
 * @response NotesResponseSchema:Notes retrieved successfully
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

    // Add text search filter
    if (validatedParams.query) {
      whereConditions.push(like(notes.title, `%${validatedParams.query}%`));
    }

    // Calculate offset for pagination
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Get notes with tag filtering if needed
    let noteResults: Note[];
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
        noteResults = [];
      } else {
        whereConditions.push(inArray(notes.id, noteIds));
        noteResults = await db
          .select()
          .from(notes)
          .where(and(...whereConditions))
          .orderBy(desc(notes.lastEdited))
          .limit(validatedParams.limit)
          .offset(offset);
      }
    } else {
      // Simple query without tag filtering
      noteResults = await db
        .select()
        .from(notes)
        .where(and(...whereConditions))
        .orderBy(desc(notes.lastEdited))
        .limit(validatedParams.limit)
        .offset(offset);
    }

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

    // Get total count for pagination
    const totalResult = await db
      .select({ count: notes.id })
      .from(notes)
      .where(and(...whereConditions.slice(0, -1))); // Exclude limit/offset conditions

    const total = totalResult.length;

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
 * @security cookieAuth
 * @body CreateNoteSchema
 * @response NoteResponseSchema:Note created successfully
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
