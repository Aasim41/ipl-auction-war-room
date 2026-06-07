import pandas as pd
from thefuzz import process, fuzz
import urllib.request
import io

df_pool = pd.read_csv('data/filled_ipl_data.csv')
pool_names = df_pool['Player'].tolist()

url = "https://en.wikipedia.org/wiki/2025_Indian_Premier_League"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read()
dfs = pd.read_html(io.StringIO(html.decode('utf-8')), flavor='bs4')

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

# We need to map actual names from wiki to pool names. Let's just find tables that contain columns like 'Player' or 'Name'
squad_mapping = []

for idx, t in enumerate(dfs):
    if 'Player' in t.columns:
        print(f"Table {idx} has Player column")
        print(t.head(2))

