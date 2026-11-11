import { useState, useEffect } from 'react';

/**
 * Tracks whether the viewport meets the wide desktop breakpoint (1280px+).
 */
export function useIsWideDesktop(minWidthPx = 1280): boolean {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return Boolean(window.matchMedia(`(min-width: ${minWidthPx}px)`)?.matches);
  };

  const [isWide, setIsWide] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const media = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    if (!media) return;
    const onChange = () => setIsWide(media.matches);
    setIsWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [minWidthPx]);

  return isWide;
}
