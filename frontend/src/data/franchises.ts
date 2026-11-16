export interface IPLPlayer {
  player_id: string
  name: string
  role: 'BAT' | 'BOWL' | 'AR' | 'WK'
  nationality: 'Indian' | 'Overseas'
  is_overseas: boolean
  price: number // in Crores
  Power_Index: number
  is_retained?: boolean
  is_uncapped?: boolean
  statsSummary?: string
}

export interface ReleasedPlayer {
  name: string
  formerTeam: string
  role: 'BAT' | 'BOWL' | 'AR' | 'WK'
  is_overseas: boolean
  basePrice: number
  predictedAuctionPrice: number
  reason: string
  powerIndex: number
}

export interface FranchiseData {
  id: string
  name: string
  short: string
  color: string
  emoji: string
  titles: string
  totalPurse: number
  retainedSpend2026: number
  miniAuctionPurse2026: number
  stadiumName: string
  stadiumCity: string
  squad2026: IPLPlayer[] // 17-19 Official Retained Players for 2026
  key2026AuctionNeeds: string[]
  strengths: string[]
  weaknesses: string[]
}

export const IPL_FRANCHISES: Record<string, FranchiseData> = {
  rcb: {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    color: '#dc2626',
    emoji: '👑',
    titles: 'Bold Army • 2026 Title Contenders',
    totalPurse: 125.0,
    retainedSpend2026: 106.5,
    miniAuctionPurse2026: 18.5,
    stadiumName: 'M. Chinnaswamy Stadium',
    stadiumCity: 'Bengaluru',
    squad2026: [
      { player_id: 'rcb_1', name: 'Virat Kohli', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 21.0, Power_Index: 95.0, is_retained: true, statsSummary: 'Captain / Icon • 8000+ IPL Runs • Striking at 155+' },
      { player_id: 'rcb_2', name: 'Rajat Patidar', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 11.0, Power_Index: 84.0, is_retained: true, statsSummary: 'Spin Destroyer • Middle Order Enforcer • SR 178 vs Spin' },
      { player_id: 'rcb_3', name: 'Phil Salt', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 11.5, Power_Index: 91.0, is_retained: true, statsSummary: 'Explosive Powerplay Wicket-Keeper Opener • 185+ SR' },
      { player_id: 'rcb_4', name: 'Jitesh Sharma', role: 'WK', nationality: 'Indian', is_overseas: false, price: 11.0, Power_Index: 83.5, is_retained: true, statsSummary: 'Indian Finisher & Wicket-Keeper • High Impact at Death' },
      { player_id: 'rcb_5', name: 'Josh Hazlewood', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 12.5, Power_Index: 92.0, is_retained: true, statsSummary: 'World #1 Test/T20 Seamer • Relentless Chinnaswamy Control' },
      { player_id: 'rcb_6', name: 'Bhuvneshwar Kumar', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 10.75, Power_Index: 86.5, is_retained: true, statsSummary: '2x Purple Cap Legend • Master of Powerplay Swing' },
      { player_id: 'rcb_7', name: 'Liam Livingstone', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 8.75, Power_Index: 88.0, is_retained: true, statsSummary: 'Monster Six Hitter & Leg/Off-Spin Variations' },
      { player_id: 'rcb_8', name: 'Krunal Pandya', role: 'AR', nationality: 'Indian', is_overseas: false, price: 5.75, Power_Index: 82.0, is_retained: true, statsSummary: 'Tactical Left-Arm Finger Spinner & Experienced Finisher' },
      { player_id: 'rcb_9', name: 'Yash Dayal', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 5.0, Power_Index: 75.0, is_retained: true, is_uncapped: true, statsSummary: 'Left-Arm Swing & Death Overs Slower Yorker Artist' },
      { player_id: 'rcb_10', name: 'Rasikh Salam Dar', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 6.0, Power_Index: 78.0, is_retained: true, statsSummary: 'Skiddy Seamer with sharp change of pace' },
      { player_id: 'rcb_11', name: 'Tim David', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 3.0, Power_Index: 85.0, is_retained: true, statsSummary: 'Death Overs Finisher • 180+ Career Strike Rate' },
      { player_id: 'rcb_12', name: 'Suyash Sharma', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 2.6, Power_Index: 77.0, is_retained: true, statsSummary: 'Fast-Arm Leg-Spin & Deadly Googly Specialist' },
      { player_id: 'rcb_13', name: 'Jacob Bethell', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 2.6, Power_Index: 79.0, is_retained: true, statsSummary: 'Young English All-Rounder • Clean Left-Hand Ball Striker' },
      { player_id: 'rcb_14', name: 'Devdutt Padikkal', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 2.0, Power_Index: 80.0, is_retained: true, statsSummary: 'Elegant Top-Order Anchor (Homecoming)' },
      { player_id: 'rcb_15', name: 'Nuwan Thushara', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 1.6, Power_Index: 82.5, is_retained: true, statsSummary: 'Sling Pacer with unpickable toe-crushers' },
      { player_id: 'rcb_16', name: 'Romario Shepherd', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 1.5, Power_Index: 81.0, is_retained: true, statsSummary: 'Windies Powerhitter & Heavy Seam' },
      { player_id: 'rcb_17', name: 'Lungi Ngidi', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 1.0, Power_Index: 81.0, is_retained: true, statsSummary: '145 km/h South African Hit-the-Deck Pacer' },
      { player_id: 'rcb_18', name: 'Swapnil Singh', role: 'AR', nationality: 'Indian', is_overseas: false, price: 0.5, Power_Index: 73.0, is_retained: true, statsSummary: 'Accurate Powerplay Left-Arm Spin' }
    ],
    key2026AuctionNeeds: [
      'Backup Domestic Death Seamer',
      'Emerging Indian Finisher',
      'Backup Wicket-Keeper Batter'
    ],
    strengths: [
      'Top-order explosive firepower (Kohli, Salt, Patidar, Livingstone)',
      'Hazlewood + Bhuvi + Dayal lethal pace and swing combination',
      'Dual wicketkeeper options (Phil Salt & Jitesh Sharma)'
    ],
    weaknesses: ['Spin department relies heavily on Krunal & Suyash']
  },
  csk: {
    id: 'csk',
    name: 'Chennai Super Kings',
    short: 'CSK',
    color: '#fbbf24',
    emoji: '🦁',
    titles: '5x Champions • Whistle Podu',
    totalPurse: 125.0,
    retainedSpend2026: 108.0,
    miniAuctionPurse2026: 17.0,
    stadiumName: 'M. A. Chidambaram Stadium (Chepauk)',
    stadiumCity: 'Chennai',
    squad2026: [
      { player_id: 'csk_1', name: 'Ruturaj Gaikwad', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 89.0, is_retained: true, statsSummary: 'Captain • Consistent Top-Order Anchor' },
      { player_id: 'csk_2', name: 'Ravindra Jadeja', role: 'AR', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 91.5, is_retained: true, statsSummary: 'Elite All-Rounder • Chepauk Spin Master' },
      { player_id: 'csk_3', name: 'Matheesha Pathirana', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 13.0, Power_Index: 89.0, is_retained: true, statsSummary: 'Sling Death Bowling Phenom • 150 km/h' },
      { player_id: 'csk_4', name: 'Shivam Dube', role: 'AR', nationality: 'Indian', is_overseas: false, price: 12.0, Power_Index: 85.0, is_retained: true, statsSummary: 'Monster Spin-Hitter in Middle Overs' },
      { player_id: 'csk_5', name: 'Noor Ahmad', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 10.0, Power_Index: 87.0, is_retained: true, statsSummary: 'Left-Arm Afghan Mystery Spinner' },
      { player_id: 'csk_6', name: 'Ravichandran Ashwin', role: 'AR', nationality: 'Indian', is_overseas: false, price: 9.75, Power_Index: 88.0, is_retained: true, statsSummary: 'Chepauk Homecoming • World Class Off-Spin' },
      { player_id: 'csk_7', name: 'Devon Conway', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 6.25, Power_Index: 86.5, is_retained: true, statsSummary: 'Kiwi Anchor with immense Chepauk consistency' },
      { player_id: 'csk_8', name: 'Khaleel Ahmed', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 4.8, Power_Index: 83.0, is_retained: true, statsSummary: 'Left-Arm Powerplay & Death Seamer' },
      { player_id: 'csk_9', name: 'Rachin Ravindra', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 4.0, Power_Index: 84.5, is_retained: true, statsSummary: 'Kiwi All-Rounder • Clean Striker' },
      { player_id: 'csk_10', name: 'MS Dhoni', role: 'WK', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 84.0, is_retained: true, is_uncapped: true, statsSummary: '5x Champion Captain • Lightning Gloves' },
      { player_id: 'csk_11', name: 'Rahul Tripathi', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 3.4, Power_Index: 80.0, is_retained: true, statsSummary: 'Aggressive #3 Intent Batter' },
      { player_id: 'csk_12', name: 'Anshul Kamboj', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 3.4, Power_Index: 77.0, is_retained: true, statsSummary: 'Emerging Indian Pace Prodigy' },
      { player_id: 'csk_13', name: 'Sam Curran', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 2.4, Power_Index: 84.0, is_retained: true, statsSummary: 'Left-Arm Seam All-Rounder (Homecoming)' },
      { player_id: 'csk_14', name: 'Nathan Ellis', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 82.0, is_retained: true, statsSummary: 'Aussie Yorker & Cutter Death Specialist' },
      { player_id: 'csk_15', name: 'Deepak Hooda', role: 'AR', nationality: 'Indian', is_overseas: false, price: 1.7, Power_Index: 78.0, is_retained: true, statsSummary: 'Off-Spin All-Rounder' },
      { player_id: 'csk_16', name: 'Jamie Overton', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 1.5, Power_Index: 80.0, is_retained: true, statsSummary: '145 km/h English Pace All-Rounder' },
      { player_id: 'csk_17', name: 'Vijay Shankar', role: 'AR', nationality: 'Indian', is_overseas: false, price: 1.2, Power_Index: 76.0, is_retained: true, statsSummary: 'Medium Pace All-Rounder' },
      { player_id: 'csk_18', name: 'Mukesh Choudhary', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 0.3, Power_Index: 75.0, is_retained: true, statsSummary: 'Left-Arm Powerplay Swing Seamer' }
    ],
    key2026AuctionNeeds: ['Backup Indian Wicketkeeper', 'Express Pacer backup'],
    strengths: ['Unbeatable Chepauk spin trio (Ashwin, Jadeja, Noor Ahmad)', 'MS Dhoni clutch mentorship'],
    weaknesses: ['Reliance on turning pitches']
  },
  mi: {
    id: 'mi',
    name: 'Mumbai Indians',
    short: 'MI',
    color: '#2563eb',
    emoji: '🏏',
    titles: '5x Champions • One Family',
    totalPurse: 125.0,
    retainedSpend2026: 107.0,
    miniAuctionPurse2026: 18.0,
    stadiumName: 'Wankhede Stadium',
    stadiumCity: 'Mumbai',
    squad2026: [
      { player_id: 'mi_1', name: 'Jasprit Bumrah', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 98.0, is_retained: true, statsSummary: 'World #1 Pacer • Unplayable at death' },
      { player_id: 'mi_2', name: 'Suryakumar Yadav', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 16.35, Power_Index: 95.0, is_retained: true, statsSummary: 'World T20 #1 • 360-degree Boundary Machine' },
      { player_id: 'mi_3', name: 'Hardik Pandya', role: 'AR', nationality: 'Indian', is_overseas: false, price: 16.35, Power_Index: 90.0, is_retained: true, statsSummary: 'Captain • Pace All-Rounder' },
      { player_id: 'mi_4', name: 'Rohit Sharma', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 16.3, Power_Index: 91.0, is_retained: true, statsSummary: '5x Trophy Captain • Explosive Opener' },
      { player_id: 'mi_5', name: 'Trent Boult', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 12.5, Power_Index: 92.0, is_retained: true, statsSummary: 'Lethal Inswinging Powerplay Spearhead (Homecoming)' },
      { player_id: 'mi_6', name: 'Deepak Chahar', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 9.25, Power_Index: 84.0, is_retained: true, statsSummary: 'High Class Powerplay Swing Bowler' },
      { player_id: 'mi_7', name: 'Tilak Varma', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 8.0, Power_Index: 84.0, is_retained: true, statsSummary: 'Young Left-Hand Dynamo' },
      { player_id: 'mi_8', name: 'Will Jacks', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 5.25, Power_Index: 87.0, is_retained: true, statsSummary: 'Explosive Opener / #3 • 41-ball IPL 100' },
      { player_id: 'mi_9', name: 'Naman Dhir', role: 'AR', nationality: 'Indian', is_overseas: false, price: 5.25, Power_Index: 78.0, is_retained: true, statsSummary: 'Hard-hitting young Indian finisher' },
      { player_id: 'mi_10', name: 'Allah Ghazanfar', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 4.8, Power_Index: 81.0, is_retained: true, statsSummary: 'Teenage Mystery Off-Spin Sensation' },
      { player_id: 'mi_11', name: 'Mitchell Santner', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 85.0, is_retained: true, statsSummary: 'World Cup Winner • Ultra-economical Left-Arm Spin' },
      { player_id: 'mi_12', name: 'Ryan Rickelton', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 1.0, Power_Index: 80.0, is_retained: true, statsSummary: 'South African Explosive Wicketkeeper-Opener' },
      { player_id: 'mi_13', name: 'Reece Topley', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 81.0, is_retained: true, statsSummary: '6ft 7in Left-Arm English Fast Bowler' },
      { player_id: 'mi_14', name: 'Robin Minz', role: 'WK', nationality: 'Indian', is_overseas: false, price: 0.65, Power_Index: 74.0, is_retained: true, statsSummary: 'Left-Hand Tribal Indian Powerhitter / WK' },
      { player_id: 'mi_15', name: 'Karn Sharma', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 0.5, Power_Index: 76.0, is_retained: true, statsSummary: 'Veteran Leg-Spinner' },
      { player_id: 'mi_16', name: 'Raj Angad Bawa', role: 'AR', nationality: 'Indian', is_overseas: false, price: 0.3, Power_Index: 72.0, statsSummary: 'U19 World Cup Final Hero All-Rounder' },
      { player_id: 'mi_17', name: 'Lizaad Williams', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 78.0, statsSummary: '145 km/h South African Pacer' }
    ],
    key2026AuctionNeeds: ['Indian Middle-Order Backup', 'Specialist Leg-Spinner'],
    strengths: ['Best Indian core in world cricket (Rohit, Surya, Hardik, Bumrah, Tilak)', 'Bumrah + Boult opening and death bowling'],
    weaknesses: ['Spin depth']
  },
  kkr: {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    color: '#7c3aed',
    emoji: '⚔️',
    titles: '3x Champions • Defending Champions',
    totalPurse: 125.0,
    retainedSpend2026: 110.0,
    miniAuctionPurse2026: 15.0,
    stadiumName: 'Eden Gardens',
    stadiumCity: 'Kolkata',
    squad2026: [
      { player_id: 'kkr_1', name: 'Venkatesh Iyer', role: 'AR', nationality: 'Indian', is_overseas: false, price: 23.75, Power_Index: 88.0, is_retained: true, statsSummary: 'Big-Match Final Specialist' },
      { player_id: 'kkr_2', name: 'Rinku Singh', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 13.0, Power_Index: 87.0, is_retained: true, statsSummary: 'Ice-Cool Finisher' },
      { player_id: 'kkr_3', name: 'Varun Chakaravarthy', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 12.0, Power_Index: 89.0, is_retained: true, statsSummary: 'Mystery Spin Spearhead' },
      { player_id: 'kkr_4', name: 'Sunil Narine', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 12.0, Power_Index: 93.0, is_retained: true, statsSummary: '2024 MVP • Explosive Opener & Spin' },
      { player_id: 'kkr_5', name: 'Andre Russell', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 12.0, Power_Index: 92.0, is_retained: true, statsSummary: 'Ultimate Powerhit Enforcer' },
      { player_id: 'kkr_6', name: 'Anrich Nortje', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 6.5, Power_Index: 88.0, is_retained: true, statsSummary: '155 km/h Express South African Thunderbolt' },
      { player_id: 'kkr_7', name: 'Harshit Rana', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 79.0, is_retained: true, is_uncapped: true, statsSummary: 'Fast Bouncer & Slower Ball Specialist' },
      { player_id: 'kkr_8', name: 'Ramandeep Singh', role: 'AR', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 76.5, is_retained: true, is_uncapped: true, statsSummary: 'Dynamic Lower-Order Striker' },
      { player_id: 'kkr_9', name: 'Quinton de Kock', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 3.6, Power_Index: 88.5, is_retained: true, statsSummary: 'World Class Wicketkeeper Opener' },
      { player_id: 'kkr_10', name: 'Angkrish Raghuvanshi', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 3.0, Power_Index: 79.0, is_retained: true, statsSummary: 'Fearless young #3 stroke-maker' },
      { player_id: 'kkr_11', name: 'Spencer Johnson', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 2.8, Power_Index: 81.0, is_retained: true, statsSummary: 'Tall Aussie Left-Arm Express Seamer' },
      { player_id: 'kkr_12', name: 'Rahmanullah Gurbaz', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 82.0, is_retained: true, statsSummary: 'Aggressive Afghan Opener / Keeper' },
      { player_id: 'kkr_13', name: 'Moeen Ali', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 82.0, is_retained: true, statsSummary: 'World Cup Winner • Off-spin & attacking bat' },
      { player_id: 'kkr_14', name: 'Vaibhav Arora', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 1.8, Power_Index: 78.0, is_retained: true, statsSummary: 'Inswinging New Ball Specialist' },
      { player_id: 'kkr_15', name: 'Ajinkya Rahane', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 1.5, Power_Index: 80.0, is_retained: true, statsSummary: 'Experienced top order anchor' },
      { player_id: 'kkr_16', name: 'Rovman Powell', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 1.5, Power_Index: 82.0, is_retained: true, statsSummary: 'Windies T20 Captain • Huge Sixes' },
      { player_id: 'kkr_17', name: 'Umran Malik', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 0.75, Power_Index: 78.0, is_retained: true, statsSummary: '157 km/h Speed Demon' }
    ],
    key2026AuctionNeeds: ['Designated Captain', 'Indian Spin depth'],
    strengths: ['All-Rounder dominance (Russell, Narine, Venky Iyer, Ramandeep)', 'Mystery spin at Eden Gardens'],
    weaknesses: ['Captaincy transition']
  },
  srh: {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    short: 'SRH',
    color: '#ea580c',
    emoji: '🌅',
    titles: '2x Champions • Orange Army',
    totalPurse: 125.0,
    retainedSpend2026: 112.0,
    miniAuctionPurse2026: 13.0,
    stadiumName: 'Rajiv Gandhi International Cricket Stadium',
    stadiumCity: 'Hyderabad',
    squad2026: [
      { player_id: 'srh_1', name: 'Heinrich Klaasen', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 23.0, Power_Index: 96.0, is_retained: true, statsSummary: 'World #1 Spin Finisher' },
      { player_id: 'srh_2', name: 'Pat Cummins', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 18.0, Power_Index: 91.0, is_retained: true, statsSummary: 'Captain & Leader' },
      { player_id: 'srh_3', name: 'Travis Head', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 14.0, Power_Index: 93.5, is_retained: true, statsSummary: 'Powerplay Monster • 200+ SR' },
      { player_id: 'srh_4', name: 'Abhishek Sharma', role: 'AR', nationality: 'Indian', is_overseas: false, price: 14.0, Power_Index: 88.0, is_retained: true, statsSummary: 'Most Sixes in IPL 2024' },
      { player_id: 'srh_5', name: 'Ishan Kishan', role: 'WK', nationality: 'Indian', is_overseas: false, price: 11.25, Power_Index: 88.5, is_retained: true, statsSummary: 'Dynamic Indian Keeper-Opener' },
      { player_id: 'srh_6', name: 'Mohammed Shami', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 10.0, Power_Index: 91.0, is_retained: true, statsSummary: 'World Cup Leading Wicket-Taker' },
      { player_id: 'srh_7', name: 'Harshal Patel', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 8.0, Power_Index: 86.0, is_retained: true, statsSummary: 'Purple Cap Winner • Slower Yorker' },
      { player_id: 'srh_8', name: 'Nitish Kumar Reddy', role: 'AR', nationality: 'Indian', is_overseas: false, price: 6.0, Power_Index: 80.0, is_retained: true, statsSummary: 'Emerging Pace All-Rounder' },
      { player_id: 'srh_9', name: 'Abhinav Manohar', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 3.2, Power_Index: 78.0, is_retained: true, statsSummary: 'Clean Indian Finisher' },
      { player_id: 'srh_10', name: 'Rahul Chahar', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 3.2, Power_Index: 81.0, is_retained: true, statsSummary: 'Attacking Leg-Spinner' },
      { player_id: 'srh_11', name: 'Adam Zampa', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 2.4, Power_Index: 88.0, is_retained: true, statsSummary: 'World Cup Winner • Elite T20 Leg-Spinner' },
      { player_id: 'srh_12', name: 'Simarjeet Singh', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 1.5, Power_Index: 77.0, is_retained: true, statsSummary: '145 km/h Hit-the-Deck Pacer' },
      { player_id: 'srh_13', name: 'Brydon Carse', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 1.0, Power_Index: 79.0, is_retained: true, statsSummary: 'Express Pacer & Lower-Order Hitter' },
      { player_id: 'srh_14', name: 'Jaydev Unadkat', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 1.0, Power_Index: 76.0, is_retained: true, statsSummary: 'Left-Arm Cutter Specialist' },
      { player_id: 'srh_15', name: 'Kamindu Mendis', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 80.0, is_retained: true, statsSummary: 'Ambidextrous Spinner & Bat' },
      { player_id: 'srh_16', name: 'Atharva Taide', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 0.3, Power_Index: 74.0, is_retained: true, statsSummary: 'Attacking top order batter' },
      { player_id: 'srh_17', name: 'Eshan Malinga', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 1.2, Power_Index: 75.0, is_retained: true, statsSummary: 'Sling Pacer from Sri Lanka' }
    ],
    key2026AuctionNeeds: ['Backup Indian middle order', 'Death over discipline'],
    strengths: ['Head + Abhishek + Ishan + Klaasen historical 275+ run capability', 'Cummins + Shami pace spearhead'],
    weaknesses: ['Hyper-aggressive batting can occasionally misfire on slow tracks']
  },
  rr: {
    id: 'rr',
    name: 'Rajasthan Royals',
    short: 'RR',
    color: '#db2777',
    emoji: '💎',
    titles: 'Inaugural Champions • Halla Bol',
    totalPurse: 125.0,
    retainedSpend2026: 112.0,
    miniAuctionPurse2026: 13.0,
    stadiumName: 'Sawai Mansingh Stadium',
    stadiumCity: 'Jaipur',
    squad2026: [
      { player_id: 'rr_1', name: 'Sanju Samson', role: 'WK', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 89.5, is_retained: true, statsSummary: 'Captain & Wicketkeeper' },
      { player_id: 'rr_2', name: 'Yashasvi Jaiswal', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 93.0, is_retained: true, statsSummary: 'Superstar Opener' },
      { player_id: 'rr_3', name: 'Riyan Parag', role: 'AR', nationality: 'Indian', is_overseas: false, price: 14.0, Power_Index: 85.0, is_retained: true, statsSummary: '#4 Powerhitter' },
      { player_id: 'rr_4', name: 'Dhruv Jurel', role: 'WK', nationality: 'Indian', is_overseas: false, price: 14.0, Power_Index: 81.0, is_retained: true, statsSummary: 'Elite Finisher' },
      { player_id: 'rr_5', name: 'Jofra Archer', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 12.5, Power_Index: 93.0, is_retained: true, statsSummary: '150 km/h Express Demon' },
      { player_id: 'rr_6', name: 'Shimron Hetmyer', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 11.0, Power_Index: 83.0, is_retained: true, statsSummary: 'Death Slogger' },
      { player_id: 'rr_7', name: 'Tushar Deshpande', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 6.5, Power_Index: 81.0, is_retained: true, statsSummary: 'Wicket-taking Indian seamer' },
      { player_id: 'rr_8', name: 'Wanindu Hasaranga', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 5.25, Power_Index: 89.0, is_retained: true, statsSummary: 'World #1 Sri Lankan Leg-Spinner & Finisher' },
      { player_id: 'rr_9', name: 'Maheesh Theekshana', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 4.4, Power_Index: 86.0, is_retained: true, statsSummary: 'Mystery Carrom Ball Specialist' },
      { player_id: 'rr_10', name: 'Nitish Rana', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 4.2, Power_Index: 82.0, is_retained: true, statsSummary: 'Aggressive Left-Hand Middle Order Striker' },
      { player_id: 'rr_11', name: 'Sandeep Sharma', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 78.5, is_retained: true, is_uncapped: true, statsSummary: 'Knuckle Ball & Yorker Genius' },
      { player_id: 'rr_12', name: 'Fazalhaq Farooqi', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 83.0, is_retained: true, statsSummary: 'Afghan Left-Arm Inswinging Seamer' },
      { player_id: 'rr_13', name: 'Kwena Maphaka', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 1.5, Power_Index: 78.0, is_retained: true, statsSummary: 'Young South African 148 km/h Pacer' },
      { player_id: 'rr_14', name: 'Akash Madhwal', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 1.2, Power_Index: 78.0, is_retained: true, statsSummary: 'Accurate Yorker specialist' },
      { player_id: 'rr_15', name: 'Vaibhav Suryavanshi', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 1.1, Power_Index: 74.0, is_retained: true, statsSummary: 'Youngest ever IPL signee (13 yrs)' },
      { player_id: 'rr_16', name: 'Shubham Dubey', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 0.8, Power_Index: 74.0, is_retained: true, statsSummary: 'Hard hitting finisher' },
      { player_id: 'rr_17', name: 'Kumar Kushagra', role: 'WK', nationality: 'Indian', is_overseas: false, price: 0.65, Power_Index: 73.0, is_retained: true, statsSummary: 'Young backup keeper' }
    ],
    key2026AuctionNeeds: ['All-rounder backup', 'Domestic spin backup'],
    strengths: ['Deadly Jofra Archer pace + Hasaranga mystery spin', 'Top order of Jaiswal and Samson'],
    weaknesses: ['Lower order can be thin']
  },
  dc: {
    id: 'dc',
    name: 'Delhi Capitals',
    short: 'DC',
    color: '#0284c7',
    emoji: '🦅',
    titles: 'Roar Macha • 2026 Powerhouse',
    totalPurse: 125.0,
    retainedSpend2026: 111.0,
    miniAuctionPurse2026: 14.0,
    stadiumName: 'Arun Jaitley Stadium',
    stadiumCity: 'New Delhi',
    squad2026: [
      { player_id: 'dc_1', name: 'Axar Patel', role: 'AR', nationality: 'Indian', is_overseas: false, price: 16.5, Power_Index: 89.0, is_retained: true, statsSummary: 'Vice Captain • Elite All-Rounder' },
      { player_id: 'dc_2', name: 'KL Rahul', role: 'WK', nationality: 'Indian', is_overseas: false, price: 14.0, Power_Index: 92.0, is_retained: true, statsSummary: 'Captain / Opener • 4500+ IPL Runs' },
      { player_id: 'dc_3', name: 'Kuldeep Yadav', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 13.25, Power_Index: 90.0, is_retained: true, statsSummary: 'World Class Left-Arm Wrist Spinner' },
      { player_id: 'dc_4', name: 'Mitchell Starc', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 11.75, Power_Index: 92.5, is_retained: true, statsSummary: 'IPL Final PoTM • Left-Arm Fire' },
      { player_id: 'dc_5', name: 'T Natarajan', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 10.75, Power_Index: 87.0, is_retained: true, statsSummary: 'Yorker King • Elite Death Specialist' },
      { player_id: 'dc_6', name: 'Tristan Stubbs', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 10.0, Power_Index: 86.5, is_retained: true, statsSummary: '360 Finisher' },
      { player_id: 'dc_7', name: 'Jake Fraser-McGurk', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 9.0, Power_Index: 91.0, is_retained: true, statsSummary: 'Powerplay Demolisher • 234 SR' },
      { player_id: 'dc_8', name: 'Mukesh Kumar', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 8.0, Power_Index: 82.0, is_retained: true, statsSummary: 'Accurate Seam Bowler' },
      { player_id: 'dc_9', name: 'Harry Brook', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 6.25, Power_Index: 85.0, is_retained: true, statsSummary: 'English Explosive Middle Order Batter' },
      { player_id: 'dc_10', name: 'Abishek Porel', role: 'WK', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 77.0, is_retained: true, is_uncapped: true, statsSummary: 'Dynamic Opener / Keeper' },
      { player_id: 'dc_11', name: 'Ashutosh Sharma', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 3.8, Power_Index: 80.0, is_retained: true, statsSummary: 'High-Impact Indian Death Over Finisher' },
      { player_id: 'dc_12', name: 'Mohit Sharma', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 2.2, Power_Index: 80.0, is_retained: true, statsSummary: 'Knuckle Ball & Back of the Hand Specialist' },
      { player_id: 'dc_13', name: 'Faf du Plessis', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 85.0, is_retained: true, statsSummary: 'Veteran Leader & Explosive Opener' },
      { player_id: 'dc_14', name: 'Sameer Rizvi', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 0.95, Power_Index: 75.0, is_retained: true, statsSummary: 'Spin Hitting Prodigy' },
      { player_id: 'dc_15', name: 'Dushmantha Chameera', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 79.0, is_retained: true, statsSummary: 'Sri Lankan Express Pacer' },
      { player_id: 'dc_16', name: 'Donovan Ferreira', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 77.0, is_retained: true, statsSummary: 'South African Big Hitter & Keeper' },
      { player_id: 'dc_17', name: 'Karun Nair', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 0.5, Power_Index: 76.0, is_retained: true, statsSummary: 'Classical Indian Test Triple-Centurion' }
    ],
    key2026AuctionNeeds: ['Backup Indian Spinners'],
    strengths: ['Starc + Natarajan + Mukesh pace and yorker arsenal', 'KL Rahul + Fraser-McGurk opening combo'],
    weaknesses: ['Small ground at Kotla puts pressure on bowlers']
  },
  pbks: {
    id: 'pbks',
    name: 'Punjab Kings',
    short: 'PBKS',
    color: '#b91c1c',
    emoji: '🗡️',
    titles: 'Sadda Punjab • Rebuilt for 2026',
    totalPurse: 125.0,
    retainedSpend2026: 114.0,
    miniAuctionPurse2026: 11.0,
    stadiumName: 'Maharaja Yadavindra Singh Stadium',
    stadiumCity: 'Mullanpur / Mohali',
    squad2026: [
      { player_id: 'pbks_1', name: 'Shreyas Iyer', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 26.75, Power_Index: 93.0, is_retained: true, statsSummary: 'Captain • 2024 Champion Leader' },
      { player_id: 'pbks_2', name: 'Arshdeep Singh', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 92.0, is_retained: true, statsSummary: 'T20 World Cup Leading Wicket-Taker' },
      { player_id: 'pbks_3', name: 'Yuzvendra Chahal', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 18.0, Power_Index: 92.0, is_retained: true, statsSummary: 'All-time IPL Wicket Leader (205 Wickets)' },
      { player_id: 'pbks_4', name: 'Marcus Stoinis', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 11.0, Power_Index: 88.0, is_retained: true, statsSummary: 'The Hulk • Match-winning middle order all-rounder' },
      { player_id: 'pbks_5', name: 'Marco Jansen', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 7.0, Power_Index: 86.0, is_retained: true, statsSummary: 'Tall South African Left-Arm Pacer & Powerhitter' },
      { player_id: 'pbks_6', name: 'Shashank Singh', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 5.5, Power_Index: 78.5, is_retained: true, is_uncapped: true, statsSummary: 'Sensational 2024 Finisher' },
      { player_id: 'pbks_7', name: 'Glenn Maxwell', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 4.2, Power_Index: 88.0, is_retained: true, statsSummary: 'The Big Show (Homecoming)' },
      { player_id: 'pbks_8', name: 'Nehal Wadhera', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 4.2, Power_Index: 80.0, is_retained: true, statsSummary: 'Clean Striking Left-Hander' },
      { player_id: 'pbks_9', name: 'Prabhsimran Singh', role: 'WK', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 75.0, is_retained: true, is_uncapped: true, statsSummary: 'Aggressive Powerplay Opener' },
      { player_id: 'pbks_10', name: 'Priyansh Arya', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 3.8, Power_Index: 78.0, is_retained: true, statsSummary: 'Delhi Sensation (6 Sixes in an over)' },
      { player_id: 'pbks_11', name: 'Josh Inglis', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 2.6, Power_Index: 84.0, is_retained: true, statsSummary: 'Aussie T20 Keeper-Batter' },
      { player_id: 'pbks_12', name: 'Azmatullah Omarzai', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 2.4, Power_Index: 82.0, is_retained: true, statsSummary: 'Afghan Seam All-Rounder' },
      { player_id: 'pbks_13', name: 'Lockie Ferguson', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 83.0, is_retained: true, statsSummary: '150 km/h Kiwi Thunderbolt' },
      { player_id: 'pbks_14', name: 'Vijaykumar Vyshak', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 1.8, Power_Index: 78.0, is_retained: true, statsSummary: 'Knuckle ball & bouncer seamer' },
      { player_id: 'pbks_15', name: 'Harpreet Brar', role: 'AR', nationality: 'Indian', is_overseas: false, price: 1.5, Power_Index: 79.0, is_retained: true, statsSummary: 'Accurate Left-Arm Finger Spinner' },
      { player_id: 'pbks_16', name: 'Aaron Hardie', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 1.25, Power_Index: 78.0, is_retained: true, statsSummary: 'Aussie Pace All-Rounder' },
      { player_id: 'pbks_17', name: 'Kuldeep Sen', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 0.8, Power_Index: 75.0, is_retained: true, statsSummary: '145 km/h express Indian seamer' }
    ],
    key2026AuctionNeeds: ['Backup Indian Opener'],
    strengths: ['Shreyas Iyer captaincy + Ricky Ponting master coaching', 'Arshdeep + Chahal + Lockie bowling balance'],
    weaknesses: ['Limited purse for mini-auction']
  },
  lsg: {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    short: 'LSG',
    color: '#0891b2',
    emoji: '🐘',
    titles: 'Adab Se • Mega Powerhouse',
    totalPurse: 125.0,
    retainedSpend2026: 113.0,
    miniAuctionPurse2026: 12.0,
    stadiumName: 'BRSABV Ekana Cricket Stadium',
    stadiumCity: 'Lucknow',
    squad2026: [
      { player_id: 'lsg_1', name: 'Rishabh Pant', role: 'WK', nationality: 'Indian', is_overseas: false, price: 27.0, Power_Index: 96.0, is_retained: true, statsSummary: 'Captain • Record ₹27 Cr Signee' },
      { player_id: 'lsg_2', name: 'Nicholas Pooran', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 21.0, Power_Index: 93.0, is_retained: true, statsSummary: 'Vice Captain • Clean Six Hitter' },
      { player_id: 'lsg_3', name: 'Ravi Bishnoi', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 11.0, Power_Index: 86.0, is_retained: true, statsSummary: 'Googly Master' },
      { player_id: 'lsg_4', name: 'Mayank Yadav', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 11.0, Power_Index: 86.0, is_retained: true, statsSummary: '156.7 km/h Thunderbolt' },
      { player_id: 'lsg_5', name: 'Avesh Khan', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 9.75, Power_Index: 84.0, is_retained: true, statsSummary: 'Death Overs Specialist (Homecoming)' },
      { player_id: 'lsg_6', name: 'Akash Deep', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 8.0, Power_Index: 83.0, is_retained: true, statsSummary: 'Indian Test Pacer' },
      { player_id: 'lsg_7', name: 'David Miller', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 7.5, Power_Index: 87.0, is_retained: true, statsSummary: 'Killer Miller • Greatest Clutch Finisher' },
      { player_id: 'lsg_8', name: 'Mohsin Khan', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 78.0, is_retained: true, is_uncapped: true, statsSummary: 'Tall Left-Arm Pacer' },
      { player_id: 'lsg_9', name: 'Abdul Samad', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 4.2, Power_Index: 78.0, is_retained: true, statsSummary: 'Power Finisher from J&K' },
      { player_id: 'lsg_10', name: 'Ayush Badoni', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 76.5, is_retained: true, is_uncapped: true, statsSummary: 'Finisher & Spin Hitter' },
      { player_id: 'lsg_11', name: 'Mitchell Marsh', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 3.4, Power_Index: 86.0, is_retained: true, statsSummary: 'Aussie T20 Captain • Enforcer at #3' },
      { player_id: 'lsg_12', name: 'Shahbaz Ahmed', role: 'AR', nationality: 'Indian', is_overseas: false, price: 2.4, Power_Index: 79.0, is_retained: true, statsSummary: 'Tactical Left-Arm Spinner' },
      { player_id: 'lsg_13', name: 'Aiden Markram', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 84.0, is_retained: true, statsSummary: 'Proteas T20 Captain' },
      { player_id: 'lsg_14', name: 'Shamar Joseph', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 81.0, is_retained: true, statsSummary: '150 km/h Gabba Hero' },
      { player_id: 'lsg_15', name: 'Matthew Breetzke', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 0.75, Power_Index: 77.0, is_retained: true, statsSummary: 'South African Top-Order Striker' },
      { player_id: 'lsg_16', name: 'M Siddharth', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 0.75, Power_Index: 75.0, is_retained: true, statsSummary: 'Accurate Arm-Ball Spinner' },
      { player_id: 'lsg_17', name: 'Rajvardhan Hangargekar', role: 'AR', nationality: 'Indian', is_overseas: false, price: 0.3, Power_Index: 73.0, is_retained: true, statsSummary: 'Pace all-rounder' }
    ],
    key2026AuctionNeeds: ['Backup Indian Opener'],
    strengths: ['Pant + Pooran + Miller + Marsh middle order demolition squad', 'Express pace in Mayank Yadav + Mohsin + Avesh'],
    weaknesses: ['Opening slot stability']
  },
  gt: {
    id: 'gt',
    name: 'Gujarat Titans',
    short: 'GT',
    color: '#0d9488',
    emoji: '🛡️',
    titles: '2022 Champions • Aava De',
    totalPurse: 125.0,
    retainedSpend2026: 112.0,
    miniAuctionPurse2026: 13.0,
    stadiumName: 'Narendra Modi Stadium',
    stadiumCity: 'Ahmedabad',
    squad2026: [
      { player_id: 'gt_1', name: 'Rashid Khan', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 18.0, Power_Index: 95.0, is_retained: true, statsSummary: 'World #1 T20 Spinner & Finisher' },
      { player_id: 'gt_2', name: 'Shubman Gill', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 16.5, Power_Index: 92.0, is_retained: true, statsSummary: 'Captain • Orange Cap Record Holder' },
      { player_id: 'gt_3', name: 'Jos Buttler', role: 'WK', nationality: 'Overseas', is_overseas: true, price: 15.75, Power_Index: 94.0, is_retained: true, statsSummary: 'Superstar Keeper-Opener • 5x Centuries' },
      { player_id: 'gt_4', name: 'Mohammed Siraj', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 12.25, Power_Index: 89.0, is_retained: true, statsSummary: 'Miyan Magic • Powerplay Inswing Master' },
      { player_id: 'gt_5', name: 'Kagiso Rabada', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 10.75, Power_Index: 90.0, is_retained: true, statsSummary: 'Purple Cap Winner • 148 km/h Strike Bowler' },
      { player_id: 'gt_6', name: 'Prasidh Krishna', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 9.5, Power_Index: 84.0, is_retained: true, statsSummary: 'Tall Hit-the-Deck Express Pacer' },
      { player_id: 'gt_7', name: 'Sai Sudharsan', role: 'BAT', nationality: 'Indian', is_overseas: false, price: 8.5, Power_Index: 84.0, is_retained: true, statsSummary: 'Dominant #3 Left-Hander' },
      { player_id: 'gt_8', name: 'Rahul Tewatia', role: 'AR', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 78.0, is_retained: true, is_uncapped: true, statsSummary: 'Ice Finisher' },
      { player_id: 'gt_9', name: 'Shahrukh Khan', role: 'AR', nationality: 'Indian', is_overseas: false, price: 4.0, Power_Index: 75.0, is_retained: true, is_uncapped: true, statsSummary: 'Power Finisher' },
      { player_id: 'gt_10', name: 'Washington Sundar', role: 'AR', nationality: 'Indian', is_overseas: false, price: 3.2, Power_Index: 82.0, is_retained: true, statsSummary: 'Powerplay Miserly Off-Spinner' },
      { player_id: 'gt_11', name: 'Sherfane Rutherford', role: 'BAT', nationality: 'Overseas', is_overseas: true, price: 2.6, Power_Index: 81.0, is_retained: true, statsSummary: 'Windies Six-Hitting Specialist' },
      { player_id: 'gt_12', name: 'Gerald Coetzee', role: 'BOWL', nationality: 'Overseas', is_overseas: true, price: 2.4, Power_Index: 84.0, is_retained: true, statsSummary: '150 km/h Express Pacer' },
      { player_id: 'gt_13', name: 'Glenn Phillips', role: 'AR', nationality: 'Overseas', is_overseas: true, price: 2.0, Power_Index: 83.0, is_retained: true, statsSummary: 'World Class Fielder & Dynamic Hitter' },
      { player_id: 'gt_14', name: 'Sai Kishore', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 2.0, Power_Index: 80.0, is_retained: true, statsSummary: 'Economical Left-Arm Finger Spinner' },
      { player_id: 'gt_15', name: 'Mahipal Lomror', role: 'AR', nationality: 'Indian', is_overseas: false, price: 1.7, Power_Index: 77.0, is_retained: true, statsSummary: 'Spin Hitting Middle Order Left-Hander' },
      { player_id: 'gt_16', name: 'Gurnoor Brar', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 1.3, Power_Index: 73.0, is_retained: true, statsSummary: 'Tall 6ft 5in Punjab Pacer' },
      { player_id: 'gt_17', name: 'Ishant Sharma', role: 'BOWL', nationality: 'Indian', is_overseas: false, price: 0.75, Power_Index: 76.0, is_retained: true, statsSummary: 'Veteran 100-Test Indian Pacer' }
    ],
    key2026AuctionNeeds: ['Backup Indian middle order'],
    strengths: ['Dream opening pair: Jos Buttler & Shubman Gill', 'Deadly pace attack (Rabada, Siraj, Prasidh, Coetzee) + Rashid Khan'],
    weaknesses: ['Lower order reliance on Tewatia & Shahrukh']
  }
}

// ─── Key Real Released Marquee Players entering the Auction Pool ───
export const RELEASED_AUCTION_POOL: ReleasedPlayer[] = [
  { name: 'Rishabh Pant', formerTeam: 'Delhi Capitals', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 27.0, reason: 'Record Breaking Auction Winner. Bought by LSG for ₹27 Cr.', powerIndex: 96.0 },
  { name: 'Shreyas Iyer', formerTeam: 'Kolkata Knight Riders', role: 'BAT', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 26.75, reason: 'IPL 2024 Champion Captain. Bought by PBKS for ₹26.75 Cr.', powerIndex: 93.0 },
  { name: 'Venkatesh Iyer', formerTeam: 'Kolkata Knight Riders', role: 'AR', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 23.75, reason: 'Finals MVP. Bought back by KKR for ₹23.75 Cr.', powerIndex: 88.0 },
  { name: 'Arshdeep Singh', formerTeam: 'Punjab Kings', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 18.0, reason: 'World Cup Winner. Retained via RTM by PBKS for ₹18 Cr.', powerIndex: 92.0 },
  { name: 'Yuzvendra Chahal', formerTeam: 'Rajasthan Royals', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 18.0, reason: 'All-time IPL leading wicket-taker. Bought by PBKS for ₹18 Cr.', powerIndex: 92.0 },
  { name: 'Jos Buttler', formerTeam: 'Rajasthan Royals', role: 'WK', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 15.75, reason: '5x Century Legend. Bought by Gujarat Titans for ₹15.75 Cr.', powerIndex: 94.0 },
  { name: 'KL Rahul', formerTeam: 'Lucknow Super Giants', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 14.0, reason: 'Signed by Delhi Capitals for ₹14 Cr.', powerIndex: 92.0 },
  { name: 'Mohammed Siraj', formerTeam: 'Royal Challengers Bengaluru', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 12.25, reason: 'Miyan Magic. Bought by GT for ₹12.25 Cr.', powerIndex: 89.0 },
  { name: 'Mitchell Starc', formerTeam: 'Kolkata Knight Riders', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 11.75, reason: '2024 Final PoTM. Signed by DC for ₹11.75 Cr.', powerIndex: 92.5 },
  { name: 'Phil Salt', formerTeam: 'Kolkata Knight Riders', role: 'WK', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 11.5, reason: 'Explosive Keeper-Opener. Signed by RCB for ₹11.5 Cr.', powerIndex: 91.0 },
  { name: 'Ishan Kishan', formerTeam: 'Mumbai Indians', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 11.25, reason: 'Signed by SRH for ₹11.25 Cr.', powerIndex: 88.5 },
  { name: 'Trent Boult', formerTeam: 'Rajasthan Royals', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 12.5, reason: 'Powerplay Inswing Master. Returned to MI for ₹12.5 Cr.', powerIndex: 92.0 },
  { name: 'Glenn Maxwell', formerTeam: 'Royal Challengers Bengaluru', role: 'AR', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 4.2, reason: 'Big Show returned to PBKS for ₹4.2 Cr.', powerIndex: 88.0 },
  { name: 'Mohammed Shami', formerTeam: 'Gujarat Titans', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 10.0, reason: 'Purple Cap Winner. Signed by SRH for ₹10 Cr.', powerIndex: 91.0 },
  { name: 'Jofra Archer', formerTeam: 'Mumbai Indians', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 12.5, reason: 'Returned to Rajasthan Royals for ₹12.5 Cr.', powerIndex: 93.0 },
  { name: 'Faf du Plessis', formerTeam: 'Royal Challengers Bengaluru', role: 'BAT', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 2.0, reason: 'Veteran Captain signed by DC for ₹2.0 Cr.', powerIndex: 85.0 }
]

export function getFranchise(teamId: string): FranchiseData {
  const normalized = (teamId || 'rcb').toLowerCase()
  return IPL_FRANCHISES[normalized] || IPL_FRANCHISES.rcb
}
