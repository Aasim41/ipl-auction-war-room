import pandas as pd
import json

bat = pd.read_csv('backend/data/temp_archive2/ipl_2026_batting.csv')
bowl = pd.read_csv('backend/data/temp_archive2/ipl_2026_bowling.csv')
sold = pd.read_csv('backend/data/IPL_Auction_2026_Sold_Player.csv')

print('Sold players by team:')
for team, group in sold.groupby('TeamName'):
    print(f'=== {team.strip()} ({len(group)}) ===')
    for _, row in group.iterrows():
        name = str(row['Name']).strip()
        nat = str(row['Nationality']).strip()
        bid = str(row['Winning Bid in Rs']).strip()
        print(f'  {name} ({nat}) - {bid}')
