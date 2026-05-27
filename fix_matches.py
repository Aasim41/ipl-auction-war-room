import pandas as pd
import json

df = pd.read_csv('data/filled_ipl_data.csv')
with open('data/IPL_Stat_with_season_All_Player_who_played_in_2016_2025.json', 'r') as f:
    stats = json.load(f)

for idx, row in df.iterrows():
    player = row['Player']
    if player in stats:
        matches = sum(t.get('Matches', 0) for t in stats[player].get('op_team', {}).values())
        df.at[idx, 'Matches_Played'] = matches
    else:
        df.at[idx, 'Matches_Played'] = 0

df.to_csv('data/filled_ipl_data.csv', index=False)

zeros = df[df['Matches_Played'] == 0]
print(f"Fixed matches. Total rookies found: {len(zeros)}")
print(zeros[['Player']].head(10))
