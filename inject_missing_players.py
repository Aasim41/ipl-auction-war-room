import pandas as pd
from thefuzz import process

TEAM_MAP = {
    'CSK': 'Chennai Super Kings (CSK)',
    'MI': 'Mumbai Indians (MI)',
    'RCB': 'Royal Challengers Bengaluru (RCB)',
    'KKR': 'Kolkata Knight Riders (KKR)',
    'SRH': 'Sunrisers Hyderabad (SRH)',
    'DC': 'Delhi Capitals (DC)',
    'RR': 'Rajasthan Royals (RR)',
    'PBKS': 'Punjab Kings (PBKS)',
    'GT': 'Gujarat Titans (GT)',
    'LSG': 'Lucknow Super Giants (LSG)'
}

print("Fetching real dataset from GitHub...")
url = 'https://raw.githubusercontent.com/souvik1053/IPL-2025-Mega-Auction-Dataset/main/IPL%202025%20Mega%20Auction%20Dataset/ipl_2025_auction_players.csv'
auction_df = pd.read_csv(url)
auction_df = auction_df[auction_df['Team'] != '-']

db_path = 'data/filled_ipl_data.csv'
db_df = pd.read_csv(db_path)
db_players = db_df['Player'].tolist()

missing_rows = []
mapped_squads = []

print("Identifying and Injecting missing players...")
for _, row in auction_df.iterrows():
    name = str(row['Players']).strip()
    team_acronym = str(row['Team']).strip()
    p_type = str(row['Type']).strip()
    try:
        sold_price = float(row['Sold'])
    except:
        sold_price = 0.5 # default base price if error
    
    best_match, score = process.extractOne(name, db_players)
    
    if score >= 80:
        final_name = best_match
    else:
        # Player missing! Let's inject them into the database
        final_name = name
        role = 'Batter' if p_type in ['BAT', 'WK'] else 'Bowler' if p_type == 'BOWL' else 'All-Rounder'
        s_role = 'top order' if p_type in ['BAT', 'WK'] else 'bowler' if p_type == 'BOWL' else 'all-rounder'
        
        missing_rows.append({
            'Player': final_name,
            'Role': role,
            'Specific_Role': s_role,
            'Nationality': 'indian', # Default
            'Bowling_Style': 'right-arm medium',
            'Auction_Price': sold_price,
            'Power_Index': 400.0,
            'Batting_SR': 120.0 if role != 'Bowler' else 0.0,
            'Batting_Avg': 20.0 if role != 'Bowler' else 0.0,
            'Bw_WPM': 1.0 if role != 'Batter' else 0.0,
            'Bowling_Econ': 8.5 if role != 'Batter' else 0.0,
            'Matches_Played': 0.0,
            'Age': 24.0
        })
        db_players.append(final_name) # Add to current list so we don't duplicate
    
    full_team = TEAM_MAP.get(team_acronym, team_acronym)
    mapped_squads.append({
        'Player': final_name,
        'Current_Team': full_team
    })

# Append new players to DB
if missing_rows:
    missing_df = pd.DataFrame(missing_rows)
    db_df = pd.concat([db_df, missing_df], ignore_index=True)
    db_df.to_csv(db_path, index=False)
    print(f"Injected {len(missing_rows)} missing players into internal database!")

# Save perfect squad mappings
new_squads_df = pd.DataFrame(mapped_squads)
new_squads_df.to_csv('data/current_squads.csv', index=False)
print(f"Successfully generated full {len(new_squads_df)} 2025 player squads!")

print("\nFinal Squad Counts:")
print(new_squads_df['Current_Team'].value_counts())
