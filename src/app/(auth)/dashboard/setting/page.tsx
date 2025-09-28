import { SettingsSidebar } from "@/components/sidebars/settings-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingPage() {
  return (
    <div className="p-4 md:p-0">
      <div className="mb-6 md:hidden">
        <Link href="/dashboard/notes" className="mb-4 inline-block">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>
      <SettingsSidebar className="w-full md:hidden" />
    </div>
  );
}
