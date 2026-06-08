import pulp
import pandas as pd
import streamlit as st
from streamlit_lottie import st_lottie

def get_role_icon(role):
    role = role.lower()
    if 'order' in role: return "🏏"
    elif 'bowler' in role: return "⚾"
    elif 'all-rounder' in role: return "🏏⚾"
    return ""

def calculate_chemistry(xi_df):
    score = 100
    insights = []
    archetypes = []
    
    # Assign Archetypes based on Stats
    for _, row in xi_df.iterrows():
        arch = "Balanced"
        role = row['Specific_Role']
        
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
    
    # Analyze Synergies
    top_order = xi_df[xi_df['Specific_Role'] == 'top order']
    if not top_order.empty:
        top_archs = top_order['Archetype'].tolist()
        if len(top_archs) > 1 and all(a == 'Aggressor' for a in top_archs):
            score -= 15
            insights.append(("⚠️ High Risk", "Your entire Top Order consists of hyper-aggressive batters. You risk an early collapse.", "#FFA500"))
        elif len(top_archs) > 1 and all(a == 'Anchor' for a in top_archs):
            score -= 15
            insights.append(("⚠️ Slow Start", "Your entire Top Order consists of Anchors. You might struggle to utilize the Powerplay.", "#FFA500"))
        else:
            insights.append(("✅ Balanced Opening", "Great mix of aggression and stability in your Top Order.", "#00FF00"))
            
    mid_and_ar = xi_df[xi_df['Specific_Role'].isin(['middle order', 'all-rounder'])]
    if not mid_and_ar.empty:
        if 'Aggressor' not in mid_and_ar['Archetype'].values:
            score -= 15
            insights.append(("⚠️ Weak Finish", "You lack an 'Aggressor' in the middle/lower order to close out the innings.", "#FFA500"))
        else:
            insights.append(("✅ Finisher Present", "You have aggressive finishers to accelerate in the death overs.", "#00FF00"))
            
    spinners = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'] == 'spin')]
    if len(spinners) > 1:
        if spinners['Archetype'].nunique() == 1:
            score -= 10
            insights.append(("⚠️ Spin Predictability", "Your specialist spinners share the exact same style/archetype.", "#FFA500"))
        else:
            insights.append(("✅ Spin Variety", "Good variety in your spin attack.", "#00FF00"))
            
    pacers = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'].str.contains('pace|fast', na=False))]
    if len(pacers) >= 2:
        if all(a == 'Strike Bowler' for a in pacers['Archetype']):
            score -= 10
            insights.append(("⚠️ Expensive Pace Attack", "Your pacers are all 'Strike Bowlers' who leak runs.", "#FFA500"))
        else:
            insights.append(("✅ Balanced Pace", "Your pace attack has a good mix of strike ability and economy.", "#00FF00"))
            
    return max(0, score), insights, xi_df

def run_real_squad_optimization(squad_df):
    prob = pulp.LpProblem("IPL_Real_Squad_Optimization", pulp.LpMaximize)
    squad_df = squad_df.copy().reset_index(drop=True)
    xi_vars = pulp.LpVariable.dicts("XI", squad_df.index, cat='Binary')
    
    prob += pulp.lpSum([squad_df.loc[i, 'Power_Index'] * xi_vars[i] for i in squad_df.index]), "Objective"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index]) == 11, "XI_Size"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index if squad_df.loc[i, 'Nationality'].lower() == 'overseas']) <= 4, "Max_Ovs"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index if 'bowler' in squad_df.loc[i, 'Specific_Role'] or 'all-rounder' in squad_df.loc[i, 'Specific_Role']]) >= 5, "Min_Bowlers"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index if 'order' in squad_df.loc[i, 'Specific_Role'] or 'all-rounder' in squad_df.loc[i, 'Specific_Role']]) >= 4, "Min_Batters"
    
    status = prob.solve(pulp.PULP_CBC_CMD(msg=False, timeLimit=10))
    
    if status != pulp.LpStatusOptimal:
        xi_indices = squad_df.sort_values(by='Power_Index', ascending=False).head(11).index.tolist()
    else:
        xi_indices = [i for i in squad_df.index if xi_vars[i].varValue == 1.0]
        
    xi_df = squad_df.loc[xi_indices].sort_values(by=['Specific_Role', 'Auction_Price'], ascending=[True, False]).reset_index(drop=True)
    return squad_df, xi_df

def evaluate_and_render_11(squad_df, xi_df, theme, budget_spent):
    chem_score, insights, xi_df = calculate_chemistry(xi_df)
    xi_power = xi_df['Power_Index'].sum()
    
    st.success(f"Successfully generated Playing XI! (Power: {xi_power:.1f} | Synergy: {chem_score}%)")
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Budget Spent", f"₹ {budget_spent:.1f} Cr")
    col2.metric("Total XI Power Score", f"{xi_power:.1f}")
    col3.metric("Squad Size", f"{len(squad_df)}")
    col4.metric("Team Chemistry", f"{chem_score}%")
    
    st.markdown("---")
    st.markdown("## 🧠 Digital Coach Analysis")
    for title, desc, color in insights:
        st.markdown(f'<div class="coach-alert" style="border-color: {color};"><strong style="color: {color};">{title}</strong>: {desc}</div>', unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("## 🏏 The Optimal Starting XI")
    
    # Sort xi_df into proper batting order
    role_order = {
        'top order': 1,
        'top order batter': 1,
        'middle order': 2,
        'middle order batter': 2,
        'all-rounder': 3,
        'bowler': 4
    }
    xi_copy = xi_df.copy()
    xi_copy['Batting_Order'] = xi_copy['Specific_Role'].str.lower().map(role_order).fillna(5)
    xi_copy = xi_copy.sort_values(by=['Batting_Order', 'Power_Index'], ascending=[True, False]).drop('Batting_Order', axis=1).reset_index(drop=True)

    from ui_helpers import get_fifa_card_html
    
    for i in range(0, len(xi_copy), 4):
        cols = st.columns(4)
        for j in range(4):
            if i + j < len(xi_copy):
                row = xi_copy.iloc[i+j]
                with cols[j]:
                    st.markdown(get_fifa_card_html(row), unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("## 🔄 Live Game Changer (Impact Player Simulator)")
    st.write("Using strict IPL rules (must sub an Indian), simulate scenarios and let the Decision Tree find your best impact substitute.")
    
    scenario = st.selectbox("Select Match Scenario:", [
        "Chasing 200+ (Need Aggression)", 
        "Defending Low Total (Need Wickets)", 
        "Spin-Friendly Pitch (Middle Over Choke)",
        "Early Collapse (Stabilize Innings)",
        "Pace-Friendly Pitch (Seam Movement)"
    ])
    
    if st.button("Simulate tactical Sub"):
        bench_df = squad_df[~squad_df['Player'].isin(xi_df['Player'])]
        ind_bench = bench_df[bench_df['Nationality'] == 'indian']
        
        sub_in = None
        sub_out = None
        rationale = ""
        
        if ind_bench.empty:
            st.warning("No Indian players on the bench available for substitution.")
        else:
            if scenario == "Chasing 200+ (Need Aggression)":
                batters = ind_bench[ind_bench['Role'].str.contains('batter|all-rounder', case=False, na=False)]
                if not batters.empty:
                    sub_in = batters.sort_values(by='Batting_SR', ascending=False).iloc[0]
                bowlers = xi_df[xi_df['Specific_Role'] == 'bowler']
                if not bowlers.empty:
                    sub_out = bowlers.sort_values(by='Batting_Avg', ascending=True).iloc[0]
                rationale = f"Swapping out a pure bowler for a hyper-aggressive batter to provide extreme firepower in the chase."
                
            elif scenario == "Defending Low Total (Need Wickets)":
                bowlers = ind_bench[ind_bench['Role'].str.contains('bowler|all-rounder', case=False, na=False)]
                if not bowlers.empty:
                    sub_in = bowlers.sort_values(by='Power_Index', ascending=False).iloc[0]
                batters = xi_df[xi_df['Specific_Role'] == 'top order']
                if not batters.empty:
                    sub_out = batters.iloc[-1]
                rationale = "Sacrificing a pure batter for a strike bowler to guarantee full 20 overs of high-quality, wicket-taking pace/spin."
                
            elif scenario == "Spin-Friendly Pitch (Middle Over Choke)":
                spinners = ind_bench[ind_bench['Bowling_Style'].str.contains('spin', case=False, na=False)]
                if not spinners.empty:
                    sub_in = spinners.sort_values(by='Power_Index', ascending=False).iloc[0]
                pacers = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'].str.contains('pace|fast', case=False, na=False))]
                if not pacers.empty:
                    sub_out = pacers.iloc[-1]
                rationale = "The pitch is turning square. Swapping out a fast bowler for a specialist Indian spinner to choke the middle overs."
                
            elif scenario == "Early Collapse (Stabilize Innings)":
                batters = ind_bench[ind_bench['Role'].str.contains('batter|all-rounder', case=False, na=False)]
                if not batters.empty:
                    sub_in = batters.sort_values(by='Batting_Avg', ascending=False).iloc[0]
                bowlers = xi_df[xi_df['Specific_Role'] == 'bowler']
                if not bowlers.empty:
                    sub_out = bowlers.sort_values(by='Batting_Avg', ascending=True).iloc[0]
                rationale = f"Disaster strikes early! Bringing in an Anchor to stabilize the innings and bat deep."
                
            elif scenario == "Pace-Friendly Pitch (Seam Movement)":
                pacers = ind_bench[ind_bench['Bowling_Style'].str.contains('pace|fast', case=False, na=False)]
                if not pacers.empty:
                    sub_in = pacers.sort_values(by='Power_Index', ascending=False).iloc[0]
                spinners = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'].str.contains('spin', case=False, na=False))]
                if not spinners.empty:
                    sub_out = spinners.iloc[0]
                rationale = "Green top detected! Swapping out a spinner for a specialist Indian pacer to exploit the seam movement."

            if sub_in is not None and sub_out is not None:
                st.markdown(f"""
                <div style="background: linear-gradient(to right, {theme['accent']}33, rgba(0,255,0,0.1)); padding: 20px; border-radius: 10px; border-left: 5px solid {theme['accent']}; margin-top:10px;">
                    <h3 style="color:{theme['accent']}; margin-top:0;">🔄 Tactical Substitution Recommended</h3>
                    <p style="font-size: 18px; margin-bottom:5px;"><b>SUB OUT 🔻:</b> {sub_out['Player'].title()} (Starter)</p>
                    <p style="font-size: 18px; margin-bottom:15px;"><b>SUB IN 🔺:</b> {sub_in['Player'].title()} (Impact Player)</p>
                    <hr style="border-color: rgba(255,255,255,0.2);">
                    <p style="color: #DDDDDD; margin-bottom:0;"><i><b>Coach Rationale:</b> {rationale}</i></p>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.warning("Could not find a valid substitution pair on the bench for this specific scenario.")
