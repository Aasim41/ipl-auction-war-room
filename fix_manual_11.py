with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_manual_eval = """            if st.button("🏏 Evaluate Manual 11"):
                if len(selected_11_names) != 11:
                    st.error(f"You must select exactly 11 players. Currently selected: {len(selected_11_names)}")
                else:
                    xi_df = squad_df[squad_df['Player'].isin(selected_11_names)]
                    from backend.team_evaluator import evaluate_and_render_11
                    evaluate_and_render_11(squad_df, xi_df, theme, budget_spent=total_budget - st.session_state.user_budget)"""

new_manual_eval = """            if st.button("🏏 Evaluate Manual 11"):
                if len(selected_11_names) != 11:
                    st.error(f"You must select exactly 11 players. Currently selected: {len(selected_11_names)}")
                else:
                    xi_df = squad_df[squad_df['Player'].isin(selected_11_names)]
                    st.session_state.manual_11 = xi_df
            
            if 'manual_11' in st.session_state:
                from backend.team_evaluator import evaluate_and_render_11
                evaluate_and_render_11(squad_df, st.session_state.manual_11, theme, budget_spent=total_budget - st.session_state.user_budget)"""

content = content.replace(old_manual_eval, new_manual_eval)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Fixed manual 11 vanishing issue.")
