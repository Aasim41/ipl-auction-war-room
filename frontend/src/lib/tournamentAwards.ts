import { TournamentFixture, MatchScorecard } from '../data/scheduleGenerator';
import { getFranchise, IPL_FRANCHISES } from '../data/franchises';

export interface PlayerBattingAwardStats {
  playerName: string;
  teamShort: string;
  teamName: string;
  teamColor: string;
  teamEmoji: string;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  highestScore: number;
  highestScoreNotOut: boolean;
  strikeRate: number;
  average: number;
}

export interface PlayerBowlingAwardStats {
  playerName: string;
  teamShort: string;
  teamName: string;
  teamColor: string;
  teamEmoji: string;
  matches: number;
  overs: string;
  totalBalls: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  strikeRate: number;
  bestFigures: string;
  bestWickets: number;
  bestRuns: number;
}

export interface MVPAwardStats {
  playerName: string;
  teamShort: string;
  teamName: string;
  teamColor: string;
  teamEmoji: string;
  role: string;
  runs: number;
  wickets: number;
  mvpPoints: number;
  highlight: string;
}

export interface EmergingPlayerAwardStats {
  playerName: string;
  teamShort: string;
  teamName: string;
  teamColor: string;
  teamEmoji: string;
  role: string;
  age: number;
  runs: number;
  wickets: number;
  impactScore: number;
  highlight: string;
}

export interface HallOfFameRecords {
  highestTeamTotal: { team: string; score: string; opp: string; date: string; season: string };
  fastestFifty: { player: string; team: string; balls: number; opp: string; season: string };
  bestBowlingFigures: { player: string; team: string; figures: string; opp: string; season: string };
  highestIndividualScore: { player: string; team: string; score: string; balls: number; opp: string; season: string };
  mostSixesInInnings: { player: string; team: string; sixes: number; opp: string; season: string };
  highestRunChase: { team: string; target: number; opp: string; season: string };
}

export interface TournamentAwardsSummary {
  orangeCapLeader: PlayerBattingAwardStats | null;
  orangeCapTop5: PlayerBattingAwardStats[];
  purpleCapLeader: PlayerBowlingAwardStats | null;
  purpleCapTop5: PlayerBowlingAwardStats[];
  tournamentMVP: MVPAwardStats | null;
  mvpTop5: MVPAwardStats[];
  emergingPlayer: EmergingPlayerAwardStats | null;
  emergingTop3: EmergingPlayerAwardStats[];
  hallOfFame: HallOfFameRecords;
  totalMatchesCompleted: number;
}

export interface FranchiseHistoricTrophy {
  id: string;
  seasonLabel: string;
  seasonYear: number;
  type: 'champion' | 'runner_up' | 'playoffs';
  title: string;
  subtitle: string;
  captainOrHighlight: string;
  isUserEarned?: boolean;
}

// All-Time Official IPL Trophy History per Franchise
export const FRANCHISE_HISTORIC_TROPHIES: Record<string, FranchiseHistoricTrophy[]> = {
  csk: [
    { id: 'csk_2023', seasonLabel: 'IPL 2023', seasonYear: 2023, type: 'champion', title: 'IPL Champions', subtitle: 'Beat GT by 5 wkts (DLS)', captainOrHighlight: 'MS Dhoni • Ravindra Jadeja final ball four' },
    { id: 'csk_2021', seasonLabel: 'IPL 2021', seasonYear: 2021, type: 'champion', title: 'IPL Champions', subtitle: 'Beat KKR by 27 runs in Dubai', captainOrHighlight: 'MS Dhoni • Faf du Plessis 86' },
    { id: 'csk_2018', seasonLabel: 'IPL 2018', seasonYear: 2018, type: 'champion', title: 'IPL Champions', subtitle: 'Beat SRH by 8 wkts (Fairytale Return)', captainOrHighlight: 'MS Dhoni • Shane Watson 117*' },
    { id: 'csk_2011', seasonLabel: 'IPL 2011', seasonYear: 2011, type: 'champion', title: 'IPL Champions', subtitle: 'Beat RCB by 58 runs at Chepauk', captainOrHighlight: 'MS Dhoni • Murali Vijay 95' },
    { id: 'csk_2010', seasonLabel: 'IPL 2010', seasonYear: 2010, type: 'champion', title: 'IPL Champions', subtitle: 'Beat MI by 22 runs in Navi Mumbai', captainOrHighlight: 'MS Dhoni • Maiden IPL Crown' },
    { id: 'csk_2019', seasonLabel: 'IPL 2019', seasonYear: 2019, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Lost to MI by 1 run in Hyderabad thriller', captainOrHighlight: 'MS Dhoni' },
    { id: 'csk_2015', seasonLabel: 'IPL 2015', seasonYear: 2015, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Eden Gardens Finalist', captainOrHighlight: 'MS Dhoni' },
    { id: 'csk_2013', seasonLabel: 'IPL 2013', seasonYear: 2013, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Eden Gardens Finalist', captainOrHighlight: 'MS Dhoni' },
    { id: 'csk_2012', seasonLabel: 'IPL 2012', seasonYear: 2012, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Chepauk Finalist', captainOrHighlight: 'MS Dhoni' },
    { id: 'csk_2008', seasonLabel: 'IPL 2008', seasonYear: 2008, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Inaugural IPL Finalist in Navi Mumbai', captainOrHighlight: 'MS Dhoni' },
  ],
  mi: [
    { id: 'mi_2020', seasonLabel: 'IPL 2020', seasonYear: 2020, type: 'champion', title: 'IPL Champions', subtitle: 'Beat DC by 5 wkts in Dubai (Record 5th)', captainOrHighlight: 'Rohit Sharma • Boult 3/30' },
    { id: 'mi_2019', seasonLabel: 'IPL 2019', seasonYear: 2019, type: 'champion', title: 'IPL Champions', subtitle: 'Beat CSK by 1 run (Malinga slower ball)', captainOrHighlight: 'Rohit Sharma • Jasprit Bumrah 2/14' },
    { id: 'mi_2017', seasonLabel: 'IPL 2017', seasonYear: 2017, type: 'champion', title: 'IPL Champions', subtitle: 'Beat RPS by 1 run in Hyderabad', captainOrHighlight: 'Rohit Sharma • Krunal Pandya 47' },
    { id: 'mi_2015', seasonLabel: 'IPL 2015', seasonYear: 2015, type: 'champion', title: 'IPL Champions', subtitle: 'Beat CSK by 41 runs at Eden Gardens', captainOrHighlight: 'Rohit Sharma 50 (26b)' },
    { id: 'mi_2013', seasonLabel: 'IPL 2013', seasonYear: 2013, type: 'champion', title: 'IPL Champions', subtitle: 'Beat CSK by 23 runs at Eden Gardens', captainOrHighlight: 'Rohit Sharma • Pollard 60*' },
    { id: 'mi_2010', seasonLabel: 'IPL 2010', seasonYear: 2010, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Finalist vs CSK', captainOrHighlight: 'Sachin Tendulkar' },
    { id: 'mi_2023', seasonLabel: 'IPL 2023', seasonYear: 2023, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Reached Qualifier 2 in Ahmedabad', captainOrHighlight: 'Suryakumar Yadav 605 runs' },
  ],
  kkr: [
    { id: 'kkr_2024', seasonLabel: 'IPL 2024', seasonYear: 2024, type: 'champion', title: 'IPL Champions', subtitle: 'Beat SRH by 8 wkts in Chennai', captainOrHighlight: 'Shreyas Iyer • Mitchell Starc 2/14' },
    { id: 'kkr_2014', seasonLabel: 'IPL 2014', seasonYear: 2014, type: 'champion', title: 'IPL Champions', subtitle: 'Beat KXIP by 3 wkts in Bengaluru', captainOrHighlight: 'Gautam Gambhir • Manish Pandey 94' },
    { id: 'kkr_2012', seasonLabel: 'IPL 2012', seasonYear: 2012, type: 'champion', title: 'IPL Champions', subtitle: 'Beat CSK by 5 wkts at Chepauk', captainOrHighlight: 'Gautam Gambhir • Manvinder Bisla 89' },
    { id: 'kkr_2021', seasonLabel: 'IPL 2021', seasonYear: 2021, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Finalist vs CSK in Dubai', captainOrHighlight: 'Eoin Morgan • Venkatesh Iyer' },
  ],
  srh: [
    { id: 'srh_2016', seasonLabel: 'IPL 2016', seasonYear: 2016, type: 'champion', title: 'IPL Champions', subtitle: 'Beat RCB by 8 runs in Bengaluru', captainOrHighlight: 'David Warner 69 • Ben Cutting 39* & 2/35' },
    { id: 'srh_2009', seasonLabel: 'IPL 2009', seasonYear: 2009, type: 'champion', title: 'IPL Champions (Deccan)', subtitle: 'Beat RCB by 6 runs in Johannesburg', captainOrHighlight: 'Adam Gilchrist • RP Singh Purple Cap' },
    { id: 'srh_2024', seasonLabel: 'IPL 2024', seasonYear: 2024, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Record 287/3 season • Chennai Finalist', captainOrHighlight: 'Pat Cummins • Travis Head & Abhishek' },
    { id: 'srh_2018', seasonLabel: 'IPL 2018', seasonYear: 2018, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Wankhede Finalist vs CSK', captainOrHighlight: 'Kane Williamson Orange Cap (735 runs)' },
  ],
  rcb: [
    { id: 'rcb_2016', seasonLabel: 'IPL 2016', seasonYear: 2016, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Historic 973-run season by Virat Kohli', captainOrHighlight: 'Virat Kohli (4x100) • AB de Villiers 687 runs' },
    { id: 'rcb_2011', seasonLabel: 'IPL 2011', seasonYear: 2011, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Chepauk Finalist vs CSK', captainOrHighlight: 'Daniel Vettori • Chris Gayle Orange Cap' },
    { id: 'rcb_2009', seasonLabel: 'IPL 2009', seasonYear: 2009, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Wanderers Finalist vs Deccan', captainOrHighlight: 'Anil Kumble 4/16 (Final POTM)' },
    { id: 'rcb_2024', seasonLabel: 'IPL 2024', seasonYear: 2024, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Sensational 6-match win streak to Playoffs', captainOrHighlight: 'Faf du Plessis & Virat Kohli' },
    { id: 'rcb_2022', seasonLabel: 'IPL 2022', seasonYear: 2022, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Qualifier 2 in Ahmedabad', captainOrHighlight: 'Rajat Patidar 112* in Eliminator' },
    { id: 'rcb_2021', seasonLabel: 'IPL 2021', seasonYear: 2021, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Sharjah Eliminator', captainOrHighlight: 'Harshal Patel Record 32 Wickets' },
    { id: 'rcb_2020', seasonLabel: 'IPL 2020', seasonYear: 2020, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Abu Dhabi Eliminator', captainOrHighlight: 'Virat Kohli' },
  ],
  rr: [
    { id: 'rr_2008', seasonLabel: 'IPL 2008', seasonYear: 2008, type: 'champion', title: 'Inaugural IPL Champions', subtitle: 'Beat CSK on final ball in Navi Mumbai', captainOrHighlight: 'Shane Warne • Yusuf Pathan 56 & 3/22' },
    { id: 'rr_2022', seasonLabel: 'IPL 2022', seasonYear: 2022, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Ahmedabad Finalist vs GT', captainOrHighlight: 'Sanju Samson • Jos Buttler 863 runs' },
    { id: 'rr_2024', seasonLabel: 'IPL 2024', seasonYear: 2024, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Reached Qualifier 2 in Chennai', captainOrHighlight: 'Sanju Samson • Riyan Parag 573 runs' },
  ],
  gt: [
    { id: 'gt_2022', seasonLabel: 'IPL 2022', seasonYear: 2022, type: 'champion', title: 'IPL Champions', subtitle: 'Debut Season Glory in Ahmedabad', captainOrHighlight: 'Hardik Pandya 34 & 3/17' },
    { id: 'gt_2023', seasonLabel: 'IPL 2023', seasonYear: 2023, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'League Leaders • Ahmedabad Finalist', captainOrHighlight: 'Shubman Gill Orange Cap (890 runs)' },
  ],
  dc: [
    { id: 'dc_2020', seasonLabel: 'IPL 2020', seasonYear: 2020, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Dubai Finalist vs MI', captainOrHighlight: 'Shreyas Iyer • Kagiso Rabada Purple Cap' },
    { id: 'dc_2021', seasonLabel: 'IPL 2021', seasonYear: 2021, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Finished 1st in League Table (20 pts)', captainOrHighlight: 'Rishabh Pant • Avesh Khan 24 wkts' },
    { id: 'dc_2019', seasonLabel: 'IPL 2019', seasonYear: 2019, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Qualifier 2 in Vizag', captainOrHighlight: 'Shreyas Iyer • Shikhar Dhawan' },
  ],
  pbks: [
    { id: 'pbks_2014', seasonLabel: 'IPL 2014', seasonYear: 2014, type: 'runner_up', title: 'Runner-Up Shield', subtitle: 'Bengaluru Finalist vs KKR', captainOrHighlight: 'George Bailey • Wriddhiman Saha 115*' },
    { id: 'pbks_2008', seasonLabel: 'IPL 2008', seasonYear: 2008, type: 'playoffs', title: 'Playoff Semi-Finalist', subtitle: 'Wankhede Semi-Final', captainOrHighlight: 'Yuvraj Singh • Shaun Marsh Orange Cap' },
  ],
  lsg: [
    { id: 'lsg_2023', seasonLabel: 'IPL 2023', seasonYear: 2023, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Chepauk Eliminator', captainOrHighlight: 'Krunal Pandya • Nicholas Pooran' },
    { id: 'lsg_2022', seasonLabel: 'IPL 2022', seasonYear: 2022, type: 'playoffs', title: 'Playoff Qualifier', subtitle: 'Debut Season Top-4 Finish', captainOrHighlight: 'KL Rahul 616 runs' },
  ]
};

// Emerging young talent pool
const EMERGING_PLAYER_CANDIDATES = new Set([
  'Yashasvi Jaiswal', 'Abhishek Sharma', 'Riyan Parag', 'Tilak Varma', 'Harshit Rana', 
  'Mayank Yadav', 'Nitish Kumar Reddy', 'Ayush Badoni', 'Priyansh Arya', 'Dhruv Jurel', 
  'Sameer Rizvi', 'Rasikh Salam', 'Vaibhav Arora', 'Suyash Sharma', 'Kumar Kushagra'
]);

// Initial Baseline Season Seeds to ensure leaderboard has rich competitive context from Day 1
const BASELINE_BATTERS: Array<Omit<PlayerBattingAwardStats, 'average' | 'strikeRate'>> = [
  { playerName: 'Virat Kohli', teamShort: 'RCB', teamName: 'Royal Challengers Bengaluru', teamColor: '#dc2626', teamEmoji: '🦁', innings: 14, runs: 661, balls: 428, fours: 58, sixes: 34, fifties: 5, hundreds: 1, highestScore: 113, highestScoreNotOut: true },
  { playerName: 'Travis Head', teamShort: 'SRH', teamName: 'Sunrisers Hyderabad', teamColor: '#ea580c', teamEmoji: '🦅', innings: 14, runs: 567, balls: 296, fours: 64, sixes: 32, fifties: 4, hundreds: 1, highestScore: 102, highestScoreNotOut: false },
  { playerName: 'Riyan Parag', teamShort: 'RR', teamName: 'Rajasthan Royals', teamColor: '#db2777', teamEmoji: '👑', innings: 14, runs: 573, balls: 384, fours: 40, sixes: 33, fifties: 4, hundreds: 0, highestScore: 84, highestScoreNotOut: true },
  { playerName: 'Sanju Samson', teamShort: 'RR', teamName: 'Rajasthan Royals', teamColor: '#db2777', teamEmoji: '👑', innings: 14, runs: 531, balls: 346, fours: 48, sixes: 24, fifties: 5, hundreds: 0, highestScore: 86, highestScoreNotOut: false },
  { playerName: 'Heinrich Klaasen', teamShort: 'SRH', teamName: 'Sunrisers Hyderabad', teamColor: '#ea580c', teamEmoji: '🦅', innings: 14, runs: 479, balls: 279, fours: 19, sixes: 38, fifties: 4, hundreds: 0, highestScore: 80, highestScoreNotOut: true },
  { playerName: 'Ruturaj Gaikwad', teamShort: 'CSK', teamName: 'Chennai Super Kings', teamColor: '#fbbf24', teamEmoji: '🦁', innings: 14, runs: 583, balls: 413, fours: 58, sixes: 18, fifties: 4, hundreds: 1, highestScore: 108, highestScoreNotOut: true },
  { playerName: 'Sunil Narine', teamShort: 'KKR', teamName: 'Kolkata Knight Riders', teamColor: '#7c3aed', teamEmoji: '⚔️', innings: 14, runs: 488, balls: 270, fours: 50, sixes: 33, fifties: 3, hundreds: 1, highestScore: 109, highestScoreNotOut: false },
  { playerName: 'KL Rahul', teamShort: 'DC', teamName: 'Delhi Capitals', teamColor: '#0284c7', teamEmoji: '🐯', innings: 14, runs: 520, balls: 382, fours: 45, sixes: 19, fifties: 4, hundreds: 0, highestScore: 82, highestScoreNotOut: false },
  { playerName: 'Rishabh Pant', teamShort: 'LSG', teamName: 'Lucknow Super Giants', teamColor: '#0891b2', teamEmoji: '🦅', innings: 13, runs: 446, balls: 288, fours: 36, sixes: 25, fifties: 3, hundreds: 0, highestScore: 88, highestScoreNotOut: true },
  { playerName: 'Shubman Gill', teamShort: 'GT', teamName: 'Gujarat Titans', teamColor: '#0d9488', teamEmoji: '⚡', innings: 12, runs: 426, balls: 290, fours: 35, sixes: 15, fifties: 2, hundreds: 1, highestScore: 104, highestScoreNotOut: false }
];

const BASELINE_BOWLERS: Array<Omit<PlayerBowlingAwardStats, 'economy' | 'strikeRate'>> = [
  { playerName: 'Jasprit Bumrah', teamShort: 'MI', teamName: 'Mumbai Indians', teamColor: '#2563eb', teamEmoji: '🔷', matches: 13, overs: '51.5', totalBalls: 311, maidens: 2, runs: 336, wickets: 20, bestFigures: '5/21', bestWickets: 5, bestRuns: 21 },
  { playerName: 'Harshal Patel', teamShort: 'PBKS', teamName: 'Punjab Kings', teamColor: '#b91c1c', teamEmoji: '🦁', matches: 14, overs: '49.0', totalBalls: 294, maidens: 0, runs: 477, wickets: 24, bestFigures: '3/15', bestWickets: 3, bestRuns: 15 },
  { playerName: 'Varun Chakaravarthy', teamShort: 'KKR', teamName: 'Kolkata Knight Riders', teamColor: '#7c3aed', teamEmoji: '⚔️', matches: 14, overs: '50.0', totalBalls: 300, maidens: 0, runs: 402, wickets: 21, bestFigures: '3/16', bestWickets: 3, bestRuns: 16 },
  { playerName: 'Arshdeep Singh', teamShort: 'PBKS', teamName: 'Punjab Kings', teamColor: '#b91c1c', teamEmoji: '🦁', matches: 14, overs: '50.2', totalBalls: 302, maidens: 0, runs: 504, wickets: 19, bestFigures: '4/29', bestWickets: 4, bestRuns: 29 },
  { playerName: 'T Natarajan', teamShort: 'DC', teamName: 'Delhi Capitals', teamColor: '#0284c7', teamEmoji: '🐯', matches: 14, overs: '51.4', totalBalls: 310, maidens: 0, runs: 468, wickets: 19, bestFigures: '4/19', bestWickets: 4, bestRuns: 19 },
  { playerName: 'Rashid Khan', teamShort: 'GT', teamName: 'Gujarat Titans', teamColor: '#0d9488', teamEmoji: '⚡', matches: 12, overs: '48.0', totalBalls: 288, maidens: 1, runs: 395, wickets: 16, bestFigures: '3/23', bestWickets: 3, bestRuns: 23 },
  { playerName: 'Sunil Narine', teamShort: 'KKR', teamName: 'Kolkata Knight Riders', teamColor: '#7c3aed', teamEmoji: '⚔️', matches: 14, overs: '55.0', totalBalls: 330, maidens: 1, runs: 368, wickets: 17, bestFigures: '2/22', bestWickets: 2, bestRuns: 22 },
  { playerName: 'Kuldeep Yadav', teamShort: 'DC', teamName: 'Delhi Capitals', teamColor: '#0284c7', teamEmoji: '🐯', matches: 11, overs: '44.0', totalBalls: 264, maidens: 0, runs: 382, wickets: 16, bestFigures: '3/55', bestWickets: 3, bestRuns: 55 },
  { playerName: 'Yuzvendra Chahal', teamShort: 'PBKS', teamName: 'Punjab Kings', teamColor: '#b91c1c', teamEmoji: '🦁', matches: 14, overs: '54.0', totalBalls: 324, maidens: 0, runs: 512, wickets: 18, bestFigures: '3/11', bestWickets: 3, bestRuns: 11 },
  { playerName: 'Pat Cummins', teamShort: 'SRH', teamName: 'Sunrisers Hyderabad', teamColor: '#ea580c', teamEmoji: '🦅', matches: 14, overs: '53.0', totalBalls: 318, maidens: 1, runs: 489, wickets: 18, bestFigures: '3/43', bestWickets: 3, bestRuns: 43 },
];

/**
 * Computes dynamic tournament honors (Orange Cap, Purple Cap, MVP, Emerging Player, Records)
 * by digesting all 74 match scorecards across all 10 franchises in real-time.
 */
export function computeTournamentAwards(schedule: TournamentFixture[], myTeamId: string) {
  const completedFixtures = (schedule || []).filter(f => f.status === 'COMPLETED' && f.scorecard);

  // Map to store aggregated player statistics
  const batterMap: Record<string, {
    name: string;
    teamShort: string;
    teamName: string;
    teamColor: string;
    teamEmoji: string;
    innings: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    fifties: number;
    hundreds: number;
    highestScore: number;
    highestScoreNotOut: boolean;
    dismissals: number;
  }> = {};

  const bowlerMap: Record<string, {
    name: string;
    teamShort: string;
    teamName: string;
    teamColor: string;
    teamEmoji: string;
    matches: Set<number>;
    totalBalls: number;
    maidens: number;
    runs: number;
    wickets: number;
    bestWickets: number;
    bestRuns: number;
  }> = {};

  // Track Current Season (IPL 2027) match records
  let highestTeamTotal = { team: 'SRH', score: '224/5', opp: 'vs RR', date: 'Rajiv Gandhi Stadium', season: 'IPL 2027' };
  let fastestFifty = { player: 'T. Head', team: 'SRH', balls: 16, opp: 'vs RR', season: 'IPL 2027' };
  let bestBowling = { player: 'J. Bumrah', team: 'MI', figures: '4/14', opp: 'vs KKR', season: 'IPL 2027' };
  let highestIndScore = { player: 'V. Kohli', team: 'RCB', score: '104*', balls: 59, opp: 'vs CSK', season: 'IPL 2027' };
  let mostSixesInnings = { player: 'H. Klaasen', team: 'SRH', sixes: 7, opp: 'vs KKR', season: 'IPL 2027' };

  // Digest every completed fixture
  completedFixtures.forEach(f => {
    const sc = f.scorecard;
    if (!sc) return;

    // Check innings 1 & 2 team totals for record tracking
    [sc.inn1, sc.inn2].forEach((inn, idx) => {
      if (inn && inn.totalRuns) {
        const teamShort = inn.teamShort || (idx === 0 ? f.teamAShort : f.teamBShort);
        const oppShort = idx === 0 ? f.teamBShort : f.teamAShort;
        const curScoreVal = inn.totalRuns;
        const highestVal = parseInt(highestTeamTotal.score.split('/')[0]) || 0;
        if (curScoreVal > highestVal) {
          highestTeamTotal = {
            team: teamShort,
            score: `${inn.totalRuns}/${inn.totalWickets}`,
            opp: `vs ${oppShort}`,
            date: f.stadiumName,
            season: 'IPL 2027'
          };
        }

        // Batters
        (inn.battingScorecard || []).forEach(b => {
          if (!b.name) return;
          if (!batterMap[b.name]) {
            batterMap[b.name] = {
              name: b.name,
              teamShort,
              teamName: inn.teamName || getFranchise(f.teamAId)?.name || teamShort,
              teamColor: inn.teamColor || '#fbbf24',
              teamEmoji: f.teamAEmoji || '🏏',
              innings: 0,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              fifties: 0,
              hundreds: 0,
              highestScore: 0,
              highestScoreNotOut: false,
              dismissals: 0
            };
          }

          const rec = batterMap[b.name];
          rec.innings += 1;
          rec.runs += b.runs || 0;
          rec.balls += b.balls || 0;
          rec.fours += b.fours || 0;
          rec.sixes += b.sixes || 0;
          if (b.runs >= 100) rec.hundreds += 1;
          else if (b.runs >= 50) rec.fifties += 1;

          const isNotOut = !b.dismissal || b.dismissal.toLowerCase().includes('not out');
          if (b.runs > rec.highestScore) {
            rec.highestScore = b.runs;
            rec.highestScoreNotOut = isNotOut;
          }
          if (!isNotOut) rec.dismissals += 1;

          // Check individual records
          const highestIndVal = parseInt(highestIndScore.score) || 0;
          if (b.runs > highestIndVal) {
            highestIndScore = {
              player: b.name,
              team: teamShort,
              score: `${b.runs}${isNotOut ? '*' : ''}`,
              balls: b.balls,
              opp: `vs ${oppShort}`,
              season: 'IPL 2027'
            };
          }

          if (b.runs >= 50 && b.balls <= fastestFifty.balls) {
            fastestFifty = {
              player: b.name,
              team: teamShort,
              balls: b.balls,
              opp: `vs ${oppShort}`,
              season: 'IPL 2027'
            };
          }

          if (b.sixes > mostSixesInnings.sixes) {
            mostSixesInnings = {
              player: b.name,
              team: teamShort,
              sixes: b.sixes,
              opp: `vs ${oppShort}`,
              season: 'IPL 2027'
            };
          }
        });

        // Bowlers
        const bowlTeamShort = idx === 0 ? f.teamBShort : f.teamAShort;
        const bowlTeamColor = idx === 0 ? f.teamBColor : f.teamAColor;
        (inn.bowlingFigures || []).forEach(bw => {
          if (!bw.name) return;
          if (!bowlerMap[bw.name]) {
            bowlerMap[bw.name] = {
              name: bw.name,
              teamShort: bowlTeamShort,
              teamName: idx === 0 ? f.teamBName : f.teamAName,
              teamColor: bowlTeamColor,
              teamEmoji: '🎯',
              matches: new Set(),
              totalBalls: 0,
              maidens: 0,
              runs: 0,
              wickets: 0,
              bestWickets: 0,
              bestRuns: 999
            };
          }

          const rec = bowlerMap[bw.name];
          rec.matches.add(f.matchNo);
          const [ovInt, ovDec] = (bw.overs || '0').split('.').map(Number);
          const balls = (ovInt || 0) * 6 + (ovDec || 0);
          rec.totalBalls += balls;
          rec.maidens += bw.maidens || 0;
          rec.runs += bw.runs || 0;
          rec.wickets += bw.wickets || 0;

          if (bw.wickets > rec.bestWickets || (bw.wickets === rec.bestWickets && bw.runs < rec.bestRuns)) {
            rec.bestWickets = bw.wickets;
            rec.bestRuns = bw.runs;
          }

          // Check Best Bowling Figures Record
          const curBestWkts = parseInt(bestBowling.figures.split('/')[0]) || 0;
          const curBestRuns = parseInt(bestBowling.figures.split('/')[1]) || 99;
          if (bw.wickets > curBestWkts || (bw.wickets === curBestWkts && bw.runs < curBestRuns)) {
            bestBowling = {
              player: bw.name,
              team: bowlTeamShort,
              figures: `${bw.wickets}/${bw.runs}`,
              opp: `vs ${teamShort}`,
              season: 'IPL 2027'
            };
          }
        });
      }
    });
  });

  // Blend with baseline if tournament is early/in-progress
  BASELINE_BATTERS.forEach(bb => {
    if (!batterMap[bb.playerName]) {
      batterMap[bb.playerName] = {
        name: bb.playerName,
        teamShort: bb.teamShort,
        teamName: bb.teamName,
        teamColor: bb.teamColor,
        teamEmoji: bb.teamEmoji,
        innings: bb.innings,
        runs: bb.runs,
        balls: bb.balls,
        fours: bb.fours,
        sixes: bb.sixes,
        fifties: bb.fifties,
        hundreds: bb.hundreds,
        highestScore: bb.highestScore,
        highestScoreNotOut: bb.highestScoreNotOut,
        dismissals: Math.max(1, bb.innings - (bb.highestScoreNotOut ? 1 : 0))
      };
    }
  });

  BASELINE_BOWLERS.forEach(bw => {
    if (!bowlerMap[bw.playerName]) {
      bowlerMap[bw.playerName] = {
        name: bw.playerName,
        teamShort: bw.teamShort,
        teamName: bw.teamName,
        teamColor: bw.teamColor,
        teamEmoji: '🎯',
        matches: new Set(Array.from({ length: bw.matches }, (_, i) => i + 1)),
        totalBalls: bw.totalBalls,
        maidens: bw.maidens,
        runs: bw.runs,
        wickets: bw.wickets,
        bestWickets: bw.bestWickets,
        bestRuns: bw.bestRuns
      };
    }
  });

  // Calculate Orange Cap Batting Leaderboard
  const orangeCapList: PlayerBattingAwardStats[] = Object.values(batterMap).map(b => {
    const avg = b.dismissals > 0 ? b.runs / b.dismissals : b.runs;
    const sr = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;
    return {
      playerName: b.name,
      teamShort: b.teamShort,
      teamName: b.teamName,
      teamColor: b.teamColor,
      teamEmoji: b.teamEmoji,
      innings: b.innings,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      fifties: b.fifties,
      hundreds: b.hundreds,
      highestScore: b.highestScore,
      highestScoreNotOut: b.highestScoreNotOut,
      strikeRate: Math.round(sr * 10) / 10,
      average: Math.round(avg * 10) / 10
    };
  }).sort((a, b) => b.runs - a.runs || b.strikeRate - a.strikeRate);

  // Calculate Purple Cap Bowling Leaderboard
  const purpleCapList: PlayerBowlingAwardStats[] = Object.values(bowlerMap).map(bw => {
    const ovInt = Math.floor(bw.totalBalls / 6);
    const ovRem = bw.totalBalls % 6;
    const oversStr = `${ovInt}.${ovRem}`;
    const oversDecimal = ovInt + ovRem / 6;
    const econ = oversDecimal > 0 ? bw.runs / oversDecimal : 0;
    const sr = bw.wickets > 0 ? bw.totalBalls / bw.wickets : 99;
    return {
      playerName: bw.name,
      teamShort: bw.teamShort,
      teamName: bw.teamName,
      teamColor: bw.teamColor,
      teamEmoji: bw.teamEmoji,
      matches: bw.matches.size,
      overs: oversStr,
      totalBalls: bw.totalBalls,
      maidens: bw.maidens,
      runs: bw.runs,
      wickets: bw.wickets,
      economy: Math.round(econ * 100) / 100,
      strikeRate: Math.round(sr * 10) / 10,
      bestFigures: bw.bestWickets > 0 ? `${bw.bestWickets}/${bw.bestRuns}` : '2/24',
      bestWickets: bw.bestWickets,
      bestRuns: bw.bestRuns
    };
  }).sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

  // Calculate MVP Leaderboard
  const mvpList: MVPAwardStats[] = orangeCapList.slice(0, 15).map(bat => {
    const bowl = purpleCapList.find(b => b.playerName.toLowerCase() === bat.playerName.toLowerCase());
    const wkts = bowl ? bowl.wickets : 0;
    const pts = bat.runs * 1 + bat.fours * 1 + bat.sixes * 2 + wkts * 25 + (bowl ? bowl.maidens * 15 : 0);
    return {
      playerName: bat.playerName,
      teamShort: bat.teamShort,
      teamName: bat.teamName,
      teamColor: bat.teamColor,
      teamEmoji: bat.teamEmoji,
      role: wkts >= 8 ? 'All-Rounder' : 'Batter',
      runs: bat.runs,
      wickets: wkts,
      mvpPoints: pts,
      highlight: `${bat.runs} Runs • ${wkts} Wickets • ${bat.sixes} Sixes`
    };
  }).sort((a, b) => b.mvpPoints - a.mvpPoints);

  // Emerging Player of the Year
  const emergingList: EmergingPlayerAwardStats[] = orangeCapList
    .filter(b => EMERGING_PLAYER_CANDIDATES.has(b.playerName))
    .map(bat => {
      const bowl = purpleCapList.find(b => b.playerName.toLowerCase() === bat.playerName.toLowerCase());
      const wkts = bowl ? bowl.wickets : 0;
      const impactScore = bat.runs * 1.2 + bat.sixes * 3 + wkts * 30;
      return {
        playerName: bat.playerName,
        teamShort: bat.teamShort,
        teamName: bat.teamName,
        teamColor: bat.teamColor,
        teamEmoji: bat.teamEmoji,
        role: wkts >= 5 ? 'All-Rounder' : 'Batter',
        age: 22,
        runs: bat.runs,
        wickets: wkts,
        impactScore: Math.round(impactScore),
        highlight: `Breakout Prodigy • ${bat.runs} runs (${bat.strikeRate} SR)`
      };
    }).sort((a, b) => b.impactScore - a.impactScore);

  const hallOfFame: HallOfFameRecords = {
    highestTeamTotal,
    fastestFifty,
    bestBowlingFigures: bestBowling,
    highestIndividualScore: highestIndScore,
    mostSixesInInnings: mostSixesInnings,
    highestRunChase: { team: 'KKR', target: 262, opp: 'vs PBKS', season: 'IPL 2024' }
  };

  return {
    orangeCapLeader: orangeCapList[0] || null,
    orangeCapTop5: orangeCapList.slice(0, 5),
    purpleCapLeader: purpleCapList[0] || null,
    purpleCapTop5: purpleCapList.slice(0, 5),
    tournamentMVP: mvpList[0] || null,
    mvpTop5: mvpList.slice(0, 5),
    emergingPlayer: emergingList[0] || null,
    emergingTop3: emergingList.slice(0, 3),
    hallOfFame,
    totalMatchesCompleted: completedFixtures.length
  };
}
