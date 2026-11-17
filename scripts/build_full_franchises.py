import pandas as pd
import json
import re

bat = pd.read_csv('backend/data/temp_archive2/ipl_2026_batting.csv')
bowl = pd.read_csv('backend/data/temp_archive2/ipl_2026_bowling.csv')
sold = pd.read_csv('backend/data/IPL_Auction_2026_Sold_Player.csv')

# Clean player names in bat and bowl
bat['clean_name'] = bat['player'].astype(str).str.strip()
bowl['clean_name'] = bowl['player'].astype(str).str.strip()

def get_stats_summary(name, default_role):
    # Lookup in bat
    b_rows = bat[bat['clean_name'].str.lower() == name.lower()]
    bw_rows = bowl[bowl['clean_name'].str.lower() == name.lower()]

    summary_parts = []
    has_stats = False

    if not b_rows.empty:
        r = b_rows.iloc[0]
        runs = int(r['runs'])
        avg = float(r['avg']) if pd.notnull(r['avg']) else 0.0
        sr = float(r['sr']) if pd.notnull(r['sr']) else 100.0
        fifties = int(r['50']) if pd.notnull(r['50']) else 0
        hundreds = int(r['100']) if pd.notnull(r['100']) else 0
        if runs > 30:
            has_stats = True
            bat_str = f"2026: {runs} Runs (Avg {avg:.1f}, SR {sr:.1f})"
            if hundreds > 0 or fifties > 0:
                milestones = []
                if hundreds > 0: milestones.append(f"{hundreds}x100")
                if fifties > 0: milestones.append(f"{fifties}x50")
                bat_str += f" [{', '.join(milestones)}]"
            summary_parts.append(bat_str)

    if not bw_rows.empty:
        bw = bw_rows.iloc[0]
        wkts = int(bw['wkts'])
        econ = float(bw['econ']) if pd.notnull(bw['econ']) else 8.5
        bbi = str(bw['bbi']) if pd.notnull(bw['bbi']) else '-'
        if wkts > 0:
            has_stats = True
            summary_parts.append(f"2026: {wkts} Wkts (Econ {econ:.2f}, BBI {bbi})")

    if summary_parts:
        return " • ".join(summary_parts)
    return None

print("Helper ready")
