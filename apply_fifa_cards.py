import os

# 1. Update app.py - slots_open block
with open('app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

old_squad_block = """            st.markdown("### Your Finalized 25-Man Squad")
            from st_aggrid import AgGrid, GridOptionsBuilder, ColumnsAutoSizeMode
            final_display = retained_df[['Player', 'Role', 'Auction_Price', 'Power_Index']].sort_values(by='Power_Index', ascending=False)
            gb_final = GridOptionsBuilder.from_dataframe(final_display)
            gb_final.configure_pagination(paginationAutoPageSize=False, paginationPageSize=10)
            AgGrid(final_display, gridOptions=gb_final.build(), columns_auto_size_mode=ColumnsAutoSizeMode.FIT_CONTENTS, key='final_squad_display')"""

new_squad_block = """            st.markdown("### Your Finalized 25-Man Squad")
            from ui_helpers import get_fifa_card_html
            squad_sorted = retained_df.sort_values(by='Power_Index', ascending=False)
            cols = st.columns(4)
            for i, (_, row) in enumerate(squad_sorted.iterrows()):
                with cols[i % 4]:
                    st.markdown(get_fifa_card_html(row), unsafe_allow_html=True)"""

app_content = app_content.replace(old_squad_block, new_squad_block)

# 2. Update app.py - Manual Selection block
old_manual_block = """            # Render as unique CSS Cards instead of tables
            selected_11_names = []
            cols = st.columns(3)
            for idx, row in squad_df.iterrows():
                col = cols[idx % 3]
                with col:
                    st.markdown(f\"\"\"
                    <div class="player-card" style="padding: 10px; margin-bottom: 10px; border-left: 5px solid {theme['accent']}; background: rgba(0,0,0,0.1); border-radius: 8px;">
                        <strong style="color: {theme['accent']}">{row['Player']}</strong> {'✈️' if str(row.get('Nationality')).lower() == 'overseas' else ''}<br/>
                        <small>{str(row['Role']).title()}</small><br/>
                        <small>Power: {row['Power_Index']:.1f}</small>
                    </div>
                    \"\"\", unsafe_allow_html=True)
                    is_starter = st.checkbox(f"Start {row['Player']}", key=f"start_{row['Player']}")
                    if is_starter:
                        selected_11_names.append(row['Player'])"""

new_manual_block = """            # Render as unique CSS Cards instead of tables
            from ui_helpers import get_fifa_card_html
            selected_11_names = []
            cols = st.columns(4)
            for i, (_, row) in enumerate(squad_df.iterrows()):
                with cols[i % 4]:
                    st.markdown(get_fifa_card_html(row), unsafe_allow_html=True)
                    is_starter = st.checkbox(f"Start {row['Player']}", key=f"start_{row['Player']}")
                    if is_starter:
                        selected_11_names.append(row['Player'])"""

app_content = app_content.replace(old_manual_block, new_manual_block)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)

# 3. Update backend/team_evaluator.py
with open('backend/team_evaluator.py', 'r', encoding='utf-8') as f:
    eval_content = f.read()

old_eval_block = """    st.markdown("## 📋 The Optimal Starting XI")
    for i in range(0, len(xi_df), 4):
        cols = st.columns(4)
        for j in range(4):
            if i + j < len(xi_df):
                row = xi_df.iloc[i+j]
                icon = get_role_icon(row['Specific_Role'])
                ovs = " ✈️" if row.get('Nationality', '').lower() == 'overseas' else ""
                with cols[j]:
                    st.markdown(f\"\"\"
                        <div class="player-card">
                            <div class="player-name">{icon} {row['Player']}{ovs}</div>
                            <div class="player-price">{str(row['Specific_Role']).title()} | {row.get('Archetype', 'N/A')}</div>
                            <div class="player-price">Power Index: {row['Power_Index']:.1f}</div>
                        </div>
                    \"\"\", unsafe_allow_html=True)"""

new_eval_block = """    st.markdown("## 📋 The Optimal Starting XI")
    from ui_helpers import get_fifa_card_html
    cols = st.columns(4)
    for i, (_, row) in enumerate(xi_df.iterrows()):
        with cols[i % 4]:
            st.markdown(get_fifa_card_html(row), unsafe_allow_html=True)"""

eval_content = eval_content.replace(old_eval_block, new_eval_block)

with open('backend/team_evaluator.py', 'w', encoding='utf-8') as f:
    f.write(eval_content)

print("Applied FIFA cards everywhere.")
