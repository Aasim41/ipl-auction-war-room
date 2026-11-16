import pulp
import pandas as pd
from .predictive_model_service import predictive_service

def calculate_predicted_price(power: float, base: float) -> float:
    if power <= 55:
        extra = 0.0
    elif power <= 70:
        extra = ((power - 55) ** 2) / 75.0 
    elif power <= 80:
        extra = 3.0 + ((power - 70) ** 2) / 12.0
    else:
        extra = 11.33 + ((power - 80) ** 2) / 4.0
    raw_price = base + extra
    return min(23.0, round(raw_price * 4) / 4)


def optimize_squad(players_df, budget, locked_player_ids, optimization_target='power_index', venue='bengaluru'):
    """
    Enhanced PuLP linear programming optimizer supporting:
    - 'power_index': Traditional historical average maximization
    - 'expected_points': PyTorch predicted matchday fantasy points
    - 'value_for_money': ROI optimization (expected points per Crore)
    """
    prob = pulp.LpProblem("SquadOptimizer", pulp.LpMaximize)

    # Pre-calculate objective weights
    objective_weights = {}
    for _, p in players_df.iterrows():
        p_dict = p.to_dict()
        pred = predictive_service.predict_player(p_dict, venue=venue)

        if optimization_target == 'expected_points':
            objective_weights[p['player_id']] = pred['expected_matchday_points']
        elif optimization_target == 'value_for_money':
            objective_weights[p['player_id']] = pred['value_for_money']
        else: # default power_index
            objective_weights[p['player_id']] = float(p.get('Power_Index') or 75.0)
    
    # Define variables
    x = {p['player_id']: pulp.LpVariable(f"x_{p['player_id']}", cat="Binary") for _, p in players_df.iterrows()}
    
    # Objective: maximize selected target
    prob += pulp.lpSum(objective_weights[p['player_id']] * x[p['player_id']] for _, p in players_df.iterrows())
    
    # Budget constraint
    prob += pulp.lpSum(p['predicted_price'] * x[p['player_id']] for _, p in players_df.iterrows()) <= budget
    
    # Squad size constraint
    prob += pulp.lpSum(x[p['player_id']] for _, p in players_df.iterrows()) <= 25
    prob += pulp.lpSum(x[p.get('player_id')] for _, p in players_df.iterrows()) >= 18
    
    # Overseas cap - maximum 8 overseas players
    prob += pulp.lpSum(x[p['player_id']] for _, p in players_df.iterrows() if p['is_overseas']) <= 8
    
    # Role minimums to ensure a balanced 25-man squad
    prob += pulp.lpSum(x[p['player_id']] for _, p in players_df.iterrows() if p['role'] == "WK") >= 2
    prob += pulp.lpSum(x[p['player_id']] for _, p in players_df.iterrows() if p['role'] == "BAT") >= 6
    prob += pulp.lpSum(x[p['player_id']] for _, p in players_df.iterrows() if p['role'] == "BOWL") >= 7
    prob += pulp.lpSum(x[p['player_id']] for _, p in players_df.iterrows() if p['role'] == "AR") >= 4
    
    # Locked players
    for locked_id in locked_player_ids:
        if locked_id in x:
            prob += x[locked_id] == 1
            
    # Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    
    if pulp.LpStatus[prob.status] != 'Optimal':
        # Soften constraints if infeasible
        prob_fallback = pulp.LpProblem("SquadOptimizerFallback", pulp.LpMaximize)
        x_fb = {p['player_id']: pulp.LpVariable(f"xf_{p['player_id']}", cat="Binary") for _, p in players_df.iterrows()}
        prob_fallback += pulp.lpSum(objective_weights[p['player_id']] * x_fb[p['player_id']] for _, p in players_df.iterrows())
        prob_fallback += pulp.lpSum(p['predicted_price'] * x_fb[p['player_id']] for _, p in players_df.iterrows()) <= budget
        prob_fallback += pulp.lpSum(x_fb[p['player_id']] for _, p in players_df.iterrows()) <= 25
        prob_fallback += pulp.lpSum(x_fb[p['player_id']] for _, p in players_df.iterrows() if p['is_overseas']) <= 8
        for locked_id in locked_player_ids:
            if locked_id in x_fb:
                prob_fallback += x_fb[locked_id] == 1
        prob_fallback.solve(pulp.PULP_CBC_CMD(msg=False))
        if pulp.LpStatus[prob_fallback.status] == 'Optimal':
            return [p['player_id'] for _, p in players_df.iterrows() if x_fb[p['player_id']].varValue == 1]
        return []
        
    selected_ids = [p['player_id'] for _, p in players_df.iterrows() if x[p['player_id']].varValue == 1]
    return selected_ids
