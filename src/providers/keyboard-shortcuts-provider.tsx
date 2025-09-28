'use client';

import { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { useNoteSlug } from '@/hooks/use-params';

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  showShortcutsHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  onCreateNote?: () => void;
  onSaveNote?: () => void;
  onShowHelp?: () => void;
}

export function KeyboardShortcutsProvider({
  children,
  onCreateNote,
  onSaveNote,
  onShowHelp,
}: KeyboardShortcutsProviderProps) {
  const router = useRouter();
  const { setSlug } = useNoteSlug();

  const handleCreateNote = useCallback(() => {
    if (onCreateNote) {
      onCreateNote();
    } else {
      // Default behavior: navigate to notes page and trigger create
      router.push('/dashboard/notes');
      setSlug(null);
      // Trigger create note action
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-note]') as HTMLButtonElement;
        createButton?.click();
      }, 100);
    }
  }, [onCreateNote, router, setSlug]);

  const handleSaveNote = useCallback(() => {
    if (onSaveNote) {
      onSaveNote();
    } else {
      // Default behavior: find and click save button
      const saveButton = document.querySelector('[data-save-note]') as HTMLButtonElement;
      saveButton?.click();
    }
  }, [onSaveNote]);

  const handleShowHelp = useCallback(() => {
    if (onShowHelp) {
      onShowHelp();
    } else {
      // Default behavior: show keyboard shortcuts modal
      const helpButton = document.querySelector('[data-show-help]') as HTMLButtonElement;
      helpButton?.click();
    }
  }, [onShowHelp]);

  const shortcuts: KeyboardShortcut[] = [
    // Core navigation shortcuts only
    {
      key: 'n',
      metaKey: true,
      action: handleCreateNote,
      description: 'Create new note',
      category: 'Navigation',
    },
    {
      key: 's',
      metaKey: true,
      action: handleSaveNote,
      description: 'Save current note',
      category: 'Editor',
    },
    {
      key: '?',
      shiftKey: true,
      action: handleShowHelp,
      description: 'Show keyboard shortcuts',
      category: 'Help',
    },
  ];

  // Register global shortcuts
  useKeyboardShortcuts({
    shortcuts,
    enabled: true,
  });

  const showShortcutsHelp = useCallback(() => {
    handleShowHelp();
  }, [handleShowHelp]);

  const contextValue: KeyboardShortcutsContextType = {
    shortcuts,
    showShortcutsHelp,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
  }
  return context;
}
