'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Activity, 
  AlertCircle, 
  Swords, 
  Calendar, 
  Trophy, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2, 
  Lock, 
  Flame, 
  Shield,
  Layers,
  Award,
  Play,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useCampaignStore, CampaignPlayer, sortCricketBattingOrder, computeOptimalPlayingXI } from '../../store/useCampaignStore';
import { getFranchise } from '../../data/franchises';
import { getTeamTheme } from '../../data/teamThemes';
import BallByBallMatchSimulator from '../../components/BallByBallMatchSimulator';
import MatchScorecardModal from '../../components/MatchScorecardModal';
import TeamLogo from '../../components/TeamLogo';
import { TournamentFixture, TournamentPointsEntry } from '../../data/scheduleGenerator';
import { formatPlayerInitial } from '../../lib/nameFormatter';
import { getDetailedPlayerRole, getCompactRoleBadge, isPlayerSpinner } from '../../lib/bowlerClassification';
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics';
import { 
  computeTournamentLeaderboards, 
  getPlayoffBracket, 
  PlayoffBracketNode, 
  BatterTournamentStats, 
  BowlerTournamentStats 
} from '../../lib/tournamentLeaderboards';
import { ChampionshipCelebrationModal } from '../../components/ChampionshipCelebrationModal';

const VENUE_INSIGHTS: Record<string, { title: string, behavior: string, boost: string, hint: string, favRole: string }> = {
  Chennai: {
    title: 'M.A. Chidambaram Stadium (Chepauk)',
    behavior: 'Spin Paradise & Slow Turning Track',
    boost: '+25% Boost to Spin Bowlers & Slow Anchors',
    hint: 'Pack your XI with finger and wrist spinners. High friction surface rewards flight and turn.',
    favRole: 'Spin Bowling & Tactical Anchors'
  },
  Mumbai: {
    title: 'Wankhede Stadium',
    behavior: 'Pace & High-Scoring Dew Track',
    boost: '+20% Boost to Powerhitters & Express Pacers',
    hint: 'Short boundaries and dew in second innings. Prioritize 140+ km/h seamers and aggressive openers.',
    favRole: 'Power Hitters & Fast Bowlers'
  },
  Kolkata: {
    title: 'Eden Gardens',
    behavior: 'True Bounce & Outfield Paradise',
    boost: '+15% Boost to Mystery Spin & Middle Order Hitters',
    hint: 'Lush outfield with quick boundaries. Balanced track with late dew factor.',
    favRole: 'All-Rounders & Spinners'
  },
  Bengaluru: {
    title: 'M. Chinnaswamy Stadium',
    behavior: 'High Altitude & Small Boundaries',
    boost: '+30% Boost to Batting Strike Rate',
    hint: 'Highest scoring ground in IPL. Boundary-clearing ability is paramount.',
    favRole: 'Aggressors & Death Bowlers'
  },
  Hyderabad: {
    title: 'Rajiv Gandhi International Stadium',
    behavior: 'Balanced Sporting Deck',
    boost: '+15% Boost to Seam All-Rounders',
    hint: 'Good carry early on, settles into a steady batting deck as the game progresses.',
    favRole: 'Pace All-Rounders'
  },
  Delhi: {
    title: 'Arun Jaitley Stadium',
    behavior: 'Slow & Low Friction Surface',
    boost: '+20% Boost to Slow Left-Arm & Off-Spinners',
    hint: 'Low bounce requires batsmen with good footwork and spinners who hit the pitch hard.',
    favRole: 'Spin Bowlers & Accumulators'
  },
  Jaipur: {
    title: 'Sawai Mansingh Stadium',
    behavior: 'Large Outfield Dimensions',
    boost: '+15% Boost to Fit Runners & Control Bowlers',
    hint: 'Big square boundaries reward two-running and economical spell bowling.',
    favRole: 'Control Bowlers & Fit Batters'
  },
  Lucknow: {
    title: 'BRSABV Ekana Cricket Stadium',
    behavior: 'Gripping Black Soil Track',
    boost: '+25% Boost to Off-Cutters & Spinners',
    hint: 'Extremely slow surface where 140-150 is a winning score.',
    favRole: 'Spinners & Slower Ball Specialists'
  },
  Ahmedabad: {
    title: 'Narendra Modi Stadium',
    behavior: 'Pace, Bounce & Red/Black Soil Variation',
    boost: '+20% Boost to Tall Express Seamers',
    hint: 'Generous bounce early on gives fast bowlers a distinct edge in powerplay.',
    favRole: 'Express Pacers & Top Order'
  },
  Dharamsala: {
    title: 'HPCA Stadium',
    behavior: 'High Altitude Swing & Seam Track',
    boost: '+25% Boost to Swing Bowlers',
    hint: 'Cool mountain air generates high lateral movement with the new ball.',
    favRole: 'New Ball Swing Bowlers'
  }
};

const TEAM_HOME_CITY: Record<string, string> = {
  rcb: 'Bengaluru',
  csk: 'Chennai',
  mi: 'Mumbai',
  kkr: 'Kolkata',
  srh: 'Hyderabad',
  dc: 'Delhi',
  rr: 'Jaipur',
  lsg: 'Lucknow',
  gt: 'Ahmedabad',
  pbks: 'Dharamsala'
};

// Dynamic Tactical Role Generator based on actual player capabilities
function getPlayerTacticalBadge(player: CampaignPlayer, slotIndex: number): string {
  if (!player) return `#${slotIndex + 1} Squad Member`;

  // Specialist Bowler (Accurate Spin vs Fast distinction)
  if (player.role === 'BOWL') {
    const isSpin = isPlayerSpinner(player);
    const s = (player.statsSummary || '').toLowerCase();
    if (isSpin) {
      if (s.includes('wrist') || s.includes('mystery')) return 'Mystery Spin Bowler';
      return 'Specialist Spin Bowler';
    }
    if (s.includes('swing') || s.includes('seam') || s.includes('powerplay')) {
      return 'Powerplay Swing Fast Bowler';
    }
    if (s.includes('yorker') || s.includes('death') || s.includes('express')) {
      return 'Express Death Fast Bowler';
    }
    return slotIndex >= 9 ? 'Fast Bowler & Tail' : 'Frontline Fast Bowler';
  }

  // Wicketkeeper
  if (player.role === 'WK') {
    if (slotIndex <= 1) return 'Wicketkeeper / Opener';
    if (slotIndex <= 3) return 'Wicketkeeper / Top Order';
    return 'Wicketkeeper / Finisher';
  }

  // All-Rounder
  if (player.role === 'AR') {
    const s = (player.statsSummary || '').toLowerCase();
    if (s.includes('spin')) return 'Spin Bowling All-Rounder';
    if (s.includes('pace') || s.includes('seam') || s.includes('fast')) return 'Fast Bowling All-Rounder';
    if (slotIndex <= 2) return 'Top-Order All-Rounder';
    if (slotIndex <= 4) return 'Match-Winning All-Rounder';
    return 'Finisher All-Rounder';
  }

  // Pure Batter
  const s = (player.statsSummary || '').toLowerCase();
  if (s.includes('open') || slotIndex <= 1) return 'Explosive Opener';
  if (s.includes('anchor') || slotIndex <= 3) return 'Top-Order Anchor';
  if (s.includes('finish') || slotIndex >= 5) return 'Power Finisher';
  return 'Middle-Order Anchor';
}

export default function PlayingXIPage() {
  const router = useRouter();
  const { 
    getActiveCampaign, 
    swapPlayingXISlots, 
    replacePlayingXIPlayer, 
    setPlayingXI,
    recordMatchResult,
    simulateScheduleMatch,
    simulateRound,
    dismissSimulatedWaveAlert
  } = useCampaignStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'xi' | 'schedule' | 'playoffs_caps'>('xi');
  const [scheduleFilter, setScheduleFilter] = useState<'my' | 'all'>('all');
  const [lineupMode, setLineupMode] = useState<'bat_first' | 'bowl_first'>('bat_first');
  const [strategyToast, setStrategyToast] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [selectedFixtureForMatch, setSelectedFixtureForMatch] = useState<TournamentFixture | null>(null);
  const [viewingScorecardFixture, setViewingScorecardFixture] = useState<TournamentFixture | null>(null);
  const [benchDrawerSlotIndex, setBenchDrawerSlotIndex] = useState<number | null>(null);
  const [isSimulatingRound, setIsSimulatingRound] = useState(false);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const campaign = mounted ? getActiveCampaign() : null;
  const venue = selectedVenue || (campaign && TEAM_HOME_CITY[campaign.teamId]) || 'Bengaluru';
  const setVenue = setSelectedVenue;

  const franchise = campaign ? getFranchise(campaign.teamId) : getFranchise('rcb');
  const myTheme = getTeamTheme(franchise.id);
  const activeSquad = campaign ? campaign.squad.filter(p => !p.is_released) : [];
  
  // Resolve active Playing XI player IDs based on lineupMode (Bat-First vs Bowl-First)
  const activeLineupIds = campaign
    ? (lineupMode === 'bat_first'
      ? (campaign.batFirstXI && campaign.batFirstXI.length >= 11 ? campaign.batFirstXI : campaign.playingXI)
      : (campaign.bowlFirstXI && campaign.bowlFirstXI.length >= 11 ? campaign.bowlFirstXI : campaign.playingXI))
    : [];

  const activeImpactId = campaign
    ? (lineupMode === 'bat_first'
      ? (campaign.batFirstImpactId || campaign.impactPlayerId)
      : (campaign.bowlFirstImpactId || campaign.impactPlayerId))
    : undefined;

  // Resolve Playing XI objects from player_ids
  const playingXIObjects: CampaignPlayer[] = (activeLineupIds || [])
    .map(id => activeSquad.find(p => p.player_id === id))
    .filter(Boolean) as CampaignPlayer[];

  // Fallback if playingXI is incomplete: compute optimal balanced cricket lineup
  let fullPlayingXI: CampaignPlayer[] = [...playingXIObjects];
  if (fullPlayingXI.length < 11 && activeSquad.length >= 11) {
    const autoXI = computeOptimalPlayingXI(activeSquad, { venueCity: venue, mode: lineupMode });
    fullPlayingXI = autoXI.xiIds
      .map(id => activeSquad.find(p => p.player_id === id))
      .filter(Boolean) as CampaignPlayer[];
  } else if (fullPlayingXI.length < 11) {
    activeSquad.forEach(p => {
      if (fullPlayingXI.length < 11 && !fullPlayingXI.some(x => x.player_id === p.player_id)) {
        fullPlayingXI.push(p);
      }
    });
  }

  // Reserve squad (bench players)
  const benchPlayers = activeSquad.filter(p => !fullPlayingXI.some(x => x.player_id === p.player_id));
  const impactPlayer = activeSquad.find(p => p.player_id === activeImpactId) || benchPlayers[0];

  // BCCI Compliance Checks
  const overseasInXI = fullPlayingXI.filter(p => p.is_overseas).length;
  const wkInXI = fullPlayingXI.filter(p => p.role === 'WK').length;
  const bowlersInXI = fullPlayingXI.filter(p => p.role === 'BOWL' || p.role === 'AR').length;

  // Active in-progress match simulation state
  const activeSim = campaign?.activeMatchSimulation as any;
  const isMatchActive = Boolean(activeSim && !activeSim.matchDone);
  const activeInn = isMatchActive ? (activeSim?.innIndex === 2 ? activeSim?.inn2 : activeSim?.inn1) : null;
  const activeLegalBalls = activeInn?.legalBalls || 0;
  const activeOversStr = `${Math.floor(activeLegalBalls / 6)}.${activeLegalBalls % 6}`;
  const activeScoreStr = activeInn ? `${activeInn.totalRuns}/${activeInn.totalWickets}` : '';
  const isCompliant = fullPlayingXI.length === 11 && overseasInXI <= 4 && wkInXI >= 1 && bowlersInXI >= 5;

  const currentInsight = VENUE_INSIGHTS[venue] || VENUE_INSIGHTS['Bengaluru'];

  // Tournament Fixtures & Schedule (70 League Matches + 4 Playoff Matches)
  const schedule = campaign?.schedule || [];
  const myFixtures = schedule.filter(f => f.isMyMatch || f.stage !== 'League');
  const currentMatch = schedule.find(f => f.isMyMatch && f.status === 'CURRENT') || myFixtures.find(f => f.status === 'CURRENT') || myFixtures[0];
  
  const rivalTeamId = currentMatch
    ? (currentMatch.teamAId === campaign?.teamId ? currentMatch.teamBId : currentMatch.teamAId)
    : 'csk';
  const rivalFranchise = getFranchise(rivalTeamId);
  const pointsTable = campaign?.pointsTable || [];

  // Strictly align teams, squads, and logos with the active fixture being played
  const activeMatchFixture = selectedFixtureForMatch || currentMatch;
  const isUserPlayingInFixture = activeMatchFixture
    ? (activeMatchFixture.teamAId === campaign?.teamId || activeMatchFixture.teamBId === campaign?.teamId)
    : true;

  let simMyFranchise = franchise;
  let simRivalFranchise = rivalFranchise;
  let simMySquad: any[] = activeSquad;

  if (activeMatchFixture) {
    if (isUserPlayingInFixture) {
      simMyFranchise = franchise;
      const rivalId = activeMatchFixture.teamAId === campaign?.teamId ? activeMatchFixture.teamBId : activeMatchFixture.teamAId;
      simRivalFranchise = getFranchise(rivalId);
      simMySquad = activeSquad;
    } else {
      // AI vs AI fixture clicked from schedule
      simMyFranchise = getFranchise(activeMatchFixture.teamAId);
      simRivalFranchise = getFranchise(activeMatchFixture.teamBId);
      simMySquad = simMyFranchise.squad2026 || [];
    }
  }

  const handleLaunchMatch = (fixture?: TournamentFixture) => {
    gameAudio.playUiTap('select');
    triggerGameHaptic('light');
    setSelectedFixtureForMatch(fixture || currentMatch);
    setShowSimulator(true);
  };

  useEffect(() => {
    if (campaign && fullPlayingXI.length >= 11) {
      const currentIds = lineupMode === 'bat_first' ? campaign.batFirstXI : campaign.bowlFirstXI;
      if (!currentIds || currentIds.length < 11) {
        setPlayingXI(fullPlayingXI.map(p => p.player_id), activeImpactId, lineupMode);
      }
    }
  }, [campaign?.id, lineupMode, fullPlayingXI.length]);

  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < fullPlayingXI.length) {
      gameAudio.playCardSwap();
      triggerGameHaptic('light');
      const newXI = [...fullPlayingXI];
      const temp = newXI[index];
      newXI[index] = newXI[target];
      newXI[target] = temp;
      setPlayingXI(newXI.map(p => p.player_id), activeImpactId, lineupMode);
    }
  };

  const leaderboards = useMemo(() => {
    return computeTournamentLeaderboards(schedule);
  }, [schedule]);

  const playoffBracket = useMemo(() => {
    return getPlayoffBracket(schedule);
  }, [schedule]);

  const finalFixture = schedule.find(f => f.matchNo === 74);
  const userWonFinal = Boolean(finalFixture?.status === 'COMPLETED' && finalFixture.result?.winnerTeamId === campaign?.teamId);

  // Prevent SSR/Client Hydration Mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-2.5 text-xs font-mono text-gray-400">
          <Activity className="animate-spin text-amber-400" size={18} />
          <span>Loading IPL War Room & Tournament Arena...</span>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 max-w-md shadow-2xl">
          <AlertCircle size={36} className="mx-auto text-amber-400 mb-3" />
          <h3 className="text-lg font-black font-display mb-2">No Active Campaign Found</h3>
          <p className="text-xs text-gray-400 mb-4">Please select your franchise to enter the war room.</p>
          <button
            onClick={() => router.push('/select-team')}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer hover:bg-amber-400 transition-all"
          >
            Select Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[100dvh] bg-transparent text-white flex flex-col safe-page-top pb-16 w-full max-w-full overflow-x-hidden select-none"
    >
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-4">
        
        {/* ─── Sleek Minimal Header & Tab Controls ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-2 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2">
            <TeamLogo teamId={franchise.id} size={24} />
            <div className="flex items-baseline gap-1.5">
              <h1 
                style={{ color: myTheme.primary }}
                className="text-base sm:text-lg font-black font-mono"
              >
                {franchise.name}
              </h1>
              <span className="text-[11px] text-gray-300 font-mono">
                Match #{currentMatch?.matchNo || 1}
              </span>
            </div>
          </div>

          {/* View Mode Switcher (Tabs) & Single Play Match Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                onClick={() => {
                  gameAudio.playUiTap('select');
                  setActiveTab('xi');
                }}
                style={activeTab === 'xi' ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 12px ${myTheme.primary}`,
                } : {}}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'xi' ? 'shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users size={12} />
                <span>Playing 11</span>
              </button>
              <button
                onClick={() => {
                  gameAudio.playUiTap('select');
                  setActiveTab('schedule');
                }}
                style={activeTab === 'schedule' ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 12px ${myTheme.primary}`,
                } : {}}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'schedule' ? 'shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={12} />
                <span>Schedule (74)</span>
              </button>
              <button
                onClick={() => {
                  gameAudio.playUiTap('select');
                  setActiveTab('playoffs_caps');
                }}
                style={activeTab === 'playoffs_caps' ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 12px ${myTheme.primary}`,
                } : {}}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'playoffs_caps' ? 'shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Trophy size={12} />
                <span>Playoffs & Caps</span>
              </button>
              <Link
                href="/trophies"
                onClick={() => {
                  gameAudio.playUiTap('select');
                  triggerGameHaptic('light');
                }}
                className="flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer text-gray-400 hover:text-white hover:bg-white/5"
                title="Franchise Trophies & Honors"
              >
                <Trophy size={12} style={{ color: myTheme.primary }} />
                <span>Trophies</span>
              </Link>
            </div>

            {/* Strictly Single Play/Resume Match CTA */}
            <button
              onClick={() => handleLaunchMatch()}
              style={{
                backgroundColor: myTheme.pillBg,
                color: myTheme.pillText,
                boxShadow: `0 0 20px ${myTheme.primary}90`,
              }}
              className="px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              {isMatchActive ? <Play size={12} /> : <Swords size={12} />}
              <span>{isMatchActive ? `Resume (${activeOversStr} ov)` : `Play #${currentMatch?.matchNo || 1}`}</span>
            </button>
          </div>
        </div>

        {/* ─── TAB 1: PLAYING XI & TACTICAL STRATEGY ─── */}
        {activeTab === 'xi' && (
          <div className="flex flex-col gap-4">
            {/* AI Strategy Toast Feedback */}
            {strategyToast && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-900 to-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400 shrink-0 animate-spin" />
                  <div>
                    <span className="font-black uppercase tracking-wider text-[10px] text-emerald-400 mr-1.5">
                      Tactical AI Adaptation:
                    </span>
                    <span>{strategyToast}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setStrategyToast(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ─── COMPACT ALL-IN-ONE MATCH CONTROL STRIP ─── */}
            <div 
              style={{
                background: `${myTheme.bgDeep}fa`,
                borderColor: myTheme.cardBorder,
                boxShadow: myTheme.cardGlow,
              }}
              className="p-2 sm:p-2.5 rounded-2xl border-2 flex flex-col gap-1.5 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                {/* Tactic Toggle: Bat-First vs Bowl-First */}
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={() => {
                      setLineupMode('bat_first');
                      gameAudio.playUiTap('select');
                      triggerGameHaptic('light');
                    }}
                    style={lineupMode === 'bat_first' ? {
                      backgroundColor: myTheme.pillBg,
                      color: myTheme.pillText,
                    } : {}}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      lineupMode === 'bat_first'
                        ? 'font-black shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🏏 Bat First
                  </button>
                  <button
                    onClick={() => {
                      setLineupMode('bowl_first');
                      gameAudio.playUiTap('select');
                      triggerGameHaptic('light');
                    }}
                    style={lineupMode === 'bowl_first' ? {
                      backgroundColor: myTheme.pillBg,
                      color: myTheme.pillText,
                    } : {}}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      lineupMode === 'bowl_first'
                        ? 'font-black shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🎯 Bowl First
                  </button>
                </div>

                {/* Match Venue Selector */}
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin size={11} style={{ color: myTheme.primary }} className="shrink-0" />
                  <select 
                    value={venue} 
                    onChange={(e) => setVenue(e.target.value)}
                    style={{
                      background: myTheme.bgDeep,
                      borderColor: myTheme.cardBorder,
                    }}
                    className="border rounded-lg py-1 px-2 text-[11px] text-white font-bold focus:outline-none focus:border-white cursor-pointer truncate max-w-[150px] sm:max-w-[200px]"
                  >
                    {Object.keys(VENUE_INSIGHTS).map(v => (
                      <option key={v} value={v}>{v} ({VENUE_INSIGHTS[v]?.title.split('(')[0].trim()})</option>
                    ))}
                  </select>
                </div>

                {/* Impact Sub (Click directly to swap reserve - no separate button needed!) */}
                <button
                  onClick={() => setBenchDrawerSlotIndex(11)}
                  style={{
                    backgroundColor: myTheme.bgDeep,
                    borderColor: myTheme.cardBorder,
                    color: myTheme.contrastText,
                  }}
                  className="px-2 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95 shadow-sm"
                  title="Tap to change Impact Player (12th Man)"
                >
                  <Sparkles size={10} style={{ color: myTheme.primary }} />
                  <span>Sub: {impactPlayer ? `${formatPlayerInitial(impactPlayer.name)} (${getCompactRoleBadge(impactPlayer)})` : 'Pick Sub'}</span>
                </button>

                {/* BCCI Compliance Status */}
                <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
                  <span 
                    style={{
                      backgroundColor: myTheme.bgDeep,
                      borderColor: myTheme.cardBorder,
                      color: myTheme.contrastText,
                    }}
                    className="px-2 py-0.5 rounded-lg border font-bold shadow-sm"
                  >
                    {isCompliant ? '✓ 4 OS • 1 WK • 5 Bowl' : '⚠️ Rule Warning'}
                  </span>
                </div>
              </div>

              {/* Smallest & Easiest Stadium Detail Micro-Strip (Guaranteed Fits Screen) */}
              <div 
                style={{
                  background: `${myTheme.bgDeep}cc`,
                  borderColor: myTheme.cardBorder,
                }}
                className="w-full min-w-0 overflow-hidden flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono"
              >
                <span style={{ color: myTheme.primary }} className="font-bold shrink-0">🏟️ {currentInsight.title.split('(')[0].trim()}:</span>
                <span className="text-white font-bold truncate">{currentInsight.boost}</span>
                <span className="text-gray-300 truncate hidden sm:inline">• {currentInsight.behavior}</span>
              </div>
            </div>

            {/* ─── Matchday 11 (Batting Order 1 to 11) ─── */}
            <div 
              style={{
                background: `${myTheme.bgDeep}fa`,
                borderColor: myTheme.cardBorder,
                boxShadow: myTheme.cardGlow,
              }}
              className="p-3.5 sm:p-4 rounded-3xl border-2 shadow-2xl flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-white/20">
                <span 
                  style={{ color: myTheme.primary }}
                  className="text-xs font-black uppercase font-mono tracking-wider"
                >
                  {lineupMode === 'bat_first' ? '🏏 Bat-First Lineup' : '🎯 Bowl-First Lineup'}
                </span>
                <span 
                  style={{
                    backgroundColor: myTheme.pillBg,
                    color: myTheme.pillText,
                    borderColor: myTheme.cardBorder,
                  }}
                  className="text-[11px] font-mono font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 shadow-sm"
                >
                  <CheckCircle2 size={12} />
                  <span>11 Set</span>
                </span>
              </div>

              {/* 11 Player Cards List */}
              <div className="space-y-1.5 transition-all">
                {fullPlayingXI.map((player, index) => {
                  const isExpanded = expandedPlayerId === player.player_id;
                  const pForm = leaderboards.playerFormMap[player.name.toLowerCase()];
                  const isOrangeCap = leaderboards.orangeCapLeader?.name.toLowerCase() === player.name.toLowerCase();
                  const isPurpleCap = leaderboards.purpleCapLeader?.name.toLowerCase() === player.name.toLowerCase();
                  return (
                    <div
                      key={player.player_id}
                      style={{
                        background: myTheme.cardBg,
                        borderColor: myTheme.cardBorder,
                        boxShadow: myTheme.cardGlow,
                      }}
                      className="rounded-xl border-2 transition-all overflow-hidden hover:scale-[1.01]"
                    >
                      {/* Card Header Strip */}
                      <div 
                        onClick={() => {
                          setExpandedPlayerId(isExpanded ? null : player.player_id);
                          gameAudio.playUiTap('light');
                        }}
                        className="py-2 px-2.5 flex items-center justify-between gap-2 cursor-pointer hover:brightness-105"
                      >
                        {/* Left: Batting Order & Identity */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            style={{
                              backgroundColor: '#000000',
                              color: '#ffffff',
                              border: '1px solid rgba(255,255,255,0.4)',
                            }}
                            className="w-6 h-6 rounded-md font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-sm"
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div 
                              style={{ color: myTheme.contrastText }}
                              className="font-black text-xs sm:text-sm flex items-center gap-1.5 truncate drop-shadow-sm"
                            >
                              <span className="truncate">{formatPlayerInitial(player.name)}</span>
                              {player.is_overseas && (
                                <span 
                                  style={{
                                    backgroundColor: '#000000',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                  }}
                                  className="text-[8.5px] px-1.5 py-0.2 rounded font-black font-mono shrink-0 shadow-sm"
                                >
                                  OS
                                </span>
                              )}
                              {player.role === 'WK' && (
                                <span 
                                  style={{
                                    backgroundColor: '#000000',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                  }}
                                  className="text-[8.5px] px-1.5 py-0.2 rounded font-black font-mono shrink-0 shadow-sm"
                                >
                                  WK
                                </span>
                              )}
                              {isOrangeCap && (
                                <span 
                                  style={{
                                    backgroundColor: '#ea580c',
                                    color: '#ffffff',
                                    border: '1px solid #fed7aa',
                                  }}
                                  className="text-[8.5px] px-1.5 py-0.2 rounded font-black font-mono shrink-0 shadow-sm flex items-center gap-1 animate-pulse"
                                >
                                  🧢 ORANGE CAP
                                </span>
                              )}
                              {isPurpleCap && (
                                <span 
                                  style={{
                                    backgroundColor: '#7e22ce',
                                    color: '#ffffff',
                                    border: '1px solid #e9d5ff',
                                  }}
                                  className="text-[8.5px] px-1.5 py-0.2 rounded font-black font-mono shrink-0 shadow-sm flex items-center gap-1 animate-pulse"
                                >
                                  🧢 PURPLE CAP
                                </span>
                              )}
                            </div>
                            <div 
                              style={{ color: myTheme.contrastText }}
                              className="text-[10px] font-mono truncate font-bold opacity-90 mt-0.5"
                            >
                              <span>#{index + 1} {getPlayerTacticalBadge(player, index)}</span> • <span>{getDetailedPlayerRole(player)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Re-order Controls & Swap with Bench */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Up / Down Order Buttons with enlarged touch targets */}
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleMoveSlot(index, 'up')}
                              disabled={index === 0}
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              }}
                              className="p-1.5 rounded-lg disabled:opacity-20 transition-all cursor-pointer shadow-sm hover:brightness-125 active:scale-90"
                              title="Move Up 1 Slot"
                              aria-label="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              onClick={() => handleMoveSlot(index, 'down')}
                              disabled={index === fullPlayingXI.length - 1}
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              }}
                              className="p-1.5 rounded-lg disabled:opacity-20 transition-all cursor-pointer shadow-sm hover:brightness-125 active:scale-90"
                              title="Move Down 1 Slot"
                              aria-label="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          {/* Swap with Bench Button */}
                          <button
                            onClick={() => {
                              setBenchDrawerSlotIndex(index);
                              gameAudio.playUiTap('select');
                            }}
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.75)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                            }}
                            className="p-1.5 rounded-lg active:scale-90 cursor-pointer transition-all flex items-center justify-center shadow-sm hover:brightness-125"
                            title="Swap with bench reserve"
                          >
                            <Users size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Player Profile Tray */}
                      {isExpanded && (
                        <div className="px-3 py-2.5 bg-slate-900/90 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono animate-fadeIn">
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] text-gray-400 block">Valuation</span>
                            <span className="text-amber-300 font-bold">₹{Number((player as any).price_cr || (player as any).base_price || 2).toFixed(2)} Cr</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] text-gray-400 block">Skill Profile</span>
                            <span className="text-white font-bold truncate block">{(player as any).battingStyle || 'Right Hand'}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] text-gray-400 block">Bowling Style</span>
                            <span className="text-gray-300 font-bold truncate block">{(player as any).bowlingStyle || 'None / Part-time'}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] text-gray-400 block">Fortress Fit</span>
                            <span className="text-emerald-400 font-bold">✓ 94% Synergy</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: FULL IPL TOURNAMENT SEASON & SCHEDULE (74 MATCHES) ─── */}
        {activeTab === 'schedule' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left 7 Columns: Fixtures Schedule with My 14 Matches vs All 74 Matches Toggle */}
              <div className="md:col-span-7 p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col gap-3">
                
                {/* Filter Tabs & Quick Round Sim */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-white/10 gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-400" />
                      IPL 2027 Tournament Schedule (74 Matches)
                    </h3>
                    <p className="text-[11px] text-gray-400">14 Rounds of 5 Matches each + 4 Playoff Games</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setScheduleFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          scheduleFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        All 74 Fixtures
                      </button>
                      <button
                        onClick={() => setScheduleFilter('my')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          scheduleFilter === 'my' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        My 14 Matches
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fixture cards list */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto overscroll-contain touch-pan-y pr-1">
                  {(scheduleFilter === 'my' ? myFixtures : schedule).map((fixture) => {
                    const isCurrent = fixture.status === 'CURRENT';
                    const isDone = fixture.status === 'COMPLETED';
                    const isPlayoff = fixture.stage !== 'League';

                    return (
                      <div
                        key={fixture.matchNo}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/10'
                            : isDone
                            ? 'bg-slate-950/70 border-white/5 opacity-85'
                            : isPlayoff
                            ? 'bg-purple-950/20 border-purple-500/30'
                            : 'bg-slate-950/90 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Match info */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                              isPlayoff ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-white'
                            }`}>
                              #{fixture.matchNo}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                                <TeamLogo teamId={fixture.teamAShort} size={18} />
                                <span style={{ color: fixture.teamAColor }} className="font-bold">{fixture.teamAShort}</span>
                                <span className="text-gray-400 font-normal text-xs">vs</span>
                                <span style={{ color: fixture.teamBColor }} className="font-bold">{fixture.teamBShort}</span>
                                <TeamLogo teamId={fixture.teamBShort} size={18} />
                                {isPlayoff && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono uppercase ml-1">
                                    {fixture.stage}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono truncate">
                                Round {fixture.round} • {fixture.stadiumName}
                              </div>
                            </div>
                          </div>

                          {/* Status or Launch Button */}
                          <div className="shrink-0">
                            {isCurrent ? (
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <button
                                  onClick={() => handleLaunchMatch(fixture)}
                                  className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all ${
                                    isMatchActive
                                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 shadow-emerald-500/40 animate-pulse'
                                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/30'
                                  }`}
                                >
                                  {isMatchActive ? <Play size={13} className="fill-slate-950" /> : <Swords size={13} />}
                                  <span>{isMatchActive ? `Resume Match (${activeOversStr} ov)` : 'Play Match'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    gameAudio.playWillowCrack('boundary');
                                    triggerGameHaptic('medium');
                                    simulateScheduleMatch(fixture.matchNo);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                                  title="Instant Result (Quick Simulate Match)"
                                >
                                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                                  <span>Instant Result</span>
                                </button>
                              </div>
                            ) : isDone ? (
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                    fixture.result?.winnerTeamId === franchise.short.toLowerCase()
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-white/10 text-gray-300'
                                  }`}>
                                    {getFranchise(fixture.result?.winnerTeamId || '').short} Won
                                  </span>
                                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                    by {fixture.result?.margin}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    gameAudio.playUiTap('select');
                                    triggerGameHaptic('light');
                                    setViewingScorecardFixture(fixture);
                                  }}
                                  className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 border border-white/15 cursor-pointer shadow-sm transition-all shrink-0"
                                  title="View Full Broadcast Scorecard"
                                >
                                  <Award size={12} className="text-amber-400" />
                                  <span>Scorecard</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-mono uppercase px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 Columns: Live 10-Team Standings Points Table */}
              <div className="md:col-span-5 p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col gap-3">
                <div className="pb-2 border-b border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-400" />
                    IPL 2027 Championship Standings
                  </h3>
                  <p className="text-[11px] text-gray-400">Top 4 Franchises Qualify for IPL Playoffs</p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto overscroll-contain touch-pan-y">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5 sticky top-0 bg-slate-900">
                      <tr>
                        <th className="py-1">Pos</th>
                        <th className="py-1">Team</th>
                        <th className="py-1 text-center">P</th>
                        <th className="py-1 text-center">W</th>
                        <th className="py-1 text-center">L</th>
                        <th className="py-1 text-right">NRR</th>
                        <th className="py-1 text-right font-black text-amber-300">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-200">
                      {pointsTable.map((row, idx) => {
                        const isMyTeam = row.teamId === franchise.short.toLowerCase();
                        const isTop4 = idx < 4;

                        return (
                          <tr 
                            key={row.teamId}
                            className={`hover:bg-white/5 transition-colors ${
                              isMyTeam ? 'bg-amber-500/15 font-bold text-amber-200' : ''
                            }`}
                          >
                            <td className="py-2">
                              <span className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-bold ${
                                isTop4 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-500'
                              }`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2 font-sans flex items-center gap-1.5 truncate">
                              <TeamLogo teamId={row.shortName} size={18} />
                              <span className="font-bold truncate">{row.shortName}</span>
                            </td>
                            <td className="py-2 text-center text-gray-400">{row.played}</td>
                            <td className="py-2 text-center text-emerald-400 font-bold">{row.won}</td>
                            <td className="py-2 text-center text-rose-400 font-bold">{row.lost}</td>
                            <td className="py-2 text-right text-[11px] text-gray-400">
                              {row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}
                            </td>
                            <td className="py-2 text-right font-black text-amber-300">{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 text-center font-sans">
                  Gold positions (1-4) advance to IPL Playoffs (Qualifier 1 & Eliminator).
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── TAB 3: IPL PLAYOFF BRACKET, ORANGE/PURPLE CAP RACES & SQUAD MOMENTUM ─── */}
        {activeTab === 'playoffs_caps' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            
            {/* Championship Trophy Banner */}
            <div 
              style={{
                background: userWonFinal 
                  ? 'linear-gradient(135deg, #b45309 0%, #1e1b4b 60%, #0f172a 100%)' 
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderColor: userWonFinal ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)',
              }}
              className="p-4 sm:p-5 rounded-2xl border-2 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg">
                  <Trophy size={26} className="text-amber-400 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-black tracking-widest text-amber-300">
                      {userWonFinal ? '🏆 Champions of India' : 'IPL 2027 Season Climax'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                      Official Knockouts
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white font-display">
                    {userWonFinal 
                      ? `${franchise.name.toUpperCase()} LIFT THE IPL 2027 TROPHY!` 
                      : 'Playoffs Knockout Stage & Individual Honors'}
                  </h2>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {userWonFinal 
                      ? 'Tactical GM Rating: S+ (Elite Grandmaster) • Champion honors recorded in franchise cabinet'
                      : 'Top 4 teams battle for supremacy in Qualifier 1, Eliminator, Qualifier 2, and the Grand Final.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 z-10 w-full sm:w-auto">
                <button
                  onClick={() => {
                    gameAudio.playUiTap('select');
                    setShowTrophyModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer transition-all"
                >
                  <Trophy size={14} />
                  <span>{userWonFinal ? '🏆 Celebrate Trophy Lift' : 'Preview Trophy Ceremony'}</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: 4-Match Playoff Knockout Bracket */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords size={16} className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                    Playoff Knockout Bracket
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-gray-400">
                  Matches #71 - #74
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {playoffBracket.map((node) => {
                  const fixture = schedule.find(f => f.matchNo === node.matchNo);
                  const isCurrent = fixture?.status === 'CURRENT';
                  const isCompleted = fixture?.status === 'COMPLETED';

                  return (
                    <div
                      key={node.matchNo}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-lg ${
                        isCurrent
                          ? 'bg-slate-900 border-amber-400/60 shadow-amber-500/20 ring-1 ring-amber-400/30'
                          : isCompleted
                          ? 'bg-slate-900/90 border-white/15'
                          : 'bg-slate-950/80 border-white/10 opacity-75'
                      }`}
                    >
                      {/* Header */}
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-white/10 mb-2.5">
                          <span className="text-[10px] font-black font-mono tracking-wider text-amber-400 truncate">
                            {node.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono shrink-0 ${
                            isCompleted 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : isCurrent 
                              ? 'bg-amber-400 text-slate-950 font-black animate-pulse' 
                              : 'bg-white/10 text-gray-400'
                          }`}>
                            {isCompleted ? 'FINAL' : isCurrent ? 'LIVE NEXT' : 'UPCOMING'}
                          </span>
                        </div>

                        {/* Teams in Node */}
                        <div className="space-y-2">
                          {/* Team A */}
                          <div 
                            style={{
                              backgroundColor: node.teamA?.isWinner ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                              borderColor: node.teamA?.isWinner ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                            }}
                            className="p-2 rounded-xl border flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <TeamLogo teamId={node.teamA?.short || ''} size={20} />
                              <div className="truncate">
                                <span className={`text-xs font-black truncate block ${node.teamA?.isWinner ? 'text-emerald-300 font-extrabold' : 'text-white'}`}>
                                  {node.teamA?.name || 'Top Ranker'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {node.teamA?.score ? (
                                <span className="text-xs font-mono font-black text-amber-300">
                                  {node.teamA.score}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-gray-500">TBD</span>
                              )}
                              {node.teamA?.isWinner && (
                                <CheckCircle2 size={12} className="text-emerald-400 inline ml-1" />
                              )}
                            </div>
                          </div>

                          {/* Team B */}
                          <div 
                            style={{
                              backgroundColor: node.teamB?.isWinner ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                              borderColor: node.teamB?.isWinner ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                            }}
                            className="p-2 rounded-xl border flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <TeamLogo teamId={node.teamB?.short || ''} size={20} />
                              <div className="truncate">
                                <span className={`text-xs font-black truncate block ${node.teamB?.isWinner ? 'text-emerald-300 font-extrabold' : 'text-white'}`}>
                                  {node.teamB?.name || 'Top Ranker'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {node.teamB?.score ? (
                                <span className="text-xs font-mono font-black text-amber-300">
                                  {node.teamB.score}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-gray-500">TBD</span>
                              )}
                              {node.teamB?.isWinner && (
                                <CheckCircle2 size={12} className="text-emerald-400 inline ml-1" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Venue / Date */}
                        <div className="text-[10px] text-gray-400 font-mono mt-2 truncate flex items-center gap-1">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate">{node.stadium.split(',')[0]}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-white/10">
                        {isCompleted && fixture ? (
                          <button
                            onClick={() => {
                              gameAudio.playUiTap('light');
                              setViewingScorecardFixture(fixture);
                            }}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Award size={12} className="text-amber-400" />
                            <span>View Scorecard</span>
                          </button>
                        ) : isCurrent && fixture ? (
                          <button
                            onClick={() => handleLaunchMatch(fixture)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md active:scale-95 animate-pulse"
                          >
                            <Play size={12} fill="currentColor" />
                            <span>Play Knockout Match</span>
                          </button>
                        ) : (
                          <div className="py-1 px-2 text-center text-[10px] font-mono text-gray-500 flex items-center justify-center gap-1">
                            <Lock size={10} />
                            <span>Stage Locked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Live Orange & Purple Cap Races (Side-by-Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* ORANGE CAP (Batting Royalty) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/40 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                        🧢
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-amber-400 font-display uppercase tracking-wider">
                          Orange Cap Leaderboard
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">Most Runs Across Tournament</span>
                      </div>
                    </div>
                    {leaderboards.orangeCapLeader && (
                      <span className="text-xs font-mono font-black text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
                        {leaderboards.orangeCapLeader.runs} Runs Leader
                      </span>
                    )}
                  </div>

                  {/* Leader Spotlight Banner */}
                  {leaderboards.orangeCapLeader && (
                    <div 
                      style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
                        borderColor: '#f59e0b',
                      }}
                      className="p-3 rounded-xl border-2 mb-3 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                          #1
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-black text-white text-sm truncate">{leaderboards.orangeCapLeader.name}</span>
                            <span 
                              style={{ backgroundColor: leaderboards.orangeCapLeader.teamColor }}
                              className="text-[9px] px-1.5 py-0.2 rounded font-black text-white font-mono shrink-0 shadow-sm"
                            >
                              {leaderboards.orangeCapLeader.teamShort}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-300 font-mono">
                            Avg: {leaderboards.orangeCapLeader.average} • SR: {leaderboards.orangeCapLeader.strikeRate} • HS: {leaderboards.orangeCapLeader.highestScore}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-black font-mono text-amber-400">{leaderboards.orangeCapLeader.runs}</div>
                        <span className="text-[9px] font-mono text-gray-400 uppercase">RUNS</span>
                      </div>
                    </div>
                  )}

                  {/* Table of Ranks 2-10 */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10 text-[10px]">
                          <th className="py-1">Rank</th>
                          <th className="py-1">Player</th>
                          <th className="py-1 text-center">Mat</th>
                          <th className="py-1 text-right font-black text-amber-300">Runs</th>
                          <th className="py-1 text-right">Avg</th>
                          <th className="py-1 text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-200">
                        {leaderboards.orangeCapList.slice(0, 10).map((b, idx) => (
                          <tr key={b.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-1.5 text-gray-400 font-bold">#{idx + 1}</td>
                            <td className="py-1.5 font-sans font-bold flex items-center gap-1.5 truncate">
                              <span className="truncate">{formatPlayerInitial(b.name)}</span>
                              <span 
                                style={{ backgroundColor: b.teamColor }}
                                className="text-[8px] px-1 py-0.2 rounded text-white font-mono shrink-0"
                              >
                                {b.teamShort}
                              </span>
                            </td>
                            <td className="py-1.5 text-center text-gray-400">{b.matches}</td>
                            <td className="py-1.5 text-right font-black text-amber-300">{b.runs}</td>
                            <td className="py-1.5 text-right text-gray-300">{b.average}</td>
                            <td className="py-1.5 text-right text-gray-300">{b.strikeRate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PURPLE CAP (Bowling Royalty) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-purple-500/40 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md">
                        🧢
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-purple-400 font-display uppercase tracking-wider">
                          Purple Cap Leaderboard
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">Most Wickets Across Tournament</span>
                      </div>
                    </div>
                    {leaderboards.purpleCapLeader && (
                      <span className="text-xs font-mono font-black text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30">
                        {leaderboards.purpleCapLeader.wickets} Wkts Leader
                      </span>
                    )}
                  </div>

                  {/* Leader Spotlight Banner */}
                  {leaderboards.purpleCapLeader && (
                    <div 
                      style={{
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
                        borderColor: '#9333ea',
                      }}
                      className="p-3 rounded-xl border-2 mb-3 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                          #1
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-black text-white text-sm truncate">{leaderboards.purpleCapLeader.name}</span>
                            <span 
                              style={{ backgroundColor: leaderboards.purpleCapLeader.teamColor }}
                              className="text-[9px] px-1.5 py-0.2 rounded font-black text-white font-mono shrink-0 shadow-sm"
                            >
                              {leaderboards.purpleCapLeader.teamShort}
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono">
                            Econ: {leaderboards.purpleCapLeader.economy} • Overs: {leaderboards.purpleCapLeader.overs} • Best: {leaderboards.purpleCapLeader.bestBowling}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-black font-mono text-purple-400">{leaderboards.purpleCapLeader.wickets}</div>
                        <span className="text-[9px] font-mono text-gray-400 uppercase">WKTS</span>
                      </div>
                    </div>
                  )}

                  {/* Table of Ranks 2-10 */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10 text-[10px]">
                          <th className="py-1">Rank</th>
                          <th className="py-1">Player</th>
                          <th className="py-1 text-center">Mat</th>
                          <th className="py-1 text-right font-black text-purple-300">Wkts</th>
                          <th className="py-1 text-right">Econ</th>
                          <th className="py-1 text-right">Best</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-200">
                        {leaderboards.purpleCapList.slice(0, 10).map((bw, idx) => (
                          <tr key={bw.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-1.5 text-gray-400 font-bold">#{idx + 1}</td>
                            <td className="py-1.5 font-sans font-bold flex items-center gap-1.5 truncate">
                              <span className="truncate">{formatPlayerInitial(bw.name)}</span>
                              <span 
                                style={{ backgroundColor: bw.teamColor }}
                                className="text-[8px] px-1 py-0.2 rounded text-white font-mono shrink-0"
                              >
                                {bw.teamShort}
                              </span>
                            </td>
                            <td className="py-1.5 text-center text-gray-400">{bw.matches}</td>
                            <td className="py-1.5 text-right font-black text-purple-300">{bw.wickets}</td>
                            <td className="py-1.5 text-right text-gray-300">{bw.economy}</td>
                            <td className="py-1.5 text-right text-gray-300">{bw.bestBowling}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            {/* SECTION 3: Franchise Squad Dynamic Momentum & Tactical Form */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/15 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-rose-400" />
                  <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                    {franchise.name} Squad Form & Dynamic Momentum
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  Performance-Adjusted Attributes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeSquad.map((player) => {
                  const form = leaderboards.playerFormMap[player.name.toLowerCase()];
                  const status = form?.status || 'normal';
                  const isHot = status === 'hot';
                  const isCold = status === 'cold';

                  return (
                    <div
                      key={player.player_id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isHot 
                          ? 'bg-rose-500/10 border-rose-500/40 text-white' 
                          : isCold 
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-gray-300' 
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                          <span className="truncate">{formatPlayerInitial(player.name)}</span>
                          <span className="text-[9px] font-mono opacity-75">({player.role})</span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 truncate mt-0.5">
                          {form ? form.streakText : 'Steady baseline form'}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isHot && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[9px] font-mono flex items-center gap-0.5 shadow-sm">
                            <TrendingUp size={10} /> +8%
                          </span>
                        )}
                        {isCold && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white font-black text-[9px] font-mono flex items-center gap-0.5 shadow-sm">
                            <TrendingDown size={10} /> -5%
                          </span>
                        )}
                        {!isHot && !isCold && (
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-bold text-[9px] font-mono">
                            STEADY
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}



      </main>

      {/* Bench Drawer Modal (For Manual Player Swapping) */}
      {benchDrawerSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-white/20 rounded-3xl p-5 max-w-lg w-full shadow-2xl text-white max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {benchDrawerSlotIndex === 11 
                      ? 'Select Impact Player Sub' 
                      : `Swap into Slot #${benchDrawerSlotIndex + 1}${fullPlayingXI[benchDrawerSlotIndex] ? ` (${getPlayerTacticalBadge(fullPlayingXI[benchDrawerSlotIndex], benchDrawerSlotIndex)})` : ''}`
                    }
                  </h3>
                  <p className="text-xs text-gray-400">Choose any bench player from your 25-man squad</p>
                </div>
                <button
                  onClick={() => setBenchDrawerSlotIndex(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Bench list */}
              <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
                {benchPlayers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No reserves on the bench.
                  </div>
                ) : (
                  benchPlayers.map((bp) => (
                    <div
                      key={bp.player_id}
                      onClick={() => {
                        gameAudio.playCardSwap();
                        triggerGameHaptic('medium');
                        if (benchDrawerSlotIndex === 11) {
                          setPlayingXI(fullPlayingXI.map(p => p.player_id), bp.player_id, lineupMode);
                        } else if (benchDrawerSlotIndex !== null) {
                          const newXI = [...fullPlayingXI];
                          newXI[benchDrawerSlotIndex] = bp;
                          setPlayingXI(newXI.map(p => p.player_id), activeImpactId, lineupMode);
                        }
                        setBenchDrawerSlotIndex(null);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:border-amber-400/50 flex items-center justify-between cursor-pointer transition-all hover:bg-white/10"
                    >
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{formatPlayerInitial(bp.name)}</span>
                          {bp.is_overseas && <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300">OS</span>}
                          {bp.role === 'WK' && <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">WK</span>}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {getDetailedPlayerRole(bp)} • Salary: ₹{bp.price} Cr
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-amber-400 font-bold block">Tap to Swap</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setBenchDrawerSlotIndex(null)}
              className="mt-3 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── DETAILED BROADCAST SCORECARD MODAL ─── */}
      {viewingScorecardFixture && (
        <MatchScorecardModal
          isOpen={viewingScorecardFixture !== null}
          onClose={() => setViewingScorecardFixture(null)}
          fixture={viewingScorecardFixture}
        />
      )}

      {/* ─── LIVE BALL-BY-BALL MATCH SIMULATOR ─── */}
      {showSimulator && (
        <BallByBallMatchSimulator
          isOpen={showSimulator}
          onClose={() => {
            setShowSimulator(false);
            setSelectedFixtureForMatch(null);
          }}
          myFranchise={simMyFranchise}
          mySquad={simMySquad}
          userPlayingXIObjects={isUserPlayingInFixture ? fullPlayingXI : undefined}
          myPlayingXIIds={isUserPlayingInFixture ? campaign.playingXI : undefined}
          userBatFirstXI={isUserPlayingInFixture ? (campaign.batFirstXI || campaign.playingXI) : undefined}
          userBowlFirstXI={isUserPlayingInFixture ? (campaign.bowlFirstXI || campaign.playingXI) : undefined}
          batFirstImpactId={isUserPlayingInFixture ? (campaign.batFirstImpactId || campaign.impactPlayerId) : undefined}
          bowlFirstImpactId={isUserPlayingInFixture ? (campaign.bowlFirstImpactId || campaign.impactPlayerId) : undefined}
          rivalFranchise={simRivalFranchise}
          venueName={activeMatchFixture ? activeMatchFixture.stadiumName : currentInsight.title}
          matchFixture={activeMatchFixture}
          onMatchComplete={(res) => {
            if (res) {
              recordMatchResult(
                activeMatchFixture?.matchNo || 1,
                res,
                (res as any).scorecard
              );
              if (activeMatchFixture?.matchNo === 74 && res.winnerTeamId === campaign.teamId) {
                setTimeout(() => {
                  setShowTrophyModal(true);
                }, 800);
              }
            }
          }}
        />
      )}

      {/* Championship Trophy Celebration Modal */}
      {showTrophyModal && (
        <ChampionshipCelebrationModal
          isOpen={showTrophyModal}
          onClose={() => setShowTrophyModal(false)}
          teamId={franchise.id}
          teamName={franchise.name}
          resultSummary={`${franchise.name} are the IPL 2027 Champions!`}
          seasonLabel="IPL 2027"
          onViewTrophies={() => router.push('/trophies')}
        />
      )}
    </div>
  );
}
