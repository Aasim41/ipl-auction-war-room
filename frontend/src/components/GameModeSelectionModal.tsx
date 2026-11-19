'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Gavel, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Shield, 
  ArrowRight, 
  Flame, 
  Users, 
  X
} from 'lucide-react';
import { useCampaignStore } from '../store/useCampaignStore';
import { IPL_FRANCHISES } from '../data/franchises';
import TeamLogo from './TeamLogo';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

interface GameModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameModeSelectionModal({ isOpen, onClose }: GameModeSelectionModalProps) {
  const router = useRouter();
  const { getActiveCampaign, createCampaign, createScratchCampaign, switchCampaign, campaigns, currentUser } = useCampaignStore();
  const activeCampaign = getActiveCampaign();
  
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(activeCampaign?.teamId || 'rcb');
  const [hoveredMode, setHoveredMode] = useState<'official' | 'scratch' | null>(null);

  if (!isOpen) return null;

  const handleSelectOfficialMode = () => {
    gameAudio.playUiTap('select');
    triggerGameHaptic('medium');

    // If an official campaign exists for this team, switch to it, otherwise create one
    const officialCampaignId = `${currentUser.id}_${selectedFranchiseId}_2027`;
    if (campaigns[officialCampaignId]) {
      switchCampaign(officialCampaignId);
    } else {
      createCampaign(selectedFranchiseId);
    }

    onClose();
    router.push('/');
  };

  const handleSelectScratchMode = () => {
    gameAudio.playConfettiFanfare();
    triggerGameHaptic('trade_deal_success');

    // Create a fresh scratch inception campaign starting at draft phase
    createScratchCampaign(selectedFranchiseId);

    onClose();
    router.push('/draft');
  };

  const franchiseList = Object.values(IPL_FRANCHISES);
  const selectedFranchise = IPL_FRANCHISES[selectedFranchiseId] || IPL_FRANCHISES['rcb'];

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-white/20 rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col gap-5 overflow-hidden my-auto max-h-[95vh]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-rose-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy size={20} className="text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  IPL FRANCHISE GM SIMULATOR
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white tracking-tight mt-0.5">
                CHOOSE YOUR IPL JOURNEY
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              gameAudio.playUiTap('select');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Team Selector Row: Applies to both modes */}
        <div className="relative z-10 p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-amber-400" /> Choose Franchise to Manage:
            </span>
            <span className="text-amber-300 font-bold">
              {selectedFranchise.name} ({selectedFranchise.short})
            </span>
          </div>

          {/* Transparent Team Badges Strip */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
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
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50 scale-[1.03]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  <TeamLogo teamId={f.short} size={22} />
                  <span className="text-xs font-black font-display">{f.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Two Game Modes: Side by Side (Stacked on Mobile) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          
          {/* ─── OPTION 1: OFFICIAL 2026/27 SQUADS ─── */}
          <div 
            onMouseEnter={() => setHoveredMode('official')}
            onMouseLeave={() => setHoveredMode(null)}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/30 hover:border-amber-400 flex flex-col justify-between gap-4 shadow-xl relative overflow-hidden transition-all group"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 border-b border-l border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded-bl-2xl">
              SEASON MODE
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    Play Official Squads
                  </h3>
                  <p className="text-[11px] text-amber-300 font-mono font-bold">
                    Official 2026/27 Retained Rosters
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Jump right in with authentic real-life squads. Kohli at RCB, Dhoni at CSK, Bumrah at MI. Complete mid-season trades, participate in the mini-auction, set your Impact Player XI, and compete for the trophy.
              </p>

              {/* Feature Checkpoints */}
              <div className="space-y-1.5 text-[11px] font-mono text-gray-300 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>Real Retained Squads (22-25 players)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>Interactive Franchise Trade Window</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>Tactical Mini-Auction for Free Agents</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                  <span>Full 74-Match IPL Schedule & Simulator</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSelectOfficialMode}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 transition-all"
            >
              <span>Continue Official Season</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* ─── OPTION 2: BUILD FROM SCRATCH (INAUGURAL DRAFT & MEGA AUCTION) ─── */}
          <div 
            onMouseEnter={() => setHoveredMode('scratch')}
            onMouseLeave={() => setHoveredMode(null)}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-sky-500/40 hover:border-sky-400 flex flex-col justify-between gap-4 shadow-xl relative overflow-hidden transition-all group"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-sky-500/20 border-b border-l border-sky-500/30 text-sky-300 text-[10px] font-mono font-bold rounded-bl-2xl">
              GROUND ZERO • ₹120 CR
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Gavel size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    Build From Scratch
                  </h3>
                  <p className="text-[11px] text-sky-300 font-mono font-bold">
                    Inaugural Draft + 200-Player Mega Auction
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Every franchise starts empty with a full ₹120.0 Cr purse. Experience the historic 3-round Inaugural Draft to secure your icon stars, then battle all 9 AI teams in a full-fledged Mega Auction to build an empire from scratch!
              </p>

              {/* Feature Checkpoints */}
              <div className="space-y-1.5 text-[11px] font-mono text-gray-300 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>Blank Slate: All 10 teams start with ₹120 Cr</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>3-Round Inaugural Draft (Icon, Marquee & Anchor)</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>Full Mega Auction with remaining ₹77 Cr purse</span>
                </div>
                <div className="flex items-center gap-2 text-sky-300">
                  <Zap size={13} className="shrink-0 text-sky-400" />
                  <span>Construct an all-time custom dream dynasty</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSelectScratchMode}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles size={15} />
              <span>Launch Inaugural Draft (₹120 Cr)</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
