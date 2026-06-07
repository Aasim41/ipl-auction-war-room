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

# --- Sidebar ---
st.sidebar.markdown("### 🎨 Select Your Franchise")
selected_team = st.sidebar.selectbox("Franchise", list(FRANCHISES.keys()), label_visibility="collapsed")
theme = FRANCHISES[selected_team]

st.markdown(generate_custom_css(theme['bg'], theme['accent'], theme['text']), unsafe_allow_html=True)

st.sidebar.markdown("### 📡 Live API Sync")
if st.sidebar.button("🌐 Fetch Live CricAPI Squads"):
    with st.spinner("Connecting to CricketData.org API..."):
        try:
            from fetch_live_squads import fetch_and_map_squads
            success, msg = fetch_and_map_squads()
            if success:
                st.sidebar.success(msg)
                st.session_state.app_phase = 'setup' # Reset to reload data
                st.rerun()
            else:
                st.sidebar.error(msg)
        except Exception as e:
            st.sidebar.error(f"Failed: {e}")

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
        
        # We will use an editable dataframe for manual selection
        current_roster_df['Retain'] = current_roster_df['Player'].isin(st.session_state.get('retained_players', []))
        
        edited_df = st.data_editor(
            current_roster_df[['Retain', 'Player', 'Role', 'Auction_Price', 'Power_Index']],
            hide_index=True,
            column_config={"Retain": st.column_config.CheckboxColumn("Retain?", default=False)}
        )
        
        manual_retained = edited_df[edited_df['Retain']]['Player'].tolist()
        
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
        
        # Display pool with buy checkboxes
        pool_display = pool_df[['Player', 'Role', 'Auction_Price', 'Power_Index']].sort_values(by='Power_Index', ascending=False)
        pool_display['Buy'] = False
        
        manual_buys = st.data_editor(
            pool_display,
            hide_index=True,
            column_config={"Buy": st.column_config.CheckboxColumn("Buy?", default=False)}
        )
        
        buy_names = manual_buys[manual_buys['Buy']]['Player'].tolist()
        buy_cost = manual_buys[manual_buys['Buy']]['Auction_Price'].sum()
        
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
        squad_display = squad_df[['Player', 'Role', 'Nationality', 'Power_Index']].copy()
        squad_display['Start'] = False
        
        manual_11 = st.data_editor(
            squad_display,
            hide_index=True,
            column_config={"Start": st.column_config.CheckboxColumn("Start in 11?", default=False)}
        )
        
        selected_11_names = manual_11[manual_11['Start']]['Player'].tolist()
        
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

