'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Gavel, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Shield, 
  ArrowRight, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCampaignStore } from '../store/useCampaignStore';
import { useStore } from '../store/useStore';
import { IPL_FRANCHISES } from '../data/franchises';
import TeamLogo from './TeamLogo';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

interface GameModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameModeSelectionModal({ isOpen, onClose }: GameModeSelectionModalProps) {
  const router = useRouter();
  const { setTheme } = useStore();
  const { 
    getActiveCampaign, 
    createCampaign, 
    createScratchCampaign, 
    switchCampaign, 
    campaigns, 
    currentUser 
  } = useCampaignStore();
  
  const activeCampaign = getActiveCampaign();
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(activeCampaign?.teamId || 'rcb');
  const [activeTab, setActiveTab] = useState<'official' | 'scratch'>('official');

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

  const handleSelectOfficialMode = () => {
    gameAudio.playTradeDealSuccess();
    triggerGameHaptic('heavy');
    setTheme(selectedFranchiseId);
    sessionStorage.setItem('auctionxi_game_mode_selected', 'true');

    const officialCampaignId = `${currentUser.id}_${selectedFranchiseId}_2027`;
    let targetUrl = '/trade';

    if (campaigns[officialCampaignId]) {
      switchCampaign(officialCampaignId);
      const camp = campaigns[officialCampaignId];
      targetUrl = (camp.currentPhase === 'playing_xi' || camp.currentPhase === 'match')
        ? '/playing-xi'
        : camp.currentPhase === 'mini_auction'
        ? '/auction'
        : camp.currentPhase === 'retain_release'
        ? '/squad'
        : '/trade';
    } else {
      createCampaign(selectedFranchiseId);
      targetUrl = '/trade';
    }

    onClose();
    router.push(targetUrl);
  };

  const handleSelectScratchMode = () => {
    gameAudio.playConfettiFanfare();
    triggerGameHaptic('heavy');
    setTheme(selectedFranchiseId);
    sessionStorage.setItem('auctionxi_game_mode_selected', 'true');

    createScratchCampaign(selectedFranchiseId);

    onClose();
    router.push('/draft');
  };

  const franchiseList = Object.values(IPL_FRANCHISES);
  const selectedFranchise = IPL_FRANCHISES[selectedFranchiseId] || IPL_FRANCHISES['rcb'];

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn touch-manipulation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900/95 border border-white/15 rounded-3xl p-3.5 sm:p-6 shadow-2xl flex flex-col gap-3.5 overflow-hidden my-auto max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Turf Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-sky-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
              <Trophy size={18} className="text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                IPL GM SIMULATOR
              </span>
              <h2 className="text-base sm:text-xl font-black font-display text-white mt-0.5">
                CHOOSE YOUR IPL JOURNEY
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

        {/* Team Selector Strip */}
        <div className="relative z-10 p-2.5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 font-bold flex items-center gap-1.5 text-[11px]">
              <Shield size={13} className="text-amber-400" /> Select Franchise:
            </span>
            <span className="text-amber-300 font-bold text-xs truncate max-w-[200px]">
              {selectedFranchise.name} ({selectedFranchise.short})
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {franchiseList.map((f) => {
              const isSelected = f.id === selectedFranchiseId;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFranchiseId(f.id);
                    gameAudio.playUiTap('select');
                    triggerGameHaptic('light');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50 scale-[1.03]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  <TeamLogo teamId={f.short} size={18} />
                  <span className="text-xs font-black font-display">{f.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Segmented Toggle & Swipe Pill (Visible on small screens) */}
        <div className="md:hidden flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => {
              setActiveTab('official');
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'official'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy size={13} />
            <span>Official Squads</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scratch');
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scratch'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap size={13} />
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
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-0.5">
          
          {/* ─── OPTION 1: OFFICIAL SQUADS ─── */}
          <div 
            className={`p-3.5 sm:p-5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col justify-between gap-3 shadow-xl transition-all ${
              activeTab === 'official' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white font-display">
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

              <p className="text-[11px] text-gray-300 leading-snug">
                Lead {selectedFranchise.name} with real retained superstars. Complete mid-season trades, buy free agents in the mini-auction, set your Impact Player XI, and compete in the 74-match IPL season.
              </p>

              {/* 3 Clean Badges */}
              <div className="space-y-1 text-[10px] font-mono text-gray-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                  <span>Real 25-Player Retained Squads</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                  <span>Interactive Franchise Trade Window</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                  <span>Tactical Mini-Auction & 74-Match Schedule</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSelectOfficialMode}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <span>Launch Official Season</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* ─── OPTION 2: BUILD FROM SCRATCH ─── */}
          <div 
            className={`p-3.5 sm:p-5 rounded-2xl bg-slate-950/70 border border-sky-500/40 flex flex-col justify-between gap-3 shadow-xl transition-all ${
              activeTab === 'scratch' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Gavel size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white font-display">
                      Build From Scratch
                    </h3>
                    <p className="text-[10px] text-sky-300 font-mono font-bold">
                      Inaugural Draft + 200-Player Mega Auction
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold">
                  ₹120 CR CAP
                </span>
              </div>

              <p className="text-[11px] text-gray-300 leading-snug">
                Every franchise starts empty with ₹120.0 Cr. Experience the historic 3-round Inaugural Draft (Icon ₹18 Cr, Marquee ₹14 Cr, Anchor ₹11 Cr), then battle all 9 AI teams in a full 200+ player Mega Auction.
              </p>

              {/* 3 Clean Badges */}
              <div className="space-y-1 text-[10px] font-mono text-gray-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={12} className="shrink-0 text-sky-400" />
                  <span>Blank Slate: All 10 teams start with ₹120 Cr</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={12} className="shrink-0 text-sky-400" />
                  <span>3-Round Draft: Icon, Marquee & Anchor</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={12} className="shrink-0 text-sky-400" />
                  <span>Full Mega Auction with remaining ₹77 Cr</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSelectScratchMode}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Sparkles size={14} />
              <span>Launch Inaugural Draft (₹120 Cr)</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
