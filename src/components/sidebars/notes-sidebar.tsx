"use client";

import { Button } from "@/components/ui/button";
import data from "@/data/data.json";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Search } from "lucide-react";

interface Note {
  slug: string;
  title: string;
  tags: string[];
  content: string;
  lastEdited: string;
  isArchived: boolean;
}

export function NotesSidebar() {
  const searchParams = useSearchParams();

  // Get URL parameters safely
  const nav = searchParams?.get("nav") || null;
  const queryParam = searchParams?.get("q") || null;
  const tagFilter = searchParams?.get("tag") || null;

  // Filter notes logic
  const filteredNotes = useMemo(() => {
    let notes = data.notes as Note[];

    // Filter based on different navigation modes
    switch (nav) {
      case "search":
        if (queryParam) {
          notes = notes.filter(
            (note) =>
              note.title.toLowerCase().includes(queryParam.toLowerCase()) ||
              note.content.toLowerCase().includes(queryParam.toLowerCase()) ||
              note.tags.some((tag) =>
                tag.toLowerCase().includes(queryParam.toLowerCase())
              )
          );
        }
        break;
      case "archived":
        notes = notes.filter((note) => note.isArchived);
        break;
      case "tags":
        if (tagFilter) {
          notes = notes.filter((note) =>
            note.tags.some((tag) =>
              tag.toLowerCase().includes(tagFilter.toLowerCase())
            )
          );
        }
        break;
      default:
        // 預設顯示未封存的筆記
        notes = notes.filter((note) => !note.isArchived);
    }

    return notes;
  }, [nav, queryParam, tagFilter]);

  return (
    <>
      <Button className="bg-blue-500 text-white hover:bg-blue-600">
        Create Note
      </Button>

      {/* Results count */}
      {(nav === "search" || nav === "archived" || nav === "tags") && (
        <div className="text-sm text-muted-foreground px-2 py-1">
          Found {filteredNotes.length} results
        </div>
      )}

      {/* Notes list */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
          <Search className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No notes found</p>
        </div>
      ) : (
        filteredNotes.map((item) => (
          <Button
            key={item.slug}
            className="w-full h-fit flex items-start flex-col gap-2 justify-between text-left border border-solid bg-secondary text-secondary-foreground hover:bg-muted border-border p-4 whitespace-normal"
          >
            <Link
              href={`/dashboard/notes?slug=${item.slug}`}
              className="w-full"
            >
              <div className="flex items-start justify-between w-full mb-2">
                <h2 className="text-lg font-bold break-words flex-1">
                  {item.title}
                </h2>
                {item.isArchived && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">
                    Archived
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground flex gap-2 flex-wrap mb-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm text-white rounded-md bg-neutral-600 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </span>
              <span className="text-muted-foreground text-xs">
                {item.lastEdited}
              </span>
              {nav === "search" && queryParam && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {item.content.substring(0, 100)}...
                </p>
              )}
            </Link>
          </Button>
        ))
      )}
    </>
  );
}
