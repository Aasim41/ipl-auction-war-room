import pandas as pd
import os

# 1. Fix Nationalities
overseas_list = [
    'Pathum Nissanka', 'Ben Duckett', 'Lungi Ngidi', 'George Linde', 'Aiden Markram', 
    'Wanindu Hasaranga', 'Matthew Breetzke', 'Jacob Bethell', 'Jacob Duffy', 'Phil Salt', 
    'Dilshan Madushanka', 'Jack Edwards', 'Kamindu Mendis', 'David Payne', 'Brydon Carse', 
    'Finn Allen', 'Blessing Muzarabani', 'Sunil Narine', 'Tim Seifert', 'Will Jacks', 
    'AM Ghazanfar', 'Trent Boult', 'Glenn Phillips', 'Tom Banton', 'Luke Wood', 
    'Cooper Connolly', 'Ben Dwarshuis', 'Marcus Stoinis', 'Jamie Overton', 'Zakary Foulkes', 
    'Akeal Hosein', 'Matt Henry', 'Dasun Shanaka', 'Jofra Archer', 'Lhuan-dre Pretorius', 
    'Donovan Ferreira', 'Adam Milne', 'Kwena Maphaka'
]

df = pd.read_csv('data/filled_ipl_data.csv')
df.loc[df['Player'].isin(overseas_list), 'Nationality'] = 'Overseas'
df.to_csv('data/filled_ipl_data.csv', index=False)

# 2. Fix vanishing AI Best 11
with open('app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

old_block = """        with tabY:
            st.write("Let the War Room AI calculate the mathematically optimal 11 based on the venue constraints.")
            if st.button("🤖 Run AI Best 11", type="primary"):
                with st.spinner("Calculating optimal 11..."):
                    from backend.team_evaluator import run_real_squad_optimization, evaluate_and_render_11
                    _, xi_df = run_real_squad_optimization(squad_df)
                    evaluate_and_render_11(squad_df, xi_df, theme, budget_spent=total_budget - st.session_state.user_budget)"""

new_block = """        with tabY:
            st.write("Let the War Room AI calculate the mathematically optimal 11 based on the venue constraints.")
            if st.button("🤖 Run AI Best 11", type="primary"):
                with st.spinner("Calculating optimal 11..."):
                    from backend.team_evaluator import run_real_squad_optimization
                    _, xi_df = run_real_squad_optimization(squad_df)
                    st.session_state.ai_best_11 = xi_df
            
            if 'ai_best_11' in st.session_state:
                from backend.team_evaluator import evaluate_and_render_11
                evaluate_and_render_11(squad_df, st.session_state.ai_best_11, theme, budget_spent=total_budget - st.session_state.user_budget)"""

app_content = app_content.replace(old_block, new_block)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)
    
print("Fixed vanishing 11 and nationalities.")
