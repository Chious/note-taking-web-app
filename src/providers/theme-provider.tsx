"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import "@radix-ui/themes/styles.css";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemeProvider>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
