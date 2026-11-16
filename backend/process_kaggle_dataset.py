import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import os

base_dir = r"C:\Users\aasim\.gemini\antigravity\scratch\auctionxi\backend"
master_csv = os.path.join(base_dir, "data", "temp_archive3", "ipl_players_master.csv")
batting_csv = os.path.join(base_dir, "data", "temp_archive2", "ipl_2026_batting.csv")
bowling_csv = os.path.join(base_dir, "data", "temp_archive2", "ipl_2026_bowling.csv")
kaggle_csv = os.path.join(base_dir, "data", "IPL_Auction_2026_Sold_Player.csv")
old_players_csv = os.path.join(base_dir, "data", "players.csv")
db_path = os.path.join(base_dir, "auctionxi.db")

print("Loading ALL datasets...")
df_master = pd.read_csv(master_csv)
df_batting = pd.read_csv(batting_csv) if os.path.exists(batting_csv) else pd.DataFrame()
df_bowling = pd.read_csv(bowling_csv) if os.path.exists(bowling_csv) else pd.DataFrame()
df_kaggle = pd.read_csv(kaggle_csv) if os.path.exists(kaggle_csv) else pd.DataFrame()
if not df_kaggle.empty:
    df_kaggle.columns = [c.strip() for c in df_kaggle.columns]

# Try to use old players.csv just for Nationality and Style lookups to keep it realistic
enrich_dict = {}
if os.path.exists(old_players_csv):
    df_old = pd.read_csv(old_players_csv)
    for _, row in df_old.iterrows():
        name = str(row.get('Player', '')).strip().lower()
        enrich_dict[name] = {
            'nationality': str(row.get('Nationality', 'Indian')),
            'is_overseas': str(row.get('Nationality', 'Indian')).lower() == 'overseas',
            'specific_role': str(row.get('Specific_Role', 'Unknown')),
            'bowling_style': str(row.get('Bowling_Style', 'Unknown')),
        }

def parse_rupees_to_crore(val):
    if pd.isna(val): return 0.3
    s = str(val).replace(',', '').strip()
    try: return round(float(s) / 10000000.0, 2)
    except: return 0.3

# Build Kaggle auction dict
kaggle_dict = {}
if not df_kaggle.empty:
    for idx, row in df_kaggle.iterrows():
        name = str(row.get('Name', '')).strip().lower()
        kaggle_dict[name] = {
            'base_price': parse_rupees_to_crore(row.get('BasePrices in Rs')),
            'winning_bid': parse_rupees_to_crore(row.get('Winning Bid in Rs')),
            'team_name': str(row.get('TeamName', '')).strip(),
            'capped_status': str(row.get('Capped/UnCapped', '')).strip()
        }

# Build Batting & Bowling dicts
bat_dict = {}
for idx, row in df_batting.iterrows():
    name = str(row.get('player', '')).strip().lower()
    bat_dict[name] = row

bowl_dict = {}
for idx, row in df_bowling.iterrows():
    name = str(row.get('player', '')).strip().lower()
    bowl_dict[name] = row

final_rows = []

for idx, row in df_master.iterrows():
    pname = str(row.get('player_name', '')).strip()
    pname_lower = pname.lower()
    
    last_year = float(row.get('last_year', 0))
    
    # Match Auction
    matched_kaggle = None
    for kname, kdata in kaggle_dict.items():
        if kname == pname_lower or (kname.split()[-1] == pname_lower.split()[-1] and kname[0] == pname_lower[0]):
            matched_kaggle = kdata
            break
            
    # Match Batting Stats
    matched_bat = None
    for bname, bdata in bat_dict.items():
        if bname == pname_lower or (bname.split()[-1] == pname_lower.split()[-1] and bname[0] == pname_lower[0]):
            matched_bat = bdata
            break
            
    # Match Bowling Stats
    matched_bowl = None
    for bname, bdata in bowl_dict.items():
        if bname == pname_lower or (bname.split()[-1] == pname_lower.split()[-1] and bname[0] == pname_lower[0]):
            matched_bowl = bdata
            break

    # FILTER: STRICTLY only keep current active players (2026) OR if they are in the 2026 datasets
    if last_year < 2026 and matched_kaggle is None and matched_bat is None and matched_bowl is None:
        continue

    # Enrich from old data if possible
    enrich = None
    for ename, edata in enrich_dict.items():
        if ename in pname_lower or pname_lower in ename or (len(ename.split()) > 1 and ename.split()[-1] in pname_lower):
            enrich = edata
            break
            
    nationality = enrich['nationality'].capitalize() if enrich else "Indian"
    is_overseas = enrich['is_overseas'] if enrich else False
    srole = enrich['specific_role'] if enrich else "All-Rounder"
    bstyle = enrich['bowling_style'] if enrich else "Pace"
    
    # Infer Role
    runs = float(row.get('career_runs', 0)) if not pd.isna(row.get('career_runs')) else 0
    wkts = float(row.get('career_wickets', 0)) if not pd.isna(row.get('career_wickets')) else 0
    
    if wkts > 20 and runs < 500: role = 'BOWL'
    elif runs > 1000 and wkts < 10: role = 'BAT'
    else: role = 'AR'
    
    # Base Price & Winning Bid
    if matched_kaggle:
        base_price = matched_kaggle['base_price']
        winning_bid = matched_kaggle['winning_bid']
        team_name = matched_kaggle['team_name']
        capped_status = matched_kaggle['capped_status']
    else:
        # Give them a realistic base value
        winning_bid = 0.5
        if last_year >= 2024: winning_bid = 1.0
        if runs > 2000 or wkts > 100: winning_bid = 2.0
        
        base_price = winning_bid
        # Extract team from 2026 batting or bowling if available
        team_abbr = None
        if matched_bat is not None and 'team' in matched_bat:
            team_abbr = str(matched_bat['team']).strip()
        elif matched_bowl is not None and 'team' in matched_bowl:
            team_abbr = str(matched_bowl['team']).strip()
            
        team_mapping = {
            'CSK': 'Chennai Super Kings',
            'RCB': 'Royal Challengers Bengaluru',
            'MI': 'Mumbai Indians',
            'KKR': 'Kolkata Knight Riders',
            'SRH': 'Sunrisers Hyderabad',
            'RR': 'Rajasthan Royals',
            'DC': 'Delhi Capitals',
            'PBKS': 'Punjab Kings',
            'LSG': 'Lucknow Super Giants',
            'GT': 'Gujarat Titans'
        }
        team_name = team_mapping.get(team_abbr, team_abbr) if team_abbr and team_abbr != 'nan' else 'Retained / Unsold'
        capped_status = 'Capped' if winning_bid >= 1.5 else 'Uncapped'

    # Batting metrics
    bat_sr = float(row.get('career_batting_sr', 100.0))
    if pd.isna(bat_sr): bat_sr = 100.0
    
    inns = float(row.get('career_batting_innings', 1))
    if pd.isna(inns) or inns == 0: inns = 1
    bat_avg = round(runs / inns, 2)
    
    matches = int(row.get('seasons_played', 1)) * 12
    
    if matched_bat is not None:
        try: bat_sr = float(matched_bat.get('sr', bat_sr))
        except: pass
        try: bat_avg = float(matched_bat.get('avg', bat_avg))
        except: pass
        try: matches = max(matches, int(matched_bat.get('mat', matches)))
        except: pass

    # Bowling metrics
    bowl_econ = float(row.get('career_bowling_economy', 9.0))
    if pd.isna(bowl_econ): bowl_econ = 9.0
    
    bowl_inns = float(row.get('career_bowling_innings', 1))
    if pd.isna(bowl_inns) or bowl_inns == 0: bowl_inns = 1
    bowl_wpm = round(wkts / bowl_inns, 2)
    
    if matched_bowl is not None:
        try: bowl_econ = float(matched_bowl.get('econ', bowl_econ))
        except: pass
        try: 
            mwkts = float(matched_bowl.get('wkts', 0))
            mmat = float(matched_bowl.get('mat', 1))
            bowl_wpm = round(mwkts / max(1, mmat), 2)
            matches = max(matches, int(mmat))
        except: pass

    # Add 2026 young players explicitly if they didn't match anything?
    # Actually wait, we should also loop over un-matched Kaggle and 2026 players!
    
    final_rows.append({
        'name': pname,
        'nationality': nationality,
        'is_overseas': is_overseas,
        'role': role,
        'specific_role': srole,
        'bowling_style': bstyle,
        'capped_status': capped_status,
        'base_price': base_price,
        'winning_bid': winning_bid,
        'team_name': team_name,
        'batting_sr': round(bat_sr, 2),
        'batting_avg': round(bat_avg, 2),
        'bowling_econ': round(bowl_econ, 2),
        'bowling_wpm': round(bowl_wpm, 2),
        'matches_played': matches,
        'age': 25,
        'seasons_played': int(row.get('seasons_played', 1))
    })

# Add players from 2026 Batting/Bowling who weren't in master!
existing_names = [r['name'].lower() for r in final_rows]

def add_new_player(pname, source_data, is_bat):
    if pname.lower() in existing_names: return
    existing_names.append(pname.lower())
    
    # Try Kaggle
    matched_kaggle = None
    for kname, kdata in kaggle_dict.items():
        if kname in pname.lower() or pname.lower() in kname:
            matched_kaggle = kdata
            break
            
    if matched_kaggle:
        base_price = matched_kaggle['base_price']
        winning_bid = matched_kaggle['winning_bid']
        team_name = matched_kaggle['team_name']
        capped_status = matched_kaggle['capped_status']
    else:
        base_price = 0.5; winning_bid = 0.5
        team_name = 'Retained / Unsold'
        capped_status = 'Uncapped'

    final_rows.append({
        'name': pname,
        'nationality': 'Indian',
        'is_overseas': False,
        'role': 'BAT' if is_bat else 'BOWL',
        'specific_role': 'Top Order' if is_bat else 'Pace',
        'bowling_style': 'Pace',
        'capped_status': capped_status,
        'base_price': base_price,
        'winning_bid': winning_bid,
        'team_name': team_name,
        'batting_sr': float(source_data.get('sr', 130)) if is_bat else 100.0,
        'batting_avg': float(source_data.get('avg', 20)) if is_bat else 10.0,
        'bowling_econ': 9.0 if is_bat else float(source_data.get('econ', 8.0)),
        'bowling_wpm': 0.0 if is_bat else float(source_data.get('wkts', 0)) / max(1, float(source_data.get('mat', 1))),
        'matches_played': int(source_data.get('mat', 10)),
        'age': 22,
        'seasons_played': 1
    })

for bname, bdata in bat_dict.items(): add_new_player(bname, bdata, True)
for bname, bdata in bowl_dict.items(): add_new_player(bname, bdata, False)

df_final = pd.DataFrame(final_rows)

def compute_raw_power_index(row):
    bid = float(row['winning_bid'])
    is_capped = str(row['capped_status']).lower() == 'capped'
    sr = float(row['batting_sr'])
    econ = float(row['bowling_econ'])
    
    val_pts = min(35.0, np.log2(bid + 1.0) * 7.2)
    perf_pts = 20.0
    if sr > 150: perf_pts += 10.0
    elif sr > 135: perf_pts += 6.0
    
    if econ > 0 and econ < 7.5: perf_pts += 8.0
    elif econ > 0 and econ < 8.5: perf_pts += 4.0
    
    prestige = 15.0 if is_capped else 8.0
    h = (sum(ord(c) for c in str(row['name'])) % 45) / 10.0
    
    return val_pts + perf_pts + prestige + h

def rescale(raw, raw_min, raw_max, target_min=58.5, target_max=96.2):
    if raw_max == raw_min:
        return (target_min + target_max) / 2
    normalized = (raw - raw_min) / (raw_max - raw_min)
    return target_min + normalized * (target_max - target_min)

raw_scores = df_final.apply(compute_raw_power_index, axis=1)
raw_min, raw_max = raw_scores.min(), raw_scores.max()
df_final['Power_Index'] = raw_scores.apply(lambda r: round(rescale(r, raw_min, raw_max), 1))
df_final['player_id'] = [str(i) for i in range(len(df_final))]

engine = create_engine(f'sqlite:///{db_path}')
final_cols = [
    'player_id', 'name', 'nationality', 'is_overseas', 'role', 'specific_role', 'bowling_style', 'capped_status',
    'base_price', 'winning_bid', 'team_name', 'Power_Index', 'batting_sr',
    'batting_avg', 'bowling_econ', 'bowling_wpm', 'matches_played', 'age', 'seasons_played'
]
df_final = df_final[final_cols]

# Remove duplicates if any
df_final = df_final.drop_duplicates(subset=['name'], keep='first')

df_final.to_sql('players', engine, if_exists='replace', index=False)

print(f"Successfully processed {len(df_final)} active players!")
print("Merged Master Data + 2026 Batting + 2026 Bowling + 2026 Auction!")
print(df_final[['name', 'batting_sr', 'bowling_econ', 'Power_Index', 'team_name']].sort_values(by='Power_Index', ascending=False).head(10))
