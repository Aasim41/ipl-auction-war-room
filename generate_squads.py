import pandas as pd
import numpy as np

df = pd.read_csv('data/filled_ipl_data.csv')

teams = [
    'Chennai Super Kings (CSK)',
    'Delhi Capitals (DC)',
    'Gujarat Titans (GT)',
    'Kolkata Knight Riders (KKR)',
    'Lucknow Super Giants (LSG)',
    'Mumbai Indians (MI)',
    'Punjab Kings (PBKS)',
    'Rajasthan Royals (RR)',
    'Royal Challengers Bengaluru (RCB)',
    'Sunrisers Hyderabad (SRH)'
]

# We will assign teams to all players. To ensure 25 max per team, we can shuffle and distribute.
np.random.seed(42)  # For reproducibility

# Ensure some iconic players go to their actual teams
iconic_mappings = {
    'MS Dhoni': 'Chennai Super Kings (CSK)',
    'Virat Kohli': 'Royal Challengers Bengaluru (RCB)',
    'Rohit Sharma': 'Mumbai Indians (MI)',
    'Jasprit Bumrah': 'Mumbai Indians (MI)',
    'Hardik Pandya': 'Mumbai Indians (MI)',
    'Rishabh Pant': 'Lucknow Super Giants (LSG)',
    'Shreyas Iyer': 'Punjab Kings (PBKS)',
    'KL Rahul': 'Delhi Capitals (DC)',
    'Ruturaj Gaikwad': 'Chennai Super Kings (CSK)',
    'Sanju Samson': 'Rajasthan Royals (RR)',
    'Yashasvi Jaiswal': 'Rajasthan Royals (RR)',
    'Shubman Gill': 'Gujarat Titans (GT)',
    'Rashid Khan': 'Gujarat Titans (GT)',
    'Pat Cummins': 'Sunrisers Hyderabad (SRH)',
    'Heinrich Klaasen': 'Sunrisers Hyderabad (SRH)',
    'Rinku Singh': 'Kolkata Knight Riders (KKR)',
    'Sunil Narine': 'Kolkata Knight Riders (KKR)',
}

assigned = []
team_counts = {t: 0 for t in teams}

# Sort df so highest price/power get assigned first if needed, but random is fine.
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

for _, row in df.iterrows():
    player_team = None
    # Check iconic mapping
    for key, t in iconic_mappings.items():
        if key.lower() in row['Player'].lower() and team_counts[t] < 25:
            player_team = t
            break
            
    if not player_team:
        # Assign to random team that has < 25 players
        available_teams = [t for t in teams if team_counts[t] < 25]
        if available_teams:
            player_team = np.random.choice(available_teams)
        else:
            player_team = 'Unsold'
            
    if player_team != 'Unsold':
        team_counts[player_team] += 1
    
    assigned.append({'Player': row['Player'], 'Current_Team': player_team})

pd.DataFrame(assigned).to_csv('data/current_squads.csv', index=False)
print("Saved data/current_squads.csv")
