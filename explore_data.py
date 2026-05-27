import json
import os

files_to_check = [
    'data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json',
    'IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json',
    'C:/Users/aasim/.gemini/antigravity/scratch/ipl_auction_optimizer/data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json'
]

file_path = None
for p in files_to_check:
    if os.path.exists(p):
        file_path = p
        break

if not file_path:
    print("File not found!")
else:
    print(f"Loading from {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print("Type of data:", type(data))
    if isinstance(data, dict):
        print("Keys at root level:", list(data.keys())[:10])
        # Print a sample from the first key
        first_key = list(data.keys())[0]
        print(f"Sample data for key '{first_key}':", str(data[first_key])[:500])
    elif isinstance(data, list):
        print("Number of items:", len(data))
        print("Sample item:", str(data[0])[:500])
