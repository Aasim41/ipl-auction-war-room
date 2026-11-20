'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  Award, 
  Flame, 
  Crown, 
  Sparkles, 
  ArrowLeft, 
  Shield, 
  Zap, 
  TrendingUp, 
  Star, 
  ChevronRight,
  Medal,
  Calendar,
  Layers,
  History
} from 'lucide-react';
import { useCampaignStore } from '../../store/useCampaignStore';
import { getFranchise, IPL_FRANCHISES } from '../../data/franchises';
import { 
  computeTournamentAwards, 
  FRANCHISE_HISTORIC_TROPHIES, 
  FranchiseHistoricTrophy,
  TournamentAwardsSummary,
  PlayerBattingAwardStats,
  PlayerBowlingAwardStats,
  MVPAwardStats,
  EmergingPlayerAwardStats
} from '../../lib/tournamentAwards';
import TeamLogo from '../../components/TeamLogo';
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics';

export default function TrophyCabinetPage() {
  const router = useRouter();
  const { getActiveCampaign, campaigns } = useCampaignStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'caps' | 'mvp' | 'hall_of_fame'>('showcase');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('csk');

  useEffect(() => {
    setMounted(true);
    const activeCamp = getActiveCampaign();
    if (activeCamp?.teamId) {
      setSelectedFranchiseId(activeCamp.teamId);
    }
  }, []);

  const activeCamp = mounted ? getActiveCampaign() : null;
  const currentFranchise = getFranchise(selectedFranchiseId);

  // Combine franchise historic trophies with user-earned trophies in the campaign
  const historicTrophies = FRANCHISE_HISTORIC_TROPHIES[selectedFranchiseId] || [];
  const userEarnedTrophies = (activeCamp?.teamId === selectedFranchiseId && activeCamp?.userTrophies) 
    ? activeCamp.userTrophies 
    : [];

  // Deduplicate and combine trophies
  const combinedTrophies: FranchiseHistoricTrophy[] = [
    ...userEarnedTrophies,
    ...historicTrophies.filter(h => !userEarnedTrophies.some(u => u.id === h.id))
  ].sort((a, b) => b.seasonYear - a.seasonYear);

  // Compute live tournament awards across all 10 franchises
  const schedule = activeCamp?.schedule || [];
  const awards: TournamentAwardsSummary = computeTournamentAwards(schedule, selectedFranchiseId);

  // Trophy count vitals
  const championCount = combinedTrophies.filter(t => t.type === 'champion').length;
  const runnerUpCount = combinedTrophies.filter(t => t.type === 'runner_up').length;
  const playoffCount = combinedTrophies.filter(t => t.type === 'playoffs').length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-sm">
        <Sparkles className="animate-spin mr-2" size={18} />
        Loading Trophy Cabinet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none pt-16 pb-20 px-3 sm:px-6 max-w-4xl mx-auto">
      
      {/* ─── TOP HEADER BAR ─── */}
      <div className="flex items-center justify-between py-3 border-b border-white/10 gap-3">
        <button
          onClick={() => {
            gameAudio.playUiTap('light');
            triggerGameHaptic('light');
            router.back();
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 text-xs font-bold border border-white/10 cursor-pointer shadow-sm transition-all shrink-0"
        >
          <ArrowLeft size={14} className="text-amber-400" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <TeamLogo teamId={currentFranchise.id} size={28} />
          <div>
            <h1 className="text-sm sm:text-base font-black font-display text-white truncate flex items-center gap-1.5">
              <span>{currentFranchise.name}</span>
              <span 
                className="px-1.5 py-0.2 rounded text-[10px] font-black text-slate-950"
                style={{ backgroundColor: currentFranchise.color }}
              >
                {currentFranchise.short}
              </span>
            </h1>
            <span className="text-[10px] font-mono text-amber-400 font-bold block">
              🏆 Trophy Cabinet & Honors
            </span>
          </div>
        </div>

        <Link
          href="/playing-xi"
          onClick={() => {
            gameAudio.playUiTap('select');
            triggerGameHaptic('light');
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer transition-all shrink-0"
        >
          <Calendar size={13} />
          <span className="hidden sm:inline">Season Hub</span>
        </Link>
      </div>

      {/* ─── FRANCHISE SELECTOR CAROUSEL ─── */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-white/5">
        {Object.values(IPL_FRANCHISES).map(f => {
          const isSelected = f.id === selectedFranchiseId;
          const isUserTeam = activeCamp?.teamId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFranchiseId(f.id);
                gameAudio.playUiTap('select');
                triggerGameHaptic('light');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-sm ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 text-gray-400 border-white/5 hover:bg-white/5'
              }`}
            >
              <TeamLogo teamId={f.id} size={16} />
              <span className="font-mono">{f.short}</span>
              {isUserTeam && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Your Active Team" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── HERO TROPHY OVERVIEW VITAL CARD ─── */}
      <div className="my-3 p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentFranchise.color }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Crown size={12} /> Franchise Trophy Room & Honors
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
              {currentFranchise.name} Legacy
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Official BCCI silverware & season milestones across IPL history.
            </p>
          </div>

          {/* Quick Count Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-2xl bg-slate-950/90 border border-amber-500/40 text-center shadow-md">
              <div className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
                <span>🏆</span> <span>Titles</span>
              </div>
              <strong className="text-base sm:text-lg font-black font-display text-amber-300">
                {championCount}
              </strong>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-slate-950/90 border border-slate-400/30 text-center shadow-md">
              <div className="text-[10px] text-slate-300 font-bold flex items-center justify-center gap-1">
                <span>🥈</span> <span>Finals</span>
              </div>
              <strong className="text-base sm:text-lg font-black font-display text-slate-200">
                {runnerUpCount}
              </strong>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-center shadow-md">
              <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                <span>🎖️</span> <span>Playoffs</span>
              </div>
              <strong className="text-base sm:text-lg font-black font-display text-emerald-300">
                {playoffCount}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10 shrink-0 mb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'showcase', label: '🏆 Trophy Showcase', icon: Trophy },
          { id: 'caps', label: '🧢 Orange & Purple Caps', icon: Award },
          { id: 'mvp', label: '🌟 MVP & Emerging Player', icon: Star },
          { id: 'hall_of_fame', label: '🏛️ Hall of Fame', icon: Crown }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={13} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: TROPHY SHOWCASE ─── */}
      {activeTab === 'showcase' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
            <span>Total Honors: {combinedTrophies.length} Silvers & Golds</span>
            <span className="text-amber-400 font-bold">Multi-Season Archive</span>
          </div>

          {combinedTrophies.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-2">
              <Trophy size={36} className="mx-auto text-gray-600 mb-2" />
              <h3 className="text-base font-bold text-gray-300">No Trophies in Cabinet Yet</h3>
              <p className="text-xs text-gray-500 font-mono max-w-sm mx-auto">
                Win the IPL Final with {currentFranchise.name} in Season 2027 to place the prestigious Golden Trophy in this cabinet!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {combinedTrophies.map((trophy, idx) => {
                const isChamp = trophy.type === 'champion';
                const isRunner = trophy.type === 'runner_up';

                return (
                  <div
                    key={trophy.id || idx}
                    className={`p-4 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 shadow-xl ${
                      isChamp
                        ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-yellow-600/15 border-amber-400/50 hover:border-amber-300'
                        : isRunner
                        ? 'bg-gradient-to-br from-slate-400/15 via-slate-900 to-slate-700/10 border-slate-400/40 hover:border-slate-300'
                        : 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-teal-800/10 border-emerald-500/40 hover:border-emerald-400'
                    }`}
                  >
                    {/* Glow Accents */}
                    <div 
                      className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-25 pointer-events-none ${
                        isChamp ? 'bg-amber-400' : isRunner ? 'bg-slate-300' : 'bg-emerald-400'
                      }`}
                    />

                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border shrink-0 ${
                          isChamp 
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-amber-500/20'
                            : isRunner
                            ? 'bg-slate-400/20 border-slate-300 text-slate-200 shadow-slate-500/20'
                            : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        }`}>
                          {isChamp ? '🏆' : isRunner ? '🥈' : '🎖️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                              isChamp 
                                ? 'bg-amber-400 text-slate-950'
                                : isRunner
                                ? 'bg-slate-300 text-slate-950'
                                : 'bg-emerald-400 text-slate-950'
                            }`}>
                              {trophy.seasonLabel}
                            </span>
                            {trophy.isUserEarned && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/30 border border-purple-400/50 text-purple-300 text-[9px] font-mono font-bold">
                                ★ User Won
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-black font-display text-white mt-0.5">
                            {trophy.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 bg-slate-950/70 p-2.5 rounded-2xl border border-white/5 space-y-1">
                      <div className="text-xs font-bold text-gray-200">
                        {trophy.subtitle}
                      </div>
                      <div className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1">
                        <Star size={11} className="text-amber-400 shrink-0" />
                        <span className="truncate">{trophy.captainOrHighlight}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: CAPS (ORANGE & PURPLE) ─── */}
      {activeTab === 'caps' && (
        <div className="flex flex-col gap-4">
          
          {/* 🧡 ORANGE CAP (TOP RUN-SCORER) */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-orange-700/20 border border-amber-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md">
                  🧢
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">
                    BCCI OFFICIAL AWARD
                  </span>
                  <h3 className="text-base sm:text-lg font-black font-display text-white">
                    🧡 Orange Cap (Leading Run-Scorer)
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                10 Teams Tracked
              </span>
            </div>

            {/* Orange Cap Leader Hero */}
            {awards.orangeCapLeader && (
              <div className="my-3 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border shrink-0 text-white"
                    style={{ backgroundColor: `${awards.orangeCapLeader.teamColor}40`, borderColor: awards.orangeCapLeader.teamColor }}
                  >
                    1
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-amber-300 truncate">
                        {awards.orangeCapLeader.playerName}
                      </span>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[10px] font-black text-slate-950 shrink-0"
                        style={{ backgroundColor: awards.orangeCapLeader.teamColor }}
                      >
                        {awards.orangeCapLeader.teamShort}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono block">
                      {awards.orangeCapLeader.teamName} • {awards.orangeCapLeader.innings} Innings
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full sm:w-auto text-center shrink-0">
                  <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <span className="text-[9px] font-mono text-gray-400 block">RUNS</span>
                    <strong className="text-sm font-black text-amber-400">{awards.orangeCapLeader.runs}</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block">SR</span>
                    <strong className="text-xs font-black text-white">{awards.orangeCapLeader.strikeRate}</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block">HS</span>
                    <strong className="text-xs font-black text-emerald-400">{awards.orangeCapLeader.highestScore}*</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block">50/100</span>
                    <strong className="text-xs font-black text-white">{awards.orangeCapLeader.fifties}/{awards.orangeCapLeader.hundreds}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Top 5 Leaderboard Table */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold px-1">Top 5 Run-Getters</span>
              {awards.orangeCapTop5.map((bat: PlayerBattingAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-500 font-bold w-4">{idx + 1}</span>
                    <span className="font-bold text-white truncate">{bat.playerName}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950 shrink-0"
                      style={{ backgroundColor: bat.teamColor }}
                    >
                      {bat.teamShort}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <span className="text-gray-400 text-[11px]">{bat.innings} inn</span>
                    <span className="text-gray-400 text-[11px]">{bat.strikeRate} SR</span>
                    <strong className="text-amber-400 font-bold text-sm w-12">{bat.runs}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💜 PURPLE CAP (TOP WICKET-TAKER) */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-500/20 via-slate-900 to-indigo-800/20 border border-purple-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                  🧢
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest block">
                    BCCI OFFICIAL AWARD
                  </span>
                  <h3 className="text-base sm:text-lg font-black font-display text-white">
                    💜 Purple Cap (Leading Wicket-Taker)
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                10 Teams Tracked
              </span>
            </div>

            {/* Purple Cap Leader Hero */}
            {awards.purpleCapLeader && (
              <div className="my-3 p-3.5 rounded-2xl bg-slate-950/90 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border shrink-0 text-white"
                    style={{ backgroundColor: `${awards.purpleCapLeader.teamColor}40`, borderColor: awards.purpleCapLeader.teamColor }}
                  >
                    1
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-purple-300 truncate">
                        {awards.purpleCapLeader.playerName}
                      </span>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[10px] font-black text-slate-950 shrink-0"
                        style={{ backgroundColor: awards.purpleCapLeader.teamColor }}
                      >
                        {awards.purpleCapLeader.teamShort}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono block">
                      {awards.purpleCapLeader.teamName} • {awards.purpleCapLeader.matches} Matches
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full sm:w-auto text-center shrink-0">
                  <div className="p-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30">
                    <span className="text-[9px] font-mono text-gray-400 block">WKTS</span>
                    <strong className="text-sm font-black text-purple-400">{awards.purpleCapLeader.wickets}</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block">ECON</span>
                    <strong className="text-xs font-black text-white">{awards.purpleCapLeader.economy}</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block">BBI</span>
                    <strong className="text-xs font-black text-emerald-400">{awards.purpleCapLeader.bestFigures}</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 block">OVERS</span>
                    <strong className="text-xs font-black text-white">{awards.purpleCapLeader.overs}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Top 5 Leaderboard Table */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold px-1">Top 5 Wicket-Takers</span>
              {awards.purpleCapTop5.map((bowl: PlayerBowlingAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-500 font-bold w-4">{idx + 1}</span>
                    <span className="font-bold text-white truncate">{bowl.playerName}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950 shrink-0"
                      style={{ backgroundColor: bowl.teamColor }}
                    >
                      {bowl.teamShort}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <span className="text-gray-400 text-[11px]">{bowl.economy} econ</span>
                    <span className="text-gray-400 text-[11px]">BBI {bowl.bestFigures}</span>
                    <strong className="text-purple-400 font-bold text-sm w-8">{bowl.wickets}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 3: MVP & EMERGING PLAYER ─── */}
      {activeTab === 'mvp' && (
        <div className="flex flex-col gap-4">
          
          {/* TOURNAMENT MVP HERO */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-yellow-600/10 border border-amber-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md">
                  🌟
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">
                    MOST VALUABLE PLAYER
                  </span>
                  <h3 className="text-base sm:text-lg font-black font-display text-white">
                    Tournament MVP Leaderboard
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                Formula: Runs + Wkts + 6s
              </span>
            </div>

            {awards.tournamentMVP && (
              <div className="my-3 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border shrink-0 text-white"
                    style={{ backgroundColor: `${awards.tournamentMVP.teamColor}40`, borderColor: awards.tournamentMVP.teamColor }}
                  >
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-amber-300 truncate">
                        {awards.tournamentMVP.playerName}
                      </span>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[10px] font-black text-slate-950 shrink-0"
                        style={{ backgroundColor: awards.tournamentMVP.teamColor }}
                      >
                        {awards.tournamentMVP.teamShort}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono block">
                      {awards.tournamentMVP.role} • {awards.tournamentMVP.highlight}
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center shrink-0">
                  <span className="text-[9px] font-mono text-amber-300 uppercase block font-bold">MVP POINTS</span>
                  <strong className="text-lg font-black text-amber-400">{awards.tournamentMVP.mvpPoints} pts</strong>
                </div>
              </div>
            )}

            {/* Top 5 MVP List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold px-1">Top 5 Contenders</span>
              {awards.mvpTop5.map((mvp: MVPAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-500 font-bold w-4">{idx + 1}</span>
                    <span className="font-bold text-white truncate">{mvp.playerName}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950 shrink-0"
                      style={{ backgroundColor: mvp.teamColor }}
                    >
                      {mvp.teamShort}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <span className="text-gray-400 text-[11px]">{mvp.runs}r / {mvp.wickets}w</span>
                    <strong className="text-amber-400 font-bold text-sm">{mvp.mvpPoints} pts</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMERGING PLAYER OF THE YEAR */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-teal-800/10 border border-emerald-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md">
                  ⭐
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block">
                    FUTURE STAR AWARD
                  </span>
                  <h3 className="text-base sm:text-lg font-black font-display text-white">
                    Emerging Player of the Year (U-23)
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                Prodigy Criteria
              </span>
            </div>

            {awards.emergingPlayer && (
              <div className="my-3 p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border shrink-0 text-white"
                    style={{ backgroundColor: `${awards.emergingPlayer.teamColor}40`, borderColor: awards.emergingPlayer.teamColor }}
                  >
                    ⭐
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-emerald-300 truncate">
                        {awards.emergingPlayer.playerName}
                      </span>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[10px] font-black text-slate-950 shrink-0"
                        style={{ backgroundColor: awards.emergingPlayer.teamColor }}
                      >
                        {awards.emergingPlayer.teamShort}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono block">
                      Age {awards.emergingPlayer.age} • {awards.emergingPlayer.highlight}
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center shrink-0">
                  <span className="text-[9px] font-mono text-emerald-300 uppercase block font-bold">IMPACT SCORE</span>
                  <strong className="text-lg font-black text-emerald-400">{awards.emergingPlayer.impactScore}</strong>
                </div>
              </div>
            )}

            {/* Emerging Top 3 Candidates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold px-1">Top Nominees</span>
              {awards.emergingTop3.map((em: EmergingPlayerAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-500 font-bold w-4">{idx + 1}</span>
                    <span className="font-bold text-white truncate">{em.playerName}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950 shrink-0"
                      style={{ backgroundColor: em.teamColor }}
                    >
                      {em.teamShort}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <span className="text-gray-400 text-[11px]">{em.runs} runs</span>
                    <strong className="text-emerald-400 font-bold text-sm">{em.impactScore} pts</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 4: FRANCHISE HALL OF FAME ─── */}
      {activeTab === 'hall_of_fame' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
            <span>All-Time Official IPL & Franchise Records</span>
            <span className="text-amber-400 font-bold">Gold Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Record 1: Highest Team Total */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider block">
                    ⚡ HIGHEST TEAM TOTAL
                  </span>
                  <h4 className="text-xl font-black font-display text-white mt-0.5">
                    {awards.hallOfFame.highestTeamTotal.score}
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {awards.hallOfFame.highestTeamTotal.team} {awards.hallOfFame.highestTeamTotal.opp}
                  </span>
                </div>
                <div className="px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  {awards.hallOfFame.highestTeamTotal.season}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                Unreal boundary onslaught in 20.0 overs
              </div>
            </div>

            {/* Record 2: Fastest 50 */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider block">
                    🚀 FASTEST FIFTY
                  </span>
                  <h4 className="text-xl font-black font-display text-white mt-0.5">
                    {awards.hallOfFame.fastestFifty.balls} Balls
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {awards.hallOfFame.fastestFifty.player} ({awards.hallOfFame.fastestFifty.team})
                  </span>
                </div>
                <div className="px-2 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold">
                  {awards.hallOfFame.fastestFifty.season}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                {awards.hallOfFame.fastestFifty.opp} • Historic Blitz
              </div>
            </div>

            {/* Record 3: Best Bowling Figures */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider block">
                    🎯 BEST BOWLING SPELL
                  </span>
                  <h4 className="text-xl font-black font-display text-white mt-0.5">
                    {awards.hallOfFame.bestBowlingFigures.figures}
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {awards.hallOfFame.bestBowlingFigures.player} ({awards.hallOfFame.bestBowlingFigures.team})
                  </span>
                </div>
                <div className="px-2 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                  {awards.hallOfFame.bestBowlingFigures.season}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                {awards.hallOfFame.bestBowlingFigures.opp} • Absolute Masterclass
              </div>
            </div>

            {/* Record 4: Highest Individual Score */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                    👑 HIGHEST INDIVIDUAL SCORE
                  </span>
                  <h4 className="text-xl font-black font-display text-white mt-0.5">
                    {awards.hallOfFame.highestIndividualScore.score}
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {awards.hallOfFame.highestIndividualScore.player} ({awards.hallOfFame.highestIndividualScore.balls}b)
                  </span>
                </div>
                <div className="px-2 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  {awards.hallOfFame.highestIndividualScore.season}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                {awards.hallOfFame.highestIndividualScore.opp} • World Record T20 Innings
              </div>
            </div>

            {/* Record 5: Most Sixes in an Innings */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-wider block">
                    💥 MOST SIXES IN AN INNINGS
                  </span>
                  <h4 className="text-xl font-black font-display text-white mt-0.5">
                    {awards.hallOfFame.mostSixesInInnings.sixes} Sixes
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {awards.hallOfFame.mostSixesInInnings.player} ({awards.hallOfFame.mostSixesInInnings.team})
                  </span>
                </div>
                <div className="px-2 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                  {awards.hallOfFame.mostSixesInInnings.season}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                {awards.hallOfFame.mostSixesInInnings.opp} • Maximum Carnage
              </div>
            </div>

            {/* Record 6: Highest Successful Run Chase */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase font-bold tracking-wider block">
                    🏃 HIGHEST RUN CHASE
                  </span>
                  <h4 className="text-xl font-black font-display text-white mt-0.5">
                    {awards.hallOfFame.highestRunChase.target} Runs
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {awards.hallOfFame.highestRunChase.team} {awards.hallOfFame.highestRunChase.opp}
                  </span>
                </div>
                <div className="px-2 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold">
                  {awards.hallOfFame.highestRunChase.season}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                Highest successful chase in T20 cricket history
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
