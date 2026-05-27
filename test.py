import json

with open('data/short_name_to_full_name.json', 'r') as f:
    name_map = json.load(f)
with open('data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json', 'r') as f:
    stats = json.load(f)

for short in ["V Kohli", "SA Yadav", "J Fraser-McGurk", "RP Singh"]:
    full = name_map.get(short)
    if not full:
        print(f"{short}: No map")
    elif full not in stats:
        print(f"{short}: Mapped to '{full}', but not in stats")
        if short in stats:
            print(f"  Wait! '{short}' IS in stats directly!")
    else:
        print(f"{short}: Mapped to '{full}', Keys: {stats[full].keys()}")
