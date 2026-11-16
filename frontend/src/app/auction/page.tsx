'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gavel } from 'lucide-react';

export default function AuctionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/squad');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-slate-400 font-sans">
      <div className="text-center p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Gavel size={32} />
        </div>
        <h2 className="text-2xl font-black text-white font-display mb-2">
          Entering Unified Auction War Room
        </h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          The Live Gavel Auction Stage has been merged directly into your active Franchise Squad War Room.
        </p>
      </div>
    </div>
  );
}
