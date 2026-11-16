import pandas as pd
from sqlalchemy import create_engine
import os
import shutil

source_csv = r"C:\Users\aasim\.gemini\antigravity\scratch\ipl_auction_optimizer\data\filled_ipl_data.csv"
target_csv = r"C:\Users\aasim\.gemini\antigravity\scratch\auctionxi\backend\data\players.csv"

if os.path.exists(source_csv):
    shutil.copy(source_csv, target_csv)
    print("Copied player data.")
else:
    print(f"Source data not found at {source_csv}")
    exit(1)

# Connect to SQLite
db_path = r"C:\Users\aasim\.gemini\antigravity\scratch\auctionxi\backend\auctionxi.db"
engine = create_engine(f'sqlite:///{db_path}')

# Load and process data
df = pd.read_csv(target_csv)

# Clean and transform
df = df.rename(columns={
    'Player': 'name',
    'Nationality': 'nationality',
    'Auction_Price': 'base_price',
    'Age': 'age',
    'Specific_Role': 'specific_role',
    'Bowling_Style': 'bowling_style',
    'Batting_SR': 'batting_sr',
    'Batting_Avg': 'batting_avg',
    'Bw_WPM': 'bowling_wpm',
    'Bowling_Econ': 'bowling_econ',
    'Matches_Played': 'matches_played'
})

df['player_id'] = df.index.astype(str)
df['is_overseas'] = df['nationality'].str.lower() == 'overseas'

WK_NAMES = {
    'ms dhoni', 'rishabh pant', 'heinrich klaasen', 'nicholas pooran', 
    'quinton de kock', 'sanju samson', 'ishan kishan', 'kl rahul', 
    'phil salt', 'jos buttler', 'jitesh sharma', 'dhruv jurel', 
    'dinesh karthik', 'wriddhiman saha', 'jonny bairstow', 'rahmanullah gurbaz',
    'matthew wade', 'ks bharat', 'tristan stubbs', 'glenn phillips',
    'shai hope', 'kusal mendis', 'kumar kushagra', 'abhisek porel', 'anuj rawat'
}

def map_role(r, name=""):
    r = str(r).lower()
    name = str(name).lower()
    
    if 'wk' in r or 'wicketkeeper' in r or name in WK_NAMES:
        return 'WK'
    elif 'batter' in r or 'top order' in r or 'middle order' in r:
        return 'BAT'
    elif 'bowler' in r or 'pace' in r or 'spin' in r:
        return 'BOWL'
    else:
        return 'AR'

df['role'] = df.apply(lambda row: map_role(row['specific_role'], row['name']), axis=1)
df['seasons_played'] = (df['matches_played'] / 14).fillna(0).astype(int)
df['capped_status'] = df['matches_played'].apply(lambda m: 'Capped' if m > 0 else 'Uncapped')

final_df = df[[
    'player_id', 'name', 'nationality', 'is_overseas', 'role', 'specific_role',
    'bowling_style', 'capped_status', 'base_price', 'Power_Index', 'batting_sr',
    'batting_avg', 'bowling_econ', 'bowling_wpm', 'matches_played', 'age', 'seasons_played'
]]

final_df.to_sql('players', engine, if_exists='replace', index=False)
print(f"Successfully seeded database with {len(final_df)} players and full statistics.")
