'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Gavel, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Shield, 
  Zap, 
  ArrowRight, 
  Activity, 
  Flame, 
  Users, 
  TrendingUp,
  FastForward,
  ChevronRight
} from 'lucide-react';
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore';
import { getFranchise, IPL_FRANCHISES } from '../../data/franchises';
import { 
  INAUGURAL_DRAFT_POOL, 
  DRAFT_ROUNDS_CONFIG, 
  DraftProspect, 
  selectAIDraftPick 
} from '../../data/draftPool';
import TeamLogo from '../../components/TeamLogo';
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics';
import { formatPlayerInitial } from '../../lib/nameFormatter';

export default function InauguralDraftPage() {
  const router = useRouter();
  const { getActiveCampaign, recordDraftPick, completeDraftPhase } = useCampaignStore();
  const campaign = getActiveCampaign();

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draftTicker, setDraftTicker] = useState<Array<{ teamId: string; player: DraftProspect; round: number }>>([]);
  const [isSimulatingAIPicks, setIsSimulatingAIPicks] = useState<boolean>(false);
  const [draftComplete, setDraftComplete] = useState<boolean>(false);
  const [confirmingProspect, setConfirmingProspect] = useState<DraftProspect | null>(null);

  // Franchise metadata
  const franchise = useMemo(() => {
    return getFranchise(campaign?.teamId || 'rcb');
  }, [campaign?.teamId]);

  // Track already drafted player IDs
  const draftedIds = useMemo(() => {
    const ids = new Set<string>();
    // User squad
    (campaign?.squad || []).forEach(p => ids.add(p.player_id || p.name));
    // Rival squads
    if (campaign?.rivalTeamsData) {
      Object.values(campaign.rivalTeamsData).forEach(r => {
        (r.squad || []).forEach(p => ids.add(p.player_id || p.name));
      });
    }
    // Draft ticker
    draftTicker.forEach(d => ids.add(d.player.id).add(d.player.name));
    return ids;
  }, [campaign?.squad, campaign?.rivalTeamsData, draftTicker]);

  // Current round configuration
  const roundConfig = DRAFT_ROUNDS_CONFIG[currentRound - 1] || DRAFT_ROUNDS_CONFIG[0];

  // Available prospects for current round
  const availableProspects = useMemo(() => {
    return INAUGURAL_DRAFT_POOL.filter(p => {
      // Must not be drafted yet
      if (draftedIds.has(p.id) || draftedIds.has(p.name)) return false;
      // Filter by role
      if (selectedRole !== 'ALL' && p.role !== selectedRole) return false;
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.iplHeritage.toLowerCase().includes(q) || p.tacticalTag.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => b.powerIndex - a.powerIndex);
  }, [draftedIds, selectedRole, searchQuery]);

  // User's drafted foundation players
  const userDraftedPlayers = campaign?.squad || [];

  // Handle user drafting a prospect
  const handleDraftPlayer = async (prospect: DraftProspect) => {
    if (isSimulatingAIPicks || draftComplete) return;

    gameAudio.playConfettiFanfare();
    triggerGameHaptic('trade_deal_success');

    // 1. Record pick for user
    const campaignPlayer: CampaignPlayer = {
      player_id: prospect.id,
      name: prospect.name,
      role: prospect.role,
      nationality: prospect.nationality,
      is_overseas: prospect.is_overseas,
      price: roundConfig.deductionCr,
      currentPrice: roundConfig.deductionCr,
      Power_Index: prospect.powerIndex,
      statsSummary: prospect.tacticalTag,
      is_retained: true,
      is_released: false
    };

    recordDraftPick(franchise.id, campaignPlayer, roundConfig.deductionCr);

    setDraftTicker(prev => [
      ...prev,
      { teamId: franchise.id, player: prospect, round: currentRound }
    ]);

    setConfirmingProspect(null);
    setIsSimulatingAIPicks(true);

    // 2. Simulate AI Draft Picks for the other 9 franchises in this round
    const otherTeamIds = Object.keys(IPL_FRANCHISES).filter(id => id.toLowerCase() !== franchise.id.toLowerCase());
    const currentDraftedSet = new Set(draftedIds);
    currentDraftedSet.add(prospect.id);
    currentDraftedSet.add(prospect.name);

    for (let i = 0; i < otherTeamIds.length; i++) {
      const rivalId = otherTeamIds[i];
      const rivalFranchise = IPL_FRANCHISES[rivalId];
      if (!rivalFranchise) continue;

      const aiPick = selectAIDraftPick(rivalId, currentRound, currentDraftedSet);
      if (aiPick) {
        currentDraftedSet.add(aiPick.id);
        currentDraftedSet.add(aiPick.name);

        const aiCampaignPlayer: CampaignPlayer = {
          player_id: aiPick.id,
          name: aiPick.name,
          role: aiPick.role,
          nationality: aiPick.nationality,
          is_overseas: aiPick.is_overseas,
          price: roundConfig.deductionCr,
          currentPrice: roundConfig.deductionCr,
          Power_Index: aiPick.powerIndex,
          statsSummary: aiPick.tacticalTag,
          is_retained: true,
          is_released: false
        };

        recordDraftPick(rivalId, aiCampaignPlayer, roundConfig.deductionCr);

        setDraftTicker(prev => [
          ...prev,
          { teamId: rivalId, player: aiPick, round: currentRound }
        ]);
      }
    }

    setIsSimulatingAIPicks(false);

    // 3. Advance to next round or complete draft
    if (currentRound < 3) {
      setCurrentRound(prev => prev + 1);
    } else {
      setDraftComplete(true);
      gameAudio.playTradeDealSuccess();
    }
  };

  const handleProceedToMegaAuction = () => {
    gameAudio.playGavelBang();
    triggerGameHaptic('heavy');
    
    // Complete draft phase and transition to auction
    completeDraftPhase(campaign?.draftPicks || {});
    router.push('/auction');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-[calc(max(env(safe-area-inset-top,0px),12px)+2.85rem)] sm:pt-14 pb-12 select-none overflow-x-hidden">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/10 via-amber-500/10 to-purple-600/10 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-5 flex flex-col gap-4">
        
        {/* Top Header Card: Title, Round Progress & Live Purse */}
        <div className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 p-1">
              <TeamLogo teamId={franchise.short} size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                  INAUGURAL FOUNDATION DRAFT
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {franchise.name}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black font-display text-white tracking-tight mt-0.5">
                {roundConfig.title}
              </h1>
            </div>
          </div>

          {/* Live Purse & Round Progress Counters */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">Remaining Purse</span>
              <span className="text-base sm:text-xl font-black font-mono text-emerald-400">
                ₹{(campaign?.remainingPurse ?? 120.0).toFixed(2)} Cr
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-wider text-amber-300 font-mono">Deduction This Round</span>
              <span className="text-base sm:text-xl font-black font-mono text-amber-300">
                -₹{roundConfig.deductionCr.toFixed(1)} Cr
              </span>
            </div>
          </div>

        </div>

        {/* 3-Slot Foundation Star Cards (Real-time slots) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { round: 1, label: 'Icon Pick (₹18 Cr)', roleRequirement: 'Franchise Talisman' },
            { round: 2, label: 'Marquee Pick (₹14 Cr)', roleRequirement: 'Superstar Core' },
            { round: 3, label: 'Anchor Pick (₹11 Cr)', roleRequirement: 'Strike Weapon' }
          ].map((slot) => {
            const draftedPlayer = userDraftedPlayers[slot.round - 1];
            const isCurrent = currentRound === slot.round && !draftComplete;

            return (
              <div
                key={slot.round}
                className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[95px] sm:min-h-[110px] ${
                  draftedPlayer
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-emerald-500/40 shadow-lg'
                    : isCurrent
                    ? 'bg-amber-500/10 border-amber-400/60 shadow-lg ring-1 ring-amber-400/40 animate-pulse'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-400 font-bold">ROUND {slot.round}</span>
                  <span className={draftedPlayer ? 'text-emerald-400 font-black' : isCurrent ? 'text-amber-300 font-bold' : 'text-gray-500'}>
                    {draftedPlayer ? '✓ SECURED' : isCurrent ? '⚡ ACTIVE PICK' : 'PENDING'}
                  </span>
                </div>

                {draftedPlayer ? (
                  <div className="my-auto">
                    <div className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-1">
                      <span>⭐</span>
                      <span className="truncate">{draftedPlayer.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-300 font-mono mt-0.5 flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-white/10 text-gray-200">{draftedPlayer.role}</span>
                      <span>₹{draftedPlayer.currentPrice || draftedPlayer.price} Cr</span>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center py-1">
                    <div className="text-xs font-bold text-gray-400">{slot.label}</div>
                    <div className="text-[9px] text-gray-500 font-mono">{slot.roleRequirement}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── DRAFT COMPLETION BANNER & MEGA AUCTION PROCEED CTA ─── */}
        {draftComplete ? (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/50 shadow-2xl flex flex-col items-center text-center gap-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl text-emerald-400 shadow-lg shadow-emerald-500/30">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
                FOUNDATION PHASE COMPLETE
              </span>
              <h2 className="text-xl sm:text-3xl font-black font-display text-white mt-1">
                Your 3 Foundation Stars Are Locked In!
              </h2>
              <p className="text-xs text-gray-300 max-w-lg mt-1 font-sans">
                You have drafted your core icons for {franchise.name}. All 10 franchises have established their 3 foundation stars and hold remaining auction purses to enter the full Mega Auction!
              </p>
            </div>

            <button
              onClick={handleProceedToMegaAuction}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-emerald-500/40 cursor-pointer active:scale-95 transition-all"
            >
              <Gavel size={18} className="fill-slate-950" />
              <span>PROCEED TO FULL MEGA AUCTION (₹{(campaign?.remainingPurse ?? 77.0).toFixed(1)} Cr)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* ─── ACTIVE DRAFT ARENA: PROSPECTS CATALOG ─── */
          <div className="flex flex-col gap-3">
            
            {/* Filter and Search Bar */}
            <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md">
              
              {/* Role Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {['ALL', 'BAT', 'BOWL', 'AR', 'WK'].map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      gameAudio.playUiTap('select');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      selectedRole === role
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search superstar, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

            </div>

            {/* Prospects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableProspects.map(prospect => (
                <div
                  key={prospect.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-amber-500/50 flex flex-col justify-between gap-3 shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-display truncate">
                          {prospect.name}
                        </span>
                        {prospect.is_overseas && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                            ✈ OS
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5 truncate">
                        {prospect.iplHeritage}
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 text-gray-200 font-mono font-bold shrink-0">
                      {prospect.role}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-300 font-mono line-clamp-2 leading-tight">
                    {prospect.tacticalTag}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-[10px] font-mono text-gray-400">
                      Round Fee: <strong className="text-white">₹{roundConfig.deductionCr.toFixed(1)} Cr</strong>
                    </div>

                    <button
                      onClick={() => setConfirmingProspect(prospect)}
                      disabled={isSimulatingAIPicks}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
                    >
                      <span>Draft</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ─── REAL-TIME DRAFT TICKER / LOG OF ALL 10 FRANCHISES ─── */}
        {draftTicker.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300 font-bold flex items-center gap-1.5">
                <Activity size={14} className="text-sky-400" /> Live Draft Ticker:
              </span>
              <span className="text-gray-400 text-[10px]">
                {draftTicker.length} of 30 total draft picks made
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {draftTicker.slice().reverse().map((pick, idx) => {
                const team = IPL_FRANCHISES[pick.teamId.toLowerCase()];
                return (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    <TeamLogo teamId={team?.short || pick.teamId} size={18} />
                    <span className="text-xs font-bold text-white">
                      {formatPlayerInitial(pick.player.name)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      (R{pick.round} • {team?.short || pick.teamId})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ─── DRAFT CONFIRMATION POPUP MODAL ─── */}
      {confirmingProspect && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-xl font-bold">
              🏏
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-mono">
                {roundConfig.title}
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-white mt-1">
                Draft {confirmingProspect.name}?
              </h3>
              <p className="text-xs text-gray-300 mt-1 font-mono">
                {confirmingProspect.tacticalTag}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Purse Deduction:</span>
              <span className="text-amber-300 font-black">
                ₹{roundConfig.deductionCr.toFixed(1)} Cr
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setConfirmingProspect(null)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDraftPlayer(confirmingProspect)}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                Confirm Draft ➔
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
