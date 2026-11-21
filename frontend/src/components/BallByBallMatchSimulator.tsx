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
  VolumeX,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Users,
  Info,
  AlertCircle
} from 'lucide-react';
import { FranchiseData } from '../data/franchises';
import { TournamentFixture, MatchScorecard } from '../data/scheduleGenerator';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';
import { getFranchiseAI } from '../data/franchiseAI';
import TeamLogo from './TeamLogo';
import { lockOrientation } from '../lib/orientationManager';
import { formatPlayerInitial } from '../lib/nameFormatter';
import { useCampaignStore } from '../store/useCampaignStore';
import { getDetailedPlayerRole, isPlayerSpinner } from '../lib/bowlerClassification';

interface BallByBallMatchSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  myFranchise: FranchiseData;
  mySquad: any[];
  userPlayingXIObjects?: any[];
  myPlayingXIIds?: string[];
  userBatFirstXI?: string[];
  userBowlFirstXI?: string[];
  batFirstImpactId?: string;
  bowlFirstImpactId?: string;
  rivalFranchise: FranchiseData;
  venueName: string;
  matchFixture?: TournamentFixture;
  onMatchComplete?: (result: TournamentFixture['result']) => void;
}

export type BattingTactic = 'DEFEND' | 'ROTATE' | 'ATTACK' | 'MAXIMUM' | '0' | '1' | '2' | '3' | '4' | '6' | 'DEFEND_OVER' | 'NORMAL_OVER' | 'ATTACK_OVER';
export type BowlingTactic = 'YORKER' | 'SLOWER' | 'BOUNCER' | 'GOOD_LENGTH' | 'DEFEND' | 'NORMAL' | 'ATTACK';

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

export interface DynamicFielder {
  name: string;
  x: string;
  y: string;
  isDeep: boolean;
}

export function getDynamicFieldPositions(
  ballsBowled: number,
  isSpinner: boolean,
  bowlingTactic: BowlingTactic,
  isLeftHanded: boolean,
  battingTactic: BattingTactic
): { fielders: DynamicFielder[]; strategyLabel: string; deepCount: number } {
  const over = Math.floor(ballsBowled / 6) + 1; // 1 to 20
  const isPowerplay = over <= 6; // Overs 1 - 6: Max 2 fielders outside 30-yd circle
  const isMiddleOvers = over >= 7 && over <= 15; // Overs 7 - 15: Max 4 outside

  let rawFielders: Array<{ name: string; x: number; y: number; isDeep: boolean }> = [];
  let strategyLabel = '';

  if (isPowerplay) {
    if (isSpinner) {
      strategyLabel = 'POWERPLAY (2 DEEP • SPIN TRAP)';
      rawFielders = [
        { name: 'Slip', x: 38, y: 72, isDeep: false },
        { name: 'Short Extra Cover', x: 26, y: 55, isDeep: false },
        { name: 'Cover Point', x: 18, y: 64, isDeep: false },
        { name: 'Mid-Off', x: 38, y: 35, isDeep: false },
        { name: 'Mid-On', x: 62, y: 35, isDeep: false },
        { name: 'Short Mid-Wicket', x: 74, y: 55, isDeep: false },
        { name: 'Short Fine', x: 68, y: 76, isDeep: false },
        // 2 Outside
        { name: 'Deep Cover', x: 14, y: 44, isDeep: true },
        { name: 'Deep Mid-Wicket', x: 84, y: 44, isDeep: true },
      ];
    } else {
      // Pace in Powerplay
      strategyLabel = 'POWERPLAY (2 DEEP • ATTACKING SLIPS)';
      rawFielders = [
        { name: '1st Slip', x: 37, y: 74, isDeep: false },
        { name: 'Gully', x: 30, y: 68, isDeep: false },
        { name: 'Cover Point', x: 20, y: 58, isDeep: false },
        { name: 'Extra Cover', x: 28, y: 46, isDeep: false },
        { name: 'Mid-Off', x: 38, y: 34, isDeep: false },
        { name: 'Mid-On', x: 62, y: 34, isDeep: false },
        { name: 'Square Leg', x: 76, y: 60, isDeep: false },
        // 2 Outside
        { name: 'Third Man', x: 18, y: 80, isDeep: true },
        { name: 'Deep Fine Leg', x: 82, y: 80, isDeep: true },
      ];
    }
  } else if (isMiddleOvers) {
    if (isSpinner) {
      strategyLabel = 'MIDDLE OVERS (4 DEEP • SPIN CHOKE)';
      rawFielders = [
        { name: 'Short Third', x: 32, y: 72, isDeep: false },
        { name: 'Cover', x: 25, y: 52, isDeep: false },
        { name: 'Mid-Off', x: 38, y: 36, isDeep: false },
        { name: 'Short Mid-Wicket', x: 70, y: 54, isDeep: false },
        { name: 'Square Leg', x: 76, y: 64, isDeep: false },
        // 4 Outside
        { name: 'Deep Extra Cover', x: 16, y: 42, isDeep: true },
        { name: 'Long-Off', x: 28, y: 15, isDeep: true },
        { name: 'Long-On', x: 72, y: 15, isDeep: true },
        { name: 'Deep Mid-Wicket', x: 84, y: 45, isDeep: true },
      ];
    } else {
      // Pace in Middle Overs
      strategyLabel = 'MIDDLE OVERS (4 DEEP • RING PRESSURE)';
      rawFielders = [
        { name: 'Point', x: 22, y: 60, isDeep: false },
        { name: 'Cover', x: 28, y: 48, isDeep: false },
        { name: 'Mid-On', x: 62, y: 36, isDeep: false },
        { name: 'Short Mid-Wicket', x: 72, y: 56, isDeep: false },
        { name: 'Short Fine', x: 68, y: 74, isDeep: false },
        // 4 Outside
        { name: 'Third Man', x: 18, y: 82, isDeep: true },
        { name: 'Deep Point', x: 12, y: 52, isDeep: true },
        { name: 'Long-Off', x: 28, y: 14, isDeep: true },
        { name: 'Deep Mid-Wicket', x: 82, y: 42, isDeep: true },
      ];
    }
  } else {
    // Death Overs (Overs 16 - 20) with 5 Deep Fielders
    if (bowlingTactic === 'YORKER') {
      strategyLabel = 'DEATH (5 DEEP • YORKER ROPES)';
      rawFielders = [
        { name: 'Extra Cover', x: 26, y: 48, isDeep: false },
        { name: 'Point', x: 22, y: 62, isDeep: false },
        { name: 'Mid-Wicket', x: 72, y: 54, isDeep: false },
        { name: 'Short Fine', x: 68, y: 74, isDeep: false },
        // 5 Outside guarding ropes
        { name: 'Third Man', x: 16, y: 84, isDeep: true },
        { name: 'Long-Off', x: 26, y: 12, isDeep: true },
        { name: 'Long-On', x: 74, y: 12, isDeep: true },
        { name: 'Deep Mid-Wicket', x: 85, y: 40, isDeep: true },
        { name: 'Deep Square Leg', x: 85, y: 68, isDeep: true },
      ];
    } else if (bowlingTactic === 'BOUNCER') {
      strategyLabel = 'DEATH (5 DEEP • HOOK / PULL TRAP)';
      rawFielders = [
        { name: 'Point', x: 22, y: 62, isDeep: false },
        { name: 'Cover', x: 28, y: 48, isDeep: false },
        { name: 'Mid-Off', x: 38, y: 36, isDeep: false },
        { name: 'Short Leg', x: 64, y: 68, isDeep: false },
        // 5 Outside (Leg-side heavy)
        { name: 'Fine Leg Rope', x: 82, y: 84, isDeep: true },
        { name: 'Deep Square Leg', x: 88, y: 62, isDeep: true },
        { name: 'Deep Mid-Wicket', x: 84, y: 40, isDeep: true },
        { name: 'Long-On', x: 72, y: 12, isDeep: true },
        { name: 'Third Man', x: 18, y: 82, isDeep: true },
      ];
    } else {
      // Slower / Good length death defense
      strategyLabel = 'DEATH (5 DEEP • BOUNDARY PATROL)';
      rawFielders = [
        { name: 'Cover', x: 26, y: 50, isDeep: false },
        { name: 'Mid-Off', x: 38, y: 36, isDeep: false },
        { name: 'Mid-Wicket', x: 72, y: 54, isDeep: false },
        { name: 'Short Fine', x: 68, y: 74, isDeep: false },
        // 5 Outside
        { name: 'Deep Backward Point', x: 12, y: 64, isDeep: true },
        { name: 'Deep Extra Cover', x: 14, y: 38, isDeep: true },
        { name: 'Long-Off', x: 26, y: 12, isDeep: true },
        { name: 'Long-On', x: 74, y: 12, isDeep: true },
        { name: 'Deep Mid-Wicket', x: 86, y: 45, isDeep: true },
      ];
    }
  }

  // Adjust for Left-Handed batter by mirroring X axis (100 - x)
  const adjustedFielders: DynamicFielder[] = rawFielders.map((f) => {
    let finalX = f.x;
    let finalName = f.name;

    if (isLeftHanded) {
      finalX = 100 - f.x;
      if (finalName.includes('Cover') || finalName.includes('Point') || finalName.includes('Third Man')) {
        finalName = finalName.replace('Cover', 'Mid-Wicket').replace('Point', 'Square Leg').replace('Third Man', 'Fine Leg');
      } else if (finalName.includes('Mid-Wicket') || finalName.includes('Square Leg') || finalName.includes('Fine Leg')) {
        finalName = finalName.replace('Mid-Wicket', 'Cover').replace('Square Leg', 'Point').replace('Fine Leg', 'Third Man');
      }
    }

    let finalY = f.y;
    if (battingTactic === 'MAXIMUM' && !f.isDeep) {
      finalY = Math.max(12, f.y - 3);
    } else if (battingTactic === 'DEFEND' && !f.isDeep) {
      finalY = Math.min(80, f.y + 3);
    }

    return {
      name: finalName,
      x: `${finalX}%`,
      y: `${finalY}%`,
      isDeep: f.isDeep
    };
  });

  const deepCount = adjustedFielders.filter(f => f.isDeep).length;
  return { fielders: adjustedFielders, strategyLabel, deepCount };
}

export default function BallByBallMatchSimulator({
  isOpen,
  onClose,
  myFranchise,
  mySquad,
  userPlayingXIObjects,
  myPlayingXIIds,
  userBatFirstXI,
  userBowlFirstXI,
  batFirstImpactId,
  bowlFirstImpactId,
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
  const [lastBowlerIdx, setLastBowlerIdx] = useState<number | null>(null);

  // Tactical management modal states
  const [openingBowler1Idx, setOpeningBowler1Idx] = useState(0);
  const [openingBowler2Idx, setOpeningBowler2Idx] = useState(1);
  const [openingBowlersConfirmed, setOpeningBowlersConfirmed] = useState(false);
  const [openingBattersConfirmed, setOpeningBattersConfirmed] = useState(false);
  const [showOpeningBowlersModal, setShowOpeningBowlersModal] = useState(false);
  const [showNextBatterModal, setShowNextBatterModal] = useState(false);
  const [dismissedBatterSlot, setDismissedBatterSlot] = useState<'striker' | 'nonStriker'>('striker');
  const [dismissedBatterName, setDismissedBatterName] = useState<string>('');

  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBattingOrderModal, setShowBattingOrderModal] = useState(false);
  const [showOpeningPairModal, setShowOpeningPairModal] = useState(false);
  const [showPastOversModal, setShowPastOversModal] = useState(false);
  const [expandedHUDCard, setExpandedHUDCard] = useState<'batter' | 'bowler' | null>(null);
  const [scorecardInningsView, setScorecardInningsView] = useState<1 | 2>(1);

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

  // Maintain Portrait Screen Orientation for ergonomic mobile gameplay
  useEffect(() => {
    lockOrientation('portrait');
    return () => {
      lockOrientation('portrait');
    };
  }, [isOpen]);

  // Squads
  const [bat1Squad, setBat1Squad] = useState<any[]>([]);
  const [bowl1Squad, setBowl1Squad] = useState<any[]>([]);
  const [aBatsFirst, setABatsFirst] = useState(true);

  // Toss Ceremony State
  const [tossPhase, setTossPhase] = useState<'ceremony' | 'arena'>('ceremony');
  const [userCoinCall, setUserCoinCall] = useState<'heads' | 'tails'>('heads');
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [tossWinner, setTossWinner] = useState<'user' | 'rival' | null>(null);
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | null>(null);
  const [tossSummaryText, setTossSummaryText] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const matchInitializedKeyRef = useRef<string | null>(null);
  const currentMatchKey = matchFixture 
    ? `m_${matchFixture.matchNo}_${matchFixture.teamAId}_vs_${matchFixture.teamBId}` 
    : `${myFranchise.short}_vs_${rivalFranchise.short}`;

  // Calibrate authentic T20 batting order: Openers -> Anchor -> Middle Finishers -> All-rounders -> Frontline Bowlers
  const calibrateT20BattingOrder = (squad: any[]): any[] => {
    if (!squad || squad.length === 0) return [];
    const openers: any[] = [];
    const topOrder: any[] = [];
    const middleOrder: any[] = [];
    const allRounders: any[] = [];
    const frontlineBowlers: any[] = [];

    const knownOpeners = [
      'Head', 'Kohli', 'Rohit', 'Jaiswal', 'Gill', 'Gaikwad', 'Salt', 'Buttler',
      'Abhishek', 'Rahul', 'de Kock', 'Faf', 'Conway', 'Ishan', 'Prabhsimran', 'Warner', 'Dhawan'
    ];

    squad.forEach(player => {
      const name = player.name || '';
      const role = player.role || '';
      const isKnownOpener = knownOpeners.some(k => name.includes(k));

      if (isKnownOpener || (role === 'BAT' && openers.length < 2)) {
        openers.push(player);
      } else if (role === 'BAT' || role === 'WK') {
        if (topOrder.length < 2) topOrder.push(player);
        else middleOrder.push(player);
      } else if (role === 'AR') {
        allRounders.push(player);
      } else {
        frontlineBowlers.push(player);
      }
    });

    const ordered = [
      ...openers,
      ...topOrder,
      ...middleOrder,
      ...allRounders,
      ...frontlineBowlers
    ];

    squad.forEach(p => {
      if (!ordered.some(op => op.name === p.name || (op.player_id && op.player_id === p.player_id))) {
        ordered.push(p);
      }
    });

    return ordered;
  };

  const setupMatchTeams = (userBatsFirst: boolean) => {
    setABatsFirst(userBatsFirst);
    const chosenUserIds = userBatsFirst
      ? (userBatFirstXI && userBatFirstXI.length >= 11 ? userBatFirstXI : (myPlayingXIIds || []))
      : (userBowlFirstXI && userBowlFirstXI.length >= 11 ? userBowlFirstXI : (myPlayingXIIds || []));

    let userXI: any[] = [];
    if (userPlayingXIObjects && userPlayingXIObjects.length >= 11) {
      userXI = [...userPlayingXIObjects.slice(0, 11)];
    } else if (chosenUserIds.length >= 11) {
      userXI = chosenUserIds.map(id => mySquad.find(p => p.player_id === id)).filter(Boolean);
    }
    if (userXI.length < 11) {
      userXI = (mySquad.length >= 11 ? mySquad : calibrateT20BattingOrder(mySquad)).slice(0, 11);
    }

    // Opponent team always follows authentic broadcast T20 order
    const rawRivalXI = (rivalFranchise.squad2026 || []).slice(0, 11);
    const rivalXI = calibrateT20BattingOrder(rawRivalXI).slice(0, 11);

    const firstBatTeam = userBatsFirst ? myFranchise : rivalFranchise;
    const firstBowlTeam = userBatsFirst ? rivalFranchise : myFranchise;
    const firstBatSquad = userBatsFirst ? userXI : rivalXI;
    const firstBowlSquad = userBatsFirst ? rivalXI : userXI;

    setBat1Squad(firstBatSquad);
    setBowl1Squad(firstBowlSquad);

    const initInn1: InningsState = {
      teamName: firstBatTeam.short,
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
      bowlingFigures: firstBowlSquad.slice(0, 11).map(b => ({
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

    const initInn2: InningsState = {
      teamName: firstBowlTeam.short,
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
      bowlingFigures: firstBatSquad.slice(0, 11).map(b => ({
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
  };

  const persistMatchState = (overrides?: Partial<any>) => {
    if (!matchFixture) return;
    try {
      const stateToSave = {
        fixtureMatchNo: matchFixture.matchNo,
        matchKey: currentMatchKey,
        tossPhase,
        userCoinCall,
        coinResult,
        tossWinner,
        tossDecision,
        tossSummaryText,
        aBatsFirst,
        bat1Squad,
        bowl1Squad,
        currentInnings,
        inn1,
        inn2,
        strikerIdx,
        nonStrikerIdx,
        nextBatterIdx,
        currentBowlerIdx,
        battingTactic,
        bowlingTactic,
        matchDone,
        matchResultSummary,
        potm,
        lastSavedTime: Date.now(),
        ...overrides
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('auctionxi_active_match_simulation', JSON.stringify(stateToSave));
      }
      useCampaignStore.getState().saveActiveMatchSimulation?.(stateToSave);
    } catch (e) {
      console.warn('Failed to persist match state:', e);
    }
  };

  const [resumedBanner, setResumedBanner] = useState<string | null>(null);

  // Initialize Match Setup on Open (with Match Resumption Support)
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (matchInitializedKeyRef.current === currentMatchKey && inn1) {
      return;
    }

    // Check if there is an in-progress saved match to resume
    let savedSim: any = useCampaignStore.getState().getActiveCampaign()?.activeMatchSimulation;
    if (!savedSim && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('auctionxi_active_match_simulation');
        if (raw) savedSim = JSON.parse(raw);
      } catch (e) {}
    }

    if (savedSim && savedSim.matchKey === currentMatchKey && !savedSim.matchDone && savedSim.inn1) {
      const savedTeams = [savedSim.inn1?.teamShort?.toLowerCase(), savedSim.inn2?.teamShort?.toLowerCase()].filter(Boolean);
      const currentTeams = [myFranchise.short.toLowerCase(), rivalFranchise.short.toLowerCase()];
      const teamsMatch = currentTeams.every(t => savedTeams.includes(t));
      if (teamsMatch) {
        matchInitializedKeyRef.current = currentMatchKey;
        if (savedSim.inn1?.teamShort) {
          setABatsFirst(savedSim.inn1.teamShort.toLowerCase() === myFranchise.short.toLowerCase());
        } else {
          setABatsFirst(savedSim.aBatsFirst ?? true);
        }
        if (savedSim.bat1Squad?.length) setBat1Squad(savedSim.bat1Squad);
        if (savedSim.bowl1Squad?.length) setBowl1Squad(savedSim.bowl1Squad);
        setInn1(savedSim.inn1);
        setInn2(savedSim.inn2);
        setCurrentInnings(savedSim.currentInnings || 1);
        setStrikerIdx(savedSim.strikerIdx || 0);
        setNonStrikerIdx(savedSim.nonStrikerIdx || 1);
        setNextBatterIdx(savedSim.nextBatterIdx || 2);
        setCurrentBowlerIdx(savedSim.currentBowlerIdx || 0);
        setBattingTactic(savedSim.battingTactic || 'ROTATE');
        setBowlingTactic(savedSim.bowlingTactic || 'GOOD_LENGTH');
        setTossPhase(savedSim.tossPhase || 'arena');
        setTossSummaryText(savedSim.tossSummaryText || '');
        setUserCoinCall(savedSim.userCoinCall || 'heads');
        setCoinResult(savedSim.coinResult || null);
        setTossWinner(savedSim.tossWinner || null);
        setTossDecision(savedSim.tossDecision || null);
        setMatchDone(false);
        setIsPlaying(false);

        const activeInn = (savedSim.currentInnings === 2 ? savedSim.inn2 : savedSim.inn1) || savedSim.inn1;
        const bCount = activeInn?.balls?.length || 0;
        setResumedBanner(`⚡ Resumed Match: Over ${Math.floor(bCount / 6)}.${bCount % 6} (${activeInn?.totalRuns || 0}/${activeInn?.totalWickets || 0})`);
        setTimeout(() => setResumedBanner(null), 4000);
        return;
      }
    }

    matchInitializedKeyRef.current = currentMatchKey;

    // Default fresh match setup
    setupMatchTeams(true);
  }, [isOpen, currentMatchKey]);

  const handleSpinCoin = () => {
    if (isFlippingCoin) return;
    gameAudio.unlockAudio();
    setIsFlippingCoin(true);
    gameAudio.playCoinFlip();
    triggerGameHaptic('medium');

    setTimeout(() => {
      gameAudio.playCoinClink();
      const outcome: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';
      setCoinResult(outcome);
      setIsFlippingCoin(false);

      const userWon = userCoinCall === outcome;
      if (userWon) {
        setTossWinner('user');
        gameAudio.playConfettiFanfare();
        triggerGameHaptic('heavy');
      } else {
        setTossWinner('rival');
        // AI Decides based on venue
        const favorsChase = venueName.toLowerCase().includes('mumbai') || 
                             venueName.toLowerCase().includes('wankhede') || 
                             venueName.toLowerCase().includes('bengaluru') || 
                             venueName.toLowerCase().includes('kolkata');
        const aiDecision: 'bat' | 'bowl' = favorsChase ? 'bowl' : 'bat';
        setTossDecision(aiDecision);
        gameAudio.playTradeReject();
        triggerGameHaptic('light');
      }
    }, 1100);
  };

  const handleApplyTossDecision = (electedToBat: boolean, summary: string) => {
    setupMatchTeams(electedToBat);
    setTossSummaryText(summary);
    setTossPhase('arena');
    gameAudio.playUiTap('select');
    triggerGameHaptic('light');
    persistMatchState({
      tossPhase: 'arena',
      tossSummaryText: summary,
      aBatsFirst: electedToBat
    });
  };

  const handleQuickTossSkip = () => {
    const userBatsFirst = Math.random() > 0.5;
    setupMatchTeams(userBatsFirst);
    const summary = userBatsFirst
      ? `${myFranchise.short} won toss, elected to bat`
      : `${rivalFranchise.short} won toss, elected to bat`;
    setTossSummaryText(summary);
    setTossPhase('arena');
    persistMatchState({
      tossPhase: 'arena',
      tossSummaryText: summary,
      aBatsFirst: userBatsFirst
    });
  };

  // Is User's Team currently batting or bowling?
  // Strictly derived from whether the active batting team is myFranchise
  const activeInningsForRole = currentInnings === 1 ? inn1 : inn2;
  const isUserBatting = Boolean(
    activeInningsForRole?.teamShort
      ? activeInningsForRole.teamShort.toLowerCase() === myFranchise.short.toLowerCase()
      : (currentInnings === 1 ? aBatsFirst : !aBatsFirst)
  );
  const isUserBowling = !isUserBatting;

  const getBowlerOversCount = (figures: Array<{ name: string; overs: string }>, bowlerName: string): number => {
    const fig = figures.find(f => f.name === bowlerName);
    if (!fig) return 0;
    const num = parseFloat(fig.overs) || 0;
    return Math.floor(num);
  };

  // Trigger opening bowler selection at start of bowling innings (Overs 1 & 2)
  useEffect(() => {
    if (tossPhase === 'arena' && isUserBowling && !openingBowlersConfirmed && !matchDone) {
      const activeInn = currentInnings === 1 ? inn1 : inn2;
      const balls = activeInn?.balls?.length || 0;
      if (balls === 0) {
        setShowOpeningBowlersModal(true);
      }
    }
  }, [tossPhase, isUserBowling, openingBowlersConfirmed, currentInnings, inn1, inn2, matchDone]);

  // Trigger opening batter selection at start of batting innings (Striker & Non-Striker)
  useEffect(() => {
    if (tossPhase === 'arena' && isUserBatting && !openingBattersConfirmed && !matchDone) {
      const activeInn = currentInnings === 1 ? inn1 : inn2;
      const balls = activeInn?.balls?.length || 0;
      if (balls === 0) {
        setShowOpeningPairModal(true);
      }
    }
  }, [tossPhase, isUserBatting, openingBattersConfirmed, currentInnings, inn1, inn2, matchDone]);

  const canBowlerBowl = (bIdx: number): { allowed: boolean; reason?: string } => {
    const bSquad = currentInnings === 1 ? bowl1Squad : bat1Squad;
    const candidate = bSquad[bIdx];
    if (!candidate) return { allowed: false, reason: 'Invalid bowler' };

    const curInn = currentInnings === 1 ? inn1 : inn2;
    if (!curInn) return { allowed: false, reason: 'Match not initialized' };

    // Strict Cricket Rule: Bowler cannot bowl 2 consecutive overs back-to-back
    if (lastBowlerIdx !== null && bIdx === lastBowlerIdx) {
      return { 
        allowed: false, 
        reason: `${candidate.name} bowled the over that just finished. In cricket, consecutive overs are not permitted!` 
      };
    }

    const oversCount = getBowlerOversCount(curInn.bowlingFigures, candidate.name);
    if (oversCount >= 4) {
      return { allowed: false, reason: `${candidate.name} has completed their maximum quota of 4 overs!` };
    }

    return { allowed: true };
  };

  const handleSelectBowler = (bIdx: number) => {
    const check = canBowlerBowl(bIdx);
    if (!check.allowed) {
      gameAudio.playTradeReject();
      triggerGameHaptic('trade_reject');
      alert(check.reason);
      return;
    }
    setCurrentBowlerIdx(bIdx);
    setShowBowlerModal(false);
    gameAudio.playUiTap('select');
    triggerGameHaptic('light');
  };

  const handlePromoteBatter = (squadIdx: number) => {
    if (squadIdx <= nextBatterIdx) return;
    swapBatters(squadIdx, squadIdx - 1);
  };

  const handleDemoteBatter = (squadIdx: number) => {
    const curBatSquad = currentInnings === 1 ? bat1Squad : bowl1Squad;
    if (squadIdx >= curBatSquad.length - 1) return;
    swapBatters(squadIdx, squadIdx + 1);
  };

  const swapBatters = (idxA: number, idxB: number) => {
    if (currentInnings === 1) {
      const nextSquad = [...bat1Squad];
      const temp = nextSquad[idxA];
      nextSquad[idxA] = nextSquad[idxB];
      nextSquad[idxB] = temp;
      setBat1Squad(nextSquad);
    } else {
      const nextSquad = [...bowl1Squad];
      const temp = nextSquad[idxA];
      nextSquad[idxA] = nextSquad[idxB];
      nextSquad[idxB] = temp;
      setBowl1Squad(nextSquad);
    }
    gameAudio.playUiTap('select');
    triggerGameHaptic('light');
  };

  // ─── TACTICAL BALL EXECUTION ENGINE ───
  const executeBall = (customTactic?: BattingTactic | BowlingTactic) => {
    if (matchDone || !inn1 || !inn2) return;

    // Immediately unlock audio context upon user gesture
    gameAudio.unlockAudio();

    // Immediately clear any existing banner to avoid stale overlay mismatches
    setEventBanner(null);

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
    
    // Rotate bowlers across all eligible options
    const activeBowlers = currentBowlSquad.filter(p => p.role === 'BOWL' || p.role === 'AR');
    const bowler = activeBowlers[currentBowlerIdx % (activeBowlers.length || 1)] || currentBowlSquad[0];

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

    // BATTING TACTIC LOGIC (0, 1, 2, 3, 4, 6 or Over intents)
    if (activeBatTactic === '0' || activeBatTactic === 'DEFEND' || activeBatTactic === 'DEFEND_OVER') {
      if (rand < 0.015) {
        isWicket = true;
      } else if (rand < 0.93) {
        runs = 0;
        commentary = `Solid defensive block right into the turf. Dot ball.`;
      } else {
        runs = 1;
        commentary = `Soft hands tap into mid-wicket, scampered through for a sensible single.`;
      }
    } else if (activeBatTactic === '1' || activeBatTactic === 'ROTATE' || activeBatTactic === 'NORMAL_OVER') {
      if (rand < 0.035) {
        isWicket = true;
      } else if (rand < 0.18) {
        runs = 0;
        commentary = `Defended towards point, fielder closes in sharply.`;
      } else if (rand < 0.88) {
        runs = 1;
        commentary = `Worked smoothly off the hips into square leg for an easy single.`;
      } else if (rand < 0.96) {
        runs = 2;
        commentary = `Steered fine of third man, hurried back for a sharp couple!`;
      } else {
        runs = 4;
        isFour = true;
        commentary = `FOUR! Beautifully timed push pierces the gap and reaches the rope!`;
      }
    } else if (activeBatTactic === '2') {
      if (rand < 0.06) {
        isWicket = true;
      } else if (rand < 0.16) {
        runs = 0;
        commentary = `Pushed firmly to cover, turned down for the second.`;
      } else if (rand < 0.38) {
        runs = 1;
        commentary = `Sweeper cuts off the boundary, held to a single.`;
      } else {
        runs = 2;
        commentary = `⚡ Pierced into the deep sweeper gap, electric sprint back for two!`;
      }
    } else if (activeBatTactic === '3') {
      if (rand < 0.09) {
        isWicket = true;
      } else if (rand < 0.20) {
        runs = 1;
        commentary = `Tapped into the outfield, single taken.`;
      } else if (rand < 0.55) {
        runs = 2;
        commentary = `Deep fielder slides to save the three, held to a double.`;
      } else if (rand < 0.94) {
        runs = 3;
        commentary = `🏃 Superb placement into the deep boundary pocket, hard running yields three!`;
      } else {
        runs = 4;
        isFour = true;
        commentary = `FOUR! Boundary beats the slide right on the cushion!`;
      }
    } else if (activeBatTactic === '4' || activeBatTactic === 'ATTACK') {
      // 4 intent: Piercing drive, high reward with edge/dismissal risk
      if (rand < 0.14) {
        isWicket = true;
      } else if (rand < 0.26) {
        runs = 0;
        commentary = `Driven hard on the up, but straight to extra cover. Dot ball.`;
      } else if (rand < 0.44) {
        runs = 1;
        commentary = `Lofted towards long-off on the bounce, single.`;
      } else if (rand < 0.50) {
        runs = 2;
        commentary = `Slashed past point, deep sweeper saves the boundary, two taken.`;
      } else if (rand < 0.92) {
        runs = 4;
        isFour = true;
        commentary = `⚡ CRACKING 4! Pierces extra cover with blistering timing to the fence!`;
      } else {
        runs = 6;
        isSix = true;
        commentary = `🚀 SIX! Clears the infield and carries all the way over long-off!`;
      }
    } else {
      // 6 intent: MAXIMUM carnage, high risk of getting caught in deep / bowled
      if (rand < 0.22) {
        isWicket = true;
      } else if (rand < 0.32) {
        runs = 0;
        commentary = `Huge swing across the line, beaten completely by change of pace!`;
      } else if (rand < 0.46) {
        runs = 1;
        commentary = `Mistimed skier falls harmlessly in vacant outfield, single taken.`;
      } else if (rand < 0.54) {
        runs = 2;
        commentary = `Lofted high towards deep mid-wicket, fielder intercepts on the bounce.`;
      } else if (rand < 0.70) {
        runs = 4;
        isFour = true;
        commentary = `⚡ FOUR! One bounce into the LED boundary advertising boards!`;
      } else {
        runs = 6;
        isSix = true;
        commentary = `🚀 MONSTER MAXIMUM! Dispatched 104m into the second tier! Unreal power!`;
      }
    }

    // Adjust for BOWLING TACTIC
    if (activeBowlTactic === 'DEFEND') {
      if (isWicket) {
        dismissal = `b ${bowler.name}`;
        commentary = `🔥 CLEAN BOWLED! Defensive off-cutter deceives the swing and crashes into off stump!`;
      }
    } else if (activeBowlTactic === 'ATTACK' || activeBowlTactic === 'BOUNCER') {
      if (isWicket) {
        const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)].name;
        dismissal = `c ${fielder} b ${bowler.name}`;
        commentary = `🎯 TOP EDGE! Hurried by a fiery 145km/h bouncer, skied high and held by ${fielder}!`;
      }
    } else if (activeBowlTactic === 'YORKER') {
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
    } else {
      // NORMAL / GOOD_LENGTH
      if (isWicket) {
        const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)]?.name || 'Keeper';
        dismissal = `c ${fielder} b ${bowler.name}`;
        commentary = `🎯 EDGED & TAKEN! Probing corridor delivery takes the outside nick to ${fielder}!`;
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
      gameAudio.playBoundaryHorn();
      triggerGameHaptic('six');
      setEventBanner({
        text: '🚀 MAXIMUM! 6 RUNS!',
        subtext: `${striker} hammers ${bowler.name} into the crowd!`,
        color: 'from-amber-500 to-yellow-600'
      });
      setTimeout(() => setEventBanner(null), 1400);
    } else if (isFour) {
      gameAudio.playWillowCrack('four');
      gameAudio.playCrowdRoar('boundary');
      gameAudio.playBoundaryHorn();
      triggerGameHaptic('four');
      setEventBanner({
        text: '⚡ CRACKING 4! BOUNDARY!',
        subtext: `${striker} pierces ${shotZone.name} to the rope!`,
        color: 'from-sky-500 to-blue-600'
      });
      setTimeout(() => setEventBanner(null), 1200);
    } else if (isWicket) {
      gameAudio.playAppealHowzat();
      gameAudio.playStumpShatter();
      gameAudio.playCrowdRoar('wicket');
      triggerGameHaptic('wicket');
      setEventBanner({
        text: '🎯 WICKET! OUT!',
        subtext: `${striker} ${dismissal}!`,
        color: 'from-rose-600 to-red-700'
      });
      setTimeout(() => setEventBanner(null), 1600);
    } else if (runs === 2) {
      gameAudio.playWillowCrack('single');
      gameAudio.playCrowdRoar('cheer');
      triggerGameHaptic('light');
      setEventBanner({
        text: '⚡ 2 RUNS! Sharp Double!',
        subtext: `${striker} & ${nonStriker} hurry back for a quick couple!`,
        color: 'from-emerald-500 to-teal-600'
      });
      setTimeout(() => setEventBanner(null), 1000);
    } else if (runs === 1) {
      gameAudio.playWillowCrack('single');
      triggerGameHaptic('light');
      setEventBanner({
        text: '✓ 1 RUN • Strike Rotated',
        subtext: `${striker} works it into ${shotZone.name} for a single`,
        color: 'from-slate-700 to-slate-800'
      });
      setTimeout(() => setEventBanner(null), 800);
    } else {
      gameAudio.playWillowCrack('dot');
      gameAudio.playBallWhoosh();
      gameAudio.playCrowdGasp();
      setEventBanner({
        text: '🛑 DOT BALL • Defended',
        subtext: `Good ball from ${bowler.name}, no run`,
        color: 'from-slate-800 to-slate-900'
      });
      setTimeout(() => setEventBanner(null), 800);
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

    // Strike Rotation & Next Batter (Locally Scoped to prevent out player persisting)
    let curStrikerIdx = strikerIdx;
    let curNonStrikerIdx = nonStrikerIdx;
    let curNextBatterIdx = nextBatterIdx;

    if (isWicket) {
      // Striker is permanently out!
      // Find the next available batter who is NOT out and NOT currently nonStriker
      let foundNextIdx: number | null = null;
      for (let i = curNextBatterIdx; i < currentBatSquad.length; i++) {
        const candidate = currentBatSquad[i];
        const candidateBat = updatedBatters.find(b => b.name === candidate.name);
        if (candidateBat && candidateBat.dismissal === 'not out' && i !== curNonStrikerIdx) {
          foundNextIdx = i;
          break;
        }
      }

      // If none found forward, search from index 0 for any unbatting reserve
      if (foundNextIdx === null) {
        for (let i = 0; i < currentBatSquad.length; i++) {
          const candidate = currentBatSquad[i];
          const candidateBat = updatedBatters.find(b => b.name === candidate.name);
          if (candidateBat && candidateBat.dismissal === 'not out' && i !== curNonStrikerIdx && i !== curStrikerIdx) {
            foundNextIdx = i;
            break;
          }
        }
      }

      if (foundNextIdx !== null && newTotalWickets < 10) {
        curStrikerIdx = foundNextIdx;
        curNextBatterIdx = Math.max(curNextBatterIdx + 1, foundNextIdx + 1);

        if (isUserBatting) {
          // Automatic Popup for Next Batter Selection!
          setDismissedBatterName(currentBatSquad[strikerIdx]?.name || 'Batter');
          setDismissedBatterSlot('striker');
          setShowNextBatterModal(true);
        }
      }
    } else if (runs % 2 === 1) {
      const temp = curStrikerIdx;
      curStrikerIdx = curNonStrikerIdx;
      curNonStrikerIdx = temp;
    }

    // End of Over
    if (ballInOver === 6) {
      // Switch strike at end of over
      const temp = curStrikerIdx;
      curStrikerIdx = curNonStrikerIdx;
      curNonStrikerIdx = temp;
      
      const finishedBowlerIdx = currentBowlerIdx;
      setLastBowlerIdx(finishedBowlerIdx);

      const isLastOverOfInnings = currentOver === 19;
      const isMatchEnding = newTotalWickets >= 10 || (currentInnings === 2 && chaseTarget !== null && newTotalRuns >= chaseTarget);

      if (!isLastOverOfInnings && !isMatchEnding) {
        if (currentOver === 0) {
          // Over 1 finished -> Over 2 bowled by openingBowler2Idx
          const nextIdx = openingBowler2Idx % (activeBowlers.length || 1);
          setCurrentBowlerIdx(nextIdx);
          setEventBanner({
            text: `OVER 2: ${activeBowlers[nextIdx]?.name || 'Opening Bowler 2'}`,
            subtext: `Second opening spell starts from opposite end`,
            color: 'from-sky-500 to-indigo-600'
          });
          setTimeout(() => setEventBanner(null), 2000);
        } else {
          // Over 2 or subsequent over finished:
          if (isUserBowling) {
            // AUTOMATIC POPUP FOR NEXT BOWLER SELECTION!
            setShowBowlerModal(true);
          } else {
            // AI Bowling: Select next eligible bowler who is NOT finishedBowlerIdx and < 4 overs
            let nextIdx = (finishedBowlerIdx + 1) % activeBowlers.length;
            let attempts = 0;
            while (attempts < activeBowlers.length) {
              const candidateName = activeBowlers[nextIdx]?.name;
              const ovs = getBowlerOversCount(updatedBowlers, candidateName);
              if (ovs < 4 && nextIdx !== finishedBowlerIdx) {
                break;
              }
              nextIdx = (nextIdx + 1) % activeBowlers.length;
              attempts++;
            }
            setCurrentBowlerIdx(nextIdx);
          }
        }
      }
    }

    // Safety Assertions: ensure dismissed player is NEVER at crease if wickets < 10
    if (newTotalWickets < 10) {
      const sBat = updatedBatters.find(b => b.name === currentBatSquad[curStrikerIdx]?.name);
      if (sBat && sBat.dismissal !== 'not out') {
        const replacementIdx = currentBatSquad.findIndex((p, idx) => {
          const b = updatedBatters.find(ub => ub.name === p.name);
          return b && b.dismissal === 'not out' && idx !== curNonStrikerIdx;
        });
        if (replacementIdx !== -1) curStrikerIdx = replacementIdx;
      }

      const nsBat = updatedBatters.find(b => b.name === currentBatSquad[curNonStrikerIdx]?.name);
      if (nsBat && nsBat.dismissal !== 'not out') {
        const replacementIdx = currentBatSquad.findIndex((p, idx) => {
          const b = updatedBatters.find(ub => ub.name === p.name);
          return b && b.dismissal === 'not out' && idx !== curStrikerIdx;
        });
        if (replacementIdx !== -1) curNonStrikerIdx = replacementIdx;
      }
    }

    setStrikerIdx(curStrikerIdx);
    setNonStrikerIdx(curNonStrikerIdx);
    setNextBatterIdx(curNextBatterIdx);

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
      setLastBowlerIdx(null);
      setOpeningBowlersConfirmed(false);
      setOpeningBattersConfirmed(false);
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

    const fullScorecard: MatchScorecard = {
      tossSummary: tossSummaryText || `${fInn1.teamName} batted first`,
      inn1: {
        teamName: fInn1.teamName,
        teamShort: fInn1.teamShort,
        teamColor: fInn1.teamColor,
        totalRuns: fInn1.totalRuns,
        totalWickets: fInn1.totalWickets,
        oversPlayed: fInn1.oversPlayed,
        battingScorecard: fInn1.battingScorecard,
        bowlingFigures: fInn1.bowlingFigures
      },
      inn2: {
        teamName: fInn2.teamName,
        teamShort: fInn2.teamShort,
        teamColor: fInn2.teamColor,
        totalRuns: fInn2.totalRuns,
        totalWickets: fInn2.totalWickets,
        oversPlayed: fInn2.oversPlayed,
        battingScorecard: fInn2.battingScorecard,
        bowlingFigures: fInn2.bowlingFigures
      }
    };
    (summary as any).scorecard = fullScorecard;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auctionxi_active_match_simulation');
    }
    useCampaignStore.getState().clearActiveMatchSimulation?.();

    setMatchResultSummary(summary);
    if (onMatchComplete) {
      onMatchComplete(summary);
    }

    if (userWon) {
      gameAudio.playConfettiFanfare();
      triggerGameHaptic('heavy');
    } else {
      gameAudio.playTradeReject();
      triggerGameHaptic('medium');
    }
  };

  // Pure helper to calculate outcome of 1 ball
  const computeBallOutcome = (
    batTactic: BattingTactic,
    bowlTactic: BowlingTactic,
    bowlerName: string,
    currentBowlSquad: any[],
    strikerName: string
  ) => {
    const rand = Math.random();
    let runs = 0;
    let isWicket = false;
    let isFour = false;
    let isSix = false;
    let dismissal = '';
    let commentary = '';
    const shotZone = SHOT_ZONES[Math.floor(Math.random() * SHOT_ZONES.length)];

    // BATTING TACTIC LOGIC (0, 1, 2, 3, 4, 6 or Over intents)
    if (batTactic === '0' || batTactic === 'DEFEND' || batTactic === 'DEFEND_OVER') {
      if (rand < 0.015) {
        isWicket = true;
      } else if (rand < 0.93) {
        runs = 0;
        commentary = `Solid defensive block right into the turf. Dot ball.`;
      } else {
        runs = 1;
        commentary = `Soft hands tap into mid-wicket, scampered through for a sensible single.`;
      }
    } else if (batTactic === '1' || batTactic === 'ROTATE' || batTactic === 'NORMAL_OVER') {
      if (rand < 0.035) {
        isWicket = true;
      } else if (rand < 0.18) {
        runs = 0;
        commentary = `Defended towards point, fielder closes in sharply.`;
      } else if (rand < 0.88) {
        runs = 1;
        commentary = `Worked smoothly off the hips into square leg for an easy single.`;
      } else if (rand < 0.96) {
        runs = 2;
        commentary = `Steered fine of third man, hurried back for a sharp couple!`;
      } else {
        runs = 4;
        isFour = true;
        commentary = `FOUR! Beautifully timed push pierces the gap and reaches the rope!`;
      }
    } else if (batTactic === '2') {
      if (rand < 0.06) {
        isWicket = true;
      } else if (rand < 0.16) {
        runs = 0;
        commentary = `Pushed firmly to cover, turned down for the second.`;
      } else if (rand < 0.38) {
        runs = 1;
        commentary = `Sweeper cuts off the boundary, held to a single.`;
      } else {
        runs = 2;
        commentary = `⚡ Pierced into the deep sweeper gap, electric sprint back for two!`;
      }
    } else if (batTactic === '3') {
      if (rand < 0.09) {
        isWicket = true;
      } else if (rand < 0.20) {
        runs = 1;
        commentary = `Tapped into the outfield, single taken.`;
      } else if (rand < 0.55) {
        runs = 2;
        commentary = `Deep fielder slides to save the three, held to a double.`;
      } else if (rand < 0.94) {
        runs = 3;
        commentary = `🏃 Superb placement into the deep boundary pocket, hard running yields three!`;
      } else {
        runs = 4;
        isFour = true;
        commentary = `FOUR! Boundary beats the slide right on the cushion!`;
      }
    } else if (batTactic === '4' || batTactic === 'ATTACK') {
      // 4 intent: Piercing drive, high reward with edge/dismissal risk
      if (rand < 0.14) {
        isWicket = true;
      } else if (rand < 0.26) {
        runs = 0;
        commentary = `Driven hard on the up, but straight to extra cover. Dot ball.`;
      } else if (rand < 0.44) {
        runs = 1;
        commentary = `Lofted towards long-off on the bounce, single.`;
      } else if (rand < 0.50) {
        runs = 2;
        commentary = `Slashed past point, deep sweeper saves the boundary, two taken.`;
      } else if (rand < 0.92) {
        runs = 4;
        isFour = true;
        commentary = `⚡ CRACKING 4! Pierces extra cover with blistering timing to the fence!`;
      } else {
        runs = 6;
        isSix = true;
        commentary = `🚀 SIX! Clears the infield and carries all the way over long-off!`;
      }
    } else {
      // 6 or ATTACK_OVER or MAXIMUM
      if (rand < 0.22) {
        isWicket = true;
      } else if (rand < 0.32) {
        runs = 0;
        commentary = `Huge swing across the line, beaten completely by change of pace!`;
      } else if (rand < 0.46) {
        runs = 1;
        commentary = `Mistimed skier falls harmlessly in vacant outfield, single taken.`;
      } else if (rand < 0.54) {
        runs = 2;
        commentary = `Lofted high towards deep mid-wicket, fielder intercepts on the bounce.`;
      } else if (rand < 0.70) {
        runs = 4;
        isFour = true;
        commentary = `⚡ FOUR! One bounce into the LED boundary advertising boards!`;
      } else {
        runs = 6;
        isSix = true;
        commentary = `🚀 MONSTER MAXIMUM! Dispatched 104m into the second tier! Unreal power!`;
      }
    }

    // Adjust for BOWLING TACTIC
    if (bowlTactic === 'DEFEND') {
      if (isWicket) {
        dismissal = `b ${bowlerName}`;
        commentary = `🔥 CLEAN BOWLED! Defensive off-cutter deceives the swing and crashes into off stump!`;
      }
    } else if (bowlTactic === 'ATTACK' || bowlTactic === 'BOUNCER') {
      if (isWicket) {
        const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)]?.name || 'Fielder';
        dismissal = `c ${fielder} b ${bowlerName}`;
        commentary = `🎯 TOP EDGE! Hurried by a fiery 145km/h delivery, skied high and held by ${fielder}!`;
      }
    } else if (bowlTactic === 'YORKER') {
      if (isWicket) {
        dismissal = `b ${bowlerName}`;
        commentary = `🔥 CLEAN BOWLED! Pinpoint yorker crushes base of off stump!`;
      }
    } else if (bowlTactic === 'SLOWER') {
      const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)]?.name || 'Fielder';
      if (isWicket) {
        dismissal = `c ${fielder} b ${bowlerName}`;
        commentary = `🎯 CAUGHT! Deceptive cutter induces an early loft, caught by ${fielder}!`;
      }
    } else {
      // NORMAL / GOOD_LENGTH
      if (isWicket) {
        const fielder = currentBowlSquad[Math.floor(Math.random() * currentBowlSquad.length)]?.name || 'Keeper';
        dismissal = `c ${fielder} b ${bowlerName}`;
        commentary = `🎯 EDGED & TAKEN! Probing corridor delivery takes the outside nick to ${fielder}!`;
      }
    }

    return { runs, isWicket, isFour, isSix, dismissal, commentary, shotZone };
  };

  // Simulate Over: Atomically bowls all remaining balls in current over
  const handleSimulateOver = (customBatTactic?: BattingTactic, customBowlTactic?: BowlingTactic) => {
    if (matchDone || !inn1 || !inn2) return;
    gameAudio.unlockAudio();
    if (customBatTactic) setBattingTactic(customBatTactic);
    if (customBowlTactic) setBowlingTactic(customBowlTactic);

    const activeInn = currentInnings === 1 ? inn1 : inn2;
    const currentBatSquad = currentInnings === 1 ? bat1Squad : bowl1Squad;
    const currentBowlSquad = currentInnings === 1 ? bowl1Squad : bat1Squad;
    const activeBowlers = currentBowlSquad.filter(p => p.role === 'BOWL' || p.role === 'AR');
    const bowler = activeBowlers[currentBowlerIdx % activeBowlers.length] || currentBowlSquad[0];

    const legalBallsBowled = activeInn.balls.length;
    const ballsRemainingInOver = 6 - (legalBallsBowled % 6);
    const ballsToBowl = Math.min(ballsRemainingInOver, 120 - legalBallsBowled);
    if (ballsToBowl <= 0) return;

    let curTotalRuns = activeInn.totalRuns;
    let curTotalWickets = activeInn.totalWickets;
    let curStrikerIdx = strikerIdx;
    let curNonStrikerIdx = nonStrikerIdx;
    let curNextBatterIdx = nextBatterIdx;
    let curBalls = [...activeInn.balls];
    let curBatters = activeInn.battingScorecard.map(b => ({ ...b }));
    let curBowlers = activeInn.bowlingFigures.map(bw => ({ ...bw }));
    let curFOW = [...activeInn.fallOfWickets];
    let overRunsGained = 0;
    let overWktsLost = 0;
    let matchEnded = false;
    let inningsEnded = false;
    let lastOutcomeShotZone = null;

    const target = currentInnings === 2 ? (inn1.totalRuns + 1) : null;

    for (let b = 0; b < ballsToBowl; b++) {
      const ballNo = curBalls.length;
      const overNum = Math.floor(ballNo / 6);
      const ballInOverNum = (ballNo % 6) + 1;

      const strikerPlayer = currentBatSquad[curStrikerIdx]?.name || 'Batter';
      const nonStrikerPlayer = currentBatSquad[curNonStrikerIdx]?.name || 'Non-Striker';

      const effectiveBatTactic = customBatTactic || battingTactic;
      const effectiveBowlTactic = customBowlTactic || bowlingTactic;
      const outcome = computeBallOutcome(
        effectiveBatTactic,
        effectiveBowlTactic,
        bowler.name,
        currentBowlSquad,
        strikerPlayer
      );

      lastOutcomeShotZone = outcome.shotZone;
      overRunsGained += outcome.runs;
      curTotalRuns += outcome.runs;

      if (outcome.isWicket) {
        overWktsLost++;
        curTotalWickets++;
        curFOW.push({
          wicket: curTotalWickets,
          score: curTotalRuns,
          player: strikerPlayer,
          over: `${overNum}.${ballInOverNum}`
        });

        curBatters = curBatters.map(bat => {
          if (bat.name === strikerPlayer) {
            const bl = bat.balls + 1;
            const sr = ((bat.runs / bl) * 100).toFixed(1);
            return {
              ...bat,
              balls: bl,
              strikeRate: sr,
              dismissal: outcome.dismissal
            };
          }
          return bat;
        });

        // Find next batter who is NOT out and NOT currently nonStriker
        let foundNextIdx: number | null = null;
        for (let i = curNextBatterIdx; i < currentBatSquad.length; i++) {
          const candidate = currentBatSquad[i];
          const candidateBat = curBatters.find(bat => bat.name === candidate.name);
          if (candidateBat && candidateBat.dismissal === 'not out' && i !== curNonStrikerIdx) {
            foundNextIdx = i;
            break;
          }
        }
        if (foundNextIdx === null) {
          for (let i = 0; i < currentBatSquad.length; i++) {
            const candidate = currentBatSquad[i];
            const candidateBat = curBatters.find(bat => bat.name === candidate.name);
            if (candidateBat && candidateBat.dismissal === 'not out' && i !== curNonStrikerIdx && i !== curStrikerIdx) {
              foundNextIdx = i;
              break;
            }
          }
        }

        if (foundNextIdx !== null && curTotalWickets < 10) {
          curStrikerIdx = foundNextIdx;
          curNextBatterIdx = Math.max(curNextBatterIdx + 1, foundNextIdx + 1);
        }
      } else {
        curBatters = curBatters.map(bat => {
          if (bat.name === strikerPlayer) {
            const r = bat.runs + outcome.runs;
            const bl = bat.balls + 1;
            const f = outcome.isFour ? bat.fours + 1 : bat.fours;
            const s = outcome.isSix ? bat.sixes + 1 : bat.sixes;
            const sr = ((r / bl) * 100).toFixed(1);
            return {
              ...bat,
              runs: r,
              balls: bl,
              fours: f,
              sixes: s,
              strikeRate: sr
            };
          }
          return bat;
        });

        if (outcome.runs % 2 === 1) {
          const tmp = curStrikerIdx;
          curStrikerIdx = curNonStrikerIdx;
          curNonStrikerIdx = tmp;
        }
      }

      curBowlers = curBowlers.map(bw => {
        if (bw.name === bowler.name) {
          const newR = bw.runs + outcome.runs;
          const newW = outcome.isWicket ? bw.wickets + 1 : bw.wickets;
          const currBallsBowled = Math.floor(parseFloat(bw.overs) || 0) * 6 + Math.round(((parseFloat(bw.overs) || 0) % 1) * 10) + 1;
          const fo = Math.floor(currBallsBowled / 6);
          const ro = currBallsBowled % 6;
          const econ = currBallsBowled > 0 ? ((newR / currBallsBowled) * 6).toFixed(2) : '0.00';
          return {
            ...bw,
            runs: newR,
            wickets: newW,
            overs: `${fo}.${ro}`,
            economy: econ
          };
        }
        return bw;
      });

      curBalls.push({
        over: overNum,
        ball: ballInOverNum,
        striker: strikerPlayer,
        nonStriker: nonStrikerPlayer,
        bowler: bowler.name,
        runs: outcome.runs,
        isWicket: outcome.isWicket,
        wicketType: outcome.dismissal,
        isFour: outcome.isFour,
        isSix: outcome.isSix,
        commentary: outcome.commentary,
        totalRuns: curTotalRuns,
        totalWickets: curTotalWickets,
        shotDirection: outcome.shotZone,
        tacticUsed: isUserBatting ? battingTactic : bowlingTactic
      });

      if (currentInnings === 2 && target !== null && curTotalRuns >= target) {
        matchEnded = true;
        break;
      }
      if (curTotalWickets >= 10 || curBalls.length >= 120) {
        if (currentInnings === 1) {
          inningsEnded = true;
        } else {
          matchEnded = true;
        }
        break;
      }

      if (outcome.isWicket && isUserBatting && curTotalWickets < 10) {
        setDismissedBatterName(strikerPlayer);
        setDismissedBatterSlot('striker');
        setShowNextBatterModal(true);
        break; // Pause full-over simulation at wicket so user selects next batter
      }
    }

    let nextBowlerIdx = currentBowlerIdx;
    if (!matchEnded && !inningsEnded && curBalls.length % 6 === 0) {
      const tmp = curStrikerIdx;
      curStrikerIdx = curNonStrikerIdx;
      curNonStrikerIdx = tmp;
      
      const finishedBowlerIdx = currentBowlerIdx;
      setLastBowlerIdx(finishedBowlerIdx);

      const completedOversCount = Math.floor(curBalls.length / 6);
      if (completedOversCount === 1) {
        // Over 1 finished -> Over 2 bowled by openingBowler2Idx
        nextBowlerIdx = openingBowler2Idx % (activeBowlers.length || 1);
      } else {
        // Over 2 or later finished:
        if (isUserBowling) {
          // AUTOMATIC NEXT BOWLER POPUP!
          setShowBowlerModal(true);
        }
        // AI or fallback next bowler must NOT bowl consecutive overs!
        let nextIdx = (finishedBowlerIdx + 1) % activeBowlers.length;
        let attempts = 0;
        while (attempts < activeBowlers.length) {
          const candidateName = activeBowlers[nextIdx]?.name;
          const ovs = getBowlerOversCount(curBowlers, candidateName);
          if (ovs < 4 && nextIdx !== finishedBowlerIdx) {
            break;
          }
          nextIdx = (nextIdx + 1) % activeBowlers.length;
          attempts++;
        }
        nextBowlerIdx = nextIdx;
      }
    }

    // Safety Assertions: ensure dismissed player is NEVER at crease if wickets < 10
    if (curTotalWickets < 10) {
      const sBat = curBatters.find(b => b.name === currentBatSquad[curStrikerIdx]?.name);
      if (sBat && sBat.dismissal !== 'not out') {
        const replacementIdx = currentBatSquad.findIndex((p, idx) => {
          const b = curBatters.find(ub => ub.name === p.name);
          return b && b.dismissal === 'not out' && idx !== curNonStrikerIdx;
        });
        if (replacementIdx !== -1) curStrikerIdx = replacementIdx;
      }

      const nsBat = curBatters.find(b => b.name === currentBatSquad[curNonStrikerIdx]?.name);
      if (nsBat && nsBat.dismissal !== 'not out') {
        const replacementIdx = currentBatSquad.findIndex((p, idx) => {
          const b = curBatters.find(ub => ub.name === p.name);
          return b && b.dismissal === 'not out' && idx !== curStrikerIdx;
        });
        if (replacementIdx !== -1) curNonStrikerIdx = replacementIdx;
      }
    }

    const updatedInn: InningsState = {
      ...activeInn,
      totalRuns: curTotalRuns,
      totalWickets: curTotalWickets,
      oversPlayed: Math.min(20, Math.ceil(curBalls.length / 6)),
      balls: curBalls,
      battingScorecard: curBatters,
      bowlingFigures: curBowlers,
      fallOfWickets: curFOW
    };

    setStrikerIdx(curStrikerIdx);
    setNonStrikerIdx(curNonStrikerIdx);
    setNextBatterIdx(curNextBatterIdx);
    setCurrentBowlerIdx(nextBowlerIdx);
    if (lastOutcomeShotZone) setLastShotTraj(lastOutcomeShotZone);

    if (currentInnings === 1) {
      setInn1(updatedInn);
    } else {
      setInn2(updatedInn);
    }

    if (overWktsLost > 0) {
      gameAudio.playStumpShatter();
      gameAudio.playCrowdRoar('wicket');
      triggerGameHaptic('wicket');
    } else if (overRunsGained >= 10) {
      gameAudio.playWillowCrack('six');
      gameAudio.playCrowdRoar('six');
      triggerGameHaptic('heavy');
    } else {
      gameAudio.playWillowCrack('four');
      triggerGameHaptic('medium');
    }

    setEventBanner({
      text: `⚡ OVER COMPLETED • ${overRunsGained} RUNS${overWktsLost > 0 ? ` • ${overWktsLost} WKT` : ''}`,
      subtext: `${bowler.name} finishes the over • Score: ${curTotalRuns}/${curTotalWickets}`,
      color: 'from-amber-500 via-indigo-600 to-slate-900'
    });
    setTimeout(() => setEventBanner(null), 1800);

    if (matchEnded) {
      finalizeMatch(updatedInn);
    } else if (inningsEnded) {
      handleInningsTransition(updatedInn);
    }
  };

  // Fast forward until match ends
  const handleInstantResult = () => {
    if (matchDone || !inn1 || !inn2) return;
    gameAudio.unlockAudio();

    // 1. Finish Innings 1 if incomplete
    let wInn1 = { ...inn1 };
    if (currentInnings === 1) {
      const bat1 = bat1Squad;
      const bowl1 = bowl1Squad;
      const actBowlers = bowl1.filter(p => p.role === 'BOWL' || p.role === 'AR');
      while (wInn1.balls.length < 120 && wInn1.totalWickets < 10) {
        const bNo = wInn1.balls.length;
        const bBowler = actBowlers[Math.floor(bNo / 6) % actBowlers.length]?.name || 'Bowler';
        const stName = bat1[Math.min(bat1.length - 1, wInn1.totalWickets)]?.name || 'Batter';
        const out = computeBallOutcome('ROTATE', 'GOOD_LENGTH', bBowler, bowl1, stName);
        wInn1.totalRuns += out.runs;
        if (out.isWicket) wInn1.totalWickets++;
        wInn1.balls.push({
          over: Math.floor(bNo / 6),
          ball: (bNo % 6) + 1,
          striker: stName,
          nonStriker: 'Partner',
          bowler: bBowler,
          runs: out.runs,
          isWicket: out.isWicket,
          wicketType: out.dismissal,
          isFour: out.isFour,
          isSix: out.isSix,
          commentary: out.commentary,
          totalRuns: wInn1.totalRuns,
          totalWickets: wInn1.totalWickets
        });
      }
      wInn1.oversPlayed = Math.min(20, Math.ceil(wInn1.balls.length / 6));
      setInn1(wInn1);
    }

    // 2. Finish Innings 2
    let wInn2 = { ...(inn2 || wInn1) };
    const target = wInn1.totalRuns + 1;
    const bat2 = bowl1Squad;
    const bowl2 = bat1Squad;
    const actBowlers2 = bowl2.filter(p => p.role === 'BOWL' || p.role === 'AR');

    while (wInn2.balls.length < 120 && wInn2.totalWickets < 10 && wInn2.totalRuns < target) {
      const bNo = wInn2.balls.length;
      const bBowler = actBowlers2[Math.floor(bNo / 6) % actBowlers2.length]?.name || 'Bowler';
      const stName = bat2[Math.min(bat2.length - 1, wInn2.totalWickets)]?.name || 'Batter';
      const out = computeBallOutcome('ATTACK', 'GOOD_LENGTH', bBowler, bowl2, stName);
      wInn2.totalRuns += out.runs;
      if (out.isWicket) wInn2.totalWickets++;
      wInn2.balls.push({
        over: Math.floor(bNo / 6),
        ball: (bNo % 6) + 1,
        striker: stName,
        nonStriker: 'Partner',
        bowler: bBowler,
        runs: out.runs,
        isWicket: out.isWicket,
        wicketType: out.dismissal,
        isFour: out.isFour,
        isSix: out.isSix,
        commentary: out.commentary,
        totalRuns: wInn2.totalRuns,
        totalWickets: wInn2.totalWickets
      });
    }
    wInn2.oversPlayed = Math.min(20, Math.ceil(wInn2.balls.length / 6));
    setInn2(wInn2);
    finalizeMatch(wInn2);
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

  // Authentic 1-Over-at-a-Time Trail: resets on every new over!
  const currentOverIndex = (ballsBowled > 0 && ballsBowled % 6 === 0)
    ? Math.floor((ballsBowled - 1) / 6)
    : Math.floor(ballsBowled / 6);

  const currentOverBalls = activeInnings.balls.filter(b => b.over === currentOverIndex);
  const currentOverRuns = currentOverBalls.reduce((acc, b) => acc + b.runs, 0);
  const currentOverWickets = currentOverBalls.filter(b => b.isWicket).length;

  // Past completed overs history
  const completedOversList: Array<{ overNum: number; runs: number; wickets: number; balls: SimulatedBall[]; bowlerName: string }> = [];
  for (let ov = 0; ov < Math.floor(ballsBowled / 6); ov++) {
    const oBalls = activeInnings.balls.filter(b => b.over === ov);
    if (oBalls.length > 0) {
      completedOversList.push({
        overNum: ov + 1,
        runs: oBalls.reduce((acc, b) => acc + b.runs, 0),
        wickets: oBalls.filter(b => b.isWicket).length,
        balls: oBalls,
        bowlerName: oBalls[0]?.bowler || 'Bowler'
      });
    }
  }

  const currentBatSquad = currentInnings === 1 ? bat1Squad : bowl1Squad;
  const bowlingSquad = currentInnings === 1 ? bowl1Squad : bat1Squad;
  const activeBowlers = bowlingSquad.filter(p => p.role === 'BOWL' || p.role === 'AR');
  const bowlerPlayer = activeBowlers[currentBowlerIdx % (activeBowlers.length || 1)] || bowlingSquad[0];
  const strikerPlayer = currentBatSquad[strikerIdx] || currentBatSquad[0];
  const nonStrikerPlayer = currentBatSquad[nonStrikerIdx] || currentBatSquad[1] || currentBatSquad[0];
  const keeperPlayer = bowlingSquad.find(p => p.role === 'WK') || bowlingSquad[1] || bowlingSquad[0];
  const battingTeamColor = activeInnings.teamColor || '#f59e0b';
  const bowlingTeamColor = currentInnings === 1 ? (bowl1Squad[0]?.teamColor || '#38bdf8') : (bat1Squad[0]?.teamColor || '#38bdf8');

  const isStrikerLeftHanded = Boolean(
    strikerPlayer?.battingStyle?.toLowerCase().includes('left') || 
    ['Rishabh Pant', 'Nicholas Pooran', 'Shivam Dube', 'Shikhar Dhawan', 'Ravindra Jadeja', 'Quinton de Kock', 'Abhishek Sharma', 'Rinku Singh', 'Devdutt Padikkal', 'Phil Salt', 'Travis Head'].some(n => strikerPlayer?.name?.includes(n))
  );

  const isBowlerSpinner = Boolean(
    bowlerPlayer?.bowlingStyle?.toLowerCase().includes('spin') || bowlerPlayer?.role === 'SPIN' || 
    ['Rashid Khan', 'Ravi Bishnoi', 'Yuzvendra Chahal', 'Kuldeep Yadav', 'Varun Chakaravarthy', 'Axar Patel', 'Ravindra Jadeja', 'Sunil Narine', 'R. Ashwin', 'Krunal Pandya', 'Suyash Sharma', 'Rahul Chahar', 'Noor Ahmad', 'Maheesh Theekshana', 'Wanindu Hasaranga'].some(n => bowlerPlayer?.name?.includes(n))
  );

  const { fielders: dynamicFielders, strategyLabel: fieldingStrategyLabel, deepCount } = getDynamicFieldPositions(
    ballsBowled,
    isBowlerSpinner,
    bowlingTactic,
    isStrikerLeftHanded,
    battingTactic
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 bg-slate-950 text-white overflow-hidden select-none">
      <div 
        className="relative w-full h-[100dvh] max-w-lg bg-slate-950 flex flex-col shadow-2xl overflow-hidden sm:border sm:border-white/20 sm:rounded-3xl sm:h-[96dvh]"
      >
        
        {/* Top Header & Navigation Bar */}
        <div className="px-3 py-2 bg-slate-900/95 border-b border-white/10 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-display font-black text-xs">
              <TeamLogo teamId={myFranchise.short} size={20} />
              <span className="text-white font-bold">{myFranchise.short}</span>
              <span className="text-gray-400 font-sans text-[11px]">vs</span>
              <span className="text-white font-bold">{rivalFranchise.short}</span>
              <TeamLogo teamId={rivalFranchise.short} size={20} />
            </div>
            {tossPhase === 'ceremony' ? (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                🪙 TOSS
              </span>
            ) : (
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                isUserBatting ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}>
                {isUserBatting ? '🏏 BATTING' : '🎯 BOWLING'}
              </span>
            )}
          </div>

          {/* Tab selector & Sound Toggle */}
          <div className="flex items-center gap-1.5">
            {tossPhase === 'ceremony' ? (
              <button
                onClick={handleQuickTossSkip}
                className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="Fast forward toss and jump to match arena"
              >
                <Zap size={12} className="text-amber-400" />
                <span>Quick Toss</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => {
                    setActiveTab('arena');
                    gameAudio.playUiTap('light');
                    triggerGameHaptic('light');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'arena' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Arena
                </button>
                <button
                  onClick={() => {
                    setActiveTab('scorecard');
                    gameAudio.playUiTap('light');
                    triggerGameHaptic('light');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'scorecard' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Scorecard
                </button>
              </div>
            )}

            {/* Restart Match Button (if in Arena phase) */}
            {tossPhase === 'arena' && !matchDone && (
              <button
                onClick={() => {
                  if (confirm('Restart match from the toss? Any current match scores will be reset.')) {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('auctionxi_active_match_simulation');
                    }
                    useCampaignStore.getState().clearActiveMatchSimulation?.();
                    matchInitializedKeyRef.current = null;
                    setTossPhase('ceremony');
                    setCoinResult(null);
                    setTossWinner(null);
                    setTossDecision(null);
                    setTossSummaryText('');
                    setupMatchTeams(true);
                  }
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 cursor-pointer transition-all"
                title="Restart match from toss"
              >
                <RotateCcw size={15} />
              </button>
            )}



            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Resumed Match Toast Notification */}
        {resumedBanner && (
          <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-b border-amber-500/30 px-3 py-1 text-center text-[10px] font-mono text-amber-300 font-bold flex items-center justify-center gap-1.5 shrink-0 animate-fadeIn">
            <Sparkles size={12} className="text-amber-400" />
            <span>{resumedBanner}</span>
          </div>
        )}

        {/* Dynamic Toss Ceremony View */}
        {tossPhase === 'ceremony' ? (
          <div className="flex-1 flex flex-col justify-between p-3 overflow-y-auto touch-pan-y bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Captains & Team Showcase - Compact 2-Col for Mobile Portrait */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              {/* Your Team Card */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col items-center text-center shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[8px] font-mono font-bold rounded-bl-lg">
                  YOU
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0 p-1 mb-1">
                  <TeamLogo teamId={myFranchise.short} size={28} />
                </div>
                <div className="min-w-0 w-full">
                  <h3 className="text-xs font-black text-white truncate">{myFranchise.short}</h3>
                  <div className="text-[10px] text-gray-300 truncate">
                    {mySquad[0]?.name || 'Captain'} (C)
                  </div>
                  <div className="text-[8px] text-emerald-400 font-mono mt-0.5 truncate">
                    ✓ Dual Lineups Ready
                  </div>
                </div>
              </div>

              {/* Rival Team Card */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-sky-500/30 flex flex-col items-center text-center shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[8px] font-mono font-bold rounded-bl-lg">
                  OPPONENT
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0 p-1 mb-1">
                  <TeamLogo teamId={rivalFranchise.short} size={28} />
                </div>
                <div className="min-w-0 w-full">
                  <h3 className="text-xs font-black text-white truncate">{rivalFranchise.short}</h3>
                  <div className="text-[10px] text-gray-300 truncate">
                    {(rivalFranchise.squad2026?.[0]?.name) || 'Opp Captain'} (C)
                  </div>
                  <div className="text-[8px] text-purple-300 font-mono mt-0.5 truncate">
                    {rivalFranchise.short === 'CSK' ? 'Spin Choke' : rivalFranchise.short === 'SRH' ? 'Blitzkrieg' : 'Aggressive'}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Coin Toss Stage */}
            <div className="flex-1 flex flex-col items-center justify-center py-3 sm:py-6">
              {/* Coin Visual */}
              <div className="relative mb-4">
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all ${
                  isFlippingCoin ? 'animate-[spin_0.35s_linear_infinite] scale-110' : 'hover:scale-105'
                }`}>
                  <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full border border-amber-700/60 bg-gradient-to-br from-amber-500 to-amber-700 flex flex-col items-center justify-center text-slate-950 font-black shadow-inner">
                    <span className="text-2xl sm:text-3xl">🪙</span>
                    <span className="text-xs sm:text-sm font-black tracking-widest uppercase mt-0.5">
                      {isFlippingCoin ? 'FLIPPING' : coinResult ? coinResult.toUpperCase() : userCoinCall.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 1: Pre-flip Call Selection */}
              {!coinResult && !isFlippingCoin && (
                <div className="flex flex-col items-center gap-3 text-center max-w-md w-full">
                  <div className="text-xs sm:text-sm text-gray-300 font-medium">
                    Call the coin toss before the match referee spins:
                  </div>
                  
                  <div className="flex items-center gap-3 w-full justify-center">
                    <button
                      onClick={() => {
                        setUserCoinCall('heads');
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                      }}
                      className={`flex-1 max-w-[140px] py-2.5 px-4 rounded-xl border font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        userCoinCall === 'heads'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                          : 'bg-slate-900 text-gray-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span>🟡</span>
                      <span>HEADS</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserCoinCall('tails');
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                      }}
                      className={`flex-1 max-w-[140px] py-2.5 px-4 rounded-xl border font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        userCoinCall === 'tails'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                          : 'bg-slate-900 text-gray-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span>⚪</span>
                      <span>TAILS</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSpinCoin}
                    className="w-full max-w-sm mt-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>🪙</span>
                    <span>Spin Coin for Toss</span>
                  </button>
                </div>
              )}

              {/* Step 2: In-Flight Animation */}
              {isFlippingCoin && (
                <div className="text-center animate-pulse">
                  <div className="text-sm font-black text-amber-400 uppercase tracking-wider">
                    Coin is in the air over {venueName}...
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Captains awaiting the referee's call...</div>
                </div>
              )}

              {/* Step 3: User Won Toss */}
              {coinResult && tossWinner === 'user' && (
                <div className="flex flex-col items-center gap-3.5 text-center max-w-lg w-full animate-fadeIn">
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Coin Landed {coinResult.toUpperCase()} • YOU WON THE TOSS!</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Pitch conditions at <span className="font-bold text-white">{venueName}</span> assessed. Choose your matchday election:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => handleApplyTossDecision(true, `${myFranchise.short} won toss, elected to bat`)}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                          <span>🏏 Elect to Bat First</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">Deploy Bat-First XI</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          Sets target with powerhitters & deep batting order.
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-black text-amber-300 flex items-center gap-1">
                        <span>Confirm & Bat ➔</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleApplyTossDecision(false, `${myFranchise.short} won toss, elected to bowl`)}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/40 hover:border-sky-400 hover:bg-sky-500/10 text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
                          <span>🎯 Elect to Bowl First</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">Deploy Bowl-First XI</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          Restricts opposition with 5 frontline bowlers & death seamers.
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-black text-sky-300 flex items-center gap-1">
                        <span>Confirm & Bowl ➔</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Rival Won Toss */}
              {coinResult && tossWinner === 'rival' && (
                <div className="flex flex-col items-center gap-3 text-center max-w-md w-full animate-fadeIn">
                  <div className="px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <span>Coin Landed {coinResult.toUpperCase()} • {rivalFranchise.short} WON TOSS</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-left w-full">
                    <div className="text-xs font-bold text-white">
                      Opposition Captain Decision:
                    </div>
                    <div className="text-xs text-amber-300 font-bold mt-1">
                      {rivalFranchise.short} elected to {tossDecision === 'bat' ? 'BAT FIRST' : 'BOWL FIRST'}!
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {tossDecision === 'bowl' 
                        ? 'They back their chasing depth. You are batting first with your Bat-First XI!'
                        : 'They opted to set a total. You are bowling first with your Bowl-First XI!'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const userBats = tossDecision === 'bowl';
                      handleApplyTossDecision(userBats, `${rivalFranchise.short} won toss, elected to ${tossDecision === 'bat' ? 'bat' : 'bowl'}`);
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Swords size={15} />
                    <span>Enter Match Arena (Counter with {tossDecision === 'bat' ? 'Bowl-First' : 'Bat-First'} XI) ➔</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Event Banner Overlay */}
            {eventBanner && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
                <div className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${eventBanner.color} text-white font-black text-center shadow-2xl border border-white/40`}>
                  <div className="text-lg sm:text-xl tracking-wider drop-shadow-md">{eventBanner.text}</div>
                  <div className="text-xs font-sans text-white/90 drop-shadow">{eventBanner.subtext}</div>
                </div>
              </div>
            )}

            {/* Tab 1: Interactive Match Arena (Portrait Mobile First - Fits Perfectly) */}
            {activeTab === 'arena' ? (
              <div className="flex-1 flex flex-col justify-between gap-1.5 p-2 sm:p-2.5 overflow-y-auto select-none">
                
                {/* ─── COMPACT IPL BROADCAST SCORECARD HUD ─── */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-white/20 flex flex-col gap-1.5 shadow-xl shrink-0 my-0.5">
                  {/* Top Row: Team Logo, Big Score, Overs, CRR/RRR & Over Balls */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent shrink-0 p-0.5">
                        <TeamLogo teamId={activeInnings.teamShort} size={32} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-2">
                          <span>{activeInnings.totalRuns}/{activeInnings.totalWickets}</span>
                          <span className="text-xs sm:text-sm font-sans font-bold text-gray-400">
                            ({Math.floor(ballsBowled / 6)}.{ballsBowled % 6} / 20 ov)
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-300 font-mono flex items-center gap-1.5 truncate">
                          <span className="text-gray-400">CRR: <strong className="text-white">{currRR}</strong></span>
                          {currentInnings === 2 && (
                            <span className="text-amber-400 font-bold truncate">
                              • Need {runsNeeded} off {ballsRemaining}b (RRR: {reqRR})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Over Ball Bubbles: Strictly 1 Over at a Time (Balls 1 to 6) */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setShowPastOversModal(true);
                            gameAudio.playUiTap('light');
                          }}
                          className="text-[9px] font-mono font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-all"
                          title="View previous completed overs summary"
                        >
                          <span>OVER {currentOverIndex + 1}</span>
                          {completedOversList.length > 0 && (
                            <span className="text-gray-400 text-[8px]">({completedOversList.length} done)</span>
                          )}
                        </button>
                        {currentOverBalls.length === 6 && (
                          <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/15 px-1 rounded border border-emerald-500/30">
                            +{currentOverRuns}R {currentOverWickets > 0 ? `(${currentOverWickets}W)` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 6 }).map((_, slotIdx) => {
                          const b = currentOverBalls[slotIdx];
                          if (!b) {
                            return (
                              <div
                                key={slotIdx}
                                className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-mono bg-slate-900/80 border border-white/10 text-gray-600"
                              >
                                •
                              </div>
                            );
                          }
                          return (
                            <div
                              key={slotIdx}
                              className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-sm ${
                                b.isWicket 
                                  ? 'bg-rose-600 text-white animate-pulse' 
                                  : b.isSix 
                                  ? 'bg-amber-400 text-slate-950 font-black' 
                                  : b.isFour 
                                  ? 'bg-sky-400 text-slate-950 font-black' 
                                  : b.runs > 0 
                                  ? 'bg-slate-700 text-white' 
                                  : 'bg-slate-900 border border-white/20 text-gray-400'
                              }`}
                            >
                              {b.isWicket ? 'W' : b.runs}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Live Batter & Bowler Figures Integrated Strip with Proper Names */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    {/* Batter On Strike */}
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 flex items-center justify-between text-xs font-mono shadow-sm min-w-0">
                      <div className="truncate mr-1 min-w-0">
                        <div className="text-amber-300 font-bold truncate flex items-center gap-1 text-[11px] sm:text-xs">
                          <span>🏏</span>
                          <span className="truncate">{formatPlayerInitial(strikerPlayer?.name) || 'Striker'}*</span>
                        </div>
                        <div className="text-[9px] text-gray-400 truncate">
                          Runner: {formatPlayerInitial(nonStrikerPlayer?.name) || 'Batter'}
                        </div>
                        {isUserBatting && (
                          <button
                            onClick={() => {
                              gameAudio.playUiTap('select');
                              triggerGameHaptic('light');
                              setShowBattingOrderModal(true);
                            }}
                            className="mt-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer w-fit shadow-xs"
                          >
                            <ListOrdered size={10} />
                            <span>Batting Order</span>
                          </button>
                        )}
                      </div>
                      <div className="text-right text-white font-bold shrink-0">
                        <span className="text-amber-300 font-black text-xs sm:text-sm">
                          {activeInnings.battingScorecard.find(b => b.name === strikerPlayer?.name)?.runs || 0}
                        </span>
                        <span className="text-gray-400 text-[10px] ml-0.5">
                          ({activeInnings.battingScorecard.find(b => b.name === strikerPlayer?.name)?.balls || 0})
                        </span>
                      </div>
                    </div>

                    {/* Current Bowler */}
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-rose-500/40 flex items-center justify-between text-xs font-mono shadow-sm min-w-0">
                      <div className="truncate mr-1 min-w-0">
                        <div className="text-rose-300 font-bold truncate flex items-center gap-1 text-[11px] sm:text-xs">
                          <span>🎯</span>
                          <span className="truncate">{formatPlayerInitial(bowlerPlayer?.name) || 'Bowler'}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 truncate flex items-center gap-1">
                          <span className={isPlayerSpinner(bowlerPlayer) ? 'text-purple-300 font-bold' : 'text-rose-300 font-bold'}>
                            {getDetailedPlayerRole(bowlerPlayer)}
                          </span>
                          <span>•</span>
                          <span>Spell: {activeInnings.bowlingFigures.find(bw => bw.name === bowlerPlayer?.name)?.overs || '0.0'}/4 ov</span>
                        </div>
                        {isUserBowling && (
                          <button
                            onClick={() => {
                              gameAudio.playUiTap('select');
                              triggerGameHaptic('light');
                              setShowBowlerModal(true);
                            }}
                            className="mt-1 px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[9px] font-bold text-rose-300 flex items-center gap-1 cursor-pointer w-fit shadow-xs"
                          >
                            <Target size={10} />
                            <span>Change Bowler</span>
                          </button>
                        )}
                      </div>
                      <div className="text-right text-white font-bold shrink-0">
                        <span className="text-rose-300 font-black text-xs sm:text-sm">
                          {activeInnings.bowlingFigures.find(bw => bw.name === bowlerPlayer?.name)?.wickets || 0}/
                          {activeInnings.bowlingFigures.find(bw => bw.name === bowlerPlayer?.name)?.runs || 0}
                        </span>
                        <span className="text-gray-400 text-[9px] block">
                          ({activeInnings.bowlingFigures.find(bw => bw.name === bowlerPlayer?.name)?.overs || '0.0'} ov)
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Persistent Latest Delivery Commentary Bar */}
                  {lastBall && (
                    <div className="mt-1 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono shadow-sm">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`px-2 py-0.5 rounded-md font-black text-[9px] sm:text-[10px] ${
                          lastBall.isWicket ? 'bg-rose-600 text-white animate-pulse' :
                          lastBall.isSix ? 'bg-amber-400 text-slate-950 font-black' :
                          lastBall.isFour ? 'bg-sky-400 text-slate-950 font-black' :
                          lastBall.runs > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-gray-300'
                        }`}>
                          {lastBall.isWicket ? 'WICKET!' : lastBall.isSix ? 'SIX (6)' : lastBall.isFour ? 'FOUR (4)' : `${lastBall.runs} RUN${lastBall.runs !== 1 ? 'S' : ''}`}
                        </span>
                        <span className="text-gray-200 truncate">
                          {lastBall.commentary || `${lastBall.striker} faced ${lastBall.bowler}`}
                        </span>
                      </div>
                      <span className="text-amber-300 font-bold text-[10px] shrink-0 ml-2">
                        {lastBall.over}.{lastBall.ball} ov
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── ARENA FIELD POV: CRISP 2D TACTICAL BROADCAST RADAR (COMPACT FIT) ─── */}
                <div className="relative my-0.5 h-[270px] sm:h-[310px] md:h-[350px] shrink-0 rounded-xl overflow-hidden border border-emerald-500/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/90 via-emerald-950 to-slate-950 shadow-xl select-none">
                  
                  {/* Field Strategy & Deep Fielders Indicator (Top-Right) */}
                  <div className="absolute top-2 right-3 z-10 flex items-center gap-1 bg-slate-950/85 px-2.5 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-emerald-300 backdrop-blur-sm">
                    <span>🛡️ {deepCount} Deep Fielders</span>
                  </div>
                  
                  {/* Stadium Glows */}
                  <div className="absolute top-0 left-0 w-40 h-40 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-200/15 rounded-full blur-3xl pointer-events-none" />

                  {/* SVG Stadium Field Turf & Marking Rings */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
                    <defs>
                      <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#92400e" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#b45309" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
                      </linearGradient>
                      <radialGradient id="lawnPattern" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#047857" stopOpacity="0.3" />
                        <stop offset="35%" stopColor="#065f46" stopOpacity="0.2" />
                        <stop offset="70%" stopColor="#047857" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#064e3b" stopOpacity="0.4" />
                      </radialGradient>
                    </defs>

                    {/* Alternating lawn mowing circular bands */}
                    <ellipse cx="500" cy="300" rx="480" ry="280" fill="url(#lawnPattern)" />
                    <ellipse cx="500" cy="300" rx="420" ry="240" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.15" />
                    <ellipse cx="500" cy="300" rx="340" ry="190" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" />
                    
                    {/* 30-Yard Fielding Circle (Dashed White Ring) */}
                    <ellipse cx="500" cy="310" rx="270" ry="150" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.45" />

                    {/* Boundary Rope Oval */}
                    <ellipse cx="500" cy="300" rx="470" ry="270" fill="none" stroke="#f8fafc" strokeWidth="2" strokeOpacity="0.3" />

                    {/* Perspective 22-Yard Turf Pitch Strip (Narrow at top bowling end, wider at batting end) */}
                    <polygon points="465,110 535,110 545,490 455,490" fill="url(#pitchGrad)" stroke="#78350f" strokeWidth="1" />

                    {/* Pitch Crease Markings */}
                    {/* Bowling Crease (Top) */}
                    <line x1="450" y1="130" x2="550" y2="130" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
                    {/* Batting Popping Crease (Bottom) */}
                    <line x1="435" y1="460" x2="565" y2="460" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />

                    {/* Stumps - Bowling End (Top) */}
                    <rect x="495" y="122" width="3" height="12" fill="#fef08a" rx="1" />
                    <rect x="500" y="122" width="3" height="12" fill="#fef08a" rx="1" />
                    <rect x="505" y="122" width="3" height="12" fill="#fef08a" rx="1" />
                    <rect x="493" y="121" width="17" height="2" fill="#fef08a" rx="1" />

                    {/* Stumps - Batting End (Bottom) */}
                    <rect x="494" y="468" width="3.5" height="16" fill="#fef08a" rx="1" />
                    <rect x="500" y="468" width="3.5" height="16" fill="#fef08a" rx="1" />
                    <rect x="506" y="468" width="3.5" height="16" fill="#fef08a" rx="1" />
                    <rect x="492" y="467" width="20" height="2.5" fill="#fef08a" rx="1" />

                    {/* Dynamic Laser Trajectory from Batting Crease to Outfield */}
                    {lastShotTraj && (
                      <g>
                        <line 
                          x1="520" 
                          y1="450" 
                          x2={lastShotTraj.x * 10} 
                          y2={lastShotTraj.y * 6} 
                          stroke={lastBall?.isSix ? '#fbbf24' : lastBall?.isFour ? '#38bdf8' : '#34d399'} 
                          strokeWidth={isBallAnimating ? 3.5 : 2} 
                          strokeDasharray={isBallAnimating ? 'none' : '4 4'}
                          strokeOpacity={0.8}
                          className={isBallAnimating ? 'animate-pulse' : ''}
                        />
                        {/* Ripple Ring at Boundary Impact */}
                        {(lastBall?.isFour || lastBall?.isSix) && (
                          <circle 
                            cx={lastShotTraj.x * 10} 
                            cy={lastShotTraj.y * 6} 
                            r="18" 
                            fill="none" 
                            stroke={lastBall?.isSix ? '#fbbf24' : '#38bdf8'} 
                            strokeWidth="2" 
                            className="animate-ping" 
                          />
                        )}
                      </g>
                    )}
                  </svg>

                  {/* ─── CHARACTERS: BROADCAST RADAR TACTICAL CRESTS ─── */}

                  {/* 1. STRIKER BATTER (At Batting Crease) */}
                  <div 
                    className="absolute z-20 flex flex-col items-center pointer-events-none transition-transform duration-300"
                    style={{ left: '52%', top: '72%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="mb-0.5 px-1.5 py-0.2 rounded-full bg-slate-950/90 border border-amber-400 text-[8px] font-mono font-bold text-amber-300 whitespace-nowrap shadow-md flex items-center gap-0.5 backdrop-blur-md">
                      <span>🏏</span>
                      <span>{formatPlayerInitial(strikerPlayer?.name) || 'Batter'}*</span>
                      <span className="text-white text-[7.5px]">({activeInnings.battingScorecard.find(b => b.name === strikerPlayer?.name)?.runs || 0})</span>
                    </div>
                    <div className={`relative flex items-center justify-center transition-transform duration-300 ${isBallAnimating ? 'scale-125' : ''}`}>
                      <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-xs animate-pulse" />
                      <div 
                        className="w-5.5 h-5.5 rounded-full border border-white flex items-center justify-center text-[10px] shadow-lg font-bold"
                        style={{ backgroundColor: battingTeamColor }}
                      >
                        🏏
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center text-[6px] text-slate-950 font-black">
                        ★
                      </div>
                    </div>
                  </div>

                  {/* 2. WICKETKEEPER (Directly Behind Stumps) */}
                  <div 
                    className="absolute z-10 flex flex-col items-center pointer-events-none"
                    style={{ left: '50%', top: '86%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div 
                      className="w-4.5 h-4.5 rounded-full border border-white/70 flex items-center justify-center text-[9px] shadow-sm"
                      style={{ backgroundColor: bowlingTeamColor }}
                    >
                      🧤
                    </div>
                    <span className="text-[7px] font-mono text-gray-200 bg-slate-950/80 px-1 py-0.2 rounded border border-white/10 mt-0.5">
                      WK
                    </span>
                  </div>

                  {/* 3. 1ST SLIP */}
                  <div 
                    className="absolute z-10 flex flex-col items-center pointer-events-none"
                    style={{ left: '40%', top: '85%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center text-[8px] shadow-xs opacity-90"
                      style={{ backgroundColor: bowlingTeamColor }}
                    >
                      ⚡
                    </div>
                    <span className="text-[7px] font-mono text-gray-300">Slip</span>
                  </div>

                  {/* 4. BOWLER (At Bowling Crease - Offset Left to prevent overlap) */}
                  <div 
                    className="absolute z-20 flex flex-col items-center pointer-events-none transition-transform duration-300"
                    style={{ left: '36%', top: '12%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="mb-0.5 px-1.5 py-0.2 rounded-full bg-slate-950/90 border border-rose-500 text-[8px] font-mono font-bold text-rose-300 whitespace-nowrap shadow-md flex items-center gap-0.5 backdrop-blur-md">
                      <span>🎯</span>
                      <span>{formatPlayerInitial(bowlerPlayer?.name) || 'Bowler'}</span>
                    </div>
                    <div className={`relative flex items-center justify-center transition-transform duration-300 ${isBallAnimating ? 'scale-125 translate-y-1' : ''}`}>
                      <div className="absolute -inset-1 rounded-full bg-rose-500/30 blur-xs animate-pulse" />
                      <div 
                        className="w-5.5 h-5.5 rounded-full border border-white flex items-center justify-center text-[10px] shadow-lg font-bold"
                        style={{ backgroundColor: bowlingTeamColor }}
                      >
                        🔴
                      </div>
                    </div>
                  </div>

                  {/* 5. NON-STRIKER (Backing Up - Offset Right Safely Clear of Crease) */}
                  <div 
                    className="absolute z-10 flex flex-col items-center pointer-events-none"
                    style={{ left: '68%', top: '24%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div 
                      className="w-4.5 h-4.5 rounded-full border border-amber-400/70 flex items-center justify-center text-[9px] shadow-xs"
                      style={{ backgroundColor: battingTeamColor }}
                    >
                      🏃
                    </div>
                    <div className="text-[7.5px] font-mono font-bold text-amber-200 bg-slate-950/90 px-1.5 py-0.2 rounded-full border border-white/20 mt-0.5 whitespace-nowrap shadow-sm">
                      {formatPlayerInitial(nonStrikerPlayer?.name) || 'Runner'}
                    </div>
                  </div>

                  {/* ─── 9 DYNAMIC BROADCAST FIELDERS (COMPACT TACTICAL MARKERS) ─── */}
                  {dynamicFielders.map((f, idx) => (
                    <div 
                      key={idx}
                      className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out"
                      style={{ left: f.x, top: f.y, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shadow-md ${
                        f.isDeep 
                          ? 'border-rose-400 bg-rose-950 ring-1 ring-rose-500/50' 
                          : 'border-emerald-400 bg-slate-950'
                      }`}>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: bowlingTeamColor }}
                        />
                      </div>
                      <span className={`mt-0.5 text-[7.5px] font-bold font-mono px-1 py-0.2 rounded-full shadow-md flex items-center gap-0.5 whitespace-nowrap border backdrop-blur-md ${
                        f.isDeep 
                          ? 'bg-rose-950/90 text-rose-200 border-rose-500/80' 
                          : 'bg-slate-950/90 text-emerald-200 border-emerald-500/70'
                      }`}>
                        {f.isDeep && <span>🚩</span>}
                        <span>{f.name}</span>
                      </span>
                    </div>
                  ))}

                  {/* Close 2D Tactical Field */}
                </div>

            {/* ─── USER TACTICAL COMMAND DECK ─── */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shrink-0 flex flex-col gap-1.5">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Zap size={13} />
                  {isUserBatting ? 'Batting Shots' : 'Bowling Deliveries'}
                </span>
              </div>

              {isUserBatting ? (
                <>
                  {/* 6 Shot Intent Buttons for Ball-by-Ball (0, 1, 2, 3, 4, 6) */}
                  <div className="grid grid-cols-6 gap-1">
                    {[
                      { val: '0', label: '0', sub: 'Dot', color: 'border-slate-500/70 bg-slate-800/80 text-gray-200' },
                      { val: '1', label: '1', sub: 'Single', color: 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300' },
                      { val: '2', label: '2', sub: 'Double', color: 'border-teal-500/60 bg-teal-950/60 text-teal-300' },
                      { val: '3', label: '3', sub: 'Triple', color: 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300' },
                      { val: '4', label: '4', sub: 'Four', color: 'border-sky-500/80 bg-sky-950/80 text-sky-300' },
                      { val: '6', label: '6', sub: 'Six', color: 'border-amber-500 bg-amber-950/80 text-amber-300' }
                    ].map(b => (
                      <button
                        key={b.val}
                        onClick={() => {
                          gameAudio.playUiTap('select');
                          triggerGameHaptic('light');
                          executeBall(b.val as BattingTactic);
                        }}
                        disabled={matchDone}
                        className={`py-2 px-1 rounded-xl text-center border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ${b.color} hover:brightness-125`}
                      >
                        <span className="text-sm font-black font-mono leading-none">{b.label}</span>
                        <span className="text-[8px] font-bold mt-0.5 leading-tight opacity-90">{b.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Full Over Batting Options */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase flex items-center gap-1">
                      <FastForward size={11} className="text-amber-400" /> Full Over:
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleSimulateOver('DEFEND_OVER', undefined)}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-center text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <div className="text-xs font-bold text-gray-200">🛡️ Defend</div>
                    </button>
                    <button
                      onClick={() => handleSimulateOver('NORMAL_OVER', undefined)}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-center text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <div className="text-xs font-bold text-emerald-300">⚖️ Normal</div>
                    </button>
                    <button
                      onClick={() => handleSimulateOver('ATTACK_OVER', undefined)}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-center text-amber-300 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <div className="text-xs font-bold text-amber-300">⚡ Attack</div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* 3 Bowling Delivery Buttons for Ball-by-Ball (Defend, Normal, Attack) */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                        executeBall('DEFEND');
                      }}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-sky-500/50 text-center text-white transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <div className="text-xs font-bold text-sky-300">🛡️ Defend</div>
                    </button>
                    <button
                      onClick={() => {
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                        executeBall('NORMAL');
                      }}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-emerald-500/50 text-center text-white transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <div className="text-xs font-bold text-emerald-300">⚖️ Good Length</div>
                    </button>
                    <button
                      onClick={() => {
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                        executeBall('ATTACK');
                      }}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-500/70 text-center text-white transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <div className="text-xs font-bold text-rose-300">⚡ Yorker</div>
                    </button>
                  </div>

                  {/* Full Over Bowling Options */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase flex items-center gap-1">
                      <FastForward size={11} className="text-sky-400" /> Full Over:
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleSimulateOver(undefined, 'DEFEND')}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-center text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <div className="text-xs font-bold text-sky-300">🛡️ Defend</div>
                    </button>
                    <button
                      onClick={() => handleSimulateOver(undefined, 'NORMAL')}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-center text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <div className="text-xs font-bold text-emerald-300">⚖️ Normal</div>
                    </button>
                    <button
                      onClick={() => handleSimulateOver(undefined, 'ATTACK')}
                      disabled={matchDone}
                      className="py-2 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-center text-rose-300 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <div className="text-xs font-bold text-rose-300">⚡ Attack</div>
                    </button>
                  </div>
                </>
              )}

              {/* Instant Result Action */}
              <div className="pt-1 border-t border-white/10 flex items-center justify-end">
                <button
                  onClick={handleInstantResult}
                  disabled={matchDone}
                  className="w-full py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <span>Instant Result (Skip to Match End)</span>
                  <ChevronRight size={13} />
                </button>
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
                  <strong className="text-sm font-black text-amber-300 block">{formatPlayerInitial(potm.player)}</strong>
                  <span className="text-[11px] text-gray-400 font-mono">{potm.stats}</span>
                </div>
              </div>
            )}

            {/* ─── INNINGS TAB SWITCHER FOR HIGH READABILITY ─── */}
            <div className="flex items-center gap-2 pb-1 border-b border-white/10 shrink-0">
              <button
                onClick={() => {
                  setScorecardInningsView(1);
                  gameAudio.playUiTap('select');
                  triggerGameHaptic('light');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  scorecardInningsView === 1
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                <span>🏏 1st Innings:</span>
                <span className="font-mono font-bold">{inn1.teamShort} ({inn1.totalRuns}/{inn1.totalWickets})</span>
              </button>

              <button
                onClick={() => {
                  setScorecardInningsView(2);
                  gameAudio.playUiTap('select');
                  triggerGameHaptic('light');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  scorecardInningsView === 2
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                <span>🎯 2nd Innings:</span>
                <span className="font-mono font-bold">{inn2.teamShort} ({inn2.totalRuns}/{inn2.totalWickets})</span>
              </button>
            </div>

            {/* Active Selected Innings Scorecard */}
            {(() => {
              const currentScoreInn = scorecardInningsView === 1 ? inn1 : inn2;
              const rivalShort = scorecardInningsView === 1 ? inn2.teamShort : inn1.teamShort;
              const bCount = currentScoreInn.balls.length;
              const crr = bCount > 0 ? ((currentScoreInn.totalRuns / bCount) * 6).toFixed(2) : '0.00';

              return (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-white/15 shadow-2xl space-y-4">
                  {/* Innings Vitals Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full shadow-md" style={{ backgroundColor: currentScoreInn.teamColor }} />
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white font-display">
                          {currentScoreInn.teamName}
                        </h4>
                        <span className="text-xs text-gray-400 font-mono">
                          {scorecardInningsView === 1 ? 'First Innings' : 'Second Innings (Target: ' + (inn1.totalRuns + 1) + ')'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <div className="text-xl sm:text-2xl font-black text-amber-400">
                        {currentScoreInn.totalRuns}/{currentScoreInn.totalWickets}
                        <span className="text-xs text-gray-400 ml-1.5 font-normal">
                          ({Math.floor(bCount / 6)}.{bCount % 6} / 20 ov)
                        </span>
                      </div>
                      <div className="text-xs text-gray-300">
                        CRR: <strong className="text-white">{crr}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Batting Scorecard Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 shadow-inner">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-[11px] text-gray-400 uppercase bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="py-2.5 px-3">Batter</th>
                          <th className="py-2.5 px-2">Dismissal</th>
                          <th className="py-2.5 px-2 text-right text-amber-300">R</th>
                          <th className="py-2.5 px-2 text-right">B</th>
                          <th className="py-2.5 px-2 text-right text-sky-300">4s</th>
                          <th className="py-2.5 px-2 text-right text-emerald-300">6s</th>
                          <th className="py-2.5 px-3 text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-200">
                        {currentScoreInn.battingScorecard.map((b, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="py-2 px-3 font-sans font-bold text-white text-xs sm:text-sm">
                              {formatPlayerInitial(b.name)}
                              {b.dismissal === 'not out' && <span className="text-emerald-400 ml-1">*</span>}
                            </td>
                            <td className="py-2 px-2 text-xs">
                              {b.dismissal === 'not out' ? (
                                <span className="text-emerald-400 font-bold">not out</span>
                              ) : (
                                <span className="text-gray-400">{b.dismissal}</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right font-black text-amber-300 text-xs sm:text-sm">{b.runs}</td>
                            <td className="py-2 px-2 text-right text-gray-400">{b.balls}</td>
                            <td className="py-2 px-2 text-right text-sky-300 font-bold">{b.fours}</td>
                            <td className="py-2 px-2 text-right text-emerald-300 font-bold">{b.sixes}</td>
                            <td className="py-2 px-3 text-right text-gray-300">{b.strikeRate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Fall of Wickets Strip */}
                  {currentScoreInn.fallOfWickets.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Fall of Wickets:
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                        {currentScoreInn.fallOfWickets.map((fow, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300 shrink-0"
                          >
                            <strong className="text-rose-400 font-black">{fow.wicket}-{fow.score}</strong>{' '}
                            <span className="text-gray-200">({formatPlayerInitial(fow.player)}, {fow.over} ov)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bowling Figures Table */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Target size={13} className="text-rose-400" />
                      Bowling Figures ({rivalShort})
                    </h5>
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 shadow-inner">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-gray-400 uppercase bg-white/5 border-b border-white/10">
                          <tr>
                            <th className="py-2.5 px-3">Bowler</th>
                            <th className="py-2.5 px-2 text-right">Overs</th>
                            <th className="py-2.5 px-2 text-right text-rose-300">Runs</th>
                            <th className="py-2.5 px-2 text-right text-emerald-400">Wkts</th>
                            <th className="py-2.5 px-3 text-right">Econ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-200">
                          {currentScoreInn.bowlingFigures.map((bw, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="py-2 px-3 font-sans font-bold text-white text-xs sm:text-sm">
                                {formatPlayerInitial(bw.name)}
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-gray-300">{bw.overs}</td>
                              <td className="py-2 px-2 text-right text-rose-300 font-black">{bw.runs}</td>
                              <td className="py-2 px-2 text-right font-black text-emerald-400 text-xs sm:text-sm">{bw.wickets}</td>
                              <td className="py-2 px-3 text-right text-gray-300">{bw.economy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              );
            })()}

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
        </>
      )}

      {/* ─── MODAL 1: BATTING ORDER REORDERING MANAGER ─── */}
      {showBattingOrderModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ListOrdered size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">Tactical Batting Order</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Promote power-hitters or anchors for next wickets</p>
                </div>
              </div>
              <button
                onClick={() => setShowBattingOrderModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {/* Active At Crease */}
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Currently At Crease:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-xs">
                    <span className="text-[9px] text-amber-300 font-bold block">🏏 STRIKER</span>
                    <strong className="text-white text-xs sm:text-sm truncate block mt-0.5">
                      {formatPlayerInitial(strikerPlayer?.name)}
                    </strong>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {activeInnings.battingScorecard.find(b => b.name === strikerPlayer?.name)?.runs || 0} runs ({activeInnings.battingScorecard.find(b => b.name === strikerPlayer?.name)?.balls || 0}b)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-xs">
                    <span className="text-[9px] text-gray-400 font-bold block">🏃 RUNNER</span>
                    <strong className="text-white text-xs sm:text-sm truncate block mt-0.5">
                      {formatPlayerInitial(nonStrikerPlayer?.name)}
                    </strong>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {activeInnings.battingScorecard.find(b => b.name === nonStrikerPlayer?.name)?.runs || 0} runs ({activeInnings.battingScorecard.find(b => b.name === nonStrikerPlayer?.name)?.balls || 0}b)
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Batters Queue */}
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Upcoming Batting Order (Tap arrows to reorder):
                </span>
                <div className="space-y-1.5">
                  {currentBatSquad.slice(nextBatterIdx).map((player, relIdx) => {
                    const actualIdx = nextBatterIdx + relIdx;
                    const batStat = activeInnings.battingScorecard.find(b => b.name === player.name);
                    const isOut = batStat && batStat.dismissal !== 'not out';
                    if (isOut) return null;

                    return (
                      <div
                        key={player.player_id || player.name}
                        className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            #{actualIdx + 1}
                          </span>
                          <div className="truncate">
                            <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                              <span>{formatPlayerInitial(player.name)}</span>
                              {player.is_overseas && (
                                <span className="text-[8px] px-1 rounded bg-sky-500/20 text-sky-300 font-mono">OS</span>
                              )}
                              <span className="text-[8px] px-1 rounded bg-white/10 text-gray-300 font-mono">{player.role}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handlePromoteBatter(actualIdx)}
                            disabled={actualIdx === nextBatterIdx}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 text-amber-400 cursor-pointer transition-all active:scale-95"
                            title="Promote (Bat earlier)"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleDemoteBatter(actualIdx)}
                            disabled={actualIdx === currentBatSquad.length - 1}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 text-amber-400 cursor-pointer transition-all active:scale-95"
                            title="Demote (Bat later)"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => setShowBattingOrderModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: BOWLER ROTATION MANAGER ─── */}
      {showBowlerModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">Select Next Bowler</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Choose from your 11 players • Max 4 overs per bowler</p>
                </div>
              </div>
              <button
                onClick={() => setShowBowlerModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {bowlingSquad.slice(0, 11).map((b, bIdx) => {
                const isCurrent = currentBowlerIdx === bIdx;
                const ovsCount = getBowlerOversCount(activeInnings.bowlingFigures, b.name);
                const fig = activeInnings.bowlingFigures.find(f => f.name === b.name);
                const isQuotaFull = ovsCount >= 4;
                const isLastBowler = lastBowlerIdx !== null && bIdx === lastBowlerIdx;
                const isDisabled = isQuotaFull || isLastBowler;

                return (
                  <div
                    key={b.player_id || b.name}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                      isCurrent
                        ? 'bg-rose-500/20 border-rose-500 shadow-md ring-1 ring-rose-400'
                        : isLastBowler
                        ? 'bg-slate-950/60 border-amber-500/30 opacity-70'
                        : isDisabled
                        ? 'bg-white/5 border-white/5 opacity-40'
                        : 'bg-slate-950/80 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-white text-xs sm:text-sm font-bold truncate">
                          {formatPlayerInitial(b.name)}
                        </strong>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isPlayerSpinner(b)
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {getDetailedPlayerRole(b)}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-black font-mono">
                            BOWLING NOW
                          </span>
                        )}
                        {isLastBowler && !isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold font-mono">
                            BOWLED PREV OVER
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-0.5">
                        Overs: <strong className="text-white">{fig?.overs || '0.0'} / 4.0</strong> • Runs: {fig?.runs || 0} • Wickets: <strong className="text-emerald-400">{fig?.wickets || 0}</strong> • Econ: {fig?.economy || '0.00'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectBowler(bIdx)}
                      disabled={isDisabled || isCurrent}
                      className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-rose-600 text-white cursor-default'
                          : isQuotaFull
                          ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                          : isLastBowler
                          ? 'bg-white/10 text-amber-400/70 border border-amber-500/30 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-95'
                      }`}
                    >
                      {isCurrent ? 'Active Spell' : isQuotaFull ? 'Quota Full 🔒' : isLastBowler ? 'Prev Over 🚫' : 'Allot Spell ➔'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => setShowBowlerModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: OPENING BOWLERS SELECTOR (OVERS 1 & 2) ─── */}
      {showOpeningBowlersModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">Allot Opening Bowlers</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Select 2 opening bowlers for Over 1 & Over 2 (No back-to-back)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentBowlerIdx(openingBowler1Idx);
                  setOpeningBowlersConfirmed(true);
                  setShowOpeningBowlersModal(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              <div>
                <label className="text-xs font-bold text-sky-300 mb-1.5 block">⚡ Opening Bowler 1 (Over 1):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {bowlingSquad.slice(0, 11).map((b, bIdx) => (
                    <button
                      key={b.player_id || bIdx}
                      onClick={() => {
                        setOpeningBowler1Idx(bIdx);
                        if (bIdx === openingBowler2Idx) {
                          setOpeningBowler2Idx((bIdx + 1) % Math.min(11, bowlingSquad.length));
                        }
                        gameAudio.playUiTap('select');
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        openingBowler1Idx === bIdx
                          ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-md'
                          : 'bg-slate-950/80 text-gray-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">#{bIdx + 1} {formatPlayerInitial(b.name)}</div>
                      <div className="text-[9px] font-mono opacity-80">{b.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-300 mb-1.5 block">🎯 Opening Bowler 2 (Over 2):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {bowlingSquad.slice(0, 11).map((b, bIdx) => (
                    <button
                      key={b.player_id || bIdx}
                      disabled={bIdx === openingBowler1Idx}
                      onClick={() => {
                        setOpeningBowler2Idx(bIdx);
                        gameAudio.playUiTap('select');
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        bIdx === openingBowler1Idx
                          ? 'opacity-30 cursor-not-allowed bg-slate-950 border-white/5'
                          : openingBowler2Idx === bIdx
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md cursor-pointer'
                          : 'bg-slate-950/80 text-gray-300 border-white/10 hover:border-white/30 cursor-pointer'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">#{bIdx + 1} {formatPlayerInitial(b.name)}</div>
                      <div className="text-[9px] font-mono opacity-80">{b.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => {
                  setCurrentBowlerIdx(openingBowler1Idx);
                  setOpeningBowlersConfirmed(true);
                  setShowOpeningBowlersModal(false);
                  gameAudio.playUiTap('select');
                  triggerGameHaptic('medium');
                }}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirm Opening Attack ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: NEXT BATTER SELECTION (AUTOMATIC ON WICKET) ─── */}
      {showNextBatterModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">Wicket Fallen! Choose Next Batter</h3>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {dismissedBatterName ? `${formatPlayerInitial(dismissedBatterName)} is OUT` : 'Batter dismissed'} • Select who walks out to the crease
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {currentBatSquad.map((p, pIdx) => {
                const bScore = activeInnings.battingScorecard.find(b => b.name === p.name);
                const isOut = bScore && bScore.dismissal !== 'not out';
                const isCurrentlyBatting = pIdx === nonStrikerIdx;
                const isSelected = pIdx === strikerIdx;
                const isAvailable = !isOut && !isCurrentlyBatting;

                return (
                  <button
                    key={p.player_id || pIdx}
                    disabled={!isAvailable}
                    onClick={() => {
                      if (dismissedBatterSlot === 'striker') {
                        setStrikerIdx(pIdx);
                      } else {
                        setNonStrikerIdx(pIdx);
                      }
                      setNextBatterIdx(prev => Math.max(prev, pIdx + 1));
                      setShowNextBatterModal(false);
                      gameAudio.playWillowCrack('single');
                      triggerGameHaptic('medium');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-400 text-white'
                        : isAvailable
                        ? 'bg-slate-950/80 border-white/10 hover:border-emerald-500/60 hover:bg-emerald-950/20 text-white cursor-pointer active:scale-98'
                        : 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate text-white">
                          #{pIdx + 1} {formatPlayerInitial(p.name)}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-mono">
                          {p.role}
                        </span>
                        {isCurrentlyBatting && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-300 font-mono">
                            AT CREASE (NON-STRIKER)
                          </span>
                        )}
                        {isOut && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono">
                            DISMISSED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {isAvailable ? 'Ready in dugout • Tap to send in' : isOut ? bScore?.dismissal : 'Currently at runner end'}
                      </div>
                    </div>

                    {isAvailable && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0">
                        Send In ➔
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => setShowNextBatterModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Confirm Batter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: OPENING PAIR SELECTOR (USER CHOOSES OPENERS) ─── */}
      {showOpeningPairModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">Select Opening Batters</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Pick who takes strike and who stands at runner end</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpeningBattersConfirmed(true);
                  setShowOpeningPairModal(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              <div>
                <label className="text-xs font-bold text-amber-300 mb-1.5 block">🏏 Striker (Takes strike for Ball 1):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentBatSquad.slice(0, 7).map((p, pIdx) => (
                    <button
                      key={p.player_id || pIdx}
                      onClick={() => {
                        setStrikerIdx(pIdx);
                        if (pIdx === nonStrikerIdx) {
                          setNonStrikerIdx((pIdx + 1) % currentBatSquad.length);
                        }
                        gameAudio.playUiTap('select');
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        strikerIdx === pIdx
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-950/80 text-gray-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{formatPlayerInitial(p.name)}</div>
                      <div className="text-[9px] font-mono opacity-80">{p.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-sky-300 mb-1.5 block">🏃 Non-Striker (Runner at bowling end):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentBatSquad.slice(0, 7).map((p, pIdx) => (
                    <button
                      key={p.player_id || pIdx}
                      disabled={pIdx === strikerIdx}
                      onClick={() => {
                        setNonStrikerIdx(pIdx);
                        gameAudio.playUiTap('select');
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        pIdx === strikerIdx
                          ? 'opacity-30 cursor-not-allowed bg-slate-950 border-white/5'
                          : nonStrikerIdx === pIdx
                          ? 'bg-sky-500 text-white border-sky-400 font-black shadow-md cursor-pointer'
                          : 'bg-slate-950/80 text-gray-300 border-white/10 hover:border-white/30 cursor-pointer'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{formatPlayerInitial(p.name)}</div>
                      <div className="text-[9px] font-mono opacity-80">{p.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => {
                  setOpeningBattersConfirmed(true);
                  setShowOpeningPairModal(false);
                  gameAudio.playWillowCrack('four');
                  triggerGameHaptic('medium');
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirm Openers ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: PAST COMPLETED OVERS SUMMARY ─── */}
      {showPastOversModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">Completed Overs Trail</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Ball-by-ball breakdown of each over</p>
                </div>
              </div>
              <button
                onClick={() => setShowPastOversModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
              {completedOversList.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs font-mono">
                  No full overs completed yet in this innings.
                </div>
              ) : (
                completedOversList.map(ov => (
                  <div key={ov.overNum} className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400 font-mono">OVER {ov.overNum}</span>
                        <span className="text-[11px] text-gray-300">({formatPlayerInitial(ov.bowlerName)})</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">
                        {ov.runs} Runs {ov.wickets > 0 ? `• ${ov.wickets} Wkt` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {ov.balls.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-sm ${
                            b.isWicket
                              ? 'bg-rose-600 text-white'
                              : b.isSix
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : b.isFour
                              ? 'bg-sky-400 text-slate-950 font-bold'
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
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => setShowPastOversModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Back to Match
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
