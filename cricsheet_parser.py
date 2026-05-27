import os
import glob
import collections
import pandas as pd
import json

def parse_cricsheet():
    tallies = collections.defaultdict(int)
    
    # Iterate all info csvs
    info_files = glob.glob('cricsheet/*_info.csv')
    print(f"Parsing {len(info_files)} matches...")
    
    for file in info_files:
        with open(file, 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split(',')
                # info,player,Team,PlayerName
                if len(parts) >= 4 and parts[1] == 'player':
                    player_name = parts[3]
                    tallies[player_name] += 1
                    
    # Sort and print top 10 to see format
    sorted_tallies = sorted(tallies.items(), key=lambda x: x[1], reverse=True)
    print("Top 10 players in Cricsheet:")
    for name, count in sorted_tallies[:10]:
        print(f"{name}: {count}")
        
    # Map to our CSV
    df = pd.read_csv('data/filled_ipl_data.csv')
    with open('data/short_name_to_full_name.json', 'r') as f:
        name_map = json.load(f)
        
    matched_count = 0
    unmatched = []
    
    for idx, row in df.iterrows():
        player_short = row['Player']
        player_full = name_map.get(player_short, "")
        
        # Try direct matches
        if player_short in tallies:
            df.at[idx, 'Matches_Played'] = tallies[player_short]
            matched_count += 1
        elif player_full in tallies:
            df.at[idx, 'Matches_Played'] = tallies[player_full]
            matched_count += 1
        else:
            # Try fuzzy / lowercase match
            found = False
            for c_name, c_count in tallies.items():
                if c_name.lower().replace(" ", "") == player_short.lower().replace(" ", "") or \
                   c_name.lower().replace(" ", "") == player_full.lower().replace(" ", ""):
                    df.at[idx, 'Matches_Played'] = c_count
                    matched_count += 1
                    found = True
                    break
            
            if not found:
                # Actual true rookie (0 matches) or name mismatch
                df.at[idx, 'Matches_Played'] = 0
                unmatched.append(player_short)
                
    df.to_csv('data/filled_ipl_data.csv', index=False)
    print(f"\nMatched {matched_count}/{len(df)} players.")
    print(f"Unmatched (True Rookies / Name Mismatch): {unmatched[:20]}")

if __name__ == "__main__":
    parse_cricsheet()
