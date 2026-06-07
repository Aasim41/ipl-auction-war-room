import pandas as pd

def get_fifa_card_html(row):
    try:
        power = float(row.get('Power_Index', 0))
    except:
        power = 0
        
    name = str(row.get('Player', 'Unknown')).title()
    role = str(row.get('Role', row.get('Specific_Role', 'Unknown'))).upper()
    
    # Check nationality
    nat = str(row.get('Nationality', '')).lower()
    if nat == 'overseas':
        nation_icon = "✈️"
    else:
        nation_icon = "🇮🇳"
        
    price = row.get('Auction_Price', row.get('Sold_Price', 0))
    if pd.isna(price): price = 0
    
    matches = row.get('Matches_Played', 0)
    if pd.isna(matches): matches = 0
    
    batting = str(row.get('Batting_Style', 'N/A')).title()
    bowling = str(row.get('Bowling_Style', 'N/A')).title()
    if pd.isna(batting) or batting == 'Nan': batting = 'N/A'
    if pd.isna(bowling) or bowling == 'Nan' or bowling == 'None': bowling = 'N/A'

    # Determine Tier colors
    if power > 400:
        # Gold
        bg = "linear-gradient(135deg, #FFDF00, #B8860B)"
        color = "#111"
        border = "#FFF8DC"
    elif power > 300:
        # Silver
        bg = "linear-gradient(135deg, #E0E0E0, #A9A9A9)"
        color = "#111"
        border = "#F5F5F5"
    else:
        # Bronze
        bg = "linear-gradient(135deg, #CD7F32, #8B4513)"
        color = "#fff"
        border = "#DEB887"

    html = f"""
    <div style="background: {bg}; color: {color}; border-radius: 10px; padding: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); font-family: 'Arial', sans-serif; height: 100%; border: 2px solid {border}; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <div style="font-size: 32px; font-weight: 900; line-height: 1;">{int(power)}</div>
                <div style="font-size: 11px; font-weight: bold; text-transform: uppercase;">{role}</div>
            </div>
            <div style="font-size: 24px;">{nation_icon}</div>
        </div>
        <div style="margin-top: 15px; margin-bottom: 15px; text-align: center; border-bottom: 2px solid rgba(0,0,0,0.2); padding-bottom: 5px;">
            <div style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{name}</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px; font-weight: bold; text-align: center;">
            <div>
                <div style="opacity: 0.7;">PRICE</div>
                <div>₹ {price:.2f} Cr</div>
            </div>
            <div>
                <div style="opacity: 0.7;">MATCHES</div>
                <div>{int(matches)}</div>
            </div>
            <div style="grid-column: span 2; margin-top: 5px;">
                <div style="opacity: 0.7;">STYLE</div>
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{batting} | {bowling}</div>
            </div>
        </div>
    </div>
    """
    return html
