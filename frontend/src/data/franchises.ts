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
  squad2026: IPLPlayer[]
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
    titles: 'Bold Army • 2026 Contenders',
    totalPurse: 125.0,
    retainedSpend2026: 106.5,
    miniAuctionPurse2026: 18.5,
    stadiumName: 'M. Chinnaswamy Stadium',
    stadiumCity: 'Bengaluru',
    squad2026: [
      {
        player_id: 'rcb_1',
        name: "Virat Kohli",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 21.00,
        Power_Index: 96.0,
        is_retained: true,
        statsSummary: "Captain / Icon \u2022 8000+ IPL Runs \u2022 Top Run Scorer \u2022 2026: 675 Runs (Avg 56.2, SR 165.8) [1x100, 5x50]"
      },
      {
        player_id: 'rcb_2',
        name: "Rajat Patidar",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.00,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Spin Destroyer \u2022 Enforcer at #4 \u2022 2026: 501 Runs (Avg 41.8, SR 192.7) [5x50]"
      },
      {
        player_id: 'rcb_3',
        name: "Phil Salt",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.50,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "Powerplay WK Opener \u2022 Striking at 180+ \u2022 2026: 202 Runs (Avg 33.7, SR 168.3) [2x50]"
      },
      {
        player_id: 'rcb_4',
        name: "Jitesh Sharma",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.00,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Indian Finisher & Wicketkeeper \u2022 2026: 116 Runs (Avg 12.9, SR 122.1)"
      },
      {
        player_id: 'rcb_5',
        name: "Josh Hazlewood",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.50,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "World #1 Seam Specialist \u2022 Relentless Test Line \u2022 2026: 15 Wkts (Econ 9.59, BBI 12/4)"
      },
      {
        player_id: 'rcb_6',
        name: "Bhuvneshwar Kumar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 10.75,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "2x Purple Cap Legend \u2022 Master of Powerplay Swing \u2022 2026: 34 Runs (Avg 0.0, SR 130.8) \u2022 2026: 28 Wkts (Econ 7.95, BBI 23/4)"
      },
      {
        player_id: 'rcb_7',
        name: "Liam Livingstone",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 8.75,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Monster Six-Hitter & Dual Spin Variations"
      },
      {
        player_id: 'rcb_8',
        name: "Krunal Pandya",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.75,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Left-Arm Finger Spin & Clutch Lower-Order Runs \u2022 2026: 226 Runs (Avg 37.7, SR 145.8) [1x50] \u2022 2026: 14 Wkts (Econ 8.41, BBI 18/2)"
      },
      {
        player_id: 'rcb_9',
        name: "Yash Dayal",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.00,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "Left-Arm Swing & Death Slower Balls"
      },
      {
        player_id: 'rcb_10',
        name: "Rasikh Salam Dar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 6.00,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "Skiddy Seamer with Sharp Change of Pace"
      },
      {
        player_id: 'rcb_11',
        name: "Tim David",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.00,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Death Overs Finisher \u2022 180+ Career Strike Rate \u2022 2026: 305 Runs (Avg 33.9, SR 188.3) [1x50]"
      },
      {
        player_id: 'rcb_12',
        name: "Suyash Sharma",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.60,
        Power_Index: 77.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Fast-Arm Leg-Spin & Deadly Googly Specialist \u2022 2026: 9 Wkts (Econ 9.20, BBI 47/2)"
      },
      {
        player_id: 'rcb_13',
        name: "Jacob Bethell",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.60,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Young English Prodigy \u2022 Clean Left-Hand Striker \u2022 2026: 96 Runs (Avg 13.7, SR 124.7)"
      },
      {
        player_id: 'rcb_14',
        name: "Devdutt Padikkal",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Elegant Top-Order Anchor (Homecoming) \u2022 2026: 464 Runs (Avg 33.1, SR 168.7) [3x50]"
      },
      {
        player_id: 'rcb_15',
        name: "Nuwan Thushara",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.60,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Sling Pacer with Unpickable Toe-Crushers"
      },
      {
        player_id: 'rcb_16',
        name: "Romario Shepherd",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.50,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Windies Powerhitter & Heavy Seam \u2022 2026: 83 Runs (Avg 20.8, SR 125.8) \u2022 2026: 7 Wkts (Econ 11.92, BBI 54/3)"
      },
      {
        player_id: 'rcb_17',
        name: "Lungi Ngidi",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "145 km/h South African Hit-the-Deck Pacer"
      },
      {
        player_id: 'rcb_18',
        name: "Swapnil Singh",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.50,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Accurate Powerplay Left-Arm Spin"
      },
      {
        player_id: 'rcb_19',
        name: "Venkatesh Iyer",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 7.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "All-Round Match Winner \u2022 Auction Addition \u2022 2026: 209 Runs (Avg 52.2, SR 186.6) [1x50]"
      },
      {
        player_id: 'rcb_20',
        name: "Mangesh Yadav",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.20,
        Power_Index: 76.0,
        is_retained: true,
        statsSummary: "Emerging Indian Speedster"
      },
      {
        player_id: 'rcb_21',
        name: "Jacob Duffy",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "Kiwi Swing Bowler \u2022 New Ball Threat \u2022 2026: 9 Wkts (Econ 10.95, BBI 22/3)"
      },
      {
        player_id: 'rcb_22',
        name: "Jordan Cox",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 77.0,
        is_retained: true,
        statsSummary: "English WK Batter \u2022 Innovative 360 Striker"
      },
      {
        player_id: 'rcb_23',
        name: "Vicky Ostwal",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 73.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "U19 World Cup Left-Arm Orthodox Spinner"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Pacer", "Emerging Finisher", "Domestic WK"],
    strengths: ["Elite top-order: Kohli, Salt, Patidar", "Hazlewood + Bhuvi swing attack", "Dual dynamic keepers"],
    weaknesses: ["Spin depth relies on Krunal & Suyash"]
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
      {
        player_id: 'csk_1',
        name: "Ruturaj Gaikwad",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Captain \u2022 Consistent Top-Order Anchor \u2022 2026: 337 Runs (Avg 28.1, SR 123.4) [2x50]"
      },
      {
        player_id: 'csk_2',
        name: "Ravindra Jadeja",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "Elite All-Rounder \u2022 Chepauk Spin Master \u2022 2026: 266 Runs (Avg 66.5, SR 135.0) \u2022 2026: 10 Wkts (Econ 8.39, BBI 8/2)"
      },
      {
        player_id: 'csk_3',
        name: "Matheesha Pathirana",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 13.00,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Sling Death Bowling Phenom \u2022 150 km/h"
      },
      {
        player_id: 'csk_4',
        name: "Shivam Dube",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 12.00,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Monster Spin-Hitter in Middle Overs \u2022 2026: 270 Runs (Avg 38.6, SR 158.8) \u2022 2026: 1 Wkts (Econ 12.80, BBI 30/1)"
      },
      {
        player_id: 'csk_5',
        name: "Noor Ahmad",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 10.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Left-Arm Afghan Mystery Spinner \u2022 2026: 13 Wkts (Econ 8.39, BBI 21/3)"
      },
      {
        player_id: 'csk_6',
        name: "Ravichandran Ashwin",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.75,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Chepauk Legend \u2022 World Class Off-Spin"
      },
      {
        player_id: 'csk_7',
        name: "Devon Conway",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 6.25,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Kiwi Anchor with High Chepauk Average"
      },
      {
        player_id: 'csk_8',
        name: "Khaleel Ahmed",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.80,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Left-Arm Powerplay & Death Seamer \u2022 2026: 2 Wkts (Econ 8.67, BBI 24/1)"
      },
      {
        player_id: 'csk_9',
        name: "Rachin Ravindra",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.00,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Kiwi All-Rounder \u2022 Clean Striker"
      },
      {
        player_id: 'csk_10',
        name: "MS Dhoni",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "5x Champion Captain \u2022 Lightning Quick Gloves"
      },
      {
        player_id: 'csk_11',
        name: "Rahul Tripathi",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.40,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Aggressive #3 Intent Batter"
      },
      {
        player_id: 'csk_12',
        name: "Anshul Kamboj",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.40,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Emerging Indian Pace Prodigy \u2022 2026: 58 Runs (Avg 29.0, SR 152.6) \u2022 2026: 21 Wkts (Econ 10.52, BBI 22/3)"
      },
      {
        player_id: 'csk_13',
        name: "Sam Curran",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.40,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Left-Arm Seam All-Rounder (Homecoming)"
      },
      {
        player_id: 'csk_14',
        name: "Nathan Ellis",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Aussie Yorker & Cutter Specialist"
      },
      {
        player_id: 'csk_15',
        name: "Deepak Hooda",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.70,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Off-Spin All-Rounder"
      },
      {
        player_id: 'csk_16',
        name: "Jamie Overton",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.50,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "145 km/h English Pace All-Rounder \u2022 2026: 136 Runs (Avg 34.0, SR 158.1) \u2022 2026: 14 Wkts (Econ 8.89, BBI 18/4)"
      },
      {
        player_id: 'csk_17',
        name: "Vijay Shankar",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.20,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Medium Pace All-Rounder"
      },
      {
        player_id: 'csk_18',
        name: "Mukesh Choudhary",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Left-Arm Powerplay Swing Seamer \u2022 2026: 8 Wkts (Econ 8.89, BBI 21/2)"
      },
      {
        player_id: 'csk_19',
        name: "Kartik Sharma",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.20,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Sensational Indian Keeper-Batter \u2022 \u20b914.2 Cr Signee \u2022 2026: 295 Runs (Avg 32.8, SR 136.6) [2x50]"
      },
      {
        player_id: 'csk_20',
        name: "Prashant Veer",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.20,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Elite Emerging All-Rounder \u2022 \u20b914.2 Cr Signee \u2022 2026: 90 Runs (Avg 45.0, SR 134.3)"
      },
      {
        player_id: 'csk_21',
        name: "Rahul Chahar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.20,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Attacking Leg-Spinner \u2022 High Revs"
      },
      {
        player_id: 'csk_22',
        name: "Matt Henry",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Kiwi Speedster \u2022 Relentless Test Seam \u2022 2026: 2 Wkts (Econ 13.00, BBI 54/2)"
      },
      {
        player_id: 'csk_23',
        name: "Akeal Hosein",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Caribbean Powerplay Left-Arm Spin \u2022 2026: 8 Wkts (Econ 8.02, BBI 17/4)"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian WK", "Express Pacer Backup"],
    strengths: ["Spin trio: Ashwin, Jadeja, Noor Ahmad", "MS Dhoni clutch tactical finish", "Ruturaj consistency"],
    weaknesses: ["Pace bowling death options"]
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
      {
        player_id: 'mi_1',
        name: "Jasprit Bumrah",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 99.0,
        is_retained: true,
        statsSummary: "World #1 Pacer \u2022 Unplayable Yorker Machine \u2022 2026: 4 Wkts (Econ 8.36, BBI 15/1)"
      },
      {
        player_id: 'mi_2',
        name: "Suryakumar Yadav",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.35,
        Power_Index: 96.0,
        is_retained: true,
        statsSummary: "World T20 #1 \u2022 360-Degree Boundary King"
      },
      {
        player_id: 'mi_3',
        name: "Hardik Pandya",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.35,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "Captain \u2022 Match-Winning Pace All-Rounder \u2022 2026: 206 Runs (Avg 22.9, SR 138.2) \u2022 2026: 4 Wkts (Econ 11.42, BBI 18/1)"
      },
      {
        player_id: 'mi_4',
        name: "Rohit Sharma",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.30,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "5x Trophy Captain \u2022 Destructive Opener \u2022 2026: 283 Runs (Avg 35.4, SR 157.2) [2x50]"
      },
      {
        player_id: 'mi_5',
        name: "Trent Boult",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.50,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "Lethal Inswinging Powerplay Spearhead \u2022 2026: 2 Wkts (Econ 11.62, BBI 41/1)"
      },
      {
        player_id: 'mi_6',
        name: "Deepak Chahar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.25,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "High-Class Powerplay Swing Specialist \u2022 2026: 25 Runs (Avg 12.5, SR 131.6) \u2022 2026: 8 Wkts (Econ 10.39, BBI 33/2)"
      },
      {
        player_id: 'mi_7',
        name: "Tilak Varma",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.00,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Young Left-Hand Dynamo \u2022 Proven Finisher \u2022 2026: 359 Runs (Avg 29.9, SR 145.9) [1x100, 2x50]"
      },
      {
        player_id: 'mi_8',
        name: "Will Jacks",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 5.25,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Explosive Opener / #3 \u2022 41-Ball IPL Century \u2022 2026: 139 Runs (Avg 27.8, SR 182.9) \u2022 2026: 2 Wkts (Econ 10.84, BBI 12/1)"
      },
      {
        player_id: 'mi_9',
        name: "Naman Dhir",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.25,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "Hard-Hitting Young Indian Finisher \u2022 2026: 318 Runs (Avg 26.5, SR 147.2) [2x50]"
      },
      {
        player_id: 'mi_10',
        name: "Allah Ghazanfar",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.80,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Teenage Afghan Mystery Off-Spin Sensation"
      },
      {
        player_id: 'mi_11',
        name: "Mitchell Santner",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "World Cup Winner \u2022 Ultra-Economical Left-Arm Spin \u2022 2026: 26 Runs (Avg 0.0, SR 136.8) \u2022 2026: 5 Wkts (Econ 8.92, BBI 16/2)"
      },
      {
        player_id: 'mi_12',
        name: "Ryan Rickelton",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.00,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "South African Explosive WK-Opener \u2022 2026: 448 Runs (Avg 40.7, SR 186.7) [1x100, 2x50]"
      },
      {
        player_id: 'mi_13',
        name: "Reece Topley",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "6ft 7in Left-Arm English Fast Bowler"
      },
      {
        player_id: 'mi_14',
        name: "Robin Minz",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.65,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Left-Hand Tribal Indian Powerhitter / WK"
      },
      {
        player_id: 'mi_15',
        name: "Karn Sharma",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.50,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Veteran Leg-Spinner \u2022 Clutch Wickets"
      },
      {
        player_id: 'mi_16',
        name: "Raj Angad Bawa",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 73.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "U19 World Cup Final Hero All-Rounder \u2022 2026: 2 Wkts (Econ 12.50, BBI 11/1)"
      },
      {
        player_id: 'mi_17',
        name: "Lizaad Williams",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "145 km/h South African Pacer"
      },
      {
        player_id: 'mi_18',
        name: "Quinton De Kock",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "World Class WK-Opener (Homecoming) \u2022 2026: 132 Runs (Avg 66.0, SR 163.0) [1x100]"
      },
      {
        player_id: 'mi_19',
        name: "Mayank Rawat",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 73.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Dynamic Domestic Striker"
      },
      {
        player_id: 'mi_20',
        name: "Atharva Ankolekar",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Left-Arm Orthodox Spinner & Bat"
      },
      {
        player_id: 'mi_21',
        name: "Mohammad Izhar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 72.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Young Indian Seam Talent"
      },
      {
        player_id: 'mi_22',
        name: "Danish Malewar",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 73.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Promising Domestic Middle Order"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Middle Order", "Specialist Leg Spinner"],
    strengths: ["Unmatched Indian core (Rohit, Surya, Hardik, Bumrah, Tilak)", "Bumrah + Boult opening/death pace"],
    weaknesses: ["Spin depth on spinning pitches"]
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
      {
        player_id: 'kkr_1',
        name: "Cameron Green",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 25.20,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "Record Auction Signee \u2022 Explosive Top-Order & Pace \u2022 2026: 322 Runs (Avg 32.2, SR 145.7) [2x50] \u2022 2026: 7 Wkts (Econ 10.63, BBI 23/2)"
      },
      {
        player_id: 'kkr_2',
        name: "Matheesha Pathirana",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 18.00,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "150 km/h Sling Death Bowler \u2022 Mega Signee"
      },
      {
        player_id: 'kkr_3',
        name: "Rinku Singh",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 13.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Ice-Cool Finisher \u2022 India T20 Specialist \u2022 2026: 295 Runs (Avg 59.0, SR 149.0) [2x50]"
      },
      {
        player_id: 'kkr_4',
        name: "Varun Chakaravarthy",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 12.00,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Mystery Spin Spearhead \u2022 Top Wicket-Taker \u2022 2026: 11 Wkts (Econ 8.78, BBI 14/3)"
      },
      {
        player_id: 'kkr_5',
        name: "Sunil Narine",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.00,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "2024 MVP \u2022 Explosive Opener & Economical Spin \u2022 2026: 40 Runs (Avg 13.3, SR 125.0) \u2022 2026: 15 Wkts (Econ 6.64, BBI 28/2)"
      },
      {
        player_id: 'kkr_6',
        name: "Andre Russell",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.00,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "Ultimate Powerhit Enforcer & Death Slower Balls"
      },
      {
        player_id: 'kkr_7',
        name: "Mustafizur Rahman",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 9.20,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "The Fizz \u2022 Master of Cutters & Slower Yorkers"
      },
      {
        player_id: 'kkr_8',
        name: "Anrich Nortje",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 6.50,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "155 km/h Express South African Thunderbolt"
      },
      {
        player_id: 'kkr_9',
        name: "Harshit Rana",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Fast Bouncer & Sharp Change of Pace"
      },
      {
        player_id: 'kkr_10',
        name: "Ramandeep Singh",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Dynamic Lower-Order Striker & Gun Fielder \u2022 2026: 82 Runs (Avg 16.4, SR 120.6) \u2022 2026: 1 Wkts (Econ 11.62, BBI 5/1)"
      },
      {
        player_id: 'kkr_11',
        name: "Tejasvi Singh",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.00,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Talented Indian Stroke-Maker"
      },
      {
        player_id: 'kkr_12',
        name: "Angkrish Raghuvanshi",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Fearless Young #3 Batsman \u2022 2026: 422 Runs (Avg 42.2, SR 146.5) [5x50]"
      },
      {
        player_id: 'kkr_13',
        name: "Spencer Johnson",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.80,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Tall Aussie Left-Arm Express Seamer \u2022 2026: 2 Wkts (Econ 10.18, BBI 39/1)"
      },
      {
        player_id: 'kkr_14',
        name: "Finn Allen",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Kiwi Powerplay Demolisher \u2022 200+ SR \u2022 2026: 349 Runs (Avg 34.9, SR 214.1) [1x100, 1x50]"
      },
      {
        player_id: 'kkr_15',
        name: "Rahmanullah Gurbaz",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Aggressive Afghan Opener / Keeper"
      },
      {
        player_id: 'kkr_16',
        name: "Moeen Ali",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "World Cup Winner \u2022 Off-Spin & Attacking Bat"
      },
      {
        player_id: 'kkr_17',
        name: "Vaibhav Arora",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.80,
        Power_Index: 79.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Inswinging New Ball Specialist \u2022 2026: 11 Wkts (Econ 10.26, BBI 24/2)"
      },
      {
        player_id: 'kkr_18',
        name: "Tim Seifert",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.50,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Kiwi 360 WK Batter"
      },
      {
        player_id: 'kkr_19',
        name: "Ajinkya Rahane",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.50,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Experienced Top-Order Anchor \u2022 2026: 335 Runs (Avg 25.8, SR 135.1) [2x50]"
      },
      {
        player_id: 'kkr_20',
        name: "Rovman Powell",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.50,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Windies T20 Captain \u2022 Monster Sixes \u2022 2026: 190 Runs (Avg 38.0, SR 134.8)"
      },
      {
        player_id: 'kkr_21',
        name: "Akash Deep",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.00,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "India Test Fast Bowler"
      },
      {
        player_id: 'kkr_22',
        name: "Umran Malik",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 79.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "157 km/h Speed Demon"
      },
      {
        player_id: 'kkr_23',
        name: "Kartik Tyagi",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Fast Indian Seamer \u2022 Yorker Ability \u2022 2026: 18 Wkts (Econ 9.76, BBI 22/3)"
      },
    ],
    key2026AuctionNeeds: ["Designated Captain", "Indian Spin Depth"],
    strengths: ["All-Rounders: Russell, Narine, Green, Ramandeep", "Mystery spin at Eden Gardens"],
    weaknesses: ["Death bowling consistency"]
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
      {
        player_id: 'srh_1',
        name: "Heinrich Klaasen",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 23.00,
        Power_Index: 97.0,
        is_retained: true,
        statsSummary: "World #1 Spin Finisher \u2022 200+ SR in Middle Overs \u2022 2026: 624 Runs (Avg 48.0, SR 160.0) [6x50]"
      },
      {
        player_id: 'srh_2',
        name: "Pat Cummins",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 18.00,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "Captain & Leader \u2022 Clutch Champion \u2022 2026: 30 Runs (Avg 10.0, SR 157.9) \u2022 2026: 8 Wkts (Econ 9.59, BBI 26/3)"
      },
      {
        player_id: 'srh_3',
        name: "Travis Head",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 14.00,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Powerplay Monster \u2022 200+ Career IPL SR \u2022 2026: 410 Runs (Avg 27.3, SR 170.1) [2x50] \u2022 2026: 1 Wkts (Econ 7.00, BBI 7/1)"
      },
      {
        player_id: 'srh_4',
        name: "Abhishek Sharma",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.00,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Sensational Opener \u2022 Record Six-Hitter \u2022 2026: 563 Runs (Avg 40.2, SR 204.7) [1x100, 4x50]"
      },
      {
        player_id: 'srh_5',
        name: "Liam Livingstone",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 13.00,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Huge Six-Machine \u2022 \u20b913 Cr Mega Buy"
      },
      {
        player_id: 'srh_6',
        name: "Ishan Kishan",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.25,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Dynamic Indian Keeper-Opener \u2022 2026: 602 Runs (Avg 40.1, SR 182.4) [6x50]"
      },
      {
        player_id: 'srh_7',
        name: "Mohammed Shami",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 10.00,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "World Cup Leading Wicket-Taker \u2022 Seam Master"
      },
      {
        player_id: 'srh_8',
        name: "Harshal Patel",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.00,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Purple Cap Winner \u2022 Dipping Slower Ball Genius"
      },
      {
        player_id: 'srh_9',
        name: "Nitish Kumar Reddy",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 6.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "India Emerging Pace All-Rounder \u2022 2026: 302 Runs (Avg 30.2, SR 171.6) [1x50] \u2022 2026: 8 Wkts (Econ 10.41, BBI 17/2)"
      },
      {
        player_id: 'srh_10',
        name: "Jack Edwards",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.00,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "Aussie Pace All-Rounder"
      },
      {
        player_id: 'srh_11',
        name: "Abhinav Manohar",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.20,
        Power_Index: 79.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Clean Indian Finisher"
      },
      {
        player_id: 'srh_12',
        name: "Rahul Chahar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.20,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Attacking Leg-Spinner"
      },
      {
        player_id: 'srh_13',
        name: "Adam Zampa",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.40,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "World Cup Winner \u2022 Elite T20 Leg-Spinner"
      },
      {
        player_id: 'srh_14',
        name: "Salil Arora",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.50,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Promising Domestic WK-Batter \u2022 2026: 156 Runs (Avg 22.3, SR 159.2)"
      },
      {
        player_id: 'srh_15',
        name: "Simarjeet Singh",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.50,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "145 km/h Hit-the-Deck Pacer"
      },
      {
        player_id: 'srh_16',
        name: "Brydon Carse",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.00,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "Express English Pacer & Lower-Order Hitter"
      },
      {
        player_id: 'srh_17',
        name: "Jaydev Unadkat",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.00,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Left-Arm Cutter Specialist \u2022 2026: 4 Wkts (Econ 10.90, BBI 21/3)"
      },
      {
        player_id: 'srh_18',
        name: "Shivam Mavi",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 77.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Fast Indian Seamer with Swing"
      },
      {
        player_id: 'srh_19',
        name: "Kamindu Mendis",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Ambidextrous Spinner & Bat"
      },
      {
        player_id: 'srh_20',
        name: "Atharva Taide",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Attacking Top-Order Lefty"
      },
      {
        player_id: 'srh_21',
        name: "Sakib Hussain",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 72.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Young Indian Pacer \u2022 2026: 15 Wkts (Econ 9.45, BBI 24/4)"
      },
      {
        player_id: 'srh_22',
        name: "Eshan Malinga",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.20,
        Power_Index: 76.0,
        is_retained: true,
        statsSummary: "Sling Pacer from Sri Lanka \u2022 2026: 20 Wkts (Econ 9.33, BBI 32/4)"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Middle Order", "Death Over Discipline"],
    strengths: ["Historic top order: Head, Abhishek, Ishan, Klaasen", "Pat Cummins world-class leadership"],
    weaknesses: ["Hyper-aggressive approach on turning surfaces"]
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
      {
        player_id: 'rr_1',
        name: "Sanju Samson",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "Captain & Wicketkeeper \u2022 T20 Ton Machine \u2022 2026: 477 Runs (Avg 43.4, SR 165.6) [2x100, 1x50]"
      },
      {
        player_id: 'rr_2',
        name: "Yashasvi Jaiswal",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "World Class Super-Opener \u2022 2026: 427 Runs (Avg 30.5, SR 152.5) [3x50]"
      },
      {
        player_id: 'rr_3',
        name: "Riyan Parag",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.00,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "#4 Middle Order Enforcer \u2022 2026: 309 Runs (Avg 23.8, SR 157.7) [2x50] \u2022 2026: 2 Wkts (Econ 9.50, BBI 5/1)"
      },
      {
        player_id: 'rr_4',
        name: "Dhruv Jurel",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.00,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Ice-Cool Finisher & Wicketkeeper \u2022 2026: 515 Runs (Avg 36.8, SR 154.7) [6x50]"
      },
      {
        player_id: 'rr_5',
        name: "Jofra Archer",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.50,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "150 km/h Express Strike Bowler \u2022 2026: 64 Runs (Avg 10.7, SR 136.2) \u2022 2026: 25 Wkts (Econ 9.31, BBI 17/3)"
      },
      {
        player_id: 'rr_6',
        name: "Shimron Hetmyer",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.00,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Death Overs Power Finisher \u2022 2026: 78 Runs (Avg 13.0, SR 113.0)"
      },
      {
        player_id: 'rr_7',
        name: "Ravi Bishnoi",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 7.20,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Googly Master \u2022 \u20b97.2 Cr Mega Auction Buy \u2022 2026: 11 Wkts (Econ 9.88, BBI 41/4)"
      },
      {
        player_id: 'rr_8',
        name: "Tushar Deshpande",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 6.50,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Wicket-Taking Indian Seamer \u2022 2026: 26 Runs (Avg 13.0, SR 185.7) \u2022 2026: 4 Wkts (Econ 11.95, BBI 24/1)"
      },
      {
        player_id: 'rr_9',
        name: "Wanindu Hasaranga",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 5.25,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "World #1 Sri Lankan Leg-Spinner & Finisher"
      },
      {
        player_id: 'rr_10',
        name: "Maheesh Theekshana",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.40,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Mystery Carrom Ball Specialist"
      },
      {
        player_id: 'rr_11',
        name: "Nitish Rana",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.20,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Aggressive Middle Order Left-Hander \u2022 2026: 225 Runs (Avg 25.0, SR 151.0) [2x50]"
      },
      {
        player_id: 'rr_12',
        name: "Sandeep Sharma",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Knuckle Ball & Yorker Genius \u2022 2026: 5 Wkts (Econ 11.38, BBI 28/2)"
      },
      {
        player_id: 'rr_13',
        name: "Adam Milne",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.40,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "150 km/h Kiwi Thunderbolt"
      },
      {
        player_id: 'rr_14',
        name: "Fazalhaq Farooqi",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Afghan Left-Arm Inswing Seamer"
      },
      {
        player_id: 'rr_15',
        name: "Kwena Maphaka",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.50,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "148 km/h Young South African Pacer"
      },
      {
        player_id: 'rr_16',
        name: "Akash Madhwal",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.20,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Accurate Yorker Specialist"
      },
      {
        player_id: 'rr_17',
        name: "Vaibhav Sooryavanshi",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.10,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Youngest IPL Prodigy \u2022 237.3 SR Sensation \u2022 2026: 776 Runs (Avg 48.5, SR 237.3) [1x100, 5x50]"
      },
      {
        player_id: 'rr_18',
        name: "Ravi Singh",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.95,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Clean Striking Domestic Batter"
      },
      {
        player_id: 'rr_19',
        name: "Sushant Mishra",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.90,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Left-Arm Indian Fast Bowler \u2022 2026: 2 Wkts (Econ 10.57, BBI 21/2)"
      },
      {
        player_id: 'rr_20',
        name: "Shubham Dubey",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.80,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Hard-Hitting Finisher \u2022 2026: 81 Runs (Avg 20.2, SR 139.7)"
      },
      {
        player_id: 'rr_21',
        name: "Kuldeep Sen",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 77.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "145 km/h Express Indian Seamer"
      },
      {
        player_id: 'rr_22',
        name: "Kumar Kushagra",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.65,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Young Backup Wicketkeeper"
      },
    ],
    key2026AuctionNeeds: ["Pace All-Rounder Backup", "Domestic Spin Backup"],
    strengths: ["Archer pace + Bishnoi/Theekshana spin", "Samson, Jaiswal top order"],
    weaknesses: ["Lower-order depth"]
  },
  dc: {
    id: 'dc',
    name: 'Delhi Capitals',
    short: 'DC',
    color: '#0284c7',
    emoji: '🦅',
    titles: 'Roar Macha • Rebuilt 2026',
    totalPurse: 125.0,
    retainedSpend2026: 111.0,
    miniAuctionPurse2026: 14.0,
    stadiumName: 'Arun Jaitley Stadium',
    stadiumCity: 'New Delhi',
    squad2026: [
      {
        player_id: 'dc_1',
        name: "Axar Patel",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.50,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Vice Captain \u2022 World Class All-Rounder \u2022 2026: 173 Runs (Avg 19.2, SR 131.1) [1x50] \u2022 2026: 11 Wkts (Econ 8.18, BBI 18/2)"
      },
      {
        player_id: 'dc_2',
        name: "KL Rahul",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.00,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "Captain / Opener \u2022 4500+ IPL Runs \u2022 Elite Leader \u2022 2026: 593 Runs (Avg 45.6, SR 174.4) [1x100, 5x50]"
      },
      {
        player_id: 'dc_3',
        name: "Kuldeep Yadav",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 13.25,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "World Class Left-Arm Wrist Spinner \u2022 2026: 10 Wkts (Econ 10.29, BBI 29/3)"
      },
      {
        player_id: 'dc_4',
        name: "Mitchell Starc",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.75,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "IPL Final PoTM \u2022 Left-Arm Fire \u2022 2026: 11 Wkts (Econ 10.18, BBI 40/4)"
      },
      {
        player_id: 'dc_5',
        name: "T Natarajan",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 10.75,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Yorker King \u2022 Elite Death Specialist \u2022 2026: 5 Wkts (Econ 11.18, BBI 20/3)"
      },
      {
        player_id: 'dc_6',
        name: "Tristan Stubbs",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 10.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "360-Degree Finisher \u2022 Huge Impact \u2022 2026: 275 Runs (Avg 34.4, SR 127.3) [2x50]"
      },
      {
        player_id: 'dc_7',
        name: "Jake Fraser-McGurk",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 9.00,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "Powerplay Demolisher \u2022 234 Career SR"
      },
      {
        player_id: 'dc_8',
        name: "Auqib Dar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.40,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "Sensational J&K Pacer \u2022 \u20b98.4 Cr Buy"
      },
      {
        player_id: 'dc_9',
        name: "Mukesh Kumar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Accurate Seam Bowler \u2022 India Regular \u2022 2026: 6 Wkts (Econ 11.26, BBI 26/2)"
      },
      {
        player_id: 'dc_10',
        name: "Harry Brook",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 6.25,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "English Explosive Middle Order Batter"
      },
      {
        player_id: 'dc_11',
        name: "Abishek Porel",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Dynamic Opener / Keeper \u2022 2026: 108 Runs (Avg 27.0, SR 122.7) [1x50]"
      },
      {
        player_id: 'dc_12',
        name: "Pathum Nissanka",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.00,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Sri Lankan Top-Order Stroke Maker \u2022 2026: 278 Runs (Avg 27.8, SR 158.8) [2x50]"
      },
      {
        player_id: 'dc_13',
        name: "Ashutosh Sharma",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.80,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "High-Impact Indian Death Over Finisher \u2022 2026: 171 Runs (Avg 34.2, SR 181.9)"
      },
      {
        player_id: 'dc_14',
        name: "Mohit Sharma",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.20,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Knuckle Ball & Back of Hand Specialist"
      },
      {
        player_id: 'dc_15',
        name: "Kyle Jamieson",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "6ft 8in Tall Kiwi Fast Bowler \u2022 2026: 2 Wkts (Econ 12.85, BBI 42/1)"
      },
      {
        player_id: 'dc_16',
        name: "Ben Duckett",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "English Bazball Lefty \u2022 Sweep Master"
      },
      {
        player_id: 'dc_17',
        name: "David Miller",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Killer Miller \u2022 Clutch Finisher \u2022 2026: 211 Runs (Avg 35.2, SR 154.0) [1x50]"
      },
      {
        player_id: 'dc_18',
        name: "Faf du Plessis",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Veteran Leader & Explosive Opener"
      },
      {
        player_id: 'dc_19',
        name: "Sameer Rizvi",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.95,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Spin-Hitting Prodigy \u2022 2026: 252 Runs (Avg 36.0, SR 147.4) [2x50]"
      },
      {
        player_id: 'dc_20',
        name: "Prithvi Shaw",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Explosive Indian Powerplay Opener"
      },
      {
        player_id: 'dc_21',
        name: "Dushmantha Chameera",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "Sri Lankan Express Pacer"
      },
      {
        player_id: 'dc_22',
        name: "Karun Nair",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.50,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Classical Indian Stroke Player"
      },
      {
        player_id: 'dc_23',
        name: "Sahil Parakh",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 73.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Young Indian U19 Top-Order Batter \u2022 2026: 46 Runs (Avg 11.5, SR 139.4)"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Spinners", "Domestic Finisher"],
    strengths: ["Starc + Natarajan + Mukesh pace bowling", "KL Rahul + Fraser-McGurk explosive opening"],
    weaknesses: ["Small boundary defense at Kotla"]
  },
  pbks: {
    id: 'pbks',
    name: 'Punjab Kings',
    short: 'PBKS',
    color: '#b91c1c',
    emoji: '🗡️',
    titles: 'Sadda Punjab • Ricky Ponting Era',
    totalPurse: 125.0,
    retainedSpend2026: 114.0,
    miniAuctionPurse2026: 11.0,
    stadiumName: 'Maharaja Yadavindra Singh Stadium',
    stadiumCity: 'Mullanpur / Mohali',
    squad2026: [
      {
        player_id: 'pbks_1',
        name: "Shreyas Iyer",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 26.75,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Captain \u2022 2024 Champion Leader \u2022 \u20b926.75 Cr \u2022 2026: 498 Runs (Avg 55.3, SR 168.8) [1x100, 5x50]"
      },
      {
        player_id: 'pbks_2',
        name: "Arshdeep Singh",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "T20 World Cup Leading Wicket-Taker \u2022 Death King \u2022 2026: 14 Wkts (Econ 10.20, BBI 22/3)"
      },
      {
        player_id: 'pbks_3',
        name: "Yuzvendra Chahal",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.00,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "All-Time IPL Wicket Leader (205 Wkts) \u2022 2026: 12 Wkts (Econ 9.39, BBI 36/3)"
      },
      {
        player_id: 'pbks_4',
        name: "Marcus Stoinis",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "The Hulk \u2022 Match-Winning Middle Order All-Rounder \u2022 2026: 216 Runs (Avg 36.0, SR 180.0) [1x50] \u2022 2026: 2 Wkts (Econ 12.91, BBI 26/1)"
      },
      {
        player_id: 'pbks_5',
        name: "Marco Jansen",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 7.00,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Tall South African Left-Arm Pacer & Powerhitter \u2022 2026: 51 Runs (Avg 12.8, SR 113.3) \u2022 2026: 9 Wkts (Econ 10.20, BBI 33/2)"
      },
      {
        player_id: 'pbks_6',
        name: "Shashank Singh",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.50,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Sensational Finisher \u2022 185+ SR \u2022 2026: 132 Runs (Avg 22.0, SR 188.6) [1x50] \u2022 2026: 4 Wkts (Econ 8.80, BBI 20/2)"
      },
      {
        player_id: 'pbks_7',
        name: "Ben Dwarshuis",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.40,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Aussie Left-Arm Seamer \u2022 BBL Star \u2022 2026: 1 Wkts (Econ 12.75, BBI 51/1)"
      },
      {
        player_id: 'pbks_8',
        name: "Glenn Maxwell",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.20,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "The Big Show (Homecoming) \u2022 Match-Winner"
      },
      {
        player_id: 'pbks_9',
        name: "Nehal Wadhera",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.20,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Clean Striking Left-Hander \u2022 2026: 65 Runs (Avg 10.8, SR 114.0)"
      },
      {
        player_id: 'pbks_10',
        name: "Prabhsimran Singh",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Aggressive Powerplay Opener \u2022 2026: 510 Runs (Avg 42.5, SR 168.9) [6x50]"
      },
      {
        player_id: 'pbks_11',
        name: "Priyansh Arya",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.80,
        Power_Index: 79.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Delhi Sensation \u2022 6 Sixes in an Over \u2022 2026: 364 Runs (Avg 28.0, SR 211.6) [3x50]"
      },
      {
        player_id: 'pbks_12',
        name: "Cooper Connolly",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.00,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "Aussie Emerging All-Rounder \u2022 2026: 491 Runs (Avg 44.6, SR 163.1) [1x100, 2x50]"
      },
      {
        player_id: 'pbks_13',
        name: "Josh Inglis",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.60,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Aussie T20 Keeper-Batter \u2022 2026: 266 Runs (Avg 53.2, SR 186.0) [3x50]"
      },
      {
        player_id: 'pbks_14',
        name: "Azmatullah Omarzai",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.40,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Afghan Seam All-Rounder \u2022 2026: 52 Runs (Avg 26.0, SR 192.6) \u2022 2026: 3 Wkts (Econ 9.36, BBI 36/2)"
      },
      {
        player_id: 'pbks_15',
        name: "Lockie Ferguson",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "150 km/h Kiwi Thunderbolt \u2022 2026: 1 Wkts (Econ 12.81, BBI 41/1)"
      },
      {
        player_id: 'pbks_16',
        name: "Vijaykumar Vyshak",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.80,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Knuckle Ball & Bouncer Seamer"
      },
      {
        player_id: 'pbks_17',
        name: "Harpreet Brar",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.50,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Accurate Left-Arm Finger Spinner \u2022 2026: 2 Wkts (Econ 7.50, BBI 35/2)"
      },
      {
        player_id: 'pbks_18',
        name: "Aaron Hardie",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.25,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "Aussie Pace All-Rounder"
      },
      {
        player_id: 'pbks_19',
        name: "Kuldeep Sen",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.80,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "145 km/h Express Indian Seamer"
      },
      {
        player_id: 'pbks_20',
        name: "Pravin Dubey",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Tall Domestic Leg-Spinner"
      },
      {
        player_id: 'pbks_21',
        name: "Vishal Nishad",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 72.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Young Domestic Talent"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Opener", "Pace Depth"],
    strengths: ["Shreyas Iyer captaincy + Ricky Ponting master coaching", "Arshdeep + Chahal + Lockie bowling balance"],
    weaknesses: ["Purse headroom in auction"]
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
      {
        player_id: 'lsg_1',
        name: "Rishabh Pant",
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 27.00,
        Power_Index: 97.0,
        is_retained: true,
        statsSummary: "Captain \u2022 Record \u20b927 Cr Signee \u2022 Game Changer \u2022 2026: 312 Runs (Avg 28.4, SR 138.1) [1x50]"
      },
      {
        player_id: 'lsg_2',
        name: "Nicholas Pooran",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 21.00,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Vice Captain \u2022 Most Dangerous Six-Hitter \u2022 2026: 234 Runs (Avg 18.0, SR 127.9) [1x50]"
      },
      {
        player_id: 'lsg_3',
        name: "Ravi Bishnoi",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.00,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Googly Master \u2022 Tight Middle Overs \u2022 2026: 11 Wkts (Econ 9.88, BBI 41/4)"
      },
      {
        player_id: 'lsg_4',
        name: "Mayank Yadav",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "156.7 km/h Thunderbolt \u2022 Extreme Pace"
      },
      {
        player_id: 'lsg_5',
        name: "Avesh Khan",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.75,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Death Overs Specialist (Homecoming) \u2022 2026: 6 Wkts (Econ 11.06, BBI 23/2)"
      },
      {
        player_id: 'lsg_6',
        name: "Josh Inglis",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 8.60,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Aussie Keeper-Batter \u2022 \u20b98.6 Cr Buy \u2022 2026: 266 Runs (Avg 53.2, SR 186.0) [3x50]"
      },
      {
        player_id: 'lsg_7',
        name: "Akash Deep",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.00,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Indian Test Pacer \u2022 High Seam"
      },
      {
        player_id: 'lsg_8',
        name: "David Miller",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 7.50,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Killer Miller \u2022 Clutch Finisher \u2022 2026: 211 Runs (Avg 35.2, SR 154.0) [1x50]"
      },
      {
        player_id: 'lsg_9',
        name: "Mohsin Khan",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Tall Left-Arm Pacer \u2022 Sharp Bounce \u2022 2026: 11 Wkts (Econ 8.14, BBI 23/5)"
      },
      {
        player_id: 'lsg_10',
        name: "Abdul Samad",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.20,
        Power_Index: 79.0,
        is_retained: true,
        statsSummary: "Power Finisher from J&K \u2022 2026: 116 Runs (Avg 19.3, SR 131.8)"
      },
      {
        player_id: 'lsg_11',
        name: "Ayush Badoni",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Finisher & Spin Hitter \u2022 2026: 215 Runs (Avg 21.5, SR 152.5) [1x50]"
      },
      {
        player_id: 'lsg_12',
        name: "Mitchell Marsh",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.40,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Aussie T20 Captain \u2022 Heavy Ball & Powerhit \u2022 2026: 563 Runs (Avg 43.3, SR 163.2) [1x100, 3x50]"
      },
      {
        player_id: 'lsg_13',
        name: "Shahbaz Ahmed",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.40,
        Power_Index: 79.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Tactical Left-Arm Spinner & Batter"
      },
      {
        player_id: 'lsg_14',
        name: "Mukul Choudhary",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.60,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Promising Indian Batter \u2022 2026: 170 Runs (Avg 28.3, SR 141.7) [1x50]"
      },
      {
        player_id: 'lsg_15',
        name: "Akshat Raghuwanshi",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.20,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Aggressive Middle-Order Hitter \u2022 2026: 29 Runs (Avg 14.5, SR 116.0)"
      },
      {
        player_id: 'lsg_16',
        name: "Aiden Markram",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Proteas T20 Captain \u2022 Clean Class \u2022 2026: 231 Runs (Avg 25.7, SR 138.3)"
      },
      {
        player_id: 'lsg_17',
        name: "Wanindu Hasaranga",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Sri Lankan Spin Wizard"
      },
      {
        player_id: 'lsg_18',
        name: "Naman Tiwari",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.00,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "U19 World Cup Left-Arm Pacer"
      },
      {
        player_id: 'lsg_19',
        name: "Shamar Joseph",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "150 km/h Gabba Hero"
      },
      {
        player_id: 'lsg_20',
        name: "Matthew Breetzke",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "South African Top-Order Striker"
      },
      {
        player_id: 'lsg_21',
        name: "M Siddharth",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 76.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Accurate Arm-Ball Spinner \u2022 2026: 6 Wkts (Econ 9.66, BBI 35/2)"
      },
      {
        player_id: 'lsg_22',
        name: "Rajvardhan Hangargekar",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Pace All-Rounder"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Opener", "Spin Depth"],
    strengths: ["Pant + Pooran + Miller middle order demolition squad", "Express pace in Mayank Yadav + Mohsin"],
    weaknesses: ["Top-order opening stability"]
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
      {
        player_id: 'gt_1',
        name: "Rashid Khan",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 18.00,
        Power_Index: 96.0,
        is_retained: true,
        statsSummary: "World #1 T20 Spinner & Finisher \u2022 21 Wkts \u2022 2026: 50 Runs (Avg 12.5, SR 122.0) \u2022 2026: 21 Wkts (Econ 9.07, BBI 33/4)"
      },
      {
        player_id: 'gt_2',
        name: "Shubman Gill",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.50,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Captain \u2022 2026 Top Scorer: 732 Runs (Avg 45.8) \u2022 2026: 732 Runs (Avg 45.8, SR 163.0) [1x100, 6x50]"
      },
      {
        player_id: 'gt_3',
        name: "Jos Buttler",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 15.75,
        Power_Index: 95.0,
        is_retained: true,
        statsSummary: "Superstar Keeper-Opener \u2022 5x IPL Centuries \u2022 2026: 526 Runs (Avg 37.6, SR 152.5) [4x50]"
      },
      {
        player_id: 'gt_4',
        name: "Mohammed Siraj",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 12.25,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Miyan Magic \u2022 Powerplay Inswing Master \u2022 2026: 19 Wkts (Econ 9.06, BBI 26/3)"
      },
      {
        player_id: 'gt_5',
        name: "Kagiso Rabada",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 10.75,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Purple Cap Winner \u2022 148 km/h Strike Bowler \u2022 2026: 47 Runs (Avg 23.5, SR 123.7) \u2022 2026: 29 Wkts (Econ 9.68, BBI 25/3)"
      },
      {
        player_id: 'gt_6',
        name: "Prasidh Krishna",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.50,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Tall Hit-the-Deck Express Pacer \u2022 2026: 16 Wkts (Econ 10.43, BBI 28/4)"
      },
      {
        player_id: 'gt_7',
        name: "Sai Sudharsan",
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.50,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "2026 Hero: 722 Runs (Avg 48.1, 8x50) \u2022 2026: 722 Runs (Avg 45.1, SR 158.0) [1x100, 8x50]"
      },
      {
        player_id: 'gt_8',
        name: "Jason Holder",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 7.00,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Tall Caribbean All-Rounder \u2022 Heavy Bounce \u2022 2026: 65 Runs (Avg 13.0, SR 125.0) \u2022 2026: 17 Wkts (Econ 7.58, BBI 24/4)"
      },
      {
        player_id: 'gt_9',
        name: "Rahul Tewatia",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 80.0,
        is_retained: true,
        statsSummary: "Ice Finisher \u2022 Clutch Boundary Striker \u2022 2026: 190 Runs (Avg 27.1, SR 143.9) [1x50]"
      },
      {
        player_id: 'gt_10',
        name: "Shahrukh Khan",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.00,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Power Finisher from Tamil Nadu \u2022 2026: 43 Runs (Avg 10.8, SR 130.3)"
      },
      {
        player_id: 'gt_11',
        name: "Washington Sundar",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.20,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Powerplay Miserly Off-Spinner \u2022 2026: 377 Runs (Avg 37.7, SR 150.2) [3x50] \u2022 2026: 1 Wkts (Econ 9.18, BBI 27/1)"
      },
      {
        player_id: 'gt_12',
        name: "Sherfane Rutherford",
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.60,
        Power_Index: 82.0,
        is_retained: true,
        statsSummary: "Windies Six-Hitting Specialist \u2022 2026: 123 Runs (Avg 24.6, SR 164.0) [1x50]"
      },
      {
        player_id: 'gt_13',
        name: "Gerald Coetzee",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.40,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "150 km/h South African Express Pacer"
      },
      {
        player_id: 'gt_14',
        name: "Tom Banton",
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "English Innovative 360 WK-Batter"
      },
      {
        player_id: 'gt_15',
        name: "Glenn Phillips",
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.00,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "World Class Fielder & Dynamic Hitter \u2022 2026: 67 Runs (Avg 16.8, SR 124.1)"
      },
      {
        player_id: 'gt_16',
        name: "Sai Kishore",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.00,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Economical Left-Arm Finger Spinner \u2022 2026: 1 Wkts (Econ 11.50, BBI 38/1)"
      },
      {
        player_id: 'gt_17',
        name: "Mahipal Lomror",
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.70,
        Power_Index: 78.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Spin-Hitting Middle-Order Left-Hander"
      },
      {
        player_id: 'gt_18',
        name: "Gurnoor Brar",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.30,
        Power_Index: 75.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Tall 6ft 5in Punjab Pacer"
      },
      {
        player_id: 'gt_19',
        name: "Ashok Sharma",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.90,
        Power_Index: 74.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Young Indian Pacer \u2022 2026: 6 Wkts (Econ 10.85, BBI 32/2)"
      },
      {
        player_id: 'gt_20',
        name: "Ishant Sharma",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 77.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Veteran 100-Test Indian Pacer"
      },
      {
        player_id: 'gt_21',
        name: "Luke Wood",
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 78.0,
        is_retained: true,
        statsSummary: "English Left-Arm Swing Seamer"
      },
      {
        player_id: 'gt_22',
        name: "Prithviraj Yarra",
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.30,
        Power_Index: 73.0,
        is_retained: true,
        is_uncapped: true,
        statsSummary: "Domestic Left-Arm Seamer"
      },
    ],
    key2026AuctionNeeds: ["Backup Indian Middle Order", "Wicket-Keeper Backup"],
    strengths: ["Dream opening pair: Jos Buttler & Shubman Gill", "Rabada, Siraj, Prasidh, Rashid bowling arsenal"],
    weaknesses: ["Lower-order finish if Tewatia fails"]
  },
}

// ─── Helper function to get Franchise ───
export function getFranchise(teamId: string): FranchiseData {
  const normalized = (teamId || 'rcb').toLowerCase()
  return IPL_FRANCHISES[normalized] || IPL_FRANCHISES.rcb
}

// ─── Initial Top Marquee Players in Auction Pool ───
export const RELEASED_AUCTION_POOL: ReleasedPlayer[] = [
  { name: 'Rishabh Pant', formerTeam: 'Delhi Capitals', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 27.0, reason: 'Record Breaking Auction Winner. Bought by LSG for ₹27 Cr.', powerIndex: 97.0 },
  { name: 'Shreyas Iyer', formerTeam: 'Kolkata Knight Riders', role: 'BAT', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 26.75, reason: 'IPL 2024 Champion Captain. Bought by PBKS for ₹26.75 Cr.', powerIndex: 94.0 },
  { name: 'Cameron Green', formerTeam: 'Royal Challengers Bengaluru', role: 'AR', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 25.2, reason: 'Explosive Aussie All-Rounder. Bought by KKR for ₹25.2 Cr.', powerIndex: 93.0 },
  { name: 'Venkatesh Iyer', formerTeam: 'Kolkata Knight Riders', role: 'AR', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 23.75, reason: 'Finals MVP. Bought back by KKR for ₹23.75 Cr.', powerIndex: 88.0 },
  { name: 'Arshdeep Singh', formerTeam: 'Punjab Kings', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 18.0, reason: 'World Cup Winner. Retained via RTM by PBKS for ₹18 Cr.', powerIndex: 92.0 },
  { name: 'Yuzvendra Chahal', formerTeam: 'Rajasthan Royals', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 18.0, reason: 'All-time IPL leading wicket-taker. Bought by PBKS for ₹18 Cr.', powerIndex: 92.0 },
  { name: 'Jos Buttler', formerTeam: 'Rajasthan Royals', role: 'WK', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 15.75, reason: '5x Century Legend. Bought by Gujarat Titans for ₹15.75 Cr.', powerIndex: 95.0 },
  { name: 'KL Rahul', formerTeam: 'Lucknow Super Giants', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 14.0, reason: 'Signed by Delhi Capitals for ₹14 Cr.', powerIndex: 93.0 },
  { name: 'Mohammed Siraj', formerTeam: 'Royal Challengers Bengaluru', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 12.25, reason: 'Miyan Magic. Bought by GT for ₹12.25 Cr.', powerIndex: 89.0 },
  { name: 'Mitchell Starc', formerTeam: 'Kolkata Knight Riders', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 11.75, reason: '2024 Final PoTM. Signed by DC for ₹11.75 Cr.', powerIndex: 93.0 },
  { name: 'Phil Salt', formerTeam: 'Kolkata Knight Riders', role: 'WK', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 11.5, reason: 'Explosive Keeper-Opener. Signed by RCB for ₹11.5 Cr.', powerIndex: 91.0 },
  { name: 'Ishan Kishan', formerTeam: 'Mumbai Indians', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 11.25, reason: 'Signed by SRH for ₹11.25 Cr.', powerIndex: 89.0 },
  { name: 'Trent Boult', formerTeam: 'Rajasthan Royals', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 12.5, reason: 'Powerplay Inswing Master. Returned to MI for ₹12.5 Cr.', powerIndex: 92.0 },
  { name: 'Glenn Maxwell', formerTeam: 'Royal Challengers Bengaluru', role: 'AR', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 4.2, reason: 'Big Show returned to PBKS for ₹4.2 Cr.', powerIndex: 88.0 },
  { name: 'Mohammed Shami', formerTeam: 'Gujarat Titans', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 10.0, reason: 'Purple Cap Winner. Signed by SRH for ₹10 Cr.', powerIndex: 91.0 },
  { name: 'Jofra Archer', formerTeam: 'Mumbai Indians', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 12.5, reason: 'Returned to Rajasthan Royals for ₹12.5 Cr.', powerIndex: 93.0 },
  { name: 'David Miller', formerTeam: 'Gujarat Titans', role: 'BAT', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 7.5, reason: 'Killer Miller. Signed by LSG for ₹7.5 Cr.', powerIndex: 87.0 },
  { name: 'Prithvi Shaw', formerTeam: 'Delhi Capitals', role: 'BAT', is_overseas: false, basePrice: 0.75, predictedAuctionPrice: 2.5, reason: 'Aggressive Indian Powerplay Opener seeking resurgence.', powerIndex: 80.0 },
  { name: 'Ben Duckett', formerTeam: 'England', role: 'BAT', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 4.5, reason: 'Bazball English Opener & 360 Sweep Specialist.', powerIndex: 82.0 },
  { name: 'Pathum Nissanka', formerTeam: 'Sri Lanka', role: 'BAT', is_overseas: true, basePrice: 0.75, predictedAuctionPrice: 4.0, reason: 'Prolific T20 International Opener.', powerIndex: 83.0 }
]

// ─── Dynamic Multi-Franchise AI Release & Auction Pool Generator ───
export interface DynamicAuctionPlayer {
  id: string
  name: string
  role: 'BAT' | 'BOWL' | 'AR' | 'WK'
  nationality: 'Indian' | 'Overseas'
  is_overseas: boolean
  basePrice: number
  powerIndex: number
  formerTeam: string
  statsSummary: string
  releaseReason?: string
}

export function generateDynamicAuctionPool(
  userTeamId: string, 
  userReleasedPlayers: IPLPlayer[] = [],
  currentCampaignSquad: Array<{ name: string; player_id?: string; is_released?: boolean }> = [],
  rivalTeamsData?: Record<string, { remainingPurse: number; squad: Array<{ name: string; is_released?: boolean }> }>,
  tradedHistory?: Array<{ playerOut: string; playerIn: string; rivalTeam: string }>
): DynamicAuctionPlayer[] {
  const pool: DynamicAuctionPlayer[] = []
  const normUserTeam = (userTeamId || 'rcb').toLowerCase()

  // Set of all traded players (traded players MUST NEVER be released by BCCI rules)
  const tradedNames = new Set<string>()
  if (tradedHistory) {
    tradedHistory.forEach((t) => {
      if (t.playerOut) tradedNames.add(t.playerOut.trim().toLowerCase())
      if (t.playerIn) tradedNames.add(t.playerIn.trim().toLowerCase())
    })
  }

  // Set of players currently retained/active in user squad
  const userActiveNames = new Set<string>(
    currentCampaignSquad
      .filter((p) => !p.is_released)
      .map((p) => p.name.trim().toLowerCase())
  )

  // Protected franchise marquee icons that can NEVER be released by any AI team
  const UNTOUCHABLE_MARQUEE_NAMES = new Set([
    'virat kohli', 'jasprit bumrah', 'ms dhoni', 'rohit sharma', 'hardik pandya',
    'suryakumar yadav', 'ravindra jadeja', 'ruturaj gaikwad', 'shubman gill',
    'sunil narine', 'andre russell', 'rinku singh', 'varun chakaravarthy',
    'heinrich klaasen', 'pat cummins', 'travis head', 'abhishek sharma',
    'sanju samson', 'yashasvi jaiswal', 'riyan parag', 'dhruv jurel',
    'axar patel', 'kuldeep yadav', 'tristan stubbs',
    'nicholas pooran', 'mayank yadav', 'ravi bishnoi',
    'rashid khan', 'sai sudharsan', 'shashank singh', 'prabhsimran singh',
    'rajat patidar', 'matheesha pathirana', 'shivam dube', 'tilak varma',
    'harshit rana', 'ramandeep singh', 'nitish kumar reddy', 'ayush badoni'
  ])

  // 1. Add all user-released stars first
  userReleasedPlayers.forEach((p, idx) => {
    pool.push({
      id: `user_rel_${idx + 1}`,
      name: p.name,
      role: p.role,
      nationality: p.nationality,
      is_overseas: p.is_overseas,
      basePrice: Math.min(2.0, Math.max(0.3, p.price || 1.0)),
      powerIndex: p.Power_Index || 80.0,
      formerTeam: IPL_FRANCHISES[normUserTeam]?.name || 'My Franchise',
      statsSummary: p.statsSummary || 'Released by Manager into Auction Pool',
      releaseReason: 'Released by Franchise GM'
    })
  })

  // 2. Multi-Franchise AI Retention/Release Simulation for ALL 9 RIVALS
  Object.entries(IPL_FRANCHISES).forEach(([teamKey, franchise]) => {
    if (teamKey === normUserTeam) return // skip user franchise

    // Use current updated squad from rivalTeamsData if available, fallback to squad2026
    const currentRivalSquad = rivalTeamsData?.[teamKey]?.squad?.length
      ? rivalTeamsData[teamKey].squad
      : franchise.squad2026

    // Exclude:
    // a) Untouchable marquee players
    // b) Players who were traded to this team (cannot release newly traded players)
    // c) Players currently active in user squad
    const releaseCandidates = currentRivalSquad
      .filter((p: any) => {
        const cleanName = p.name.trim().toLowerCase()
        if (UNTOUCHABLE_MARQUEE_NAMES.has(cleanName)) return false
        if (tradedNames.has(cleanName)) return false
        if (userActiveNames.has(cleanName)) return false
        return true
      })
      .sort((a: any, b: any) => {
        const scoreA = (a.Power_Index || 78) - (a.price > 5 ? 5 : 0)
        const scoreB = (b.Power_Index || 78) - (b.price > 5 ? 5 : 0)
        return scoreA - scoreB
      })
      .slice(0, 4) // Each rival AI releases 3-4 fringe/rotation players

    releaseCandidates.forEach((rp: any, idx: number) => {
      // Ensure no duplicates in pool
      if (pool.some((p) => p.name.trim().toLowerCase() === rp.name.trim().toLowerCase())) return

      pool.push({
        id: `ai_${teamKey}_${idx + 1}`,
        name: rp.name,
        role: rp.role,
        nationality: rp.nationality,
        is_overseas: rp.is_overseas,
        basePrice: Math.min(2.0, Math.max(0.3, rp.price >= 8 ? 2.0 : rp.price >= 3 ? 1.5 : 0.75)),
        powerIndex: rp.Power_Index || 78.0,
        formerTeam: franchise.name,
        statsSummary: rp.statsSummary || `${rp.name} • Released by ${franchise.short}`,
        releaseReason: `Released by ${franchise.short} to create auction purse`
      })
    })
  })

  // 3. Add Marquee Free Agents & International Stars (ONLY if NOT currently in active user squad or traded)
  RELEASED_AUCTION_POOL.forEach((mp, idx) => {
    const cleanName = mp.name.trim().toLowerCase()
    const isAlreadyInPool = pool.some((p) => p.name.trim().toLowerCase() === cleanName)
    const isInUserSquad = userActiveNames.has(cleanName)
    const isTraded = tradedNames.has(cleanName)

    if (!isAlreadyInPool && !isInUserSquad && !isTraded) {
      pool.push({
        id: `marquee_${idx + 1}`,
        name: mp.name,
        role: mp.role,
        nationality: mp.is_overseas ? 'Overseas' : 'Indian',
        is_overseas: mp.is_overseas,
        basePrice: mp.basePrice,
        powerIndex: mp.powerIndex,
        formerTeam: mp.formerTeam,
        statsSummary: mp.reason,
        releaseReason: 'Marquee Auction Lot'
      })
    }
  })

  // 4. Shuffle / Order so marquee sets appear first, followed by diverse sets
  return pool.sort((a, b) => b.powerIndex - a.powerIndex)
}
