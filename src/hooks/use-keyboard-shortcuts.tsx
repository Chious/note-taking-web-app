'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  target?: HTMLElement | Document;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  target,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in input fields or EditorJS
    const activeElement = document.activeElement;
    const isInputElement = 
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute('contenteditable') === 'true' ||
      activeElement?.closest('[contenteditable="true"]') ||
      activeElement?.closest('.codex-editor') || // EditorJS container
      activeElement?.closest('[id*="editor"]'); // Any editor container

    // Only allow very specific shortcuts in input fields (just save and help)
    const allowInInputs = ['s', '?'];
    const shouldSkipInInput = isInputElement && !allowInInputs.includes(keyboardEvent.key.toLowerCase());

    if (shouldSkipInInput) {
      console.log('⏭️ Keyboard shortcut skipped (in input):', {
        key: keyboardEvent.key,
        activeElement: document.activeElement?.tagName,
        activeElementId: document.activeElement?.id,
        activeElementClass: document.activeElement?.className,
        isInputElement,
        allowedInInputs: allowInInputs,
      });
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = keyboardEvent.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === keyboardEvent.ctrlKey;
      const metaMatches = !!shortcut.metaKey === keyboardEvent.metaKey;
      const shiftMatches = !!shortcut.shiftKey === keyboardEvent.shiftKey;
      const altMatches = !!shortcut.altKey === keyboardEvent.altKey;

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        console.log('🎹 Keyboard shortcut triggered:', {
          key: shortcut.key,
          description: shortcut.description,
          category: shortcut.category,
          modifiers: {
            ctrl: shortcut.ctrlKey,
            meta: shortcut.metaKey,
            shift: shortcut.shiftKey,
            alt: shortcut.altKey,
          },
          activeElement: document.activeElement?.tagName,
          activeElementId: document.activeElement?.id,
        });
        
        if (shortcut.preventDefault !== false) {
          keyboardEvent.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    const targetElement = target || document;
    
    targetElement.addEventListener('keydown', handleKeyDown);
    
    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, target]);

  return { shortcuts: shortcutsRef.current };
}

// Helper function to format shortcut display text
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.metaKey) parts.push('⌘');
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('⇧');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}

// Hook for managing focus trapping
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key !== 'Tab') return;

      if (keyboardEvent.shiftKey) {
        if (document.activeElement === firstElement) {
          keyboardEvent.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          keyboardEvent.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Escape') {
        // Let parent components handle escape
        keyboardEvent.stopPropagation();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);
    
    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive, containerRef]);
}

// Hook for managing focus restoration
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}
