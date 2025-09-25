"use client";

import { NoteDialog } from "@/components/note-dialog";
import { NoteEditor, type NoteEditorRef } from "@/components/note-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useNoteSlug,
  useTagFilter,
  useSearchQuery,
  useNavParam,
} from "@/hooks/use-params";
import { UTFToLocalTime } from "@/lib/time";
import { Tag, Search, X, ArrowLeft, Trash, Archive } from "lucide-react";
import { useMemo, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotes, extractTextFromEditorContent } from "@/hooks/use-notes";
import { useTags } from "@/hooks/use-tags";
import { type Note } from "@/schemas/notes";

const templateNote: Partial<Note> = {
  title: "New Note",
  content: {
    time: Date.now(),
    blocks: [],
    version: "1.0.0",
  },
  isArchived: false,
  tags: [],
};

export default function NotesPage() {
  const { slug, setSlug } = useNoteSlug();
  const { tag, setTag } = useTagFilter();
  const { query, setQuery } = useSearchQuery();
  const { nav, setNav } = useNavParam();
  const router = useRouter();

  // Handle settings navigation on mobile
  useEffect(() => {
    if (nav === "settings") {
      router.push("/dashboard/setting");
      setNav(null);
    }
  }, [nav, router, setNav]);

  const {
    data: noteData,
    isLoading,
    error,
  } = useNotes({
    page: 1,
    limit: 100,
  });

  // Filter notes based on current filters
  const filteredNotes = useMemo(() => {
    return noteData?.data.notes.filter((item) => {
      // Tag filter
      const tagMatch = !tag || item.tags.includes(tag);

      // Search filter (title, content, and tags)
      const searchMatch =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        extractTextFromEditorContent(item.content)
          .toLowerCase()
          .includes(query.toLowerCase());

      // Navigation filter (archived status)
      const navMatch = nav === "archived" ? item.isArchived : !item.isArchived;

      return tagMatch && searchMatch && navMatch;
    });
  }, [tag, query, nav, noteData]);

  // Get all unique tags
  const { data: tagsData } = useTags();

  // Calculate tag counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    noteData?.data.notes.forEach((note) => {
      note.tags.forEach((tagName) => {
        counts.set(tagName, (counts.get(tagName) || 0) + 1);
      });
    });
    return counts;
  }, [noteData]);

  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const handleCreateNote = () => {
    setSlug(null); // Clear any selected note
    setDisplayNote(templateNote);
    setIsCreatingNote(true); // Set creating note state
  };

  const handleDeleteSuccess = () => {
    setSlug(null);
    setIsCreatingNote(false);
    setDisplayNote(null);
  };

  const handleArchiveSuccess = () => {
    setSlug(null);
    setIsCreatingNote(false);
    setDisplayNote(null);
  };

  const [displayNote, setDisplayNote] = useState<Note | Partial<Note> | null>(
    null
  );

  const noteEditorRef = useRef<NoteEditorRef>(null);

  // Mobile view: Show different content based on navigation state
  const renderMobileView = () => {
    // Show note editor on mobile when note is selected or creating new note
    if (!nav && ((slug && displayNote) || (isCreatingNote && displayNote))) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSlug(null);
                setIsCreatingNote(false);
                setDisplayNote(null);
              }}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Button>
            <h1 className="text-lg font-semibold truncate flex-1 text-gray-500">
              Go Back
            </h1>
            {displayNote?.id && (
              <NoteDialog
                triggerText=""
                triggerVariant="ghost"
                triggerClassName="p-2 text-gray-500"
                type="deleteNote"
                noteId={displayNote.id}
                onSuccess={handleDeleteSuccess}
              >
                <Trash className="w-4 h-4" />
              </NoteDialog>
            )}

            {displayNote?.id && (
              <NoteDialog
                triggerText=""
                triggerVariant="ghost"
                triggerClassName="p-2 text-gray-500"
                type="archiveNote"
                noteId={displayNote.id}
                onSuccess={handleArchiveSuccess}
              >
                <Archive className="w-4 h-4" />
              </NoteDialog>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500"
              onClick={() => {
                setSlug(null);
                setIsCreatingNote(false);
                setDisplayNote(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500"
              onClick={() => {
                noteEditorRef.current?.save();
              }}
            >
              Save Note
            </Button>
          </div>
          <div className="flex-1 p-4">
            <NoteEditor
              ref={noteEditorRef}
              note={displayNote}
              onCancel={() => {
                setSlug(null);
                setIsCreatingNote(false);
                setDisplayNote(null);
              }}
              editorId={`mobile-shared-editor`}
            />
          </div>
        </div>
      );
    }

    // Show tags view on mobile
    if (nav === "tags") {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Tags</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNav(null)}
              className="text-blue-500"
            >
              Show Notes
            </Button>
          </div>

          <div className="space-y-2">
            {tagsData?.data.tags.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tags found</p>
              </div>
            ) : (
              tagsData?.data.tags.map((tagItem) => (
                <Button
                  key={tagItem.name}
                  variant="ghost"
                  className={`w-full flex items-center justify-between p-4 h-auto text-left ${
                    tag === tagItem.name
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setTag(tagItem.name);
                    setNav(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">{tagItem.name}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {tagCounts.get(tagItem.name) || 0}
                  </span>
                </Button>
              ))
            )}
          </div>
        </div>
      );
    }

    // Show search results on mobile
    if (nav === "search" || query) {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={query || ""}
                onChange={(e) => setQuery(e.target.value || null)}
                className="pl-10"
              />
            </div>
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery(null);
                  setNav(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {query && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredNotes?.length} notes
            </div>
          )}

          <div className="space-y-2">
            {filteredNotes?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notes found matching your search</p>
              </div>
            ) : (
              filteredNotes?.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full h-auto flex flex-col items-start gap-2 p-4 text-left border border-border hover:bg-muted"
                  onClick={() => setSlug(item.id)}
                >
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <div className="flex gap-1 flex-wrap">
                    {item.tags.map((tagName) => (
                      <span
                        key={tagName}
                        className="text-xs bg-neutral-600 text-white px-2 py-1 rounded"
                      >
                        {tagName}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {UTFToLocalTime(item.lastEdited)}
                  </span>
                </Button>
              ))
            )}
          </div>
        </div>
      );
    }

    // Default mobile notes list view
    return (
      <div className="p-4 space-y-4">
        <Button
          className="w-full bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleCreateNote}
        >
          Create Note
        </Button>

        {(tag || query || nav) && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredNotes?.length} notes
            {(tag || query || nav) &&
              ` (of ${noteData?.data.notes.length || 0} total)`}
          </div>
        )}

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading notes...</p>
            </div>
          ) : filteredNotes?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notes found matching your criteria</p>
              {(tag || query || nav) && (
                <p className="text-xs mt-2">
                  Try adjusting your filters in the sidebar
                </p>
              )}
            </div>
          ) : (
            filteredNotes?.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full h-auto flex flex-col items-start gap-2 p-4 text-left border border-border hover:bg-muted"
                onClick={() => {
                  setSlug(item.id);
                  setDisplayNote(item);
                }}
              >
                <h3 className="font-semibold text-base">{item.title}</h3>
                <div className="flex gap-1 flex-wrap">
                  {item.tags.map((tagName) => (
                    <span
                      key={tagName}
                      className={`text-xs rounded px-2 py-1 ${
                        tag === tagName
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-600 text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTag(tag === tagName ? null : tagName);
                      }}
                    >
                      {tagName}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {UTFToLocalTime(item.lastEdited)}
                </span>
              </Button>
            ))
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Search className="w-8 h-8 mx-auto mb-2" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Failed to load notes</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full">
      {/* Desktop Layout */}
      <nav className="flex-col gap-4 p-4 w-1/4 overflow-y-scroll max-h-full hidden md:flex lg:flex">
        {/* Create Note Button */}
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleCreateNote}
        >
          Create Note
        </Button>

        {/* Filter Results Count */}
        {(tag || query || nav) && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredNotes?.length} notes
            {(tag || query || nav) &&
              ` (of ${noteData?.data.notes.length || 0} total)`}
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading notes...</p>
            </div>
          ) : filteredNotes?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notes found matching your criteria</p>
              {(tag || query || nav) && (
                <p className="text-xs mt-2">
                  Try adjusting your filters in the sidebar
                </p>
              )}
            </div>
          ) : (
            filteredNotes?.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full h-fit flex items-start flex-col gap-3 justify-between text-left border border-solid p-4 whitespace-normal ${
                  slug === item.id
                    ? "bg-gray-200 text-black border-none"
                    : "bg-secondary text-secondary-foreground hover:bg-muted border-border"
                }`}
                onClick={() => {
                  setSlug(item.id);
                  setDisplayNote(item);
                }}
              >
                <h2 className="text-lg font-bold break-words">{item.title}</h2>
                <span className="text-sm flex gap-2 flex-wrap">
                  {item.tags.map((tagName) => (
                    <span
                      key={tagName}
                      className={`text-xs rounded-md px-2 py-1 ${
                        tag === tagName
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-600 text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTag(tag === tagName ? null : tagName);
                      }}
                    >
                      {tagName}
                    </span>
                  ))}
                </span>
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span>{UTFToLocalTime(item.lastEdited)}</span>
                </div>
              </Button>
            ))
          )}
        </div>
      </nav>

      {/* Mobile Layout */}
      <section className="md:hidden flex-1 h-full overflow-hidden">
        {renderMobileView()}
      </section>

      {/* Desktop Main Content */}
      <section className="hidden md:flex p-4 flex-1 h-full item-start justify-start flex-col gap-4">
        {displayNote ? (
          <div className="flex flex-col h-full">
            <NoteEditor
              ref={noteEditorRef}
              note={displayNote}
              onCancel={() => {
                setSlug(null);
                setIsCreatingNote(false);
                setDisplayNote(null);
              }}
              editorId={`desktop-shared-editor`}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <Tag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">Select a note</h2>
              <p>
                Choose a note from the left sidebar to start reading or editing
              </p>
              {(tag || query || nav) && filteredNotes?.length === 0 && (
                <div className="mt-4">
                  <p className="text-sm mb-2">
                    No notes match your current filters
                  </p>
                  <p className="text-xs">
                    Try adjusting your filters in the sidebar
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Desktop Right Sidebar */}
      <nav className="flex-col gap-4 p-4 w-1/4 hidden md:flex lg:flex">
        {displayNote && (
          <>
            <NoteDialog
              triggerText="Archive Note"
              type="archiveNote"
              noteId={displayNote.id || ""}
              onSuccess={() => setSlug(null)}
            />
            <NoteDialog
              triggerText="Delete Note"
              type="deleteNote"
              noteId={displayNote.id || ""}
              onSuccess={() => {
                setSlug(null);
                setDisplayNote(null);
              }}
            />
          </>
        )}
      </nav>
    </section>
  );
}
