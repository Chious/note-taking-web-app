'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, HelpCircle } from 'lucide-react';
import { useKeyboardShortcutsContext } from '@/providers/keyboard-shortcuts-provider';
import { formatShortcut } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcutsContext();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      data-show-help
      aria-label="Show keyboard shortcuts"
    >
      <Keyboard className="h-4 w-4" />
      <span className="hidden sm:inline">Shortcuts</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the app more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="space-y-1">
                <li>• Most shortcuts work globally throughout the app</li>
                <li>• Some shortcuts may not work when typing in text fields</li>
                <li>• Use ⌘ (Cmd) on Mac or Ctrl on Windows/Linux</li>
                <li>• Press <Badge variant="outline" className="text-xs">?</Badge> anytime to open this help</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
