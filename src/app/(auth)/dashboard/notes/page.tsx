"use client";

import Editor from "@/components/editor";
import { NoteDialog } from "@/components/note-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import data from "@/data/data.json";
import {
  useNoteSlug,
  useTagFilter,
  useSearchQuery,
  useNavParam,
} from "@/hooks/use-params";
import { UTFToLocalTime } from "@/lib/time";
import { Calendar, Tag, Search, X, Archive, ArrowLeft } from "lucide-react";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  // Filter notes based on current filters
  const filteredNotes = useMemo(() => {
    return data.notes.filter((item) => {
      // Tag filter
      const tagMatch = !tag || item.tags.includes(tag);

      // Search filter (title and content)
      const searchMatch =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

      // Navigation filter (archived status)
      const navMatch = nav === "archived" ? item.isArchived : !item.isArchived;

      return tagMatch && searchMatch && navMatch;
    });
  }, [tag, query, nav]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    data.notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  // Calculate tag counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    data.notes.forEach((note) => {
      note.tags.forEach((tagName) => {
        counts.set(tagName, (counts.get(tagName) || 0) + 1);
      });
    });
    return counts;
  }, []);

  const displayNote = data.notes.find((item) => item.slug === slug);

  // Mobile view: Show different content based on navigation state
  const renderMobileView = () => {
    // Show note editor on mobile when note is selected
    if (slug && displayNote) {
      return (
        <div className="flex flex-col h-full">
          {/* Mobile note header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSlug(null)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate flex-1">
              {displayNote.title}
            </h1>
          </div>

          {/* Mobile note content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="text-muted-foreground flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4" />
              <span>Tags:</span>
              {displayNote.tags.map((tagName, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className={`h-7 px-3 text-xs ${
                    tag === tagName
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                  onClick={() => setTag(tag === tagName ? null : tagName)}
                >
                  {tagName}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="text-muted-foreground flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span>Status</span>
                <select
                  className="bg-white border border-border rounded px-2 py-1 text-foreground text-xs appearance-none cursor-pointer hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  value={displayNote.isArchived ? "archived" : "active"}
                  onChange={() => {}}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last edited</span>
                <span>{UTFToLocalTime(displayNote.lastEdited || "")}</span>
              </div>
            </div>

            <div className="border border-solid border-border w-full" />
            <Editor editorId="mobile-editor" />
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
            {allTags.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tags found</p>
              </div>
            ) : (
              allTags.map((tagName) => (
                <Button
                  key={tagName}
                  variant="ghost"
                  className={`w-full flex items-center justify-between p-4 h-auto text-left ${
                    tag === tagName
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setTag(tagName);
                    setNav(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">{tagName}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {tagCounts.get(tagName) || 0}
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
              Showing {filteredNotes.length} notes
            </div>
          )}

          <div className="space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notes found matching your search</p>
              </div>
            ) : (
              filteredNotes.map((item) => (
                <Button
                  key={item.slug}
                  variant="ghost"
                  className="w-full h-auto flex flex-col items-start gap-2 p-4 text-left border border-border hover:bg-muted"
                  onClick={() => setSlug(item.slug)}
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
        <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
          Create Note
        </Button>

        {(tag || query || nav) && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredNotes.length} notes
            {(tag || query || nav) && ` (of ${data.notes.length} total)`}
          </div>
        )}

        <div className="space-y-2">
          {filteredNotes.length === 0 ? (
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
            filteredNotes.map((item) => (
              <Button
                key={item.slug}
                variant="ghost"
                className="w-full h-auto flex flex-col items-start gap-2 p-4 text-left border border-border hover:bg-muted"
                onClick={() => setSlug(item.slug)}
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

  return (
    <section className="flex h-full w-full">
      {/* Desktop Layout */}
      <nav className="flex-col gap-4 p-4 w-1/4 overflow-y-scroll max-h-full hidden md:flex lg:flex">
        {/* Create Note Button */}
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Create Note
        </Button>

        {/* Filter Results Count */}
        {(tag || query || nav) && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredNotes.length} notes
            {(tag || query || nav) && ` (of ${data.notes.length} total)`}
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-2">
          {filteredNotes.length === 0 ? (
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
            filteredNotes.map((item) => (
              <Button
                key={item.slug}
                variant="ghost"
                className={`w-full h-fit flex items-start flex-col gap-3 justify-between text-left border border-solid p-4 whitespace-normal ${
                  slug === item.slug
                    ? "bg-gray-200 text-black border-none"
                    : "bg-secondary text-secondary-foreground hover:bg-muted border-border"
                }`}
                onClick={() => setSlug(item.slug)}
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
          <>
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-foreground flex-1">
                {displayNote.title}
              </h1>
            </div>

            <div className="text-muted-foreground flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4" />
              <span>Tags:</span>
              {displayNote.tags.map((tagName, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className={`h-7 px-3 text-xs ${
                    tag === tagName
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                  onClick={() => setTag(tag === tagName ? null : tagName)}
                >
                  {tagName}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="text-muted-foreground flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span>Status</span>
                <select
                  className="bg-white border border-border rounded px-2 py-1 text-foreground text-xs appearance-none cursor-pointer hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border-none"
                  value={displayNote.isArchived ? "archived" : "active"}
                  onChange={() => {}}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last edited</span>
                <span>{UTFToLocalTime(displayNote.lastEdited || "")}</span>
              </div>
            </div>

            <div className="border border-solid border-border w-full" />
            <Editor editorId="desktop-editor" />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <Tag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">Select a note</h2>
              <p>
                Choose a note from the left sidebar to start reading or editing
              </p>
              {(tag || query || nav) && filteredNotes.length === 0 && (
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
        <NoteDialog triggerText="Archive Note" type="archiveNote" />
        <NoteDialog triggerText="Delete Note" type="deleteNote" />
      </nav>
    </section>
  );
}
