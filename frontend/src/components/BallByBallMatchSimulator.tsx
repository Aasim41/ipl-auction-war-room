'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  FastForward, 
  RotateCcw, 
  Trophy, 
  Swords, 
  X, 
  Activity, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';
import { IPL_FRANCHISES, FranchiseData, getFranchise } from '../data/franchises';
import { Player } from '../lib/usePlayerData';
import { TournamentFixture } from '../data/scheduleGenerator';

interface BallByBallMatchSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  myFranchise: FranchiseData;
  mySquad: any[];
  myPlayingXIIds?: string[];
  rivalFranchise: FranchiseData;
  venueName: string;
  matchFixture?: TournamentFixture;
  onMatchComplete?: (result: TournamentFixture['result']) => void;
}

interface SimulatedBall {
  over: number;
  ball: number;
  striker: string;
  nonStriker: string;
  bowler: string;
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  fielder?: string;
  isFour: boolean;
  isSix: boolean;
  commentary: string;
  totalRuns: number;
  totalWickets: number;
}

interface InningsData {
  teamName: string;
  teamShort: string;
  teamColor: string;
  totalRuns: number;
  totalWickets: number;
  oversPlayed: number;
  balls: SimulatedBall[];
  battingScorecard: Array<{
    name: string;
    dismissal: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
  }>;
  bowlingFigures: Array<{
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: string;
  }>;
  fallOfWickets: Array<{
    wicket: number;
    score: number;
    player: string;
    over: string;
  }>;
}

export default function BallByBallMatchSimulator({
  isOpen,
  onClose,
  myFranchise,
  mySquad,
  myPlayingXIIds,
  rivalFranchise,
  venueName,
  matchFixture,
  onMatchComplete
}: BallByBallMatchSimulatorProps) {
  // Simulation control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(2);
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [matchDone, setMatchDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'arena' | 'scorecard' | 'worm'>('arena');

  // Generated full match data
  const [inn1, setInn1] = useState<InningsData | null>(null);
  const [inn2, setInn2] = useState<InningsData | null>(null);
  const [potm, setPotm] = useState<{ player: string; team: string; stats: string } | null>(null);
  const [matchResultSummary, setMatchResultSummary] = useState<TournamentFixture['result'] | null>(null);

  // Animation visual banner state
  const [eventBanner, setEventBanner] = useState<{ text: string; subtext: string; color: string; icon: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and generate match data when opened
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Determine starting XI for Team A (User)
    let teamAPlayers: Player[] = [];
    if (myPlayingXIIds && myPlayingXIIds.length >= 11) {
      teamAPlayers = myPlayingXIIds.map(id => mySquad.find(p => p.player_id === id)).filter(Boolean) as Player[];
    }
    if (teamAPlayers.length < 11) {
      teamAPlayers = mySquad.slice(0, 11);
    }

    // Determine starting XI for Team B (Rival)
    const teamBPlayers = (rivalFranchise.squad2026 || []).slice(0, 11);

    // Generate Full Realistic 20-Over Engine Simulation
    const generated = generateRealistic20OverMatch(myFranchise, teamAPlayers, rivalFranchise, teamBPlayers, venueName);
    setInn1(generated.inn1);
    setInn2(generated.inn2);
    setPotm(generated.potm);
    setMatchResultSummary(generated.resultSummary);

    setCurrentInnings(1);
    setCurrentBallIndex(0);
    setMatchDone(false);
    setIsPlaying(false);
  }, [isOpen, myFranchise, mySquad, myPlayingXIIds, rivalFranchise, venueName]);

  // Ball-by-ball playback tick loop
  useEffect(() => {
    if (!isPlaying || !inn1 || !inn2) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = simSpeed === 5 ? 250 : simSpeed === 2 ? 650 : 1200;

    timerRef.current = setInterval(() => {
      advanceOneBall();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentInnings, currentBallIndex, simSpeed, inn1, inn2]);

  const advanceOneBall = () => {
    if (!inn1 || !inn2) return;

    if (currentInnings === 1) {
      if (currentBallIndex < inn1.balls.length - 1) {
        const nextIdx = currentBallIndex + 1;
        setCurrentBallIndex(nextIdx);
        triggerBannerForBall(inn1.balls[nextIdx]);
      } else {
        // Switch to 2nd Innings
        setCurrentInnings(2);
        setCurrentBallIndex(0);
        triggerBannerForBall(inn2.balls[0]);
      }
    } else {
      if (currentBallIndex < inn2.balls.length - 1) {
        const nextIdx = currentBallIndex + 1;
        setCurrentBallIndex(nextIdx);
        triggerBannerForBall(inn2.balls[nextIdx]);
      } else {
        // Match Finished!
        setIsPlaying(false);
        setMatchDone(true);
        setActiveTab('scorecard');
      }
    }
  };

  const triggerBannerForBall = (b: SimulatedBall) => {
    if (b.isSix) {
      setEventBanner({
        text: '🚀 MAXIMUM! 6 RUNS!',
        subtext: `${b.striker} dispatches ${b.bowler} 104m into the top tier!`,
        color: 'from-amber-500 to-yellow-600',
        icon: 'SIX'
      });
      setTimeout(() => setEventBanner(null), 1400);
    } else if (b.isFour) {
      setEventBanner({
        text: '⚡ CRACKING 4! BOUNDARY!',
        subtext: `${b.striker} pierces the gap with sheer precision!`,
        color: 'from-sky-500 to-blue-600',
        icon: 'FOUR'
      });
      setTimeout(() => setEventBanner(null), 1200);
    } else if (b.isWicket) {
      setEventBanner({
        text: '🎯 WICKET! OUT!',
        subtext: `${b.striker} ${b.wicketType || 'is dismissed'} by ${b.bowler}!`,
        color: 'from-rose-600 to-red-700',
        icon: 'WICKET'
      });
      setTimeout(() => setEventBanner(null), 1800);
    }
  };

  const handleSkipToEnd = () => {
    if (!inn1 || !inn2) return;
    setIsPlaying(false);
    setCurrentInnings(2);
    setCurrentBallIndex(inn2.balls.length - 1);
    setMatchDone(true);
    setActiveTab('scorecard');
  };

  const handleNextOver = () => {
    if (!inn1 || !inn2) return;
    const activeInn = currentInnings === 1 ? inn1 : inn2;
    const currentBall = activeInn.balls[currentBallIndex];
    if (!currentBall) return;

    // Find next over start
    const nextOverIndex = activeInn.balls.findIndex((b, idx) => idx > currentBallIndex && b.over > currentBall.over);
    if (nextOverIndex !== -1) {
      setCurrentBallIndex(nextOverIndex);
    } else {
      if (currentInnings === 1) {
        setCurrentInnings(2);
        setCurrentBallIndex(0);
      } else {
        handleSkipToEnd();
      }
    }
  };

  if (!isOpen || !inn1 || !inn2) return null;

  const activeInnings = currentInnings === 1 ? inn1 : inn2;
  const currentBall = activeInnings.balls[currentBallIndex] || activeInnings.balls[0];

  // Over trail balls (last 6 balls of the current over)
  const currentOverBalls = activeInnings.balls.filter(b => b.over === currentBall.over && activeInnings.balls.indexOf(b) <= currentBallIndex);

  // Target calculation for 2nd innings
  const target = inn1.totalRuns + 1;
  const runsNeeded = target - currentBall.totalRuns;
  const ballsRemaining = Math.max(0, 120 - (currentBall.over * 6 + currentBall.ball));
  const reqRR = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl text-white overflow-hidden">
      <div className="relative w-full max-w-6xl bg-slate-950 border border-white/20 rounded-3xl flex flex-col h-[94vh] max-h-[850px] shadow-2xl overflow-hidden">
        
        {/* Top Header & Navigation Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-display font-black text-xs sm:text-sm">
              <span className="text-lg">{myFranchise.emoji}</span>
              <span className="text-white">{myFranchise.short}</span>
              <span className="text-gray-400 font-sans text-xs">vs</span>
              <span className="text-white">{rivalFranchise.short}</span>
              <span className="text-lg">{rivalFranchise.emoji}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono hidden sm:inline">
              📍 {venueName}
            </span>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('arena')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'arena' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              Live Stadium Arena
            </button>
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scorecard' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              Full Scorecards
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Event Banner Overlay (FOUR, SIX, WICKET) */}
        {eventBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
            <div className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${eventBanner.color} text-white font-black text-center shadow-2xl border border-white/40`}>
              <div className="text-lg sm:text-xl tracking-wider drop-shadow-md">{eventBanner.text}</div>
              <div className="text-xs font-sans text-white/90 drop-shadow">{eventBanner.subtext}</div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'arena' ? (
          <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 overflow-y-auto">
            
            {/* Live Score Ticker Banner */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg"
                  style={{ backgroundColor: activeInnings.teamColor }}
                >
                  {activeInnings.teamShort}
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-2">
                    <span>{currentBall.totalRuns}/{currentBall.totalWickets}</span>
                    <span className="text-xs sm:text-sm font-sans font-bold text-gray-400">
                      ({currentBall.over}.{currentBall.ball} ov)
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    CRR: {((currentBall.totalRuns / Math.max(1, currentBall.over * 6 + currentBall.ball)) * 6).toFixed(2)}
                    {currentInnings === 2 && (
                      <span className="text-amber-400 font-bold ml-2">
                        • Need {runsNeeded} off {ballsRemaining} balls (Req RR: {reqRR})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Over Ball Bubbles */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">Over {currentBall.over + 1}:</span>
                {currentOverBalls.map((b, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-md ${
                      b.isWicket 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : b.isSix 
                        ? 'bg-amber-400 text-slate-950 font-black' 
                        : b.isFour 
                        ? 'bg-sky-400 text-slate-950' 
                        : b.runs > 0 
                        ? 'bg-slate-700 text-white' 
                        : 'bg-slate-900 border border-white/20 text-gray-400'
                    }`}
                  >
                    {b.isWicket ? 'W' : b.runs}
                  </div>
                ))}
              </div>
            </div>

            {/* Stadium Pitch Canvas (2D Animated Cricket Stadium) */}
            <div className="relative my-3 flex-1 min-h-[220px] rounded-3xl bg-gradient-to-b from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border border-emerald-500/30 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
              {/* Pitch turf strip */}
              <div className="absolute inset-x-1/4 inset-y-4 bg-gradient-to-b from-amber-900/30 via-amber-800/20 to-amber-900/30 border-x border-amber-600/20 rounded-xl pointer-events-none" />

              {/* Top: Non-Striker & Bowler Card */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-md max-w-[200px]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Non-Striker</div>
                  <div className="text-xs font-black text-white truncate">{currentBall.nonStriker}</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-red-500/30 backdrop-blur-md text-right max-w-[220px]">
                  <div className="text-[10px] font-bold text-red-400 uppercase flex items-center justify-end gap-1">
                    <Activity size={10} /> Bowler
                  </div>
                  <div className="text-xs font-black text-white truncate">{currentBall.bowler}</div>
                </div>
              </div>

              {/* Center Action: Pitch Crease & Ball Trajectory Visual */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                <div className="text-xs font-mono font-bold text-emerald-300 bg-slate-950/70 px-4 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md mb-2">
                  Ball {currentBall.over}.{currentBall.ball} • {currentBall.commentary}
                </div>
                {/* Wickets graphic */}
                <div className="flex items-center gap-8">
                  <div className="w-8 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                  <div className={`w-3.5 h-3.5 rounded-full ${currentBall.isWicket ? 'bg-red-500 animate-ping' : currentBall.isSix ? 'bg-amber-400 animate-pulse' : 'bg-white'} shadow-md`} />
                  <div className="w-8 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                </div>
              </div>

              {/* Bottom: Striker on Strike Card */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 backdrop-blur-md max-w-[240px]">
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <Flame size={10} /> Striker on Crease
                  </div>
                  <div className="text-xs font-black text-white truncate">{currentBall.striker} *</div>
                </div>

                <div className="text-right text-[10px] text-gray-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10">
                  Innings {currentInnings} of 2 • {activeInnings.teamName}
                </div>
              </div>
            </div>

            {/* Playback & Fast-Forward Control Console */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying 
                      ? 'bg-rose-500 text-white shadow-rose-500/30' 
                      : 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  } shadow-md active:scale-95`}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
                </button>

                <button
                  onClick={advanceOneBall}
                  disabled={isPlaying || matchDone}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <SkipForward size={14} />
                  <span>Next Ball</span>
                </button>

                <button
                  onClick={handleNextOver}
                  disabled={isPlaying || matchDone}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95 hidden sm:flex"
                >
                  <FastForward size={14} />
                  <span>Next Over</span>
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] text-gray-400 font-bold px-2 uppercase">Speed:</span>
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd as any)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      simSpeed === spd ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleSkipToEnd}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md ml-auto"
              >
                <Zap size={13} />
                <span>Super-Sim to End</span>
              </button>
            </div>

          </div>
        ) : (
          /* Full Detailed Scorecard Tab */
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            
            {/* Match Winner & POTM Banner */}
            {matchResultSummary && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Trophy size={13} /> Match Concluded
                  </div>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {matchResultSummary.winnerName} won by {matchResultSummary.margin}!
                  </h3>
                  <div className="text-xs text-gray-300 font-mono mt-1">
                    {inn1.teamShort}: {inn1.totalRuns}/{inn1.totalWickets} ({inn1.oversPlayed} ov) • {inn2.teamShort}: {inn2.totalRuns}/{inn2.totalWickets} ({inn2.oversPlayed} ov)
                  </div>
                </div>

                {potm && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
                    <span className="text-[9px] font-black uppercase text-amber-300 block">PLAYER OF THE MATCH</span>
                    <strong className="text-sm font-black text-white block">{potm.player}</strong>
                    <span className="text-xs font-mono text-gray-300">{potm.stats}</span>
                  </div>
                )}
              </div>
            )}

            {/* Innings 1 Scorecard */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-white/10">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inn1.teamColor }} />
                  1st Innings: {inn1.teamName} ({inn1.totalRuns}/{inn1.totalWickets} in {inn1.oversPlayed} ov)
                </h4>
              </div>

              {/* Batting Card */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-1">Batter</th>
                      <th className="py-1">Dismissal</th>
                      <th className="py-1 text-right">R</th>
                      <th className="py-1 text-right">B</th>
                      <th className="py-1 text-right">4s</th>
                      <th className="py-1 text-right">6s</th>
                      <th className="py-1 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {inn1.battingScorecard.map((b, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="py-1.5 font-sans font-bold text-white">{b.name}</td>
                        <td className="py-1.5 text-gray-400 text-[11px]">{b.dismissal}</td>
                        <td className="py-1.5 text-right font-black text-amber-300">{b.runs}</td>
                        <td className="py-1.5 text-right text-gray-400">{b.balls}</td>
                        <td className="py-1.5 text-right">{b.fours}</td>
                        <td className="py-1.5 text-right">{b.sixes}</td>
                        <td className="py-1.5 text-right text-gray-400">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bowling Card */}
              <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Bowling Figures ({inn2.teamShort})</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-1">Bowler</th>
                      <th className="py-1 text-right">O</th>
                      <th className="py-1 text-right">M</th>
                      <th className="py-1 text-right">R</th>
                      <th className="py-1 text-right">W</th>
                      <th className="py-1 text-right">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {inn1.bowlingFigures.map((bw, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="py-1.5 font-sans font-bold text-white">{bw.name}</td>
                        <td className="py-1.5 text-right">{bw.overs}</td>
                        <td className="py-1.5 text-right text-gray-400">{bw.maidens}</td>
                        <td className="py-1.5 text-right text-rose-300">{bw.runs}</td>
                        <td className="py-1.5 text-right font-black text-emerald-400">{bw.wickets}</td>
                        <td className="py-1.5 text-right text-gray-400">{bw.economy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Innings 2 Scorecard */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-white/10">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inn2.teamColor }} />
                  2nd Innings: {inn2.teamName} ({inn2.totalRuns}/{inn2.totalWickets} in {inn2.oversPlayed} ov)
                </h4>
              </div>

              {/* Batting Card */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-1">Batter</th>
                      <th className="py-1">Dismissal</th>
                      <th className="py-1 text-right">R</th>
                      <th className="py-1 text-right">B</th>
                      <th className="py-1 text-right">4s</th>
                      <th className="py-1 text-right">6s</th>
                      <th className="py-1 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {inn2.battingScorecard.map((b, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="py-1.5 font-sans font-bold text-white">{b.name}</td>
                        <td className="py-1.5 text-gray-400 text-[11px]">{b.dismissal}</td>
                        <td className="py-1.5 text-right font-black text-amber-300">{b.runs}</td>
                        <td className="py-1.5 text-right text-gray-400">{b.balls}</td>
                        <td className="py-1.5 text-right">{b.fours}</td>
                        <td className="py-1.5 text-right">{b.sixes}</td>
                        <td className="py-1.5 text-right text-gray-400">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bowling Card */}
              <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Bowling Figures ({inn1.teamShort})</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-1">Bowler</th>
                      <th className="py-1 text-right">O</th>
                      <th className="py-1 text-right">M</th>
                      <th className="py-1 text-right">R</th>
                      <th className="py-1 text-right">W</th>
                      <th className="py-1 text-right">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {inn2.bowlingFigures.map((bw, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="py-1.5 font-sans font-bold text-white">{bw.name}</td>
                        <td className="py-1.5 text-right">{bw.overs}</td>
                        <td className="py-1.5 text-right text-gray-400">{bw.maidens}</td>
                        <td className="py-1.5 text-right text-rose-300">{bw.runs}</td>
                        <td className="py-1.5 text-right font-black text-emerald-400">{bw.wickets}</td>
                        <td className="py-1.5 text-right text-gray-400">{bw.economy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions: Save Result to Tournament Schedule */}
            {matchResultSummary && (
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => {
                    if (onMatchComplete) {
                      onMatchComplete(matchResultSummary);
                    }
                    onClose();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <CheckCircle2 size={16} />
                  <span>Record Result to IPL Schedule & Points Table</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// ─── HIGH-PRECISION REALISTIC 20-OVER CRICKET GENERATOR ───
function generateRealistic20OverMatch(
  franchiseA: FranchiseData,
  squadA: Player[],
  franchiseB: FranchiseData,
  squadB: Player[],
  venue: string
) {
  // Determine who bats first (Coin Toss)
  const aBatsFirst = Math.random() > 0.5;
  const bat1Team = aBatsFirst ? franchiseA : franchiseB;
  const bat1Squad = aBatsFirst ? squadA : squadB;
  const bowl1Team = aBatsFirst ? franchiseB : franchiseA;
  const bowl1Squad = aBatsFirst ? squadB : squadA;

  // Innings 1 Simulation
  const inn1 = simulateSingleInnings(bat1Team, bat1Squad, bowl1Team, bowl1Squad, null);

  // Innings 2 Simulation (Chase with target)
  const inn2 = simulateSingleInnings(bowl1Team, bowl1Squad, bat1Team, bat1Squad, inn1.totalRuns + 1);

  // Determine Winner
  let winnerTeam = franchiseA;
  let margin = '';
  let aWon = false;

  if (aBatsFirst) {
    if (inn1.totalRuns > inn2.totalRuns) {
      winnerTeam = franchiseA;
      margin = `${inn1.totalRuns - inn2.totalRuns} runs`;
      aWon = true;
    } else {
      winnerTeam = franchiseB;
      margin = `${10 - inn2.totalWickets} wickets`;
      aWon = false;
    }
  } else {
    if (inn2.totalRuns > inn1.totalRuns) {
      winnerTeam = franchiseA;
      margin = `${10 - inn2.totalWickets} wickets`;
      aWon = true;
    } else {
      winnerTeam = franchiseB;
      margin = `${inn1.totalRuns - inn2.totalRuns} runs`;
      aWon = false;
    }
  }

  // Player of the match
  const allBatters = [...inn1.battingScorecard, ...inn2.battingScorecard];
  const topBatter = allBatters.sort((a, b) => b.runs - a.runs)[0];
  const allBowlers = [...inn1.bowlingFigures, ...inn2.bowlingFigures];
  const topBowler = allBowlers.sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];

  let potm = {
    player: topBatter.name,
    team: winnerTeam.name,
    stats: `${topBatter.runs}* (${topBatter.balls}b, ${topBatter.fours}x4, ${topBatter.sixes}x6)`
  };

  if (topBowler.wickets >= 3) {
    potm = {
      player: topBowler.name,
      team: winnerTeam.name,
      stats: `${topBowler.wickets}/${topBowler.runs} (${topBowler.overs} ov)`
    };
  }

  const resultSummary: TournamentFixture['result'] = {
    winnerTeamId: winnerTeam.short.toLowerCase(),
    winnerName: winnerTeam.name,
    margin,
    myRuns: aBatsFirst ? inn1.totalRuns : inn2.totalRuns,
    myWickets: aBatsFirst ? inn1.totalWickets : inn2.totalWickets,
    myOvers: aBatsFirst ? inn1.oversPlayed : inn2.oversPlayed,
    rivalRuns: aBatsFirst ? inn2.totalRuns : inn1.totalRuns,
    rivalWickets: aBatsFirst ? inn2.totalWickets : inn1.totalWickets,
    rivalOvers: aBatsFirst ? inn2.oversPlayed : inn1.oversPlayed,
    pomPlayer: potm.player,
    pomStats: potm.stats
  };

  return { inn1, inn2, potm, resultSummary };
}

function simulateSingleInnings(
  batTeam: FranchiseData,
  batSquad: Player[],
  bowlTeam: FranchiseData,
  bowlSquad: Player[],
  target: number | null
): InningsData {
  const bowlers = bowlSquad.filter(p => p.role === 'BOWL' || p.role === 'AR');
  const activeBowlers = (bowlers.length >= 4 ? bowlers : bowlSquad).slice(0, 5);

  const batters = batSquad.slice(0, 11);
  let strikerIdx = 0;
  let nonStrikerIdx = 1;
  let nextBatterIdx = 2;

  let totalRuns = 0;
  let totalWickets = 0;
  const balls: SimulatedBall[] = [];

  const batterStats: Record<string, { runs: number; balls: number; fours: number; sixes: number; dismissal: string }> = {};
  batters.forEach(b => {
    batterStats[b.name] = { runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: 'not out' };
  });

  const bowlerStats: Record<string, { overs: number; ballsInOver: number; maidens: number; runs: number; wickets: number }> = {};
  activeBowlers.forEach(b => {
    bowlerStats[b.name] = { overs: 0, ballsInOver: 0, maidens: 0, runs: 0, wickets: 0 };
  });

  const fallOfWickets: Array<{ wicket: number; score: number; player: string; over: string }> = [];

  // Simulate 20 overs (120 legal balls)
  for (let over = 0; over < 20; over++) {
    const bowler = activeBowlers[over % activeBowlers.length];
    let runsInOver = 0;

    for (let ball = 1; ball <= 6; ball++) {
      if (totalWickets >= 10) break;
      if (target !== null && totalRuns >= target) break;

      const striker = batters[strikerIdx]?.name || 'Batter';
      const nonStriker = batters[nonStrikerIdx]?.name || 'Non-Striker';

      // Ball event generator
      const rand = Math.random();
      let runs = 0;
      let isWicket = false;
      let isFour = false;
      let isSix = false;
      let dismissal = '';
      let commentary = '';

      if (rand < 0.055) {
        // WICKET!
        isWicket = true;
        totalWickets++;
        const fielder = bowlSquad[Math.floor(Math.random() * bowlSquad.length)].name;
        
        if (Math.random() < 0.35) {
          dismissal = `b ${bowler.name}`;
          commentary = `CLEAN BOWLED! ${bowler.name} beats the inside edge and uproots off-stump!`;
        } else if (Math.random() < 0.65) {
          dismissal = `c ${fielder} b ${bowler.name}`;
          commentary = `CAUGHT! Lofted towards deep midwicket and taken safely by ${fielder}!`;
        } else if (Math.random() < 0.85) {
          dismissal = `c & b ${bowler.name}`;
          commentary = `CAUGHT & BOWLED! Searing return catch held sharply by ${bowler.name}!`;
        } else {
          dismissal = `lbw b ${bowler.name}`;
          commentary = `LBW! Plumb in front! Finger goes up immediately!`;
        }

        batterStats[striker].dismissal = dismissal;
        bowlerStats[bowler.name].wickets++;
        fallOfWickets.push({
          wicket: totalWickets,
          score: totalRuns,
          player: striker,
          over: `${over}.${ball}`
        });

        // Bring next batter
        if (nextBatterIdx < batters.length) {
          strikerIdx = nextBatterIdx++;
        }
      } else if (rand < 0.17) {
        // SIX!
        runs = 6;
        isSix = true;
        commentary = `MASSIVE SIX! Clean strike sailed 100+ meters into the stands!`;
      } else if (rand < 0.32) {
        // FOUR!
        runs = 4;
        isFour = true;
        commentary = `FOUR! Pierces the cover gap with cracking timing to the fence!`;
      } else if (rand < 0.44) {
        runs = 2;
        commentary = `Pushed into the deep pocket, hurried back for a sharp couple!`;
      } else if (rand < 0.72) {
        runs = 1;
        commentary = `Worked into mid-on for a quick single.`;
      } else {
        runs = 0;
        commentary = `Dot ball. Swing and a miss outside the off-stump channel.`;
      }

      totalRuns += runs;
      runsInOver += runs;

      // Update stats
      batterStats[striker].runs += runs;
      batterStats[striker].balls += 1;
      if (isFour) batterStats[striker].fours++;
      if (isSix) batterStats[striker].sixes++;

      bowlerStats[bowler.name].runs += runs;
      bowlerStats[bowler.name].ballsInOver++;

      // Rotate strike on odd runs
      if (runs % 2 === 1) {
        const temp = strikerIdx;
        strikerIdx = nonStrikerIdx;
        nonStrikerIdx = temp;
      }

      balls.push({
        over,
        ball,
        striker,
        nonStriker,
        bowler: bowler.name,
        runs,
        isWicket,
        wicketType: dismissal,
        isFour,
        isSix,
        commentary,
        totalRuns,
        totalWickets
      });
    }

    bowlerStats[bowler.name].overs += 1;
    if (runsInOver === 0) bowlerStats[bowler.name].maidens += 1;

    // Rotate strike at end of over
    const temp = strikerIdx;
    strikerIdx = nonStrikerIdx;
    nonStrikerIdx = temp;

    if (totalWickets >= 10 || (target !== null && totalRuns >= target)) break;
  }

  const battingScorecard = batters.map(b => {
    const s = batterStats[b.name];
    const sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0';
    return {
      name: b.name,
      dismissal: s.dismissal,
      runs: s.runs,
      balls: s.balls,
      fours: s.fours,
      sixes: s.sixes,
      strikeRate: sr
    };
  });

  const bowlingFigures = activeBowlers.map(b => {
    const s = bowlerStats[b.name];
    const ov = s.overs;
    const econ = ov > 0 ? (s.runs / ov).toFixed(2) : '0.00';
    return {
      name: b.name,
      overs: `${ov}.0`,
      maidens: s.maidens,
      runs: s.runs,
      wickets: s.wickets,
      economy: econ
    };
  });

  const oversPlayed = Math.min(20, Math.ceil(balls.length / 6));

  return {
    teamName: batTeam.name,
    teamShort: batTeam.short,
    teamColor: batTeam.color,
    totalRuns,
    totalWickets,
    oversPlayed,
    balls,
    battingScorecard,
    bowlingFigures,
    fallOfWickets
  };
}
