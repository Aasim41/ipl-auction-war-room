import pandas as pd
import json

def update_matches():
    df = pd.read_csv('data/filled_ipl_data.csv')
    
    with open('data/short_name_to_full_name.json', 'r') as f:
        name_map = json.load(f)
        
    with open('data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json', 'r') as f:
        stats_data = json.load(f)

    matches_dict = {}

    for short_name, full_name in name_map.items():
        total_matches = 0
        if full_name in stats_data:
            player_data = stats_data[full_name]
            # Sum matches across franchises from the Batting data ('op_team')
            if "op_team" in player_data:
                for team, data in player_data["op_team"].items():
                    total_matches += data.get("Matches", 0)
        matches_dict[short_name] = total_matches

    # Map matches, defaulting to 0 for uncapped/new players
    df['Matches_Played'] = df['Player'].map(matches_dict).fillna(0).astype(int)
    
    df.to_csv('data/filled_ipl_data.csv', index=False)
    print(f"Successfully added Matches_Played to CSV. Max matches found: {df['Matches_Played'].max()}")

if __name__ == "__main__":
    update_matches()
