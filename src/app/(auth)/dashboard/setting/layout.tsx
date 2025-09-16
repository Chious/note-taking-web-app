import { SettingsSidebar } from "@/components/sidebars/settings-sidebar";
import { ThreeColumnLayout } from "@/components/three-column-layout";
import React from "react";

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThreeColumnLayout leftSidebar={<SettingsSidebar />}>
      {children}
    </ThreeColumnLayout>
  );
}
