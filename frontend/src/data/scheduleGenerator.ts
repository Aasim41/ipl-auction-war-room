import { IPL_FRANCHISES, FranchiseData, getFranchise } from './franchises';

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
    teamAShort: 'Rank 2',
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

// Quick AI Simulation for other round fixtures so table updates realistically
export function simulateAIMatch(fixture: TournamentFixture): TournamentFixture['result'] {
  const fA = getFranchise(fixture.teamAId);
  const fB = getFranchise(fixture.teamBId);

  const avgPowerA = (fA.squad2026 || []).reduce((s, p) => s + (Number(p.Power_Index) || 80), 0) / Math.max(1, fA.squad2026.length);
  const avgPowerB = (fB.squad2026 || []).reduce((s, p) => s + (Number(p.Power_Index) || 80), 0) / Math.max(1, fB.squad2026.length);

  const runsA = Math.floor(155 + (avgPowerA - 80) * 2.5 + (Math.random() * 30));
  const wktsA = Math.min(10, Math.floor(4 + Math.random() * 5));
  const runsB = Math.floor(155 + (avgPowerB - 80) * 2.5 + (Math.random() * 30));
  const wktsB = Math.min(10, Math.floor(4 + Math.random() * 5));

  const aWon = runsA > runsB;
  const margin = aWon ? `${runsA - runsB} runs` : `${10 - wktsB} wickets`;
  const winner = aWon ? fA : fB;
  const pom = aWon ? (fA.squad2026[0]?.name || 'Star Player') : (fB.squad2026[0]?.name || 'Star Player');

  return {
    winnerTeamId: winner.short.toLowerCase(),
    winnerName: winner.name,
    margin,
    teamARuns: runsA,
    teamAWickets: wktsA,
    teamAOvers: 20,
    teamBRuns: runsB,
    teamBWickets: wktsB,
    teamBOvers: 20,
    pomPlayer: pom,
    pomStats: aWon ? `${Math.floor(runsA * 0.4)} runs off 34 balls` : `${Math.floor(runsB * 0.4)} runs off 32 balls`
  };
}
