import sys
import json
import time
import requests
import pandas as pd
import os

def query_gemini(api_key, prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts":[{"text": prompt}]}]
    }
    
    while True:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 429:
            print("Rate limit (429) exceeded. Waiting 20 seconds...")
            time.sleep(20)
            continue
        if response.status_code == 503:
            print("Model overloaded (503). Waiting 30 seconds...")
            time.sleep(30)
            continue
        if response.status_code != 200:
            raise Exception(f"API Error {response.status_code}: {response.text}")
        break
        
    result = response.json()
    raw_text = result['candidates'][0]['content']['parts'][0]['text']
    
    raw_text = raw_text.replace('```json', '').replace('```', '').strip()
    return json.loads(raw_text)

def run_data_engine(api_key):
    print("Starting AI Data Engine (REST API Mode)...")
    
    # We load all squads from current_squads.csv if it exists to save the 1 request
    all_players = []
    if os.path.exists('data/current_squads.csv'):
        squads_df = pd.read_csv('data/current_squads.csv')
        all_players = squads_df.to_dict('records')
    else:
        print("current_squads.csv not found! Re-run from scratch.")
        return
        
    print("\n[PHASE 2] Generating Precision Statistical Profiles...")
    player_names = [p['Player'] for p in all_players]
    final_stats = []
    
    if os.path.exists('data/temp_stats.json'):
        try:
            with open('data/temp_stats.json', 'r') as f:
                final_stats = json.load(f)
            print(f"Resuming from temp_stats.json. Already processed {len(final_stats)} players.")
        except Exception:
            pass
            
    processed_names = [s.get('Player') for s in final_stats]
    remaining_players = [p for p in player_names if p not in processed_names]
    
    print(f"{len(remaining_players)} players remaining to be processed.")
    
    batch_size = 50
    for i in range(0, len(remaining_players), batch_size):
        batch = remaining_players[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1} of {(len(remaining_players)//batch_size)+1}...")
        
        prompt = f"""You are an expert IPL Cricket Statistician. Provide the exact statistical profile for the following IPL players based on their career T20/IPL records up to the present date (2026):
{json.dumps(batch)}

Return a JSON array of objects. Each object MUST have the following exact keys:
- "Player": (string) the player's name exactly as provided.
- "Nationality": (string) strictly either "indian" or "overseas".
- "Role": (string) standard role like "Batter", "Bowler", "All-Rounder".
- "Specific_Role": (string) strictly either "top order", "middle order", "all-rounder", or "bowler".
- "Bowling_Style": (string) e.g., "right-arm fast", "right-arm offbreak", "left-arm orthodox", or "none".
- "Auction_Price": (float) their approximate IPL auction price in Crores (e.g. 15.0). If unknown, estimate based on tier (0.5 to 2.0).
- "Matches_Played": (int) exact number of IPL matches played. If debutant, 0.
- "Batting_SR": (float) batting strike rate.
- "Batting_Avg": (float) batting average.
- "Bw_WPM": (float) Wickets per match.
- "Bowling_Econ": (float) bowling economy rate.
- "Age": (int) approximate age in years.

Do not wrap it in markdown block. Just output the raw JSON array.
"""
        try:
            batch_stats = query_gemini(api_key, prompt)
            final_stats.extend(batch_stats)
            with open('data/temp_stats.json', 'w') as f:
                json.dump(final_stats, f)
            time.sleep(2)
        except Exception as e:
            print(f"Error processing batch: {e}")
            break
            
    print("\n[PHASE 3] Compiling and calculating Power Index...")
    if not final_stats:
        print("Failed to generate any stats.")
        return
        
    df = pd.DataFrame(final_stats)
    
    df['Power_Index'] = 0.0
    for idx, row in df.iterrows():
        power = 50
        if row['Role'] == 'Batter' or row['Role'] == 'Wicketkeeper':
            power = (row['Batting_Avg'] * 0.4) + (row['Batting_SR'] * 0.6)
        elif row['Role'] == 'Bowler':
            if row['Bowling_Econ'] > 0:
                power = (row['Bw_WPM'] * 30) + (120 / row['Bowling_Econ'])
            else:
                power = 40
        else:
            power = (row['Batting_Avg'] * 0.3) + (row['Batting_SR'] * 0.4) + (row['Bw_WPM'] * 20)
        df.at[idx, 'Power_Index'] = round(min(max(power, 10), 100), 2)
        
    df.to_csv('data/filled_ipl_data.csv', index=False)
    print("Saved to data/filled_ipl_data.csv")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ai_data_engine.py <GEMINI_API_KEY>")
        sys.exit(1)
    run_data_engine(sys.argv[1])
