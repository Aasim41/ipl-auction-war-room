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
import TeamLogo from '../../components/TeamLogo';
import { TournamentFixture, TournamentPointsEntry } from '../../data/scheduleGenerator';
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
export function getPlayerTacticalBadge(player: CampaignPlayer, slotIndex: number): string {
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
    simulateRound
  } = useCampaignStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'xi' | 'schedule'>('xi');
  const [scheduleFilter, setScheduleFilter] = useState<'my' | 'all'>('all');
  const [lineupMode, setLineupMode] = useState<'bat_first' | 'bowl_first'>('bat_first');
  const [strategyToast, setStrategyToast] = useState<string | null>(null);
  const [venue, setVenue] = useState('Bengaluru');
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedFixtureForMatch, setSelectedFixtureForMatch] = useState<TournamentFixture | null>(null);
  const [benchDrawerSlotIndex, setBenchDrawerSlotIndex] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulatingRound, setIsSimulatingRound] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const campaign = mounted ? getActiveCampaign() : null;

  useEffect(() => {
    if (!campaign || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (TEAM_HOME_CITY[campaign.teamId]) {
      setVenue(TEAM_HOME_CITY[campaign.teamId]);
    }

    // Automatically repair invalid lineups on first mount
    const activeSquad = campaign.squad.filter((p) => !p.is_released);
    const currentXI = (campaign.playingXI || [])
      .map((id) => activeSquad.find((p) => p.player_id === id))
      .filter(Boolean) as CampaignPlayer[];
    
    const overseasInXI = currentXI.filter((p) => p.is_overseas).length;
    const wkInXI = currentXI.filter((p) => p.role === 'WK').length;
    const bowlersInXI = currentXI.filter((p) => p.role === 'BOWL' || p.role === 'AR').length;
    const isBowlerOpening = currentXI[0]?.role === 'BOWL';

    if (currentXI.length < 11 || overseasInXI > 4 || wkInXI < 1 || bowlersInXI < 5 || isBowlerOpening) {
      autoOptimizePlayingXI(TEAM_HOME_CITY[campaign.teamId] || 'Mumbai', 'csk', 'bat_first');
      autoOptimizePlayingXI(TEAM_HOME_CITY[campaign.teamId] || 'Mumbai', 'csk', 'bowl_first');
    }
  }, [campaign, autoOptimizePlayingXI]);

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-13 sm:pt-14 w-full max-w-full overflow-x-hidden touch-pan-y">
      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-x-hidden">
        
        {/* Banner with View Toggle (Lineup vs Schedule) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-3 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                gameAudio.playUiTap('light');
                triggerGameHaptic('light');
                router.push('/');
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all shrink-0"
              title="Return to Home Dashboard"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-md shrink-0" style={{ backgroundColor: franchise.color }}>
              {franchise.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black uppercase">
                  PART 4: TOURNAMENT & MATCH ARENA
                </span>
                <span className="text-xs text-gray-400 font-mono">Official 74-Match IPL Campaign</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-display text-white">
                {franchise.name} War Room & Matchday Operations
              </h1>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 flex-1 sm:flex-none">
              <button
                onClick={() => setActiveTab('xi')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'xi' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users size={13} />
                <span className="hidden sm:inline">Playing XI & Field</span>
                <span className="sm:hidden">Playing XI</span>
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'schedule' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={13} />
                <span className="hidden sm:inline">Tournament Schedule (74 Matches)</span>
                <span className="sm:hidden">Schedule</span>
              </button>
            </div>

            <button
              onClick={() => handleLaunchMatch()}
              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              <Swords size={13} />
              <span>Simulate Next Match</span>
            </button>
          </div>
        </div>

        {/* ─── TAB 1: PLAYING XI & PITCH TACTICAL SELECTION ─── */}
        {activeTab === 'xi' && (
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            {/* AI Strategy Toast Feedback */}
            {strategyToast && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-900 to-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 shadow-lg animate-fadeIn shrink-0">
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

            {/* Dual Playing 11 Strategy Toggle Bar */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider hidden sm:inline">
                  Team Sheet:
                </span>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setLineupMode('bat_first');
                      gameAudio.playUiTap('select');
                      triggerGameHaptic('light');
                    }}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      lineupMode === 'bowl_first'
                        ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🎯 Bowl-First XI</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-gray-300 font-mono text-center sm:text-right w-full sm:w-auto">
                {lineupMode === 'bat_first' ? (
                  <span className="text-amber-300">
                    🏏 Deep Batting (Batters #1-#8) • 12th Man: Strike Bowler
                  </span>
                ) : (
                  <span className="text-sky-300">
                    🎯 Bowling Fortress (5 Frontline Bowlers) • 12th Man: Power Finisher
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1">
              
              {/* Left 4 Columns: Stadium Vitals, AI Optimizer, & BCCI Compliance */}
              <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
                
                {/* Stadium & Venue Calibration */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg">
                  <label className="text-xs font-black uppercase text-gray-200 block mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-400" />
                    Match Fortress Stadium
                  </label>
                  <select 
                    value={venue} 
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.keys(VENUE_INSIGHTS).map(v => (
                      <option key={v} value={v}>{v} — {VENUE_INSIGHTS[v]?.title}</option>
                    ))}
                  </select>

                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="font-bold text-amber-300 text-xs">{currentInsight.title}</div>
                    <div className="text-[11px] text-gray-300 mt-0.5">{currentInsight.behavior}</div>
                    <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                      <Sparkles size={12} /> {currentInsight.boost}
                    </div>
                  </div>
                </div>

                {/* BCCI Compliance Status Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                  <div className="text-xs font-black uppercase text-gray-300 tracking-wider mb-2.5 flex items-center justify-between">
                    <span>BCCI Official Rule Validation</span>
                    {isCompliant ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        ✓ Compliant
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                        ⚠️ Rule Alert
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className={`p-2 rounded-xl border ${overseasInXI <= 4 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'}`}>
                      <div className="text-[10px] uppercase font-sans text-gray-400">Overseas</div>
                      <div className="text-sm font-black mt-0.5">{overseasInXI}/4 Max</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${wkInXI >= 1 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'}`}>
                      <div className="text-[10px] uppercase font-sans text-gray-400">Keeper (WK)</div>
                      <div className="text-sm font-black mt-0.5">{wkInXI} in XI</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${bowlersInXI >= 5 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'}`}>
                      <div className="text-[10px] uppercase font-sans text-gray-400">Bowlers/AR</div>
                      <div className="text-sm font-black mt-0.5">{bowlersInXI}/5 Min</div>
                    </div>
                  </div>
                </div>

                {/* AI Auto-Pick Best XI Button */}
                <button
                  onClick={handleAutoOptimize}
                  disabled={isOptimizing}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <Zap size={14} className={isOptimizing ? 'animate-spin' : ''} />
                  <span>
                    {isOptimizing 
                      ? `Adapting ${lineupMode === 'bat_first' ? 'Bat-First' : 'Bowl-First'} Lineup...` 
                      : `Auto-Pick Best ${lineupMode === 'bat_first' ? 'Bat-First' : 'Bowl-First'} XI (AI Optimizer)`}
                  </span>
                </button>

                {/* Impact Player Slot */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
                      <Sparkles size={12} /> Impact Player Sub (12th Man)
                    </span>
                    <div className="text-xs font-black text-white mt-0.5">
                      {impactPlayer ? impactPlayer.name : 'Select Reserve'}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {impactPlayer?.role} • OVR {impactPlayer?.Power_Index}
                    </div>
                  </div>
                  <button
                    onClick={() => setBenchDrawerSlotIndex(11)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

              </div>

              {/* Right 8 Columns: 2D Pitch Lineup in Proper Batting Order */}
              <div className="lg:col-span-8 p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="text-xs font-black uppercase tracking-wider text-gray-200 flex items-center gap-2">
                    <span className={lineupMode === 'bat_first' ? 'text-amber-400 font-black' : 'text-sky-400 font-black'}>
                      {lineupMode === 'bat_first' ? '🏏 Matchday Bat-First 11' : '🎯 Matchday Bowl-First 11'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal hidden sm:inline">(Order 1 to 11 • Use arrows to adjust)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Total Squad OVR: {Math.round(fullPlayingXI.reduce((acc, p) => acc + (Number(p.Power_Index) || 80), 0) / 11)}
                  </span>
                </div>

              {/* 11 Players in Real Batting Order */}
              <div className={`space-y-1.5 overflow-y-auto max-h-[460px] pr-1 rounded-2xl transition-all ${
                isOptimizing ? 'ring-2 ring-amber-400 p-1 animate-magic-sweep shadow-[0_0_30px_rgba(245,158,11,0.4)]' : ''
              }`}>
                {fullPlayingXI.map((player, index) => {
                  return (
                    <div
                      key={player.player_id}
                      className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/90 border border-white/10 hover:border-amber-400/40 flex items-center justify-between gap-2 transition-all hover:bg-white/5"
                    >
                      {/* Left: Batting Order & Identity */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-white/10 text-amber-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{player.name}</span>
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
                            <span className="text-amber-300 font-bold">#{index + 1} {getPlayerTacticalBadge(player, index)}</span> • {player.role} • OVR {player.Power_Index}
                          </div>
                        </div>
                      </div>

                      {/* Right: Stats Summary & Re-order Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[11px] font-mono text-gray-300 max-w-[150px] truncate">
                            {player.statsSummary || `OVR ${player.Power_Index}`}
                          </div>
                        </div>

                        {/* Move Up/Down Controls */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleMoveSlot(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20 text-gray-300 hover:text-white cursor-pointer transition-colors"
                            title="Move up batting order"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => handleMoveSlot(index, 'down')}
                            disabled={index === fullPlayingXI.length - 1}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20 text-gray-300 hover:text-white cursor-pointer transition-colors"
                            title="Move down batting order"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        {/* Swap with Bench Button */}
                        <button
                          onClick={() => setBenchDrawerSlotIndex(index)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-gray-200 hover:text-white border border-white/10 cursor-pointer transition-all"
                        >
                          Swap
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

        {/* ─── TAB 2: FULL IPL TOURNAMENT SEASON & SCHEDULE (74 MATCHES) ─── */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1">
            
            {/* Left 7 Columns: Fixtures Schedule with My 14 Matches vs All 74 Matches Toggle */}
            <div className="lg:col-span-7 p-3.5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col justify-between">
              
              {/* Filter Tabs & Quick Round Sim */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-white/10 gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Calendar size={13} className="text-amber-400" />
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
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        scheduleFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      All 74 Fixtures
                    </button>
                    <button
                      onClick={() => setScheduleFilter('my')}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        scheduleFilter === 'my' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      My 14 Matches
                    </button>
                  </div>
                </div>
              </div>

              {/* Fixture cards */}
              <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
                {(scheduleFilter === 'my' ? myFixtures : schedule).map((fixture) => {
                  const isCurrent = fixture.status === 'CURRENT';
                  const isDone = fixture.status === 'COMPLETED';
                  const isPlayoff = fixture.stage !== 'League';

                  return (
                    <div
                      key={fixture.matchNo}
                      className={`p-3 rounded-2xl border transition-all ${
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
            <div className="lg:col-span-5 p-3.5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col justify-between">
              <div className="pb-2 mb-2 border-b border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Trophy size={13} className="text-amber-400" />
                  IPL 2027 Championship Standings
                </h3>
                <p className="text-[11px] text-gray-400">Top 4 Franchises Qualify for IPL Playoffs</p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1 max-h-[460px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
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
                          <td className="py-1.5">
                            <span className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-bold ${
                              isTop4 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-500'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-1.5 font-sans flex items-center gap-1.5 truncate">
                            <TeamLogo teamId={row.shortName} size={18} />
                            <span className="font-bold truncate">{row.shortName}</span>
                          </td>
                          <td className="py-1.5 text-center text-gray-400">{row.played}</td>
                          <td className="py-1.5 text-center text-emerald-400 font-bold">{row.won}</td>
                          <td className="py-1.5 text-center text-rose-400 font-bold">{row.lost}</td>
                          <td className="py-1.5 text-right text-[11px] text-gray-400">
                            {row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}
                          </td>
                          <td className="py-1.5 text-right font-black text-amber-300">{row.points}</td>
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
                          <span>{bp.name}</span>
                          {bp.is_overseas && <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300">OS</span>}
                          {bp.role === 'WK' && <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">WK</span>}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {bp.role} • Salary: ₹{bp.price} Cr
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-300 font-mono">OVR {bp.Power_Index}</div>
                        <span className="text-[10px] text-amber-400 font-bold">Tap to Swap</span>
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
            if (currentMatch && res) {
              recordMatchResult(selectedFixtureForMatch?.matchNo || currentMatch.matchNo, res);
            }
          }}
        />
      )}
    </div>
  );
}
