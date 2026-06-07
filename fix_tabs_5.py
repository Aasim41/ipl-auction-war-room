with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "if 'squad_df' not in st.session_state:" in line:
        new_lines.append("    squad_names = st.session_state.get('retained_players', [])\n")
        new_lines.append("    if not squad_names:\n")
        continue
    if 'st.warning("⚠️ You must run the Optimizer in the War Room first to generate analytics.")' in line:
        new_lines.append('        st.warning("⚠️ You must retain or buy players in the War Room first to generate analytics.")\n')
        continue
    if "squad_df = st.session_state['squad_df']" in line:
        new_lines.append("        squad_df = df[df['Player'].isin(squad_names)]\n")
        continue
    
    new_lines.append(line)

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
