export interface Stadium {
  id: string
  teamId: string
  teamName: string
  teamShort: string
  teamColor: string
  name: string
  shortName: string
  city: string
  state: string
  capacity: string
  capacityNum: number
  pitchType: string
  avgFirstInnings: number
  boundarySize: string
  recordScore: string
  floodlights: string
  soilType: 'Red Soil' | 'Black Soil' | 'Hybrid Turf'
  curatorNote: string
  stands: string[]
  keyBattles: string
}

export const STADIUMS: Record<string, Stadium> = {
  rcb: {
    id: 'chinnaswamy',
    teamId: 'rcb',
    teamName: 'Royal Challengers Bengaluru',
    teamShort: 'RCB',
    teamColor: '#dc2626',
    name: 'M. Chinnaswamy Stadium',
    shortName: 'Chinnaswamy',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacity: '33,800',
    capacityNum: 33800,
    pitchType: 'High-Altitude Batting Belter',
    avgFirstInnings: 196,
    boundarySize: '60m - 65m (Short Fences)',
    recordScore: '287/3 (SRH vs RCB, 2024)',
    floodlights: 'Quad-Mast 2500 Lux Arena Array',
    soilType: 'Red Soil',
    curatorNote: 'Fast outfield and thin Bengaluru air turn edges into maximums. Target 215+ when batting first.',
    stands: ['B Stand (Roar Den)', 'Pavilion End', 'Cubbon Road Stand', 'Air India Stand'],
    keyBattles: 'Death bowling against power hitters targeting mid-wicket & square leg.'
  },
  csk: {
    id: 'chepauk',
    teamId: 'csk',
    teamName: 'Chennai Super Kings',
    teamShort: 'CSK',
    teamColor: '#fbbf24',
    name: 'M. A. Chidambaram Stadium',
    shortName: 'Chepauk',
    city: 'Chennai',
    state: 'Tamil Nadu',
    capacity: '38,200',
    capacityNum: 38200,
    pitchType: 'Classic Turning Fortress',
    avgFirstInnings: 168,
    boundarySize: '68m - 72m (Spacious Square)',
    recordScore: '246/5 (CSK vs RR, 2010)',
    floodlights: 'Pylon 6-Bank Chepauk Towers',
    soilType: 'Clay & Red Loam',
    curatorNote: 'Dry surface offering grip and variable bounce. Finger spinners and cutter bowlers thrive here.',
    stands: ['Anna Pavilion', 'Madras Cricket Club (MCC)', 'D Stand (Whistle Podu)', 'V. Pattabiraman Gate'],
    keyBattles: 'Spin web through overs 7-15; strike rotation is paramount over blind slogging.'
  },
  mi: {
    id: 'wankhede',
    teamId: 'mi',
    teamName: 'Mumbai Indians',
    teamShort: 'MI',
    teamColor: '#2563eb',
    name: 'Wankhede Stadium',
    shortName: 'Wankhede',
    city: 'Mumbai',
    state: 'Maharashtra',
    capacity: '33,108',
    capacityNum: 33108,
    pitchType: 'True Red Soil Pace & Dew Engine',
    avgFirstInnings: 188,
    boundarySize: '64m - 69m',
    recordScore: '235/1 (RCB vs MI, 2015)',
    floodlights: 'Circular Roof-Ring Cantilever Array',
    soilType: 'Red Soil',
    curatorNote: 'Arabian Sea breeze provides early swing. Heavy evening dew turns chasing into a massive advantage.',
    stands: ['Sachin Tendulkar Stand', 'Sunil Gavaskar Stand', 'Vijay Merchant Pavilion', 'Garware Pavilion'],
    keyBattles: 'Express pace in Powerplay; cross-seam deliveries to counter late-evening dew.'
  },
  kkr: {
    id: 'eden',
    teamId: 'kkr',
    teamName: 'Kolkata Knight Riders',
    teamShort: 'KKR',
    teamColor: '#7c3aed',
    name: 'Eden Gardens',
    shortName: 'Eden Gardens',
    city: 'Kolkata',
    state: 'West Bengal',
    capacity: '68,000',
    capacityNum: 68000,
    pitchType: 'Black Soil Colosseum with True Carry',
    avgFirstInnings: 184,
    boundarySize: '66m - 72m',
    recordScore: '262/2 (PBKS vs KKR, 2024)',
    floodlights: 'Historic Towering Quad-Luminaires',
    soilType: 'Black Soil',
    curatorNote: 'Lightning fast outfield and true bounce. Mystery spinners and powerplay enforcers dominate.',
    stands: ['Club House', 'B & C Blocks (Purple Wave)', 'Pankaj Gupta Stand', 'Sourav Ganguly Stand'],
    keyBattles: 'Mystery spin in middle overs paired with sheer boundary-clearing muscle.'
  },
  srh: {
    id: 'uppal',
    teamId: 'srh',
    teamName: 'Sunrisers Hyderabad',
    teamShort: 'SRH',
    teamColor: '#ea580c',
    name: 'Rajiv Gandhi Intl Cricket Stadium',
    shortName: 'Uppal',
    city: 'Hyderabad',
    state: 'Telangana',
    capacity: '39,200',
    capacityNum: 39200,
    pitchType: 'Hard Deccan Highway for Powerhitters',
    avgFirstInnings: 198,
    boundarySize: '65m - 70m',
    recordScore: '277/3 (SRH vs MI, 2024)',
    floodlights: '4-Corner High-Mast Superbeam',
    soilType: 'Black Soil',
    curatorNote: 'Even bounce with no seam movement. Pure bat-on-ball paradise where 220 is par score.',
    stands: ['North Stand (Orange Army)', 'South Pavilion End', 'East Stand', 'West Terrace'],
    keyBattles: 'All-out Powerplay carnage from ball one; yorker precision at death.'
  },
  rr: {
    id: 'sawai',
    teamId: 'rr',
    teamName: 'Rajasthan Royals',
    teamShort: 'RR',
    teamColor: '#db2777',
    name: 'Sawai Mansingh Stadium',
    shortName: 'SMS Stadium',
    city: 'Jaipur',
    state: 'Rajasthan',
    capacity: '30,000',
    capacityNum: 30000,
    pitchType: 'Big Boundary Classical Surface',
    avgFirstInnings: 172,
    boundarySize: '70m - 78m (Deep Boundaries)',
    recordScore: '217/6 (SRH vs RR, 2023)',
    floodlights: 'Twin-Sided Heritage Mast Array',
    soilType: 'Clay & Sand Mix',
    curatorNote: 'Deep boundaries test stamina and running between wickets. Spinners with flight prosper.',
    stands: ['Royal Pavilion', 'East Stand (Halla Bol)', 'West Terrace', 'North Pavilion'],
    keyBattles: 'Twos and threes in large pockets; high defensive boundary catching.'
  },
  dc: {
    id: 'kotla',
    teamId: 'dc',
    teamName: 'Delhi Capitals',
    teamShort: 'DC',
    teamColor: '#0284c7',
    name: 'Arun Jaitley Stadium',
    shortName: 'Kotla',
    city: 'New Delhi',
    state: 'Delhi',
    capacity: '41,842',
    capacityNum: 41842,
    pitchType: 'Short-Fence High Velocity Outfield',
    avgFirstInnings: 190,
    boundarySize: '58m - 64m (Compact Fences)',
    recordScore: '266/7 (SRH vs DC, 2024)',
    floodlights: 'Central Canopy LED Perimeter',
    soilType: 'Mixed Soil Strip',
    curatorNote: 'Extremely short square boundaries. Batters clear the ropes with mis-hits; requires clever knuckle balls.',
    stands: ['Bishan Singh Bedi Stand', 'Gautam Gambhir Stand', 'Mohinder Amarnath Stand', 'Virat Kohli Pavilion'],
    keyBattles: 'Wide yorkers and pace-off variations to avoid mid-wicket punishment.'
  },
  pbks: {
    id: 'mullanpur',
    teamId: 'pbks',
    teamName: 'Punjab Kings',
    teamShort: 'PBKS',
    teamColor: '#b91c1c',
    name: 'Maharaja Yadavindra Singh Stadium',
    shortName: 'Mullanpur',
    city: 'Mullanpur / Mohali',
    state: 'Punjab',
    capacity: '38,000',
    capacityNum: 38000,
    pitchType: 'Fresh Green-Tinged Seam & Carry',
    avgFirstInnings: 178,
    boundarySize: '68m - 74m',
    recordScore: '192/7 (MI vs PBKS, 2024)',
    floodlights: 'State-of-the-Art Ring of Fire LED',
    soilType: 'Black & Red Soil Hybrid',
    curatorNote: 'Modern sporting strip with lush outfield. Ball zips off the pitch under cool evening lights.',
    stands: ['Grand Pavilion', 'North Stand (Dhol Beats)', 'South Enclosure', 'Club Pavilion'],
    keyBattles: 'New-ball swing bowling and back-of-length seamers.'
  },
  lsg: {
    id: 'ekana',
    teamId: 'lsg',
    teamName: 'Lucknow Super Giants',
    teamShort: 'LSG',
    teamColor: '#0891b2',
    name: 'BRSABV Ekana Cricket Stadium',
    shortName: 'Ekana',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    capacity: '50,100',
    capacityNum: 50100,
    pitchType: 'Two-Paced Tactical Black Soil',
    avgFirstInnings: 166,
    boundarySize: '70m - 76m',
    recordScore: '199/8 (RR vs LSG, 2024)',
    floodlights: 'Aero-Bowl Perimeter Lighting',
    soilType: 'Black Soil',
    curatorNote: 'Large playing area with spongy bounce. Requires wrist-spinners and batters who construct innings.',
    stands: ['Awadh Pavilion', 'Kashiram Stand', 'East Terrace (Adab Se)', 'North Bowl'],
    keyBattles: 'Targeting gaps and using slower balls into the pitch.'
  },
  gt: {
    id: 'motera',
    teamId: 'gt',
    teamName: 'Gujarat Titans',
    teamShort: 'GT',
    teamColor: '#0d9488',
    name: 'Narendra Modi Stadium',
    shortName: 'Narendra Modi Arena',
    city: 'Ahmedabad',
    state: 'Gujarat',
    capacity: '132,000',
    capacityNum: 132000,
    pitchType: 'World Colosseum Multi-Soil Arena',
    avgFirstInnings: 186,
    boundarySize: '72m - 78m (Massive Outfield)',
    recordScore: '233/3 (GT vs MI, 2023)',
    floodlights: 'Twin Roof-Rim Halo Array (No Towers)',
    soilType: 'Interchangeable Red & Black Soils',
    curatorNote: '11 pitches on the square. Massive outfield requires immense running between wickets and raw power.',
    stands: ['Presidential Pavilion', 'South Stand (Aava De)', 'East Bowl (130K Roar)', 'West Tier'],
    keyBattles: 'Endurance in heat, boundary defensive fielding, and tactical power-hitting.'
  }
}

export function getStadiumForTeam(teamId: string): Stadium {
  const normalized = (teamId || 'rcb').toLowerCase()
  return STADIUMS[normalized] || STADIUMS.rcb
}
