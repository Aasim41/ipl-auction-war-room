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
    untouchables: ['Ruturaj Gaikwad', 'MS Dhoni', 'Sanju Samson', 'Shivam Dube'],
    tradeStyle: 'conservative',
    auctionTemperament: 'disciplined',
    matchDayBias: {
      powerplayAggression: 0.35, // Preserves wickets early, milks singles
      deathOversIntensity: 0.95, // Explodes with Dhoni in overs 17-20
      spinPriority: 0.90,        // Chepauk fortress spin choke
      paceAggression: 0.40
    }
  },
  mi: {
    id: 'mi',
    name: 'Mumbai Indians',
    personality: 'Hyper-Aggressive Hitters & Pace Royalty',
    tagline: 'All-out boundary assault, 145+ km/h express pace, relentless auction bidding',
    untouchables: ['Hardik Pandya', 'Rohit Sharma', 'Jasprit Bumrah', 'Suryakumar Yadav'],
    tradeStyle: 'aggressive',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.88, // Rohit style assault
      deathOversIntensity: 0.92, // Hardik finish
      spinPriority: 0.35,
      paceAggression: 0.95        // Bumrah searing yorkers & bouncers
    }
  },
  srh: {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    personality: 'Powerplay Blitzkriegers',
    tagline: 'High-risk maximum sixes, Travis Head style carnages, aggressive auction counters',
    untouchables: ['Pat Cummins', 'Travis Head', 'Heinrich Klaasen', 'Abhishek Sharma'],
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
    untouchables: ['Riyan Parag', 'Yashasvi Jaiswal', 'Ravindra Jadeja', 'Jofra Archer'],
    tradeStyle: 'moneyball',
    auctionTemperament: 'value_hunter',
    matchDayBias: {
      powerplayAggression: 0.70, // Jaiswal quick start
      deathOversIntensity: 0.80, // Parag / Hetmyer
      spinPriority: 0.80,        // Jadeja / Bishnoi balance
      paceAggression: 0.65
    }
  },
  kkr: {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    personality: 'Mystery Spin Choke & Caribbean Muscle',
    tagline: 'Narine/Chakravarthy spin choke followed by Caribbean and Indian muscle fury',
    untouchables: ['Ajinkya Rahane', 'Sunil Narine', 'Rinku Singh', 'Varun Chakravarthy'],
    tradeStyle: 'aggressive',
    auctionTemperament: 'bidding_war_frenzy',
    matchDayBias: {
      powerplayAggression: 0.85, // Narine opener charge
      deathOversIntensity: 0.98, // Rinku & Ramandeep muscle
      spinPriority: 0.95,        // Mystery spin choke
      paceAggression: 0.55
    }
  },
  rcb: {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    personality: 'Top-Heavy Passion & Run Machines',
    tagline: 'Kohli-anchored firepower, high-altitude six-hitting at Chinnaswamy',
    untouchables: ['Rajat Patidar', 'Virat Kohli', 'Josh Hazlewood', 'Phil Salt'],
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
    untouchables: ['Shubman Gill', 'Jos Buttler', 'Rashid Khan', 'Mohammed Siraj'],
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
    untouchables: ['Axar Patel', 'KL Rahul', 'Kuldeep Yadav', 'Mitchell Starc'],
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
    untouchables: ['Rishabh Pant', 'Nicholas Pooran', 'Mohammad Shami', 'Mayank Yadav'],
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
    untouchables: ['Shreyas Iyer', 'Arshdeep Singh', 'Yuzvendra Chahal', 'Shashank Singh'],
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

export function isUntouchablePlayer(playerName: string, untouchables: string[]): boolean {
  if (!playerName || !untouchables || untouchables.length === 0) return false;
  const cleanTarget = playerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return untouchables.some((u) => {
    const cleanU = u.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanTarget === cleanU) return true;
    if (cleanTarget.includes(cleanU) || cleanU.includes(cleanTarget)) return true;
    // Check last name matching (e.g. "Kohli" matching "V. Kohli" and "Virat Kohli")
    const uParts = u.trim().split(/\s+/);
    const uLastName = uParts[uParts.length - 1].toLowerCase();
    const pParts = playerName.trim().split(/\s+/);
    const pLastName = pParts[pParts.length - 1].toLowerCase();
    return uLastName.length >= 4 && uLastName === pLastName;
  });
}

export function getFranchiseAI(teamId: string): FranchiseAIProfile {
  return FRANCHISE_AI_PROFILES[teamId.toLowerCase()] || FRANCHISE_AI_PROFILES.csk;
}
