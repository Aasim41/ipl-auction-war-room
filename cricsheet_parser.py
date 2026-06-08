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
    
    # Invert the map: Full Name -> Short Name
    full_to_short = {v: k for k, v in name_map.items()}
    
    for idx, row in df.iterrows():
        player_full = row['Player']
        player_short = full_to_short.get(player_full, "")
        
        # Try direct matches
        if player_short and player_short in tallies:
            df.at[idx, 'Matches_Played'] = tallies[player_short]
            matched_count += 1
        elif player_full in tallies:
            df.at[idx, 'Matches_Played'] = tallies[player_full]
            matched_count += 1
        else:
            # Try fuzzy / lowercase match
            found = False
            for c_name, c_count in tallies.items():
                # Compare without spaces and lowercase
                if c_name.lower().replace(" ", "") == player_full.lower().replace(" ", ""):
                    df.at[idx, 'Matches_Played'] = c_count
                    matched_count += 1
                    found = True
                    break
                
                # Check if c_name might be an initial format like "V Kohli" for "Virat Kohli"
                # "V Kohli" -> "v", "kohli"
                c_parts = c_name.split()
                f_parts = player_full.split()
                if len(c_parts) >= 2 and len(f_parts) >= 2:
                    if c_parts[-1].lower() == f_parts[-1].lower() and c_parts[0][0].lower() == f_parts[0][0].lower():
                        # Very likely a match (e.g. HH Pandya == Hardik Pandya, V Kohli == Virat Kohli)
                        df.at[idx, 'Matches_Played'] = c_count
                        matched_count += 1
                        found = True
                        break
            
            if not found:
                # Actual true rookie (0 matches) or name mismatch
                df.at[idx, 'Matches_Played'] = 0
                unmatched.append(player_full)
                
    df.to_csv('data/filled_ipl_data.csv', index=False)
    print(f"\nMatched {matched_count}/{len(df)} players.")
    print(f"Unmatched (True Rookies / Name Mismatch): {unmatched[:20]}")

if __name__ == "__main__":
    parse_cricsheet()
