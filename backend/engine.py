import pandas as pd
import pulp
import random
import json
import os

# --- Venue Data ---
VENUES = {
    "Wankhede Stadium, Mumbai": {"pitch": "Pace & Bounce, Good for Batting", "spin_boost": 0.9, "pace_boost": 1.15, "bat_boost": 1.1},
    "M. Chinnaswamy Stadium, Bengaluru": {"pitch": "Flat Track, High Scoring", "spin_boost": 0.8, "pace_boost": 0.9, "bat_boost": 1.25},
    "MA Chidambaram Stadium, Chennai": {"pitch": "Spin Friendly, Slower Track", "spin_boost": 1.25, "pace_boost": 0.9, "bat_boost": 0.85},
    "Eden Gardens, Kolkata": {"pitch": "Balanced, Good for Swing early on", "spin_boost": 1.1, "pace_boost": 1.1, "bat_boost": 1.0},
    "Narendra Modi Stadium, Ahmedabad": {"pitch": "Balanced, Variable Pace", "spin_boost": 1.0, "pace_boost": 1.1, "bat_boost": 1.05},
}

def load_data():
    df = pd.read_csv('data/final_playing_xi.csv')
    df['Auction_Price'] = df['Auction_Price'].fillna(0.2)
    # Ensure all caps for specific roles and lower for nationality
    df['Specific_Role'] = df['Specific_Role'].astype(str).str.lower()
    df['Nationality'] = df['Nationality'].astype(str).str.lower()
    df['Original_Power_Index'] = df['Power_Index']
    return df

def apply_venue_boost(df, venue_name):
    if venue_name not in VENUES:
        return df
    
    venue = VENUES[venue_name]
    boosted_df = df.copy()
    
    for i, row in boosted_df.iterrows():
        role = str(row['Specific_Role'])
        new_power = row['Power_Index']
        
        if 'spin' in role:
            new_power *= venue['spin_boost']
        elif 'fast' in role or 'medium' in role:
            new_power *= venue['pace_boost']
            
        if 'batter' in role or 'all-rounder' in role:
            new_power *= venue['bat_boost']
            
        boosted_df.at[i, 'Power_Index'] = new_power
    
    return boosted_df

def run_optimization(df, budget_limit, mandatory_xi=None, mandatory_squad=None, unavailable_players=None, price_overrides=None):
    if mandatory_xi is None: mandatory_xi = []
    if mandatory_squad is None: mandatory_squad = []
    if unavailable_players is None: unavailable_players = []
    
    df = df.copy()
    if price_overrides:
        for player_name, new_price in price_overrides.items():
            df.loc[df['Player'] == player_name, 'Auction_Price'] = new_price
            
    df = df.reset_index(drop=True)
    prob = pulp.LpProblem("IPL_War_Room_Optimizer", pulp.LpMaximize)
    
    squad_vars = pulp.LpVariable.dicts("Squad", df.index, cat='Binary')
    xi_vars = pulp.LpVariable.dicts("XI", df.index, cat='Binary')
    
    prob += pulp.lpSum([xi_vars[i] * df.loc[i, 'Power_Index'] * 1000 for i in df.index]) - pulp.lpSum([squad_vars[i] * df.loc[i, 'Auction_Price'] for i in df.index]), "Objective"
    
    prob += pulp.lpSum([squad_vars[i] * df.loc[i, 'Auction_Price'] for i in df.index]) <= budget_limit, "Budget_Constraint"
    
    for i in df.index:
        prob += xi_vars[i] <= squad_vars[i], f"XI_Must_Be_In_Squad_{i}"
    
    for i in df.index:
        player_name = df.loc[i, 'Player']
        if player_name in unavailable_players:
            prob += squad_vars[i] == 0, f"Unavailable_{i}"
            prob += xi_vars[i] == 0, f"Unavailable_XI_{i}"
        elif player_name in mandatory_xi:
            prob += xi_vars[i] == 1, f"Mandatory_XI_{i}"
            prob += squad_vars[i] == 1, f"Mandatory_Squad_via_XI_{i}"
        elif player_name in mandatory_squad:
            prob += squad_vars[i] == 1, f"Mandatory_Squad_{i}"
    
    prob += pulp.lpSum([squad_vars[i] for i in df.index]) == 25, "Squad_Size"
    prob += pulp.lpSum([xi_vars[i] for i in df.index]) == 11, "XI_Size"
    
    overseas_indices = df[df['Nationality'] == 'overseas'].index
    prob += pulp.lpSum([squad_vars[i] for i in overseas_indices]) <= 8, "Squad_Overseas_Limit"
    prob += pulp.lpSum([xi_vars[i] for i in overseas_indices]) <= 4, "XI_Overseas_Limit"
    
    wk_indices = df[df['Specific_Role'].str.contains('wicketkeeper')].index
    prob += pulp.lpSum([xi_vars[i] for i in wk_indices]) == 1, "XI_Wicketkeepers"
    prob += pulp.lpSum([squad_vars[i] for i in wk_indices]) >= 2, "Squad_Wicketkeepers"
    
    bowler_indices = df[df['Specific_Role'].str.contains('bowler|all-rounder')].index
    prob += pulp.lpSum([xi_vars[i] for i in bowler_indices]) >= 5, "XI_Bowlers"
    
    pulp_solver = pulp.PULP_CBC_CMD(msg=False, threads=1)
    prob.solve(pulp_solver)
    
    if pulp.LpStatus[prob.status] != 'Optimal':
        return None, None
        
    squad_indices = [i for i in df.index if squad_vars[i].varValue == 1]
    xi_indices = [i for i in df.index if xi_vars[i].varValue == 1]
    
    squad_df = df.iloc[squad_indices].copy()
    xi_df = df.iloc[xi_indices].copy()
    
    return squad_df, xi_df

def calculate_chemistry(xi_df):
    score = 100
    archetypes = []
    
    for _, row in xi_df.iterrows():
        arch = "Balanced"
        role = str(row['Specific_Role']).lower()
        
        if 'order' in role or 'all-rounder' in role:
            if row['Batting_SR'] >= 140: arch = "Aggressor"
            elif row['Batting_Avg'] >= 35: arch = "Anchor"
            
        if 'bowler' in role:
            if row['Bowling_Econ'] >= 8.5: arch = "Strike Bowler"
            elif row['Bowling_Econ'] <= 7.5 and row['Bowling_Econ'] > 0: arch = "Defensive"
            elif arch == "Balanced": arch = "Balanced Bowler"
            
        archetypes.append(arch)
        
    xi_df = xi_df.copy()
    xi_df['Archetype'] = archetypes
    
    top_order = xi_df[xi_df['Specific_Role'] == 'top order']
    if not top_order.empty:
        top_archs = top_order['Archetype'].tolist()
        if len(top_archs) > 1 and all(a == 'Aggressor' for a in top_archs): score -= 15
        elif len(top_archs) > 1 and all(a == 'Anchor' for a in top_archs): score -= 15
            
    bowlers = xi_df[xi_df['Specific_Role'].str.contains('bowler|all-rounder')]
    if not bowlers.empty:
        spinners = bowlers[bowlers['Specific_Role'].str.contains('spin')]
        pacers = bowlers[bowlers['Specific_Role'].str.contains('fast|medium')]
        if len(spinners) == 0 or len(pacers) == 0: score -= 20
        
    return max(0, score), xi_df
