import { IPL_FRANCHISES, FranchiseData, getFranchise } from './franchises';

export interface TournamentFixture {
  matchNo: number;
  stage: 'League' | 'Qualifier 1' | 'Eliminator' | 'Qualifier 2' | 'Final';
  rivalTeamId: string;
  rivalTeamName: string;
  rivalShort: string;
  rivalColor: string;
  rivalEmoji: string;
  venueCity: string;
  stadiumName: string;
  isHome: boolean;
  status: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
  result?: {
    winnerTeamId: string;
    winnerName: string;
    margin: string;
    myRuns: number;
    myWickets: number;
    myOvers: number;
    rivalRuns: number;
    rivalWickets: number;
    rivalOvers: number;
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

const ALL_TEAM_IDS = ['rcb', 'csk', 'mi', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'lsg', 'gt'];

export function generateTournamentSchedule(myTeamId: string): TournamentFixture[] {
  const myFranchise = getFranchise(myTeamId);
  const rivals = ALL_TEAM_IDS.filter(id => id !== myTeamId);

  // 14 League Fixtures (9 matches vs each rival, plus 5 reverse clashes with marquee rivals)
  const fixtureSequence = [
    rivals[0], rivals[1], rivals[2], rivals[3], rivals[4],
    rivals[5], rivals[6], rivals[7], rivals[8],
    rivals[0], rivals[1], rivals[2], rivals[3], rivals[4]
  ];

  const fixtures: TournamentFixture[] = fixtureSequence.map((rId, index) => {
    const rival = getFranchise(rId);
    const isHome = index % 2 === 0;
    const stadium = isHome ? myFranchise.stadiumName : rival.stadiumName;
    const city = isHome ? (myFranchise.stadiumCity || 'Bengaluru') : (rival.stadiumCity || 'Mumbai');

    return {
      matchNo: index + 1,
      stage: 'League',
      rivalTeamId: rId,
      rivalTeamName: rival.name,
      rivalShort: rival.short,
      rivalColor: rival.color,
      rivalEmoji: rival.emoji,
      venueCity: city,
      stadiumName: stadium,
      isHome,
      status: index === 0 ? 'CURRENT' : 'UPCOMING'
    };
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
