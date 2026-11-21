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
  History,
  Lock
} from 'lucide-react';
import { useCampaignStore } from '../../store/useCampaignStore';
import { getFranchise } from '../../data/franchises';
import { 
  computeTournamentAwards, 
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
  const { getActiveCampaign } = useCampaignStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'caps' | 'mvp' | 'hall_of_fame'>('showcase');

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCamp = mounted ? getActiveCampaign() : null;
  const franchiseId = activeCamp?.teamId || 'csk';
  const currentFranchise = getFranchise(franchiseId);

  // Current Season Trophies ONLY (No historical past records)
  const schedule = activeCamp?.schedule || [];
  const pointsTable = activeCamp?.pointsTable || [];
  const awards: TournamentAwardsSummary = computeTournamentAwards(schedule, franchiseId);
  const completedMatchesCount = schedule.filter(m => m.status === 'COMPLETED').length;

  const finalMatch = schedule.find(m => m.stage === 'Final' || m.matchNo === 74);
  const userSeasonTrophies = (activeCamp?.teamId === franchiseId && activeCamp?.userTrophies) 
    ? activeCamp.userTrophies.filter(t => t.seasonYear === 2027) 
    : [];

  const ptEntry = pointsTable.find(p => p.teamId === franchiseId);
  const rank = pointsTable.findIndex(p => p.teamId === franchiseId) + 1;

  // Build Current Season Trophy Cards
  const currentSeasonTrophies: FranchiseHistoricTrophy[] = [...userSeasonTrophies];

  if (finalMatch && finalMatch.status === 'COMPLETED') {
    if (finalMatch.result?.winnerTeamId === franchiseId) {
      if (!currentSeasonTrophies.some(t => t.type === 'champion')) {
        currentSeasonTrophies.push({
          id: `season_2027_champ_${franchiseId}`,
          seasonYear: 2027,
          seasonLabel: 'Season 2027',
          type: 'champion',
          title: 'IPL 2027 Champions Trophy',
          subtitle: `Crowned Champions • Defeated ${finalMatch.result?.winnerTeamId === finalMatch.teamAId ? finalMatch.teamBShort : finalMatch.teamAShort} in Grand Final`,
          captainOrHighlight: `Official BCCI 2027 Championship Trophy`,
          isUserEarned: activeCamp?.teamId === franchiseId
        });
      }
    } else if (finalMatch.teamAId === franchiseId || finalMatch.teamBId === franchiseId) {
      if (!currentSeasonTrophies.some(t => t.type === 'runner_up')) {
        currentSeasonTrophies.push({
          id: `season_2027_runner_${franchiseId}`,
          seasonYear: 2027,
          seasonLabel: 'Season 2027',
          type: 'runner_up',
          title: 'IPL 2027 Runners-Up Shield',
          subtitle: `Grand Finalists • Silverware Awarded`,
          captainOrHighlight: `Official BCCI 2027 Runner-Up Shield`,
          isUserEarned: activeCamp?.teamId === franchiseId
        });
      }
    }
  } else {
    // Current season is active or commencing
    const played = ptEntry?.played || 0;
    const won = ptEntry?.won || 0;
    const pts = ptEntry?.points || 0;
    currentSeasonTrophies.push({
      id: `season_2027_hunt_${franchiseId}`,
      seasonYear: 2027,
      seasonLabel: 'Season 2027',
      type: 'champion',
      title: 'IPL 2027 Championship Trophy',
      subtitle: rank > 0 ? `Current Standings: Ranked #${rank} • ${won}W / ${played}P (${pts} Pts)` : `Season 2027 Contender`,
      captainOrHighlight: `Target: Lift the 2027 Trophy at Ahmedabad Grand Final`,
      isUserEarned: activeCamp?.teamId === franchiseId
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
    <div className="min-h-screen bg-transparent text-white flex flex-col select-none pt-12 sm:pt-14 pb-12 px-2.5 sm:px-4 max-w-4xl mx-auto w-full overflow-x-hidden min-w-0">
      
      {/* ─── COMPACT TOP HEADER BAR ─── */}
      <div className="flex flex-wrap items-center justify-between py-1.5 border-b border-white/10 gap-1.5 shrink-0 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <TeamLogo teamId={currentFranchise.id} size={22} className="shrink-0" />
          <div className="flex items-baseline gap-1.5 truncate">
            <h1 className="text-sm sm:text-base font-black font-mono text-amber-400 truncate">
              {currentFranchise.short}
            </h1>
            <span className="text-[10px] font-mono text-gray-400 font-bold truncate">
              • Season 2027 Honors
            </span>
          </div>
        </div>

        {/* Quick Vitals & Back to Playing 11 */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-mono px-1.5 sm:px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-amber-400 font-bold">🏆 {championCount}</span>
            <span className="text-gray-500">|</span>
            <span className="text-slate-300 font-bold">🥈 {runnerUpCount}</span>
            <span className="text-gray-500">|</span>
            <span className="text-emerald-400 font-bold">{completedMatchesCount > 0 ? `${completedMatchesCount}M Done` : 'Pre-Season'}</span>
          </div>

          <Link
            href="/playing-xi"
            onClick={() => {
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all shrink-0"
          >
            <Calendar size={11} />
            <span>Playing 11</span>
          </Link>
        </div>
      </div>

      {/* ─── NAVIGATION TABS (Ultra-Compact Strip) ─── */}
      <div className="w-full max-w-full overflow-hidden flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-white/10 shrink-0 my-1.5">
        {[
          { id: 'showcase', label: '🏆 Trophies', icon: Trophy },
          { id: 'caps', label: '🧢 Caps', icon: Award },
          { id: 'mvp', label: '🌟 MVP & Emerging', icon: Star },
          { id: 'hall_of_fame', label: '⚡ Records', icon: Crown }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
            }}
            className={`flex-1 min-w-0 py-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer truncate ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={11} className="shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: CURRENT SEASON TROPHIES (Ultra-Compact) ─── */}
      {activeTab === 'showcase' && (
        <div className="flex flex-col gap-1.5 w-full min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-0.5">
            <span>Season 2027 Trophy Showcase</span>
            <span className="text-amber-400 font-bold">Official BCCI Campaign</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
            {combinedTrophies.map((trophy, idx) => {
              const isChamp = trophy.type === 'champion';
              const isRunner = trophy.type === 'runner_up';

              return (
                <div
                  key={trophy.id || idx}
                  className={`p-2.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 shadow-sm min-w-0 ${
                    isChamp
                      ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-yellow-600/10 border-amber-400/40'
                      : isRunner
                      ? 'bg-gradient-to-br from-slate-400/15 via-slate-900 to-slate-700/10 border-slate-400/30'
                      : 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-teal-800/10 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 relative z-10 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm border shrink-0 ${
                        isChamp 
                          ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                          : isRunner
                          ? 'bg-slate-400/20 border-slate-300 text-slate-200'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      }`}>
                        {isChamp ? '🏆' : isRunner ? '🥈' : '🎖️'}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-black uppercase bg-amber-400 text-slate-950 shrink-0">
                            {trophy.seasonLabel}
                          </span>
                          {trophy.isUserEarned && (
                            <span className="px-1 py-0.2 rounded bg-purple-500/30 border border-purple-400/50 text-purple-300 text-[8px] font-mono font-bold shrink-0">
                              ★ User
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-black font-mono text-white mt-0.5 truncate">
                          {trophy.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 bg-slate-950/70 p-1.5 rounded-lg border border-white/5 space-y-0.5 min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-bold text-gray-300 truncate">
                      {trophy.subtitle}
                    </div>
                    <div className="text-[9.5px] font-mono text-amber-300/90 flex items-center gap-1 min-w-0 truncate">
                      <Star size={9} className="text-amber-400 shrink-0" />
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
        completedMatchesCount === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-purple-500/10 border border-white/10 text-center flex flex-col items-center justify-center gap-2.5 shadow-xl w-full min-w-0">
            <div className="flex items-center gap-2 text-2xl">
              <span>🧢</span>
              <span>🎯</span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-amber-400 font-mono uppercase tracking-wider">
                Season 2027 Cap Races Unlocking Soon
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-1 max-w-sm mx-auto leading-relaxed">
                The tournament has not commenced yet. Orange Cap (Runs Leader) and Purple Cap (Wickets Leader) will track live once Matchday 1 gets underway!
              </p>
            </div>
            <Link
              href="/playing-xi"
              className="mt-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Calendar size={13} />
              <span>Go to Match Schedule</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full min-w-0">
            {/* 🧡 ORANGE CAP */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-amber-500/30 shadow-md flex flex-col justify-between gap-1.5 min-w-0">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🧢</span>
                  <span className="text-[11px] font-black uppercase text-amber-400">
                    Orange Cap · Runs Leader
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gray-400">IPL 2027</span>
              </div>

              {/* Leader Micro-Card */}
              {awards.orangeCapLeader ? (
                <div className="my-1 p-2 rounded-xl bg-slate-950/90 border border-amber-500/40 flex items-center justify-between gap-2 shadow-sm min-w-0">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <TeamLogo teamId={awards.orangeCapLeader.teamShort} size={20} className="shrink-0" />
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                        <span className="truncate">{awards.orangeCapLeader.playerName}</span>
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8.5px] font-mono shrink-0">
                          {awards.orangeCapLeader.teamShort}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-mono truncate">
                        {awards.orangeCapLeader.innings} inn • HS: {awards.orangeCapLeader.highestScore}* • SR: {awards.orangeCapLeader.strikeRate}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono text-amber-400">
                      {awards.orangeCapLeader.runs} <span className="text-[9px] text-gray-400 font-sans">runs</span>
                    </div>
                    <div className="text-[8.5px] text-gray-400 font-mono">
                      {awards.orangeCapLeader.fifties}×50 • {awards.orangeCapLeader.hundreds}×100
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Chasers Strip */}
              <div className="space-y-0.5 min-w-0">
                {awards.orangeCapTop5.slice(1, 5).map((bat: PlayerBattingAwardStats, idx: number) => (
                  <div 
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[10px] font-mono min-w-0"
                  >
                    <div className="flex items-center gap-1 min-w-0 truncate">
                      <span className="text-gray-500 font-bold w-3.5 shrink-0">#{idx + 2}</span>
                      <TeamLogo teamId={bat.teamShort} size={12} className="shrink-0" />
                      <span className="text-white font-bold truncate">{bat.playerName}</span>
                      <span className="text-gray-400 text-[8.5px] shrink-0">({bat.teamShort})</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="text-amber-300 font-bold">{bat.runs} R</span>
                      <span className="text-gray-400 text-[9px]">SR {bat.strikeRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 💜 PURPLE CAP */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-slate-900 to-indigo-500/10 border border-purple-500/30 shadow-md flex flex-col justify-between gap-1.5 min-w-0">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🎯</span>
                  <span className="text-[11px] font-black uppercase text-purple-300">
                    Purple Cap · Wickets Leader
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gray-400">IPL 2027</span>
              </div>

              {/* Leader Micro-Card */}
              {awards.purpleCapLeader ? (
                <div className="my-1 p-2 rounded-xl bg-slate-950/90 border border-purple-500/40 flex items-center justify-between gap-2 shadow-sm min-w-0">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <TeamLogo teamId={awards.purpleCapLeader.teamShort} size={20} className="shrink-0" />
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                        <span className="truncate">{awards.purpleCapLeader.playerName}</span>
                        <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8.5px] font-mono shrink-0">
                          {awards.purpleCapLeader.teamShort}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-mono truncate">
                        {awards.purpleCapLeader.overs} ov • BBI: {awards.purpleCapLeader.bestFigures} • Econ: {awards.purpleCapLeader.economy}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono text-purple-300">
                      {awards.purpleCapLeader.wickets} <span className="text-[9px] text-gray-400 font-sans">wkts</span>
                    </div>
                    <div className="text-[8.5px] text-gray-400 font-mono">
                      Econ {awards.purpleCapLeader.economy}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Chasers Strip */}
              <div className="space-y-0.5 min-w-0">
                {awards.purpleCapTop5.slice(1, 5).map((bowl: PlayerBowlingAwardStats, idx: number) => (
                  <div 
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[10px] font-mono min-w-0"
                  >
                    <div className="flex items-center gap-1 min-w-0 truncate">
                      <span className="text-gray-500 font-bold w-3.5 shrink-0">#{idx + 2}</span>
                      <TeamLogo teamId={bowl.teamShort} size={12} className="shrink-0" />
                      <span className="text-white font-bold truncate">{bowl.playerName}</span>
                      <span className="text-gray-400 text-[8.5px] shrink-0">({bowl.teamShort})</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="text-purple-300 font-bold">{bowl.wickets} W</span>
                      <span className="text-gray-400 text-[9px]">Econ {bowl.economy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ─── TAB 3: MVP & EMERGING PLAYER ─── */}
      {activeTab === 'mvp' && (
        completedMatchesCount === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-sky-500/10 border border-white/10 text-center flex flex-col items-center justify-center gap-2.5 shadow-xl w-full min-w-0">
            <div className="flex items-center gap-2 text-2xl">
              <span>👑</span>
              <span>🌟</span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-emerald-400 font-mono uppercase tracking-wider">
                Tournament MVP & Emerging Star Awaiting Match 1
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-1 max-w-sm mx-auto leading-relaxed">
                Official BCCI MVP Impact points and Emerging Player (U-23) standings will be computed in real-time as fixtures are completed!
              </p>
            </div>
            <Link
              href="/playing-xi"
              className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Calendar size={13} />
              <span>Go to Schedule</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full min-w-0">
            {/* 👑 TOURNAMENT MVP */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/30 shadow-md flex flex-col justify-between gap-1.5 min-w-0">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">👑</span>
                  <span className="text-[11px] font-black uppercase text-emerald-300">
                    Season 2027 MVP
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gray-400">IPL 2027</span>
              </div>

              {awards.tournamentMVP && (
                <div className="my-1 p-2 rounded-xl bg-slate-950/90 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-sm min-w-0">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <TeamLogo teamId={awards.tournamentMVP.teamShort} size={20} className="shrink-0" />
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                        <span className="truncate">{awards.tournamentMVP.playerName}</span>
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8.5px] font-mono shrink-0">
                          {awards.tournamentMVP.teamShort}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-mono truncate">
                        {awards.tournamentMVP.role} • {awards.tournamentMVP.highlight}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono text-emerald-300">
                      {awards.tournamentMVP.mvpPoints} <span className="text-[9px] text-gray-400 font-sans">pts</span>
                    </div>
                    <div className="text-[8.5px] text-gray-400 font-mono">
                      #1 Impact Rank
                    </div>
                  </div>
                </div>
              )}

              {/* MVP Top 5 */}
              <div className="space-y-0.5 min-w-0">
                {awards.mvpTop5.slice(1, 5).map((mvp: MVPAwardStats, idx: number) => (
                  <div 
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[10px] font-mono min-w-0"
                  >
                    <div className="flex items-center gap-1 min-w-0 truncate">
                      <span className="text-gray-500 font-bold w-3.5 shrink-0">#{idx + 2}</span>
                      <TeamLogo teamId={mvp.teamShort} size={12} className="shrink-0" />
                      <span className="text-white font-bold truncate">{mvp.playerName}</span>
                      <span className="text-gray-400 text-[8.5px] shrink-0">({mvp.teamShort})</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="text-emerald-300 font-bold">{mvp.mvpPoints} pts</span>
                      <span className="text-gray-400 text-[9px]">{mvp.runs}R / {mvp.wickets}W</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🌟 EMERGING PLAYER */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-indigo-500/10 border border-sky-500/30 shadow-md flex flex-col justify-between gap-1.5 min-w-0">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🌟</span>
                  <span className="text-[11px] font-black uppercase text-sky-300">
                    Emerging Star (U-23)
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gray-400">IPL 2027</span>
              </div>

              {awards.emergingPlayer && (
                <div className="my-1 p-2 rounded-xl bg-slate-950/90 border border-sky-500/40 flex items-center justify-between gap-2 shadow-sm min-w-0">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <TeamLogo teamId={awards.emergingPlayer.teamShort} size={20} className="shrink-0" />
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                        <span className="truncate">{awards.emergingPlayer.playerName}</span>
                        <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[8.5px] font-mono shrink-0">
                          {awards.emergingPlayer.teamShort} · Age {awards.emergingPlayer.age}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-mono truncate">
                        {awards.emergingPlayer.highlight}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono text-sky-300">
                      {awards.emergingPlayer.impactScore} <span className="text-[9px] text-gray-400 font-sans">idx</span>
                    </div>
                    <div className="text-[8.5px] text-emerald-400 font-mono">
                      ✓ Future Star
                    </div>
                  </div>
                </div>
              )}

              {/* Emerging Nominees */}
              <div className="space-y-0.5 min-w-0">
                {awards.emergingTop3.slice(1).map((em: EmergingPlayerAwardStats, idx: number) => (
                  <div 
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[10px] font-mono min-w-0"
                  >
                    <div className="flex items-center gap-1 min-w-0 truncate">
                      <span className="text-gray-500 font-bold w-3.5 shrink-0">#{idx + 2}</span>
                      <TeamLogo teamId={em.teamShort} size={12} className="shrink-0" />
                      <span className="text-white font-bold truncate">{em.playerName}</span>
                      <span className="text-gray-400 text-[8.5px] shrink-0">({em.teamShort})</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="text-sky-300 font-bold">{em.impactScore} pts</span>
                      <span className="text-gray-400 text-[9px]">{em.runs} runs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ─── TAB 4: CURRENT SEASON 2027 TOURNAMENT RECORDS ─── */}
      {activeTab === 'hall_of_fame' && (
        completedMatchesCount === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-white/10 text-center flex flex-col items-center justify-center gap-2.5 shadow-xl w-full min-w-0">
            <div className="text-2xl">⚡</div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-amber-400 font-mono uppercase tracking-wider">
                Season 2027 Tournament Records
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-1 max-w-sm mx-auto leading-relaxed">
                Fastest fifties, highest team totals, and greatest match chases will be etched into the record books once the season commences!
              </p>
            </div>
            <Link
              href="/playing-xi"
              className="mt-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border border-white/10"
            >
              <Calendar size={13} className="text-amber-400" />
              <span>View Fixtures</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 w-full min-w-0">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-0.5">
              <span>Official Season 2027 Match Records</span>
              <span className="text-amber-400 font-bold">IPL 2027 Campaign</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full min-w-0">
              {/* Record 1: Highest Team Total */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-1 shadow-sm min-w-0 overflow-hidden">
                <div className="min-w-0 truncate">
                  <span className="text-[8.5px] font-mono text-amber-400 uppercase font-bold block truncate">
                    ⚡ HIGHEST TEAM TOTAL
                  </span>
                  <div className="text-sm font-black font-mono text-white mt-0.5 truncate">
                    {awards.hallOfFame.highestTeamTotal.score}
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-mono truncate">
                    {awards.hallOfFame.highestTeamTotal.team} {awards.hallOfFame.highestTeamTotal.opp}
                  </div>
                </div>
              </div>

              {/* Record 2: Fastest 50 */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-1 shadow-sm min-w-0 overflow-hidden">
                <div className="min-w-0 truncate">
                  <span className="text-[8.5px] font-mono text-sky-400 uppercase font-bold block truncate">
                    🚀 FASTEST FIFTY
                  </span>
                  <div className="text-sm font-black font-mono text-white mt-0.5 truncate">
                    {awards.hallOfFame.fastestFifty.balls} Balls
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-mono truncate">
                    {awards.hallOfFame.fastestFifty.player} ({awards.hallOfFame.fastestFifty.team})
                  </div>
                </div>
              </div>

              {/* Record 3: Best Bowling Figures */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-1 shadow-sm min-w-0 overflow-hidden">
                <div className="min-w-0 truncate">
                  <span className="text-[8.5px] font-mono text-purple-400 uppercase font-bold block truncate">
                    🎯 BEST BOWLING SPELL
                  </span>
                  <div className="text-sm font-black font-mono text-white mt-0.5 truncate">
                    {awards.hallOfFame.bestBowlingFigures.figures}
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-mono truncate">
                    {awards.hallOfFame.bestBowlingFigures.player} ({awards.hallOfFame.bestBowlingFigures.team})
                  </div>
                </div>
              </div>

              {/* Record 4: Highest Individual Score */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-1 shadow-sm min-w-0 overflow-hidden">
                <div className="min-w-0 truncate">
                  <span className="text-[8.5px] font-mono text-emerald-400 uppercase font-bold block truncate">
                    👑 HIGHEST SCORE
                  </span>
                  <div className="text-sm font-black font-mono text-white mt-0.5 truncate">
                    {awards.hallOfFame.highestIndividualScore.score}
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-mono truncate">
                    {awards.hallOfFame.highestIndividualScore.player} ({awards.hallOfFame.highestIndividualScore.balls}b)
                  </div>
                </div>
              </div>

              {/* Record 5: Most Sixes in an Innings */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-1 shadow-sm min-w-0 overflow-hidden">
                <div className="min-w-0 truncate">
                  <span className="text-[8.5px] font-mono text-rose-400 uppercase font-bold block truncate">
                    💥 MOST SIXES
                  </span>
                  <div className="text-sm font-black font-mono text-white mt-0.5 truncate">
                    {awards.hallOfFame.mostSixesInInnings.sixes} Sixes
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-mono truncate">
                    {awards.hallOfFame.mostSixesInInnings.player} ({awards.hallOfFame.mostSixesInInnings.team})
                  </div>
                </div>
              </div>

              {/* Record 6: Highest Successful Run Chase */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-1 shadow-sm min-w-0 overflow-hidden">
                <div className="min-w-0 truncate">
                  <span className="text-[8.5px] font-mono text-teal-400 uppercase font-bold block truncate">
                    🏃 HIGHEST CHASE
                  </span>
                  <div className="text-sm font-black font-mono text-white mt-0.5 truncate">
                    {awards.hallOfFame.highestRunChase.target} Runs
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-mono truncate">
                    {awards.hallOfFame.highestRunChase.team} {awards.hallOfFame.highestRunChase.opp}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
}
