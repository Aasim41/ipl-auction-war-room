import pandas as pd
import pulp

def optimize_playing_xi(csv_path):
    df = pd.read_csv(csv_path)
    
    # Clean data: drop rows where user didn't fill required metadata
    df = df.dropna(subset=['Nationality', 'Specific_Role']).reset_index(drop=True)
    
    if len(df) < 11:
        print("Not enough players with filled metadata to form an XI! Please fill more rows.")
        return
        
    print(f"Loaded {len(df)} players with complete metadata.")
    
    # Initialize the Problem
    prob = pulp.LpProblem("IPL_Playing_XI_Optimization", pulp.LpMaximize)
    
    # Decision Variables
    player_vars = pulp.LpVariable.dicts("Player", df.index, cat='Binary')
    
    # Objective Function: Maximize Total Power Index
    prob += pulp.lpSum([df.loc[i, 'Power_Index'] * player_vars[i] for i in df.index]), "Total_Power_Index"
    
    # Constraints
    # 1. Budget <= 100
    prob += pulp.lpSum([df.loc[i, 'Auction_Price'] * player_vars[i] for i in df.index]) <= 100.0, "Budget"
    
    # 2. Total Players == 11
    prob += pulp.lpSum([player_vars[i] for i in df.index]) == 11, "Squad_Size"
    
    # 3. Overseas Limit <= 4
    prob += pulp.lpSum([player_vars[i] for i in df.index if str(df.loc[i, 'Nationality']).strip().lower() == 'overseas']) <= 4, "Overseas_Limit"
    
    # 4. Ideal XI Structure Constraints
    # Top Order == 3
    prob += pulp.lpSum([player_vars[i] for i in df.index if 'top order' in str(df.loc[i, 'Specific_Role']).strip().lower()]) == 3, "Top_Order"
    
    # Middle Order == 3
    prob += pulp.lpSum([player_vars[i] for i in df.index if 'middle order' in str(df.loc[i, 'Specific_Role']).strip().lower()]) == 3, "Middle_Order"
    
    # All-Rounders == 2
    prob += pulp.lpSum([player_vars[i] for i in df.index if 'all-rounder' in str(df.loc[i, 'Specific_Role']).strip().lower() or 'all-rounder' in str(df.loc[i, 'Role']).strip().lower()]) == 2, "All_Rounders"
    
    # Bowlers == 3
    prob += pulp.lpSum([player_vars[i] for i in df.index if 'bowler' in str(df.loc[i, 'Specific_Role']).strip().lower() or 'bowler' in str(df.loc[i, 'Role']).strip().lower()]) == 3, "Bowlers"
    
    # 5. Bowling Mix Constraints (at least 1 spinner, at least 2 pacers among the bowlers & all-rounders)
    prob += pulp.lpSum([player_vars[i] for i in df.index if 'spin' in str(df.loc[i, 'Bowling_Style']).strip().lower()]) >= 1, "Min_Spinners"
    prob += pulp.lpSum([player_vars[i] for i in df.index if 'pace' in str(df.loc[i, 'Bowling_Style']).strip().lower() or 'fast' in str(df.loc[i, 'Bowling_Style']).strip().lower()]) >= 2, "Min_Pacers"
    
    # Solve the problem
    print("\nSolving for optimal Playing XI...")
    status = prob.solve(pulp.PULP_CBC_CMD(msg=0))
    
    if status != pulp.LpStatusOptimal:
        print(f"Warning: Optimal solution not found. Status: {pulp.LpStatus[status]}")
        print("This usually means the constraints are too strict for the players you provided.")
        return
        
    selected_indices = [i for i in df.index if player_vars[i].varValue == 1.0]
    squad_df = df.loc[selected_indices].sort_values(by=['Specific_Role', 'Auction_Price'], ascending=[True, False]).reset_index(drop=True)
    
    print("\n" + "="*50)
    print(" OPTIMAL PLAYING XI GENERATED ")
    print("="*50)
    
    total_cost = squad_df['Auction_Price'].sum()
    total_power = squad_df['Power_Index'].sum()
    print(f"\nTotal Budget Used: {total_cost:.1f} Cr (Limit: 100 Cr)")
    print(f"Total Power Index: {total_power:.1f}")
    
    print("\n" + "-"*80)
    print(f"{'Player':<20} | {'Role':<15} | {'Nat':<10} | {'Style':<10} | {'Price(Cr)':<10} | {'Power'}")
    print("-" * 80)
    
    for _, row in squad_df.iterrows():
        name = str(row['Player'])[:18]
        role = str(row['Specific_Role'])[:14] if pd.notna(row['Specific_Role']) else str(row['Role'])[:14]
        nat = str(row['Nationality'])[:9]
        style = str(row['Bowling_Style'])[:9] if pd.notna(row['Bowling_Style']) else "-"
        price = row['Auction_Price']
        power = row['Power_Index']
        
        print(f"{name:<20} | {role:<15} | {nat:<10} | {style:<10} | {price:<10.1f} | {power:.1f}")
    print("-" * 80)
    
    squad_df.to_csv('data/final_playing_xi.csv', index=False)
    print("\nSquad saved to data/final_playing_xi.csv")

if __name__ == "__main__":
    optimize_playing_xi('data/filled_ipl_data.csv')
