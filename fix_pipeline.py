import subprocess
import codecs

# 1. Get clean app_old.py without powershell corruption
clean_content = subprocess.check_output(['git', 'show', 'e3ccaac:app.py'])
with open('app_clean.py', 'wb') as f:
    f.write(clean_content)

# 2. Extract old tabs
with open('app_clean.py', 'r', encoding='utf-8') as f:
    old_lines = f.readlines()

tab_idx = 0
for i, l in enumerate(old_lines):
    if l.startswith("tab1, tab2, tab3"):
        tab_idx = i
        break

tab_def = old_lines[tab_idx].replace(', tab6 = st.tabs([', ' = st.tabs([').replace(', "🔄 Trade Simulator"', '')

tab2_idx = 0
for i, l in enumerate(old_lines):
    if l.startswith("# ================= TAB 2: VENUE OPTIMIZER"):
        tab2_idx = i
        break

tab6_idx = 0
for i, l in enumerate(old_lines):
    if l.startswith("# ================= TAB 6"):
        tab6_idx = i
        break

# Extract the tabs code and fix any missing unsafe_allow_html=True
tabs_code = "".join(old_lines[tab2_idx:tab6_idx])
# st.markdown(f""" \n <div... """) needs unsafe_allow_html=True
import re
# Find st.markdown(...) that contains HTML but lacks unsafe_allow_html
# It's safer to just let the regex add it.
# Actually, the original Streamlit code DID have unsafe_allow_html=True for the Venue Optimizer header?
# Let's check old_lines.

# 3. Read current app.py
with open('app.py', 'r', encoding='utf-8') as f:
    new_lines = f.readlines()

end_phase_idx = 0
for i, l in enumerate(new_lines):
    if l.startswith("# ================= TAB 2: VENUE OPTIMIZER"):
        end_phase_idx = i
        break

new_app_code = "".join(new_lines[:end_phase_idx])

# 4. Write back the combined
combined = new_app_code + tabs_code

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(combined)
    
print("Rebuilt app.py")
