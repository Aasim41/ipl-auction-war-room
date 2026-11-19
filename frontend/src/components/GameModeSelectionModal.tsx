'use client';

import React, { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Trophy, 
  Gavel, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useCampaignStore } from '../store/useCampaignStore';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

interface GameModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: 'official_season' | 'scratch_inception') => void;
}

export default function GameModeSelectionModal({ 
  isOpen, 
  onClose,
  onSelectMode 
}: GameModeSelectionModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    getActiveCampaign, 
    createCampaign, 
    createScratchCampaign, 
    switchCampaign, 
    campaigns, 
    currentUser 
  } = useCampaignStore();
  
  const activeCampaign = getActiveCampaign();
  const currentMode = activeCampaign?.mode || (typeof window !== 'undefined' ? localStorage.getItem('auctionxi_preferred_game_mode') : null) || 'official_season';
  const [activeTab, setActiveTab] = useState<'official' | 'scratch'>(
    currentMode === 'scratch_inception' ? 'scratch' : 'official'
  );

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
      if (deltaX < 0) {
        setActiveTab('scratch');
        gameAudio.playUiTap('select');
        triggerGameHaptic('light');
      } else {
        setActiveTab('official');
        gameAudio.playUiTap('select');
        triggerGameHaptic('light');
      }
    }
  };

  const handleChooseOfficialMode = () => {
    gameAudio.playTradeDealSuccess();
    triggerGameHaptic('heavy');
    sessionStorage.setItem('auctionxi_game_mode_selected', 'official_season');
    localStorage.setItem('auctionxi_preferred_game_mode', 'official_season');

    if (onSelectMode) {
      onSelectMode('official_season');
    }

    onClose();

    // If already inside tournament pages, route to appropriate phase
    if (pathname !== '/') {
      const activeCamp = getActiveCampaign();
      if (activeCamp && activeCamp.mode === 'official_season') {
        const targetUrl = (activeCamp.currentPhase === 'playing_xi' || activeCamp.currentPhase === 'match')
          ? '/playing-xi'
          : activeCamp.currentPhase === 'mini_auction'
          ? '/auction'
          : activeCamp.currentPhase === 'retain_release'
          ? '/squad'
          : '/trade';
        router.push(targetUrl);
      } else {
        router.push('/');
      }
    }
  };

  const handleChooseScratchMode = () => {
    gameAudio.playConfettiFanfare();
    triggerGameHaptic('heavy');
    sessionStorage.setItem('auctionxi_game_mode_selected', 'scratch_inception');
    localStorage.setItem('auctionxi_preferred_game_mode', 'scratch_inception');

    if (onSelectMode) {
      onSelectMode('scratch_inception');
    }

    onClose();

    // If already inside tournament pages, route to draft
    if (pathname !== '/') {
      const activeCamp = getActiveCampaign();
      if (activeCamp && activeCamp.mode === 'scratch_inception') {
        const targetUrl = (activeCamp.currentPhase === 'playing_xi' || activeCamp.currentPhase === 'match')
          ? '/playing-xi'
          : activeCamp.currentPhase === 'mini_auction'
          ? '/auction'
          : '/draft';
        router.push(targetUrl);
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn touch-manipulation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative w-full max-w-3xl bg-slate-900/95 border border-white/15 rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col gap-4 overflow-hidden my-auto max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Turf Floodlight Cone */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-sky-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header: Purely Method to Play */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
              <Trophy size={20} className="text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                METHOD TO PLAY
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white mt-0.5">
                HOW DO YOU WANT TO PLAY?
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              gameAudio.playUiTap('select');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Context Note */}
        <p className="text-xs text-gray-300 font-mono leading-relaxed shrink-0">
          Select your tournament game mode below. You will choose your franchise and review stadium pitch analytics on the next screen.
        </p>

        {/* Mobile Segmented Toggle */}
        <div className="md:hidden flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => {
              setActiveTab('official');
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'official'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy size={14} />
            <span>Official Squads</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scratch');
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scratch'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap size={14} />
            <span>Build From Scratch</span>
          </button>
        </div>

        {/* Mobile Swipe Navigation Hint */}
        <div className="flex md:hidden items-center justify-between text-[10px] font-mono text-gray-400 px-1 shrink-0">
          <span className="flex items-center gap-0.5"><ChevronLeft size={11} /> Swipe to toggle</span>
          <span className="text-amber-400 font-bold">{activeTab === 'official' ? '1 / 2: Official' : '2 / 2: Scratch Inception'}</span>
          <span className="flex items-center gap-0.5">Swipe <ChevronRight size={11} /></span>
        </div>

        {/* The Two Modes Grid: Side-by-side on desktop, toggled/swipeable on mobile */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 overflow-y-auto pr-0.5">
          
          {/* ─── OPTION 1: OFFICIAL SQUADS ─── */}
          <div 
            className={`p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-amber-500/35 flex flex-col justify-between gap-4 shadow-xl transition-all ${
              activeTab === 'official' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white font-display">
                      Play Official Squads
                    </h3>
                    <p className="text-[10px] text-amber-300 font-mono font-bold">
                      Official 2026/27 Retained Rosters
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                  SEASON MODE
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Take command of any real franchise with their official retained stars and marquee signings. Engage in mid-season player trades, finalize your 6-player retention ledger, patch squad holes in the mini-auction, and compete for the trophy.
              </p>

              {/* Sequential Phase Roadmap */}
              <div className="space-y-1.5 text-[11px] font-mono text-gray-300 bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>1. Player Trading Desk (10 Franchises)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>2. Retain & Release (Reclaim Purse)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>3. Mini-Auction Live Bidding Arena</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>4. Playing 11 Tactics & 74-Match Schedule</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleChooseOfficialMode}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <span>Play Official Squads</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* ─── OPTION 2: BUILD FROM SCRATCH ─── */}
          <div 
            className={`p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-sky-500/40 flex flex-col justify-between gap-4 shadow-xl transition-all ${
              activeTab === 'scratch' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white font-display">
                      Build From Scratch
                    </h3>
                    <p className="text-[10px] text-sky-300 font-mono font-bold">
                      Inaugural Draft + Full Mega Auction
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold">
                  ₹120 CR CAP
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Build your franchise dynasty from ground zero. All 10 teams start with zero players and ₹120.0 Cr. Experience the historic 3-round Foundation Draft to lock in your core talismans, followed by a full 200+ player Mega Auction.
              </p>

              {/* Sequential Phase Roadmap */}
              <div className="space-y-1.5 text-[11px] font-mono text-gray-300 bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>1. Foundation Draft (Icon, Marquee, Anchor)</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>2. ₹120 Cr Full Mega Auction (10 Teams)</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>3. Dynamic Playing 11 (Bat-First vs Bowl-First)</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>4. 74-Match Championship Simulator</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleChooseScratchMode}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer transition-all"
            >
              <Sparkles size={15} />
              <span>Build From Scratch</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
