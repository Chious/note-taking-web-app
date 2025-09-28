'use client';

import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' },
];

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-[9999] -translate-y-full focus-within:translate-y-0 transition-transform',
        className
      )}
      role="navigation"
      aria-label="Skip links"
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'sr-only focus:not-sr-only',
            'block px-4 py-2 bg-primary text-primary-foreground font-medium',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'hover:bg-primary/90 transition-colors'
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const target = document.querySelector(link.href);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Focus the target element if it's focusable
                if (target instanceof HTMLElement) {
                  target.focus();
                }
              }
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
