import json
import pandas as pd
import numpy as np

def calculate_power_index(row):
    # Batter calculation
    bat_score = (row['Batting_SR'] * 0.6) + (row['Batting_Avg'] * 0.4)
    # Give a tiny bonus to pure batters if they don't bowl, or just use the formula exactly
    
    # Bowler calculation
    # Wickets per match = Wickets / Matches where they bowled
    # Wait, the formula says Wickets_Per_Match * 10. If a bowler bowled in 10 matches and got 15 wickets, WPM = 1.5
    bowl_score = (row['Bw_WPM'] * 10) - (row['Bowling_Econ'] * 1.5)
    
    # All-Rounder calculation: take the higher, or a weighted average
    if row['Role'] == 'Batter':
        return bat_score
    elif row['Role'] == 'Bowler':
        return bowl_score
    else: # All-Rounder
        # If they are a true all-rounder, combining both makes them incredibly valuable.
        # Let's take the higher of the two, plus 20% of the lower one as an "all-rounder bonus"
        return max(bat_score, bowl_score) + (0.2 * min(bat_score, bowl_score))

def process_data(json_path, target_seasons=[2023, 2024, 2025]):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    player_stats = []
    
    for player_name, player_data in data.items():
        if 'op_team' not in player_data:
            continue
            
        p_stats = {
            'Player': player_name,
            'Matches': 0,
            'Bowl_Innings': 0,
            'Bt_Runs': 0,
            'Bt_Balls': 0,
            'Bt_Dismissals': 0,
            'Bw_Runs': 0,
            'Bw_Balls': 0,
            'Bw_Wickets': 0
        }
        
        for op_team, team_stats in player_data['op_team'].items():
            if 'Season_list' not in team_stats:
                continue
                
            seasons = team_stats.get('Season_list', [])
            bt_runs = team_stats.get('Bt_Runs_list', [0]*len(seasons))
            bt_balls = team_stats.get('Bt_Balls_list', [0]*len(seasons))
            bt_w_list = team_stats.get('Bt_W_list', [0]*len(seasons))
            
            bw_runs = team_stats.get('Bw_Runs_list', [0]*len(seasons))
            bw_balls = team_stats.get('Bw_Balls_list', [0]*len(seasons))
            bw_w_list = team_stats.get('Bw_W_list', [0]*len(seasons))
            
            for i, season in enumerate(seasons):
                if season in target_seasons:
                    p_stats['Matches'] += 1
                    p_stats['Bt_Runs'] += bt_runs[i] if i < len(bt_runs) else 0
                    p_stats['Bt_Balls'] += bt_balls[i] if i < len(bt_balls) else 0
                    p_stats['Bt_Dismissals'] += bt_w_list[i] if i < len(bt_w_list) else 0
                    
                    b_balls = bw_balls[i] if i < len(bw_balls) else 0
                    p_stats['Bw_Balls'] += b_balls
                    if b_balls > 0:
                        p_stats['Bowl_Innings'] += 1
                        
                    p_stats['Bw_Runs'] += bw_runs[i] if i < len(bw_runs) else 0
                    p_stats['Bw_Wickets'] += bw_w_list[i] if i < len(bw_w_list) else 0
                    
        if p_stats['Matches'] > 0:
            player_stats.append(p_stats)
            
    df = pd.DataFrame(player_stats)
    
    # Base Stats
    df['Batting_Avg'] = np.where(df['Bt_Dismissals'] > 0, df['Bt_Runs'] / df['Bt_Dismissals'], df['Bt_Runs'])
    df['Batting_SR'] = np.where(df['Bt_Balls'] > 0, (df['Bt_Runs'] / df['Bt_Balls']) * 100, 0)
    
    df['Bw_WPM'] = np.where(df['Bowl_Innings'] > 0, df['Bw_Wickets'] / df['Bowl_Innings'], 0)
    df['Bowling_Econ'] = np.where(df['Bw_Balls'] > 0, (df['Bw_Runs'] / df['Bw_Balls']) * 6, 0)
    
    # Categorize roles
    def get_role(row):
        if row['Bt_Balls'] >= 40 and row['Bw_Balls'] >= 60:
            return 'All-Rounder'
        elif row['Bw_Balls'] >= 60:
            return 'Bowler'
        elif row['Bt_Balls'] >= 30:
            return 'Batter'
        else:
            return 'Unknown'
            
    df['Role'] = df.apply(get_role, axis=1)
    
    # Filter out unknowns to clean up the dataset
    df = df[df['Role'] != 'Unknown'].copy()
    
    # Calculate Raw Power Index
    df['Raw_Power'] = df.apply(calculate_power_index, axis=1)
    
    # Normalize Power Index to 0 - 100
    min_power = df['Raw_Power'].min()
    max_power = df['Raw_Power'].max()
    df['Power_Index'] = ((df['Raw_Power'] - min_power) / (max_power - min_power)) * 100
    df['Power_Index'] = df['Power_Index'].round(2)
    
    # Add Mock Price (Assume Price correlates heavily with Power Index, 15 Cr max)
    df['Auction_Price'] = (df['Power_Index'] / 100) * 15.0
    df['Auction_Price'] = df['Auction_Price'].clip(lower=0.2).round(1)
    
    # Add empty columns for manual entry
    df['Nationality'] = ""
    df['Bowling_Style'] = ""
    df['Specific_Role'] = "" # To specify Openers, Spinners, Pacers, Keepers, etc.
    
    final_cols = ['Player', 'Role', 'Specific_Role', 'Nationality', 'Bowling_Style', 'Auction_Price', 'Power_Index', 'Batting_SR', 'Batting_Avg', 'Bw_WPM', 'Bowling_Econ']
    df = df[final_cols].sort_values(by='Power_Index', ascending=False)
    
    out_path = 'data/processed_ipl_data.csv'
    df.to_csv(out_path, index=False)
    print(f"Processed {len(df)} players.")
    print(f"Saved to {out_path}")
    print("\nPlease manually fill in the 'Nationality', 'Bowling_Style', and 'Specific_Role' columns for at least the top players before running the optimizer.")

if __name__ == "__main__":
    process_data('data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json')
