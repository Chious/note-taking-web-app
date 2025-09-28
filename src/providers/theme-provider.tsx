'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import '@radix-ui/themes/styles.css';

type Font = 'sans' | 'serif' | 'mono';

interface FontProviderProps {
  children: React.ReactNode;
  defaultFont?: Font;
}

type FontProviderState = {
  font: Font;
  setFont: (font: Font) => void;
};

const initialFontState: FontProviderState = {
  font: 'sans',
  setFont: () => null,
};

const FontProviderContext = createContext<FontProviderState>(initialFontState);

function FontProvider({
  children,
  defaultFont = 'sans',
  ...props
}: FontProviderProps) {
  const [font, setFont] = useState<Font>(defaultFont);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load font preference from localStorage
    const savedFont = localStorage.getItem('font-preference') as Font;
    if (savedFont && ['sans', 'serif', 'mono'].includes(savedFont)) {
      setFont(savedFont);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const root = window.document.documentElement;

    // Remove previous font classes from both html and body
    root.classList.remove('font-sans', 'font-serif', 'font-mono');
    document.body.classList.remove('font-sans', 'font-serif', 'font-mono');

    // Add current font class to html element (for inheritance)
    root.classList.add(`font-${font}`);

    // Also add to body as backup
    document.body.classList.add(`font-${font}`);

    // Alternative approach: Set CSS custom property directly
    const fontFamilyMap = {
      sans: 'var(--font-inter)',
      serif: 'var(--font-noto-serif)',
      mono: 'var(--font-source-code-pro)',
    };

    root.style.setProperty('--current-font-family', fontFamilyMap[font]);

    // Save to localStorage
    localStorage.setItem('font-preference', font);

    // Force a style recalculation
    document.body.style.fontFamily = '';
  }, [font, isClient]);

  const value = {
    font,
    setFont,
  };

  return (
    <FontProviderContext.Provider {...props} value={value}>
      {children}
    </FontProviderContext.Provider>
  );
}

export const useFont = () => {
  const context = useContext(FontProviderContext);

  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }

  return context;
};

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
      <FontProvider>{children}</FontProvider>
    </NextThemeProvider>
  );
}
