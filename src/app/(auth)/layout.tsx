import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { URLParamsProvider } from "@/hooks/use-params";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <URLParamsProvider>
      <main className="w-screen h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <Suspense fallback={<div className="w-64 bg-background border-r" />}>
          <AppSidebar />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <Suspense fallback={<div className="h-16 bg-background border-b" />}>
            <AppHeader showSearch={true} />
          </Suspense>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  Loading...
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>
      </main>
    </URLParamsProvider>
  );
}
