import os

with open('app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

# 1. Budget slider sync
old_budget = """total_budget = st.sidebar.slider("Total Budget (Cr)", min_value=50.0, max_value=150.0, value=120.0, step=1.0)
if st.session_state.app_phase == 'setup':
    st.session_state.user_budget = total_budget"""

new_budget = """total_budget = st.sidebar.slider("Total Budget (Cr)", min_value=50.0, max_value=150.0, value=st.session_state.get('total_budget', 120.0), step=1.0)
if 'total_budget' not in st.session_state:
    st.session_state.total_budget = 120.0

if total_budget != st.session_state.total_budget:
    diff = total_budget - st.session_state.total_budget
    st.session_state.total_budget = total_budget
    st.session_state.user_budget += diff

if st.session_state.app_phase == 'setup':
    st.session_state.user_budget = total_budget"""

app_content = app_content.replace(old_budget, new_budget)

# 2. Add get_next_bid
if "def get_next_bid" not in app_content:
    get_next_bid_code = """
def get_next_bid(current):
    if current < 2.0: return current + 0.1
    elif current < 10.0: return current + 0.25
    else: return current + 0.5
"""
    app_content = app_content.replace("def calculate_longevity_score(", get_next_bid_code + "\ndef calculate_longevity_score(")

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)


# 3. Add Impact Player simulator
with open('backend/team_evaluator.py', 'r', encoding='utf-8') as f:
    eval_content = f.read()

impact_player_code = """
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
                st.markdown(f\"\"\"
                <div style="background: linear-gradient(to right, {theme['accent']}33, rgba(0,255,0,0.1)); padding: 20px; border-radius: 10px; border-left: 5px solid {theme['accent']}; margin-top:10px;">
                    <h3 style="color:{theme['accent']}; margin-top:0;">🔄 Tactical Substitution Recommended</h3>
                    <p style="font-size: 18px; margin-bottom:5px;"><b>SUB OUT 🔻:</b> {sub_out['Player'].title()} (Starter)</p>
                    <p style="font-size: 18px; margin-bottom:15px;"><b>SUB IN 🔺:</b> {sub_in['Player'].title()} (Impact Player)</p>
                    <hr style="border-color: rgba(255,255,255,0.2);">
                    <p style="color: #DDDDDD; margin-bottom:0;"><i><b>Coach Rationale:</b> {rationale}</i></p>
                </div>
                \"\"\", unsafe_allow_html=True)
            else:
                st.warning("Could not find a valid substitution pair on the bench for this specific scenario.")
"""

eval_content = eval_content + impact_player_code
with open('backend/team_evaluator.py', 'w', encoding='utf-8') as f:
    f.write(eval_content)
    
print("Fixed slider, impact player, and get_next_bid")
