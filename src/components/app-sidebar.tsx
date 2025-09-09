"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, Archive, Tag, Briefcase } from "lucide-react";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({
  className,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState("all-notes");

  const navigationItems = [
    {
      section: "notes",
      title: "Notes",
      items: [
        { id: "all-notes", label: "All Notes", icon: FileText, count: 24 },
        { id: "archived", label: "Archived Notes", icon: Archive, count: 8 },
      ],
    },
    {
      section: "tags",
      title: "Tags",
      items: [
        { id: "all-tags", label: "All", icon: Tag, count: 12 },
        { id: "work", label: "Work", icon: Briefcase, count: 6 },
      ],
    },
  ];

  const mobileNavItems = [
    { id: "all-notes", label: "All Notes", icon: FileText },
    { id: "work", label: "Work", icon: Briefcase },
    { id: "archived", label: "Archive", icon: Archive },
    { id: "tags", label: "Tags", icon: Tag },
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
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            Note App
          </h1>
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
                  const isActive = activeSection === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
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
          "md:hidden fixed top-0 left-0 z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            Note App
          </h1>
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
                  const isActive = activeSection === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          onClose?.();
                        }}
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
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-blue-500" : "text-sidebar-foreground/70"
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
