import re

with open('app_clean.py', 'r', encoding='utf-8') as f:
    clean_lines = f.readlines()

longevity_fn = ""
for i, l in enumerate(clean_lines):
    if l.startswith("def calculate_longevity_score("):
        longevity_fn = "".join(clean_lines[i:i+17])
        break

with open('app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

# 1. Insert calculate_longevity_score after evaluate_and_render_11
app_content = app_content.replace(
    "def get_next_bid(current_bid):",
    longevity_fn + "\n\ndef get_next_bid(current_bid):"
)

# 2. Add budget slider to sidebar
# We'll put it right after the Home Ground selectbox
sidebar_budget_code = """
st.sidebar.markdown("### 💰 Franchise Purse")
total_budget = st.sidebar.slider("Total Budget (Cr)", min_value=50.0, max_value=150.0, value=120.0, step=1.0)
if st.session_state.app_phase == 'setup':
    st.session_state.user_budget = total_budget
"""
app_content = app_content.replace(
    "if st.sidebar.button(\"🔄 Reset to Setup Phase\"):",
    sidebar_budget_code + "\nif st.sidebar.button(\"🔄 Reset to Setup Phase\"):"
)

# 3. Replace hardcoded 120.0 references
# st.session_state.user_budget = 120.0 - cost -> st.session_state.user_budget = total_budget - cost
app_content = app_content.replace(
    "st.session_state.user_budget = 120.0 - cost",
    "st.session_state.user_budget = total_budget - cost"
)

# budget_spent=120.0 - st.session_state.user_budget -> budget_spent=total_budget - st.session_state.user_budget
app_content = app_content.replace(
    "budget_spent=120.0 - st.session_state.user_budget",
    "budget_spent=total_budget - st.session_state.user_budget"
)

# Also fix the text in Tab 4 "within your ₹ 100 Cr budget!"
app_content = re.sub(
    r"within your ₹ \d+ Cr budget!",
    "within your total budget!",
    app_content
)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)
    
print("Fixed longevity and budget")
