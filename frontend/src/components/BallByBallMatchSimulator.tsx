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
  ChevronRight,
  Target,
  Compass,
  Award,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FranchiseData } from '../data/franchises';
import { TournamentFixture } from '../data/scheduleGenerator';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';
import { getFranchiseAI } from '../data/franchiseAI';

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

export type BattingTactic = 'DEFEND' | 'ROTATE' | 'ATTACK' | 'MAXIMUM';
export type BowlingTactic = 'YORKER' | 'SLOWER' | 'BOUNCER' | 'GOOD_LENGTH';

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
  shotDirection?: { x: number; y: number; name: string };
  tacticUsed?: string;
}

interface BatterRecord {
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
}

interface BowlerRecord {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
}

interface InningsState {
  teamName: string;
  teamShort: string;
  teamColor: string;
  totalRuns: number;
  totalWickets: number;
  oversPlayed: number;
  balls: SimulatedBall[];
  battingScorecard: BatterRecord[];
  bowlingFigures: BowlerRecord[];
  fallOfWickets: Array<{ wicket: number; score: number; player: string; over: string }>;
  isComplete: boolean;
}

const SHOT_ZONES = [
  { x: 30, y: 15, name: 'Third Man' },
  { x: 70, y: 15, name: 'Fine Leg' },
  { x: 15, y: 50, name: 'Deep Point' },
  { x: 85, y: 50, name: 'Square Leg' },
  { x: 20, y: 80, name: 'Extra Cover' },
  { x: 50, y: 90, name: 'Straight Long-Off' },
  { x: 80, y: 80, name: 'Deep Midwicket' },
  { x: 50, y: 85, name: 'Long-On' }
];

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
  // Tabs: 'arena' | 'scorecard'
  const [activeTab, setActiveTab] = useState<'arena' | 'scorecard'>('arena');

  // Match control
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [isBallAnimating, setIsBallAnimating] = useState(false);

  // User Interactive Tactical Intent
  const [battingTactic, setBattingTactic] = useState<BattingTactic>('ROTATE');
  const [bowlingTactic, setBowlingTactic] = useState<BowlingTactic>('GOOD_LENGTH');

  // Innings Data
  const [inn1, setInn1] = useState<InningsState | null>(null);
  const [inn2, setInn2] = useState<InningsState | null>(null);
  const [potm, setPotm] = useState<{ player: string; team: string; stats: string } | null>(null);
  const [matchResultSummary, setMatchResultSummary] = useState<TournamentFixture['result'] | null>(null);

  // Active Innings State Trackers
  const [strikerIdx, setStrikerIdx] = useState(0);
  const [nonStrikerIdx, setNonStrikerIdx] = useState(1);
  const [nextBatterIdx, setNextBatterIdx] = useState(2);
  const [currentBowlerIdx, setCurrentBowlerIdx] = useState(0);

  // Event banner
  const [eventBanner, setEventBanner] = useState<{ text: string; subtext: string; color: string } | null>(null);
  const [lastShotTraj, setLastShotTraj] = useState<{ x: number; y: number; name: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(gameAudio.isMuted());
    const handleSoundChange = (e: any) => {
      if (e?.detail) setIsMuted(e.detail.isMuted);
    };
    window.addEventListener('auctionxi_sound_change', handleSoundChange);
    return () => window.removeEventListener('auctionxi_sound_change', handleSoundChange);
  }, []);

  // Squads
  const [bat1Squad, setBat1Squad] = useState<any[]>([]);
  const [bowl1Squad, setBowl1Squad] = useState<any[]>([]);
  const [aBatsFirst, setABatsFirst] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Match Setup on Open
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Determine user starting XI
    let userXI: any[] = [];
    if (myPlayingXIIds && myPlayingXIIds.length >= 11) {
      userXI = myPlayingXIIds.map(id => mySquad.find(p => p.player_id === id)).filter(Boolean);
    }
    if (userXI.length < 11) {
      userXI = mySquad.slice(0, 11);
    }

    const rivalXI = (rivalFranchise.squad2026 || []).slice(0, 11);

    // Coin Toss: 50% chance user bats first
    const tossWin = Math.random() > 0.5;
    setABatsFirst(tossWin);

    const firstBatTeam = tossWin ? myFranchise : rivalFranchise;
    const firstBowlTeam = tossWin ? rivalFranchise : myFranchise;
    const firstBatSquad = tossWin ? userXI : rivalXI;
    const firstBowlSquad = tossWin ? rivalXI : userXI;

    setBat1Squad(firstBatSquad);
    setBowl1Squad(firstBowlSquad);

    // Initialize Empty Innings 1
    const initInn1: InningsState = {
      teamName: firstBatTeam.name,
      teamShort: firstBatTeam.short,
      teamColor: firstBatTeam.color,
      totalRuns: 0,
      totalWickets: 0,
      oversPlayed: 0,
      balls: [],
      battingScorecard: firstBatSquad.slice(0, 11).map(p => ({
        name: p.name,
        dismissal: 'not out',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: '0.0'
      })),
      bowlingFigures: firstBowlSquad.filter(p => p.role === 'BOWL' || p.role === 'AR').slice(0, 5).map(b => ({
        name: b.name,
        overs: '0.0',
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: '0.00'
      })),
      fallOfWickets: [],
      isComplete: false
    };

    // Initialize Empty Innings 2
    const initInn2: InningsState = {
      teamName: firstBowlTeam.name,
      teamShort: firstBowlTeam.short,
      teamColor: firstBowlTeam.color,
      totalRuns: 0,
      totalWickets: 0,
      oversPlayed: 0,
      balls: [],
      battingScorecard: firstBowlSquad.slice(0, 11).map(p => ({
        name: p.name,
        dismissal: 'not out',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: '0.0'
      })),
      bowlingFigures: firstBatSquad.filter(p => p.role === 'BOWL' || p.role === 'AR').slice(0, 5).map(b => ({
        name: b.name,
        overs: '0.0',
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: '0.00'
      })),
      fallOfWickets: [],
      isComplete: false
    };

    setInn1(initInn1);
    setInn2(initInn2);
    setCurrentInnings(1);
    setStrikerIdx(0);
    setNonStrikerIdx(1);
    setNextBatterIdx(2);
    setCurrentBowlerIdx(0);
    setMatchDone(false);
    setIsPlaying(false);
    setActiveTab('arena');
    setLastShotTraj(null);
  }, [isOpen, myFranchise, mySquad, myPlayingXIIds, rivalFranchise, venueName]);

  // Is User's Team currently batting or bowling?
  const isUserBatting = (currentInnings === 1 && aBatsFirst) || (currentInnings === 2 && !aBatsFirst);

  // ─── TACTICAL BALL EXECUTION ENGINE ───
  const executeBall = (customTactic?: BattingTactic | BowlingTactic) => {
    if (matchDone || !inn1 || !inn2) return;

    const activeInn = currentInnings === 1 ? inn1 : inn2;
    const currentBatSquad = currentInnings === 1 ? bat1Squad : bowl1Squad;
    const currentBowlSquad = currentInnings === 1 ? bowl1Squad : bat1Squad;

    const legalBallsBowled = activeInn.balls.length;
    const currentOver = Math.floor(legalBallsBowled / 6);
    const ballInOver = (legalBallsBowled % 6) + 1;

    // Check if innings already reached 20 overs or 10 wickets
    if (currentOver >= 20 || activeInn.totalWickets >= 10) {
      handleInningsTransition();
      return;
    }

    const striker = currentBatSquad[strikerIdx]?.name || 'Batter';
    const nonStriker = currentBatSquad[nonStrikerIdx]?.name || 'Non-Striker';
    
    // Rotate bowlers across 5 main options
    const activeBowlers = currentBowlSquad.filter(p => p.role === 'BOWL' || p.role === 'AR').slice(0, 5);
    const bowler = activeBowlers[currentBowlerIdx % activeBowlers.length] || currentBowlSquad[0];

    // Target for chase in 2nd innings
    const chaseTarget = currentInnings === 2 ? inn1.totalRuns + 1 : null;

    // Determine tactics based on Utility AI Profiles
    const rivalAI = getFranchiseAI(rivalFranchise.short || rivalFranchise.id);
    let botBatTactic: BattingTactic = 'ROTATE';
    let botBowlTactic: BowlingTactic = 'GOOD_LENGTH';

    if (!isUserBatting) {
      // Rival Bot is Batting
      const isPowerplay = currentOver < 6;
      const isDeath = currentOver >= 16;
      const botRand = Math.random();

      if (rivalFranchise.short === 'CSK') {
        // CSK: Seasoned anchors, conservative early, explosive finish
        if (isPowerplay) {
          botBatTactic = botRand < 0.35 ? 'DEFEND' : botRand < 0.85 ? 'ROTATE' : 'ATTACK';
        } else if (isDeath) {
          botBatTactic = botRand < 0.55 ? 'MAXIMUM' : botRand < 0.85 ? 'ATTACK' : 'ROTATE';
        } else {
          botBatTactic = botRand < 0.20 ? 'DEFEND' : botRand < 0.75 ? 'ROTATE' : 'ATTACK';
        }
      } else if (rivalFranchise.short === 'SRH' || rivalFranchise.short === 'MI') {
        // SRH & MI: Hyper-aggressive in powerplays & death overs
        if (isPowerplay) {
          botBatTactic = botRand < 0.10 ? 'ROTATE' : botRand < 0.55 ? 'ATTACK' : 'MAXIMUM';
        } else if (isDeath) {
          botBatTactic = botRand < 0.70 ? 'MAXIMUM' : 'ATTACK';
        } else {
          botBatTactic = botRand < 0.35 ? 'ROTATE' : botRand < 0.75 ? 'ATTACK' : 'MAXIMUM';
        }
      } else if (rivalFranchise.short === 'RR') {
        // RR: Moneyball analytical valuation & required rate adaptation
        const reqRate = (chaseTarget && currentInnings === 2) 
          ? (chaseTarget - activeInn.totalRuns) / Math.max(0.1, (20 - currentOver)) 
          : 8.5;
        if (reqRate > 10.5) {
          botBatTactic = botRand < 0.60 ? 'MAXIMUM' : 'ATTACK';
        } else if (reqRate > 8.5) {
          botBatTactic = botRand < 0.50 ? 'ATTACK' : 'ROTATE';
        } else {
          botBatTactic = botRand < 0.65 ? 'ROTATE' : botRand < 0.85 ? 'ATTACK' : 'DEFEND';
        }
      } else {
        const pAggr = rivalAI.matchDayBias.powerplayAggression;
        if (isPowerplay) {
          botBatTactic = botRand < (1 - pAggr) ? 'ROTATE' : botRand < 0.75 ? 'ATTACK' : 'MAXIMUM';
        } else if (isDeath) {
          botBatTactic = botRand < 0.6 ? 'MAXIMUM' : 'ATTACK';
        } else {
          botBatTactic = botRand < 0.5 ? 'ROTATE' : botRand < 0.8 ? 'ATTACK' : 'DEFEND';
        }
      }
    } else {
      // Rival Bot is Bowling
      const isSpinner = bowler.role === 'BOWL' && (bowler.name.includes('Chahal') || bowler.name.includes('Kuldeep') || bowler.name.includes('Ashwin') || bowler.name.includes('Rashid') || bowler.name.includes('Narine') || bowler.name.includes('Jadeja') || bowler.name.includes('Bishnoi') || bowler.name.includes('Axar') || bowler.name.includes('Varun'));
      const botRand = Math.random();

      if (rivalFranchise.short === 'CSK' || isSpinner || rivalAI.matchDayBias.spinPriority > 0.8) {
        // CSK / Spin choke: Disciplined good length and deceptive slower cutters
        botBowlTactic = botRand < 0.55 ? 'GOOD_LENGTH' : botRand < 0.85 ? 'SLOWER' : 'YORKER';
      } else if (rivalFranchise.short === 'MI' || rivalFranchise.short === 'SRH' || rivalAI.matchDayBias.paceAggression > 0.8) {
        // MI / SRH: Express pace hostility (145+ km/h bouncers & toe-crushing yorkers)
        botBowlTactic = botRand < 0.45 ? 'YORKER' : botRand < 0.80 ? 'BOUNCER' : 'GOOD_LENGTH';
      } else if (rivalFranchise.short === 'RR') {
        // RR: Moneyball variation based on batter strike rate
        botBowlTactic = botRand < 0.40 ? 'GOOD_LENGTH' : botRand < 0.70 ? 'SLOWER' : 'YORKER';
      } else {
        botBowlTactic = botRand < 0.35 ? 'GOOD_LENGTH' : botRand < 0.65 ? 'YORKER' : botRand < 0.85 ? 'SLOWER' : 'BOUNCER';
      }
    }

    const activeBatTactic: BattingTactic = isUserBatting 
      ? (customTactic as BattingTactic) || battingTactic 
      : botBatTactic;

    const activeBowlTactic: BowlingTactic = !isUserBatting
      ? (customTactic as BowlingTactic) || bowlingTactic
      : botBowlTactic;

    // Dynamic Outcome Probability based on tactics
    const rand = Math.random();
    let runs = 0;
    let isWicket = false;
    let isFour = false;
    let isSix = false;
    let dismissal = '';
    let commentary = '';
    const shotZone = SHOT_ZONES[Math.floor(Math.random() * SHOT_ZONES.length)];

    // BATTING TACTIC LOGIC
    if (activeBatTactic === 'DEFEND') {
      if (rand < 0.02) {
        isWicket = true;
      } else if (rand < 0.75) {
        runs = 0;
        commentary = `Solid defensive push into the covers. No run taken.`;
      } else if (rand < 0.95) {
        runs = 1;
        commentary = `Soft hands tap into mid-wicket, scampered through for a sensible single.`;
      } else {
        runs = 2;
        commentary = `Pushed into the gap at sweeper cover, comfortable double.`;
      }
    } else if (activeBatTactic === 'ROTATE') {
      if (rand < 0.05) {
        isWicket = true;
      } else if (rand < 0.25) {
        runs = 0;
        commentary = `Defended towards point, fielder closes in sharply.`;
      } else if (rand < 0.75) {
        runs = 1;
        commentary = `Worked smoothly off the hips into square leg for one.`;
      } else if (rand < 0.92) {
        runs = 2;
        commentary = `Steered fine of third man, hurried back for a sharp couple!`;
      } else {
        runs = 4;
        isFour = true;
        commentary = `FOUR! Beautifully timed drive beats mid-off to the rope!`;
      }
    } else if (activeBatTactic === 'ATTACK') {
      if (rand < 0.12) {
        isWicket = true;
      } else if (rand < 0.25) {
        runs = 0;
        commentary = `Big swing and a miss outside off! Lucky not to edge behind.`;
      } else if (rand < 0.50) {
        runs = 1;
        commentary = `Lofted towards long-on on the bounce for a single.`;
      } else if (rand < 0.80) {
        runs = 4;
        isFour = true;
        commentary = `⚡ CRACKING 4! Pierces extra cover with blistering power!`;
      } else {
        runs = 6;
        isSix = true;
        commentary = `🚀 HUGE SIX! Clean strike sailed 95m over deep midwicket!`;
      }
    } else {
      // MAXIMUM (All out aggression)
      if (rand < 0.22) {
        isWicket = true;
      } else if (rand < 0.40) {
        runs = 0;
        commentary = `Swing across the line, beaten all ends up!`;
      } else if (rand < 0.65) {
        runs = 4;
        isFour = true;
        commentary = `⚡ FOUR! Muscled over the infield bouncing into the fence!`;
      } else {
        runs = 6;
        isSix = true;
        commentary = `🚀 MONSTER SIX! Dispatched 106m into the top tier! Unreal power!`;
      }
    }

    // Adjust for BOWLING TACTIC
    if (activeBowlTactic === 'YORKER') {
      if (isWicket) {
        dismissal = `b ${bowler.name}`;
        commentary = `🔥 CLEAN BOWLED! Pinpoint yorker crushes the base of leg stump!`;
      }
    } else if (activeBowlTactic === 'SLOWER') {
      if (isWicket) {
        const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)].name;
        dismissal = `c ${fielder} b ${bowler.name}`;
        commentary = `🎯 CAUGHT! Deceptive knuckle ball induces an early loft, pouched by ${fielder}!`;
      }
    } else if (activeBowlTactic === 'BOUNCER') {
      if (isWicket) {
        const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)].name;
        dismissal = `c ${fielder} b ${bowler.name}`;
        commentary = `🎯 TOP EDGE! Hurried by the bouncer, skied high and held safely by ${fielder}!`;
      }
    } else {
      if (isWicket) {
        dismissal = `c & b ${bowler.name}`;
        commentary = `🎯 SENSATIONAL C&B! ${bowler.name} grabs a reflex return catch!`;
      }
    }

    // Default wicket dismissal fallback
    if (isWicket && !dismissal) {
      dismissal = `b ${bowler.name}`;
      commentary = `WICKET! ${bowler.name} breaks through! Off stump knocked out!`;
    }

    // Update Scores
    const newTotalRuns = activeInn.totalRuns + runs;
    const newTotalWickets = isWicket ? activeInn.totalWickets + 1 : activeInn.totalWickets;

    // Trigger visual animations & Procedural Audio/Haptics
    setIsBallAnimating(true);
    setLastShotTraj(shotZone);
    setTimeout(() => setIsBallAnimating(false), 600);

    if (isSix) {
      gameAudio.playWillowCrack('six');
      gameAudio.playCrowdRoar('six');
      triggerGameHaptic('six');
      setEventBanner({
        text: '🚀 MAXIMUM! 6 RUNS!',
        subtext: `${striker} hammers ${bowler.name} into the crowd!`,
        color: 'from-amber-500 to-yellow-600'
      });
      setTimeout(() => setEventBanner(null), 1500);
    } else if (isFour) {
      gameAudio.playWillowCrack('four');
      gameAudio.playCrowdRoar('boundary');
      triggerGameHaptic('four');
      setEventBanner({
        text: '⚡ CRACKING 4! BOUNDARY!',
        subtext: `${striker} pierces ${shotZone.name} to the rope!`,
        color: 'from-sky-500 to-blue-600'
      });
      setTimeout(() => setEventBanner(null), 1200);
    } else if (isWicket) {
      gameAudio.playStumpShatter();
      gameAudio.playCrowdRoar('wicket');
      triggerGameHaptic('wicket');
      setEventBanner({
        text: '🎯 WICKET! OUT!',
        subtext: `${striker} ${dismissal}!`,
        color: 'from-rose-600 to-red-700'
      });
      setTimeout(() => setEventBanner(null), 1800);
    } else if (runs > 0) {
      gameAudio.playWillowCrack('single');
      triggerGameHaptic('light');
    } else {
      gameAudio.playWillowCrack('dot');
      gameAudio.playBallWhoosh();
    }

    const newBall: SimulatedBall = {
      over: currentOver,
      ball: ballInOver,
      striker,
      nonStriker,
      bowler: bowler.name,
      runs,
      isWicket,
      wicketType: dismissal,
      isFour,
      isSix,
      commentary,
      totalRuns: newTotalRuns,
      totalWickets: newTotalWickets,
      shotDirection: shotZone,
      tacticUsed: isUserBatting ? activeBatTactic : activeBowlTactic
    };

    // Update Batter Stats
    const updatedBatters = activeInn.battingScorecard.map(b => {
      if (b.name === striker) {
        const r = b.runs + runs;
        const bl = b.balls + 1;
        const f = isFour ? b.fours + 1 : b.fours;
        const s = isSix ? b.sixes + 1 : b.sixes;
        const sr = ((r / bl) * 100).toFixed(1);
        return {
          ...b,
          runs: r,
          balls: bl,
          fours: f,
          sixes: s,
          strikeRate: sr,
          dismissal: isWicket ? dismissal : b.dismissal
        };
      }
      return b;
    });

    // Update Bowler Stats
    const updatedBowlers = activeInn.bowlingFigures.map(bw => {
      if (bw.name === bowler.name) {
        const newR = bw.runs + runs;
        const newW = isWicket ? bw.wickets + 1 : bw.wickets;
        const currOversNum = parseFloat(bw.overs) || 0;
        const ballsBowled = Math.floor(currOversNum) * 6 + Math.round((currOversNum % 1) * 10) + 1;
        const fullOvers = Math.floor(ballsBowled / 6);
        const remBalls = ballsBowled % 6;
        const formattedOvers = `${fullOvers}.${remBalls}`;
        const econ = ballsBowled > 0 ? ((newR / ballsBowled) * 6).toFixed(2) : '0.00';
        return {
          ...bw,
          runs: newR,
          wickets: newW,
          overs: formattedOvers,
          economy: econ
        };
      }
      return bw;
    });

    const updatedFOW = [...activeInn.fallOfWickets];
    if (isWicket) {
      updatedFOW.push({
        wicket: newTotalWickets,
        score: newTotalRuns,
        player: striker,
        over: `${currentOver}.${ballInOver}`
      });
    }

    const updatedInnings: InningsState = {
      ...activeInn,
      totalRuns: newTotalRuns,
      totalWickets: newTotalWickets,
      oversPlayed: Math.min(20, Math.ceil((activeInn.balls.length + 1) / 6)),
      balls: [...activeInn.balls, newBall],
      battingScorecard: updatedBatters,
      bowlingFigures: updatedBowlers,
      fallOfWickets: updatedFOW
    };

    if (currentInnings === 1) {
      setInn1(updatedInnings);
    } else {
      setInn2(updatedInnings);
    }

    // Strike Rotation & Next Batter
    if (isWicket) {
      if (nextBatterIdx < currentBatSquad.length) {
        setStrikerIdx(nextBatterIdx);
        setNextBatterIdx(prev => prev + 1);
      }
    } else if (runs % 2 === 1) {
      const temp = strikerIdx;
      setStrikerIdx(nonStrikerIdx);
      setNonStrikerIdx(temp);
    }

    // End of Over
    if (ballInOver === 6) {
      // Switch strike at end of over
      const temp = strikerIdx;
      setStrikerIdx(nonStrikerIdx);
      setNonStrikerIdx(temp);
      // Next bowler
      setCurrentBowlerIdx(prev => (prev + 1) % activeBowlers.length);
    }

    // Check End of Innings / Match
    const isTargetChased = currentInnings === 2 && chaseTarget !== null && newTotalRuns >= chaseTarget;
    const isAllOut = newTotalWickets >= 10;
    const isOversFinished = currentOver === 19 && ballInOver === 6;

    if (isTargetChased || isAllOut || isOversFinished) {
      handleInningsTransition(updatedInnings);
    }
  };

  // Switch from 1st to 2nd Innings OR Complete Match
  const handleInningsTransition = (lastUpdatedInn?: InningsState) => {
    if (currentInnings === 1) {
      setCurrentInnings(2);
      setStrikerIdx(0);
      setNonStrikerIdx(1);
      setNextBatterIdx(2);
      setCurrentBowlerIdx(0);
      setIsPlaying(false);
      setEventBanner({
        text: '🏁 INNINGS BREAK',
        subtext: `Target: ${(lastUpdatedInn || inn1!).totalRuns + 1} runs in 20 overs`,
        color: 'from-amber-500 to-emerald-600'
      });
      setTimeout(() => setEventBanner(null), 2500);
    } else {
      finalizeMatch(lastUpdatedInn);
    }
  };

  // Finalize Match & Compute Winner / Margin / POTM
  const finalizeMatch = (finalInn2?: InningsState) => {
    setIsPlaying(false);
    setMatchDone(true);
    setActiveTab('scorecard');

    const fInn1 = inn1!;
    const fInn2 = finalInn2 || inn2!;

    let winnerTeam = myFranchise;
    let margin = '';
    const myTeamShort = myFranchise.short;

    let userWon = false;
    if (aBatsFirst) {
      if (fInn1.totalRuns > fInn2.totalRuns) {
        winnerTeam = myFranchise;
        margin = `${fInn1.totalRuns - fInn2.totalRuns} runs`;
        userWon = true;
      } else {
        winnerTeam = rivalFranchise;
        margin = `${10 - fInn2.totalWickets} wickets`;
        userWon = false;
      }
    } else {
      if (fInn2.totalRuns > fInn1.totalRuns) {
        winnerTeam = myFranchise;
        margin = `${10 - fInn2.totalWickets} wickets`;
        userWon = true;
      } else {
        winnerTeam = rivalFranchise;
        margin = `${fInn1.totalRuns - fInn2.totalRuns} runs`;
        userWon = false;
      }
    }

    // Determine POTM
    const allBatters = [...fInn1.battingScorecard, ...fInn2.battingScorecard];
    const topBatter = allBatters.sort((a, b) => b.runs - a.runs)[0];
    const potmData = {
      player: topBatter.name,
      team: winnerTeam.name,
      stats: `${topBatter.runs}* (${topBatter.balls}b, ${topBatter.fours}x4, ${topBatter.sixes}x6)`
    };
    setPotm(potmData);

    const summary: TournamentFixture['result'] = {
      winnerTeamId: winnerTeam.short.toLowerCase(),
      winnerName: winnerTeam.name,
      margin,
      teamARuns: fInn1.totalRuns,
      teamAWickets: fInn1.totalWickets,
      teamAOvers: fInn1.oversPlayed,
      teamBRuns: fInn2.totalRuns,
      teamBWickets: fInn2.totalWickets,
      teamBOvers: fInn2.oversPlayed,
      pomPlayer: potmData.player,
      pomStats: potmData.stats
    };

    setMatchResultSummary(summary);

    if (userWon) {
      gameAudio.playConfettiFanfare();
      triggerGameHaptic('heavy');
    } else {
      gameAudio.playTradeReject();
      triggerGameHaptic('medium');
    }
  };

  // Fast forward remaining balls of the over
  const handleSimulateOver = () => {
    for (let i = 0; i < 6; i++) {
      executeBall();
      if (matchDone) break;
    }
  };

  // Fast forward until match ends
  const handleInstantResult = () => {
    while (!matchDone) {
      executeBall();
      if (currentInnings === 2 && inn2 && inn1 && (inn2.totalRuns >= inn1.totalRuns + 1 || inn2.totalWickets >= 10 || inn2.balls.length >= 120)) {
        break;
      }
    }
    setActiveTab('scorecard');
  };

  if (!isOpen || !inn1 || !inn2) return null;

  const activeInnings = currentInnings === 1 ? inn1 : inn2;
  const lastBall = activeInnings.balls[activeInnings.balls.length - 1];

  // Target for 2nd innings
  const chaseTarget = inn1.totalRuns + 1;
  const runsNeeded = Math.max(0, chaseTarget - activeInnings.totalRuns);
  const ballsBowled = activeInnings.balls.length;
  const ballsRemaining = Math.max(0, 120 - ballsBowled);
  const reqRR = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0.00';
  const currRR = ballsBowled > 0 ? ((activeInnings.totalRuns / ballsBowled) * 6).toFixed(2) : '0.00';

  // Last 6 balls trail
  const currentOverTrail = activeInnings.balls.slice(-6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl text-white overflow-hidden select-none">
      <div className="relative w-full max-w-6xl bg-slate-950 border border-white/20 rounded-3xl flex flex-col h-[94vh] max-h-[860px] shadow-2xl overflow-hidden">
        
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
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              isUserBatting ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}>
              {isUserBatting ? '🏏 YOU ARE BATTING' : '🎯 YOU ARE BOWLING'}
            </span>
          </div>

          {/* Tab selector & Sound Toggle */}
          <div className="flex items-center gap-2">
            {/* Rival AI Strategy Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span className="font-bold">{rivalFranchise.short} AI:</span>
              <span className="text-gray-300">{rivalFranchise.short === 'CSK' ? 'Anchor & Spin Choke' : rivalFranchise.short === 'SRH' || rivalFranchise.short === 'MI' ? 'Powerplay Blitzkrieg' : rivalFranchise.short === 'RR' ? 'Moneyball Analytics' : 'Utility AI Matrix'}</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('arena')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'arena' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                Interactive Arena
              </button>
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'scorecard' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                Scorecard & POTM
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const next = gameAudio.toggleMute();
                setIsMuted(next);
                triggerGameHaptic('light');
                if (!next) gameAudio.playUiTap('select');
              }}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
              }`}
              title={isMuted ? 'Game Audio Muted (Click to Unmute)' : 'Game Audio Active (Click to Mute)'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="animate-pulse" />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Event Banner Overlay */}
        {eventBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
            <div className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${eventBanner.color} text-white font-black text-center shadow-2xl border border-white/40`}>
              <div className="text-lg sm:text-xl tracking-wider drop-shadow-md">{eventBanner.text}</div>
              <div className="text-xs font-sans text-white/90 drop-shadow">{eventBanner.subtext}</div>
            </div>
          </div>
        )}

        {/* Tab 1: Interactive Match Arena */}
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
                    <span>{activeInnings.totalRuns}/{activeInnings.totalWickets}</span>
                    <span className="text-xs sm:text-sm font-sans font-bold text-gray-400">
                      ({Math.floor(ballsBowled / 6)}.{ballsBowled % 6} / 20 ov)
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    CRR: {currRR}
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
                <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">Over Trail:</span>
                {currentOverTrail.map((b, i) => (
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

              {/* Top: Bowler & Non-Striker */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md max-w-[220px]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Non-Striker</div>
                  <div className="text-xs font-black text-white truncate">
                    {currentInnings === 1 ? bat1Squad[nonStrikerIdx]?.name : bowl1Squad[nonStrikerIdx]?.name}
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-rose-500/30 backdrop-blur-md text-right max-w-[220px]">
                  <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-end gap-1">
                    <Activity size={10} /> Bowler Bowling
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {currentInnings === 1 
                      ? (bowl1Squad.filter(p => p.role === 'BOWL' || p.role === 'AR')[currentBowlerIdx % 5]?.name || bowl1Squad[0]?.name)
                      : (bat1Squad.filter(p => p.role === 'BOWL' || p.role === 'AR')[currentBowlerIdx % 5]?.name || bat1Squad[0]?.name)}
                  </div>
                </div>
              </div>

              {/* Center 2D Action: Ball Physics & Trajectory Line */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                
                {lastBall && (
                  <div className="text-xs font-mono font-bold text-emerald-300 bg-slate-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40 backdrop-blur-md mb-3 text-center max-w-lg shadow-lg">
                    Ball {lastBall.over}.{lastBall.ball} • {lastBall.commentary}
                  </div>
                )}

                {/* Animated Cricket Ball */}
                <div className="relative flex items-center gap-10">
                  <div className="w-9 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                  
                  <div className={`w-4 h-4 rounded-full transition-transform duration-500 ${
                    isBallAnimating ? 'scale-150 rotate-180' : 'scale-100'
                  } ${
                    lastBall?.isWicket 
                      ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-ping' 
                      : lastBall?.isSix 
                      ? 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-pulse' 
                      : lastBall?.isFour 
                      ? 'bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)]' 
                      : 'bg-white shadow-md'
                  }`} />
                  
                  <div className="w-9 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                </div>

                {lastShotTraj && (
                  <div className="mt-2 text-[10px] font-mono text-gray-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    Shot Trajectory: <strong>{lastShotTraj.name}</strong>
                  </div>
                )}
              </div>

              {/* Bottom: Striker on Crease */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-amber-500/40 backdrop-blur-md max-w-[240px]">
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <Flame size={10} /> Striker Facing
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {currentInnings === 1 ? bat1Squad[strikerIdx]?.name : bowl1Squad[strikerIdx]?.name} *
                  </div>
                </div>

                <div className="text-right text-[10px] text-gray-300 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-white/10 font-mono">
                  Innings {currentInnings} of 2 • {activeInnings.teamName}
                </div>
              </div>
            </div>

            {/* ─── USER TACTICAL COMMAND DECK ─── */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shrink-0">
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Zap size={14} />
                  {isUserBatting ? 'Choose Batter Intent Before Shot:' : 'Choose Delivery Variation Before Bowl:'}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Ball-by-Ball Tactical Mode
                </span>
              </div>

              {/* Tactical Buttons */}
              {isUserBatting ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { id: 'DEFEND', label: '🛡️ Defend (Safe)', desc: 'Protect wicket, 0-1 run' },
                    { id: 'ROTATE', label: '⚖️ Rotate Strike', desc: 'Gap push, 1-2 runs' },
                    { id: 'ATTACK', label: '⚡ Lofted Attack', desc: 'Infield clear, 4s & 6s' },
                    { id: 'MAXIMUM', label: '💥 Super Six', desc: 'Helicopter, high risk' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setBattingTactic(t.id as BattingTactic)
                        gameAudio.playUiTap('select')
                        triggerGameHaptic('light')
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        battingTactic === t.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-[1.02]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <strong className="text-xs block font-bold">{t.label}</strong>
                      <span className="text-[10px] text-gray-400 leading-tight block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { id: 'YORKER', label: '🎯 Yorker (Stumps)', desc: 'Toe-crusher, death overs' },
                    { id: 'SLOWER', label: '🌀 Slower Cutter', desc: 'Deception, aerial catch' },
                    { id: 'BOUNCER', label: '⚡ Bouncer (Head)', desc: 'Short ball, top edges' },
                    { id: 'GOOD_LENGTH', label: '📐 Good Length', desc: 'Channel of uncertainty' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setBowlingTactic(t.id as BowlingTactic)
                        gameAudio.playUiTap('select')
                        triggerGameHaptic('light')
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        bowlingTactic === t.id
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md scale-[1.02]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <strong className="text-xs block font-bold">{t.label}</strong>
                      <span className="text-[10px] text-gray-400 leading-tight block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Execution Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => executeBall()}
                  disabled={matchDone}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Play size={16} className="fill-slate-950" />
                  <span>{isUserBatting ? `PLAY SHOT [${battingTactic}]` : `BOWL BALL [${bowlingTactic}]`}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateOver}
                    disabled={matchDone}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <FastForward size={14} />
                    <span>Simulate Over</span>
                  </button>

                  <button
                    onClick={handleInstantResult}
                    disabled={matchDone}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Instant Result</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Tab 2: Full Detailed Scorecard */
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            
            {/* Match Winner Summary Banner */}
            {potm && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xl">
                <div>
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                    MATCH RESULT & PRESENTATION
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
                    {matchResultSummary?.winnerName} Won by {matchResultSummary?.margin}!
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-white/15 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Trophy size={11} className="text-amber-400" /> Player of the Match
                  </div>
                  <strong className="text-sm font-black text-amber-300 block">{potm.player}</strong>
                  <span className="text-[11px] text-gray-400 font-mono">{potm.stats}</span>
                </div>
              </div>
            )}

            {/* Innings 1 Scorecard */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-md">
              <h4 className="text-sm font-black text-white flex items-center gap-2 pb-2 mb-3 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inn1.teamColor }} />
                1st Innings: {inn1.teamName} ({inn1.totalRuns}/{inn1.totalWickets} in {inn1.oversPlayed} ov)
              </h4>

              {/* Batting Table */}
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
                        <td className="py-1.5 text-right text-sky-300">{b.fours}</td>
                        <td className="py-1.5 text-right text-emerald-300">{b.sixes}</td>
                        <td className="py-1.5 text-right text-gray-400">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bowling Table */}
              <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Bowling Figures ({inn2.teamShort})</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-1">Bowler</th>
                      <th className="py-1 text-right">O</th>
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
            <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-md">
              <h4 className="text-sm font-black text-white flex items-center gap-2 pb-2 mb-3 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inn2.teamColor }} />
                2nd Innings: {inn2.teamName} ({inn2.totalRuns}/{inn2.totalWickets} in {inn2.oversPlayed} ov)
              </h4>

              {/* Batting Table */}
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
                        <td className="py-1.5 text-right text-sky-300">{b.fours}</td>
                        <td className="py-1.5 text-right text-emerald-300">{b.sixes}</td>
                        <td className="py-1.5 text-right text-gray-400">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bowling Table */}
              <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Bowling Figures ({inn1.teamShort})</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-1">Bowler</th>
                      <th className="py-1 text-right">O</th>
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
                        <td className="py-1.5 text-right text-rose-300">{bw.runs}</td>
                        <td className="py-1.5 text-right font-black text-emerald-400">{bw.wickets}</td>
                        <td className="py-1.5 text-right text-gray-400">{bw.economy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions: Record Result to IPL Points Table */}
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
