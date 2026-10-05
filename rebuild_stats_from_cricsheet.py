import os
import glob
import collections
import pandas as pd
import numpy as np

def rebuild_stats():
    print("Starting exact Cricsheet statistical rebuild (PRE-2025)...")
    
    player_matches = collections.defaultdict(set)
    batting_runs = collections.defaultdict(int)
    batting_balls = collections.defaultdict(int)
    batting_outs = collections.defaultdict(int)
    
    bowling_runs = collections.defaultdict(int)
    bowling_balls = collections.defaultdict(int)
    bowling_wickets = collections.defaultdict(int)
    
    match_files = glob.glob('cricsheet/*.csv')
    csv_files = [f for f in match_files if not f.endswith('_info.csv')]
    
    print(f"Processing {len(csv_files)} ball-by-ball matches...")
    
    valid_matches = set()
    
    # First find all valid pre-2025 match IDs
    info_files = glob.glob('cricsheet/*_info.csv')
    for info in info_files:
        match_id = os.path.basename(info).split('_')[0]
        # Check start date
        valid = False
        with open(info, 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) >= 3 and parts[1] == 'season':
                    season = parts[2]
                    try:
                        valid = True
                        break
                    except:
                        pass
        if valid:
            valid_matches.add(match_id)
            # Also read players in this match
            with open(info, 'r', encoding='utf-8') as f:
                for line in f:
                    parts = line.strip().split(',')
                    if len(parts) >= 4 and parts[1] == 'player':
                        player_matches[parts[3]].add(match_id)
                        
    print(f"Found {len(valid_matches)} valid matches before 2025.")
    
    for file in csv_files:
        match_id = os.path.basename(file).split('.')[0]
        if match_id not in valid_matches:
            continue
            
        try:
            df = pd.read_csv(file, low_memory=False)
        except:
            continue
            
        if df.empty:
            continue
            
        for _, row in df.iterrows():
            striker = str(row['striker'])
            bowler = str(row['bowler'])
            
            runs_bat = pd.to_numeric(row['runs_off_bat'], errors='coerce')
            runs_bat = 0 if pd.isna(runs_bat) else runs_bat
            
            wides = pd.to_numeric(row['wides'], errors='coerce')
            wides = 0 if pd.isna(wides) else wides
            
            noballs = pd.to_numeric(row['noballs'], errors='coerce')
            noballs = 0 if pd.isna(noballs) else noballs
            
            # Batting
            batting_runs[striker] += runs_bat
            if wides == 0:
                batting_balls[striker] += 1
                
            # Dismissals
            dismissed = str(row['player_dismissed'])
            if dismissed != 'nan' and dismissed != '':
                batting_outs[dismissed] += 1
                
                # Bowler Wicket
                w_type = str(row['wicket_type'])
                if w_type not in ['run out', 'retired hurt', 'obstructing the field', 'retired out']:
                    bowling_wickets[bowler] += 1
                    
            # Bowling
            if wides == 0 and noballs == 0:
                bowling_balls[bowler] += 1
            
            bowling_runs[bowler] += (runs_bat + wides + noballs)

    # Now load filled_ipl_data and update
    df = pd.read_csv('data/filled_ipl_data.csv')
    updated = 0
    
    # helper for fuzzy match
    def find_player(full_name):
        if full_name in player_matches:
            return full_name
        parts = full_name.split()
        for p in player_matches.keys():
            p_parts = p.split()
            if len(parts) >= 2 and len(p_parts) >= 2:
                if parts[-1].lower() == p_parts[-1].lower() and parts[0][0].lower() == p_parts[0][0].lower():
                    return p
        return None

    for idx, row in df.iterrows():
        p_name = row['Player'].strip()
        matched_name = find_player(p_name)
        
        if matched_name:
            matches = len(player_matches[matched_name])
            df.at[idx, 'Matches_Played'] = matches
            
            runs = batting_runs[matched_name]
            outs = batting_outs[matched_name]
            balls_faced = batting_balls[matched_name]
            
            df.at[idx, 'Batting_Avg'] = round(runs / max(1, outs), 2)
            df.at[idx, 'Batting_SR'] = round((runs / max(1, balls_faced)) * 100, 2)
            
            overs = bowling_balls[matched_name] / 6.0
            conceded = bowling_runs[matched_name]
            wickets = bowling_wickets[matched_name]
            
            df.at[idx, 'Bowling_Econ'] = round(conceded / max(1, overs), 2)
            df.at[idx, 'Bw_WPM'] = round(wickets / max(1, matches), 2)
            updated += 1
        else:
            # Rookie
            df.at[idx, 'Matches_Played'] = 0
            df.at[idx, 'Batting_Avg'] = 0.0
            df.at[idx, 'Batting_SR'] = 0.0
            df.at[idx, 'Bowling_Econ'] = 0.0
            df.at[idx, 'Bw_WPM'] = 0.0
            
        # Re-calc Power Index
        power = 50
        role = str(row['Role'])
        avg = df.at[idx, 'Batting_Avg']
        sr = df.at[idx, 'Batting_SR']
        econ = df.at[idx, 'Bowling_Econ']
        wpm = df.at[idx, 'Bw_WPM']
        
        if role == 'Batter' or role == 'Wicketkeeper':
            power = (avg * 0.4) + (sr * 0.6)
        elif role == 'Bowler':
            if econ > 0:
                power = (wpm * 30) + (120 / econ)
            else:
                power = 40
        else:
            power = (avg * 0.3) + (sr * 0.4) + (wpm * 20)
            
        df.at[idx, 'Power_Index'] = round(min(max(power, 10), 100), 2)

    df.to_csv('data/filled_ipl_data.csv', index=False)
    print(f"Successfully rebuilt exact pre-2025 stats for {updated} players. Set remainder to 0.")

if __name__ == '__main__':
    rebuild_stats()
