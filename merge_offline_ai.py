import pandas as pd
import json

def merge_data():
    df = pd.read_csv('data/filled_ipl_data.csv')
    
    with open('data/temp_stats.json', 'r') as f:
        ai_stats = json.load(f)
        
    # Create dictionary mapping Player Name -> AI Stat Object
    ai_dict = {p['Player'].lower().strip(): p for p in ai_stats}
    
    merged_data = []
    ai_count = 0
    offline_count = 0
    
    for _, row in df.iterrows():
        p_name = row['Player'].lower().strip()
        if p_name in ai_dict:
            # Use AI data
            ai = ai_dict[p_name]
            # Calculate Power Index for AI data
            power = 50
            if ai['Role'] == 'Batter' or ai['Role'] == 'Wicketkeeper':
                power = (ai['Batting_Avg'] * 0.4) + (ai['Batting_SR'] * 0.6)
            elif ai['Role'] == 'Bowler':
                if ai['Bowling_Econ'] > 0:
                    power = (ai['Bw_WPM'] * 30) + (120 / ai['Bowling_Econ'])
                else:
                    power = 40
            else:
                power = (ai['Batting_Avg'] * 0.3) + (ai['Batting_SR'] * 0.4) + (ai['Bw_WPM'] * 20)
            
            ai['Power_Index'] = round(min(max(power, 10), 100), 2)
            merged_data.append(ai)
            ai_count += 1
        else:
            # Use Offline data
            merged_data.append(row.to_dict())
            offline_count += 1
            
    merged_df = pd.DataFrame(merged_data)
    
    # Ensure columns match our standard format
    cols = ['Player', 'Role', 'Specific_Role', 'Nationality', 'Bowling_Style', 'Auction_Price', 'Power_Index', 'Batting_SR', 'Batting_Avg', 'Bw_WPM', 'Bowling_Econ', 'Matches_Played', 'Age']
    
    # Reorder
    for col in cols:
        if col not in merged_df.columns:
            merged_df[col] = None
    merged_df = merged_df[cols]
    
    # Save back to filled_ipl_data.csv
    merged_df.to_csv('data/filled_ipl_data.csv', index=False)
    
    print(f"Merge Complete! AI Players: {ai_count} | Offline Players: {offline_count}")

if __name__ == '__main__':
    merge_data()
