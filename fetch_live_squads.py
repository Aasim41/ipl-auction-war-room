import requests
import json
import sys
import pandas as pd
from thefuzz import process

API_KEY = "8a974385-7ed5-4355-b573-cc7729801dfa"

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

def fetch_and_map_squads():
    series_id = "87c62aac-bc3c-4738-ab93-19da0690488f" # IPL 2026
    url = f"https://api.cricapi.com/v1/series_squad?apikey={API_KEY}&id={series_id}"
    print("Fetching squads from CricAPI...")
    response = requests.get(url)
    
    if response.status_code != 200:
        return False, f"HTTP Error {response.status_code}"
        
    data = response.json()
    if data.get('status') != 'success':
        return False, f"API Error: {data.get('reason')}"
        
    squads_list = data.get('data', [])
    
    # Load our database
    db_path = 'data/filled_ipl_data.csv'
    db_df = pd.read_csv(db_path)
    db_players = db_df['Player'].tolist()
    
    missing_rows = []
    mapped_squads = []
    
    for team in squads_list:
        team_name = team.get('teamName', '')
        # Try to find acronym from team_name or map directly
        # Example: 'Chennai Super Kings' -> 'CSK'
        team_acronym = None
        for acr, full in TEAM_MAP.items():
            if acr in team_name or full.split('(')[0].strip() in team_name:
                team_acronym = acr
                full_team = full
                break
        
        if not team_acronym:
            print(f"Unknown team: {team_name}")
            continue
            
        players = team.get('players', [])
        for p in players:
            name = p.get('name')
            role_type = p.get('role', 'Batsman')
            
            best_match, score = process.extractOne(name, db_players)
            if score >= 80:
                final_name = best_match
            else:
                final_name = name
                role = 'Batter' if 'Bat' in role_type or 'WK' in role_type else 'Bowler' if 'Bowl' in role_type else 'All-Rounder'
                s_role = 'top order' if 'Bat' in role_type or 'WK' in role_type else 'bowler' if 'Bowl' in role_type else 'all-rounder'
                
                missing_rows.append({
                    'Player': final_name,
                    'Role': role,
                    'Specific_Role': s_role,
                    'Nationality': 'indian',
                    'Bowling_Style': 'right-arm medium',
                    'Auction_Price': 0.5, # Default since API doesn't give price
                    'Power_Index': 400.0,
                    'Batting_SR': 120.0,
                    'Batting_Avg': 20.0,
                    'Bw_WPM': 1.0,
                    'Bowling_Econ': 8.5,
                    'Matches_Played': 0.0,
                    'Age': 24.0
                })
                db_players.append(final_name)
                
        
            mapped_squads.append({
                'Player': final_name,
                'Current_Team': full_team
            })
            
    # Save
    if missing_rows:
        missing_df = pd.DataFrame(missing_rows)
        db_df = pd.concat([db_df, missing_df], ignore_index=True)
        db_df.to_csv(db_path, index=False)
        print(f"Injected {len(missing_rows)} missing players!")
        
    new_squads_df = pd.DataFrame(mapped_squads)
    new_squads_df.to_csv('data/current_squads.csv', index=False)
    print("Mapped API squads to data/current_squads.csv!")
    return True, f"Success! Fetched {len(new_squads_df)} players across {len(squads_list)} teams."

if __name__ == "__main__":
    success, msg = fetch_and_map_squads()
    print(msg)
