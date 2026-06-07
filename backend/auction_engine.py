import pandas as pd
import pulp

def get_ai_retentions(team_df, max_retained=6):
    """AI automatically selects the best players to retain based on Power Index."""
    if team_df.empty:
        return team_df
    # Sort by Power Index descending
    sorted_team = team_df.sort_values(by='Power_Index', ascending=False)
    # Retain top N players
    retained = sorted_team.head(max_retained)
    return retained

def generate_auction_pool(all_players_df, current_squads_df, user_team, user_released_names):
    """
    Builds the auction pool:
    1. Players completely unassigned in current_squads.
    2. Simulated releases from the other 9 teams (bottom 30% by Power Index).
    3. The players the user explicitly released.
    """
    # 1. Find unassigned players
    assigned_names = current_squads_df['Player'].tolist()
    unassigned_df = all_players_df[~all_players_df['Player'].isin(assigned_names)]
    
    # 2. Simulate other teams' releases
    other_teams = current_squads_df[current_squads_df['Current_Team'] != user_team]
    simulated_releases = []
    
    for team, group in other_teams.groupby('Current_Team'):
        # Merge with stats to get Power Index
        team_stats = pd.merge(group, all_players_df, on='Player', how='inner')
        team_stats = team_stats.sort_values(by='Power_Index', ascending=True)
        # Release bottom 30%
        num_release = int(len(team_stats) * 0.3)
        if num_release > 0:
            simulated_releases.append(team_stats.head(num_release))
            
    simulated_release_df = pd.concat(simulated_releases) if simulated_releases else pd.DataFrame()
    
    # 3. User's released players
    user_released_df = all_players_df[all_players_df['Player'].isin(user_released_names)]
    
    # Combine all into the pool
    pool_frames = [unassigned_df]
    if not simulated_release_df.empty:
        pool_frames.append(simulated_release_df)
    if not user_released_df.empty:
        pool_frames.append(user_released_df)
        
    pool_df = pd.concat(pool_frames).drop_duplicates(subset=['Player'])
    return pool_df

def run_ai_auction(pool_df, retained_df, remaining_budget, target_squad_size=25):
    """
    AI buys the best combination of players from the pool to fill the squad,
    staying under budget and balancing the roster.
    """
    slots_needed = target_squad_size - len(retained_df)
    if slots_needed <= 0 or pool_df.empty:
        return pd.DataFrame()
        
    prob = pulp.LpProblem("AI_Auction_Draft", pulp.LpMaximize)
    
    pool_df = pool_df.copy().reset_index(drop=True)
    player_vars = pulp.LpVariable.dicts("Buy", pool_df.index, cat='Binary')
    
    # Objective: Maximize Power Index
    prob += pulp.lpSum([pool_df.loc[i, 'Power_Index'] * player_vars[i] for i in pool_df.index])
    
    # Constraint 1: Exact number of slots needed
    prob += pulp.lpSum([player_vars[i] for i in pool_df.index]) == slots_needed
    
    # Constraint 2: Stay within budget
    prob += pulp.lpSum([pool_df.loc[i, 'Auction_Price'] * player_vars[i] for i in pool_df.index]) <= remaining_budget
    
    # Constraint 3: Max 8 overseas players total (retained + bought)
    retained_overseas = len(retained_df[retained_df['Nationality'].str.lower() != 'indian'])
    max_overseas_buys = max(0, 8 - retained_overseas)
    
    overseas_indices = pool_df[pool_df['Nationality'].str.lower() != 'indian'].index
    prob += pulp.lpSum([player_vars[i] for i in overseas_indices]) <= max_overseas_buys
    
    # Role Balance Constraints (Retained + Bought)
    # Ensure at least 2 WKs, 6 Batters, 6 Bowlers total in the 25 man squad
    def get_role_count(df, role):
        return len(df[df['Role'].str.lower().str.contains(role.lower())])
        
    ret_wk = get_role_count(retained_df, 'wk')
    ret_bat = get_role_count(retained_df, 'batter') + get_role_count(retained_df, 'all-rounder')
    ret_bowl = get_role_count(retained_df, 'bowler') + get_role_count(retained_df, 'all-rounder')
    
    wk_idx = pool_df[pool_df['Role'].str.lower().str.contains('wk')].index
    bat_idx = pool_df[pool_df['Role'].str.lower().str.contains('batter|all-rounder')].index
    bowl_idx = pool_df[pool_df['Role'].str.lower().str.contains('bowler|all-rounder')].index
    
    prob += pulp.lpSum([player_vars[i] for i in wk_idx]) >= max(0, 2 - ret_wk)
    prob += pulp.lpSum([player_vars[i] for i in bat_idx]) >= max(0, 6 - ret_bat)
    prob += pulp.lpSum([player_vars[i] for i in bowl_idx]) >= max(0, 6 - ret_bowl)
    
    # Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=False, timeLimit=10))
    
    # If optimally solved or feasible
    if pulp.LpStatus[prob.status] in ['Optimal', 'Feasible']:
        bought_indices = [i for i in pool_df.index if player_vars[i].varValue == 1]
        return pool_df.loc[bought_indices]
    else:
        # Fallback: Just buy the highest power index players we can afford
        pool_sorted = pool_df.sort_values(by=['Power_Index', 'Auction_Price'], ascending=[False, True])
        bought = []
        spent = 0
        for _, row in pool_sorted.iterrows():
            if len(bought) < slots_needed and (spent + row['Auction_Price']) <= remaining_budget:
                bought.append(row)
                spent += row['Auction_Price']
        return pd.DataFrame(bought)
