import streamlit as st
import pandas as pd
import pulp
import plotly.express as px
import random
import json
import time
import os
import requests
from streamlit_lottie import st_lottie
from fpdf import FPDF

@st.cache_data
def load_lottieurl(url: str):
    try:
        r = requests.get(url)
        if r.status_code != 200:
            return None
        return r.json()
    except:
        return None

# --- Configuration & Styling ---
st.set_page_config(page_title="IPL War Room", layout="wide")

# --- Franchise Configuration ---
FRANCHISES = {
    "Chennai Super Kings (CSK)": {
        "bg": "#F9CD05", "accent": "#004B8D", "text": "black", "name": "CSK", "slogan": "Whistle Podu",
        "font": "Oswald", "slogan_text": "white"
    },
    "Mumbai Indians (MI)": {
        "bg": "#004BA0", "accent": "#D1AB3E", "text": "white", "name": "MI", "slogan": "Duniya Hila Denge Hum",
        "font": "Bebas Neue", "slogan_text": "black"
    },
    "Royal Challengers Bengaluru (RCB)": {
        "bg": "#EC1C24", "accent": "#000000", "text": "white", "name": "RCB", "slogan": "Play Bold",
        "font": "Permanent Marker", "slogan_text": "white"
    },
    "Kolkata Knight Riders (KKR)": {
        "bg": "#3A225D", "accent": "#B3A123", "text": "white", "name": "KKR", "slogan": "Korbo Lorbo Jeetbo",
        "font": "Cinzel", "slogan_text": "black"
    },
    "Sunrisers Hyderabad (SRH)": {
        "bg": "#F26522", "accent": "#000000", "text": "white", "name": "SRH", "slogan": "Orange Army",
        "font": "Teko", "slogan_text": "white"
    },
    "Delhi Capitals (DC)": {
        "bg": "#00008B", "accent": "#DC143C", "text": "white", "name": "DC", "slogan": "Roar Macha",
        "font": "Russo One", "slogan_text": "white"
    },
    "Rajasthan Royals (RR)": {
        "bg": "#FF69B4", "accent": "#0000FF", "text": "black", "name": "RR", "slogan": "Halla Bol",
        "font": "Caveat", "slogan_text": "white"
    },
    "Punjab Kings (PBKS)": {
        "bg": "#ED1B24", "accent": "#D1AB3E", "text": "white", "name": "PBKS", "slogan": "Sadda Punjab",
        "font": "Anton", "slogan_text": "black"
    },
    "Lucknow Super Giants (LSG)": {
        "bg": "#00A4E3", "accent": "#FF8200", "text": "black", "name": "LSG", "slogan": "Ab Apni Baari Hai",
        "font": "Righteous", "slogan_text": "white"
    },
    "Gujarat Titans (GT)": {
        "bg": "#0B4973", "accent": "#D1AB3E", "text": "white", "name": "GT", "slogan": "Aava De",
        "font": "Play", "slogan_text": "black"
    }
}

# --- Venue Configuration ---
VENUES = {
    "M. Chinnaswamy Stadium, Bangalore": {
        "team": "RCB", "pitch": "Flat & High-Scoring", "icon": "🏟️",
        "desc": "One of the highest-scoring grounds in IPL history. Short boundaries, flat deck, dew factor — pure batting paradise.",
        "boosts": {"top order": 1.20, "middle order": 1.15, "all-rounder": 1.10, "bowler_pace": 0.90, "bowler_spin": 0.85}
    },
    "MA Chidambaram Stadium, Chennai": {
        "team": "CSK", "pitch": "Slow & Spin-Friendly", "icon": "🐍",
        "desc": "The famous Chepauk dust bowl. Slow turner that rewards patient batting and quality spin. Pacers struggle in death overs.",
        "boosts": {"top order": 0.95, "middle order": 1.05, "all-rounder": 1.10, "bowler_pace": 0.90, "bowler_spin": 1.25}
    },
    "Wankhede Stadium, Mumbai": {
        "team": "MI", "pitch": "Batting-Friendly with Dew", "icon": "🌊",
        "desc": "Fast outfield, true bounce, heavy dew in the second innings. Chasing teams have a significant advantage here.",
        "boosts": {"top order": 1.15, "middle order": 1.10, "all-rounder": 1.05, "bowler_pace": 1.05, "bowler_spin": 0.90}
    },
    "Eden Gardens, Kolkata": {
        "team": "KKR", "pitch": "Balanced with Late Spin", "icon": "🏰",
        "desc": "Starts as a good batting surface but deteriorates. Spinners come into play heavily in the second innings.",
        "boosts": {"top order": 1.05, "middle order": 1.05, "all-rounder": 1.10, "bowler_pace": 1.00, "bowler_spin": 1.15}
    },
    "Rajiv Gandhi Intl Stadium, Hyderabad": {
        "team": "SRH", "pitch": "Good for Batting & Pace", "icon": "☀️",
        "desc": "True bounce and pace on offer. Rewards aggressive batting in the powerplay and fast bowlers who hit the deck hard.",
        "boosts": {"top order": 1.10, "middle order": 1.05, "all-rounder": 1.05, "bowler_pace": 1.15, "bowler_spin": 0.90}
    },
    "Arun Jaitley Stadium, Delhi": {
        "team": "DC", "pitch": "Balanced — All Skills Rewarded", "icon": "⚖️",
        "desc": "A balanced deck that offers something for everyone. Good pace and bounce early, spin grips later.",
        "boosts": {"top order": 1.05, "middle order": 1.05, "all-rounder": 1.10, "bowler_pace": 1.05, "bowler_spin": 1.05}
    },
    "Sawai Mansingh Stadium, Jaipur": {
        "team": "RR", "pitch": "Slow & Low — Grinders Paradise", "icon": "🏜️",
        "desc": "Low and slow surface. Rewards crafty spinners and batters who can rotate strike. Big hitters struggle here.",
        "boosts": {"top order": 0.90, "middle order": 1.10, "all-rounder": 1.10, "bowler_pace": 0.95, "bowler_spin": 1.20}
    },
    "PCA Stadium, Mohali": {
        "team": "PBKS", "pitch": "Pace & Bounce — Seamer's Delight", "icon": "💨",
        "desc": "Good carry and bounce. Fast bowlers who hit hard lengths dominate here. Swing in the evening under lights.",
        "boosts": {"top order": 1.00, "middle order": 1.00, "all-rounder": 1.05, "bowler_pace": 1.25, "bowler_spin": 0.85}
    },
    "BRSABV Ekana Stadium, Lucknow": {
        "team": "LSG", "pitch": "Slow & Dry", "icon": "🌾",
        "desc": "Tends to be slow and dry. Spin plays a major role in the middle overs. Favors teams with strong spin arsenals.",
        "boosts": {"top order": 0.95, "middle order": 1.05, "all-rounder": 1.10, "bowler_pace": 0.90, "bowler_spin": 1.20}
    },
    "Narendra Modi Stadium, Ahmedabad": {
        "team": "GT", "pitch": "Balanced to Slow", "icon": "🦁",
        "desc": "The world's largest cricket stadium. Surface varies — can be a road or assist spin. Dew plays a major factor in night games.",
        "boosts": {"top order": 1.05, "middle order": 1.05, "all-rounder": 1.10, "bowler_pace": 1.00, "bowler_spin": 1.10}
    }
}

def generate_custom_css(bg, accent, text):
    bg_alpha = "rgba(0,0,0,0.15)" if text == "white" else "rgba(255,255,255,0.4)"
    border_alpha = "rgba(255,255,255,0.2)" if text == "white" else "rgba(0,0,0,0.2)"
    btn_text = "white" if text == "black" else "black"
    
    return f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Caveat:wght@700&family=Cinzel:wght@700&family=Oswald:wght@700&family=Permanent+Marker&family=Play:wght@700&family=Righteous&family=Russo+One&family=Teko:wght@600&display=swap');

    .stApp {{ background-color: {bg}; color: {text}; }}
    h1, h2, h3, h4, h5, h6 {{ color: {accent} !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }}
    .css-10trblm, .css-1dp5vir {{ color: {text}; }}
    p, span, div {{ color: {text}; }}

    /* Force Sidebar to be sleek dark with white text */
    [data-testid="stSidebar"] {{
        background-color: #111111 !important;
    }}
    [data-testid="stSidebar"] *, 
    [data-testid="stSidebar"] p, 
    [data-testid="stSidebar"] label, 
    [data-testid="stSidebar"] div,
    [data-testid="stSidebar"] span {{
        color: white !important;
    }}
    
    /* Dropdown menus (Selectbox, Multiselect popovers) render outside the sidebar */
    div[data-baseweb="popover"] > div,
    div[data-baseweb="select"],
    ul[role="listbox"] {{
        background-color: #111111 !important;
    }}
    div[data-baseweb="popover"] *,
    div[data-baseweb="select"] *,
    ul[role="listbox"] * {{
        color: white !important;
    }}
    
    .stButton > button {{
        background: {accent} !important;
        color: {btn_text} !important;
        font-weight: bold !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 24px !important;
        font-size: 18px !important;
        width: 100%;
    }}
    .stButton > button:hover {{ opacity: 0.8; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }}
    
    .player-card {{
        background-color: {bg_alpha};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-left: 5px solid {accent};
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        padding: 15px; border-radius: 12px; margin-bottom: 15px;
    }}
    .player-name {{ font-size: 18px; font-weight: bold; color: {accent}; }}
    .player-price {{ font-size: 16px; color: {text}; }}
    
    .coach-alert {{
        padding: 15px; border-radius: 8px; margin-bottom: 10px;
        background-color: {bg_alpha}; border-left: 5px solid; color: {text} !important;
    }}
    hr {{ border-color: {border_alpha}; }}
    [data-testid="stMetricValue"] {{ color: {accent} !important; }}
</style>
"""

# --- Data Loading ---
def load_data():
    # Load player database
    df = pd.read_csv('data/filled_ipl_data.csv')
    df = df.dropna(subset=['Nationality', 'Specific_Role']).reset_index(drop=True)
    df['Nationality'] = df['Nationality'].astype(str).str.strip().str.lower()
    df['Specific_Role'] = df['Specific_Role'].astype(str).str.strip().str.lower()
    df['Bowling_Style'] = df['Bowling_Style'].astype(str).str.strip().str.lower()
    df['Role'] = df['Role'].astype(str).str.strip().str.lower()
    df['Auction_Price'] = df['Auction_Price'] * 0.55 # Scale down to fit 100Cr for 25 players
    
    # Ensure stats columns exist and are numeric
    for col in ['Batting_SR', 'Batting_Avg', 'Bw_WPM', 'Bowling_Econ', 'Matches_Played']:
        if col not in df.columns:
            df[col] = 0.0
        else:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)
            
    # Phase-Specific Classifications
    df['Is_Slog_Specialist'] = df.apply(lambda row: True if row['Specific_Role'] in ['middle order', 'all-rounder'] and row['Batting_SR'] >= 150 else False, axis=1)
    df['Is_PP_Stabilizer'] = df.apply(lambda row: True if row['Specific_Role'] == 'top order' and row['Batting_Avg'] >= 30 else False, axis=1)
            
    return df

def apply_venue_boost(df, venue_key):
    """Adjusts Power_Index based on venue pitch characteristics."""
    venue = VENUES[venue_key]
    boosts = venue['boosts']
    boosted_df = df.copy()
    boosted_df['Original_Power_Index'] = boosted_df['Power_Index'].copy()
    
    for idx, row in boosted_df.iterrows():
        role = row['Specific_Role']
        bowl_style = row['Bowling_Style']
        
        if 'bowler' in role:
            if 'spin' in bowl_style:
                boosted_df.loc[idx, 'Power_Index'] *= boosts.get('bowler_spin', 1.0)
            else:
                boosted_df.loc[idx, 'Power_Index'] *= boosts.get('bowler_pace', 1.0)
        elif role in boosts:
            boosted_df.loc[idx, 'Power_Index'] *= boosts[role]
    
    boosted_df['Venue_Boost'] = ((boosted_df['Power_Index'] / boosted_df['Original_Power_Index']) - 1) * 100
    return boosted_df

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def generate_team_pdf(squad_df, xi_df, theme):
    pdf = FPDF(orientation='P', unit='mm', format='A4')
    pdf.add_page()
    
    # Extract colors
    bg_rgb = hex_to_rgb(theme['bg'])
    accent_rgb = hex_to_rgb(theme.get('accent', '#FFFFFF'))
    
    # Hardcode text colors based on team background
    if theme.get('name') in ['CSK']:
        text_rgb = (0, 0, 0) # Black text on yellow
    else:
        text_rgb = (255, 255, 255) # White text for dark backgrounds (MI, RCB)
    
    # Draw Header Banner
    pdf.set_fill_color(*bg_rgb)
    pdf.rect(0, 0, 210, 40, 'F')
    
    # Team Name
    pdf.set_font('helvetica', 'B', 24)
    pdf.set_text_color(*text_rgb)
    pdf.set_xy(10, 10)
    pdf.cell(190, 10, f"{theme['name']} - War Room Report", align='C')
    
    # Slogan
    pdf.set_font('helvetica', 'I', 14)
    pdf.set_xy(10, 22)
    pdf.cell(190, 10, f'"{theme["slogan"]}"', align='C')
    
    # Section: Starting XI
    pdf.set_y(50)
    pdf.set_font('helvetica', 'B', 16)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(190, 10, "The Optimal Playing XI", align='L')
    pdf.ln(10)
    
    # XI Table Header
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_fill_color(*accent_rgb)
    pdf.set_text_color(255, 255, 255)
    
    col_widths = [15, 60, 40, 35, 40]
    headers = ["#", "Player", "Role", "Archetype", "Auction Price"]
    for i in range(len(headers)):
        pdf.cell(col_widths[i], 10, headers[i], border=1, align='C', fill=True)
    pdf.ln(10)
    
    # XI Table Body
    pdf.set_font('helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    
    for idx, row in enumerate(xi_df.itertuples(), 1):
        pdf.cell(col_widths[0], 10, str(idx), border=1, align='C')
        
        name = str(row.Player).title()
        if str(row.Nationality).lower() == 'overseas':
            name += " (OVS)"
            
        pdf.cell(col_widths[1], 10, name, border=1, align='L')
        pdf.cell(col_widths[2], 10, str(row.Specific_Role).title(), border=1, align='C')
        pdf.cell(col_widths[3], 10, str(getattr(row, 'Archetype', 'N/A')), border=1, align='C')
        pdf.cell(col_widths[4], 10, f"Cr {row.Auction_Price:.1f}", border=1, align='C')
        pdf.ln(10)
        
    pdf.add_page()
    
    # Section: Full 25-Man Squad
    pdf.set_y(20)
    pdf.set_font('helvetica', 'B', 16)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(190, 10, "Full 25-Man Drafted Roster", align='L')
    pdf.ln(10)
    
    # Squad Table Header
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_fill_color(*accent_rgb)
    pdf.set_text_color(255, 255, 255)
    
    for i in range(len(headers)):
        pdf.cell(col_widths[i], 10, headers[i], border=1, align='C', fill=True)
    pdf.ln(10)
    
    # Squad Table Body
    pdf.set_font('helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    
    for idx, row in enumerate(squad_df.itertuples(), 1):
        pdf.cell(col_widths[0], 8, str(idx), border=1, align='C')
        
        name = str(row.Player).title()
        if str(row.Nationality).lower() == 'overseas':
            name += " (OVS)"
            
        pdf.cell(col_widths[1], 8, name, border=1, align='L')
        pdf.cell(col_widths[2], 8, str(row.Specific_Role).title(), border=1, align='C')
        pdf.cell(col_widths[3], 8, str(getattr(row, 'Archetype', 'N/A')), border=1, align='C')
        pdf.cell(col_widths[4], 8, f"Cr {row.Auction_Price:.1f}", border=1, align='C')
        pdf.ln(8)
        
    return bytes(pdf.output())


from backend.auction_engine import get_ai_retentions, generate_auction_pool, run_ai_auction
from thefuzz import process

# Remove the old sync_live_data, we just load current_squads
df = load_data()
try:
    squads_df = pd.read_csv('data/current_squads.csv')
except FileNotFoundError:
    squads_df = pd.DataFrame(columns=['Player', 'Current_Team'])

# --- State Management ---
if 'app_phase' not in st.session_state:
    st.session_state.app_phase = 'setup' # setup -> retention -> auction -> playing_11
if 'retained_players' not in st.session_state:
    st.session_state.retained_players = []
if 'user_budget' not in st.session_state:
    st.session_state.user_budget = 120.0
if 'final_squad' not in st.session_state:
    st.session_state.final_squad = pd.DataFrame()
if 'auction_pool' not in st.session_state:
    st.session_state.auction_pool = pd.DataFrame()
    
# --- Mock Auction State Variables ---
if 'drafted_squad' not in st.session_state:
    st.session_state.drafted_squad = []
if 'current_player_idx' not in st.session_state:
    st.session_state.current_player_idx = 0
if 'auction_state' not in st.session_state:
    st.session_state.auction_state = 'new_player' 
if 'current_bid' not in st.session_state:
    st.session_state.current_bid = 0.5
if 'highest_bidder' not in st.session_state:
    st.session_state.highest_bidder = None
if 'ai_max_bid' not in st.session_state:
    st.session_state.ai_max_bid = 0.0

# --- Sidebar ---
st.sidebar.markdown("### 🎨 Select Your Franchise")
selected_team = st.sidebar.selectbox("Franchise", list(FRANCHISES.keys()), label_visibility="collapsed")
theme = FRANCHISES[selected_team]

st.markdown(generate_custom_css(theme['bg'], theme['accent'], theme['text']), unsafe_allow_html=True)

# Automatic Background Sync
if 'data_synced' not in st.session_state:
    with st.spinner("📡 Booting up War Room... Syncing Live Rosters from CricAPI..."):
        try:
            from fetch_live_squads import fetch_and_map_squads
            fetch_and_map_squads()
        except:
            pass
        st.session_state.data_synced = True
        st.rerun()

st.sidebar.markdown(f"### ⚙️ {theme['name']} War Room Settings")
st.sidebar.markdown("### 🏟️ Home Ground")
selected_venue = st.sidebar.selectbox("Select Home Stadium", list(VENUES.keys()), label_visibility="collapsed")
venue_info = VENUES[selected_venue]

# Apply venue boost to the dataframe globally
df = apply_venue_boost(df, selected_venue)

# Navigation / Phase reset
if st.sidebar.button("🔄 Reset to Setup Phase"):
    st.session_state.app_phase = 'setup'
    st.session_state.retained_players = []
    st.session_state.final_squad = pd.DataFrame()
    st.rerun()

# --- Phase Handlers ---
tab1, tab2, tab3, tab4, tab5 = st.tabs([f"🏆 {theme['name']} War Room", "🏟️ Venue Optimizer", "🎯 Rookie Radar", "💰 Mock Auction Simulator", "📈 Analytics & Longevity"])

with tab1:
    
    # 1. SETUP PHASE
    if st.session_state.app_phase == 'setup':
        st.title(f"🏆 {theme['name']} Franchise GM Simulator")
        st.markdown(f"<div style='background-color: {theme['accent']}; color: {theme['slogan_text']}; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px;'>{theme['slogan']}</div>", unsafe_allow_html=True)
        
        st.write("Welcome to the ultimate franchise simulator. You will walk through the exact steps a real IPL GM takes:")
        st.write("1. **Retention:** Decide who to keep and who to release into the auction pool.")
        st.write("2. **Mega Auction:** Bid on the best available talent to build your 25-man squad.")
        st.write("3. **Playing XI:** Formulate the absolute mathematically perfect starting 11.")
        
        st.info("Live Squads are loaded automatically. When you are ready, enter the Retention Phase!")
        if st.button("🚪 Enter Retention Phase ->"):
            st.session_state.app_phase = 'retention'
            st.rerun()
    
    # 2. RETENTION PHASE
    elif st.session_state.app_phase == 'retention':
        st.title("🛡️ Retention & Release Phase")
        
        # Get current team's roster
        team_match = [t for t in squads_df['Current_Team'].unique() if theme['name'] in t]
        if not team_match:
            st.error("No squad data found for this franchise. Please click 'Fetch Live CricAPI Squads' in the sidebar.")
            st.stop()
            
        current_roster_names = squads_df[squads_df['Current_Team'] == team_match[0]]['Player'].tolist()
        current_roster_df = df[df['Player'].isin(current_roster_names)].copy().sort_values(by='Power_Index', ascending=False)
        
        col1, col2 = st.columns([2, 1])
        with col1:
            st.subheader("Current 2026 Roster")
            st.write("Select the players you want to **RETAIN**. Unselected players will be released to the auction pool.")
            
            # Render as unique CSS Cards instead of tables
            manual_retained = []
            cols = st.columns(3)
            for idx, row in current_roster_df.iterrows():
                col = cols[idx % 3]
                with col:
                    st.markdown(f"""
                    <div class="player-card" style="padding: 10px; margin-bottom: 10px; border-left: 5px solid {theme['accent']}; background: rgba(0,0,0,0.1); border-radius: 8px;">
                        <strong style="color: {theme['accent']}">{row['Player']}</strong><br/>
                        <small>{str(row['Role']).title()}</small><br/>
                        <small>Power: {row['Power_Index']:.1f} | Cr {row['Auction_Price']:.2f}</small>
                    </div>
                    """, unsafe_allow_html=True)
                    is_kept = st.checkbox(f"Keep {row['Player']}", value=row['Player'] in st.session_state.get('retained_players', []), key=f"ret_{row['Player']}")
                    if is_kept:
                        manual_retained.append(row['Player'])
            
            if st.button("✅ Confirm Manual Retentions"):
                st.session_state.retained_players = manual_retained
                st.success("Manual retentions saved!")
                
        with col2:
            st.subheader("AI Assistance")
            st.info("Not sure who to keep? Let the AI analyze the Power Index and retain the top 6 absolute best players for you.")
            if st.button("🤖 AI Retain Core"):
                best_core = get_ai_retentions(current_roster_df, max_retained=6)
                st.session_state.retained_players = best_core['Player'].tolist()
                st.rerun()
                
            st.markdown("---")
            st.write(f"**Currently Retained:** {len(st.session_state.retained_players)} players")
            cost = df[df['Player'].isin(st.session_state.retained_players)]['Auction_Price'].sum()
            st.write(f"**Retention Cost:** ₹ {cost:.2f} Cr")
            st.write(f"**Purse Remaining:** ₹ {120.0 - cost:.2f} Cr")
            
            if st.button("Proceed to Auction 🔨", type="primary"):
                st.session_state.user_budget = 120.0 - cost
                # Generate pool
                released_names = [p for p in current_roster_names if p not in st.session_state.retained_players]
                st.session_state.auction_pool = generate_auction_pool(df, squads_df, team_match[0], released_names)
                st.session_state.app_phase = 'auction'
                st.rerun()
    
    # 3. AUCTION PHASE
    elif st.session_state.app_phase == 'auction':
        st.title("🔨 The Mega Auction")
        
        retained_df = df[df['Player'].isin(st.session_state.retained_players)].copy()
        pool_df = st.session_state.auction_pool.copy()
        
        slots_open = 25 - len(retained_df)
        
        col1, col2, col3 = st.columns(3)
        col1.metric("Remaining Purse", f"₹ {st.session_state.user_budget:.2f} Cr")
        col2.metric("Open Slots", slots_open)
        col3.metric("Players in Pool", len(pool_df))
        
        if slots_open <= 0:
            st.success("Your squad is full! (25 players maximum)")
            if st.button("Proceed to Playing 11 🏏", type="primary"):
                st.session_state.final_squad = retained_df
                st.session_state.app_phase = 'playing_11'
                st.rerun()
            st.stop()
            
        tabA, tabB = st.tabs(["🛒 Manual Buying", "🤖 AI Draft"])
        
        with tabA:
            st.write("Browse the pool and buy players. Note: In this manual mode, players cost their exact estimated value.")
            
            from st_aggrid import AgGrid, GridOptionsBuilder, ColumnsAutoSizeMode
            pool_display = pool_df[['Player', 'Role', 'Auction_Price', 'Power_Index']].sort_values(by='Power_Index', ascending=False)
            gb = GridOptionsBuilder.from_dataframe(pool_display)
            gb.configure_selection('multiple', use_checkbox=True)
            gridOptions = gb.build()
            response = AgGrid(
                pool_display,
                gridOptions=gridOptions,
                columns_auto_size_mode=ColumnsAutoSizeMode.FIT_CONTENTS,
                theme='alpine'
            )
            selected_rows = response['selected_rows']
            if isinstance(selected_rows, pd.DataFrame):
                buy_names = selected_rows['Player'].tolist() if not selected_rows.empty else []
                buy_cost = selected_rows['Auction_Price'].sum() if not selected_rows.empty else 0.0
            else:
                buy_names = [row['Player'] for row in selected_rows] if selected_rows else []
                buy_cost = sum([row['Auction_Price'] for row in selected_rows]) if selected_rows else 0.0
            
            if st.button("🛒 Execute Buys"):
                if len(buy_names) > slots_open:
                    st.error(f"Cannot buy {len(buy_names)} players! Only {slots_open} slots open.")
                elif buy_cost > st.session_state.user_budget:
                    st.error("Insufficient budget!")
                elif len(buy_names) > 0:
                    # Add to retained (which acts as the current squad)
                    st.session_state.retained_players.extend(buy_names)
                    # Remove from pool
                    st.session_state.auction_pool = pool_df[~pool_df['Player'].isin(buy_names)]
                    # Deduct budget
                    st.session_state.user_budget -= buy_cost
                    st.success(f"Bought {len(buy_names)} players!")
                    st.rerun()
                    
        with tabB:
            st.write("Let the War Room AI optimize the rest of your squad. It will maximize Power Index while adhering to budget and role constraints.")
            if st.button("🧠 Run AI Draft Engine", type="primary"):
                with st.spinner("AI is bidding..."):
                    bought_df = run_ai_auction(pool_df, retained_df, st.session_state.user_budget, target_squad_size=25)
                    if bought_df.empty:
                        st.warning("AI couldn't find a valid combination (perhaps budget is too tight). Try manual buying.")
                    else:
                        st.session_state.retained_players.extend(bought_df['Player'].tolist())
                        st.session_state.user_budget -= bought_df['Auction_Price'].sum()
                        st.session_state.auction_pool = pool_df[~pool_df['Player'].isin(bought_df['Player'])]
                        st.success(f"AI drafted {len(bought_df)} players!")
                        st.rerun()
                        
        st.markdown("---")
        st.subheader("Current Squad")
        st.dataframe(retained_df[['Player', 'Role', 'Nationality', 'Auction_Price', 'Power_Index']], hide_index=True)
        
        if len(retained_df) >= 15: # Allow moving to 11 if at least 15 players
            if st.button("Proceed to Playing 11 🏏", type="primary"):
                st.session_state.final_squad = retained_df
                st.session_state.app_phase = 'playing_11'
                st.rerun()
    
    # 4. PLAYING 11 PHASE
    elif st.session_state.app_phase == 'playing_11':
        st.title("🏏 The Playing 11")
        squad_df = st.session_state.final_squad
        
        tabX, tabY = st.tabs(["📋 Manual Selection", "🤖 AI Best 11"])
        
        with tabX:
            st.write("Select your starting 11 manually from your 25-man squad.")
            
            # Render as unique CSS Cards instead of tables
            selected_11_names = []
            cols = st.columns(3)
            for idx, row in squad_df.iterrows():
                col = cols[idx % 3]
                with col:
                    st.markdown(f"""
                    <div class="player-card" style="padding: 10px; margin-bottom: 10px; border-left: 5px solid {theme['accent']}; background: rgba(0,0,0,0.1); border-radius: 8px;">
                        <strong style="color: {theme['accent']}">{row['Player']}</strong> {'✈️' if str(row.get('Nationality')).lower() == 'overseas' else ''}<br/>
                        <small>{str(row['Role']).title()}</small><br/>
                        <small>Power: {row['Power_Index']:.1f}</small>
                    </div>
                    """, unsafe_allow_html=True)
                    is_starter = st.checkbox(f"Start {row['Player']}", key=f"start_{row['Player']}")
                    if is_starter:
                        selected_11_names.append(row['Player'])
            
            if st.button("✅ Evaluate Manual 11"):
                if len(selected_11_names) != 11:
                    st.error(f"You must select exactly 11 players. Currently selected: {len(selected_11_names)}")
                else:
                    xi_df = squad_df[squad_df['Player'].isin(selected_11_names)]
                    from backend.team_evaluator import evaluate_and_render_11
                    evaluate_and_render_11(squad_df, xi_df, theme, budget_spent=120.0 - st.session_state.user_budget)
                    
        with tabY:
            st.write("Let the War Room AI calculate the mathematically optimal 11 based on the venue constraints.")
            if st.button("🧠 Run AI Best 11", type="primary"):
                with st.spinner("Calculating optimal 11..."):
                    from backend.team_evaluator import run_real_squad_optimization, evaluate_and_render_11
                    _, xi_df = run_real_squad_optimization(squad_df)
                    evaluate_and_render_11(squad_df, xi_df, theme, budget_spent=120.0 - st.session_state.user_budget)
    

# ================= TAB 2: VENUE OPTIMIZER =================
with tab2:
    st.title(f"🏟️ Venue Optimizer — {selected_venue}")
    
    # Venue Header Card
    st.markdown(f"""
        <div style="background: linear-gradient(135deg, {theme['accent']}22, {theme['accent']}44); border-left: 5px solid {theme['accent']}; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">{venue_info['icon']} {selected_venue}</h2>
            <p style="font-size: 18px; margin-bottom: 8px;"><b>Pitch Type:</b> {venue_info['pitch']}</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><b>Home Team:</b> {venue_info['team']}</p>
            <p style="font-size: 15px; font-style: italic; opacity: 0.9;">{venue_info['desc']}</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Player Search Bar
    st.markdown("### 🔍 Scout Player at this Venue")
    search_player = st.selectbox("Look up a specific player's venue-adjusted stats:", [""] + df['Player'].sort_values().tolist(), label_visibility="collapsed")
    if search_player:
        p_data = df[df['Player'] == search_player].iloc[0]
        boost_pct = p_data['Venue_Boost']
        boost_color = "#00FF00" if boost_pct > 0 else ("#FF4B4B" if boost_pct < 0 else theme['text'])
        st.markdown(f"""
            <div style="background-color: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: {theme['accent']};">{p_data['Player'].title()} ({p_data['Specific_Role'].title()})</h4>
                <p style="font-size: 16px; margin-bottom: 5px;">Base Power: <b>{p_data['Original_Power_Index']:.1f}</b> ➔ Venue Power: <b>{p_data['Power_Index']:.1f}</b></p>
                <p style="font-size: 16px; margin-bottom: 0;">Venue Impact: <b style="color: {boost_color};">{boost_pct:+.1f}%</b></p>
            </div>
        """, unsafe_allow_html=True)
    
    # Venue Boost Breakdown
    st.markdown("### 📊 Pitch Multipliers")
    st.write("These multipliers adjust each player's Power Index based on how their skill-set matches the venue's pitch characteristics.")
    
    boosts = venue_info['boosts']
    boost_cols = st.columns(5)
    boost_labels = [
        ("🏏 Top Order", boosts.get('top order', 1.0)),
        ("🏏 Middle Order", boosts.get('middle order', 1.0)),
        ("🏏⚾ All-Rounders", boosts.get('all-rounder', 1.0)),
        ("💨 Pace Bowlers", boosts.get('bowler_pace', 1.0)),
        ("🐍 Spin Bowlers", boosts.get('bowler_spin', 1.0)),
    ]
    for col, (label, mult) in zip(boost_cols, boost_labels):
        delta_pct = (mult - 1) * 100
        delta_str = f"{delta_pct:+.0f}%"
        col.metric(label, f"{mult:.2f}x", delta=delta_str, delta_color="normal")
    
    st.markdown("---")
    
    # Biggest Winners & Losers
    st.markdown("### 🚀 Biggest Winners at This Venue")
    st.write("Players whose Power Index gets the biggest boost at this ground.")
    
    winners = df.nlargest(10, 'Venue_Boost')[['Player', 'Specific_Role', 'Bowling_Style', 'Original_Power_Index', 'Power_Index', 'Venue_Boost', 'Auction_Price']].copy()
    winners.columns = ['Player', 'Role', 'Bowl Style', 'Base Power', 'Venue Power', 'Boost %', 'Price (Cr)']
    winners['Player'] = winners['Player'].str.title()
    winners['Role'] = winners['Role'].str.title()
    winners['Bowl Style'] = winners['Bowl Style'].str.title()
    winners = winners.reset_index(drop=True)
    winners.index = winners.index + 1
    
    st.dataframe(
        winners,
        use_container_width=True,
        column_config={
            "Player": st.column_config.TextColumn("Player", width="medium"),
            "Role": st.column_config.TextColumn("Role"),
            "Bowl Style": st.column_config.TextColumn("Style"),
            "Base Power": st.column_config.NumberColumn("Base Power", format="%.1f ⚡"),
            "Venue Power": st.column_config.ProgressColumn("Venue Power", format="%.1f", min_value=0, max_value=100),
            "Boost %": st.column_config.NumberColumn("Boost", format="%+.1f%%"),
            "Price (Cr)": st.column_config.NumberColumn("Price", format="₹ %.1f Cr")
        }
    )
    
    st.markdown("### 📉 Players Nerfed at This Venue")
    st.write("Players whose Power Index takes the biggest hit at this ground — avoid overpaying for them.")
    
    losers = df.nsmallest(10, 'Venue_Boost')[['Player', 'Specific_Role', 'Bowling_Style', 'Original_Power_Index', 'Power_Index', 'Venue_Boost', 'Auction_Price']].copy()
    losers.columns = ['Player', 'Role', 'Bowl Style', 'Base Power', 'Venue Power', 'Boost %', 'Price (Cr)']
    losers['Player'] = losers['Player'].str.title()
    losers['Role'] = losers['Role'].str.title()
    losers['Bowl Style'] = losers['Bowl Style'].str.title()
    losers = losers.reset_index(drop=True)
    losers.index = losers.index + 1
    
    st.dataframe(
        losers,
        use_container_width=True,
        column_config={
            "Player": st.column_config.TextColumn("Player", width="medium"),
            "Role": st.column_config.TextColumn("Role"),
            "Bowl Style": st.column_config.TextColumn("Style"),
            "Base Power": st.column_config.NumberColumn("Base Power", format="%.1f ⚡"),
            "Venue Power": st.column_config.ProgressColumn("Venue Power", format="%.1f", min_value=0, max_value=100),
            "Boost %": st.column_config.NumberColumn("Boost", format="%+.1f%%"),
            "Price (Cr)": st.column_config.NumberColumn("Price", format="₹ %.1f Cr")
        }
    )
    
    st.markdown("---")
    
    # Venue-Adjusted Scatter Plot
    st.markdown("### 🔬 Venue-Adjusted Power Distribution")
    st.write("See how the venue reshapes the power landscape — compare base vs. venue-adjusted power for every player.")
    
    scatter_df = df[['Player', 'Specific_Role', 'Original_Power_Index', 'Power_Index', 'Venue_Boost']].copy()
    scatter_df['Player'] = scatter_df['Player'].str.title()
    scatter_df['Specific_Role'] = scatter_df['Specific_Role'].str.title()
    
    fig = px.scatter(
        scatter_df, x='Original_Power_Index', y='Power_Index',
        color='Specific_Role', hover_name='Player',
        hover_data={'Venue_Boost': ':.1f', 'Original_Power_Index': ':.1f', 'Power_Index': ':.1f'},
        labels={'Original_Power_Index': 'Base Power Index', 'Power_Index': f'Venue-Adjusted Power ({selected_venue.split(",")[0]})', 'Specific_Role': 'Role'},
        template="plotly_dark" if theme['text'] == 'white' else "plotly_white"
    )
    fig.add_shape(type='line', x0=0, y0=0, x1=scatter_df['Original_Power_Index'].max()*1.1, y1=scatter_df['Original_Power_Index'].max()*1.1, line=dict(color='gray', dash='dash'), name='No Change Line')
    fig.update_traces(marker=dict(size=8, line=dict(width=0.5, color='white')))
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color=theme['text']),
        legend=dict(bgcolor='rgba(0,0,0,0.3)'),
        height=500
    )
    st.plotly_chart(fig, use_container_width=True)
    st.caption("Players **above** the dashed line are boosted at this venue. Players **below** it are nerfed.")

# ================= TAB 3: ROOKIE RADAR =================
with tab3:
    st.title(f"🎯 {theme['name']} Rookie Radar")
    st.write("Using our elite Moneyball algorithm, a 'True Rookie' is defined strictly as a player with **≤ 10 career matches**. Here are the absolute best hidden gems on the market.")
    
    rookies = df[df['Matches_Played'] <= 10].copy()
    rookies = rookies.sort_values(by='Power_Index', ascending=False)
    
    if not rookies.empty:
        col_search, col_plot = st.columns([1, 2])
        
        with col_search:
            st.markdown("### 🔍 Scout a Rookie")
            selected_rookie = st.selectbox("Search Player", rookies['Player'].tolist())
            
            if selected_rookie:
                r_data = rookies[rookies['Player'] == selected_rookie].iloc[0]
                
                st.markdown(f"""
                <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; border-left: 5px solid {theme['accent']}; margin-top: 15px;">
                    <h3 style="color: {theme['accent']}; margin-top: 0;">{r_data['Player'].title()}</h3>
                    <p style="font-size: 16px; margin-bottom: 5px;"><b>Role:</b> {r_data['Specific_Role'].title()}</p>
                    <p style="font-size: 16px; margin-bottom: 5px;"><b>Style:</b> {r_data['Bowling_Style'].title()}</p>
                    <p style="font-size: 16px; margin-bottom: 5px;"><b>Matches Played:</b> {int(r_data['Matches_Played'])}</p>
                    <hr style="border-color: rgba(255,255,255,0.2);">
                    <p style="font-size: 18px; margin-bottom: 5px; color: {theme['text']};"><b>Power Index:</b> {r_data['Power_Index']:.1f}</p>
                    <p style="font-size: 16px; margin-bottom: 0; color: {theme['text']};"><b>Est. Value:</b> ₹ {r_data['Auction_Price']:.1f} Cr</p>
                </div>
                """, unsafe_allow_html=True)
            
        with col_plot:
            st.markdown("### 📊 Rookie Power vs Experience")
            fig = px.scatter(
                rookies, x='Matches_Played', y='Power_Index', 
                hover_name='Player',
                hover_data={'Role': True, 'Auction_Price': ':.1f', 'Matches_Played': True, 'Power_Index': ':.1f'},
                color='Power_Index',
                color_continuous_scale='Viridis',
                labels={'Matches_Played': 'Total Career IPL Matches', 'Power_Index': 'Algorithmic Power Score'},
                template="plotly_dark" if theme['text'] == 'white' else "plotly_white"
            )
            fig.update_traces(marker=dict(size=12, line=dict(width=1, color='White')))
            fig.add_hline(y=rookies['Power_Index'].median(), line_dash="dash", line_color=theme['accent'], annotation_text="Average Rookie Power")
            fig.add_vline(x=5, line_dash="dash", line_color=theme['accent'], annotation_text="Brand New (<= 5)")
            
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)', 
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color=theme['text'])
            )
            st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("No players found with <= 10 matches.")

# ================= TAB 4: MOCK AUCTION SIMULATOR =================
with tab4:
    st.title("💰 Mock Auction Simulator")
    st.write("Test your drafting strategies against aggressive AI franchises. Outbid them to build your ultimate 25-man roster within your ₹ 100 Cr budget!")
    
    # Dashboard metrics
    col1, col2, col3 = st.columns(3)
    col1.metric("Remaining Budget", f"₹ {st.session_state.user_budget:.2f} Cr")
    col2.metric("Drafted Players", f"{len(st.session_state.drafted_squad)} / 25")
    col3.metric("Players Remaining in Pool", f"{len(st.session_state.auction_pool) - st.session_state.current_player_idx}")
    
    st.markdown("---")
    
    if len(st.session_state.drafted_squad) >= 25:
        st.success("🎉 Roster Full! You have drafted 25 players.")
    elif st.session_state.current_player_idx >= len(st.session_state.auction_pool):
        st.success("The auction has concluded! The pool is empty.")
    else:
        # Get current player
        current_row = st.session_state.auction_pool.iloc[st.session_state.current_player_idx]
        
        if st.session_state.auction_state == 'new_player':
            if st.button("Pull Next Player from Hammer", key="pull_next"):
                st.session_state.auction_state = 'bidding'
                st.session_state.current_bid = 0.5
                st.session_state.highest_bidder = 'AI'
                base_price = current_row['Auction_Price']
                # AI is aggressive and can bid above the dataset limit (up to 1.5x)
                st.session_state.ai_max_bid = max(0.5, base_price * random.uniform(0.8, 1.5))
                st.rerun()
                
        elif st.session_state.auction_state == 'bidding':
            col_player, col_bid = st.columns([1, 1])
            
            with col_player:
                st.markdown(f"### On the Block: **{current_row['Player'].title()}**")
                st.write(f"**Role:** {current_row['Specific_Role'].title()} | **Style:** {current_row['Bowling_Style'].title()}")
                st.write(f"**Nationality:** {current_row['Nationality'].title()}")
                st.write(f"**Matches Played:** {int(current_row['Matches_Played'])}")
                st.write(f"**Power Index:** {current_row['Power_Index']:.1f}")
                
            with col_bid:
                st.markdown(f"<h2 style='color: {theme['accent']};'>Current Bid: ₹ {st.session_state.current_bid:.2f} Cr</h2>", unsafe_allow_html=True)
                
                if st.session_state.highest_bidder == 'AI':
                    st.warning("🚨 The AI Franchise currently holds the highest bid!")
                else:
                    st.success("✅ You hold the highest bid!")
                    
                next_bid = get_next_bid(st.session_state.current_bid)
                can_afford = next_bid <= st.session_state.user_budget
                
                col_btn1, col_btn2 = st.columns(2)
                
                if st.session_state.highest_bidder == 'AI':
                    with col_btn1:
                        if can_afford:
                            if st.button(f"Bid ₹ {next_bid:.2f} Cr", type="primary", key="place_bid"):
                                st.session_state.highest_bidder = 'User'
                                st.session_state.current_bid = next_bid
                                
                                # AI Counters
                                if st.session_state.current_bid < st.session_state.ai_max_bid:
                                    counter_bid = get_next_bid(st.session_state.current_bid)
                                    st.session_state.current_bid = counter_bid
                                    st.session_state.highest_bidder = 'AI'
                                st.rerun()
                        else:
                            st.error("Insufficient Funds to Bid!")
                            
                    with col_btn2:
                        if st.button("Pass / Let AI Buy", key="pass_bid"):
                            st.session_state.auction_state = 'sold_to_ai'
                            st.rerun()
                else:
                    st.success("The room is silent. The AI has backed out.")
                    if st.button("🔨 Finalize Purchase!", key="finalize_buy"):
                        st.session_state.auction_state = 'sold_to_user'
                        st.session_state.user_budget -= st.session_state.current_bid
                        player_dict = current_row.to_dict()
                        player_dict['Sold_Price'] = st.session_state.current_bid
                        st.session_state.drafted_squad.append(player_dict)
                        st.rerun()
                        
        elif st.session_state.auction_state == 'sold_to_user':
            st.success(f"🎉 SOLD! You drafted {current_row['Player']} for ₹ {st.session_state.current_bid:.2f} Cr!")
            if st.button("Next Player ➡️", key="next_after_win"):
                st.session_state.current_player_idx += 1
                st.session_state.auction_state = 'new_player'
                st.rerun()
                
        elif st.session_state.auction_state == 'sold_to_ai':
            st.error(f"❌ Sold to rival AI Franchise for ₹ {st.session_state.current_bid:.2f} Cr.")
            if st.button("Next Player ➡️", key="next_after_loss"):
                st.session_state.current_player_idx += 1
                st.session_state.auction_state = 'new_player'
                st.rerun()

    st.markdown("---")
    st.markdown("### Your Live Drafted Roster")
    if len(st.session_state.drafted_squad) > 0:
        draft_df = pd.DataFrame(st.session_state.drafted_squad)
        roles = ['top order', 'middle order', 'all-rounder', 'bowler']
        for role in roles:
            role_players = draft_df[draft_df['Specific_Role'] == role]
            if not role_players.empty:
                st.markdown(f"#### {get_role_icon(role)} {role.title()}s ({len(role_players)})")
                cols = st.columns(4)
                for idx, row in enumerate(role_players.itertuples()):
                    ovs = " ✈️" if row.Nationality == 'overseas' else ""
                    bg_alpha = "rgba(0,0,0,0.15)" if theme['text'] == "white" else "rgba(255,255,255,0.4)"
                    card_html = f'<div class="player-card"><div class="player-name">{row.Player.title()}{ovs}</div><div class="player-price">Won For: ₹ {row.Sold_Price:.2f} Cr</div><div style="margin-top: 10px; width: 100%; background-color: rgba(255,255,255,0.2); border-radius: 6px; height: 8px;"><div style="width: {row.Power_Index}%; background-color: {theme["accent"]}; height: 100%; border-radius: 6px; box-shadow: 0 0 5px {theme["accent"]};"></div></div></div>'
                    cols[idx % 4].markdown(card_html, unsafe_allow_html=True)
    else:
        st.write("You haven't drafted any players yet. Start bidding!")

# ================= TAB 5: ANALYTICS & LONGEVITY =================
with tab5:
    st.title("📈 Analytics & Franchise Longevity")
    st.write("Dive deep into your optimal squad's budget allocation, value buys, and long-term sustainability.")
    
    squad_names = st.session_state.get('retained_players', [])
    if not squad_names:
        st.warning("⚠️ You must retain or buy players in the War Room first to generate analytics.")
    else:
        squad_df = df[df['Player'].isin(squad_names)]
        
        # Dashboard metrics
        st.markdown("### 🧬 3-Year Franchise Health")
        score, avg_age, risk = calculate_longevity_score(squad_df)
        
        col1, col2, col3 = st.columns(3)
        col1.metric("Average Squad Age", f"{avg_age} Years")
        col2.metric("Franchise Longevity Score", f"{score}/100")
        col3.markdown(f"**Risk Level:**<br><span style='color: {theme['accent']}; font-size: 18px;'>{risk}</span>", unsafe_allow_html=True)
        
        st.markdown("---")
        
        st.markdown("### 💰 Budget Allocation by Role")
        budget_pie = squad_df.groupby('Specific_Role')['Auction_Price'].sum().reset_index()
        budget_pie['Specific_Role'] = budget_pie['Specific_Role'].str.title()
        
        fig1 = px.pie(
            budget_pie, values='Auction_Price', names='Specific_Role',
            hole=0.4, color_discrete_sequence=px.colors.qualitative.Pastel
        )
        fig1.update_traces(textposition='inside', textinfo='percent+label')
        fig1.update_layout(
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=theme['text']),
            showlegend=False
        )
        st.plotly_chart(fig1, use_container_width=True)
            
        st.markdown("### 🏆 Top 3 Value Buys (Highest Power per Crore)")
        value_df = squad_df.copy()
        value_df['Value_Score'] = value_df['Power_Index'] / value_df['Auction_Price']
        value_df = value_df.sort_values(by='Value_Score', ascending=False).head(3)
        
        val_cols = st.columns(3)
        for idx, row in enumerate(value_df.itertuples()):
            val_cols[idx].markdown(f"""
            <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid {theme['accent']};">
                <h4 style="color: {theme['accent']}; margin-top: 0;">{row.Player.title()}</h4>
                <p style="margin:0;"><b>Price:</b> ₹ {row.Auction_Price:.1f} Cr</p>
                <p style="margin:0;"><b>Power:</b> {row.Power_Index:.1f}</p>
                <p style="margin:0; font-size:12px; color:{theme['text']};"><b>Ratio:</b> {row.Value_Score:.1f} Pwr/Cr</p>
            </div>
            """, unsafe_allow_html=True)

