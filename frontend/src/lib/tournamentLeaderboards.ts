import { TournamentFixture } from '../data/scheduleGenerator';
import { getFranchise } from '../data/franchises';

export interface BatterTournamentStats {
  playerId: string;
  name: string;
  teamId: string;
  teamShort: string;
  teamColor: string;
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  highestScore: number;
  notOuts: number;
  average: number;
  strikeRate: number;
  isOrangeCapHolder: boolean;
}

export interface BowlerTournamentStats {
  playerId: string;
  name: string;
  teamId: string;
  teamShort: string;
  teamColor: string;
  matches: number;
  innings: number;
  wickets: number;
  overs: number;
  runsConceded: number;
  maidens: number;
  economy: number;
  bestBowling: string;
  isPurpleCapHolder: boolean;
}

export interface PlayerFormRating {
  status: 'hot' | 'cold' | 'normal';
  boostPct: number;
  streakText: string;
  recentScores: string[];
}

export interface PlayoffBracketNode {
  matchNo: number;
  title: string;
  teamA?: { id: string; name: string; short: string; color: string; score?: string; isWinner?: boolean };
  teamB?: { id: string; name: string; short: string; color: string; score?: string; isWinner?: boolean };
  winnerId?: string;
  status: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
  dateStr: string;
  stadium: string;
}

/**
 * Computes tournament-wide Orange Cap and Purple Cap leaderboards dynamically from all completed fixtures
 */
export function computeTournamentLeaderboards(schedule: TournamentFixture[]) {
  const batterMap: Record<string, {
    name: string;
    teamId: string;
    teamShort: string;
    teamColor: string;
    matchesSet: Set<number>;
    innings: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    highestScore: number;
    notOuts: number;
    recentScores: Array<{ matchNo: number; runs: number; notOut: boolean }>;
  }> = {};

  const bowlerMap: Record<string, {
    name: string;
    teamId: string;
    teamShort: string;
    teamColor: string;
    matchesSet: Set<number>;
    innings: number;
    wickets: number;
    ballsBowled: number;
    runsConceded: number;
    maidens: number;
    bestWickets: number;
    bestRuns: number;
    recentFigures: Array<{ matchNo: number; wickets: number; runs: number }>;
  }> = {};

  (schedule || []).forEach((fixture) => {
    if (fixture.status !== 'COMPLETED' || !fixture.scorecard) return;

    const { inn1, inn2 } = fixture.scorecard;
    const processInnings = (inn: typeof inn1, battingTeamId: string, bowlingTeamId: string) => {
      if (!inn) return;
      const batFranchise = getFranchise(battingTeamId);
      const bowlFranchise = getFranchise(bowlingTeamId);

      // 1. Batting figures
      (inn.battingScorecard || []).forEach((b) => {
        if (!b.name) return;
        const key = b.name.trim();
        if (!batterMap[key]) {
          batterMap[key] = {
            name: b.name,
            teamId: battingTeamId,
            teamShort: inn.teamShort || batFranchise.short,
            teamColor: inn.teamColor || batFranchise.color,
            matchesSet: new Set(),
            innings: 0,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            highestScore: 0,
            notOuts: 0,
            recentScores: [],
          };
        }
        const entry = batterMap[key];
        entry.matchesSet.add(fixture.matchNo);
        entry.innings += 1;
        entry.runs += b.runs || 0;
        entry.balls += b.balls || 0;
        entry.fours += b.fours || 0;
        entry.sixes += b.sixes || 0;
        const isNotOut = (b.dismissal || '').toLowerCase().includes('not out');
        if (isNotOut) entry.notOuts += 1;
        if ((b.runs || 0) > entry.highestScore) {
          entry.highestScore = b.runs;
        }
        entry.recentScores.push({ matchNo: fixture.matchNo, runs: b.runs, notOut: isNotOut });
      });

      // 2. Bowling figures
      (inn.bowlingFigures || []).forEach((bw) => {
        if (!bw.name) return;
        const key = bw.name.trim();
        if (!bowlerMap[key]) {
          bowlerMap[key] = {
            name: bw.name,
            teamId: bowlingTeamId,
            teamShort: bowlFranchise.short,
            teamColor: bowlFranchise.color,
            matchesSet: new Set(),
            innings: 0,
            wickets: 0,
            ballsBowled: 0,
            runsConceded: 0,
            maidens: 0,
            bestWickets: 0,
            bestRuns: 999,
            recentFigures: [],
          };
        }
        const bEntry = bowlerMap[key];
        bEntry.matchesSet.add(fixture.matchNo);
        bEntry.innings += 1;
        bEntry.wickets += bw.wickets || 0;
        bEntry.runsConceded += bw.runs || 0;
        bEntry.maidens += bw.maidens || 0;

        // Parse overs into total legal balls (e.g. 3.4 -> 22 balls)
        const oversVal = parseFloat(String(bw.overs || 0));
        const fullOvers = Math.floor(oversVal);
        const remBalls = Math.round((oversVal - fullOvers) * 10);
        bEntry.ballsBowled += (fullOvers * 6) + remBalls;

        // Track best bowling figures
        const w = bw.wickets || 0;
        const r = bw.runs || 0;
        if (w > bEntry.bestWickets || (w === bEntry.bestWickets && r < bEntry.bestRuns)) {
          bEntry.bestWickets = w;
          bEntry.bestRuns = r;
        }
        bEntry.recentFigures.push({ matchNo: fixture.matchNo, wickets: w, runs: r });
      });
    };

    processInnings(inn1, fixture.teamAId, fixture.teamBId);
    processInnings(inn2, fixture.teamBId, fixture.teamAId);
  });

  // Calculate sorted Orange Cap list
  const orangeCapList: BatterTournamentStats[] = Object.values(batterMap).map((b) => {
    const outs = Math.max(1, b.innings - b.notOuts);
    const avg = Math.round((b.runs / outs) * 10) / 10;
    const sr = b.balls > 0 ? Math.round(((b.runs / b.balls) * 100) * 10) / 10 : 0;
    return {
      playerId: b.name.toLowerCase().replace(/\s+/g, '_'),
      name: b.name,
      teamId: b.teamId,
      teamShort: b.teamShort,
      teamColor: b.teamColor,
      matches: b.matchesSet.size,
      innings: b.innings,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      highestScore: b.highestScore,
      notOuts: b.notOuts,
      average: avg,
      strikeRate: sr,
      isOrangeCapHolder: false,
    };
  }).sort((a, b) => b.runs - a.runs || b.strikeRate - a.strikeRate);

  if (orangeCapList.length > 0) {
    orangeCapList[0].isOrangeCapHolder = true;
  }

  // Calculate sorted Purple Cap list
  const purpleCapList: BowlerTournamentStats[] = Object.values(bowlerMap).map((bw) => {
    const oversDecimal = Math.round((bw.ballsBowled / 6) * 10) / 10;
    const econ = bw.ballsBowled > 0 ? Math.round(((bw.runsConceded / bw.ballsBowled) * 6) * 100) / 100 : 0;
    const bb = bw.bestWickets > 0 ? `${bw.bestWickets}/${bw.bestRuns}` : '-';
    return {
      playerId: bw.name.toLowerCase().replace(/\s+/g, '_'),
      name: bw.name,
      teamId: bw.teamId,
      teamShort: bw.teamShort,
      teamColor: bw.teamColor,
      matches: bw.matchesSet.size,
      innings: bw.innings,
      wickets: bw.wickets,
      overs: oversDecimal,
      runsConceded: bw.runsConceded,
      maidens: bw.maidens,
      economy: econ,
      bestBowling: bb,
      isPurpleCapHolder: false,
    };
  }).sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

  if (purpleCapList.length > 0) {
    purpleCapList[0].isPurpleCapHolder = true;
  }

  // Derive dynamic player form ratings
  const playerFormMap: Record<string, PlayerFormRating> = {};

  Object.entries(batterMap).forEach(([name, b]) => {
    const sorted = [...b.recentScores].sort((x, y) => y.matchNo - x.matchNo).slice(0, 3);
    const recentTotal = sorted.reduce((acc, curr) => acc + curr.runs, 0);
    const lastScore = sorted[0]?.runs ?? 0;

    let status: 'hot' | 'cold' | 'normal' = 'normal';
    let boostPct = 0;
    let streakText = 'Balanced Form';

    if (recentTotal >= 90 || lastScore >= 50) {
      status = 'hot';
      boostPct = 8;
      streakText = `🔥 In Form (${sorted.map(s => `${s.runs}${s.notOut ? '*' : ''}`).join(', ')})`;
    } else if (sorted.length >= 2 && recentTotal < 15) {
      status = 'cold';
      boostPct = -5;
      streakText = `❄️ Dip in Form (${sorted.map(s => s.runs).join(', ')})`;
    }

    playerFormMap[name.toLowerCase()] = {
      status,
      boostPct,
      streakText,
      recentScores: sorted.map(s => `${s.runs}${s.notOut ? '*' : ''}`),
    };
  });

  Object.entries(bowlerMap).forEach(([name, bw]) => {
    const sorted = [...bw.recentFigures].sort((x, y) => y.matchNo - x.matchNo).slice(0, 3);
    const recentWkts = sorted.reduce((acc, curr) => acc + curr.wickets, 0);
    const lastWkts = sorted[0]?.wickets ?? 0;

    const lowerName = name.toLowerCase();
    if (!playerFormMap[lowerName]) {
      let status: 'hot' | 'cold' | 'normal' = 'normal';
      let boostPct = 0;
      let streakText = 'Balanced Form';

      if (recentWkts >= 5 || lastWkts >= 3) {
        status = 'hot';
        boostPct = 8;
        streakText = `🔥 In Form (${sorted.map(s => `${s.wickets}w`).join(', ')})`;
      } else if (sorted.length >= 2 && recentWkts === 0) {
        status = 'cold';
        boostPct = -5;
        streakText = `❄️ Wicketless in last ${sorted.length} games`;
      }

      playerFormMap[lowerName] = {
        status,
        boostPct,
        streakText,
        recentScores: sorted.map(s => `${s.wickets}/${s.runs}`),
      };
    }
  });

  return {
    orangeCapList: orangeCapList.slice(0, 10),
    purpleCapList: purpleCapList.slice(0, 10),
    playerFormMap,
    orangeCapLeader: orangeCapList[0] || null,
    purpleCapLeader: purpleCapList[0] || null,
  };
}

/**
 * Extracts the 4 Playoff Knockout Brackets (Q1, Eliminator, Q2, Final)
 */
export function getPlayoffBracket(schedule: TournamentFixture[]): PlayoffBracketNode[] {
  const q1 = schedule.find(f => f.matchNo === 71);
  const elim = schedule.find(f => f.matchNo === 72);
  const q2 = schedule.find(f => f.matchNo === 73);
  const final = schedule.find(f => f.matchNo === 74);

  const formatNode = (f: TournamentFixture | undefined, defaultTitle: string, defaultDate: string, defaultStadium: string): PlayoffBracketNode => {
    if (!f) {
      return {
        matchNo: 0,
        title: defaultTitle,
        status: 'UPCOMING',
        dateStr: defaultDate,
        stadium: defaultStadium,
      };
    }

    const tA = getFranchise(f.teamAId);
    const tB = getFranchise(f.teamBId);
    const res = f.result;

    return {
      matchNo: f.matchNo,
      title: f.stage || defaultTitle,
      status: f.status,
      dateStr: f.date || defaultDate,
      stadium: f.stadiumName || defaultStadium,
      winnerId: res?.winnerTeamId,
      teamA: {
        id: f.teamAId,
        name: f.teamAName || tA.name,
        short: f.teamAShort || tA.short,
        color: f.teamAColor || tA.color,
        score: res ? `${res.teamARuns}/${res.teamAWickets}` : undefined,
        isWinner: res?.winnerTeamId === f.teamAId,
      },
      teamB: {
        id: f.teamBId,
        name: f.teamBName || tB.name,
        short: f.teamBShort || tB.short,
        color: f.teamBColor || tB.color,
        score: res ? `${res.teamBRuns}/${res.teamBWickets}` : undefined,
        isWinner: res?.winnerTeamId === f.teamBId,
      },
    };
  };

  return [
    formatNode(q1, 'Qualifier 1 (#1 vs #2)', 'May 25, 2027', 'Narendra Modi Stadium, Ahmedabad'),
    formatNode(elim, 'Eliminator (#3 vs #4)', 'May 26, 2027', 'Eden Gardens, Kolkata'),
    formatNode(q2, 'Qualifier 2 (Q1 Loser vs Elim Winner)', 'May 28, 2027', 'Narendra Modi Stadium, Ahmedabad'),
    formatNode(final, 'IPL Championship Final', 'May 30, 2027', 'Narendra Modi Stadium, Ahmedabad'),
  ];
}
