import pandas as pd
import json

bat = pd.read_csv('backend/data/temp_archive2/ipl_2026_batting.csv')
bowl = pd.read_csv('backend/data/temp_archive2/ipl_2026_bowling.csv')
sold = pd.read_csv('backend/data/IPL_Auction_2026_Sold_Player.csv')

bat['clean_name'] = bat['player'].astype(str).str.strip()
bowl['clean_name'] = bowl['player'].astype(str).str.strip()
sold['clean_name'] = sold['Name'].astype(str).str.strip()

def get_stats(name):
    b_rows = bat[bat['clean_name'].str.lower() == name.lower()]
    bw_rows = bowl[bowl['clean_name'].str.lower() == name.lower()]

    parts = []
    runs = 0
    sr = 0.0
    wkts = 0
    econ = 0.0

    if not b_rows.empty:
        r = b_rows.iloc[0]
        runs = int(r['runs'])
        avg = float(r['avg']) if pd.notnull(r['avg']) else 0.0
        sr = float(r['sr']) if pd.notnull(r['sr']) else 100.0
        hundreds = int(r['100']) if pd.notnull(r['100']) else 0
        fifties = int(r['50']) if pd.notnull(r['50']) else 0
        if runs > 20:
            s = f"2026: {runs} Runs (Avg {avg:.1f}, SR {sr:.1f})"
            ms = []
            if hundreds > 0: ms.append(f"{hundreds}x100")
            if fifties > 0: ms.append(f"{fifties}x50")
            if ms: s += f" [{', '.join(ms)}]"
            parts.append(s)

    if not bw_rows.empty:
        bw = bw_rows.iloc[0]
        wkts = int(bw['wkts'])
        econ = float(bw['econ']) if pd.notnull(bw['econ']) else 8.5
        bbi = str(bw['bbi']) if pd.notnull(bw['bbi']) else '-'
        if wkts > 0:
            parts.append(f"2026: {wkts} Wkts (Econ {econ:.2f}, BBI {bbi})")

    return " • ".join(parts), runs, sr, wkts, econ

# Franchise definitions
raw_franchises = {
    "rcb": {
        "id": "rcb",
        "name": "Royal Challengers Bengaluru",
        "short": "RCB",
        "color": "#dc2626",
        "emoji": "👑",
        "titles": "Bold Army • 2026 Contenders",
        "totalPurse": 125.0,
        "retainedSpend2026": 106.5,
        "miniAuctionPurse2026": 18.5,
        "stadiumName": "M. Chinnaswamy Stadium",
        "stadiumCity": "Bengaluru",
        "needs": ["Backup Indian Pacer", "Emerging Finisher", "Domestic WK"],
        "strengths": ["Elite top-order: Kohli, Salt, Patidar", "Hazlewood + Bhuvi swing attack", "Dual dynamic keepers"],
        "weaknesses": ["Spin depth relies on Krunal & Suyash"],
        "players": [
            ("Virat Kohli", "BAT", False, 21.0, 96.0, "Captain / Icon • 8000+ IPL Runs • Top Run Scorer"),
            ("Rajat Patidar", "BAT", False, 11.0, 85.0, "Spin Destroyer • Enforcer at #4"),
            ("Phil Salt", "WK", True, 11.5, 91.0, "Powerplay WK Opener • Striking at 180+"),
            ("Jitesh Sharma", "WK", False, 11.0, 84.0, "Indian Finisher & Wicketkeeper"),
            ("Josh Hazlewood", "BOWL", True, 12.5, 93.0, "World #1 Seam Specialist • Relentless Test Line"),
            ("Bhuvneshwar Kumar", "BOWL", False, 10.75, 87.0, "2x Purple Cap Legend • Master of Powerplay Swing"),
            ("Liam Livingstone", "AR", True, 8.75, 88.0, "Monster Six-Hitter & Dual Spin Variations"),
            ("Krunal Pandya", "AR", False, 5.75, 82.0, "Left-Arm Finger Spin & Clutch Lower-Order Runs"),
            ("Yash Dayal", "BOWL", False, 5.0, 78.0, "Left-Arm Swing & Death Slower Balls"),
            ("Rasikh Salam Dar", "BOWL", False, 6.0, 78.0, "Skiddy Seamer with Sharp Change of Pace"),
            ("Tim David", "BAT", True, 3.0, 85.0, "Death Overs Finisher • 180+ Career Strike Rate"),
            ("Suyash Sharma", "BOWL", False, 2.6, 77.0, "Fast-Arm Leg-Spin & Deadly Googly Specialist"),
            ("Jacob Bethell", "AR", True, 2.6, 80.0, "Young English Prodigy • Clean Left-Hand Striker"),
            ("Devdutt Padikkal", "BAT", False, 2.0, 80.0, "Elegant Top-Order Anchor (Homecoming)"),
            ("Nuwan Thushara", "BOWL", True, 1.6, 82.0, "Sling Pacer with Unpickable Toe-Crushers"),
            ("Romario Shepherd", "AR", True, 1.5, 81.0, "Windies Powerhitter & Heavy Seam"),
            ("Lungi Ngidi", "BOWL", True, 1.0, 80.0, "145 km/h South African Hit-the-Deck Pacer"),
            ("Swapnil Singh", "AR", False, 0.5, 74.0, "Accurate Powerplay Left-Arm Spin"),
            ("Venkatesh Iyer", "AR", False, 7.0, 88.0, "All-Round Match Winner • Auction Addition"),
            ("Mangesh Yadav", "BOWL", False, 5.2, 76.0, "Emerging Indian Speedster"),
            ("Jacob Duffy", "BOWL", True, 2.0, 78.0, "Kiwi Swing Bowler • New Ball Threat"),
            ("Jordan Cox", "WK", True, 0.75, 77.0, "English WK Batter • Innovative 360 Striker"),
            ("Vicky Ostwal", "BOWL", False, 0.3, 73.0, "U19 World Cup Left-Arm Orthodox Spinner")
        ]
    },
    "csk": {
        "id": "csk",
        "name": "Chennai Super Kings",
        "short": "CSK",
        "color": "#fbbf24",
        "emoji": "🦁",
        "titles": "5x Champions • Whistle Podu",
        "totalPurse": 125.0,
        "retainedSpend2026": 108.0,
        "miniAuctionPurse2026": 17.0,
        "stadiumName": "M. A. Chidambaram Stadium (Chepauk)",
        "stadiumCity": "Chennai",
        "needs": ["Backup Indian WK", "Express Pacer Backup"],
        "strengths": ["Spin trio: Ashwin, Jadeja, Noor Ahmad", "MS Dhoni clutch tactical finish", "Ruturaj consistency"],
        "weaknesses": ["Pace bowling death options"],
        "players": [
            ("Ruturaj Gaikwad", "BAT", False, 18.0, 90.0, "Captain • Consistent Top-Order Anchor"),
            ("Ravindra Jadeja", "AR", False, 18.0, 92.0, "Elite All-Rounder • Chepauk Spin Master"),
            ("Matheesha Pathirana", "BOWL", True, 13.0, 90.0, "Sling Death Bowling Phenom • 150 km/h"),
            ("Shivam Dube", "AR", False, 12.0, 86.0, "Monster Spin-Hitter in Middle Overs"),
            ("Noor Ahmad", "BOWL", True, 10.0, 88.0, "Left-Arm Afghan Mystery Spinner"),
            ("Ravichandran Ashwin", "AR", False, 9.75, 88.0, "Chepauk Legend • World Class Off-Spin"),
            ("Devon Conway", "BAT", True, 6.25, 86.0, "Kiwi Anchor with High Chepauk Average"),
            ("Khaleel Ahmed", "BOWL", False, 4.8, 83.0, "Left-Arm Powerplay & Death Seamer"),
            ("Rachin Ravindra", "AR", True, 4.0, 85.0, "Kiwi All-Rounder • Clean Striker"),
            ("MS Dhoni", "WK", False, 4.0, 85.0, "5x Champion Captain • Lightning Quick Gloves"),
            ("Rahul Tripathi", "BAT", False, 3.4, 80.0, "Aggressive #3 Intent Batter"),
            ("Anshul Kamboj", "BOWL", False, 3.4, 78.0, "Emerging Indian Pace Prodigy"),
            ("Sam Curran", "AR", True, 2.4, 84.0, "Left-Arm Seam All-Rounder (Homecoming)"),
            ("Nathan Ellis", "BOWL", True, 2.0, 82.0, "Aussie Yorker & Cutter Specialist"),
            ("Deepak Hooda", "AR", False, 1.7, 78.0, "Off-Spin All-Rounder"),
            ("Jamie Overton", "AR", True, 1.5, 80.0, "145 km/h English Pace All-Rounder"),
            ("Vijay Shankar", "AR", False, 1.2, 76.0, "Medium Pace All-Rounder"),
            ("Mukesh Choudhary", "BOWL", False, 0.3, 75.0, "Left-Arm Powerplay Swing Seamer"),
            ("Kartik Sharma", "WK", False, 14.2, 85.0, "Sensational Indian Keeper-Batter • ₹14.2 Cr Signee"),
            ("Prashant Veer", "AR", False, 14.2, 84.0, "Elite Emerging All-Rounder • ₹14.2 Cr Signee"),
            ("Rahul Chahar", "BOWL", False, 5.2, 82.0, "Attacking Leg-Spinner • High Revs"),
            ("Matt Henry", "BOWL", True, 2.0, 82.0, "Kiwi Speedster • Relentless Test Seam"),
            ("Akeal Hosein", "BOWL", True, 2.0, 81.0, "Caribbean Powerplay Left-Arm Spin")
        ]
    },
    "mi": {
        "id": "mi",
        "name": "Mumbai Indians",
        "short": "MI",
        "color": "#2563eb",
        "emoji": "🏏",
        "titles": "5x Champions • One Family",
        "totalPurse": 125.0,
        "retainedSpend2026": 107.0,
        "miniAuctionPurse2026": 18.0,
        "stadiumName": "Wankhede Stadium",
        "stadiumCity": "Mumbai",
        "needs": ["Backup Indian Middle Order", "Specialist Leg Spinner"],
        "strengths": ["Unmatched Indian core (Rohit, Surya, Hardik, Bumrah, Tilak)", "Bumrah + Boult opening/death pace"],
        "weaknesses": ["Spin depth on spinning pitches"],
        "players": [
            ("Jasprit Bumrah", "BOWL", False, 18.0, 99.0, "World #1 Pacer • Unplayable Yorker Machine"),
            ("Suryakumar Yadav", "BAT", False, 16.35, 96.0, "World T20 #1 • 360-Degree Boundary King"),
            ("Hardik Pandya", "AR", False, 16.35, 91.0, "Captain • Match-Winning Pace All-Rounder"),
            ("Rohit Sharma", "BAT", False, 16.3, 92.0, "5x Trophy Captain • Destructive Opener"),
            ("Trent Boult", "BOWL", True, 12.5, 92.0, "Lethal Inswinging Powerplay Spearhead"),
            ("Deepak Chahar", "BOWL", False, 9.25, 84.0, "High-Class Powerplay Swing Specialist"),
            ("Tilak Varma", "BAT", False, 8.0, 86.0, "Young Left-Hand Dynamo • Proven Finisher"),
            ("Will Jacks", "AR", True, 5.25, 87.0, "Explosive Opener / #3 • 41-Ball IPL Century"),
            ("Naman Dhir", "AR", False, 5.25, 79.0, "Hard-Hitting Young Indian Finisher"),
            ("Allah Ghazanfar", "BOWL", True, 4.8, 83.0, "Teenage Afghan Mystery Off-Spin Sensation"),
            ("Mitchell Santner", "AR", True, 2.0, 85.0, "World Cup Winner • Ultra-Economical Left-Arm Spin"),
            ("Ryan Rickelton", "WK", True, 1.0, 81.0, "South African Explosive WK-Opener"),
            ("Reece Topley", "BOWL", True, 0.75, 81.0, "6ft 7in Left-Arm English Fast Bowler"),
            ("Robin Minz", "WK", False, 0.65, 75.0, "Left-Hand Tribal Indian Powerhitter / WK"),
            ("Karn Sharma", "BOWL", False, 0.5, 76.0, "Veteran Leg-Spinner • Clutch Wickets"),
            ("Raj Angad Bawa", "AR", False, 0.3, 73.0, "U19 World Cup Final Hero All-Rounder"),
            ("Lizaad Williams", "BOWL", True, 0.75, 79.0, "145 km/h South African Pacer"),
            ("Quinton De Kock", "WK", True, 1.0, 88.0, "World Class WK-Opener (Homecoming)"),
            ("Mayank Rawat", "AR", False, 0.3, 73.0, "Dynamic Domestic Striker"),
            ("Atharva Ankolekar", "AR", False, 0.3, 74.0, "Left-Arm Orthodox Spinner & Bat"),
            ("Mohammad Izhar", "BOWL", False, 0.3, 72.0, "Young Indian Seam Talent"),
            ("Danish Malewar", "BAT", False, 0.3, 73.0, "Promising Domestic Middle Order")
        ]
    },
    "kkr": {
        "id": "kkr",
        "name": "Kolkata Knight Riders",
        "short": "KKR",
        "color": "#7c3aed",
        "emoji": "⚔️",
        "titles": "3x Champions • Defending Champions",
        "totalPurse": 125.0,
        "retainedSpend2026": 110.0,
        "miniAuctionPurse2026": 15.0,
        "stadiumName": "Eden Gardens",
        "stadiumCity": "Kolkata",
        "needs": ["Designated Captain", "Indian Spin Depth"],
        "strengths": ["All-Rounders: Russell, Narine, Green, Ramandeep", "Mystery spin at Eden Gardens"],
        "weaknesses": ["Death bowling consistency"],
        "players": [
            ("Cameron Green", "AR", True, 25.2, 93.0, "Record Auction Signee • Explosive Top-Order & Pace"),
            ("Matheesha Pathirana", "BOWL", True, 18.0, 91.0, "150 km/h Sling Death Bowler • Mega Signee"),
            ("Rinku Singh", "BAT", False, 13.0, 88.0, "Ice-Cool Finisher • India T20 Specialist"),
            ("Varun Chakaravarthy", "BOWL", False, 12.0, 90.0, "Mystery Spin Spearhead • Top Wicket-Taker"),
            ("Sunil Narine", "AR", True, 12.0, 94.0, "2024 MVP • Explosive Opener & Economical Spin"),
            ("Andre Russell", "AR", True, 12.0, 93.0, "Ultimate Powerhit Enforcer & Death Slower Balls"),
            ("Mustafizur Rahman", "BOWL", True, 9.2, 86.0, "The Fizz • Master of Cutters & Slower Yorkers"),
            ("Anrich Nortje", "BOWL", True, 6.5, 88.0, "155 km/h Express South African Thunderbolt"),
            ("Harshit Rana", "BOWL", False, 4.0, 80.0, "Fast Bouncer & Sharp Change of Pace"),
            ("Ramandeep Singh", "AR", False, 4.0, 78.0, "Dynamic Lower-Order Striker & Gun Fielder"),
            ("Tejasvi Singh", "BAT", False, 3.0, 76.0, "Talented Indian Stroke-Maker"),
            ("Angkrish Raghuvanshi", "BAT", False, 3.0, 80.0, "Fearless Young #3 Batsman"),
            ("Spencer Johnson", "BOWL", True, 2.8, 81.0, "Tall Aussie Left-Arm Express Seamer"),
            ("Finn Allen", "WK", True, 2.0, 84.0, "Kiwi Powerplay Demolisher • 200+ SR"),
            ("Rahmanullah Gurbaz", "WK", True, 2.0, 82.0, "Aggressive Afghan Opener / Keeper"),
            ("Moeen Ali", "AR", True, 2.0, 82.0, "World Cup Winner • Off-Spin & Attacking Bat"),
            ("Vaibhav Arora", "BOWL", False, 1.8, 79.0, "Inswinging New Ball Specialist"),
            ("Tim Seifert", "WK", True, 1.5, 80.0, "Kiwi 360 WK Batter"),
            ("Ajinkya Rahane", "BAT", False, 1.5, 80.0, "Experienced Top-Order Anchor"),
            ("Rovman Powell", "BAT", True, 1.5, 82.0, "Windies T20 Captain • Monster Sixes"),
            ("Akash Deep", "BOWL", False, 1.0, 81.0, "India Test Fast Bowler"),
            ("Umran Malik", "BOWL", False, 0.75, 79.0, "157 km/h Speed Demon"),
            ("Kartik Tyagi", "BOWL", False, 0.3, 76.0, "Fast Indian Seamer • Yorker Ability")
        ]
    },
    "srh": {
        "id": "srh",
        "name": "Sunrisers Hyderabad",
        "short": "SRH",
        "color": "#ea580c",
        "emoji": "🌅",
        "titles": "2x Champions • Orange Army",
        "totalPurse": 125.0,
        "retainedSpend2026": 112.0,
        "miniAuctionPurse2026": 13.0,
        "stadiumName": "Rajiv Gandhi International Cricket Stadium",
        "stadiumCity": "Hyderabad",
        "needs": ["Backup Indian Middle Order", "Death Over Discipline"],
        "strengths": ["Historic top order: Head, Abhishek, Ishan, Klaasen", "Pat Cummins world-class leadership"],
        "weaknesses": ["Hyper-aggressive approach on turning surfaces"],
        "players": [
            ("Heinrich Klaasen", "WK", True, 23.0, 97.0, "World #1 Spin Finisher • 200+ SR in Middle Overs"),
            ("Pat Cummins", "BOWL", True, 18.0, 92.0, "Captain & Leader • Clutch Champion"),
            ("Travis Head", "BAT", True, 14.0, 94.0, "Powerplay Monster • 200+ Career IPL SR"),
            ("Abhishek Sharma", "AR", False, 14.0, 89.0, "Sensational Opener • Record Six-Hitter"),
            ("Liam Livingstone", "AR", True, 13.0, 89.0, "Huge Six-Machine • ₹13 Cr Mega Buy"),
            ("Ishan Kishan", "WK", False, 11.25, 89.0, "Dynamic Indian Keeper-Opener"),
            ("Mohammed Shami", "BOWL", False, 10.0, 91.0, "World Cup Leading Wicket-Taker • Seam Master"),
            ("Harshal Patel", "BOWL", False, 8.0, 86.0, "Purple Cap Winner • Dipping Slower Ball Genius"),
            ("Nitish Kumar Reddy", "AR", False, 6.0, 82.0, "India Emerging Pace All-Rounder"),
            ("Jack Edwards", "AR", True, 3.0, 78.0, "Aussie Pace All-Rounder"),
            ("Abhinav Manohar", "BAT", False, 3.2, 79.0, "Clean Indian Finisher"),
            ("Rahul Chahar", "BOWL", False, 3.2, 81.0, "Attacking Leg-Spinner"),
            ("Adam Zampa", "BOWL", True, 2.4, 88.0, "World Cup Winner • Elite T20 Leg-Spinner"),
            ("Salil Arora", "WK", False, 1.5, 75.0, "Promising Domestic WK-Batter"),
            ("Simarjeet Singh", "BOWL", False, 1.5, 78.0, "145 km/h Hit-the-Deck Pacer"),
            ("Brydon Carse", "AR", True, 1.0, 79.0, "Express English Pacer & Lower-Order Hitter"),
            ("Jaydev Unadkat", "BOWL", False, 1.0, 76.0, "Left-Arm Cutter Specialist"),
            ("Shivam Mavi", "BOWL", False, 0.75, 77.0, "Fast Indian Seamer with Swing"),
            ("Kamindu Mendis", "AR", True, 0.75, 80.0, "Ambidextrous Spinner & Bat"),
            ("Atharva Taide", "BAT", False, 0.3, 74.0, "Attacking Top-Order Lefty"),
            ("Sakib Hussain", "BOWL", False, 0.3, 72.0, "Young Indian Pacer"),
            ("Eshan Malinga", "BOWL", True, 1.2, 76.0, "Sling Pacer from Sri Lanka")
        ]
    },
    "rr": {
        "id": "rr",
        "name": "Rajasthan Royals",
        "short": "RR",
        "color": "#db2777",
        "emoji": "💎",
        "titles": "Inaugural Champions • Halla Bol",
        "totalPurse": 125.0,
        "retainedSpend2026": 112.0,
        "miniAuctionPurse2026": 13.0,
        "stadiumName": "Sawai Mansingh Stadium",
        "stadiumCity": "Jaipur",
        "needs": ["Pace All-Rounder Backup", "Domestic Spin Backup"],
        "strengths": ["Archer pace + Bishnoi/Theekshana spin", "Samson, Jaiswal top order"],
        "weaknesses": ["Lower-order depth"],
        "players": [
            ("Sanju Samson", "WK", False, 18.0, 91.0, "Captain & Wicketkeeper • T20 Ton Machine"),
            ("Yashasvi Jaiswal", "BAT", False, 18.0, 94.0, "World Class Super-Opener"),
            ("Riyan Parag", "AR", False, 14.0, 86.0, "#4 Middle Order Enforcer"),
            ("Dhruv Jurel", "WK", False, 14.0, 83.0, "Ice-Cool Finisher & Wicketkeeper"),
            ("Jofra Archer", "BOWL", True, 12.5, 93.0, "150 km/h Express Strike Bowler"),
            ("Shimron Hetmyer", "BAT", True, 11.0, 84.0, "Death Overs Power Finisher"),
            ("Ravi Bishnoi", "BOWL", False, 7.2, 88.0, "Googly Master • ₹7.2 Cr Mega Auction Buy"),
            ("Tushar Deshpande", "BOWL", False, 6.5, 81.0, "Wicket-Taking Indian Seamer"),
            ("Wanindu Hasaranga", "AR", True, 5.25, 89.0, "World #1 Sri Lankan Leg-Spinner & Finisher"),
            ("Maheesh Theekshana", "BOWL", True, 4.4, 86.0, "Mystery Carrom Ball Specialist"),
            ("Nitish Rana", "BAT", False, 4.2, 82.0, "Aggressive Middle Order Left-Hander"),
            ("Sandeep Sharma", "BOWL", False, 4.0, 80.0, "Knuckle Ball & Yorker Genius"),
            ("Adam Milne", "BOWL", True, 2.4, 82.0, "150 km/h Kiwi Thunderbolt"),
            ("Fazalhaq Farooqi", "BOWL", True, 2.0, 83.0, "Afghan Left-Arm Inswing Seamer"),
            ("Kwena Maphaka", "BOWL", True, 1.5, 79.0, "148 km/h Young South African Pacer"),
            ("Akash Madhwal", "BOWL", False, 1.2, 78.0, "Accurate Yorker Specialist"),
            ("Vaibhav Sooryavanshi", "BAT", False, 1.1, 86.0, "Youngest IPL Prodigy • 237.3 SR Sensation"),
            ("Ravi Singh", "BAT", False, 0.95, 75.0, "Clean Striking Domestic Batter"),
            ("Sushant Mishra", "BOWL", False, 0.9, 75.0, "Left-Arm Indian Fast Bowler"),
            ("Shubham Dubey", "BAT", False, 0.8, 74.0, "Hard-Hitting Finisher"),
            ("Kuldeep Sen", "BOWL", False, 0.75, 77.0, "145 km/h Express Indian Seamer"),
            ("Kumar Kushagra", "WK", False, 0.65, 74.0, "Young Backup Wicketkeeper")
        ]
    },
    "dc": {
        "id": "dc",
        "name": "Delhi Capitals",
        "short": "DC",
        "color": "#0284c7",
        "emoji": "🦅",
        "titles": "Roar Macha • Rebuilt 2026",
        "totalPurse": 125.0,
        "retainedSpend2026": 111.0,
        "miniAuctionPurse2026": 14.0,
        "stadiumName": "Arun Jaitley Stadium",
        "stadiumCity": "New Delhi",
        "needs": ["Backup Indian Spinners", "Domestic Finisher"],
        "strengths": ["Starc + Natarajan + Mukesh pace bowling", "KL Rahul + Fraser-McGurk explosive opening"],
        "weaknesses": ["Small boundary defense at Kotla"],
        "players": [
            ("Axar Patel", "AR", False, 16.5, 90.0, "Vice Captain • World Class All-Rounder"),
            ("KL Rahul", "WK", False, 14.0, 93.0, "Captain / Opener • 4500+ IPL Runs • Elite Leader"),
            ("Kuldeep Yadav", "BOWL", False, 13.25, 91.0, "World Class Left-Arm Wrist Spinner"),
            ("Mitchell Starc", "BOWL", True, 11.75, 93.0, "IPL Final PoTM • Left-Arm Fire"),
            ("T Natarajan", "BOWL", False, 10.75, 87.0, "Yorker King • Elite Death Specialist"),
            ("Tristan Stubbs", "BAT", True, 10.0, 88.0, "360-Degree Finisher • Huge Impact"),
            ("Jake Fraser-McGurk", "BAT", True, 9.0, 92.0, "Powerplay Demolisher • 234 Career SR"),
            ("Auqib Dar", "BOWL", False, 8.4, 79.0, "Sensational J&K Pacer • ₹8.4 Cr Buy"),
            ("Mukesh Kumar", "BOWL", False, 8.0, 82.0, "Accurate Seam Bowler • India Regular"),
            ("Harry Brook", "BAT", True, 6.25, 86.0, "English Explosive Middle Order Batter"),
            ("Abishek Porel", "WK", False, 4.0, 78.0, "Dynamic Opener / Keeper"),
            ("Pathum Nissanka", "BAT", True, 4.0, 83.0, "Sri Lankan Top-Order Stroke Maker"),
            ("Ashutosh Sharma", "BAT", False, 3.8, 81.0, "High-Impact Indian Death Over Finisher"),
            ("Mohit Sharma", "BOWL", False, 2.2, 80.0, "Knuckle Ball & Back of Hand Specialist"),
            ("Kyle Jamieson", "AR", True, 2.0, 80.0, "6ft 8in Tall Kiwi Fast Bowler"),
            ("Ben Duckett", "BAT", True, 2.0, 82.0, "English Bazball Lefty • Sweep Master"),
            ("David Miller", "BAT", True, 2.0, 87.0, "Killer Miller • Clutch Finisher"),
            ("Faf du Plessis", "BAT", True, 2.0, 85.0, "Veteran Leader & Explosive Opener"),
            ("Sameer Rizvi", "BAT", False, 0.95, 76.0, "Spin-Hitting Prodigy"),
            ("Prithvi Shaw", "BAT", False, 0.75, 80.0, "Explosive Indian Powerplay Opener"),
            ("Dushmantha Chameera", "BOWL", True, 0.75, 79.0, "Sri Lankan Express Pacer"),
            ("Karun Nair", "BAT", False, 0.5, 76.0, "Classical Indian Stroke Player"),
            ("Sahil Parakh", "BAT", False, 0.3, 73.0, "Young Indian U19 Top-Order Batter")
        ]
    },
    "pbks": {
        "id": "pbks",
        "name": "Punjab Kings",
        "short": "PBKS",
        "color": "#b91c1c",
        "emoji": "🗡️",
        "titles": "Sadda Punjab • Ricky Ponting Era",
        "totalPurse": 125.0,
        "retainedSpend2026": 114.0,
        "miniAuctionPurse2026": 11.0,
        "stadiumName": "Maharaja Yadavindra Singh Stadium",
        "stadiumCity": "Mullanpur / Mohali",
        "needs": ["Backup Indian Opener", "Pace Depth"],
        "strengths": ["Shreyas Iyer captaincy + Ricky Ponting master coaching", "Arshdeep + Chahal + Lockie bowling balance"],
        "weaknesses": ["Purse headroom in auction"],
        "players": [
            ("Shreyas Iyer", "BAT", False, 26.75, 94.0, "Captain • 2024 Champion Leader • ₹26.75 Cr"),
            ("Arshdeep Singh", "BOWL", False, 18.0, 92.0, "T20 World Cup Leading Wicket-Taker • Death King"),
            ("Yuzvendra Chahal", "BOWL", False, 18.0, 92.0, "All-Time IPL Wicket Leader (205 Wkts)"),
            ("Marcus Stoinis", "AR", True, 11.0, 88.0, "The Hulk • Match-Winning Middle Order All-Rounder"),
            ("Marco Jansen", "AR", True, 7.0, 86.0, "Tall South African Left-Arm Pacer & Powerhitter"),
            ("Shashank Singh", "BAT", False, 5.5, 80.0, "Sensational Finisher • 185+ SR"),
            ("Ben Dwarshuis", "BOWL", True, 4.4, 81.0, "Aussie Left-Arm Seamer • BBL Star"),
            ("Glenn Maxwell", "AR", True, 4.2, 88.0, "The Big Show (Homecoming) • Match-Winner"),
            ("Nehal Wadhera", "BAT", False, 4.2, 81.0, "Clean Striking Left-Hander"),
            ("Prabhsimran Singh", "WK", False, 4.0, 78.0, "Aggressive Powerplay Opener"),
            ("Priyansh Arya", "BAT", False, 3.8, 79.0, "Delhi Sensation • 6 Sixes in an Over"),
            ("Cooper Connolly", "AR", True, 3.0, 78.0, "Aussie Emerging All-Rounder"),
            ("Josh Inglis", "WK", True, 2.6, 84.0, "Aussie T20 Keeper-Batter"),
            ("Azmatullah Omarzai", "AR", True, 2.4, 82.0, "Afghan Seam All-Rounder"),
            ("Lockie Ferguson", "BOWL", True, 2.0, 84.0, "150 km/h Kiwi Thunderbolt"),
            ("Vijaykumar Vyshak", "BOWL", False, 1.8, 78.0, "Knuckle Ball & Bouncer Seamer"),
            ("Harpreet Brar", "AR", False, 1.5, 80.0, "Accurate Left-Arm Finger Spinner"),
            ("Aaron Hardie", "AR", True, 1.25, 78.0, "Aussie Pace All-Rounder"),
            ("Kuldeep Sen", "BOWL", False, 0.8, 76.0, "145 km/h Express Indian Seamer"),
            ("Pravin Dubey", "BOWL", False, 0.3, 74.0, "Tall Domestic Leg-Spinner"),
            ("Vishal Nishad", "BAT", False, 0.3, 72.0, "Young Domestic Talent")
        ]
    },
    "lsg": {
        "id": "lsg",
        "name": "Lucknow Super Giants",
        "short": "LSG",
        "color": "#0891b2",
        "emoji": "🐘",
        "titles": "Adab Se • Mega Powerhouse",
        "totalPurse": 125.0,
        "retainedSpend2026": 113.0,
        "miniAuctionPurse2026": 12.0,
        "stadiumName": "BRSABV Ekana Cricket Stadium",
        "stadiumCity": "Lucknow",
        "needs": ["Backup Indian Opener", "Spin Depth"],
        "strengths": ["Pant + Pooran + Miller middle order demolition squad", "Express pace in Mayank Yadav + Mohsin"],
        "weaknesses": ["Top-order opening stability"],
        "players": [
            ("Rishabh Pant", "WK", False, 27.0, 97.0, "Captain • Record ₹27 Cr Signee • Game Changer"),
            ("Nicholas Pooran", "WK", True, 21.0, 94.0, "Vice Captain • Most Dangerous Six-Hitter"),
            ("Ravi Bishnoi", "BOWL", False, 11.0, 87.0, "Googly Master • Tight Middle Overs"),
            ("Mayank Yadav", "BOWL", False, 11.0, 88.0, "156.7 km/h Thunderbolt • Extreme Pace"),
            ("Avesh Khan", "BOWL", False, 9.75, 85.0, "Death Overs Specialist (Homecoming)"),
            ("Josh Inglis", "WK", True, 8.6, 85.0, "Aussie Keeper-Batter • ₹8.6 Cr Buy"),
            ("Akash Deep", "BOWL", False, 8.0, 83.0, "Indian Test Pacer • High Seam"),
            ("David Miller", "BAT", True, 7.5, 87.0, "Killer Miller • Clutch Finisher"),
            ("Mohsin Khan", "BOWL", False, 4.0, 80.0, "Tall Left-Arm Pacer • Sharp Bounce"),
            ("Abdul Samad", "BAT", False, 4.2, 79.0, "Power Finisher from J&K"),
            ("Ayush Badoni", "BAT", False, 4.0, 78.0, "Finisher & Spin Hitter"),
            ("Mitchell Marsh", "AR", True, 3.4, 86.0, "Aussie T20 Captain • Heavy Ball & Powerhit"),
            ("Shahbaz Ahmed", "AR", False, 2.4, 79.0, "Tactical Left-Arm Spinner & Batter"),
            ("Mukul Choudhary", "BAT", False, 2.6, 75.0, "Promising Indian Batter"),
            ("Akshat Raghuwanshi", "BAT", False, 2.2, 75.0, "Aggressive Middle-Order Hitter"),
            ("Aiden Markram", "BAT", True, 2.0, 84.0, "Proteas T20 Captain • Clean Class"),
            ("Wanindu Hasaranga", "AR", True, 2.0, 88.0, "Sri Lankan Spin Wizard"),
            ("Naman Tiwari", "BOWL", False, 1.0, 76.0, "U19 World Cup Left-Arm Pacer"),
            ("Shamar Joseph", "BOWL", True, 0.75, 81.0, "150 km/h Gabba Hero"),
            ("Matthew Breetzke", "BAT", True, 0.75, 78.0, "South African Top-Order Striker"),
            ("M Siddharth", "BOWL", False, 0.75, 76.0, "Accurate Arm-Ball Spinner"),
            ("Rajvardhan Hangargekar", "AR", False, 0.3, 74.0, "Pace All-Rounder")
        ]
    },
    "gt": {
        "id": "gt",
        "name": "Gujarat Titans",
        "short": "GT",
        "color": "#0d9488",
        "emoji": "🛡️",
        "titles": "2022 Champions • Aava De",
        "totalPurse": 125.0,
        "retainedSpend2026": 112.0,
        "miniAuctionPurse2026": 13.0,
        "stadiumName": "Narendra Modi Stadium",
        "stadiumCity": "Ahmedabad",
        "needs": ["Backup Indian Middle Order", "Wicket-Keeper Backup"],
        "strengths": ["Dream opening pair: Jos Buttler & Shubman Gill", "Rabada, Siraj, Prasidh, Rashid bowling arsenal"],
        "weaknesses": ["Lower-order finish if Tewatia fails"],
        "players": [
            ("Rashid Khan", "AR", True, 18.0, 96.0, "World #1 T20 Spinner & Finisher • 21 Wkts"),
            ("Shubman Gill", "BAT", False, 16.5, 94.0, "Captain • 2026 Top Scorer: 732 Runs (Avg 45.8)"),
            ("Jos Buttler", "WK", True, 15.75, 95.0, "Superstar Keeper-Opener • 5x IPL Centuries"),
            ("Mohammed Siraj", "BOWL", False, 12.25, 89.0, "Miyan Magic • Powerplay Inswing Master"),
            ("Kagiso Rabada", "BOWL", True, 10.75, 90.0, "Purple Cap Winner • 148 km/h Strike Bowler"),
            ("Prasidh Krishna", "BOWL", False, 9.5, 85.0, "Tall Hit-the-Deck Express Pacer"),
            ("Sai Sudharsan", "BAT", False, 8.5, 88.0, "2026 Hero: 722 Runs (Avg 48.1, 8x50)"),
            ("Jason Holder", "AR", True, 7.0, 83.0, "Tall Caribbean All-Rounder • Heavy Bounce"),
            ("Rahul Tewatia", "AR", False, 4.0, 80.0, "Ice Finisher • Clutch Boundary Striker"),
            ("Shahrukh Khan", "AR", False, 4.0, 78.0, "Power Finisher from Tamil Nadu"),
            ("Washington Sundar", "AR", False, 3.2, 82.0, "Powerplay Miserly Off-Spinner"),
            ("Sherfane Rutherford", "BAT", True, 2.6, 82.0, "Windies Six-Hitting Specialist"),
            ("Gerald Coetzee", "BOWL", True, 2.4, 85.0, "150 km/h South African Express Pacer"),
            ("Tom Banton", "WK", True, 2.0, 81.0, "English Innovative 360 WK-Batter"),
            ("Glenn Phillips", "AR", True, 2.0, 84.0, "World Class Fielder & Dynamic Hitter"),
            ("Sai Kishore", "BOWL", False, 2.0, 81.0, "Economical Left-Arm Finger Spinner"),
            ("Mahipal Lomror", "AR", False, 1.7, 78.0, "Spin-Hitting Middle-Order Left-Hander"),
            ("Gurnoor Brar", "BOWL", False, 1.3, 75.0, "Tall 6ft 5in Punjab Pacer"),
            ("Ashok Sharma", "BOWL", False, 0.9, 74.0, "Young Indian Pacer"),
            ("Ishant Sharma", "BOWL", False, 0.75, 77.0, "Veteran 100-Test Indian Pacer"),
            ("Luke Wood", "BOWL", True, 0.75, 78.0, "English Left-Arm Swing Seamer"),
            ("Prithviraj Yarra", "BOWL", False, 0.3, 73.0, "Domestic Left-Arm Seamer")
        ]
    }
}

# Now generate TypeScript code
ts_lines = [
    "export interface IPLPlayer {",
    "  player_id: string",
    "  name: string",
    "  role: 'BAT' | 'BOWL' | 'AR' | 'WK'",
    "  nationality: 'Indian' | 'Overseas'",
    "  is_overseas: boolean",
    "  price: number // in Crores",
    "  Power_Index: number",
    "  is_retained?: boolean",
    "  is_uncapped?: boolean",
    "  statsSummary?: string",
    "}",
    "",
    "export interface ReleasedPlayer {",
    "  name: string",
    "  formerTeam: string",
    "  role: 'BAT' | 'BOWL' | 'AR' | 'WK'",
    "  is_overseas: boolean",
    "  basePrice: number",
    "  predictedAuctionPrice: number",
    "  reason: string",
    "  powerIndex: number",
    "}",
    "",
    "export interface FranchiseData {",
    "  id: string",
    "  name: string",
    "  short: string",
    "  color: string",
    "  emoji: string",
    "  titles: string",
    "  totalPurse: number",
    "  retainedSpend2026: number",
    "  miniAuctionPurse2026: number",
    "  stadiumName: string",
    "  stadiumCity: string",
    "  squad2026: IPLPlayer[]",
    "  key2026AuctionNeeds: string[]",
    "  strengths: string[]",
    "  weaknesses: string[]",
    "}",
    "",
    "export const IPL_FRANCHISES: Record<string, FranchiseData> = {"
]

for team_key, f in raw_franchises.items():
    ts_lines.append(f"  {team_key}: {{")
    ts_lines.append(f"    id: '{f['id']}',")
    ts_lines.append(f"    name: '{f['name']}',")
    ts_lines.append(f"    short: '{f['short']}',")
    ts_lines.append(f"    color: '{f['color']}',")
    ts_lines.append(f"    emoji: '{f['emoji']}',")
    ts_lines.append(f"    titles: '{f['titles']}',")
    ts_lines.append(f"    totalPurse: {f['totalPurse']:.1f},")
    ts_lines.append(f"    retainedSpend2026: {f['retainedSpend2026']:.1f},")
    ts_lines.append(f"    miniAuctionPurse2026: {f['miniAuctionPurse2026']:.1f},")
    ts_lines.append(f"    stadiumName: '{f['stadiumName']}',")
    ts_lines.append(f"    stadiumCity: '{f['stadiumCity']}',")
    ts_lines.append("    squad2026: [")

    for i, (name, role, is_os, price, power, custom_text) in enumerate(f['players']):
        stats_text, r, sr, w, ec = get_stats(name)
        full_summary = f"{custom_text}"
        if stats_text:
            full_summary += f" • {stats_text}"

        player_id = f"{team_key}_{i+1}"
        nat = 'Overseas' if is_os else 'Indian'
        is_uncapped = "true" if price <= 4.0 and not is_os and power < 80 else "false"

        ts_lines.append("      {")
        ts_lines.append(f"        player_id: '{player_id}',")
        ts_lines.append(f"        name: {json.dumps(name)},")
        ts_lines.append(f"        role: '{role}',")
        ts_lines.append(f"        nationality: '{nat}',")
        ts_lines.append(f"        is_overseas: {'true' if is_os else 'false'},")
        ts_lines.append(f"        price: {price:.2f},")
        ts_lines.append(f"        Power_Index: {power:.1f},")
        ts_lines.append(f"        is_retained: true,")
        if is_uncapped == "true":
            ts_lines.append("        is_uncapped: true,")
        ts_lines.append(f"        statsSummary: {json.dumps(full_summary)}")
        ts_lines.append("      },")

    ts_lines.append("    ],")
    ts_lines.append(f"    key2026AuctionNeeds: {json.dumps(f['needs'])},")
    ts_lines.append(f"    strengths: {json.dumps(f['strengths'])},")
    ts_lines.append(f"    weaknesses: {json.dumps(f['weaknesses'])}")
    ts_lines.append("  },")

ts_lines.append("}")
ts_lines.append("")
ts_lines.append("// ─── Helper function to get Franchise ───")
ts_lines.append("export function getFranchise(teamId: string): FranchiseData {")
ts_lines.append("  const normalized = (teamId || 'rcb').toLowerCase()")
ts_lines.append("  return IPL_FRANCHISES[normalized] || IPL_FRANCHISES.rcb")
ts_lines.append("}")

with open('frontend/src/data/franchises.ts', 'w', encoding='utf-8') as f:
    f.write("\n".join(ts_lines) + "\n")

print(f"Generated franchises.ts successfully with {len(raw_franchises)} teams!")
