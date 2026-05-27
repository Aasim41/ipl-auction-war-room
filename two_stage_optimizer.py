import pandas as pd
import pulp

def optimize_two_stage(csv_path):
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['Nationality', 'Specific_Role']).reset_index(drop=True)
    
    # Ensure strings for safe matching
    df['Nationality'] = df['Nationality'].astype(str).str.strip().str.lower()
    df['Specific_Role'] = df['Specific_Role'].astype(str).str.strip().str.lower()
    df['Bowling_Style'] = df['Bowling_Style'].astype(str).str.strip().str.lower()
    df['Role'] = df['Role'].astype(str).str.strip().str.lower()
    
    print(f"Loaded {len(df)} players.")
    
    prob = pulp.LpProblem("IPL_Two_Stage_Optimization", pulp.LpMaximize)
    
    # Variables
    squad_vars = pulp.LpVariable.dicts("Squad", df.index, cat='Binary')
    xi_vars = pulp.LpVariable.dicts("XI", df.index, cat='Binary')
    
    # Objective: Maximize Power Index of Squad + 2x Power Index of XI 
    # (To prioritize a strong starting 11 over a deep bench)
    prob += pulp.lpSum([df.loc[i, 'Power_Index'] * squad_vars[i] for i in df.index]) + \
            pulp.lpSum([df.loc[i, 'Power_Index'] * xi_vars[i] * 2.0 for i in df.index]), "Total_Objective"
            
    # Scale down mock prices to make 25-man squad feasible under 100 Cr limit
    df['Auction_Price'] = df['Auction_Price'] * 0.55
    
    # ---------------------------------------------------------
    # STAGE 1: SQUAD CONSTRAINTS (25 Players)
    # ---------------------------------------------------------
    
    # 1. Budget <= 100
    prob += pulp.lpSum([df.loc[i, 'Auction_Price'] * squad_vars[i] for i in df.index]) <= 100.0, "Budget"
    
    # 2. Total Players == 25
    prob += pulp.lpSum([squad_vars[i] for i in df.index]) == 25, "Squad_Size"
    
    # 3. Nationality: Indian 17-20, Overseas 5-8
    indians_squad = pulp.lpSum([squad_vars[i] for i in df.index if df.loc[i, 'Nationality'] == 'indian'])
    overseas_squad = pulp.lpSum([squad_vars[i] for i in df.index if df.loc[i, 'Nationality'] == 'overseas'])
    prob += indians_squad >= 17
    prob += indians_squad <= 20
    prob += overseas_squad >= 5
    prob += overseas_squad <= 8
    
    # 4. Roles in Squad (using Specific_Role exclusively to avoid overlaps)
    batters_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'order' in df.loc[i, 'Specific_Role']])
    prob += batters_squad >= 6
    prob += batters_squad <= 8
    
    ars_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'all-rounder' in df.loc[i, 'Specific_Role']])
    prob += ars_squad >= 4
    prob += ars_squad <= 6
    
    pacers_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and ('pace' in df.loc[i, 'Bowling_Style'] or 'fast' in df.loc[i, 'Bowling_Style'])])
    prob += pacers_squad >= 5
    prob += pacers_squad <= 7
    
    spinners_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and 'spin' in df.loc[i, 'Bowling_Style']])
    prob += spinners_squad >= 3
    prob += spinners_squad <= 5
    
    # ---------------------------------------------------------
    # STAGE 2: PLAYING XI CONSTRAINTS (11 Players)
    # ---------------------------------------------------------
    
    # 1. XI must be a subset of Squad
    for i in df.index:
        prob += xi_vars[i] <= squad_vars[i]
        
    # 2. Total Players == 11
    prob += pulp.lpSum([xi_vars[i] for i in df.index]) == 11, "XI_Size"
    
    # 3. Top Order: 1 Ovs, 2 Ind
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'top order' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'overseas']) == 1, "Top_Ovs"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'top order' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian']) == 2, "Top_Ind"
    
    # 4. Middle Order: 3 Ind
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'middle order' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian']) == 3, "Mid_Ind"
    
    # 5. All-Rounders: 1 Ovs, 1 Ind
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'all-rounder' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'overseas']) == 1, "AR_Ovs"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'all-rounder' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian']) == 1, "AR_Ind"
    
    # 6. Bowlers: 2 Ovs Pacers, 1 Ind Spinner
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'overseas' and ('pace' in df.loc[i, 'Bowling_Style'] or 'fast' in df.loc[i, 'Bowling_Style'])]) == 2, "Bowl_Ovs_Pace"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian' and 'spin' in df.loc[i, 'Bowling_Style']]) == 1, "Bowl_Ind_Spin"
    
    # Debug Counts
    def count(cond): return sum(1 for i in df.index if cond(df.loc[i]))
    print("Dataset Counts:")
    print(f"Total Ind: {count(lambda r: r['Nationality'] == 'indian')}")
    print(f"Total Ovs: {count(lambda r: r['Nationality'] == 'overseas')}")
    print(f"Total Batters: {count(lambda r: 'order' in r['Specific_Role'])}")
    print(f"Total ARs: {count(lambda r: 'all-rounder' in r['Specific_Role'] or 'all-rounder' in r['Role'])}")
    print(f"Total Pacers: {count(lambda r: 'bowler' in r['Specific_Role'] and ('pace' in r['Bowling_Style'] or 'fast' in r['Bowling_Style']))}")
    print(f"Total Spinners: {count(lambda r: 'bowler' in r['Specific_Role'] and 'spin' in r['Bowling_Style'])}")
    print(f"Ovs Pacers (Bowler): {count(lambda r: 'bowler' in r['Specific_Role'] and r['Nationality'] == 'overseas' and ('pace' in r['Bowling_Style'] or 'fast' in r['Bowling_Style']))}")
    print(f"Ind Spinners (Bowler): {count(lambda r: 'bowler' in r['Specific_Role'] and r['Nationality'] == 'indian' and 'spin' in r['Bowling_Style'])}")
    
    # Solve
    print("\nSolving the Two-Stage LP Model...")
    status = prob.solve(pulp.PULP_CBC_CMD(msg=0))
    
    if status != pulp.LpStatusOptimal:
        print(f"Warning: Optimal solution not found. Status: {pulp.LpStatus[status]}")
        return
        
    # Extract
    squad_indices = [i for i in df.index if squad_vars[i].varValue == 1.0]
    xi_indices = [i for i in df.index if xi_vars[i].varValue == 1.0]
    
    squad_df = df.loc[squad_indices].sort_values(by=['Auction_Price'], ascending=False).reset_index(drop=True)
    xi_df = df.loc[xi_indices].sort_values(by=['Specific_Role', 'Auction_Price'], ascending=[True, False]).reset_index(drop=True)
    
    squad_cost = squad_df['Auction_Price'].sum()
    xi_cost = xi_df['Auction_Price'].sum()
    
    print("\n" + "="*50)
    print(" SQUAD OF 25 GENERATED ")
    print("="*50)
    print(f"Total Budget Used: {squad_cost:.1f} Cr (Limit: 100 Cr)")
    print(f"XI Cost: {xi_cost:.1f} Cr | Bench Cost: {squad_cost - xi_cost:.1f} Cr")
    
    print("\n" + "="*50)
    print(" THE OPTIMAL PLAYING XI ")
    print("="*50)
    print(f"{'Player':<20} | {'Role':<15} | {'Nat':<10} | {'Style':<10} | {'Price':<6} | {'Power'}")
    print("-" * 75)
    for _, row in xi_df.iterrows():
        name = str(row['Player'])[:18].title()
        role = str(row['Specific_Role'])[:14].title()
        nat = str(row['Nationality'])[:9].title()
        style = str(row['Bowling_Style'])[:9].title()
        print(f"{name:<20} | {role:<15} | {nat:<10} | {style:<10} | {row['Auction_Price']:<6.1f} | {row['Power_Index']:.1f}")
        
    squad_df.to_csv('data/squad_25.csv', index=False)
    xi_df.to_csv('data/playing_11.csv', index=False)
    print("\nData exported to data/squad_25.csv and data/playing_11.csv")

if __name__ == "__main__":
    optimize_two_stage('data/filled_ipl_data.csv')
