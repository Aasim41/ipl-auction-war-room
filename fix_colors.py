with open('ui_helpers.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Remove the Tier colors block and replace with a unified premium style
old_block_pattern = r"# Determine Tier colors.*?else:.*?border = \"#DEB887\""
new_block = """# Unified premium dark glass style for all cards
    bg = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    color = "#ffffff"
    border = "rgba(255,255,255,0.2)\""""

# We can also just use regex
content = re.sub(old_block_pattern, new_block, content, flags=re.DOTALL)

with open('ui_helpers.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Unified colors applied.")
