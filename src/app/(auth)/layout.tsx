import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { URLParamsProvider } from "@/hooks/use-params";
import { SkipLinks } from "@/components/skip-links";
import { KeyboardShortcutsProvider } from "@/providers/keyboard-shortcuts-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <URLParamsProvider>
      <KeyboardShortcutsProvider>
        <SkipLinks />
        <div className="w-screen h-screen flex flex-col md:flex-row">
          {/* Sidebar */}
          <Suspense fallback={<div className="w-64 bg-background border-r" />}>
            <nav id="navigation" aria-label="Main navigation">
              <AppSidebar />
            </nav>
          </Suspense>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <Suspense fallback={<div className="h-16 bg-background border-b" />}>
              <header role="banner">
                <AppHeader showSearch={true} />
              </header>
            </Suspense>

            {/* Page Content */}
            <main id="main-content" className="flex-1 overflow-hidden" role="main" aria-label="Main content">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
                    <span className="sr-only">Loading content...</span>
                    Loading...
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
          </div>
        </div>
      </KeyboardShortcutsProvider>
    </URLParamsProvider>
  );
}
