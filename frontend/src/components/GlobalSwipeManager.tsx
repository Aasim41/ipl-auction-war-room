'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * GlobalSwipeManager:
 * Dispatches clean, calibrated 'app:swipe' custom events for in-page tabs and carousels
 * (e.g. Home Team Carousel, Trade Windows, Playing XI Dual Lineup, and Modal Toggles)
 * without hijacking global route navigation or obscuring bottom buttons with floating docks.
 */
export function GlobalSwipeManager() {
  const pathname = usePathname();

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept touches inside inputs, textareas, sliders, scrollable containers, or modals
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('select') ||
        target?.closest('button') ||
        target?.closest('.overflow-x-auto') ||
        target?.closest('[role="dialog"]') ||
        target?.closest('.fixed.inset-0') ||
        target?.closest('[data-swipe-ignore="true"]') ||
        target?.closest('.no-global-swipe')
      ) {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        return;
      }

      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      const deltaTime = Date.now() - touchStartTimeRef.current;

      touchStartXRef.current = null;
      touchStartYRef.current = null;

      // Ergonomic horizontal swipe detection:
      // Minimum 35px horizontal travel, predominantly horizontal, within 800ms
      const isHorizontalSwipe = Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 0.8 && deltaTime < 800;

      if (!isHorizontalSwipe) return;

      const direction = deltaX < 0 ? 'left' : 'right';

      // Dispatch custom event for inner tab handlers (e.g. playing-xi tabs, trade tabs, home team selection)
      const swipeEvent = new CustomEvent('app:swipe', {
        detail: { direction },
        cancelable: true,
      });
      window.dispatchEvent(swipeEvent);
    };

    const handleTouchCancel = () => {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [pathname]);

  return null;
}
