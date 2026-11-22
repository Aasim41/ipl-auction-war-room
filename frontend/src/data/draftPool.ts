export interface DraftProspect {
  id: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  nationality: 'Indian' | 'Overseas';
  is_overseas: boolean;
  powerIndex: number;
  iplHeritage: string;
  tacticalTag: string;
  preferredTeamId: string;
  roundEligibility: 1 | 2 | 3;
}

export const DRAFT_ROUNDS_CONFIG = [
  { round: 1, title: 'ROUND 1: FRANCHISE ICON DRAFT', deductionCr: 18.0, desc: 'Every franchise locks in their generational franchise talisman.' },
  { round: 2, title: 'ROUND 2: MARQUEE ALL-STAR DRAFT', deductionCr: 14.0, desc: 'Draft your secondary match-winner and superstar core.' },
  { round: 3, title: 'ROUND 3: CORE ANCHOR & STRIKE WEAPON', deductionCr: 11.0, desc: 'Finalize your 3-man foundation before the open Mega Auction.' }
];

export const INAUGURAL_DRAFT_POOL: DraftProspect[] = [
  // ─── ROUND 1 ICONS ───
  {
    id: 'draft_kohli',
    name: 'Virat Kohli',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 98.5,
    iplHeritage: 'Royal Challengers Bengaluru Icon',
    tacticalTag: 'Generational King of Run Chases & Passionate Leader',
    preferredTeamId: 'rcb',
    roundEligibility: 1
  },
  {
    id: 'draft_bumrah',
    name: 'Jasprit Bumrah',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 99.0,
    iplHeritage: 'Mumbai Indians Strike Ace',
    tacticalTag: 'World No. 1 Fast Bowler & Toe-Crushing Death Specialist',
    preferredTeamId: 'mi',
    roundEligibility: 1
  },
  {
    id: 'draft_dhoni',
    name: 'MS Dhoni',
    role: 'WK',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 96.0,
    iplHeritage: 'Chennai Super Kings Legend',
    tacticalTag: '5x Champion Captain, Tactical Brain & Clutch Finisher',
    preferredTeamId: 'csk',
    roundEligibility: 1
  },
  {
    id: 'draft_rohit',
    name: 'Rohit Sharma',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 97.0,
    iplHeritage: 'Mumbai Indians Champion Icon',
    tacticalTag: 'Hitman • T20 World Cup Winning Captain & Powerplay Maestro',
    preferredTeamId: 'mi',
    roundEligibility: 1
  },
  {
    id: 'draft_klaasen',
    name: 'Heinrich Klaasen',
    role: 'WK',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 97.5,
    iplHeritage: 'Sunrisers Hyderabad Demolisher',
    tacticalTag: 'World Most Feared Middle-Overs Spin & Pace Smasher',
    preferredTeamId: 'srh',
    roundEligibility: 1
  },
  {
    id: 'draft_gill',
    name: 'Shubman Gill',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 96.5,
    iplHeritage: 'Gujarat Titans Captain',
    tacticalTag: 'Orange Cap Winner • Elegant Accumulator & Franchise Anchor',
    preferredTeamId: 'gt',
    roundEligibility: 1
  },
  {
    id: 'draft_head',
    name: 'Travis Head',
    role: 'BAT',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 96.0,
    iplHeritage: 'Sunrisers Hyderabad Powerplay Terror',
    tacticalTag: '250+ Strike Rate Powerplay Blaster & World Cup MVP',
    preferredTeamId: 'srh',
    roundEligibility: 1
  },
  {
    id: 'draft_pooran',
    name: 'Nicholas Pooran',
    role: 'WK',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 96.5,
    iplHeritage: 'Lucknow Super Giants Striker',
    tacticalTag: '360° Boundary Cleared with 190+ Death-Over Strike Rate',
    preferredTeamId: 'lsg',
    roundEligibility: 1
  },
  {
    id: 'draft_rashid',
    name: 'Rashid Khan',
    role: 'BOWL',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 98.0,
    iplHeritage: 'Gujarat Titans Magician',
    tacticalTag: 'T20 Spin Wizard • Fast Arm-Action Leggie & Clutch Finisher',
    preferredTeamId: 'gt',
    roundEligibility: 1
  },
  {
    id: 'draft_jadeja',
    name: 'Ravindra Jadeja',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 95.0,
    iplHeritage: 'Rajasthan Royals Champion Icon',
    tacticalTag: 'Final Ball Hero • Bullet Arm Fielder & Stingy Finger Spinner',
    preferredTeamId: 'rr',
    roundEligibility: 1
  },
  {
    id: 'draft_sky',
    name: 'Suryakumar Yadav',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 98.0,
    iplHeritage: 'Mumbai Indians 360 Genius',
    tacticalTag: 'World No. 1 T20 Batter • Unorthodox Geometric Strokeplay',
    preferredTeamId: 'mi',
    roundEligibility: 1
  },
  {
    id: 'draft_pant',
    name: 'Rishabh Pant',
    role: 'WK',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 97.0,
    iplHeritage: 'Lucknow Super Giants Captain',
    tacticalTag: 'Record Signee • Fearless Left-Handed Phenomenon & Match-Winner',
    preferredTeamId: 'lsg',
    roundEligibility: 1
  },
  {
    id: 'draft_samson',
    name: 'Sanju Samson',
    role: 'WK',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 95.5,
    iplHeritage: 'Chennai Super Kings Wicketkeeper Star',
    tacticalTag: 'Classy Intent Leader • Fast Starter Against Pace & Spin',
    preferredTeamId: 'csk',
    roundEligibility: 1
  },
  {
    id: 'draft_russell',
    name: 'Andre Russell',
    role: 'AR',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 96.0,
    iplHeritage: 'Kolkata Knight Riders Powerhouse',
    tacticalTag: 'Dre Russ • 200+ Strike Rate Monster & Heavy Ball Pacer',
    preferredTeamId: 'kkr',
    roundEligibility: 1
  },
  {
    id: 'draft_narine',
    name: 'Sunil Narine',
    role: 'AR',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 96.5,
    iplHeritage: 'Kolkata Knight Riders MVP',
    tacticalTag: '3x MVP • Explosive Pinch Hitter & Sub-6 Economy Mystery Spinner',
    preferredTeamId: 'kkr',
    roundEligibility: 1
  },
  {
    id: 'draft_arshdeep',
    name: 'Arshdeep Singh',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 93.0,
    iplHeritage: 'Punjab Kings Strike Bowler',
    tacticalTag: 'World Cup Champion Left-Arm Pacer & Death-Over Specialist',
    preferredTeamId: 'pbks',
    roundEligibility: 1
  },

  // ─── ROUND 2 MARQUEE STARS ───
  {
    id: 'draft_hardik',
    name: 'Hardik Pandya',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 94.5,
    iplHeritage: 'Mumbai Indians / GT Champion',
    tacticalTag: 'Fast-Bowling All-Rounder & Dynamic Match-Winning Finisher',
    preferredTeamId: 'mi',
    roundEligibility: 2
  },
  {
    id: 'draft_gaikwad',
    name: 'Ruturaj Gaikwad',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 94.0,
    iplHeritage: 'Chennai Super Kings Captain',
    tacticalTag: 'Classical Technique, Spin Master & Calm Tactician',
    preferredTeamId: 'csk',
    roundEligibility: 2
  },
  {
    id: 'draft_jaiswal',
    name: 'Yashasvi Jaiswal',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 95.0,
    iplHeritage: 'Rajasthan Royals Prodigy',
    tacticalTag: 'Fastest 50 Record Holder • All-Attack Modern Opener',
    preferredTeamId: 'rr',
    roundEligibility: 2
  },
  {
    id: 'draft_rahul',
    name: 'KL Rahul',
    role: 'WK',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 94.0,
    iplHeritage: 'Delhi Capitals Marquee Batter',
    tacticalTag: 'Classy Top-Order Anchor with 4500+ IPL Runs',
    preferredTeamId: 'dc',
    roundEligibility: 2
  },
  {
    id: 'draft_iyer',
    name: 'Shreyas Iyer',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 95.0,
    iplHeritage: 'Punjab Kings Captain',
    tacticalTag: 'IPL Champion Winning Leader & Spin-Dominating Middle Order Anchor',
    preferredTeamId: 'pbks',
    roundEligibility: 2
  },
  {
    id: 'draft_buttler',
    name: 'Jos Buttler',
    role: 'WK',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 95.0,
    iplHeritage: 'Gujarat Titans Keeper-Opener',
    tacticalTag: '5x Century Machine • World Cup Winning Power Striker',
    preferredTeamId: 'gt',
    roundEligibility: 2
  },
  {
    id: 'draft_cummins',
    name: 'Pat Cummins',
    role: 'AR',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 95.0,
    iplHeritage: 'Sunrisers Hyderabad Captain',
    tacticalTag: 'World Champion Leader, Express Pacer & Hard-Hitting Tailender',
    preferredTeamId: 'srh',
    roundEligibility: 2
  },
  {
    id: 'draft_axar',
    name: 'Axar Patel',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 93.0,
    iplHeritage: 'Delhi Capitals Captain',
    tacticalTag: 'Economic Left-Arm Darts & Reliable Clutch Middle-Order Hitter',
    preferredTeamId: 'dc',
    roundEligibility: 2
  },
  {
    id: 'draft_kuldeep',
    name: 'Kuldeep Yadav',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 94.0,
    iplHeritage: 'Delhi Capitals Wizard',
    tacticalTag: 'Deceptive Left-Arm Wrist Spin & Middle-Overs Breakthrough King',
    preferredTeamId: 'dc',
    roundEligibility: 2
  },
  {
    id: 'draft_rinku',
    name: 'Rinku Singh',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 93.0,
    iplHeritage: 'Kolkata Knight Riders Finisher',
    tacticalTag: '5-Six Final Over Hero • Ice In The Veins Match Finisher',
    preferredTeamId: 'kkr',
    roundEligibility: 2
  },
  {
    id: 'draft_varun',
    name: 'Varun Chakaravarthy',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 93.5,
    iplHeritage: 'Kolkata Knight Riders Mystery Bowler',
    tacticalTag: 'Carrom Ball Specialist & Unpickable Leg-Break Weapon',
    preferredTeamId: 'kkr',
    roundEligibility: 2
  },
  {
    id: 'draft_siraj',
    name: 'Mohammed Siraj',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 91.0,
    iplHeritage: 'Gujarat Titans Ace',
    tacticalTag: 'Miyan Magic • Rapid Outswing & Seam-Up Hostility',
    preferredTeamId: 'gt',
    roundEligibility: 2
  },
  {
    id: 'draft_patidar',
    name: 'Rajat Patidar',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 92.0,
    iplHeritage: 'Royal Challengers Bengaluru Captain',
    tacticalTag: 'Elite Spin Destroyer with 180+ Middle-Overs Strike Rate',
    preferredTeamId: 'rcb',
    roundEligibility: 2
  },
  {
    id: 'draft_pathirana',
    name: 'Matheesha Pathirana',
    role: 'BOWL',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 94.0,
    iplHeritage: 'Kolkata Knight Riders Slinger',
    tacticalTag: 'Baby Malinga • 150 km/h Reverse Swinger & Yorker Machine',
    preferredTeamId: 'csk',
    roundEligibility: 2
  },

  // ─── ROUND 3 CORE ANCHORS & MATCH WINNERS ───
  {
    id: 'draft_dube',
    name: 'Shivam Dube',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 91.5,
    iplHeritage: 'Chennai Super Kings Power Asset',
    tacticalTag: 'Long-Lever Six Hitter & Spin Demolisher in Middle Overs',
    preferredTeamId: 'csk',
    roundEligibility: 3
  },
  {
    id: 'draft_starc',
    name: 'Mitchell Starc',
    role: 'BOWL',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 93.0,
    iplHeritage: 'IPL 2024 Final PoTM',
    tacticalTag: 'Lethal Inswinging Yorker at 145+ km/h in Big Games',
    preferredTeamId: 'dc',
    roundEligibility: 3
  },
  {
    id: 'draft_chahal',
    name: 'Yuzvendra Chahal',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 92.5,
    iplHeritage: 'All-Time IPL Wicket Leader',
    tacticalTag: 'Chess Grandmaster of Leg-Spin & Wide-Line Deception',
    preferredTeamId: 'pbks',
    roundEligibility: 3
  },
  {
    id: 'draft_tilak',
    name: 'Tilak Varma',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 91.0,
    iplHeritage: 'Mumbai Indians Young Pillar',
    tacticalTag: 'Poised Left-Handed Anchor & Adaptive Pressure Absorber',
    preferredTeamId: 'mi',
    roundEligibility: 3
  },
  {
    id: 'draft_green',
    name: 'Cameron Green',
    role: 'AR',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 92.0,
    iplHeritage: 'Aussie Mega All-Rounder',
    tacticalTag: 'Power Hitter, 140+ km/h Bouncer & Spectacular Boundary Catcher',
    preferredTeamId: 'kkr',
    roundEligibility: 3
  },
  {
    id: 'draft_sudharsan',
    name: 'Sai Sudharsan',
    role: 'BAT',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 92.0,
    iplHeritage: 'Gujarat Titans Anchor',
    tacticalTag: 'IPL Final 96 Hero • Impeccable Classical Strokeplay',
    preferredTeamId: 'gt',
    roundEligibility: 3
  },
  {
    id: 'draft_abhishek',
    name: 'Abhishek Sharma',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 93.0,
    iplHeritage: 'Sunrisers Hyderabad Opener',
    tacticalTag: 'High-Impact Indian Opener with Sub-40 Ball Hundreds',
    preferredTeamId: 'srh',
    roundEligibility: 3
  },
  {
    id: 'draft_nitish',
    name: 'Nitish Kumar Reddy',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 90.0,
    iplHeritage: 'Sunrisers Hyderabad Emerging Star',
    tacticalTag: 'Fast-Bowling All-Rounder & Dynamic Middle Hitter',
    preferredTeamId: 'srh',
    roundEligibility: 3
  },
  {
    id: 'draft_parag',
    name: 'Riyan Parag',
    role: 'AR',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 91.0,
    iplHeritage: 'Rajasthan Royals Captain',
    tacticalTag: 'Captain & No. 4 Power Anchor & Helpful Finger Spin Option',
    preferredTeamId: 'rr',
    roundEligibility: 3
  },
  {
    id: 'draft_jurel',
    name: 'Dhruv Jurel',
    role: 'WK',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 90.0,
    iplHeritage: 'Rajasthan Royals Clutch Finisher',
    tacticalTag: 'Fearless Lower-Order Finisher & Precision Keeper',
    preferredTeamId: 'rr',
    roundEligibility: 3
  },
  {
    id: 'draft_mayank',
    name: 'Mayank Yadav',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 92.0,
    iplHeritage: 'Lucknow Super Giants Speedster',
    tacticalTag: '156.7 km/h Raw Express Pace & Intimidating Bouncer',
    preferredTeamId: 'lsg',
    roundEligibility: 3
  },
  {
    id: 'draft_bishnoi',
    name: 'Ravi Bishnoi',
    role: 'BOWL',
    nationality: 'Indian',
    is_overseas: false,
    powerIndex: 91.0,
    iplHeritage: 'Lucknow Super Giants Spin Ace',
    tacticalTag: 'Rapid Flat Googly Master & Powerplay Spin Weapon',
    preferredTeamId: 'lsg',
    roundEligibility: 3
  },
  {
    id: 'draft_stubbs',
    name: 'Tristan Stubbs',
    role: 'WK',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 92.0,
    iplHeritage: 'Delhi Capitals Finisher',
    tacticalTag: 'South African 360 Ramp & Reverse Sweep Machine',
    preferredTeamId: 'dc',
    roundEligibility: 3
  },
  {
    id: 'draft_salt',
    name: 'Phil Salt',
    role: 'WK',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 91.5,
    iplHeritage: 'Explosive Keeper-Opener',
    tacticalTag: 'Ultra-Aggressive First-Ball Attacker with 180+ SR',
    preferredTeamId: 'rcb',
    roundEligibility: 3
  },
  {
    id: 'draft_boult',
    name: 'Trent Boult',
    role: 'BOWL',
    nationality: 'Overseas',
    is_overseas: true,
    powerIndex: 93.0,
    iplHeritage: 'New-Ball Wicket Taker',
    tacticalTag: 'Unplayable Over-the-Wicket Inswinging Yorker First Over',
    preferredTeamId: 'mi',
    roundEligibility: 3
  }
];

// Helper to determine AI draft pick for a franchise in a round
export function selectAIDraftPick(
  teamId: string,
  round: number,
  alreadyDraftedIds: Set<string>
): DraftProspect | null {
  const normTeam = teamId.toLowerCase();
  
  // 1. Try to pick this franchise's preferred player for this round
  const preferredMatches = INAUGURAL_DRAFT_POOL.filter(
    p => p.preferredTeamId === normTeam && 
         p.roundEligibility <= round && 
         !alreadyDraftedIds.has(p.id)
  );

  if (preferredMatches.length > 0) {
    // Sort by power index descending
    preferredMatches.sort((a, b) => b.powerIndex - a.powerIndex);
    return preferredMatches[0];
  }

  // 2. Fallback: highest power index player remaining who is eligible for this round or earlier
  const available = INAUGURAL_DRAFT_POOL.filter(
    p => p.roundEligibility <= round && !alreadyDraftedIds.has(p.id)
  );

  if (available.length > 0) {
    available.sort((a, b) => b.powerIndex - a.powerIndex);
    return available[0];
  }

  // 3. Absolute fallback: any available player from the entire pool
  const anyAvailable = INAUGURAL_DRAFT_POOL.filter(p => !alreadyDraftedIds.has(p.id));
  if (anyAvailable.length > 0) {
    anyAvailable.sort((a, b) => b.powerIndex - a.powerIndex);
    return anyAvailable[0];
  }

  return null;
}
