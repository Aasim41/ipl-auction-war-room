/**
 * Screen Orientation Manager for Mobile / Capacitor & Web
 * Allows dynamic switching between Landscape (War Room, Auction, Trade, Lineups)
 * and Portrait (Match Simulation / Ball-by-Ball Arena for ergonomic mobile gameplay).
 */

export type ScreenOrientationType = 'portrait' | 'landscape';

let currentLockedOrientation: ScreenOrientationType = 'landscape';

export async function lockOrientation(target: ScreenOrientationType): Promise<void> {
  currentLockedOrientation = target;

  // 1. Native Capacitor Environment (@capacitor/screen-orientation)
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation');
    if (ScreenOrientation && typeof ScreenOrientation.lock === 'function') {
      await ScreenOrientation.lock({
        orientation: target === 'portrait' ? 'portrait' : 'landscape',
      });
      return;
    }
  } catch {
    // Not running inside native Capacitor environment or plugin unavailable
  }

  // 2. Standard Web Screen Orientation API (Modern Mobile Browsers / PWA)
  try {
    if (typeof window !== 'undefined' && window.screen && 'orientation' in window.screen) {
      const orientation = window.screen.orientation as any;
      if (typeof orientation.lock === 'function') {
        const webTarget = target === 'portrait' ? 'portrait-primary' : 'landscape-primary';
        await orientation.lock(webTarget);
        return;
      }
    }
  } catch {
    // Browser might reject orientation lock without user gesture or unsupported
  }
}

export async function unlockOrientation(): Promise<void> {
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation');
    if (ScreenOrientation && typeof ScreenOrientation.unlock === 'function') {
      await ScreenOrientation.unlock();
    }
  } catch {
    // Ignore
  }

  try {
    if (typeof window !== 'undefined' && window.screen && 'orientation' in window.screen) {
      const orientation = window.screen.orientation as any;
      if (typeof orientation.unlock === 'function') {
        orientation.unlock();
      }
    }
  } catch {
    // Ignore
  }
}

export function getCurrentLockedOrientation(): ScreenOrientationType {
  return currentLockedOrientation;
}
