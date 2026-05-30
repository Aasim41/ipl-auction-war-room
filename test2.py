import pandas as pd
from backend.two_stage_optimizer import optimize_auction

theme = {'name': 'CSK', 'bg': '#FFFF00', 'text': 'black', 'accent': '#FFD700'}
df = pd.read_csv("data/filled_ipl_data.csv")
squad_df, xi_df, _, _ = optimize_auction('Chennai Super Kings (CSK)', 120.0, df, [])
squad_df['In_XI'] = squad_df['Player'].isin(xi_df['Player']).apply(lambda x: '✅ Yes' if x else '🪑 Bench')

roles = ['top order', 'middle order', 'all-rounder', 'bowler']
def get_role_icon(role): return "🏏"
for role in roles:
    role_players = squad_df[squad_df['Specific_Role'] == role]
    if not role_players.empty:
        for idx, row in enumerate(role_players.itertuples()):
            is_starter = row.In_XI == '✅ Yes'
            bg_color = "rgba(0, 0, 0, 0.15)"
            muted_color = "#555555"
            border_color = theme['accent']
            title_color = theme['accent']
            status_badge = "🌟 STARTER"
            card_html = f'''
            <div style="background-color: {bg_color}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-top: 5px solid {border_color}; border-bottom: 5px solid {border_color}; border-radius: 12px; margin-bottom: 20px; padding: 15px; display: flex; flex-direction: column; align-items: center; position: relative;">
                <div style="position: absolute; top: 10px; left: 15px; text-align: center;">
                    <span style="font-size: 26px; font-weight: 900; color: {border_color}; line-height: 1;">{int(row.Power_Index)}</span><br>
                    <span style="font-size: 10px; font-weight: bold; color: {theme["text"]}; letter-spacing: 1px;">PWR</span>
                </div>
                <div style="position: absolute; top: 10px; right: 15px; font-size: 10px; font-weight: bold; padding: 3px 6px; border-radius: 4px; background-color: {border_color}; color: {'#000' if is_starter else '#FFF'}; letter-spacing: 1px;">
                    {status_badge}
                </div>
                <div style="font-size: 45px; margin-top: 20px; margin-bottom: 5px; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">{get_role_icon(row.Specific_Role)}</div>
                <div style="font-size: 16px; font-weight: 900; color: {title_color}; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">{row.Player.split()[-1] if len(row.Player.split())>1 else row.Player.title()}</div>
                <div style="font-size: 10px; color: {theme["text"]}; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; opacity: 0.8;">{row.Archetype}</div>
                <div style="width: 100%; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 10px; display: grid; grid-template-columns: 1fr 1fr; grid-gap: 5px; text-align: center;">
                    <div>
                        <div style="font-size: 10px; color: {theme["text"]}; opacity: 0.7;">PRICE</div>
                        <div style="font-size: 11px; font-weight: bold; color: {theme["text"]};">₹{row.Auction_Price:.1f}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: {theme["text"]}; opacity: 0.7;">NAT</div>
                        <div style="font-size: 11px; font-weight: bold; color: {theme["text"]};">{"OVS ✈️" if row.Nationality == "overseas" else "IND 🇮🇳"}</div>
                    </div>
                </div>
            </div>
            '''
print("Success!")
