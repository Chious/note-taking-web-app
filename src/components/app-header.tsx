"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavParam, useSearchQuery, useTagFilter } from "@/hooks/use-params";

interface AppHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  className?: string;
}

export function AppHeader({ showSearch = true, className }: AppHeaderProps) {
  const [searchInput, setSearchInput] = useState("");

  // Get URL parameters safely
  const { nav } = useNavParam();
  const { query, setQuery } = useSearchQuery();
  const { tag } = useTagFilter();

  // Sync search input with URL query parameter
  useEffect(() => {
    setSearchInput(query || "");
  }, [query]);

  // Get dynamic title
  const getPageTitle = () => {
    if (query) {
      return `Search: "${query}"`;
    }
    switch (nav) {
      case "archived":
        return "Archived Notes";
      default:
        if (tag) {
          return `Tag: ${tag}`;
        }
        return "My Notes";
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchInput.trim();
    setQuery(trimmedQuery || null);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setQuery(null);
  };

  // Handle key press for real-time search (optional)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  return (
    <header
      className={cn(
        "bg-background border-b border-border px-4 py-3 flex items-center justify-between gap-4",
        className
      )}
    >
      {/* Dynamic title */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
        <h1 className="text-xl font-semibold text-foreground truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Desktop: Search bar */}
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center gap-2 flex-1 max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes, content, or tags..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-10 bg-muted/50 border-muted focus:bg-background"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted-foreground/10"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Mobile: Search bar */}
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="md:hidden flex-1 max-w-xs"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-10 bg-muted/50 border-muted focus:bg-background text-sm"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted-foreground/10"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </form>
      )}
    </header>
  );
}
