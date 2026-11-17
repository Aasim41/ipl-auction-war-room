// ─── FRANCHISE UTILITY AI & PERSONALITY MATRIX ───
// Controls AI bidding temperament, match-day tactical aggression, and trading negotiation rules

export interface FranchiseAIProfile {
  id: string;
  name: string;
  personality: string;
  tagline: string;
  untouchables: string[]; // Players that will NEVER be traded under any condition
  tradeStyle: 'conservative' | 'moneyball' | 'aggressive' | 'balanced';
  auctionTemperament: 'disciplined' | 'bidding_war_frenzy' | 'value_hunter' | 'balanced';
  matchDayBias: {
    powerplayAggression: number; // 0 (conservative) to 1 (all out assault)
    deathOversIntensity: number; // 0 to 1
    spinPriority: number;        // 0 to 1
    paceAggression: number;      // 0 to 1
  };
}

export const FRANCHISE_AI_PROFILES: Record<string, FranchiseAIProfile> = {
  csk: {
    id: 'csk',
    name: 'Chennai Super Kings',
    personality: 'The Zen Tacticians',
    tagline: 'Prioritizes seasoned anchors, spin choke, and disciplined auction bidding',
    untouchables: ['MS Dhoni', 'Ravindra Jadeja', 'Ruturaj Gaikwad', 'Matheesha Pathirana', 'M. Pathirana', 'R. Jadeja', 'R. Gaikwad'],
    tradeStyle: 'conservative',
    auctionTemperament: 'disciplined',
    matchDayBias: {
      powerplayAggression: 0.35, // Preserves wickets early, milks singles
      deathOversIntensity: 0.95, // Explodes with Dhoni & Jadeja in overs 17-20
      spinPriority: 0.90,        // Chepauk fortress spin choke
      paceAggression: 0.40
    }
  },
  mi: {
    id: 'mi',
    name: 'Mumbai Indians',
    personality: 'Hyper-Aggressive Hitters & Pace Royalty',
    tagline: 'All-out boundary assault, 145+ km/h express pace, relentless auction bidding',
    untouchables: ['Jasprit Bumrah', 'Suryakumar Yadav', 'Hardik Pandya', 'Rohit Sharma', 'J. Bumrah', 'S. Yadav', 'H. Pandya', 'R. Sharma'],
    tradeStyle: 'aggressive',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.88, // Rohit / Kishan style assault
      deathOversIntensity: 0.92, // Hardik / David finish
      spinPriority: 0.35,
      paceAggression: 0.95        // Bumrah searing yorkers & bouncers
    }
  },
  srh: {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    personality: 'Powerplay Blitzkriegers',
    tagline: 'High-risk maximum sixes, Travis Head style carnages, aggressive auction counters',
    untouchables: ['Heinrich Klaasen', 'Travis Head', 'Pat Cummins', 'Abhishek Sharma', 'H. Klaasen', 'T. Head', 'P. Cummins', 'A. Sharma'],
    tradeStyle: 'aggressive',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.95, // World record powerplay intentions
      deathOversIntensity: 0.95, // Klaasen destructive maximums
      spinPriority: 0.40,
      paceAggression: 0.88        // Cummins lethal bouncers
    }
  },
  rr: {
    id: 'rr',
    name: 'Rajasthan Royals',
    personality: 'Moneyball Analytics Economists',
    tagline: 'Statistical valuation caps, strictly drops out when prices exceed true stats',
    untouchables: ['Sanju Samson', 'Yashasvi Jaiswal', 'Riyan Parag', 'S. Samson', 'Y. Jaiswal', 'R. Parag'],
    tradeStyle: 'moneyball',
    auctionTemperament: 'value_hunter',
    matchDayBias: {
      powerplayAggression: 0.70, // Jaiswal quick start
      deathOversIntensity: 0.80, // Parag / Hetmyer
      spinPriority: 0.80,        // Ashwin / Chahal balance
      paceAggression: 0.65
    }
  },
  kkr: {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    personality: 'Mystery Spin Choke & Caribbean Muscle',
    tagline: 'Narine/Chakravarthy spin choke followed by Andre Russell maximum fury',
    untouchables: ['Andre Russell', 'Sunil Narine', 'Rinku Singh', 'A. Russell', 'S. Narine', 'R. Singh'],
    tradeStyle: 'aggressive',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.85, // Narine opener charge
      deathOversIntensity: 0.98, // Russell muscle
      spinPriority: 0.95,        // Mystery spin choke
      paceAggression: 0.55
    }
  },
  rcb: {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    personality: 'Top-Heavy Passion & Run Machines',
    tagline: 'Kohli-anchored firepower, high-altitude six-hitting at Chinnaswamy',
    untouchables: ['Virat Kohli', 'Rajat Patidar', 'Yash Dayal', 'V. Kohli', 'R. Patidar', 'Y. Dayal'],
    tradeStyle: 'balanced',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.80,
      deathOversIntensity: 0.85,
      spinPriority: 0.45,
      paceAggression: 0.75
    }
  },
  gt: {
    id: 'gt',
    name: 'Gujarat Titans',
    personality: 'Calculated Defensive Disciplinarians',
    tagline: 'Clinical death bowling execution, anchor-based chasing mastery',
    untouchables: ['Shubman Gill', 'Rashid Khan', 'Sai Sudharsan', 'S. Gill', 'R. Khan', 'S. Sudharsan'],
    tradeStyle: 'conservative',
    auctionTemperament: 'disciplined',
    matchDayBias: {
      powerplayAggression: 0.60,
      deathOversIntensity: 0.85,
      spinPriority: 0.85,        // Rashid Khan economy
      paceAggression: 0.75
    }
  },
  dc: {
    id: 'dc',
    name: 'Delhi Capitals',
    personality: 'Youth Aggression & Fearless Strokeplay',
    tagline: 'Young fearless strikers and attacking wrist-spinners',
    untouchables: ['Axar Patel', 'Kuldeep Yadav', 'Rishabh Pant', 'A. Patel', 'K. Yadav', 'R. Pant'],
    tradeStyle: 'balanced',
    auctionTemperament: 'value_hunter',
    matchDayBias: {
      powerplayAggression: 0.75,
      deathOversIntensity: 0.80,
      spinPriority: 0.70,
      paceAggression: 0.65
    }
  },
  lsg: {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    personality: 'Multi-Dimensional Tactical All-Rounders',
    tagline: 'Heavy reliance on all-rounders, multi-phase flexibility, Ekana grip tactics',
    untouchables: ['Nicholas Pooran', 'Ravi Bishnoi', 'N. Pooran', 'R. Bishnoi'],
    tradeStyle: 'balanced',
    auctionTemperament: 'disciplined',
    matchDayBias: {
      powerplayAggression: 0.65,
      deathOversIntensity: 0.90, // Pooran death fireworks
      spinPriority: 0.80,
      paceAggression: 0.60
    }
  },
  pbks: {
    id: 'pbks',
    name: 'Punjab Kings',
    personality: 'High-Variance Blitzkrieg',
    tagline: 'Unpredictable, fearless intent, high purse reserves in auctions',
    untouchables: ['Arshdeep Singh', 'Shashank Singh', 'A. Singh', 'S. Singh'],
    tradeStyle: 'moneyball',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.85,
      deathOversIntensity: 0.80,
      spinPriority: 0.40,
      paceAggression: 0.80
    }
  }
};

export function getFranchiseAI(teamId: string): FranchiseAIProfile {
  return FRANCHISE_AI_PROFILES[teamId.toLowerCase()] || FRANCHISE_AI_PROFILES.csk;
}
