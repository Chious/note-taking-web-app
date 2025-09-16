import React from "react";

interface ThreeColumnLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  hideLeftSidebar?: boolean;
  hideRightSidebar?: boolean;
}

export function ThreeColumnLayout({
  leftSidebar,
  rightSidebar,
  children,
  hideLeftSidebar = false,
  hideRightSidebar = false,
}: ThreeColumnLayoutProps) {
  return (
    <section className="flex h-full w-full">
      {/* 左側欄 */}
      {!hideLeftSidebar && (
        <nav className="flex-col gap-4 p-4 w-1/4 overflow-y-scroll max-h-full hidden md:flex lg:flex">
          {leftSidebar}
        </nav>
      )}

      {/* 主要內容區域 */}
      <section
        className={`p-4 h-full flex item-start justify-start flex-col gap-4 ${
          hideLeftSidebar && hideRightSidebar
            ? "flex-1"
            : hideLeftSidebar || hideRightSidebar
            ? "w-3/4 flex-1"
            : "flex-1"
        }`}
      >
        {children}
      </section>

      {/* 右側欄 */}
      {!hideRightSidebar && (
        <nav className="flex-col gap-4 p-4 w-1/4 hidden md:flex lg:flex">
          {rightSidebar}
        </nav>
      )}
    </section>
  );
}
