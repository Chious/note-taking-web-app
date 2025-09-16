import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sun,
  Moon,
  Monitor,
  Circle,
  CaseSensitive,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type Action = "theme" | "font" | "account";

export async function generateStaticParams() {
  return [
    { settingAction: "theme" },
    { settingAction: "font" },
    { settingAction: "account" },
  ];
}

const themeOptions = [
  {
    id: "light",
    icon: Sun,
    title: "Light Mode",
    description: "Pick a clean and classic light theme",
  },
  {
    id: "dark",
    icon: Moon,
    title: "Dark Mode",
    description: "Choose a sleek dark theme for better focus",
  },
  {
    id: "system",
    icon: Monitor,
    title: "System Mode",
    description: "Automatically switch based on your system settings",
  },
];

function ThemeSettings() {
  return (
    <div className="space-y-6">
      <div>
        <div className="md:hidden mb-4 space-y-2">
          <Link href="/dashboard/notes" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </Link>
          <Link
            href="/dashboard/setting"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" /> Settings
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Color Theme</h2>
        <p className="text-muted-foreground">Choose your color theme there:</p>
      </div>

      <div className="space-y-4">
        {themeOptions.map((option) => {
          return (
            <Button
              key={option.id}
              variant="outline"
              className={`w-full h-auto p-4 flex items-start justify-start text-left transition-colors ${
                option.id === "light"
                  ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <option.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    option.id === "light"
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      option.id === "light"
                        ? "text-blue-900"
                        : "text-foreground"
                    }`}
                  >
                    {option.title}
                  </div>
                  <div
                    className={`text-sm ${
                      option.id === "light"
                        ? "text-blue-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option.description}
                  </div>
                </div>

                <div className="w-5">
                  <Circle
                    className={`w-5 h-5 flex-shrink-0 ${
                      option.id === "light"
                        ? "text-blue-500 fill-blue-500"
                        : "text-gray-300"
                    }`}
                  />
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="border border-solid border-border w-full" />

      <div className="flex gap-2 pt-4">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Apply Changes
        </Button>
      </div>
    </div>
  );
}

const fontOptions = [
  {
    id: "sans-serif",
    icon: CaseSensitive,
    title: "Sans Serif",
    description: "Clean and modern, easy to read.",
  },
  {
    id: "serif",
    icon: CaseSensitive,
    title: "Serif",
    description: "Classic and elegant for a timeless feel.",
  },
  {
    id: "monospace",
    icon: CaseSensitive,
    title: "Monospace",
    description: "Code-like and precise for technical vibe.",
  },
];

function FontSettings() {
  return (
    <div className="space-y-6">
      <div>
        <div className="md:hidden mb-4 space-y-2">
          <Link href="/dashboard/notes" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </Link>
          <Link
            href="/dashboard/setting"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" /> Settings
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Font Theme</h2>
        <p className="text-muted-foreground">Choose your font style here:</p>
      </div>

      <div className="space-y-4">
        {fontOptions.map((option) => {
          return (
            <Button
              key={option.id}
              variant="outline"
              className={`w-full h-auto p-4 flex items-start justify-start text-left transition-colors ${
                option.id === "light"
                  ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <option.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    option.id === "light"
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      option.id === "light"
                        ? "text-blue-900"
                        : "text-foreground"
                    }`}
                  >
                    {option.title}
                  </div>
                  <div
                    className={`text-sm ${
                      option.id === "light"
                        ? "text-blue-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option.description}
                  </div>
                </div>

                <div className="w-5">
                  <Circle
                    className={`w-5 h-5 flex-shrink-0 ${
                      option.id === "light"
                        ? "text-blue-500 fill-blue-500"
                        : "text-gray-300"
                    }`}
                  />
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="border border-solid border-border w-full" />

      <div className="flex gap-2 pt-4">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <div className="md:hidden mb-4 space-y-2">
          <Link href="/dashboard/notes" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </Link>
          <Link
            href="/dashboard/setting"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" /> Settings
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and password:
        </p>
      </div>

      <div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Old Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter your new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your new password"
            />
          </div>
        </div>
      </div>

      <div className="border border-solid border-border w-full" />

      <div className="flex gap-2 pt-4">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Save Changes
        </Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}

export default async function SettingActionPage({
  params,
}: {
  params: Promise<{ settingAction: Action }>;
}) {
  const { settingAction } = await params;

  switch (settingAction) {
    case "theme":
      return <ThemeSettings />;
    case "font":
      return <FontSettings />;
    case "account":
      return <AccountSettings />;
    default:
      return <ThemeSettings />;
  }
}
