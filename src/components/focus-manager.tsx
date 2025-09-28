'use client';

import { useEffect, useRef } from 'react';
import { useFocusTrap, useFocusRestore } from '@/hooks/use-keyboard-shortcuts';

interface FocusManagerProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function FocusManager({
  children,
  trapFocus = false,
  restoreFocus = false,
  autoFocus = false,
  className,
}: FocusManagerProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { saveFocus, restoreFocus: restore } = useFocusRestore();

  // Use focus trap hook
  useFocusTrap(containerRef, trapFocus);

  useEffect(() => {
    if (restoreFocus) {
      saveFocus();
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      if (restoreFocus) {
        restore();
      }
    };
  }, [autoFocus, restoreFocus, saveFocus, restore]);

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </div>
  );
}

// Hook for managing focus within a specific element
export function useFocusWithin(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle arrow key navigation for lists
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const focusableElements = Array.from(
          element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ) as HTMLElement[];

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        
        if (currentIndex === -1) return;

        let nextIndex: number;
        
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        focusableElements[nextIndex]?.focus();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [elementRef]);
}

// Hook for managing roving tabindex
export function useRovingTabIndex(
  containerRef: React.RefObject<HTMLElement>,
  activeIndex: number,
  setActiveIndex: (index: number) => void
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll('[role="tab"], [role="option"], [role="menuitem"]')
    ) as HTMLElement[];

    // Set tabindex for all items
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    });

    // Focus active item if it's not already focused
    if (items[activeIndex] && document.activeElement !== items[activeIndex]) {
      items[activeIndex].focus();
    }
  }, [containerRef, activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const items = Array.from(
        container.querySelectorAll('[role="tab"], [role="option"], [role="menuitem"]')
      ) as HTMLElement[];

      if (items.length === 0) return;

      let newIndex = activeIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          newIndex = (activeIndex + 1) % items.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      setActiveIndex(newIndex);
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, activeIndex, setActiveIndex]);
}
