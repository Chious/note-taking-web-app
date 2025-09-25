"use client";

import { Button } from "@/components/ui/button";
import {
  useNotes,
  usePrefetchNote,
  extractTextFromEditorContent,
} from "@/hooks/use-notes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { type Note } from "@/schemas/notes";
import { Skeleton } from "@/components/ui/skeleton";

export function NotesSidebar() {
  const searchParams = useSearchParams();
  const prefetchNote = usePrefetchNote();

  // Get URL parameters safely
  const nav = searchParams?.get("nav") || null;
  const queryParam = searchParams?.get("q") || null;
  const tagFilter = searchParams?.get("tag") || null;

  // Build query parameters for the API
  const queryParams = useMemo(() => {
    const params: {
      query?: string;
      tags?: string[];
      isArchived?: boolean;
      page: number;
      limit: number;
    } = {
      page: 1,
      limit: 50, // Load more notes for sidebar
    };

    // Filter based on different navigation modes
    switch (nav) {
      case "search":
        if (queryParam) {
          params.query = queryParam;
        }
        break;
      case "archived":
        params.isArchived = true;
        break;
      case "tags":
        if (tagFilter) {
          params.tags = [tagFilter];
        }
        break;
      default:
        // Default: show non-archived notes
        params.isArchived = false;
    }

    return params;
  }, [nav, queryParam, tagFilter]);

  // Fetch notes using React Query
  const { data: notesResponse, isLoading, error } = useNotes(queryParams);
  const notes = notesResponse?.data.notes || [];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Button className="bg-blue-500 text-white hover:bg-blue-600">
        <Plus className="w-4 h-4 mr-2" />
        Create Note
      </Button>

      {/* Results count */}
      {(nav === "search" || nav === "archived" || nav === "tags") && (
        <div className="text-sm text-muted-foreground px-2 py-1">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            `Found ${notes.length} results`
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center text-center p-4 text-red-500">
          <p className="text-sm">Failed to load notes</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <LoadingSkeleton />}

      {/* Notes list */}
      {!isLoading && !error && (
        <>
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notes found</p>
            </div>
          ) : (
            notes.map((note: Note) => (
              <Button
                key={note.id}
                className="w-full h-fit flex items-start flex-col gap-2 justify-between text-left border border-solid bg-secondary text-secondary-foreground hover:bg-muted border-border p-4 whitespace-normal"
                onMouseEnter={() => prefetchNote(note.id)}
                onFocus={() => prefetchNote(note.id)}
              >
                <Link
                  href={`/dashboard/notes?id=${note.id}`}
                  className="w-full"
                >
                  <div className="flex items-start justify-between w-full mb-2">
                    <h2 className="text-lg font-bold break-words flex-1">
                      {note.title}
                    </h2>
                    {note.isArchived && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">
                        Archived
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground flex gap-2 flex-wrap mb-2">
                    {note.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-sm text-white rounded-md bg-neutral-600 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(note.lastEdited).toLocaleDateString()}
                  </span>
                  {nav === "search" && queryParam && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {extractTextFromEditorContent(note.content).substring(
                        0,
                        100
                      )}
                      ...
                    </p>
                  )}
                </Link>
              </Button>
            ))
          )}
        </>
      )}
    </>
  );
}
