with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the st.markdown call in Venue Optimizer
import re
# The original code has:
#     st.markdown(f"""
#         <div style="background: linear-gradient(135deg, {theme['accent']}22, {theme['accent']}44); border-left: 5px solid {theme['accent']}; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
# ...
#         </div>
#     """)
# We need to add unsafe_allow_html=True to it.

# Find the specific block and replace it
match = re.search(r'st\.markdown\(f"""\s*<div.*?</div>\s*"""\)', content, re.DOTALL)
if match:
    old_call = match.group(0)
    new_call = old_call.replace('""")', '""", unsafe_allow_html=True)')
    content = content.replace(old_call, new_call)
    
# Wait, there are TWO such blocks in Venue Optimizer. One for the venue header, one for the scouted player card.
matches = re.finditer(r'st\.markdown\(f"""\s*<div.*?</div>\s*"""\)', content, re.DOTALL)
for match in matches:
    old_call = match.group(0)
    new_call = old_call.replace('""")', '""", unsafe_allow_html=True)')
    content = content.replace(old_call, new_call)

# Also fix the Rookie Radar player card
matches = re.finditer(r'st\.markdown\(f"""\s*<div style="background-color: rgba\(255.*?</div>\s*"""\)', content, re.DOTALL)
for match in matches:
    old_call = match.group(0)
    new_call = old_call.replace('""")', '""", unsafe_allow_html=True)')
    content = content.replace(old_call, new_call)
    
with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed HTML in app.py")
