with open('app_clean.py', 'r', encoding='utf-8') as f:
    clean_lines = f.readlines()

longevity_fn = ""
for i, l in enumerate(clean_lines):
    if l.startswith("def calculate_longevity_score("):
        longevity_fn = "".join(clean_lines[i:i+17])
        break

with open('app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Insert it right after the imports
app_content = app_content.replace(
    "import pandas as pd",
    "import pandas as pd\n\n" + longevity_fn + "\n"
)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)
    
print("Injected longevity score function successfully.")
