"use client";

import { Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
  className?: string;
}

export function AppHeader({
  title = "All Notes",
  showSearch = true,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "bg-background border-b border-border px-4 py-3 flex items-center justify-between",
        className
      )}
    >
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      {/* Desktop: Search bar */}
      {showSearch && (
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-10 bg-muted/50 border-muted focus:bg-background"
            />
          </div>

          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mobile: Search icon */}
      <div className="md:hidden">
        <Button variant="ghost" size="sm" className="p-2">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
