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

  // Current Season Trophies ONLY (No historical past records)
  const schedule = activeCamp?.schedule || [];
  const pointsTable = activeCamp?.pointsTable || [];
  const awards: TournamentAwardsSummary = computeTournamentAwards(schedule, selectedFranchiseId);

  const finalMatch = schedule.find(m => m.stage === 'Final' || m.matchNo === 74);
  const userSeasonTrophies = (activeCamp?.teamId === selectedFranchiseId && activeCamp?.userTrophies) 
    ? activeCamp.userTrophies.filter(t => t.seasonYear === 2027) 
    : [];

  const ptEntry = pointsTable.find(p => p.teamId === selectedFranchiseId);
  const rank = pointsTable.findIndex(p => p.teamId === selectedFranchiseId) + 1;

  // Build Current Season Trophy Cards
  const currentSeasonTrophies: FranchiseHistoricTrophy[] = [...userSeasonTrophies];

  if (finalMatch && finalMatch.status === 'COMPLETED') {
    if (finalMatch.result?.winnerTeamId === selectedFranchiseId) {
      if (!currentSeasonTrophies.some(t => t.type === 'champion')) {
        currentSeasonTrophies.push({
          id: `season_2027_champ_${selectedFranchiseId}`,
          seasonYear: 2027,
          seasonLabel: 'Season 2027',
          type: 'champion',
          title: 'IPL 2027 Champions Trophy',
          subtitle: `Crowned Champions • Defeated ${finalMatch.result?.winnerTeamId === finalMatch.teamAId ? finalMatch.teamBShort : finalMatch.teamAShort} in Grand Final`,
          captainOrHighlight: `Official BCCI 2027 Championship Trophy`,
          isUserEarned: activeCamp?.teamId === selectedFranchiseId
        });
      }
    } else if (finalMatch.teamAId === selectedFranchiseId || finalMatch.teamBId === selectedFranchiseId) {
      if (!currentSeasonTrophies.some(t => t.type === 'runner_up')) {
        currentSeasonTrophies.push({
          id: `season_2027_runner_${selectedFranchiseId}`,
          seasonYear: 2027,
          seasonLabel: 'Season 2027',
          type: 'runner_up',
          title: 'IPL 2027 Runners-Up Shield',
          subtitle: `Grand Finalists • Silverware Awarded`,
          captainOrHighlight: `Official BCCI 2027 Runner-Up Shield`,
          isUserEarned: activeCamp?.teamId === selectedFranchiseId
        });
      }
    }
  } else {
    // Current season is active in progress!
    const played = ptEntry?.played || 0;
    const won = ptEntry?.won || 0;
    const pts = ptEntry?.points || 0;
    currentSeasonTrophies.push({
      id: `season_2027_hunt_${selectedFranchiseId}`,
      seasonYear: 2027,
      seasonLabel: 'Season 2027',
      type: 'champion',
      title: 'IPL 2027 Championship Trophy',
      subtitle: rank > 0 ? `Current Standings: Ranked #${rank} • ${won}W / ${played}P (${pts} Pts)` : `Season 2027 Contender`,
      captainOrHighlight: `Target: Lift the 2027 Trophy at Ahmedabad Grand Final`,
      isUserEarned: activeCamp?.teamId === selectedFranchiseId
    });
  }

  const combinedTrophies = currentSeasonTrophies;

  // Trophy count vitals for current season
  const championCount = combinedTrophies.filter(t => t.type === 'champion' && (finalMatch?.status === 'COMPLETED' || t.isUserEarned)).length;
  const runnerUpCount = combinedTrophies.filter(t => t.type === 'runner_up').length;
  const inContentionCount = combinedTrophies.filter(t => !finalMatch || finalMatch.status !== 'COMPLETED').length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-sm">
        <Sparkles className="animate-spin mr-2" size={18} />
        Loading Trophy Cabinet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none pt-14 pb-20 px-3 sm:px-5 max-w-4xl mx-auto">
      
      {/* ─── TOP HEADER BAR (Only 1 Back button via Navbar; clean page header here) ─── */}
      <div className="flex items-center justify-between py-2 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2">
          <TeamLogo teamId={currentFranchise.id} size={22} />
          <div>
            <h1 className="text-sm sm:text-base font-black font-mono text-amber-400">
              {currentFranchise.short}
            </h1>
            <span className="text-[9px] font-mono text-gray-400 font-bold block">
              🏆 Season 2027 Honors
            </span>
          </div>
        </div>

        <Link
          href="/playing-xi"
          onClick={() => {
            gameAudio.playUiTap('select');
            triggerGameHaptic('light');
          }}
          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all shrink-0"
        >
          <Calendar size={12} />
          <span>Season Hub</span>
        </Link>
      </div>

      {/* ─── FRANCHISE SELECTOR CAROUSEL (Ultra-Compact Pills) ─── */}
      <div className="py-2 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 border-b border-white/5">
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
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-sm'
                  : 'bg-slate-900/60 text-gray-400 border-white/5 hover:bg-white/5'
              }`}
            >
              <TeamLogo teamId={f.id} size={14} />
              <span className="font-mono">{f.short}</span>
              {isUserTeam && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Your Active Team" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── HERO TROPHY OVERVIEW VITAL CARD (Ultra-Compact) ─── */}
      <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 shadow-lg relative overflow-hidden">
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentFranchise.color }}
        />

        <div className="flex items-center justify-between gap-2 relative z-10">
          <div>
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Crown size={10} /> Season 2027 Campaign Honors
            </span>
            <h2 className="text-base font-black font-mono text-white">
              {currentFranchise.short} Silverware & Awards
            </h2>
          </div>

          {/* Quick Count Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2 py-0.5 rounded-lg bg-slate-950/90 border border-amber-500/40 text-center shadow">
              <span className="text-[8px] text-amber-400 font-bold block">TITLES</span>
              <strong className="text-xs font-black font-mono text-amber-300">
                {championCount}
              </strong>
            </div>

            <div className="px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-400/30 text-center shadow">
              <span className="text-[8px] text-slate-300 font-bold block">FINALS</span>
              <strong className="text-xs font-black font-mono text-slate-200">
                {runnerUpCount}
              </strong>
            </div>

            <div className="px-2 py-0.5 rounded-lg bg-slate-950/90 border border-emerald-500/30 text-center shadow">
              <span className="text-[8px] text-emerald-400 font-bold block">HUNT</span>
              <strong className="text-xs font-black font-mono text-emerald-300">
                {inContentionCount > 0 ? 'Active' : 'Ended'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS (Ultra-Compact Strip) ─── */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-white/10 shrink-0 mb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'showcase', label: '🏆 Trophies', icon: Trophy },
          { id: 'caps', label: '🧢 Caps', icon: Award },
          { id: 'mvp', label: '🌟 MVP', icon: Star },
          { id: 'hall_of_fame', label: '⚡ Records', icon: Crown }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 min-w-[70px] py-1 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={11} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: CURRENT SEASON TROPHIES (Ultra-Compact) ─── */}
      {activeTab === 'showcase' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-0.5">
            <span>Season 2027 Honors</span>
            <span className="text-amber-400 font-bold">Active Tournament</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {combinedTrophies.map((trophy, idx) => {
              const isChamp = trophy.type === 'champion';
              const isRunner = trophy.type === 'runner_up';

              return (
                <div
                  key={trophy.id || idx}
                  className={`p-2.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between gap-2 shadow-sm ${
                    isChamp
                      ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-yellow-600/10 border-amber-400/40'
                      : isRunner
                      ? 'bg-gradient-to-br from-slate-400/15 via-slate-900 to-slate-700/10 border-slate-400/30'
                      : 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-teal-800/10 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-sm border shrink-0 ${
                        isChamp 
                          ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                          : isRunner
                          ? 'bg-slate-400/20 border-slate-300 text-slate-200'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      }`}>
                        {isChamp ? '🏆' : isRunner ? '🥈' : '🎖️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase bg-amber-400 text-slate-950">
                            {trophy.seasonLabel}
                          </span>
                          {trophy.isUserEarned && (
                            <span className="px-1 py-0.2 rounded bg-purple-500/30 border border-purple-400/50 text-purple-300 text-[8px] font-mono font-bold">
                              ★ User
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-black font-mono text-white mt-0.5">
                          {trophy.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 bg-slate-950/70 p-2 rounded-lg border border-white/5 space-y-0.5">
                    <div className="text-[11px] font-bold text-gray-300">
                      {trophy.subtitle}
                    </div>
                    <div className="text-[10px] font-mono text-amber-300/90 flex items-center gap-1">
                      <Star size={10} className="text-amber-400 shrink-0" />
                      <span className="truncate">{trophy.captainOrHighlight}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CAPS (ORANGE & PURPLE) ─── */}
      {activeTab === 'caps' && (
        <div className="flex flex-col gap-3">
          
          {/* 🧡 ORANGE CAP (SEASON 2027 TOP RUN-SCORER) */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-amber-500/30 shadow-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🧢</span>
                <span className="text-xs font-black uppercase text-amber-400">
                  Orange Cap · Season 2027 Runs Leader
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">IPL 2027</span>
            </div>

            {/* Leader Micro-Card */}
            {awards.orangeCapLeader && (
              <div className="my-2 p-2 rounded-xl bg-slate-950/90 border border-amber-500/40 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo teamId={awards.orangeCapLeader.teamShort} size={22} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                      <span className="truncate">{awards.orangeCapLeader.playerName}</span>
                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">
                        {awards.orangeCapLeader.teamShort}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {awards.orangeCapLeader.innings} inn • HS: {awards.orangeCapLeader.highestScore}* • SR: {awards.orangeCapLeader.strikeRate}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-amber-400">
                    {awards.orangeCapLeader.runs} <span className="text-[10px] text-gray-400 font-sans">runs</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    {awards.orangeCapLeader.fifties}×50 • {awards.orangeCapLeader.hundreds}×100
                  </div>
                </div>
              </div>
            )}

            {/* Chasers Strip */}
            <div className="space-y-1">
              {awards.orangeCapTop5.slice(1, 5).map((bat: PlayerBattingAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 text-[10px] font-bold w-4">#{idx + 2}</span>
                    <TeamLogo teamId={bat.teamShort} size={14} />
                    <span className="text-white font-bold truncate">{bat.playerName}</span>
                    <span className="text-gray-400 text-[9px]">({bat.teamShort})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-amber-300 font-bold">{bat.runs} R</span>
                    <span className="text-gray-400 text-[10px]">SR {bat.strikeRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💜 PURPLE CAP (SEASON 2027 TOP WICKET-TAKER) */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-slate-900 to-indigo-500/10 border border-purple-500/30 shadow-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-black uppercase text-purple-300">
                  Purple Cap · Season 2027 Wickets Leader
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">IPL 2027</span>
            </div>

            {/* Leader Micro-Card */}
            {awards.purpleCapLeader && (
              <div className="my-2 p-2 rounded-xl bg-slate-950/90 border border-purple-500/40 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo teamId={awards.purpleCapLeader.teamShort} size={22} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                      <span className="truncate">{awards.purpleCapLeader.playerName}</span>
                      <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono">
                        {awards.purpleCapLeader.teamShort}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {awards.purpleCapLeader.overs} ov • BBI: {awards.purpleCapLeader.bestFigures} • Econ: {awards.purpleCapLeader.economy}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-purple-300">
                    {awards.purpleCapLeader.wickets} <span className="text-[10px] text-gray-400 font-sans">wkts</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    Econ {awards.purpleCapLeader.economy}
                  </div>
                </div>
              </div>
            )}

            {/* Chasers Strip */}
            <div className="space-y-1">
              {awards.purpleCapTop5.slice(1, 5).map((bowl: PlayerBowlingAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 text-[10px] font-bold w-4">#{idx + 2}</span>
                    <TeamLogo teamId={bowl.teamShort} size={14} />
                    <span className="text-white font-bold truncate">{bowl.playerName}</span>
                    <span className="text-gray-400 text-[9px]">({bowl.teamShort})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-purple-300 font-bold">{bowl.wickets} W</span>
                    <span className="text-gray-400 text-[10px]">Econ {bowl.economy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 3: MVP & EMERGING PLAYER ─── */}
      {activeTab === 'mvp' && (
        <div className="flex flex-col gap-3">
          
          {/* 👑 TOURNAMENT MVP */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/30 shadow-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">👑</span>
                <span className="text-xs font-black uppercase text-emerald-300">
                  Season 2027 MVP (Most Valuable Player)
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">IPL 2027</span>
            </div>

            {awards.tournamentMVP && (
              <div className="my-2 p-2 rounded-xl bg-slate-950/90 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo teamId={awards.tournamentMVP.teamShort} size={22} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                      <span className="truncate">{awards.tournamentMVP.playerName}</span>
                      <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                        {awards.tournamentMVP.teamShort}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {awards.tournamentMVP.role} • {awards.tournamentMVP.highlight}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-emerald-300">
                    {awards.tournamentMVP.mvpPoints} <span className="text-[10px] text-gray-400 font-sans">pts</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    #1 Impact Rank
                  </div>
                </div>
              </div>
            )}

            {/* MVP Top 5 */}
            <div className="space-y-1">
              {awards.mvpTop5.slice(1, 5).map((mvp: MVPAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 text-[10px] font-bold w-4">#{idx + 2}</span>
                    <TeamLogo teamId={mvp.teamShort} size={14} />
                    <span className="text-white font-bold truncate">{mvp.playerName}</span>
                    <span className="text-gray-400 text-[9px]">({mvp.teamShort})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-300 font-bold">{mvp.mvpPoints} pts</span>
                    <span className="text-gray-400 text-[10px]">{mvp.runs}R / {mvp.wickets}W</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🌟 EMERGING PLAYER OF THE SEASON */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-indigo-500/10 border border-sky-500/30 shadow-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🌟</span>
                <span className="text-xs font-black uppercase text-sky-300">
                  Season 2027 Emerging Star (U-23 Talent)
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">IPL 2027</span>
            </div>

            {awards.emergingPlayer && (
              <div className="my-2 p-2 rounded-xl bg-slate-950/90 border border-sky-500/40 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo teamId={awards.emergingPlayer.teamShort} size={22} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                      <span className="truncate">{awards.emergingPlayer.playerName}</span>
                      <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono">
                        {awards.emergingPlayer.teamShort} · Age {awards.emergingPlayer.age}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {awards.emergingPlayer.highlight}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-sky-300">
                    {awards.emergingPlayer.impactScore} <span className="text-[10px] text-gray-400 font-sans">idx</span>
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono">
                    ✓ Future Star
                  </div>
                </div>
              </div>
            )}

            {/* Emerging Nominees */}
            <div className="space-y-1">
              {awards.emergingTop3.slice(1).map((em: EmergingPlayerAwardStats, idx: number) => (
                <div 
                  key={idx}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 text-[10px] font-bold w-4">#{idx + 2}</span>
                    <TeamLogo teamId={em.teamShort} size={14} />
                    <span className="text-white font-bold truncate">{em.playerName}</span>
                    <span className="text-gray-400 text-[9px]">({em.teamShort} · Age {em.age})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sky-300 font-bold">{em.impactScore} pts</span>
                    <span className="text-gray-400 text-[10px]">{em.runs} runs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 4: CURRENT SEASON 2027 TOURNAMENT RECORDS ─── */}
      {activeTab === 'hall_of_fame' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
            <span>Official Season 2027 Match Records</span>
            <span className="text-amber-400 font-bold">IPL 2027 Campaign</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Record 1: Highest Team Total */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-amber-400 uppercase font-bold block">
                  ⚡ HIGHEST TEAM TOTAL
                </span>
                <div className="text-base font-black font-mono text-white">
                  {awards.hallOfFame.highestTeamTotal.score}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {awards.hallOfFame.highestTeamTotal.team} {awards.hallOfFame.highestTeamTotal.opp}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold shrink-0">
                2027
              </span>
            </div>

            {/* Record 2: Fastest 50 */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-sky-400 uppercase font-bold block">
                  🚀 FASTEST FIFTY
                </span>
                <div className="text-base font-black font-mono text-white">
                  {awards.hallOfFame.fastestFifty.balls} Balls
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {awards.hallOfFame.fastestFifty.player} ({awards.hallOfFame.fastestFifty.team})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold shrink-0">
                2027
              </span>
            </div>

            {/* Record 3: Best Bowling Figures */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-purple-400 uppercase font-bold block">
                  🎯 BEST BOWLING SPELL
                </span>
                <div className="text-base font-black font-mono text-white">
                  {awards.hallOfFame.bestBowlingFigures.figures}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {awards.hallOfFame.bestBowlingFigures.player} ({awards.hallOfFame.bestBowlingFigures.team})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold shrink-0">
                2027
              </span>
            </div>

            {/* Record 4: Highest Individual Score */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block">
                  👑 HIGHEST INDIVIDUAL SCORE
                </span>
                <div className="text-base font-black font-mono text-white">
                  {awards.hallOfFame.highestIndividualScore.score}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {awards.hallOfFame.highestIndividualScore.player} ({awards.hallOfFame.highestIndividualScore.balls}b)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
                2027
              </span>
            </div>

            {/* Record 5: Most Sixes in an Innings */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-rose-400 uppercase font-bold block">
                  💥 MOST SIXES IN INNINGS
                </span>
                <div className="text-base font-black font-mono text-white">
                  {awards.hallOfFame.mostSixesInInnings.sixes} Sixes
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {awards.hallOfFame.mostSixesInInnings.player} ({awards.hallOfFame.mostSixesInInnings.team})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold shrink-0">
                2027
              </span>
            </div>

            {/* Record 6: Highest Successful Run Chase */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-teal-400 uppercase font-bold block">
                  🏃 HIGHEST RUN CHASE
                </span>
                <div className="text-base font-black font-mono text-white">
                  {awards.hallOfFame.highestRunChase.target} Runs
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {awards.hallOfFame.highestRunChase.team} {awards.hallOfFame.highestRunChase.opp}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold shrink-0">
                2027
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
