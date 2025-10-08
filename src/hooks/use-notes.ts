"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  type Note,
  type CreateNote,
  type UpdateNote,
  type NoteSearch,
  type NotesResponse,
  type NoteResponse,
} from "@/schemas/notes";

// API functions
async function fetchNotes(
  params: NoteSearch = { page: 1, limit: 20 }
): Promise<NotesResponse> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set("query", params.query);
  if (params.tags?.length) searchParams.set("tags", params.tags.join(","));
  if (params.isArchived !== undefined)
    searchParams.set("isArchived", String(params.isArchived));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const response = await fetch(`/api/notes?${searchParams.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notes: ${response.statusText}`);
  }

  const data = await response.json();

  // Parse JSON string content to object
  if (data.data && data.data.notes) {
    data.data.notes = data.data.notes.map((note: Note) => ({
      ...note,
      content:
        typeof note.content === "string"
          ? JSON.parse(note.content)
          : note.content,
    }));
  }

  return data;
}

async function fetchNote(id: string): Promise<NoteResponse> {
  const response = await fetch(`/api/notes/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch note: ${response.statusText}`);
  }

  const data = await response.json();

  // Parse JSON string content to object
  if (data.note && typeof data.note.content === "string") {
    data.note.content = JSON.parse(data.note.content);
  }

  return data;
}

async function createNote(data: CreateNote): Promise<NoteResponse> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || `Failed to create note: ${response.statusText}`
    );
  }

  const result = await response.json();

  // Parse JSON string content to object
  if (result.note && typeof result.note.content === "string") {
    result.note.content = JSON.parse(result.note.content);
  }

  return result;
}

async function updateNote(id: string, data: UpdateNote): Promise<NoteResponse> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || `Failed to update note: ${response.statusText}`
    );
  }

  const result = await response.json();

  // Parse JSON string content to object
  if (result.note && typeof result.note.content === "string") {
    result.note.content = JSON.parse(result.note.content);
  }

  return result;
}

async function deleteNote(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || `Failed to delete note: ${response.statusText}`
    );
  }

  return response.json();
}

// Cache key factory
const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (params: NoteSearch) => [...noteKeys.lists(), params] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

// Custom hooks
export function useNotes(params: NoteSearch = { page: 1, limit: 20 }) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => fetchNotes(params),
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useNote(id: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => fetchNote(id),
    enabled: !!session?.user?.id && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (data) => {
      // Invalidate and refetch notes lists
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });

      // Add the new note to the cache
      queryClient.setQueryData(noteKeys.detail(data.note.id), data);

      // Log cache activity for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Note created and cache updated:", data.note.id);
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Failed to create note:", error);
      }
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNote }) =>
      updateNote(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });

      // Snapshot the previous value
      const previousNote = queryClient.getQueryData<NoteResponse>(
        noteKeys.detail(id)
      );

      // Optimistically update the cache
      if (previousNote) {
        const optimisticNote: Note = {
          ...previousNote.note,
          ...data,
          updatedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        };

        queryClient.setQueryData(noteKeys.detail(id), {
          ...previousNote,
          note: optimisticNote,
        });

        if (process.env.NODE_ENV === "development") {
          console.log("🔄 Optimistic update applied for note:", id);
        }
      }

      return { previousNote };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousNote) {
        queryClient.setQueryData(noteKeys.detail(id), context.previousNote);

        if (process.env.NODE_ENV === "development") {
          console.log("↩️ Rollback applied for note:", id);
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.error("❌ Failed to update note:", error);
      }
    },
    onSuccess: (data, { id }) => {
      // Update the cache with the server response
      queryClient.setQueryData(noteKeys.detail(id), data);

      // Invalidate notes lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Note updated and cache synced:", id);
      }
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });

      // Snapshot the previous value
      const previousNote = queryClient.getQueryData<NoteResponse>(
        noteKeys.detail(id)
      );

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });

      if (process.env.NODE_ENV === "development") {
        console.log("🗑️ Optimistic deletion applied for note:", id);
      }

      return { previousNote };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousNote) {
        queryClient.setQueryData(noteKeys.detail(id), context.previousNote);

        if (process.env.NODE_ENV === "development") {
          console.log("↩️ Rollback applied for note:", id);
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.error("❌ Failed to delete note:", error);
      }
    },
    onSuccess: (data, id) => {
      // Invalidate notes lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Note deleted and cache updated:", id);
      }
    },
  });
}

// Prefetching utility
export function usePrefetchNote() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return (id: string) => {
    if (!session?.user?.id) return;

    queryClient.prefetchQuery({
      queryKey: noteKeys.detail(id),
      queryFn: () => fetchNote(id),
      staleTime: 0, // TODO: set to 5 minute cache (5 * 60 * 1000)
    });

    if (process.env.NODE_ENV === "development") {
      console.log("🚀 Prefetching note:", id);
    }
  };
}

// Utility function to extract text content from Editor.js content
export function extractTextFromEditorContent(content: unknown): string {
  if (!content || typeof content !== "object" || !("blocks" in content))
    return "";

  const editorContent = content as {
    blocks: Array<{ type: string; data: Record<string, unknown> }>;
  };

  return editorContent.blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "header":
          return (block.data.text as string) || "";
        case "list":
          return ((block.data.items as string[]) || []).join(" ");
        case "quote":
          return (block.data.text as string) || "";
        default:
          return "";
      }
    })
    .join(" ")
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .trim();
}
