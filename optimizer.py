import json
import pandas as pd
import numpy as np

def load_and_aggregate_stats(json_path, target_seasons=[2023, 2024, 2025]):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    player_stats = []
    
    for player_name, player_data in data.items():
        if 'op_team' not in player_data:
            continue
            
        p_stats = {
            'Player': player_name,
            'Matches': 0,
            'Bt_Runs': 0,
            'Bt_Balls': 0,
            'Bt_Fours': 0,
            'Bt_Sixes': 0,
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
            fours = team_stats.get('four_list', [0]*len(seasons))
            sixes = team_stats.get('Six_list', [0]*len(seasons))
            bt_dismissals = team_stats.get('Lose_Wicket', 0) # Wait, Lose_Wicket might be aggregated. Let's check lists.
            bt_w_list = team_stats.get('Bt_W_list', [0]*len(seasons))
            
            bw_runs = team_stats.get('Bw_Runs_list', [0]*len(seasons))
            bw_balls = team_stats.get('Bw_Balls_list', [0]*len(seasons))
            bw_w_list = team_stats.get('Bw_W_list', [0]*len(seasons))
            
            for i, season in enumerate(seasons):
                if season in target_seasons:
                    p_stats['Matches'] += 1
                    p_stats['Bt_Runs'] += bt_runs[i] if i < len(bt_runs) else 0
                    p_stats['Bt_Balls'] += bt_balls[i] if i < len(bt_balls) else 0
                    p_stats['Bt_Fours'] += fours[i] if i < len(fours) else 0
                    p_stats['Bt_Sixes'] += sixes[i] if i < len(sixes) else 0
                    p_stats['Bt_Dismissals'] += bt_w_list[i] if i < len(bt_w_list) else 0
                    
                    p_stats['Bw_Runs'] += bw_runs[i] if i < len(bw_runs) else 0
                    p_stats['Bw_Balls'] += bw_balls[i] if i < len(bw_balls) else 0
                    p_stats['Bw_Wickets'] += bw_w_list[i] if i < len(bw_w_list) else 0
                    
        if p_stats['Matches'] > 0:
            player_stats.append(p_stats)
            
    df = pd.DataFrame(player_stats)
    
    # Calculate derived metrics
    df['Batting_Avg'] = np.where(df['Bt_Dismissals'] > 0, df['Bt_Runs'] / df['Bt_Dismissals'], df['Bt_Runs'])
    df['Batting_SR'] = np.where(df['Bt_Balls'] > 0, (df['Bt_Runs'] / df['Bt_Balls']) * 100, 0)
    
    df['Bowling_Avg'] = np.where(df['Bw_Wickets'] > 0, df['Bw_Runs'] / df['Bw_Wickets'], np.where(df['Bw_Runs'] > 0, df['Bw_Runs'], 0))
    df['Bowling_Econ'] = np.where(df['Bw_Balls'] > 0, (df['Bw_Runs'] / df['Bw_Balls']) * 6, 0)
    df['Bowling_SR'] = np.where(df['Bw_Wickets'] > 0, df['Bw_Balls'] / df['Bw_Wickets'], 0)
    
    # Calculate a simple "Player Value Score"
    # Normalize metrics to 0-1 scale to combine them
    max_runs = df['Bt_Runs'].max() if df['Bt_Runs'].max() > 0 else 1
    max_wkts = df['Bw_Wickets'].max() if df['Bw_Wickets'].max() > 0 else 1
    
    df['Batting_Score'] = (df['Bt_Runs'] / max_runs) * 0.5 + (df['Batting_SR'] / 200.0).clip(0, 1) * 0.3 + (df['Batting_Avg'] / 50.0).clip(0, 1) * 0.2
    df['Bowling_Score'] = (df['Bw_Wickets'] / max_wkts) * 0.5 + (1 - (df['Bowling_Econ'] / 15.0).clip(0, 1)) * 0.3 + (1 - (df['Bowling_Avg'] / 60.0).clip(0, 1)) * 0.2
    
    # Handle players who only bat or only bowl
    df.loc[df['Bw_Balls'] < 12, 'Bowling_Score'] = 0 # Need at least 2 overs total to be rated as a bowler
    df.loc[df['Bt_Balls'] < 20, 'Batting_Score'] = 0 # Need at least 20 balls faced to be rated as a batter
    
    df['Total_Value_Score'] = df['Batting_Score'] + df['Bowling_Score']
    
    return df

import pulp

def categorize_player(row):
    bt_b = row['Bt_Balls']
    bw_b = row['Bw_Balls']
    if bt_b >= 40 and bw_b >= 60:
        return 'All-Rounder'
    elif bw_b >= 60:
        return 'Bowler'
    elif bt_b >= 30:
        return 'Batter'
    else:
        return 'Unknown'

def select_optimal_squad(df, budget=100.0, squad_size=15):
    """
    Selects the mathematically optimal squad using Integer Linear Programming (Knapsack).
    """
    df = df.copy()
    
    # Mocking price - assume price is proportional to value score (max 15 Cr, min 0.2 Cr)
    max_val = df['Total_Value_Score'].max()
    df['Mock_Price_Cr'] = (df['Total_Value_Score'] / max_val) * 15.0
    df['Mock_Price_Cr'] = df['Mock_Price_Cr'].clip(lower=0.2).round(1)
    
    df['Role'] = df.apply(categorize_player, axis=1)
    
    # Filter out players with zero value
    df = df[df['Total_Value_Score'] > 0.1].reset_index(drop=True)
    
    # Initialize the Problem
    prob = pulp.LpProblem("IPL_Auction_Optimization", pulp.LpMaximize)
    
    # Decision Variables: 1 if player i is selected, 0 otherwise
    player_vars = pulp.LpVariable.dicts("Player", df.index, cat='Binary')
    
    # Objective Function: Maximize Total Value Score
    prob += pulp.lpSum([df.loc[i, 'Total_Value_Score'] * player_vars[i] for i in df.index]), "Total_Value"
    
    # Constraints
    # 1. Total cost must be less than or equal to budget
    prob += pulp.lpSum([df.loc[i, 'Mock_Price_Cr'] * player_vars[i] for i in df.index]) <= budget, "Budget"
    
    # 2. Squad size must be exactly 15
    prob += pulp.lpSum([player_vars[i] for i in df.index]) == squad_size, "Squad_Size"
    
    # 3. Role constraints (Minimums)
    prob += pulp.lpSum([player_vars[i] for i in df.index if df.loc[i, 'Role'] == 'Batter']) >= 4, "Min_Batters"
    prob += pulp.lpSum([player_vars[i] for i in df.index if df.loc[i, 'Role'] == 'Bowler']) >= 4, "Min_Bowlers"
    prob += pulp.lpSum([player_vars[i] for i in df.index if df.loc[i, 'Role'] == 'All-Rounder']) >= 3, "Min_AllRounders"
    
    # Solve the problem
    prob.solve(pulp.PULP_CBC_CMD(msg=0))
    
    selected_indices = [i for i in df.index if player_vars[i].varValue == 1.0]
    
    squad_df = df.loc[selected_indices].sort_values(by='Mock_Price_Cr', ascending=False).reset_index(drop=True)
    return squad_df

if __name__ == "__main__":
    json_file = 'data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json'
    print("Loading and processing dataset (2023-2025)...")
    try:
        df = load_and_aggregate_stats(json_file)
        print(f"Successfully processed {len(df)} players.")
        
        print("\nSelecting optimal mock squad (Budget: 100Cr, Size: 15) using PuLP LP Solver...")
        squad_df = select_optimal_squad(df)
        print(f"\nSelected {len(squad_df)} players. Total Cost: {squad_df['Mock_Price_Cr'].sum():.1f} Cr")
        print("\nFinal Optimized Squad:")
        print(squad_df[['Player', 'Role', 'Total_Value_Score', 'Mock_Price_Cr']].to_string())
        
        squad_df.to_csv('data/optimal_squad.csv', index=False)
        print("\nOptimal squad saved to data/optimal_squad.csv")
        
    except Exception as e:
        print("An error occurred:", e)
