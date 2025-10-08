import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";
import { notes, tags, noteTags } from "@/lib/schema";
import { UpdateNoteSchema } from "@/schemas/notes";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import {
  validateEditorContent,
  stringifyEditorContent,
} from "@/lib/editor-utils";
import z from "zod";

/**
 * Get note by ID
 * @description Retrieve a specific note by its ID with tags
 * @response NoteResponseSchema:Note retrieved successfully
 * @auth apikey
 * @tag Notes
 * @openapi
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Get the note
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .limit(1);

    console.log("note", note);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Get tags for the note
    const noteTags_result = await db
      .select({ name: tags.name })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(eq(noteTags.noteId, note.id));

    const noteWithTags = {
      ...note,
      content: typeof note.content === 'string' ? JSON.parse(note.content) : note.content,
      tags: noteTags_result.map((tag) => tag.name),
    };

    return NextResponse.json({
      message: "Note retrieved successfully",
      note: noteWithTags,
    });
  } catch (error) {
    console.error("GET /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve note" },
      { status: 500 }
    );
  }
}

/**
 * Update note
 * @description Update an existing note's title, content, tags, or archive status
 * @body UpdateNoteSchema
 * @response NoteResponseSchema:Note updated successfully
 * @auth apikey
 * @tag Notes
 * @openapi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Check if note exists and belongs to user
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .limit(1);

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log("Received update data:", JSON.stringify(body, null, 2));

    let validatedData;
    try {
      validatedData = UpdateNoteSchema.parse(body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
    } catch (validationError) {
      console.error("Validation error:", validationError);
      
      // Handle Zod validation errors specifically
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationError.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          error: "Invalid request data",
          details:
            validationError instanceof Error
              ? validationError.message
              : "Unknown validation error",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
      lastEdited: now,
    };

    // Update title if provided
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }

    // Update content if provided
    if (validatedData.content !== undefined) {
      const validatedContent = validateEditorContent(validatedData.content);
      updateData.content = stringifyEditorContent(validatedContent);
    }

    // Update archive status if provided
    if (validatedData.isArchived !== undefined) {
      updateData.isArchived = validatedData.isArchived;
    }

    // Update the note
    const [updatedNote] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();

    // Handle tags update if provided
    let updatedTags: string[] = [];
    if (validatedData.tags !== undefined) {
      // Remove all existing tag relationships
      await db.delete(noteTags).where(eq(noteTags.noteId, id));

      // Add new tag relationships
      if (validatedData.tags.length > 0) {
        for (const tagName of validatedData.tags) {
          // Check if tag exists for this user
          let [existingTag] = await db
            .select()
            .from(tags)
            .where(
              and(eq(tags.name, tagName), eq(tags.userId, session.user.id))
            )
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
            noteId: id,
            tagId: existingTag.id,
          });

          updatedTags.push(tagName);
        }
      }
    } else {
      // If tags not provided, get existing tags
      const existingTags = await db
        .select({ name: tags.name })
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(eq(noteTags.noteId, id));

      updatedTags = existingTags.map((tag) => tag.name);
    }

    return NextResponse.json({
      message: "Note updated successfully",
      note: {
        ...updatedNote,
        content:
          validatedData.content !== undefined
            ? validatedData.content
            : updatedNote.content, // Drizzle ORM with mode: 'json' already handles parsing
        tags: updatedTags,
      },
    });
  } catch (error) {
    console.error("PUT /api/notes/[id] error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

/**
 * Delete note
 * @description Permanently delete a note and its associated tags
 * @response 200:Note deleted successfully
 * @auth apikey
 * @tag Notes
 * @openapi
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Check if note exists and belongs to user
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .limit(1);

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Delete note-tag relationships first (due to foreign key constraints)
    await db.delete(noteTags).where(eq(noteTags.noteId, id));

    // Delete the note
    await db.delete(notes).where(eq(notes.id, id));

    return NextResponse.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
