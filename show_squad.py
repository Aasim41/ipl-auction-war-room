with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """        if slots_open <= 0:
            st.success("Your squad is full! (25 players maximum)")
            if st.button("Proceed to Playing 11 🏏", type="primary"):"""

new_block = """        if slots_open <= 0:
            st.success("Your squad is full! (25 players maximum)")
            
            st.markdown("### Your Finalized 25-Man Squad")
            from st_aggrid import AgGrid, GridOptionsBuilder, ColumnsAutoSizeMode
            final_display = retained_df[['Player', 'Role', 'Auction_Price', 'Power_Index']].sort_values(by='Power_Index', ascending=False)
            gb_final = GridOptionsBuilder.from_dataframe(final_display)
            gb_final.configure_pagination(paginationAutoPageSize=False, paginationPageSize=10)
            AgGrid(final_display, gridOptions=gb_final.build(), columns_auto_size_mode=ColumnsAutoSizeMode.FIT_CONTENTS, key='final_squad_display')
            
            st.info("Click the button below to advance to the final phase and ask the AI to select your optimal playing 11 from this roster!")
            if st.button("Proceed to Playing 11 🏏", type="primary"):"""

content = content.replace(old_block, new_block)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)
