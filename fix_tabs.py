with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Mock Auction
old_mock = """    # Dashboard metrics

    col1, col2, col3 = st.columns(3)"""
new_mock = """    if st.session_state.auction_pool.empty:
        st.warning("⚠️ You must complete the Retention Phase in the War Room to generate the Auction Pool first!")
    else:
        # Dashboard metrics
    
        col1, col2, col3 = st.columns(3)"""

# Indent the rest of the mock auction tab
mock_lines = content.split("    col1, col2, col3 = st.columns(3)")[1].split("with tab5:")[0]
old_mock_full = old_mock + mock_lines

new_mock_lines = "\n".join(["    " + line if line.strip() else line for line in mock_lines.split("\n")])
new_mock_full = new_mock + new_mock_lines

content = content.replace(old_mock_full, new_mock_full)

# Fix Analytics
old_analytics = """    if 'squad_df' not in st.session_state:

        st.warning("⚠️ You must run the Optimizer in the War Room first to generate analytics.")

    else:

        squad_df = st.session_state['squad_df']"""
        
new_analytics = """    squad_names = st.session_state.get('retained_players', [])
    if not squad_names:
        st.warning("⚠️ You must retain or buy players in the War Room first to generate analytics.")
    else:
        squad_df = df[df['Player'].isin(squad_names)]"""

# Note: st.session_state['squad_df'] appears in app.py with extra newlines possibly due to formatting
# Let's use a safer regex or just find/replace specifically
import re
content = re.sub(
    r"if 'squad_df' not in st\.session_state:.*?squad_df = st\.session_state\['squad_df'\]",
    new_analytics,
    content,
    flags=re.DOTALL
)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)
