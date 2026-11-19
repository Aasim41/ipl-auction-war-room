'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle2, 
  Lock, 
  Flame, 
  Shield,
  Layers,
  Award
} from 'lucide-react';
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore';
import { getFranchise } from '../../data/franchises';
import BallByBallMatchSimulator from '../../components/BallByBallMatchSimulator';
import MatchScorecardModal from '../../components/MatchScorecardModal';
import TeamLogo from '../../components/TeamLogo';
import { TournamentFixture, TournamentPointsEntry } from '../../data/scheduleGenerator';
import { formatPlayerInitial } from '../../lib/nameFormatter';
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics';

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

  // Specialist Bowler
  if (player.role === 'BOWL') {
    const s = (player.statsSummary || '').toLowerCase();
    if (s.includes('spin') || s.includes('wrist') || s.includes('mystery')) {
      return 'Specialist Spinner';
    }
    if (s.includes('swing') || s.includes('seam') || s.includes('powerplay')) {
      return 'Powerplay Swing Pacer';
    }
    if (s.includes('yorker') || s.includes('death') || s.includes('express')) {
      return 'Express Death Pacer';
    }
    return slotIndex >= 9 ? 'Strike Bowler & Tail' : 'Frontline Strike Bowler';
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
    autoOptimizePlayingXI,
    setPlayingXI,
    recordMatchResult,
    simulateScheduleMatch,
    simulateRound,
    dismissSimulatedWaveAlert
  } = useCampaignStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'xi' | 'schedule'>('xi');
  const [scheduleFilter, setScheduleFilter] = useState<'my' | 'all'>('all');
  const [lineupMode, setLineupMode] = useState<'bat_first' | 'bowl_first'>('bat_first');
  const [strategyToast, setStrategyToast] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedFixtureForMatch, setSelectedFixtureForMatch] = useState<TournamentFixture | null>(null);
  const [viewingScorecardFixture, setViewingScorecardFixture] = useState<TournamentFixture | null>(null);
  const [benchDrawerSlotIndex, setBenchDrawerSlotIndex] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulatingRound, setIsSimulatingRound] = useState(false);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  // Mobile Touch Swipe State & App Swipe Dispatch Listener
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    setTouchStartX(null);
    setTouchStartY(null);

    // Ergonomic 30px swipe threshold
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
      const tabs: Array<'xi' | 'schedule'> = ['xi', 'schedule'];
      const curIdx = tabs.indexOf(activeTab);
      if (deltaX < 0 && curIdx < tabs.length - 1) {
        setActiveTab(tabs[curIdx + 1]);
        gameAudio.playUiTap('select');
        triggerGameHaptic('light');
      } else if (deltaX > 0 && curIdx > 0) {
        setActiveTab(tabs[curIdx - 1]);
        gameAudio.playUiTap('select');
        triggerGameHaptic('light');
      }
    }
  };

  const handleTouchCancel = () => {
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Synchronize with GlobalSwipeManager custom event
  useEffect(() => {
    const handleAppSwipe = (e: any) => {
      const direction = e.detail?.direction;
      const tabs: Array<'xi' | 'schedule'> = ['xi', 'schedule'];
      const curIdx = tabs.indexOf(activeTab);
      if (direction === 'left' && curIdx < tabs.length - 1) {
        e.preventDefault();
        setActiveTab(tabs[curIdx + 1]);
        gameAudio.playUiTap('select');
        triggerGameHaptic('light');
      } else if (direction === 'right' && curIdx > 0) {
        e.preventDefault();
        setActiveTab(tabs[curIdx - 1]);
        gameAudio.playUiTap('select');
        triggerGameHaptic('light');
      }
    };
    window.addEventListener('app:swipe', handleAppSwipe);
    return () => window.removeEventListener('app:swipe', handleAppSwipe);
  }, [activeTab]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const campaign = mounted ? getActiveCampaign() : null;
  const venue = selectedVenue || (campaign && TEAM_HOME_CITY[campaign.teamId]) || 'Bengaluru';
  const setVenue = setSelectedVenue;

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

  const franchise = getFranchise(campaign.teamId);
  const activeSquad = campaign.squad.filter(p => !p.is_released);
  
  // Resolve active Playing XI player IDs based on lineupMode (Bat-First vs Bowl-First)
  const activeLineupIds = lineupMode === 'bat_first'
    ? (campaign.batFirstXI && campaign.batFirstXI.length >= 11 ? campaign.batFirstXI : campaign.playingXI)
    : (campaign.bowlFirstXI && campaign.bowlFirstXI.length >= 11 ? campaign.bowlFirstXI : campaign.playingXI);

  const activeImpactId = lineupMode === 'bat_first'
    ? (campaign.batFirstImpactId || campaign.impactPlayerId)
    : (campaign.bowlFirstImpactId || campaign.impactPlayerId);

  // Resolve Playing XI objects from player_ids
  const playingXIObjects: CampaignPlayer[] = (activeLineupIds || [])
    .map(id => activeSquad.find(p => p.player_id === id))
    .filter(Boolean) as CampaignPlayer[];

  // Fallback if playingXI is incomplete
  const fullPlayingXI: CampaignPlayer[] = [...playingXIObjects];
  if (fullPlayingXI.length < 11) {
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
  const isCompliant = fullPlayingXI.length === 11 && overseasInXI <= 4 && wkInXI >= 1 && bowlersInXI >= 5;

  const currentInsight = VENUE_INSIGHTS[venue] || VENUE_INSIGHTS['Bengaluru'];

  // Tournament Fixtures & Schedule (70 League Matches + 4 Playoff Matches)
  const schedule = campaign.schedule || [];
  const myFixtures = schedule.filter(f => f.isMyMatch || f.stage !== 'League');
  const currentMatch = schedule.find(f => f.isMyMatch && f.status === 'CURRENT') || myFixtures.find(f => f.status === 'CURRENT') || myFixtures[0];
  
  const rivalTeamId = currentMatch
    ? (currentMatch.teamAId === campaign.teamId ? currentMatch.teamBId : currentMatch.teamAId)
    : 'csk';
  const rivalFranchise = getFranchise(rivalTeamId);
  const pointsTable = campaign.pointsTable || [];

  const handleLaunchMatch = (fixture?: TournamentFixture) => {
    gameAudio.playUiTap('select');
    triggerGameHaptic('light');
    setSelectedFixtureForMatch(fixture || currentMatch);
    setShowSimulator(true);
  };

  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < fullPlayingXI.length) {
      gameAudio.playCardSwap();
      triggerGameHaptic('light');
      swapPlayingXISlots(index, target, lineupMode);
    }
  };

  const handleAutoOptimize = () => {
    setIsOptimizing(true);
    gameAudio.playConfettiFanfare();
    triggerGameHaptic('medium');
    const result = autoOptimizePlayingXI(venue, rivalTeamId, lineupMode);
    if (result?.strategySummary) {
      setStrategyToast(result.strategySummary);
      setTimeout(() => setStrategyToast(null), 6000);
    }
    setTimeout(() => setIsOptimizing(false), 1200);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="min-h-[100dvh] bg-slate-950 text-white flex flex-col pt-[calc(max(env(safe-area-inset-top,0px),10px)+2.85rem)] sm:pt-14 pb-16 w-full max-w-full overflow-x-hidden touch-manipulation select-none"
    >
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-4">
        
        {/* Mobile Swipe Navigation Indicator */}
        <div className="flex md:hidden items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] font-mono text-gray-400 shadow-sm">
          <span>👈 Swipe</span>
          <span className="text-amber-400 font-bold uppercase">
            {activeTab === 'xi' ? 'Lineup & Tactics' : 'Tournament Schedule & Standings'}
          </span>
          <span>Swipe 👉</span>
        </div>
        
        {/* ─── Sleek Minimal Header & Tab Controls ─── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0" style={{ backgroundColor: franchise.color }}>
              {franchise.emoji}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black uppercase">
                  MATCHDAY OPS
                </span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">IPL 2027 Season</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-display text-white">
                {franchise.name}
              </h1>
            </div>
          </div>

          {/* View Mode Switcher & Launch Button */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  gameAudio.playUiTap('select');
                  setActiveTab('xi');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'xi' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Playing XI</span>
              </button>
              <button
                onClick={() => {
                  gameAudio.playUiTap('select');
                  setActiveTab('schedule');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'schedule' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={14} />
                <span>Schedule & Standings (74)</span>
              </button>
            </div>

            <button
              onClick={() => handleLaunchMatch()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              <Swords size={14} />
              <span>Simulate Next</span>
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

            {/* Tactical Control Deck */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg">
              {/* Strategy Selector (Bat-First vs Bowl-First) */}
              <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>Tactical Strategy Mode</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/10">
                    <button
                      onClick={() => {
                        setLineupMode('bat_first');
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        lineupMode === 'bat_first'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>🏏 Bat-First XI</span>
                    </button>
                    <button
                      onClick={() => {
                        setLineupMode('bowl_first');
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        lineupMode === 'bowl_first'
                          ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>🎯 Bowl-First XI</span>
                    </button>
                  </div>
                </div>

                {/* Venue Fortress Selector */}
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-amber-400" />
                    <span>Match Venue</span>
                  </div>
                  <select 
                    value={venue} 
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.keys(VENUE_INSIGHTS).map(v => (
                      <option key={v} value={v}>{v} — {VENUE_INSIGHTS[v]?.title}</option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono px-1 text-gray-400">
                    <span className="text-amber-300 font-bold">{currentInsight.title}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles size={11} /> {currentInsight.boost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rules, Auto-Pick, & Impact Sub */}
              <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
                {/* BCCI Validation Badges */}
                <div className="flex items-center justify-between gap-1.5 bg-slate-950/70 p-2 rounded-2xl border border-white/10 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 font-mono">BCCI Rules:</span>
                    {isCompliant ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ✓ Compliant
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                        ⚠️ Rule Warning
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px] flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg border ${overseasInXI <= 4 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
                      OS: {overseasInXI}/4
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg border ${wkInXI >= 1 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
                      WK: {wkInXI}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg border ${bowlersInXI >= 5 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
                      Bowl: {bowlersInXI}/5
                    </span>
                  </div>
                </div>

                {/* Auto-Pick Best XI Button */}
                <button
                  onClick={handleAutoOptimize}
                  disabled={isOptimizing}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <Zap size={14} className={isOptimizing ? 'animate-spin' : ''} />
                  <span>
                    {isOptimizing 
                      ? `Optimizing ${lineupMode === 'bat_first' ? 'Bat-First' : 'Bowl-First'} Strategy...` 
                      : `⚡ Auto-Pick Best ${lineupMode === 'bat_first' ? 'Bat-First' : 'Bowl-First'} XI`}
                  </span>
                </button>

                {/* Impact Player Slot */}
                <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
                      <Sparkles size={11} /> Impact Player Sub (12th Man)
                    </span>
                    <div className="text-xs font-bold text-white mt-0.5 truncate">
                      {impactPlayer ? formatPlayerInitial(impactPlayer.name) : 'Select Reserve'}
                      <span className="text-[11px] text-gray-400 font-mono ml-1.5 font-normal">
                        ({impactPlayer?.role})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setBenchDrawerSlotIndex(11)}
                    className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Matchday 11 (Batting Order 1 to 11) ─── */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="text-xs font-black uppercase tracking-wider text-gray-200 flex items-center gap-2">
                  <span className={lineupMode === 'bat_first' ? 'text-amber-400 font-black' : 'text-sky-400 font-black'}>
                    {lineupMode === 'bat_first' ? '🏏 Matchday Bat-First 11' : '🎯 Matchday Bowl-First 11'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal hidden sm:inline">(Order 1 to 11 • Tap arrows to reorder)</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Verified 11</span>
                </span>
              </div>

              {/* 11 Player Cards List */}
              <div className={`space-y-1.5 transition-all ${
                isOptimizing ? 'ring-2 ring-amber-400 p-1 rounded-2xl animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.4)]' : ''
              }`}>
                {fullPlayingXI.map((player, index) => {
                  const isExpanded = expandedPlayerId === player.player_id;
                  return (
                    <div
                      key={player.player_id}
                      className="rounded-2xl bg-slate-950/90 border border-white/10 hover:border-amber-400/40 transition-all overflow-hidden"
                    >
                      {/* Card Header Strip */}
                      <div 
                        onClick={() => {
                          setExpandedPlayerId(isExpanded ? null : player.player_id);
                          gameAudio.playUiTap('light');
                        }}
                        className="p-2 sm:p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-white/5"
                      >
                        {/* Left: Batting Order & Identity */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                            index < 3
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : index < 7
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-slate-800 text-gray-300 border border-white/10'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{formatPlayerInitial(player.name)}</span>
                              {player.is_overseas && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono shrink-0">
                                  OS ✈
                                </span>
                              )}
                              {player.role === 'WK' && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono shrink-0">
                                  WK 🧤
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono truncate">
                              <span className="text-amber-300 font-bold">#{index + 1} {getPlayerTacticalBadge(player, index)}</span> • {player.role}
                            </div>
                          </div>
                        </div>

                        {/* Right: Salary & Re-order Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-mono font-bold text-xs">
                            ₹{player.price}Cr
                          </div>

                          {/* Move Up/Down Controls */}
                          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleMoveSlot(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-20 text-gray-300 hover:text-white cursor-pointer transition-colors"
                              title="Move up batting order"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              onClick={() => handleMoveSlot(index, 'down')}
                              disabled={index === fullPlayingXI.length - 1}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-20 text-gray-300 hover:text-white cursor-pointer transition-colors"
                              title="Move down batting order"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          {/* Swap with Bench Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBenchDrawerSlotIndex(index);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-gray-200 hover:text-white border border-white/10 cursor-pointer transition-all"
                          >
                            Swap
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
            
            {/* Auto-Simulated Wave Notification Banner */}
            {campaign.lastSimulatedWave && campaign.lastSimulatedWave.simulatedCount > 0 && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/10 border border-amber-500/40 text-xs shadow-xl animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-black uppercase tracking-wider text-[11px] text-amber-300">
                        ⚡ League Progression Wave:
                      </span>{' '}
                      <span className="text-gray-200">
                        {campaign.lastSimulatedWave.simulatedCount} AI matches simulated up to Match #{campaign.lastSimulatedWave.nextMatchNo} (vs {campaign.lastSimulatedWave.nextRivalShort})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      gameAudio.playUiTap('light');
                      dismissSimulatedWaveAlert();
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-[10px] font-bold cursor-pointer transition-all shrink-0 self-end sm:self-auto"
                  >
                    Dismiss
                  </button>
                </div>

                {/* Quick simulated matches list with clickable scorecard pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pt-2 border-t border-white/10 scrollbar-none py-0.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase shrink-0">Scores:</span>
                  {campaign.lastSimulatedWave.simulatedMatches.map((m) => {
                    const fix = (campaign.schedule || []).find(f => f.matchNo === m.matchNo);
                    return (
                      <button
                        key={m.matchNo}
                        onClick={() => {
                          if (fix) {
                            gameAudio.playUiTap('select');
                            triggerGameHaptic('light');
                            setViewingScorecardFixture(fix);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-amber-400/50 text-[10px] font-mono text-gray-200 hover:text-white flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                        title="View Full Scorecard"
                      >
                        <span className="text-amber-400 font-bold">#{m.matchNo}</span>
                        <span>{m.teamAShort} vs {m.teamBShort}</span>
                        <span className="text-emerald-400 font-bold">📊</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                    {/* Simulate Current Round Button */}
                    {(() => {
                      const nextUnplayed = schedule.find(f => f.status !== 'COMPLETED');
                      const roundToSim = nextUnplayed?.round || 1;
                      return nextUnplayed ? (
                        <button
                          onClick={() => {
                            gameAudio.playUiTap('select');
                            triggerGameHaptic('medium');
                            setIsSimulatingRound(true);
                            simulateRound(roundToSim);
                            setTimeout(() => setIsSimulatingRound(false), 600);
                          }}
                          disabled={isSimulatingRound}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                          title="Simulate all 5 matches in the current round"
                        >
                          <Zap size={12} className={isSimulatingRound ? 'animate-spin' : ''} />
                          <span>{isSimulatingRound ? 'Simulating...' : `⚡ Sim Round ${roundToSim}`}</span>
                        </button>
                      ) : null;
                    })()}

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
                              <button
                                onClick={() => handleLaunchMatch(fixture)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-white font-black text-xs uppercase flex items-center gap-1 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                              >
                                <Swords size={13} />
                                <span>Play Match</span>
                              </button>
                            ) : isDone ? (
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                    fixture.result?.winnerTeamId === franchise.short.toLowerCase()
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-white/10 text-gray-300'
                                  }`}>
                                    {fixture.result?.winnerName?.split(' ')[0]} Won
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
                            ) : !fixture.isMyMatch ? (
                              <button
                                onClick={() => {
                                  gameAudio.playUiTap('select');
                                  triggerGameHaptic('light');
                                  simulateScheduleMatch(fixture.matchNo);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[11px] cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                                title="Simulate this fixture between AI teams and update points table"
                              >
                                <Zap size={11} className="text-amber-400" />
                                <span>Simulate</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-mono uppercase">
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

        {/* ─── TAB 3: STANDINGS & POINTS TABLE (FULL WIDTH VIEW) ─── */}
        {activeTab === 'standings' && (
          <div className="p-3.5 sm:p-5 rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Trophy size={16} className="text-amber-400" />
                  IPL 2027 Official Championship Standings
                </h3>
                <p className="text-xs text-gray-400">Top 4 franchises qualify for IPL Playoffs (Qualifier 1 & Eliminator)</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                10 Teams Contending
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-gray-400 uppercase border-b border-white/10 bg-slate-950/60">
                  <tr>
                    <th className="py-2.5 px-3">Pos</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-2 text-center">Played</th>
                    <th className="py-2.5 px-2 text-center text-emerald-400">Won</th>
                    <th className="py-2.5 px-2 text-center text-rose-400">Lost</th>
                    <th className="py-2.5 px-3 text-right">NRR</th>
                    <th className="py-2.5 px-4 text-right font-black text-amber-300">Points</th>
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
                          isMyTeam ? 'bg-amber-500/20 font-bold text-amber-200' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs font-bold ${
                            isTop4 ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-gray-400 bg-white/5'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans flex items-center gap-2">
                          <TeamLogo teamId={row.shortName} size={22} />
                          <span className="font-bold text-sm text-white">{row.shortName}</span>
                          {isMyTeam && (
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center text-gray-300 font-bold">{row.played}</td>
                        <td className="py-3 px-2 text-center text-emerald-400 font-black">{row.won}</td>
                        <td className="py-3 px-2 text-center text-rose-400 font-black">{row.lost}</td>
                        <td className="py-3 px-3 text-right text-gray-300 font-mono">
                          {row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-base text-amber-400">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                          setPlayingXI(activeLineupIds, bp.player_id, lineupMode);
                        } else {
                          replacePlayingXIPlayer(benchDrawerSlotIndex, bp.player_id, lineupMode);
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
                          {bp.role} • Salary: ₹{bp.price} Cr
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
          onClose={() => setShowSimulator(false)}
          myFranchise={franchise}
          mySquad={activeSquad}
          myPlayingXIIds={campaign.playingXI}
          userBatFirstXI={campaign.batFirstXI || campaign.playingXI}
          userBowlFirstXI={campaign.bowlFirstXI || campaign.playingXI}
          batFirstImpactId={campaign.batFirstImpactId || campaign.impactPlayerId}
          bowlFirstImpactId={campaign.bowlFirstImpactId || campaign.impactPlayerId}
          rivalFranchise={selectedFixtureForMatch ? getFranchise(rivalTeamId) : rivalFranchise}
          venueName={selectedFixtureForMatch ? selectedFixtureForMatch.stadiumName : currentInsight.title}
          matchFixture={selectedFixtureForMatch || currentMatch}
          onMatchComplete={(res) => {
            if (res) {
              recordMatchResult(
                selectedFixtureForMatch?.matchNo || currentMatch?.matchNo || 1,
                res,
                (res as any).scorecard
              );
            }
          }}
        />
      )}
    </div>
  );
}
