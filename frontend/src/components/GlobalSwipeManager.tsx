'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Gavel, ArrowLeftRight, Users, Shield, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

const SCREEN_SEQUENCE = [
  { path: '/', label: 'War Room', icon: Home, short: 'Home' },
  { path: '/auction', label: 'Auction', icon: Gavel, short: 'Auction' },
  { path: '/trade', label: 'Trade', icon: ArrowLeftRight, short: 'Trade' },
  { path: '/playing-xi', label: 'Lineup', icon: Users, short: 'Lineup' },
  { path: '/squad', label: 'Squad', icon: Shield, short: 'Squad' },
];

export function GlobalSwipeManager() {
  const pathname = usePathname();
  const router = useRouter();

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);

  const currentIndex = SCREEN_SEQUENCE.findIndex(s => s.path === pathname);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept touches inside inputs, textareas or elements explicitly marked to ignore global swipe
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('select') ||
        target?.closest('[data-swipe-ignore="true"]') ||
        target?.closest('.no-global-swipe')
      ) {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        return;
      }

      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return;
      if (currentIndex === -1) return; // not in main sequence

      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      // Strict horizontal swipe: magnitude > 65px and predominantly horizontal
      if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        // Swipe Left -> Next screen in sequence
        if (deltaX < 0 && currentIndex < SCREEN_SEQUENCE.length - 1) {
          const nextScreen = SCREEN_SEQUENCE[currentIndex + 1];
          gameAudio.playUiTap('select');
          triggerGameHaptic('medium');
          setSwipeHint(`Navigating to ${nextScreen.label} ➔`);
          setTimeout(() => setSwipeHint(null), 1200);
          router.push(nextScreen.path);
        }
        // Swipe Right -> Previous screen in sequence
        else if (deltaX > 0 && currentIndex > 0) {
          const prevScreen = SCREEN_SEQUENCE[currentIndex - 1];
          gameAudio.playUiTap('select');
          triggerGameHaptic('medium');
          setSwipeHint(`⬅ Navigating to ${prevScreen.label}`);
          setTimeout(() => setSwipeHint(null), 1200);
          router.push(prevScreen.path);
        }
      }

      touchStartXRef.current = null;
      touchStartYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pathname, currentIndex, router]);

  // Only render on core screens
  if (currentIndex === -1) return null;

  return (
    <>
      {/* Dynamic Swipe Toast Banner */}
      {swipeHint && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[999] pointer-events-none animate-fadeIn">
          <div className="px-4 py-1.5 rounded-full bg-slate-900/95 border border-amber-400 text-amber-300 font-mono font-bold text-xs shadow-2xl backdrop-blur-md">
            {swipeHint}
          </div>
        </div>
      )}

      {/* Floating Mobile Bottom Screen Dock with Swipe Indicators */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden pointer-events-none flex flex-col items-center pb-[max(env(safe-area-inset-bottom,0px),8px)]">
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border border-white/15 px-2 py-1 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.8)] flex items-center gap-1">
          {SCREEN_SEQUENCE.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === currentIndex;
            return (
              <button
                key={s.path}
                onClick={() => {
                  if (pathname !== s.path) {
                    gameAudio.playUiTap('light');
                    triggerGameHaptic('light');
                    router.push(s.path);
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black flex items-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={s.label}
              >
                <Icon size={12} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
                <span>{s.short}</span>
              </button>
            );
          })}
        </div>
        <div className="text-[8px] font-mono text-gray-500 mt-0.5 tracking-wider uppercase">
          ← Swipe to Switch Screens →
        </div>
      </div>
    </>
  );
}
