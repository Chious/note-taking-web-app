"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { FileText, Archive, Tag, Search, Settings } from "lucide-react";
import Image from "next/image";
import data from "@/data/data.json";
import { useNavParam, useTagFilter } from "@/hooks/use-params";
import { useRouter } from "next/navigation";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ className }: SidebarProps) {
  const { nav, setNav } = useNavParam();
  const { tag, setTag } = useTagFilter();
  const router = useRouter();

  // Calculate real counts from data
  const counts = useMemo(() => {
    const allNotes = data.notes.filter((note) => !note.isArchived);
    const archivedNotes = data.notes.filter((note) => note.isArchived);

    const tagCounts = new Map<string, number>();
    data.notes.forEach((note) => {
      note.tags.forEach((tagName) => {
        tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1);
      });
    });

    return {
      allNotes: allNotes.length,
      archived: archivedNotes.length,
      tags: tagCounts,
    };
  }, []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    data.notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  const navigationItems = [
    {
      section: "notes",
      title: "Notes",
      items: [
        {
          id: "all-notes",
          label: "All Notes",
          icon: FileText,
          count: counts.allNotes,
          onClick: () => setNav(null),
        },
        {
          id: "archived",
          label: "Archived Notes",
          icon: Archive,
          count: counts.archived,
          onClick: () => setNav("archived"),
        },
      ],
    },
    {
      section: "tags",
      title: "Tags",
      items: [
        {
          id: "all-tags",
          label: "All Tags",
          icon: Tag,
          count: allTags.length,
          onClick: () => setTag(null),
        },
        ...allTags.map((tagName) => ({
          id: `tag-${tagName}`,
          label: tagName,
          icon: Tag,
          count: counts.tags.get(tagName) || 0,
          onClick: () => setTag(tagName),
        })),
      ],
    },
  ];

  const mobileNavItems = [
    {
      id: "home",
      label: "Home",
      icon: FileText,
      onClick: () => {
        setNav(null);
        setTag(null);
      },
      isActive: !nav && !tag,
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      onClick: () => setNav("search"),
      isActive: nav === "search",
    },
    {
      id: "archived",
      label: "Archive",
      icon: Archive,
      onClick: () => {
        setNav("archived");
        setTag(null);
      },
      isActive: nav === "archived",
    },
    {
      id: "tags",
      label: "Tags",
      icon: Tag,
      onClick: () => {
        setTag(null);
        setNav("tags");
      },
      isActive: nav === "tags",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      onClick: () => router.push("/dashboard/setting"),
      isActive: false, // Settings is handled by separate page
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen",
          className
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Image src="/logo.svg" alt="Note App" width={100} height={100} />
        </div>
        <nav className="flex-1 p-4 space-y-6">
          {navigationItems.map((section) => (
            <div key={section.section}>
              <h2 className="text-sm font-semibold text-sidebar-foreground/70 mb-3 uppercase tracking-wide">
                {section.title}
              </h2>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = nav === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => item.onClick?.()}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-blue-500" : ""
                            )}
                          />
                          <span>{item.label}</span>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out -translate-x-full"
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Image src="/logo.svg" alt="Note App" width={100} height={100} />
        </div>
        <nav className="flex-1 p-4 space-y-6">
          {navigationItems.map((section) => (
            <div key={section.section}>
              <h2 className="text-sm font-semibold text-sidebar-foreground/70 mb-3 uppercase tracking-wide">
                {section.title}
              </h2>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = nav === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => item.onClick?.()}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-blue-500" : ""
                            )}
                          />
                          <span>{item.label}</span>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => item.onClick?.()}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  item.isActive ? "text-blue-500" : "text-sidebar-foreground/70"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
