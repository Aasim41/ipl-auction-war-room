import pandas as pd
from thefuzz import process

# Map acronyms to full names used in the app
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

# Filter out unsold players
auction_df = auction_df[auction_df['Team'] != '-']

print("Loading internal player database...")
db_df = pd.read_csv('data/filled_ipl_data.csv')
db_players = db_df['Player'].tolist()

mapped_squads = []

print("Matching players...")
for _, row in auction_df.iterrows():
    name = str(row['Players'])
    team_acronym = str(row['Team'])
    
    # Fuzzy match to internal database
    best_match, score = process.extractOne(name, db_players)
    
    if score >= 80:  # Adjust threshold if needed
        full_team = TEAM_MAP.get(team_acronym, team_acronym)
        mapped_squads.append({
            'Player': best_match,
            'Current_Team': full_team
        })

new_squads_df = pd.DataFrame(mapped_squads)
new_squads_df.to_csv('data/current_squads.csv', index=False)

print(f"Successfully saved {len(new_squads_df)} players to data/current_squads.csv!")

# Print a breakdown
print("\nSquad Counts:")
print(new_squads_df['Current_Team'].value_counts())
