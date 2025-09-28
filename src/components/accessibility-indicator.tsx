'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityIndicatorProps {
  children: React.ReactNode;
  showFocusIndicator?: boolean;
  showLoadingState?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function AccessibilityIndicator({
  children,
  showFocusIndicator = true,
  showLoadingState = true,
  isLoading = false,
  className,
}: AccessibilityIndicatorProps) {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      className={cn(
        'relative',
        // High contrast mode adjustments
        isHighContrast && 'contrast-more border-2 border-current',
        // Focus indicator improvements
        showFocusIndicator && 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        // Reduced motion support
        prefersReducedMotion ? 'motion-reduce:transition-none' : 'transition-all duration-200',
        className
      )}
      data-high-contrast={isHighContrast}
      data-reduced-motion={prefersReducedMotion}
    >
      {children}
      
      {/* Loading state indicator for screen readers */}
      {showLoadingState && isLoading && (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-label="Loading content"
        >
          Loading...
        </div>
      )}
    </div>
  );
}

// Hook for detecting user accessibility preferences
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'light' as 'light' | 'dark',
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      });
    };

    updatePreferences();

    // Listen for changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    reducedMotionQuery.addEventListener('change', updatePreferences);
    highContrastQuery.addEventListener('change', updatePreferences);
    colorSchemeQuery.addEventListener('change', updatePreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      highContrastQuery.removeEventListener('change', updatePreferences);
      colorSchemeQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  return preferences;
}

// Component for ensuring proper color contrast
interface ContrastCheckerProps {
  backgroundColor?: string;
  textColor?: string;
  children: React.ReactNode;
  minContrast?: number;
}

export function ContrastChecker({
  backgroundColor = 'var(--background)',
  textColor = 'var(--foreground)',
  children,
  minContrast = 4.5,
}: ContrastCheckerProps) {
  const [hasGoodContrast, setHasGoodContrast] = useState(true);

  useEffect(() => {
    // This is a simplified contrast check
    // In a real implementation, you'd want to use a proper color contrast library
    const checkContrast = () => {
      try {
        const bgElement = document.createElement('div');
        bgElement.style.backgroundColor = backgroundColor;
        bgElement.style.color = textColor;
        document.body.appendChild(bgElement);
        
        const computedBg = window.getComputedStyle(bgElement).backgroundColor;
        const computedText = window.getComputedStyle(bgElement).color;
        
        document.body.removeChild(bgElement);
        
        // Simple heuristic - in a real app you'd calculate actual contrast ratio
        const bgLightness = computedBg.includes('rgb(255') || computedBg.includes('white');
        const textLightness = computedText.includes('rgb(0') || computedText.includes('black');
        
        setHasGoodContrast(bgLightness !== textLightness);
      } catch (error) {
        console.warn('Could not check color contrast:', error);
        setHasGoodContrast(true);
      }
    };

    checkContrast();
  }, [backgroundColor, textColor, minContrast]);

  return (
    <div
      data-contrast-warning={!hasGoodContrast}
      className={cn(
        !hasGoodContrast && 'ring-2 ring-yellow-500 ring-offset-2'
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {children}
      {!hasGoodContrast && (
        <div className="sr-only" role="alert">
          Warning: This content may have insufficient color contrast
        </div>
      )}
    </div>
  );
}
