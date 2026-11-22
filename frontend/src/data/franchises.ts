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
  is_captain?: boolean
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
  captain: string
  squad2026: IPLPlayer[]
  key2026AuctionNeeds: string[]
  strengths: string[]
  weaknesses: string[]
}

export const IPL_FRANCHISES: Record<string, FranchiseData> = {
  csk: {
    id: 'csk',
    name: 'Chennai Super Kings',
    short: 'CSK',
    color: '#facc15',
    emoji: '🦁',
    titles: '5x Champions • Defending Kings',
    totalPurse: 125.0,
    retainedSpend2026: 94.3,
    miniAuctionPurse2026: 30.7,
    stadiumName: 'M.A. Chidambaram Stadium',
    stadiumCity: 'Chennai',
    captain: 'Ruturaj Gaikwad',
    squad2026: [
      {
        player_id: 'csk_1',
        name: 'Ruturaj Gaikwad',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 93.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • Elegant Classical Top-Order Stroke Maker & Orange Cap Winner"
      },
      {
        player_id: 'csk_2',
        name: 'MS Dhoni',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "5x IPL Champion Legend & Master Finisher • Lightning Quick Behind Stumps"
      },
      {
        player_id: 'csk_3',
        name: 'Sanju Samson',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Classy T20 Centurion • Destructive Against Pace & Spin Alike"
      },
      {
        player_id: 'csk_4',
        name: 'Shivam Dube',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 12.0,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Towering Spin Destroyer & Middle Overs Maximum Enforcer"
      },
      {
        player_id: 'csk_5',
        name: 'Dewald Brevis',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.5,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Baby AB • 360 Degree Hitter & Spin Smasher"
      },
      {
        player_id: 'csk_6',
        name: 'Urvil Patel',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 78.0,
        is_uncapped: true,
        statsSummary: "Explosive Gujarat Wicketkeeper Batter • Fastest Indian T20 Century"
      },
      {
        player_id: 'csk_7',
        name: 'Kartik Sharma',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Promising Young Indian Stroke-Maker"
      },
      {
        player_id: 'csk_8',
        name: 'Ayush Mhatre',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Mumbai U19 Prodigy Opener with Fearless Intent"
      },
      {
        player_id: 'csk_9',
        name: 'Sarfaraz Khan',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 82.0,
        statsSummary: "Domestic Run Machine with Innovative 360 Ramp & Sweep Shots"
      },
      {
        player_id: 'csk_10',
        name: 'Anshul Kamboj',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.4,
        Power_Index: 82.0,
        statsSummary: "Haryana Seam Sensation • Consistent Test Match Line & Length"
      },
      {
        player_id: 'csk_11',
        name: 'Jamie Overton',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 80.0,
        statsSummary: "145+ km/h Pace & Hard Hitting Lower-Order All-Rounder"
      },
      {
        player_id: 'csk_12',
        name: 'Ramakrishna Ghosh',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Hard Hitting Bengal All-Rounder"
      },
      {
        player_id: 'csk_13',
        name: 'Prashant Veer',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Dynamic Domestic All-Rounder"
      },
      {
        player_id: 'csk_14',
        name: 'Matthew Short',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 82.0,
        statsSummary: "BBL Player of Tournament • Off-Spinning Powerplay Opener"
      },
      {
        player_id: 'csk_15',
        name: 'Aman Khan',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Aggressive Power Finisher & Medium Pacer"
      },
      {
        player_id: 'csk_16',
        name: 'Zak Foulkes',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 78.0,
        statsSummary: "Kiwi Seam Bowling All-Rounder & Death Overs Striker"
      },
      {
        player_id: 'csk_17',
        name: 'Khaleel Ahmed',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.8,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Left-Arm Inswing Powerplay Wicket-Taker"
      },
      {
        player_id: 'csk_18',
        name: 'Noor Ahmad',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 10.0,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Left-Arm Wrist Spin Prodigy • Economy & Wickets in Middle Overs"
      },
      {
        player_id: 'csk_19',
        name: 'Mukesh Choudhary',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 79.0,
        is_uncapped: true,
        statsSummary: "Left-Arm Powerplay Swing Bowler"
      },
      {
        player_id: 'csk_20',
        name: 'Nathan Ellis',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.5,
        Power_Index: 83.0,
        statsSummary: "T20 Death Bowling Specialist • Back-of-the-Hand Slower Balls"
      },
      {
        player_id: 'csk_21',
        name: 'Shreyas Gopal',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 79.0,
        is_uncapped: true,
        statsSummary: "Experienced Googly Specialist Leg-Spinner & Handy Batter"
      },
      {
        player_id: 'csk_22',
        name: 'Gurjapneet Singh',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.2,
        Power_Index: 79.0,
        statsSummary: "Tall Left-Arm Punjab Speedster with Steep Bounce"
      },
      {
        player_id: 'csk_23',
        name: 'Akeal Hosein',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 83.0,
        statsSummary: "Powerplay Left-Arm Spin Choker & Handy Six-Hitter"
      },
      {
        player_id: 'csk_24',
        name: 'Matt Henry',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 85.0,
        statsSummary: "Lethal New Ball Swinger & World Class Test Pacer"
      },
      {
        player_id: 'csk_25',
        name: 'Rahul Chahar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.2,
        Power_Index: 83.0,
        statsSummary: "Attacking Wrist Spinner & Googly Turn Specialist"
      },
    ],
    key2026AuctionNeeds: ["Pace Depth", "Powerplay Firepower"],
    strengths: ["Chepauk Spin Fortress", "Dhoni Finish", "Samson Intent", "Ruturaj Anchor"],
    weaknesses: ["Pace bowling consistency without Bravo"]
  },
  dc: {
    id: 'dc',
    name: 'Delhi Capitals',
    short: 'DC',
    color: '#2563eb',
    emoji: '🐯',
    titles: 'Roaring Tigers • Finalists',
    totalPurse: 125.0,
    retainedSpend2026: 120.45,
    miniAuctionPurse2026: 5.0,
    stadiumName: 'Arun Jaitley Stadium',
    stadiumCity: 'Delhi',
    captain: 'Axar Patel',
    squad2026: [
      {
        player_id: 'dc_1',
        name: 'Axar Patel',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.5,
        Power_Index: 93.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • World-Class Left-Arm Spin Choker & Clutch Middle-Order Power Hitter"
      },
      {
        player_id: 'dc_2',
        name: 'KL Rahul',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.0,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "4500+ IPL Runs • Elite Classical Top-Order Anchor & Wicketkeeper"
      },
      {
        player_id: 'dc_3',
        name: 'Abishek Porel',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Fearless Powerplay Stroke-Maker & Sharp Wicketkeeper"
      },
      {
        player_id: 'dc_4',
        name: 'Tristan Stubbs',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 10.0,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "360 Power Finisher & Strike Rate Booster in Middle Overs"
      },
      {
        player_id: 'dc_5',
        name: 'Karun Nair',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 80.0,
        is_uncapped: true,
        statsSummary: "Test Triple Centurion with Elegant Strokeplay"
      },
      {
        player_id: 'dc_6',
        name: 'Prithvi Shaw',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 81.0,
        statsSummary: "Aggressive Powerplay Opener with Blistering Hand Speed"
      },
      {
        player_id: 'dc_7',
        name: 'David Miller',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 7.5,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "Killer Miller • Legendary T20 Finisher & Cool Chaser"
      },
      {
        player_id: 'dc_8',
        name: 'Pathum Nissanka',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.0,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Prolific Sri Lankan T20 Opener & Consistent Anchor"
      },
      {
        player_id: 'dc_9',
        name: 'Ben Duckett',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.5,
        Power_Index: 82.0,
        statsSummary: "Bazball English Opener & 360 Sweep Specialist"
      },
      {
        player_id: 'dc_10',
        name: 'Sameer Rizvi',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.95,
        Power_Index: 80.0,
        statsSummary: "Right-Handed Spin Smasher & Hard-Hitting Finisher"
      },
      {
        player_id: 'dc_11',
        name: 'Ashutosh Sharma',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.8,
        Power_Index: 83.0,
        statsSummary: "Death Overs Miracle Finisher • Boundary Striker Under Pressure"
      },
      {
        player_id: 'dc_12',
        name: 'Vipraj Nigam',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Domestic All-Rounder with Sharp Fielding & Big Hitting"
      },
      {
        player_id: 'dc_13',
        name: 'Ajay Mandal',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Chhattisgarh Left-Arm Spin All-Rounder"
      },
      {
        player_id: 'dc_14',
        name: 'Tripurana Vijay',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Andhra Off-Spin All-Rounder"
      },
      {
        player_id: 'dc_15',
        name: 'Madhav Tiwari',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Young Express Seam Talent"
      },
      {
        player_id: 'dc_16',
        name: 'Auqib Dar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Jammu & Kashmir Express Pacer with Natural Swing"
      },
      {
        player_id: 'dc_17',
        name: 'Nitish Rana',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.2,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Aggressive Middle-Order Left-Hander & Useful Off-Spinner"
      },
      {
        player_id: 'dc_18',
        name: 'Mitchell Starc',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.75,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "World Cup Final MVP • 145+ km/h Powerplay Inswing Yorker Legend"
      },
      {
        player_id: 'dc_19',
        name: 'T. Natarajan',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 10.75,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "Yorker King of Salem • Lethal Toe-Crushers & Death Overs Economy"
      },
      {
        player_id: 'dc_20',
        name: 'Mukesh Kumar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.0,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Death Overs Seam Specialist with High Bowling IQ"
      },
      {
        player_id: 'dc_21',
        name: 'Dushmantha Chameera',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 81.0,
        statsSummary: "Express Sri Lankan Speedster & Powerplay Enforcer"
      },
      {
        player_id: 'dc_22',
        name: 'Lungi Ngidi',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 82.0,
        statsSummary: "Hit-the-Deck Express Pacer & Hard-Length Slower Ball Master"
      },
      {
        player_id: 'dc_23',
        name: 'Kyle Jamieson',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 82.0,
        statsSummary: "6ft 8in High Release Bounce & Seam Movement Specialist"
      },
      {
        player_id: 'dc_24',
        name: 'Kuldeep Yadav',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 13.25,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Left-Arm Wrist Spin Magician • Sharp Turn, Drift & Wicket-Taker"
      },
      {
        player_id: 'dc_25',
        name: 'Sahil Parakh',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Promising Maharashtra U19 Top-Order Batter"
      },
    ],
    key2026AuctionNeeds: ["Death Overs Bowling", "Pace Depth"],
    strengths: ["Starc Lethal Powerplay", "Kuldeep & Axar Spin Duo", "KL Rahul & Stubbs Firepower"],
    weaknesses: ["Inconsistent lower order finish"]
  },
  gt: {
    id: 'gt',
    name: 'Gujarat Titans',
    short: 'GT',
    color: '#1e3a5f',
    emoji: '⚡',
    titles: '2022 Champions • Relentless Contenders',
    totalPurse: 125.0,
    retainedSpend2026: 119.1,
    miniAuctionPurse2026: 5.9,
    stadiumName: 'Narendra Modi Stadium',
    stadiumCity: 'Ahmedabad',
    captain: 'Shubman Gill',
    squad2026: [
      {
        player_id: 'gt_1',
        name: 'Shubman Gill',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.5,
        Power_Index: 94.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • Orange Cap Winner & Elegant Franchise Top-Order Anchor"
      },
      {
        player_id: 'gt_2',
        name: 'Jos Buttler',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 15.75,
        Power_Index: 95.0,
        is_retained: true,
        statsSummary: "5x IPL Century Legend • Destructive T20 Keeper-Opener"
      },
      {
        player_id: 'gt_3',
        name: 'Kumar Kushagra',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.65,
        Power_Index: 78.0,
        statsSummary: "Jharkhand Wicketkeeper Batter with Big-Hitting Prowess"
      },
      {
        player_id: 'gt_4',
        name: 'Anuj Rawat',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 79.0,
        is_uncapped: true,
        statsSummary: "Delhi Left-Hand Wicketkeeper Opener & Sharp Gloves"
      },
      {
        player_id: 'gt_5',
        name: 'Tom Banton',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 81.0,
        statsSummary: "Dynamic Reverse-Sweeping English T20 Keeper-Batter"
      },
      {
        player_id: 'gt_6',
        name: 'Glenn Phillips',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.0,
        Power_Index: 86.0,
        statsSummary: "Electric Fielder, Off-Spin Option & Monster Middle-Order Finisher"
      },
      {
        player_id: 'gt_7',
        name: 'Nishant Sindhu',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 78.0,
        is_uncapped: true,
        statsSummary: "U19 World Cup Star • Left-Arm Spin & Classical Middle-Order Batting"
      },
      {
        player_id: 'gt_8',
        name: 'Washington Sundar',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.2,
        Power_Index: 85.0,
        statsSummary: "Economical Powerplay Off-Spinner & Classy Top-Order Left-Hander"
      },
      {
        player_id: 'gt_9',
        name: 'Mohd. Arshad Khan',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.3,
        Power_Index: 79.0,
        statsSummary: "Hard-Hitting Left-Hand Finisher & Left-Arm Seam Bowler"
      },
      {
        player_id: 'gt_10',
        name: 'Sai Kishore',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.0,
        Power_Index: 84.0,
        statsSummary: "Tall Left-Arm Finger Spinner • Tight Economy & Steep Drift"
      },
      {
        player_id: 'gt_11',
        name: 'Jayant Yadav',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 78.0,
        statsSummary: "Reliable Off-Spin Specialist with High Tactical Awareness"
      },
      {
        player_id: 'gt_12',
        name: 'Jason Holder',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 83.0,
        statsSummary: "Tall West Indian All-Rounder & Death Overs Bowler"
      },
      {
        player_id: 'gt_13',
        name: 'Sai Sudharsan',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.5,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "IPL Final Top-Scorer (96) • Elegant Anchor with High Strike-Rate Gears"
      },
      {
        player_id: 'gt_14',
        name: 'Shahrukh Khan',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Tamil Nadu Muscle Finisher • Monster Six-Hitter in Death Overs"
      },
      {
        player_id: 'gt_15',
        name: 'Kagiso Rabada',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 10.75,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "Purple Cap Winner • Express 145+ km/h Yorker & Bounce Pacer"
      },
      {
        player_id: 'gt_16',
        name: 'Mohammed Siraj',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 12.25,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "Miyan Magic • Fiery Powerplay Outswing & Relentless Intensity"
      },
      {
        player_id: 'gt_17',
        name: 'Prasidh Krishna',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.5,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Tall Hit-the-Deck Express Pacer with Steep Inward Seam"
      },
      {
        player_id: 'gt_18',
        name: 'Manav Suthar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Rajasthan Left-Arm Spinner with Impressive Arm Ball"
      },
      {
        player_id: 'gt_19',
        name: 'Gurnoor Singh Brar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.3,
        Power_Index: 77.0,
        statsSummary: "Tall Punjab Pacer Capable of 140+ km/h Speeds"
      },
      {
        player_id: 'gt_20',
        name: 'Ishant Sharma',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 80.0,
        statsSummary: "100+ Test Veteran • Deadly Seam Movement & High Release"
      },
      {
        player_id: 'gt_21',
        name: 'Ashok Sharma',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Rajasthan Fast Bowler with Raw Pace"
      },
      {
        player_id: 'gt_22',
        name: 'Prithvi Raj Yarra',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Andhra Left-Arm Quick with Powerplay Swing"
      },
      {
        player_id: 'gt_23',
        name: 'Luke Wood',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 79.0,
        statsSummary: "Left-Arm English Seamer & Swing Specialist"
      },
      {
        player_id: 'gt_24',
        name: 'Rahul Tewatia',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Ice-Cold Miracle Finisher & Useful Leg-Spin Option"
      },
      {
        player_id: 'gt_25',
        name: 'Rashid Khan',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 18.0,
        Power_Index: 96.0,
        is_retained: true,
        statsSummary: "World #1 T20 Leg-Spinner & Clutch Lower-Order Match-Finisher"
      },
    ],
    key2026AuctionNeeds: ["Middle-Order Acceleration", "Spin Backup"],
    strengths: ["Gill & Buttler Legendary Opening", "Siraj & Rabada Pace Arsenal", "Rashid & Tewatia Clutch Finish"],
    weaknesses: ["Dependent on top order runs"]
  },
  kkr: {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    color: '#7e22ce',
    emoji: '⚔️',
    titles: '3x Champions • Defending 2024 Kings',
    totalPurse: 125.0,
    retainedSpend2026: 112.7,
    miniAuctionPurse2026: 12.3,
    stadiumName: 'Eden Gardens',
    stadiumCity: 'Kolkata',
    captain: 'Ajinkya Rahane',
    squad2026: [
      {
        player_id: 'kkr_1',
        name: 'Ajinkya Rahane',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.5,
        Power_Index: 84.0,
        is_captain: true,
        statsSummary: "Captain • Experienced Leader & Classical Boundary-Finder"
      },
      {
        player_id: 'kkr_2',
        name: 'Sunil Narine',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.0,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "3x IPL MVP • Mystery Spin Choker & Blistering Powerplay Opener"
      },
      {
        player_id: 'kkr_3',
        name: 'Varun Chakravarthy',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 12.0,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "India's Premier Mystery Spinner • Carrom Ball & Leg-Cutter"
      },
      {
        player_id: 'kkr_4',
        name: 'Cameron Green',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 25.2,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "Record Aussie All-Rounder • Seam Pacing & Towering Maximums"
      },
      {
        player_id: 'kkr_5',
        name: 'Rinku Singh',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 13.0,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "5 Sixes in 5 Balls Legend • India's Leading Death Overs Finisher"
      },
      {
        player_id: 'kkr_6',
        name: 'Manish Pandey',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 80.0,
        statsSummary: "First Indian IPL Centurion • Reliable Middle-Order Anchor"
      },
      {
        player_id: 'kkr_7',
        name: 'Rovman Powell',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 83.0,
        statsSummary: "West Indies T20 Captain • Destructive Clean Striker"
      },
      {
        player_id: 'kkr_8',
        name: 'Angkrish Raghuvanshi',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.0,
        Power_Index: 82.0,
        statsSummary: "Fearless Strokeplay Prodigy • Fluent Counter-Attacker at #3"
      },
      {
        player_id: 'kkr_9',
        name: 'Anukul Roy',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.4,
        Power_Index: 77.0,
        is_uncapped: true,
        statsSummary: "Tenacious Left-Arm Spinner & Gun Boundary Fielder"
      },
      {
        player_id: 'kkr_10',
        name: 'Sarthak Ranjan',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Delhi Domestic Top-Order Stroke Player"
      },
      {
        player_id: 'kkr_11',
        name: 'Daksh Kamra',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Young Emerging Top-Order Batter"
      },
      {
        player_id: 'kkr_12',
        name: 'Rachin Ravindra',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.0,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "World Cup Breakout • Left-Arm Spin & Classical Top-Order Strokeplay"
      },
      {
        player_id: 'kkr_13',
        name: 'Ramandeep Singh',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Elite Athletic Finisher • 200+ SR Death Striker & Seam Option"
      },
      {
        player_id: 'kkr_14',
        name: 'Vaibhav Arora',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.8,
        Power_Index: 83.0,
        statsSummary: "Dual-Way Powerplay Swing Specialist with Lethal In-Dipper"
      },
      {
        player_id: 'kkr_15',
        name: 'Matheesha Pathirana',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 13.0,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Baby Malinga • Lethal 150 km/h Slinging Yorkers & Dipping Slower Balls"
      },
      {
        player_id: 'kkr_16',
        name: 'Kartik Tyagi',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.6,
        Power_Index: 81.0,
        statsSummary: "145+ km/h Searing Pace & Precision Death Yorker Specialist"
      },
      {
        player_id: 'kkr_17',
        name: 'Prashant Solanki',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Mumbai Leg-Spinner with Deceptive Googly"
      },
      {
        player_id: 'kkr_18',
        name: 'Akash Deep',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.0,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Test Match Striker • Relentless 140+ km/h Seam & Outswing"
      },
      {
        player_id: 'kkr_19',
        name: 'Harshit Rana',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "145 km/h Aggressive Pacer • Slower Bouncers & Champion Celebration"
      },
      {
        player_id: 'kkr_20',
        name: 'Umran Malik',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.75,
        Power_Index: 84.0,
        statsSummary: "157 km/h Speed Gun • Raw Express Pace That Rattles Stumps"
      },
      {
        player_id: 'kkr_21',
        name: 'Mustafizur Rahman',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 84.0,
        statsSummary: "The Fizz • Legendary Cutters & Deceptive Left-Arm Slower Balls"
      },
      {
        player_id: 'kkr_22',
        name: 'Tejasvi Singh',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Emerging Indian Batting Talent"
      },
      {
        player_id: 'kkr_23',
        name: 'Finn Allen',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 85.0,
        statsSummary: "Kiwi Powerplay Basher • 170+ T20 International Strike Rate"
      },
      {
        player_id: 'kkr_24',
        name: 'Tim Seifert',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 81.0,
        statsSummary: "Agile Kiwi Wicketkeeper & Innovative 360-degree Stroke-Maker"
      },
    ],
    key2026AuctionNeeds: ["Pace Depth", "Indian Batter Backup"],
    strengths: ["Narine & Varun Mystery Spin Duo", "Rinku & Ramandeep Finish", "Green All-Round Impact"],
    weaknesses: ["New captaincy dynamic"]
  },
  lsg: {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    short: 'LSG',
    color: '#0ea5e9',
    emoji: '🦅',
    titles: 'Super Giants • Playoff Regulars',
    totalPurse: 125.0,
    retainedSpend2026: 117.65,
    miniAuctionPurse2026: 7.35,
    stadiumName: 'BRSABV Ekana Cricket Stadium',
    stadiumCity: 'Lucknow',
    captain: 'Rishabh Pant',
    squad2026: [
      {
        player_id: 'lsg_1',
        name: 'Rishabh Pant',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 27.0,
        Power_Index: 97.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • Record ₹27 Cr Signee • Game-Changing 360 Match Winner"
      },
      {
        player_id: 'lsg_2',
        name: 'Nicholas Pooran',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 21.0,
        Power_Index: 95.0,
        is_retained: true,
        statsSummary: "T20 Six-Hitting Titan • Middle-Order Demolisher"
      },
      {
        player_id: 'lsg_3',
        name: 'Ayush Badoni',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Baby Malinga Smasher • Calm 360 Finisher in High-Pressure Chases"
      },
      {
        player_id: 'lsg_4',
        name: 'Abdul Samad',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.2,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Jammu Monster Hitter • Clean Long-On & Long-Off Six-Hitter"
      },
      {
        player_id: 'lsg_5',
        name: 'Aiden Markram',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 86.0,
        statsSummary: "Proteas T20 Captain • Solid Technical Anchor & Off-Break Option"
      },
      {
        player_id: 'lsg_6',
        name: 'Himmat Singh',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Delhi Ranji Captain • Solid Middle-Order Accumulator"
      },
      {
        player_id: 'lsg_7',
        name: 'Matthew Breetzke',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.25,
        Power_Index: 80.0,
        statsSummary: "Dynamic South African Top-Order Striker & Wicketkeeper"
      },
      {
        player_id: 'lsg_8',
        name: 'Mitchell Marsh',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.4,
        Power_Index: 87.0,
        statsSummary: "Aussie T20 Captain • Heavy Seam Ball & Brute Top-Order Power"
      },
      {
        player_id: 'lsg_9',
        name: 'Shahbaz Ahmed',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.4,
        Power_Index: 83.0,
        statsSummary: "Clever Left-Arm Spinner & Clutch Middle-Order Run Scorer"
      },
      {
        player_id: 'lsg_10',
        name: 'Arshin Kulkarni',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "India U19 Seam Bowling All-Rounder & Top-Order Power"
      },
      {
        player_id: 'lsg_11',
        name: 'Wanindu Hasaranga',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 5.25,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Mystery Googly Magician & Aggressive Lower-Order Six-Hitter"
      },
      {
        player_id: 'lsg_12',
        name: 'Mohammad Shami',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 10.0,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "World Cup Leading Wicket-Taker • Perfect Seam Presentation & Swing"
      },
      {
        player_id: 'lsg_13',
        name: 'Avesh Khan',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.75,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Hit-the-Deck Express Pacer with Lethal Wide Yorkers in Death"
      },
      {
        player_id: 'lsg_14',
        name: 'M. Siddharth',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 78.0,
        is_uncapped: true,
        statsSummary: "Tamil Nadu Left-Arm Arm Ball Specialist • Powerplay Weapon"
      },
      {
        player_id: 'lsg_15',
        name: 'Digvesh Singh',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Domestic Fast Bowler with High Release"
      },
      {
        player_id: 'lsg_16',
        name: 'Akash Singh',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.4,
        Power_Index: 77.0,
        is_uncapped: true,
        statsSummary: "Left-Arm Swing Bowler with Early Shape"
      },
      {
        player_id: 'lsg_17',
        name: 'Prince Yadav',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Hard Working Domestic Pace All-Rounder"
      },
      {
        player_id: 'lsg_18',
        name: 'Arjun Tendulkar',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Left-Arm Swing Bowler with Genuine New-Ball Inswing"
      },
      {
        player_id: 'lsg_19',
        name: 'Anrich Nortje',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 6.5,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "155 km/h South African Thunderbolt Pacer"
      },
      {
        player_id: 'lsg_20',
        name: 'Naman Tiwari',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "U19 World Cup Left-Arm Express Pacer with Lethal Yorkers"
      },
      {
        player_id: 'lsg_21',
        name: 'Mayank Yadav',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.0,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "156.7 km/h National Sensation • Steep Bounce & Intimidating Heat"
      },
      {
        player_id: 'lsg_22',
        name: 'Mohsin Khan',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Tall Left-Arm Pacer • Deadly Back-of-Length & Slower Cutters"
      },
      {
        player_id: 'lsg_23',
        name: 'Josh Inglis',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.6,
        Power_Index: 84.0,
        statsSummary: "Australian T20 Champion Keeper & Innovative 360 Batter"
      },
      {
        player_id: 'lsg_24',
        name: 'Akshat Raghuwanshi',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Madhya Pradesh Middle-Order Strokemaker"
      },
      {
        player_id: 'lsg_25',
        name: 'Mukul Choudhary',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Domestic Emerging Batter"
      },
    ],
    key2026AuctionNeeds: ["Pace Backup", "Top Order Stability"],
    strengths: ["Pant & Pooran Explosive Middle Order", "Mayank Yadav 156 km/h Thunderbolts", "Shami New Ball Swing"],
    weaknesses: ["Injury management of express pacers"]
  },
  mi: {
    id: 'mi',
    name: 'Mumbai Indians',
    short: 'MI',
    color: '#004ba0',
    emoji: '💙',
    titles: '5x Champions • Powerhouse',
    totalPurse: 125.0,
    retainedSpend2026: 129.35,
    miniAuctionPurse2026: 5.0,
    stadiumName: 'Wankhede Stadium',
    stadiumCity: 'Mumbai',
    captain: 'Hardik Pandya',
    squad2026: [
      {
        player_id: 'mi_1',
        name: 'Hardik Pandya',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.35,
        Power_Index: 94.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • World-Class Pace All-Rounder & Clutch T20 Finisher"
      },
      {
        player_id: 'mi_2',
        name: 'Rohit Sharma',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.3,
        Power_Index: 95.0,
        is_retained: true,
        statsSummary: "Hitman • 5x Trophy Leader & Destructive Powerplay Maestro"
      },
      {
        player_id: 'mi_3',
        name: 'Suryakumar Yadav',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 16.35,
        Power_Index: 97.0,
        is_retained: true,
        statsSummary: "World #1 T20 Batter • Unstoppable 360 Degree Supla Shot Master"
      },
      {
        player_id: 'mi_4',
        name: 'Jasprit Bumrah',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 98.0,
        is_retained: true,
        statsSummary: "World's Greatest All-Format Bowler • Unplayable Yorkers & Sub-6 Economy"
      },
      {
        player_id: 'mi_5',
        name: 'Quinton de Kock',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.6,
        Power_Index: 90.0,
        statsSummary: "World Cup Centurion • Flamboyant Left-Hand Opener & Gloveman"
      },
      {
        player_id: 'mi_6',
        name: 'Trent Boult',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.5,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "First Over Inswing Assassin • Legendary Powerplay Wicket-Taker"
      },
      {
        player_id: 'mi_7',
        name: 'Deepak Chahar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 9.25,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Elite Powerplay Swing Specialist • Master of New-Ball Inswing"
      },
      {
        player_id: 'mi_8',
        name: 'Shardul Thakur',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Lord Shardul • Golden Arm Wicket-Taker & Clutch Boundary Hitter"
      },
      {
        player_id: 'mi_9',
        name: 'Sherfane Rutherford',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.6,
        Power_Index: 84.0,
        statsSummary: "Caribbean Clutch Finisher & Power Striker against Spin"
      },
      {
        player_id: 'mi_10',
        name: 'Tilak Varma',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.0,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "India T20 Centurion • Versatile Left-Hand Anchor & Finisher"
      },
      {
        player_id: 'mi_11',
        name: 'Mayank Markande',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 80.0,
        is_uncapped: true,
        statsSummary: "Deceptive Googly Spinner with Subtle Variations"
      },
      {
        player_id: 'mi_12',
        name: 'Robin Minz',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.65,
        Power_Index: 78.0,
        statsSummary: "Tribal Sensation from Ranchi • Hard-Hitting Left-Hand Finisher"
      },
      {
        player_id: 'mi_13',
        name: 'Ryan Rickelton',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 81.0,
        statsSummary: "SA20 Top Run Scorer • Aggressive Left-Handed Opener"
      },
      {
        player_id: 'mi_14',
        name: 'Naman Dhir',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.25,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Punjab Power Finisher • 200+ SR Death Striker & Off-Spin Option"
      },
      {
        player_id: 'mi_15',
        name: 'Mitchell Santner',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 85.0,
        statsSummary: "New Zealand Captain • Economical Left-Arm Darts & Reliable Finisher"
      },
      {
        player_id: 'mi_16',
        name: 'Raj Angad Bawa',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.4,
        Power_Index: 77.0,
        is_uncapped: true,
        statsSummary: "U19 World Cup Final MVP • Pace All-Rounder & Clean Striker"
      },
      {
        player_id: 'mi_17',
        name: 'Atharva Ankolekar',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Mumbai Left-Arm Spin All-Rounder with Excellent Control"
      },
      {
        player_id: 'mi_18',
        name: 'Mayank Rawat',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Emerging Delhi Power Striker"
      },
      {
        player_id: 'mi_19',
        name: 'Corbin Bosch',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.75,
        Power_Index: 78.0,
        statsSummary: "Proteas Seam Bowling All-Rounder & Athletic Fielder"
      },
      {
        player_id: 'mi_20',
        name: 'Will Jacks',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 5.25,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "IPL Centurion • Blistering Off-Spinning Powerplay Opener"
      },
      {
        player_id: 'mi_21',
        name: 'Ashwani Kumar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Domestic Fast Bowler with Good Seam Position"
      },
      {
        player_id: 'mi_22',
        name: 'Mohammad Izhar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Young Express Seamer"
      },
      {
        player_id: 'mi_23',
        name: 'Raghu Sharma',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Domestic Leg-Spinner"
      },
      {
        player_id: 'mi_24',
        name: 'AM Ghazanfar',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 4.8,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "Afghan Teen Mystery Spin Prodigy • Finger Spin Variations"
      },
      {
        player_id: 'mi_25',
        name: 'Danish',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Domestic All-Rounder with Athletic Agility"
      },
    ],
    key2026AuctionNeeds: ["Spin Depth", "Overseas Pacer"],
    strengths: ["Bumrah & Boult Searing Pace", "Suryakumar, Rohit & Hardik Firepower", "Tilak & Naman Finish"],
    weaknesses: ["Spin department reliant on domestic prospects"]
  },
  pbks: {
    id: 'pbks',
    name: 'Punjab Kings',
    short: 'PBKS',
    color: '#dc2626',
    emoji: '🦁',
    titles: 'Sher Squad • New Era',
    totalPurse: 125.0,
    retainedSpend2026: 114.8,
    miniAuctionPurse2026: 10.2,
    stadiumName: 'Maharaja Yadavindra Singh Stadium',
    stadiumCity: 'Mullanpur',
    captain: 'Shreyas Iyer',
    squad2026: [
      {
        player_id: 'pbks_1',
        name: 'Shreyas Iyer',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 26.75,
        Power_Index: 95.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • IPL 2024 Champion Leader • Spin-Dominating Middle-Order Anchor"
      },
      {
        player_id: 'pbks_2',
        name: 'Nehal Wadhera',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.2,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Fearless Left-Hand Stroke Maker with Big-Match Temperament"
      },
      {
        player_id: 'pbks_3',
        name: 'Vishnu Vinod',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.95,
        Power_Index: 80.0,
        statsSummary: "Kerala Power Hitter with Tremendous Bat Speed & Glove Skills"
      },
      {
        player_id: 'pbks_4',
        name: 'Harnoor Pannu',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "U19 World Cup Opener with Elegant Left-Hand Timing"
      },
      {
        player_id: 'pbks_5',
        name: 'Pyla Avinash',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Andhra Domestic Batting Talent"
      },
      {
        player_id: 'pbks_6',
        name: 'Prabhsimran Singh',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "IPL Centurion • Aggressive Powerplay Opener with No Fear"
      },
      {
        player_id: 'pbks_7',
        name: 'Shashank Singh',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.5,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Ice-Cold Death Overs Enforcer • Highest Strike-Rate in Pressure Chases"
      },
      {
        player_id: 'pbks_8',
        name: 'Marcus Stoinis',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.0,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "The Hulk • Match-Winning Power Finisher & Seam Bowling Option"
      },
      {
        player_id: 'pbks_9',
        name: 'Harpreet Brar',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.5,
        Power_Index: 83.0,
        statsSummary: "Giant-Killing Left-Arm Spinner • Renowned for Dismissing Marquee Batters"
      },
      {
        player_id: 'pbks_10',
        name: 'Marco Jansen',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 7.0,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "6ft 8in Left-Arm Inswing Pacer & Hard-Hitting Tailender"
      },
      {
        player_id: 'pbks_11',
        name: 'Azmatullah Omarzai',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.4,
        Power_Index: 85.0,
        statsSummary: "Afghan Seaming All-Rounder • New Ball Swing & Calm Batting Finish"
      },
      {
        player_id: 'pbks_12',
        name: 'Priyansh Arya',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 3.8,
        Power_Index: 83.0,
        statsSummary: "DPL Record 6 Sixes in an Over • Explosive Left-Hand Opener"
      },
      {
        player_id: 'pbks_13',
        name: 'Musheer Khan',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 78.0,
        is_uncapped: true,
        statsSummary: "Ranji Final Centurion • Tenacious Top-Order Strokeplay & Left-Arm Spin"
      },
      {
        player_id: 'pbks_14',
        name: 'Suryansh Shedge',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Mumbai Power Hitter & Right-Arm Seamer"
      },
      {
        player_id: 'pbks_15',
        name: 'Mitch Owen',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.5,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Tasmanian Heavy Hitter & Seam Option"
      },
      {
        player_id: 'pbks_16',
        name: 'Cooper Connolly',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.5,
        Power_Index: 78.0,
        is_uncapped: true,
        statsSummary: "BBL Finals Hero • Left-Arm Spin & Ice-Cold Lower-Order Batting"
      },
      {
        player_id: 'pbks_17',
        name: 'Ben Dwarshuis',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 80.0,
        statsSummary: "Left-Arm Swing Pacer & Death Overs Slower Ball Craft"
      },
      {
        player_id: 'pbks_18',
        name: 'Arshdeep Singh',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "T20 World Cup Champion • Master of Death Overs Yorkers & Powerplay Swing"
      },
      {
        player_id: 'pbks_19',
        name: 'Yuzvendra Chahal',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "All-Time Leading IPL Wicket-Taker • Deceptive Flight & Turn"
      },
      {
        player_id: 'pbks_20',
        name: 'Vyshak Vijaykumar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.8,
        Power_Index: 82.0,
        statsSummary: "Karnataka Fast Bowler • Deceptive Knuckle Ball & Bouncers"
      },
      {
        player_id: 'pbks_21',
        name: 'Yash Thakur',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.6,
        Power_Index: 82.0,
        statsSummary: "Vidarbha 5-Wicket Haul Pacer • Cool Headed Death Overs Bowler"
      },
      {
        player_id: 'pbks_22',
        name: 'Xavier Bartlett',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 82.0,
        statsSummary: "Aussie BBL Leading Wicket-Taker • Deadly Outswing & Length Control"
      },
      {
        player_id: 'pbks_23',
        name: 'Pravin Dubey',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.8,
        Power_Index: 79.0,
        statsSummary: "Accurate Leg-Spinner & Athletic Boundary Fielder"
      },
      {
        player_id: 'pbks_24',
        name: 'Vishal Nishad',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Domestic Fast Bowling Prospect"
      },
      {
        player_id: 'pbks_25',
        name: 'Lockie Ferguson',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.0,
        Power_Index: 86.0,
        statsSummary: "150+ km/h Express Kiwi Gun • Hard Lengths & Searing Bouncers"
      },
    ],
    key2026AuctionNeeds: ["Lower-Order Finishing", "Pace Depth"],
    strengths: ["Shreyas Iyer Championship Leadership", "Arshdeep & Chahal Purple Cap Duo", "Stoinis & Shashank Power"],
    weaknesses: ["Historical playoff pressure"]
  },
  rr: {
    id: 'rr',
    name: 'Rajasthan Royals',
    short: 'RR',
    color: '#ec4899',
    emoji: '👑',
    titles: 'Inaugural Champions • Halla Bol',
    totalPurse: 125.0,
    retainedSpend2026: 130.05,
    miniAuctionPurse2026: 5.0,
    stadiumName: 'Sawai Mansingh Stadium',
    stadiumCity: 'Jaipur',
    captain: 'Riyan Parag',
    squad2026: [
      {
        player_id: 'rr_1',
        name: 'Riyan Parag',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.0,
        Power_Index: 92.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • 573 Runs in IPL 2024 • Destructive Enforcer at #4 & Off-Spin"
      },
      {
        player_id: 'rr_2',
        name: 'Yashasvi Jaiswal',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 95.0,
        is_retained: true,
        statsSummary: "World's Most Explosive All-Format Opener • Fastest 50 in IPL History (13b)"
      },
      {
        player_id: 'rr_3',
        name: 'Dhruv Jurel',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.0,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "India Test Star • Composed Death Overs Finisher & Elite Gloveman"
      },
      {
        player_id: 'rr_4',
        name: 'Shimron Hetmyer',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.0,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Caribbean Destruction • Left-Hand Death Overs Boundary Machine"
      },
      {
        player_id: 'rr_5',
        name: 'Shubham Dubey',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.8,
        Power_Index: 81.0,
        is_retained: true,
        statsSummary: "Vidarbha Left-Hand Finisher with Prodigious Power Against Pace"
      },
      {
        player_id: 'rr_6',
        name: 'Vaibhav Suryavanshi',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.1,
        Power_Index: 80.0,
        statsSummary: "13-Year-Old Historic Record Signee • India U19 Phenomenon"
      },
      {
        player_id: 'rr_7',
        name: 'Ravindra Jadeja',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 18.0,
        Power_Index: 95.0,
        is_retained: true,
        statsSummary: "Sir Jadeja • 4x IPL Champion • World's Best Fielder, Spin Choker & Clutch Finisher"
      },
      {
        player_id: 'rr_8',
        name: 'Sam Curran',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.4,
        Power_Index: 87.0,
        statsSummary: "T20 World Cup MVP • Left-Arm Swing, Death Yorkers & Gutsy Runs"
      },
      {
        player_id: 'rr_9',
        name: 'Donovan Ferreira',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 81.0,
        statsSummary: "Power Finisher, Lightning Wicketkeeper & Quick Off-Spin Option"
      },
      {
        player_id: 'rr_10',
        name: 'Dasun Shanaka',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 80.0,
        statsSummary: "Sri Lankan T20 Captain • Death Overs Six-Hitter & Seam Bowler"
      },
      {
        player_id: 'rr_11',
        name: 'Jofra Archer',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.5,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "World Cup Winning Strike Pacer • 150 km/h Bouncers & Lethal Line"
      },
      {
        player_id: 'rr_12',
        name: 'Tushar Deshpande',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 6.5,
        Power_Index: 84.0,
        is_retained: true,
        statsSummary: "Powerplay Strike Bowler • Outswing & Relentless Attacking Lengths"
      },
      {
        player_id: 'rr_13',
        name: 'Kwena Maphaka',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 82.0,
        statsSummary: "U19 World Cup Player of Tournament • 145 km/h Left-Arm Express"
      },
      {
        player_id: 'rr_14',
        name: 'Ravi Bishnoi',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.0,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "World #1 Ranked T20 Leg-Spinner • Lethal 115 km/h Quicker Googly"
      },
      {
        player_id: 'rr_15',
        name: 'Sushant Mishra',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.4,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "Left-Arm Fast Bowler with Natural Inswing & Bouncers"
      },
      {
        player_id: 'rr_16',
        name: 'Yash Raj Punia',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Domestic Pacer with Steep Bounce"
      },
      {
        player_id: 'rr_17',
        name: 'Vignesh Puthur',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Kerala Emerging All-Rounder"
      },
      {
        player_id: 'rr_18',
        name: 'Brijesh Sharma',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Young Domestic Strokemaker"
      },
      {
        player_id: 'rr_19',
        name: 'Adam Milne',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 82.0,
        statsSummary: "150 km/h Kiwi Rocket Pacer with Deadly Hard Lengths"
      },
      {
        player_id: 'rr_20',
        name: 'Kuldeep Sen',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 80.0,
        is_uncapped: true,
        statsSummary: "145+ km/h Express Pacer with Steep Inward Bounce"
      },
      {
        player_id: 'rr_21',
        name: 'Sandeep Sharma',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 4.0,
        Power_Index: 87.0,
        is_retained: true,
        statsSummary: "Death Overs Master • Wide Yorker Precision & Inswing Mastery"
      },
      {
        player_id: 'rr_22',
        name: 'Nandre Burger',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.5,
        Power_Index: 85.0,
        statsSummary: "Fiery Left-Arm South African Pacer • Rapid Pace & Steep Bounce"
      },
      {
        player_id: 'rr_23',
        name: 'Lhuan-dre Pretorius',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.5,
        Power_Index: 77.0,
        is_uncapped: true,
        statsSummary: "Dynamic South African U19 Keeper-Opener"
      },
      {
        player_id: 'rr_24',
        name: 'Aman Rao Perala',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Hyderabad Emerging Batter"
      },
      {
        player_id: 'rr_25',
        name: 'Ravi Singh',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Domestic Top-Order Batter"
      },
      {
        player_id: 'rr_26',
        name: 'Yudhvir Singh Charak',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.35,
        Power_Index: 78.0,
        is_uncapped: true,
        statsSummary: "J&K Fast Bowling All-Rounder with Genuine 140+ km/h Heat"
      },
    ],
    key2026AuctionNeeds: ["Pace Depth", "Powerplay Anchor"],
    strengths: ["Jaiswal World-Class Opening", "Jadeja All-Round Masterclass", "Archer & Sandeep Death Precision"],
    weaknesses: ["Samson departure requires middle order leadership"]
  },
  rcb: {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    color: '#dc2626',
    emoji: '👑',
    titles: 'Bold Army • Red & Gold Legacy',
    totalPurse: 125.0,
    retainedSpend2026: 134.85,
    miniAuctionPurse2026: 5.0,
    stadiumName: 'M. Chinnaswamy Stadium',
    stadiumCity: 'Bengaluru',
    captain: 'Rajat Patidar',
    squad2026: [
      {
        player_id: 'rcb_1',
        name: 'Rajat Patidar',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.0,
        Power_Index: 91.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • Elite Spin Destroyer • Century in IPL Playoffs & Enforcer at #4"
      },
      {
        player_id: 'rcb_2',
        name: 'Virat Kohli',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 21.0,
        Power_Index: 97.0,
        is_retained: true,
        statsSummary: "King Kohli • 8000+ IPL Runs • Orange Cap Legend & Supreme Chase Master"
      },
      {
        player_id: 'rcb_3',
        name: 'Devdutt Padikkal',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.0,
        Power_Index: 83.0,
        statsSummary: "Classical Left-Handed Top-Order Strokemaker with High Pedigree"
      },
      {
        player_id: 'rcb_4',
        name: 'Phil Salt',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 11.5,
        Power_Index: 92.0,
        is_retained: true,
        statsSummary: "Explosive English Keeper-Opener • Striking at 180+"
      },
      {
        player_id: 'rcb_5',
        name: 'Jitesh Sharma',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.0,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Aggressive Indian Finisher & Elite Gloveman"
      },
      {
        player_id: 'rcb_6',
        name: 'Krunal Pandya',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.75,
        Power_Index: 85.0,
        is_retained: true,
        statsSummary: "Tactical Left-Arm Spin Controller & Clutch Big-Match Finisher"
      },
      {
        player_id: 'rcb_7',
        name: 'Tim David',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 3.0,
        Power_Index: 88.0,
        statsSummary: "Colossal Six-Hitter & Death Overs Demolisher"
      },
      {
        player_id: 'rcb_8',
        name: 'Romario Shepherd',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.5,
        Power_Index: 84.0,
        statsSummary: "West Indian Power Finisher (32 off an over) & Seam Option"
      },
      {
        player_id: 'rcb_9',
        name: 'Jacob Bethell',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 2.6,
        Power_Index: 83.0,
        statsSummary: "English Left-Hand Phenom • Classical Clean Striking & Left-Arm Spin"
      },
      {
        player_id: 'rcb_10',
        name: 'Venkatesh Iyer',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 23.75,
        Power_Index: 91.0,
        is_retained: true,
        statsSummary: "IPL Finals MVP • Fearless Power Striker & Handy Medium Pacer"
      },
      {
        player_id: 'rcb_11',
        name: 'Bhuvneshwar Kumar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 10.75,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "2x Purple Cap Legend • Master of Powerplay Swing & Knuckle Balls"
      },
      {
        player_id: 'rcb_12',
        name: 'Josh Hazlewood',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 12.5,
        Power_Index: 93.0,
        is_retained: true,
        statsSummary: "World #1 Test & T20 Seamer • Relentless Dot Ball Machine"
      },
      {
        player_id: 'rcb_13',
        name: 'Yash Dayal',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 5.0,
        Power_Index: 86.0,
        is_retained: true,
        statsSummary: "Hero of Chinnaswamy • Left-Arm Angle, Powerplay Shape & Death Yorkers"
      },
      {
        player_id: 'rcb_14',
        name: 'Nuwan Thushara',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.6,
        Power_Index: 84.0,
        statsSummary: "Slinging Lasith Malinga Action • Deadly Toe-Crushing Yorkers"
      },
      {
        player_id: 'rcb_15',
        name: 'Suyash Sharma',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 2.6,
        Power_Index: 82.0,
        statsSummary: "Delhi Mystery Leg-Spinner with Lethal Arm Ball & Quicker Googly"
      },
      {
        player_id: 'rcb_16',
        name: 'Rasikh Dar',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 6.0,
        Power_Index: 83.0,
        is_retained: true,
        statsSummary: "J&K Seam Sensation • Deceptive Slower Cutters & Hard Lengths"
      },
      {
        player_id: 'rcb_17',
        name: 'Jacob Duffy',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 80.0,
        statsSummary: "Accurate Kiwi Swing Bowler with Excellent Seam Presentation"
      },
      {
        player_id: 'rcb_18',
        name: 'Abhinandan Singh',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Domestic Fast Bowling Prospect"
      },
      {
        player_id: 'rcb_19',
        name: 'Swapnil Singh',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.5,
        Power_Index: 80.0,
        is_uncapped: true,
        statsSummary: "Reliable Powerplay Left-Arm Dart Bowler & Lower-Order Six-Hitter"
      },
      {
        player_id: 'rcb_20',
        name: 'Satvik Deswal',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Haryana Young Leg-Spin Talent"
      },
      {
        player_id: 'rcb_21',
        name: 'Mangesh Yadav',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Maharashtra Express Seamer"
      },
      {
        player_id: 'rcb_22',
        name: 'Vicky Ostwal',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "U19 World Cup Leading Wicket-Taker • Classical Left-Arm Orthodox"
      },
      {
        player_id: 'rcb_23',
        name: 'Vihaan Malhotra',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Punjab U19 Top-Order Strokemaker"
      },
      {
        player_id: 'rcb_24',
        name: 'Kanishk Chouhan',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Dynamic All-Rounder with Explosive Lower-Order Batting"
      },
    ],
    key2026AuctionNeeds: ["Middle-Order Spin Backup", "Death Pace Depth"],
    strengths: ["Kohli Supreme Masterclass", "Patidar Spin Destroyer", "Hazlewood & Bhuvi Seam Mastery", "Salt & Jitesh Power"],
    weaknesses: ["Chinnaswamy high-altitude ground defense"]
  },
  srh: {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    short: 'SRH',
    color: '#f97316',
    emoji: '🦅',
    titles: 'Orange Army • 2016 Champions',
    totalPurse: 125.0,
    retainedSpend2026: 109.0,
    miniAuctionPurse2026: 16.0,
    stadiumName: 'Rajiv Gandhi International Stadium',
    stadiumCity: 'Hyderabad',
    captain: 'Pat Cummins',
    squad2026: [
      {
        player_id: 'srh_1',
        name: 'Pat Cummins',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 18.0,
        Power_Index: 95.0,
        is_retained: true,
        is_captain: true,
        statsSummary: "Captain • World Cup Winning Captain • Lethal Bouncers & Hard Hitting Tailender"
      },
      {
        player_id: 'srh_2',
        name: 'Travis Head',
        role: 'BAT',
        nationality: 'Overseas',
        is_overseas: true,
        price: 14.0,
        Power_Index: 96.0,
        is_retained: true,
        statsSummary: "T20 Demolition Opener • World Record 125-run Powerplays"
      },
      {
        player_id: 'srh_3',
        name: 'Abhishek Sharma',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 14.0,
        Power_Index: 94.0,
        is_retained: true,
        statsSummary: "Powerplay World Record Basher • 200+ SR Six-Machine & Left-Arm Spin"
      },
      {
        player_id: 'srh_4',
        name: 'Ishan Kishan',
        role: 'WK',
        nationality: 'Indian',
        is_overseas: false,
        price: 11.25,
        Power_Index: 90.0,
        is_retained: true,
        statsSummary: "ODI Double Centurion • Explosive Powerplay Left-Hand Opener & Gloveman"
      },
      {
        player_id: 'srh_5',
        name: 'Heinrich Klaasen',
        role: 'WK',
        nationality: 'Overseas',
        is_overseas: true,
        price: 23.0,
        Power_Index: 97.0,
        is_retained: true,
        statsSummary: "World's Most Dangerous Spin Destroyer & 200+ SR Middle-Order King"
      },
      {
        player_id: 'srh_6',
        name: 'Nitish Kumar Reddy',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 6.0,
        Power_Index: 88.0,
        is_retained: true,
        statsSummary: "IPL Emerging Player of the Year • Complete Fast-Bowling All-Rounder"
      },
      {
        player_id: 'srh_7',
        name: 'Harshal Patel',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 8.0,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "2x Purple Cap Winner • Master of Dipping Slower Balls & Death Wickets"
      },
      {
        player_id: 'srh_8',
        name: 'Brydon Carse',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 81.0,
        statsSummary: "145 km/h English Hit-the-Deck Pacer with Bouncer Threat"
      },
      {
        player_id: 'srh_9',
        name: 'Jaydev Unadkat',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 1.0,
        Power_Index: 81.0,
        statsSummary: "Experienced Left-Arm Seamer • Variations, Cutters & High Release"
      },
      {
        player_id: 'srh_10',
        name: 'Aniket Verma',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Promising Domestic Middle-Order Batter"
      },
      {
        player_id: 'srh_11',
        name: 'R. Smaran',
        role: 'BAT',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Karnataka Domestic Stroke Player with High Ceiling"
      },
      {
        player_id: 'srh_12',
        name: 'Harsh Dubey',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Vidarbha Left-Arm Spin All-Rounder"
      },
      {
        player_id: 'srh_13',
        name: 'Kamindu Mendis',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 1.0,
        Power_Index: 83.0,
        statsSummary: "Ambidextrous Spinner (Right-arm Off & Left-arm Ortho) & Classy Batter"
      },
      {
        player_id: 'srh_14',
        name: 'Eshan Malinga',
        role: 'BOWL',
        nationality: 'Overseas',
        is_overseas: true,
        price: 0.5,
        Power_Index: 77.0,
        is_uncapped: true,
        statsSummary: "Sri Lankan Slinging Seamer with Sharp In-Dipper"
      },
      {
        player_id: 'srh_15',
        name: 'Zeeshan Ansari',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.4,
        Power_Index: 76.0,
        is_uncapped: true,
        statsSummary: "UP Leg-Spinner with Good Disguise and Drift"
      },
      {
        player_id: 'srh_16',
        name: 'Liam Livingstone',
        role: 'AR',
        nationality: 'Overseas',
        is_overseas: true,
        price: 8.75,
        Power_Index: 89.0,
        is_retained: true,
        statsSummary: "Monster Six-Hitter (117m) & Dual Off/Leg-Spin Variations"
      },
      {
        player_id: 'srh_17',
        name: 'Shivang Kumar',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Domestic Pace All-Rounder"
      },
      {
        player_id: 'srh_18',
        name: 'Krains Fulettra',
        role: 'AR',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 73.0,
        is_uncapped: true,
        statsSummary: "Emerging All-Round Prospect"
      },
      {
        player_id: 'srh_19',
        name: 'Praful Hinge',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 74.0,
        is_uncapped: true,
        statsSummary: "Domestic Fast Bowler with Good Seam Movement"
      },
      {
        player_id: 'srh_20',
        name: 'Sakib Hussain',
        role: 'BOWL',
        nationality: 'Indian',
        is_overseas: false,
        price: 0.3,
        Power_Index: 75.0,
        is_uncapped: true,
        statsSummary: "Bihar 140+ km/h Fast Bowler with Searing Powerplay Length"
      },
    ],
    key2026AuctionNeeds: ["Death Overs Bowling", "Indian Middle-Order Backup"],
    strengths: ["Head & Abhishek World-Record Opening", "Klaasen Spin Carnage", "Cummins Clutch Leadership", "Livingstone Monster Sixes"],
    weaknesses: ["High-risk high-reward approach on turning pitches"]
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
  { name: 'Shreyas Iyer', formerTeam: 'Kolkata Knight Riders', role: 'BAT', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 26.75, reason: 'IPL 2024 Champion Captain. Bought by PBKS for ₹26.75 Cr.', powerIndex: 95.0 },
  { name: 'Cameron Green', formerTeam: 'Royal Challengers Bengaluru', role: 'AR', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 25.2, reason: 'Explosive Aussie All-Rounder. Bought by KKR for ₹25.2 Cr.', powerIndex: 93.0 },
  { name: 'Venkatesh Iyer', formerTeam: 'Kolkata Knight Riders', role: 'AR', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 23.75, reason: 'Finals MVP. Bought by RCB for ₹23.75 Cr.', powerIndex: 91.0 },
  { name: 'Arshdeep Singh', formerTeam: 'Punjab Kings', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 18.0, reason: 'World Cup Winner. Retained via RTM by PBKS for ₹18 Cr.', powerIndex: 93.0 },
  { name: 'Yuzvendra Chahal', formerTeam: 'Rajasthan Royals', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 18.0, reason: 'All-time IPL leading wicket-taker. Bought by PBKS for ₹18 Cr.', powerIndex: 93.0 },
  { name: 'Jos Buttler', formerTeam: 'Rajasthan Royals', role: 'WK', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 15.75, reason: '5x Century Legend. Bought by Gujarat Titans for ₹15.75 Cr.', powerIndex: 95.0 },
  { name: 'KL Rahul', formerTeam: 'Lucknow Super Giants', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 14.0, reason: 'Signed by Delhi Capitals for ₹14 Cr.', powerIndex: 94.0 },
  { name: 'Mohammed Siraj', formerTeam: 'Royal Challengers Bengaluru', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 12.25, reason: 'Miyan Magic. Bought by GT for ₹12.25 Cr.', powerIndex: 91.0 },
  { name: 'Mitchell Starc', formerTeam: 'Kolkata Knight Riders', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 11.75, reason: '2024 Final PoTM. Signed by DC for ₹11.75 Cr.', powerIndex: 93.0 },
  { name: 'Phil Salt', formerTeam: 'Kolkata Knight Riders', role: 'WK', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 11.5, reason: 'Explosive Keeper-Opener. Signed by RCB for ₹11.5 Cr.', powerIndex: 92.0 },
  { name: 'Ishan Kishan', formerTeam: 'Mumbai Indians', role: 'WK', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 11.25, reason: 'Signed by SRH for ₹11.25 Cr.', powerIndex: 90.0 },
  { name: 'Trent Boult', formerTeam: 'Rajasthan Royals', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 12.5, reason: 'Powerplay Inswing Master. Returned to MI for ₹12.5 Cr.', powerIndex: 93.0 },
  { name: 'Mohammed Shami', formerTeam: 'Gujarat Titans', role: 'BOWL', is_overseas: false, basePrice: 2.0, predictedAuctionPrice: 10.0, reason: 'Purple Cap Winner. Signed by LSG for ₹10 Cr.', powerIndex: 93.0 },
  { name: 'Jofra Archer', formerTeam: 'Mumbai Indians', role: 'BOWL', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 12.5, reason: 'Returned to Rajasthan Royals for ₹12.5 Cr.', powerIndex: 93.0 },
  { name: 'David Miller', formerTeam: 'Gujarat Titans', role: 'BAT', is_overseas: true, basePrice: 2.0, predictedAuctionPrice: 7.5, reason: 'Killer Miller. Signed by DC for ₹7.5 Cr.', powerIndex: 88.0 },
  { name: 'Prithvi Shaw', formerTeam: 'Delhi Capitals', role: 'BAT', is_overseas: false, basePrice: 0.75, predictedAuctionPrice: 2.5, reason: 'Aggressive Indian Powerplay Opener seeking resurgence.', powerIndex: 81.0 },
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
  tradedHistory?: Array<{ playerOut: string; playerIn: string; rivalTeam: string }>,
  isScratchMode?: boolean
): DynamicAuctionPlayer[] {
  const pool: DynamicAuctionPlayer[] = []
  const normUserTeam = (userTeamId || 'rcb').toLowerCase()

  // ─── MEGA INCEPTION SCRATCH MODE: ALL PLAYERS EXCEPT THE DRAFTED 3 GO TO MEGA AUCTION ───
  if (isScratchMode) {
    const allDraftedNames = new Set<string>()
    currentCampaignSquad.forEach(p => {
      if (!p.is_released) allDraftedNames.add(p.name.trim().toLowerCase())
    })
    if (rivalTeamsData) {
      Object.values(rivalTeamsData).forEach(r => {
        (r.squad || []).forEach(p => {
          if (!p.is_released) allDraftedNames.add(p.name.trim().toLowerCase())
        })
      })
    }

    const seenNames = new Set<string>()
    let idCounter = 1

    // 1. Add top marquee free agents who were not drafted
    RELEASED_AUCTION_POOL.forEach((mp) => {
      const cleanName = mp.name.trim().toLowerCase()
      if (!allDraftedNames.has(cleanName) && !seenNames.has(cleanName)) {
        seenNames.add(cleanName)
        pool.push({
          id: `scratch_pool_${idCounter++}`,
          name: mp.name,
          role: mp.role,
          nationality: mp.is_overseas ? 'Overseas' : 'Indian',
          is_overseas: mp.is_overseas,
          basePrice: mp.basePrice,
          powerIndex: mp.powerIndex,
          formerTeam: mp.formerTeam,
          statsSummary: mp.reason,
          releaseReason: 'Mega Auction Open Lot'
        })
      }
    })

    // 2. Add all non-drafted players from all 10 franchise rosters
    Object.entries(IPL_FRANCHISES).forEach(([, franchise]) => {
      (franchise.squad2026 || []).forEach((p) => {
        const cleanName = p.name.trim().toLowerCase()
        if (!allDraftedNames.has(cleanName) && !seenNames.has(cleanName)) {
          seenNames.add(cleanName)
          const base = p.price >= 12 ? 2.0 : p.price >= 6 ? 1.5 : p.price >= 2 ? 1.0 : p.price >= 0.5 ? 0.5 : 0.3
          pool.push({
            id: `scratch_pool_${idCounter++}`,
            name: p.name,
            role: p.role,
            nationality: p.nationality,
            is_overseas: p.is_overseas,
            basePrice: base,
            powerIndex: p.Power_Index || 78.0,
            formerTeam: franchise.name,
            statsSummary: p.statsSummary || `${p.name} • ${p.role} (${p.nationality})`,
            releaseReason: 'Mega Auction Open Pool'
          })
        }
      })
    })

    return pool.sort((a, b) => b.powerIndex - a.powerIndex)
  }

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
    'sunil narine', 'cameron green', 'rinku singh', 'varun chakravarthy',
    'heinrich klaasen', 'pat cummins', 'travis head', 'abhishek sharma',
    'sanju samson', 'yashasvi jaiswal', 'riyan parag', 'dhruv jurel',
    'axar patel', 'kuldeep yadav', 'tristan stubbs',
    'nicholas pooran', 'mayank yadav', 'ravi bishnoi',
    'rashid khan', 'sai sudharsan', 'shashank singh', 'prabhsimran singh',
    'rajat patidar', 'matheesha pathirana', 'shivam dube', 'tilak varma',
    'harshit rana', 'ramandeep singh', 'nitish kumar reddy', 'ayush badoni',
    'phil salt', 'venkatesh iyer', 'shreyas iyer', 'rishabh pant',
    'kl rahul', 'jos buttler', 'arshdeep singh', 'yuzvendra chahal', 'mohammed siraj',
    'mitchell starc', 'trent boult', 'mohammed shami', 'jofra archer', 'david miller',
    'ishan kishan', 'marcus stoinis', 'sam curran',
    'liam livingstone', 'quinton de kock', 'anrich nortje', 'kagiso rabada'
  ])

  // Collect active names from ALL rival teams so players currently on team rosters are NOT added to the auction pool!
  const allRivalActiveNames = new Set<string>()
  Object.entries(IPL_FRANCHISES).forEach(([teamKey, franchise]) => {
    if (teamKey === normUserTeam) return
    const rivalSquad = rivalTeamsData?.[teamKey]?.squad?.length
      ? rivalTeamsData[teamKey].squad
      : franchise.squad2026 || []
    rivalSquad.forEach((p: any) => {
      if (!p.is_released) {
        allRivalActiveNames.add(p.name.trim().toLowerCase())
      }
    })
  })

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

    const currentRivalSquad = rivalTeamsData?.[teamKey]?.squad?.length
      ? rivalTeamsData[teamKey].squad
      : franchise.squad2026

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
      .slice(0, 3)

    releaseCandidates.forEach((rp: any, idx: number) => {
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

  // 3. Add Free Agents & International Stars (ONLY if NOT currently in ANY team's active squad or traded)
  RELEASED_AUCTION_POOL.forEach((mp, idx) => {
    const cleanName = mp.name.trim().toLowerCase()
    const isAlreadyInPool = pool.some((p) => p.name.trim().toLowerCase() === cleanName)
    const isInUserSquad = userActiveNames.has(cleanName)
    const isInRivalSquad = allRivalActiveNames.has(cleanName)
    const isTraded = tradedNames.has(cleanName)

    if (!isAlreadyInPool && !isInUserSquad && !isInRivalSquad && !isTraded) {
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
        releaseReason: 'Mega Auction Open Lot'
      })
    }
  })

  return pool.sort((a, b) => b.powerIndex - a.powerIndex)
}
