import { IPL_FRANCHISES, FranchiseData, getFranchise } from './franchises';
import { formatPlayerInitial } from '../lib/nameFormatter';

export interface MatchInningsScorecard {
  teamName: string;
  teamShort: string;
  teamColor: string;
  totalRuns: number;
  totalWickets: number;
  oversPlayed: number;
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
}

export interface MatchScorecard {
  inn1: MatchInningsScorecard;
  inn2: MatchInningsScorecard;
  tossSummary?: string;
}

export interface TournamentFixture {
  matchNo: number; // 1 to 74
  round: number; // 1 to 14 (or 15 for Playoffs)
  stage: 'League' | 'Qualifier 1' | 'Eliminator' | 'Qualifier 2' | 'Final';
  teamAId: string;
  teamAName: string;
  teamAShort: string;
  teamAColor: string;
  teamAEmoji: string;
  teamBId: string;
  teamBName: string;
  teamBShort: string;
  teamBColor: string;
  teamBEmoji: string;
  venueCity: string;
  stadiumName: string;
  isMyMatch: boolean;
  status: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
  result?: {
    winnerTeamId: string;
    winnerName: string;
    margin: string;
    teamARuns: number;
    teamAWickets: number;
    teamAOvers: number;
    teamBRuns: number;
    teamBWickets: number;
    teamBOvers: number;
    pomPlayer: string;
    pomStats: string;
  };
  scorecard?: MatchScorecard;
}

export interface TournamentPointsEntry {
  teamId: string;
  teamName: string;
  shortName: string;
  color: string;
  emoji: string;
  played: number;
  won: number;
  lost: number;
  nrr: number;
  points: number;
}

export const ALL_TEAM_IDS = ['rcb', 'csk', 'mi', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'lsg', 'gt'];

// Generate the 70 Official League Matches (14 Rounds x 5 Matches/Round) + 4 Playoff Matches = 74 Matches
export function generateTournamentSchedule(myTeamId: string): TournamentFixture[] {
  const teams = [...ALL_TEAM_IDS];
  const rounds: Array<Array<[string, string]>> = [];

  // Circle algorithm for 10 teams -> 9 rounds of single round-robin
  const fixed = teams[0];
  let rotating = teams.slice(1);

  for (let r = 0; r < 9; r++) {
    const curr = [fixed, ...rotating];
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < 5; i++) {
      // Alternate home/away to maintain balance
      if ((r + i) % 2 === 0) {
        pairs.push([curr[i], curr[9 - i]]);
      } else {
        pairs.push([curr[9 - i], curr[i]]);
      }
    }
    rounds.push(pairs);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  // Rounds 10 to 14 (5 more rounds): rematch pairings with reversed home/away
  for (let r = 0; r < 5; r++) {
    const reversePairs: Array<[string, string]> = rounds[r].map(([a, b]) => [b, a]);
    rounds.push(reversePairs);
  }

  const fixtures: TournamentFixture[] = [];
  let matchCounter = 1;

  // Build 70 League Stage Matches
  for (let rIdx = 0; rIdx < rounds.length; rIdx++) {
    const roundNumber = rIdx + 1;
    const roundPairs = rounds[rIdx];

    // Put user's match first in the round for high visibility
    const sortedPairs = [...roundPairs].sort((a, b) => {
      const aIsMy = a[0] === myTeamId || a[1] === myTeamId;
      const bIsMy = b[0] === myTeamId || b[1] === myTeamId;
      return aIsMy ? -1 : bIsMy ? 1 : 0;
    });

    for (const [teamAId, teamBId] of sortedPairs) {
      const fA = getFranchise(teamAId);
      const fB = getFranchise(teamBId);
      const isMy = teamAId === myTeamId || teamBId === myTeamId;

      fixtures.push({
        matchNo: matchCounter,
        round: roundNumber,
        stage: 'League',
        teamAId,
        teamAName: fA.name,
        teamAShort: fA.short,
        teamAColor: fA.color,
        teamAEmoji: fA.emoji,
        teamBId,
        teamBName: fB.name,
        teamBShort: fB.short,
        teamBColor: fB.color,
        teamBEmoji: fB.emoji,
        venueCity: fA.stadiumCity || 'Bengaluru',
        stadiumName: fA.stadiumName || 'M. Chinnaswamy Stadium',
        isMyMatch: isMy,
        status: matchCounter === 1 || (isMy && roundNumber === 1) ? 'CURRENT' : 'UPCOMING'
      });

      matchCounter++;
    }
  }

  // Matches 71 to 74: The 4 Playoff Matches
  // Qualifier 1
  fixtures.push({
    matchNo: 71,
    round: 15,
    stage: 'Qualifier 1',
    teamAId: 'rank1',
    teamAName: 'League Leader (Rank 1)',
    teamAShort: 'Rank 1',
    teamAColor: '#f59e0b',
    teamAEmoji: '👑',
    teamBId: 'rank2',
    teamBName: 'Runner Up (Rank 2)',
    teamBShort: 'Rank 2',
    teamBColor: '#3b82f6',
    teamBEmoji: '🥈',
    venueCity: 'Ahmedabad',
    stadiumName: 'Narendra Modi Stadium',
    isMyMatch: false,
    status: 'UPCOMING'
  });

  // Eliminator
  fixtures.push({
    matchNo: 72,
    round: 15,
    stage: 'Eliminator',
    teamAId: 'rank3',
    teamAName: 'Third Place (Rank 3)',
    teamAShort: 'Rank 3',
    teamAColor: '#10b981',
    teamAEmoji: '🥉',
    teamBId: 'rank4',
    teamBName: 'Fourth Place (Rank 4)',
    teamBShort: 'Rank 4',
    teamBColor: '#ec4899',
    teamBEmoji: '⚔️',
    venueCity: 'Chennai',
    stadiumName: 'M.A. Chidambaram Stadium',
    isMyMatch: false,
    status: 'UPCOMING'
  });

  // Qualifier 2
  fixtures.push({
    matchNo: 73,
    round: 15,
    stage: 'Qualifier 2',
    teamAId: 'q1_loser',
    teamAName: 'Loser of Qualifier 1',
    teamAShort: 'Q1 Loser',
    teamAColor: '#f97316',
    teamAEmoji: '🔥',
    teamBId: 'elim_winner',
    teamBName: 'Winner of Eliminator',
    teamBShort: 'Elim Winner',
    teamBColor: '#8b5cf6',
    teamBEmoji: '⚡',
    venueCity: 'Ahmedabad',
    stadiumName: 'Narendra Modi Stadium',
    isMyMatch: false,
    status: 'UPCOMING'
  });

  // Grand Final
  fixtures.push({
    matchNo: 74,
    round: 15,
    stage: 'Final',
    teamAId: 'q1_winner',
    teamAName: 'Winner of Qualifier 1',
    teamAShort: 'Finalist 1',
    teamAColor: '#eab308',
    teamAEmoji: '🏆',
    teamBId: 'q2_winner',
    teamBName: 'Winner of Qualifier 2',
    teamBShort: 'Finalist 2',
    teamBColor: '#eab308',
    teamBEmoji: '🏆',
    venueCity: 'Ahmedabad',
    stadiumName: 'Narendra Modi Stadium (IPL Grand Final)',
    isMyMatch: false,
    status: 'UPCOMING'
  });

  return fixtures;
}

export function generateInitialPointsTable(): TournamentPointsEntry[] {
  return ALL_TEAM_IDS.map(tId => {
    const f = getFranchise(tId);
    return {
      teamId: tId,
      teamName: f.name,
      shortName: f.short,
      color: f.color,
      emoji: f.emoji,
      played: 0,
      won: 0,
      lost: 0,
      nrr: 0.00,
      points: 0
    };
  });
}

// Quick AI Simulation for other round fixtures with full realistic IPL broadcast scorecards
export function simulateAIMatch(fixture: TournamentFixture): {
  result: NonNullable<TournamentFixture['result']>;
  scorecard: MatchScorecard;
} {
  const fA = getFranchise(fixture.teamAId);
  const fB = getFranchise(fixture.teamBId);

  const squadA = fA.squad2026 && fA.squad2026.length >= 11 ? fA.squad2026.slice(0, 11) : [];
  const squadB = fB.squad2026 && fB.squad2026.length >= 11 ? fB.squad2026.slice(0, 11) : [];

  const avgPowerA = squadA.reduce((s, p) => s + (Number(p.Power_Index) || 80), 0) / Math.max(1, squadA.length || 1);
  const avgPowerB = squadB.reduce((s, p) => s + (Number(p.Power_Index) || 80), 0) / Math.max(1, squadB.length || 1);

  // Generate realistic IPL 20-over totals (145 - 225)
  const runsA = Math.floor(155 + (avgPowerA - 80) * 2.5 + (Math.random() * 32));
  const wktsA = Math.min(10, Math.floor(3 + Math.random() * 6));
  const oversA = 20.0;

  // Team B chases
  const aWon = Math.random() > (avgPowerB / (avgPowerA + avgPowerB));
  let runsB: number;
  let wktsB: number;
  let oversB: number;

  if (aWon) {
    // Team A defended
    const marginRuns = Math.floor(6 + Math.random() * 32);
    runsB = Math.max(90, runsA - marginRuns);
    wktsB = Math.min(10, Math.floor(4 + Math.random() * 6));
    oversB = 20.0;
  } else {
    // Team B successfully chased
    runsB = runsA + Math.floor(1 + Math.random() * 5);
    wktsB = Math.min(9, Math.floor(2 + Math.random() * 6));
    const chaseBalls = Math.floor(108 + Math.random() * 11); // between 18.0 and 19.5 overs
    oversB = Math.round((Math.floor(chaseBalls / 6) + (chaseBalls % 6) * 0.1) * 10) / 10;
  }

  const margin = aWon ? `${runsA - runsB} runs` : `${10 - wktsB} wickets`;
  const winner = aWon ? fA : fB;

  // Build realistic batting and bowling figures for Innings 1 (Team A bats vs Team B bowls)
  const inn1Batters = (squadA.length >= 11 ? squadA : [
    { name: `${fA.short} Opener 1`, role: 'BAT' },
    { name: `${fA.short} Opener 2`, role: 'BAT' },
    { name: `${fA.short} Top Order 3`, role: 'BAT' },
    { name: `${fA.short} Middle Order 4`, role: 'BAT' },
    { name: `${fA.short} All-Rounder 5`, role: 'AR' },
    { name: `${fA.short} Finisher 6`, role: 'BAT' },
    { name: `${fA.short} Wicket-Keeper 7`, role: 'WK' },
    { name: `${fA.short} Spinner 8`, role: 'BOWL' },
    { name: `${fA.short} Pacer 9`, role: 'BOWL' },
    { name: `${fA.short} Strike Bowler 10`, role: 'BOWL' },
    { name: `${fA.short} Tailender 11`, role: 'BOWL' },
  ]).slice(0, 11);

  const inn2Bowlers = (squadB.filter(p => p.role === 'BOWL' || p.role === 'AR').length >= 5
    ? squadB.filter(p => p.role === 'BOWL' || p.role === 'AR').slice(0, 5)
    : squadB.slice(6, 11));

  // Distribute Innings 1 Runs
  let remainingRuns1 = runsA;
  let remainingBalls1 = 120;
  const batting1 = inn1Batters.map((p, idx) => {
    const formattedName = formatPlayerInitial(p.name);
    if (idx >= wktsA + 2) {
      return {
        name: formattedName,
        dismissal: 'did not bat',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: '0.0'
      };
    }
    const isOut = idx < wktsA;
    const shareWeight = idx === 0 ? 0.28 : idx === 1 ? 0.22 : idx === 2 ? 0.20 : idx === 3 ? 0.15 : 0.08;
    const targetRuns = isOut ? Math.max(2, Math.floor(remainingRuns1 * shareWeight)) : Math.max(6, Math.floor(remainingRuns1 * 0.4));
    const runs = Math.min(remainingRuns1, targetRuns);
    remainingRuns1 = Math.max(0, remainingRuns1 - runs);

    const sr = 120 + Math.floor(Math.random() * 65);
    const balls = Math.max(2, Math.min(remainingBalls1, Math.round((runs / sr) * 100) || 1));
    remainingBalls1 = Math.max(0, remainingBalls1 - balls);

    const fours = Math.floor(runs / 12);
    const sixes = Math.floor((runs - fours * 4) / 10);
    const dismissal = isOut
      ? (idx % 3 === 0 ? 'b ' + formatPlayerInitial(inn2Bowlers[idx % inn2Bowlers.length]?.name || 'Bowler')
         : idx % 3 === 1 ? 'c ' + formatPlayerInitial(squadB[0]?.name || 'Fielder') + ' b ' + formatPlayerInitial(inn2Bowlers[(idx + 1) % inn2Bowlers.length]?.name || 'Bowler')
         : 'lbw b ' + formatPlayerInitial(inn2Bowlers[idx % inn2Bowlers.length]?.name || 'Bowler'))
      : 'not out';

    return {
      name: formattedName,
      dismissal,
      runs,
      balls,
      fours,
      sixes,
      strikeRate: balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0'
    };
  });

  // Distribute Innings 1 Bowling Figures
  let remainingWkts1 = wktsA;
  let remainingBowlerRuns1 = runsA;
  const bowling1 = inn2Bowlers.map((b, idx) => {
    const w = idx === 4 ? remainingWkts1 : Math.min(remainingWkts1, Math.floor(Math.random() * 2));
    remainingWkts1 = Math.max(0, remainingWkts1 - w);
    const r = idx === 4 ? remainingBowlerRuns1 : Math.min(remainingBowlerRuns1, Math.floor(runsA / 5 + (Math.random() * 12 - 6)));
    remainingBowlerRuns1 = Math.max(0, remainingBowlerRuns1 - r);
    return {
      name: formatPlayerInitial(b.name),
      overs: '4.0',
      maidens: r < 20 ? 1 : 0,
      runs: r,
      wickets: w,
      economy: (r / 4.0).toFixed(2)
    };
  });

  // Build Innings 2 Batting & Bowling Figures (Team B bats vs Team A bowls)
  const inn2Batters = (squadB.length >= 11 ? squadB : [
    { name: `${fB.short} Opener 1`, role: 'BAT' },
    { name: `${fB.short} Opener 2`, role: 'BAT' },
    { name: `${fB.short} Top Order 3`, role: 'BAT' },
    { name: `${fB.short} Middle Order 4`, role: 'BAT' },
    { name: `${fB.short} All-Rounder 5`, role: 'AR' },
    { name: `${fB.short} Finisher 6`, role: 'BAT' },
    { name: `${fB.short} Wicket-Keeper 7`, role: 'WK' },
    { name: `${fB.short} Spinner 8`, role: 'BOWL' },
    { name: `${fB.short} Pacer 9`, role: 'BOWL' },
    { name: `${fB.short} Strike Bowler 10`, role: 'BOWL' },
    { name: `${fB.short} Tailender 11`, role: 'BOWL' },
  ]).slice(0, 11);

  const inn1Bowlers = (squadA.filter(p => p.role === 'BOWL' || p.role === 'AR').length >= 5
    ? squadA.filter(p => p.role === 'BOWL' || p.role === 'AR').slice(0, 5)
    : squadA.slice(6, 11));

  let remainingRuns2 = runsB;
  let remainingBalls2 = Math.floor(oversB * 6);
  const batting2 = inn2Batters.map((p, idx) => {
    const formattedName = formatPlayerInitial(p.name);
    if (idx >= wktsB + 2) {
      return {
        name: formattedName,
        dismissal: 'did not bat',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: '0.0'
      };
    }
    const isOut = idx < wktsB;
    const shareWeight = idx === 0 ? 0.30 : idx === 1 ? 0.25 : idx === 2 ? 0.20 : 0.12;
    const targetRuns = isOut ? Math.max(3, Math.floor(remainingRuns2 * shareWeight)) : Math.max(10, Math.floor(remainingRuns2 * 0.45));
    const runs = Math.min(remainingRuns2, targetRuns);
    remainingRuns2 = Math.max(0, remainingRuns2 - runs);

    const sr = 125 + Math.floor(Math.random() * 70);
    const balls = Math.max(2, Math.min(remainingBalls2, Math.round((runs / sr) * 100) || 1));
    remainingBalls2 = Math.max(0, remainingBalls2 - balls);

    const fours = Math.floor(runs / 11);
    const sixes = Math.floor((runs - fours * 4) / 9);
    const dismissal = isOut
      ? (idx % 2 === 0 ? 'c ' + formatPlayerInitial(squadA[1]?.name || 'Keeper') + ' b ' + formatPlayerInitial(inn1Bowlers[idx % inn1Bowlers.length]?.name || 'Bowler')
         : 'b ' + formatPlayerInitial(inn1Bowlers[(idx + 1) % inn1Bowlers.length]?.name || 'Bowler'))
      : 'not out';

    return {
      name: formattedName,
      dismissal,
      runs,
      balls,
      fours,
      sixes,
      strikeRate: balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0'
    };
  });

  let remainingWkts2 = wktsB;
  let remainingBowlerRuns2 = runsB;
  const bowling2 = inn1Bowlers.map((b, idx) => {
    const w = idx === 4 ? remainingWkts2 : Math.min(remainingWkts2, Math.floor(Math.random() * 2));
    remainingWkts2 = Math.max(0, remainingWkts2 - w);
    const r = idx === 4 ? remainingBowlerRuns2 : Math.min(remainingBowlerRuns2, Math.floor(runsB / 5 + (Math.random() * 10 - 5)));
    remainingBowlerRuns2 = Math.max(0, remainingBowlerRuns2 - r);
    return {
      name: formatPlayerInitial(b.name),
      overs: `${Math.floor(oversB / 5)}.${Math.floor((oversB * 6) % 6)}`,
      maidens: 0,
      runs: r,
      wickets: w,
      economy: (r / Math.max(1, oversB / 5)).toFixed(2)
    };
  });

  // Pick Player of the Match from the winning team
  let pomPlayer = '';
  let pomStats = '';
  if (aWon) {
    // Check if best bowler took 3+ wickets
    const topWicketBowler = [...bowling2].sort((x, y) => y.wickets - x.wickets)[0];
    const topRunBatter = [...batting1].sort((x, y) => y.runs - x.runs)[0];
    if (topWicketBowler && topWicketBowler.wickets >= 3) {
      pomPlayer = topWicketBowler.name;
      pomStats = `${topWicketBowler.wickets}/${topWicketBowler.runs} (${topWicketBowler.overs} ov)`;
    } else if (topRunBatter) {
      pomPlayer = topRunBatter.name;
      pomStats = `${topRunBatter.runs} runs (${topRunBatter.balls}b • ${topRunBatter.fours}x4, ${topRunBatter.sixes}x6)`;
    } else {
      pomPlayer = formatPlayerInitial(squadA[0]?.name || `${fA.short} Captain`);
      pomStats = 'Match Winning Captaincy & 42 runs';
    }
  } else {
    const topRunBatter = [...batting2].sort((x, y) => y.runs - x.runs)[0];
    const topWicketBowler = [...bowling1].sort((x, y) => y.wickets - x.wickets)[0];
    if (topRunBatter && topRunBatter.runs >= 45) {
      pomPlayer = topRunBatter.name;
      pomStats = `${topRunBatter.runs}* runs (${topRunBatter.balls}b • ${topRunBatter.fours}x4, ${topRunBatter.sixes}x6)`;
    } else if (topWicketBowler && topWicketBowler.wickets >= 3) {
      pomPlayer = topWicketBowler.name;
      pomStats = `${topWicketBowler.wickets}/${topWicketBowler.runs} (${topWicketBowler.overs} ov)`;
    } else {
      pomPlayer = formatPlayerInitial(squadB[0]?.name || `${fB.short} Star`);
      pomStats = '52* runs off 31 balls';
    }
  }

  const resultData: NonNullable<TournamentFixture['result']> = {
    winnerTeamId: winner.short.toLowerCase(),
    winnerName: winner.name,
    margin,
    teamARuns: runsA,
    teamAWickets: wktsA,
    teamAOvers: oversA,
    teamBRuns: runsB,
    teamBWickets: wktsB,
    teamBOvers: oversB,
    pomPlayer,
    pomStats
  };

  const scorecard: MatchScorecard = {
    tossSummary: `${fA.name} won the toss and elected to bat first`,
    inn1: {
      teamName: fA.name,
      teamShort: fA.short,
      teamColor: fA.color,
      totalRuns: runsA,
      totalWickets: wktsA,
      oversPlayed: oversA,
      battingScorecard: batting1,
      bowlingFigures: bowling1
    },
    inn2: {
      teamName: fB.name,
      teamShort: fB.short,
      teamColor: fB.color,
      totalRuns: runsB,
      totalWickets: wktsB,
      oversPlayed: oversB,
      battingScorecard: batting2,
      bowlingFigures: bowling2
    }
  };

  return {
    result: resultData,
    scorecard
  };
}
