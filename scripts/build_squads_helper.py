import pandas as pd
import json

bat = pd.read_csv('backend/data/temp_archive2/ipl_2026_batting.csv')
bowl = pd.read_csv('backend/data/temp_archive2/ipl_2026_bowling.csv')
sold = pd.read_csv('backend/data/IPL_Auction_2026_Sold_Player.csv')

bat['clean_name'] = bat['player'].astype(str).str.strip()
bowl['clean_name'] = bowl['player'].astype(str).str.strip()
sold['clean_name'] = sold['Name'].astype(str).str.strip()

def parse_price_cr(bid_str):
    if not bid_str or pd.isna(bid_str):
        return 1.0
    s = str(bid_str).replace(',', '').strip()
    try:
        val = float(s)
        return round(val / 10000000.0, 2)
    except:
        return 1.0

def get_stats_summary(name, custom_title=""):
    b_rows = bat[bat['clean_name'].str.lower() == name.lower()]
    bw_rows = bowl[bowl['clean_name'].str.lower() == name.lower()]

    summary_parts = []
    if custom_title:
        summary_parts.append(custom_title)

    if not b_rows.empty:
        r = b_rows.iloc[0]
        runs = int(r['runs'])
        avg = float(r['avg']) if pd.notnull(r['avg']) else 0.0
        sr = float(r['sr']) if pd.notnull(r['sr']) else 100.0
        fifties = int(r['50']) if pd.notnull(r['50']) else 0
        hundreds = int(r['100']) if pd.notnull(r['100']) else 0
        if runs > 30:
            bat_str = f"2026: {runs} Runs (Avg {avg:.1f}, SR {sr:.1f})"
            milestones = []
            if hundreds > 0: milestones.append(f"{hundreds}x100")
            if fifties > 0: milestones.append(f"{fifties}x50")
            if milestones:
                bat_str += f" [{', '.join(milestones)}]"
            summary_parts.append(bat_str)

    if not bw_rows.empty:
        bw = bw_rows.iloc[0]
        wkts = int(bw['wkts'])
        econ = float(bw['econ']) if pd.notnull(bw['econ']) else 8.5
        bbi = str(bw['bbi']) if pd.notnull(bw['bbi']) else '-'
        if wkts > 0:
            summary_parts.append(f"2026: {wkts} Wkts (Econ {econ:.2f}, BBI {bbi})")

    if summary_parts:
        return " • ".join(summary_parts)
    return "2026 IPL Squad Member"

print("Parsing check done")
