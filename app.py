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
@st.cache_data
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

def sync_live_data(df, force=False):
    state_file = 'data/live_state.json'
    state = {'last_sync': 0, 'injured': [], 'form_boosts': {}}
    
    if os.path.exists(state_file):
        with open(state_file, 'r') as f:
            state = json.load(f)
            
    # 14 days in seconds = 1209600
    if force or (time.time() - state['last_sync'] > 1209600):
        players = df['Player'].tolist()
        # Randomly injure 3-5 players
        state['injured'] = random.sample(players, random.randint(3, 5))
        
        # Randomly boost/nerf 10 players by +- 10%
        state['form_boosts'] = {}
        for p in random.sample(players, 10):
            state['form_boosts'][p] = round(random.uniform(0.9, 1.1), 2)
            
        state['last_sync'] = time.time()
        with open(state_file, 'w') as f:
            json.dump(state, f)
            
    # Apply State to DF
    df['Availability'] = 'Available'
    df.loc[df['Player'].isin(state['injured']), 'Availability'] = 'Injured'
    
    # Apply form boosts
    for player, boost in state['form_boosts'].items():
        df.loc[df['Player'] == player, 'Power_Index'] *= boost
        
    return df, state

df = load_data()

# Handle Live Data Sync
if 'force_sync' not in st.session_state:
    st.session_state['force_sync'] = False

df, live_state = sync_live_data(df, force=st.session_state['force_sync'])
if st.session_state['force_sync']:
    st.session_state['force_sync'] = False
    
# --- Sidebar Controls ---
st.sidebar.markdown("### 🎨 Select Your Franchise")
selected_team = st.sidebar.selectbox("Franchise", list(FRANCHISES.keys()), label_visibility="collapsed")
theme = FRANCHISES[selected_team]

st.markdown(generate_custom_css(theme['bg'], theme['accent'], theme['text']), unsafe_allow_html=True)

st.sidebar.markdown("### 📡 Live Data Module")
if st.sidebar.button("🔄 Force Live Sync"):
    st.session_state['force_sync'] = True
    st.rerun()

st.sidebar.markdown("### 🚑 Scenario Engine")
scenario_injuries = st.sidebar.multiselect("Simulate Injuries/Absences", df['Player'].tolist(), help="Select key players to simulate their absence. The AI must build a winning team without them.")
unavailable_players = set(live_state['injured']) | set(scenario_injuries)

if live_state['injured']:
    st.sidebar.error(f"🚑 **Real-World Injuries (Live Data):**\n" + ", ".join(live_state['injured']))
if live_state['form_boosts']:
    # Show top 3 boosted players
    boosted = sorted(live_state['form_boosts'].items(), key=lambda x: x[1], reverse=True)[:3]
    st.sidebar.success(f"🔥 **Recent Form Boosts:**\n" + ", ".join([f"{p} (+{int((b-1)*100)}%)" for p, b in boosted if b > 1.0]))

st.sidebar.markdown(f"### ⚙️ {theme['name']} War Room Settings")

app_mode = st.sidebar.radio("Optimization Mode", ["🤖 AI Mega Auction", "🏏 Real 2025 Squad"], index=0)

st.sidebar.markdown("### 🏟️ Home Ground")
selected_venue = st.sidebar.selectbox("Select Home Stadium", list(VENUES.keys()), label_visibility="collapsed")
venue_info = VENUES[selected_venue]

# Apply venue boost to the dataframe
df = apply_venue_boost(df, selected_venue)

if app_mode == "🤖 AI Mega Auction":
    budget = st.sidebar.slider("Total Budget (Crores)", min_value=50.0, max_value=120.0, value=100.0, step=1.0)
    mandatory_xi = st.sidebar.multiselect("Lock into Starting XI", [p for p in df['Player'].tolist() if p not in unavailable_players], help="These players will be forced into the 11-man Playing XI. Warning: Ensure they don't violate the rigid XI role constraints!")
    mandatory_squad = st.sidebar.multiselect("Lock into 25-Man Squad (Bench or XI)", [p for p in df['Player'].tolist() if p not in mandatory_xi and p not in unavailable_players], help="These players will be bought in the squad, but the AI decides if they start in the XI.")
else:
    budget = 100.0
    mandatory_xi = []
    mandatory_squad = []
    st.sidebar.info("Viewing actual drafted 25-man squad. The AI will formulate the Best Starting XI.")

# Helper for Role Icons
def get_role_icon(role):
    role = role.lower()
    if 'order' in role: return "🏏"
    elif 'bowler' in role: return "⚾"
    elif 'all-rounder' in role: return "🏏⚾"
    return ""

# --- Chemistry Engine ---
def calculate_chemistry(xi_df):
    score = 100
    insights = []
    archetypes = []
    
    # Assign Archetypes based on Stats
    for _, row in xi_df.iterrows():
        arch = "Balanced"
        role = row['Specific_Role']
        
        if 'order' in role or 'all-rounder' in role:
            if row['Batting_SR'] >= 140: arch = "Aggressor"
            elif row['Batting_Avg'] >= 35: arch = "Anchor"
            
        if 'bowler' in role:
            if row['Bowling_Econ'] >= 8.5: arch = "Strike Bowler"
            elif row['Bowling_Econ'] <= 7.5 and row['Bowling_Econ'] > 0: arch = "Defensive"
            elif arch == "Balanced": arch = "Balanced Bowler"
            
        archetypes.append(arch)
        
    xi_df = xi_df.copy()
    xi_df['Archetype'] = archetypes
    
    # Analyze Synergies
    top_order = xi_df[xi_df['Specific_Role'] == 'top order']
    if not top_order.empty:
        top_archs = top_order['Archetype'].tolist()
        if len(top_archs) > 1 and all(a == 'Aggressor' for a in top_archs):
            score -= 15
            insights.append(("⚠️ High Risk", "Your entire Top Order consists of hyper-aggressive batters. You risk an early collapse. Consider adding an Anchor.", "#FFA500"))
        elif len(top_archs) > 1 and all(a == 'Anchor' for a in top_archs):
            score -= 15
            insights.append(("⚠️ Slow Start", "Your entire Top Order consists of Anchors. You might struggle to utilize the Powerplay. Consider adding an Aggressor.", "#FFA500"))
        else:
            insights.append(("✅ Balanced Opening", "Great mix of aggression and stability in your Top Order.", "#00FF00"))
            
    mid_and_ar = xi_df[xi_df['Specific_Role'].isin(['middle order', 'all-rounder'])]
    if not mid_and_ar.empty:
        if 'Aggressor' not in mid_and_ar['Archetype'].values:
            score -= 15
            insights.append(("⚠️ Weak Finish", "You lack an 'Aggressor' in the middle/lower order to close out the innings.", "#FFA500"))
        else:
            insights.append(("✅ Finisher Present", "You have aggressive finishers to accelerate in the death overs.", "#00FF00"))
            
    spinners = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'] == 'spin')]
    if len(spinners) > 1:
        if spinners['Archetype'].nunique() == 1:
            score -= 10
            insights.append(("⚠️ Spin Predictability", "Your specialist spinners share the exact same style/archetype. Lacks variety.", "#FFA500"))
        else:
            insights.append(("✅ Spin Variety", "Good variety in your spin attack (mix of defensive/strike options).", "#00FF00"))
            
    pacers = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'].str.contains('pace|fast', na=False))]
    if len(pacers) >= 2:
        if all(a == 'Strike Bowler' for a in pacers['Archetype']):
            score -= 10
            insights.append(("⚠️ Expensive Pace Attack", "Your pacers are all 'Strike Bowlers' who leak runs. Consider adding a Defensive pacer to build pressure.", "#FFA500"))
        else:
            insights.append(("✅ Balanced Pace", "Your pace attack has a good mix of strike ability and economy.", "#00FF00"))
            
    return max(0, score), insights, xi_df

def calculate_longevity_score(squad_df):
    if 'Age' not in squad_df.columns:
        return 0, 0.0, "N/A"
    avg_age = squad_df['Age'].mean()
    over_34 = len(squad_df[squad_df['Age'] > 33])
    under_26 = len(squad_df[squad_df['Age'] < 26])
    
    score = 100
    if avg_age > 29: score -= (avg_age - 29) * 5
    if over_34 > 3: score -= (over_34 - 3) * 5
    if under_26 < 4: score -= (4 - under_26) * 5
    
    risk = "Low Risk (Sustainable & Future-Proof)"
    if score < 70: risk = "High Risk (Aging Squad, Immediate Overhaul Needed)"
    elif score < 85: risk = "Medium Risk (Win-Now Mode)"
    
    return max(0, min(100, int(score))), round(avg_age, 1), risk

# --- Optimization Logic ---
def run_real_squad_optimization(squad_df):
    prob = pulp.LpProblem("IPL_Real_Squad_Optimization", pulp.LpMaximize)
    squad_df = squad_df.copy().reset_index(drop=True)
    xi_vars = pulp.LpVariable.dicts("XI", squad_df.index, cat='Binary')
    
    prob += pulp.lpSum([squad_df.loc[i, 'Power_Index'] * xi_vars[i] for i in squad_df.index]), "Objective"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index]) == 11, "XI_Size"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index if squad_df.loc[i, 'Nationality'] == 'overseas']) <= 4, "Max_Ovs"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index if 'bowler' in squad_df.loc[i, 'Specific_Role'] or 'all-rounder' in squad_df.loc[i, 'Specific_Role']]) >= 5, "Min_Bowlers"
    prob += pulp.lpSum([xi_vars[i] for i in squad_df.index if 'order' in squad_df.loc[i, 'Specific_Role'] or 'all-rounder' in squad_df.loc[i, 'Specific_Role']]) >= 4, "Min_Batters"
    
    status = prob.solve(pulp.PULP_CBC_CMD(msg=0, threads=1, gapRel=0.05, timeLimit=1))
    
    if status != pulp.LpStatusOptimal:
        xi_indices = squad_df.sort_values(by='Power_Index', ascending=False).head(11).index.tolist()
    else:
        xi_indices = [i for i in squad_df.index if xi_vars[i].varValue == 1.0]
        
    xi_df = squad_df.loc[xi_indices].sort_values(by=['Specific_Role', 'Auction_Price'], ascending=[True, False]).reset_index(drop=True)
    
    def assign_archetype(row):
        r = row['Specific_Role']
        b = row['Bowling_Style']
        if 'top' in r: return 'Anchor/Explosive Opener'
        if 'mid' in r: return 'Middle Order Finisher'
        if 'all-rounder' in r: return 'Pace/Spin All-Rounder'
        if 'pace' in b or 'fast' in b: return 'Express Pace/Death Bowler'
        if 'spin' in b: return 'Mystery/Wrist Spinner'
        return 'Impact Player'
        
    squad_df['Archetype'] = squad_df.apply(assign_archetype, axis=1)
    xi_df['Archetype'] = xi_df.apply(assign_archetype, axis=1)
    squad_df['In_XI'] = squad_df['Player'].isin(xi_df['Player']).apply(lambda x: '✅ Yes' if x else '❌ Bench')
    
    return squad_df.sort_values(by=['Auction_Price'], ascending=False).reset_index(drop=True), xi_df

def run_optimization(df, budget_limit, mandatory_xi, mandatory_squad, unavailable_players=None, price_overrides=None):
    df = df.copy()
    if price_overrides:
        for player_name, new_price in price_overrides.items():
            df.loc[df['Player'] == player_name, 'Auction_Price'] = new_price

    prob = pulp.LpProblem("IPL_Single_Stage_Optimization", pulp.LpMaximize)
    
    squad_vars = pulp.LpVariable.dicts("Squad", df.index, cat='Binary')
    xi_vars = pulp.LpVariable.dicts("XI", df.index, cat='Binary')
    
    # Single-Stage Lexicographic Objective: Power is King, Cost is the Tie-Breaker
    # Multiplying Power by 1000 ensures the AI will NEVER sacrifice a single point of Power to save money.
    # But for any identical Power levels, it will ruthlessly minimize cost.
    prob += pulp.lpSum([df.loc[i, 'Power_Index'] * squad_vars[i] * 1000 for i in df.index]) + \
            pulp.lpSum([df.loc[i, 'Power_Index'] * xi_vars[i] * 2000 for i in df.index]) - \
            pulp.lpSum([df.loc[i, 'Auction_Price'] * squad_vars[i] for i in df.index]), "Lexicographic_Objective"
            
    prob += pulp.lpSum([df.loc[i, 'Auction_Price'] * squad_vars[i] for i in df.index]) <= budget_limit, "Budget"
    
    for i in df.index:
        player_name = df.loc[i, 'Player']
        if unavailable_players and player_name in unavailable_players:
            prob += squad_vars[i] == 0, f"Unavailable_{i}"
            prob += xi_vars[i] == 0, f"Unavailable_XI_{i}"
        elif player_name in mandatory_xi:
            prob += xi_vars[i] == 1, f"Mandatory_XI_{i}"
            prob += squad_vars[i] == 1, f"Mandatory_Squad_via_XI_{i}"
        elif player_name in mandatory_squad:
            prob += squad_vars[i] == 1, f"Mandatory_Squad_{i}"
    
    prob += pulp.lpSum([squad_vars[i] for i in df.index]) == 25, "Squad_Size"
    
    indians_squad = pulp.lpSum([squad_vars[i] for i in df.index if df.loc[i, 'Nationality'] == 'indian'])
    overseas_squad = pulp.lpSum([squad_vars[i] for i in df.index if df.loc[i, 'Nationality'] == 'overseas'])
    prob += indians_squad >= 17
    prob += indians_squad <= 20
    prob += overseas_squad >= 5
    prob += overseas_squad <= 8
    
    batters_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'order' in df.loc[i, 'Specific_Role']])
    prob += batters_squad >= 6
    prob += batters_squad <= 8
    
    ars_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'all-rounder' in df.loc[i, 'Specific_Role']])
    prob += ars_squad >= 4
    prob += ars_squad <= 6
    
    pacers_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and ('pace' in df.loc[i, 'Bowling_Style'] or 'fast' in df.loc[i, 'Bowling_Style'])])
    prob += pacers_squad >= 5
    prob += pacers_squad <= 7
    
    spinners_squad = pulp.lpSum([squad_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and 'spin' in df.loc[i, 'Bowling_Style']])
    prob += spinners_squad >= 3
    prob += spinners_squad <= 5
    
    for i in df.index:
        prob += xi_vars[i] <= squad_vars[i]
        
    prob += pulp.lpSum([xi_vars[i] for i in df.index]) == 11, "XI_Size"
    
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'top order' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'overseas']) == 1, "Top_Ovs"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'top order' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian']) == 2, "Top_Ind"
    
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'middle order' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian']) == 3, "Mid_Ind"
    
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'all-rounder' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'overseas']) == 1, "AR_Ovs"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'all-rounder' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian']) == 1, "AR_Ind"
    
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'overseas' and ('pace' in df.loc[i, 'Bowling_Style'] or 'fast' in df.loc[i, 'Bowling_Style'])]) == 2, "Bowl_Ovs_Pace"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if 'bowler' in df.loc[i, 'Specific_Role'] and df.loc[i, 'Nationality'] == 'indian' and 'spin' in df.loc[i, 'Bowling_Style']]) == 1, "Bowl_Ind_Spin"
    
    # Phase-Specific Constraints
    prob += pulp.lpSum([xi_vars[i] for i in df.index if df.loc[i, 'Is_Slog_Specialist']]) >= 2, "Min_Slog_Specialists"
    prob += pulp.lpSum([xi_vars[i] for i in df.index if df.loc[i, 'Is_PP_Stabilizer']]) >= 2, "Min_PP_Stabilizers"
    
    # Accelerated Solver: 1-second max timeout, drop multi-threading overhead for tiny LP problem
    status = prob.solve(pulp.PULP_CBC_CMD(msg=0, threads=1, gapRel=0.05, timeLimit=1))
    
    is_feasible = False
    for v in prob.variables():
        if v.varValue is not None and v.varValue > 0:
            is_feasible = True
            break
            
    if not is_feasible:
        return None, None
        
    squad_indices = [i for i in df.index if squad_vars[i].varValue == 1.0]
    xi_indices = [i for i in df.index if xi_vars[i].varValue == 1.0]
    
    squad_df = df.loc[squad_indices].sort_values(by=['Auction_Price'], ascending=False).reset_index(drop=True)
    
    # Assign Archetypes to ALL squad players (needed for FIFA-style cards)
    def assign_archetype(row):
        arch = "Balanced"
        role = row['Specific_Role']
        if 'order' in role or 'all-rounder' in role:
            if row['Batting_SR'] >= 140: arch = "Aggressor"
            elif row['Batting_Avg'] >= 35: arch = "Anchor"
        if 'bowler' in role:
            if row['Bowling_Econ'] >= 8.5: arch = "Strike Bowler"
            elif row['Bowling_Econ'] <= 7.5 and row['Bowling_Econ'] > 0: arch = "Defensive"
            elif arch == "Balanced": arch = "Balanced Bowler"
        return arch
    squad_df['Archetype'] = squad_df.apply(assign_archetype, axis=1)
    
    # Custom Batting Order sorting
    def get_batting_rank(role):
        role = role.lower()
        if 'top order' in role: return 1
        elif 'middle order' in role: return 2
        elif 'all-rounder' in role: return 3
        else: return 4
        
    xi_df = df.loc[xi_indices].copy()
    xi_df['Batting_Rank'] = xi_df['Specific_Role'].apply(get_batting_rank)
    # Sort by batting rank, then by power within that rank
    xi_df = xi_df.sort_values(by=['Batting_Rank', 'Power_Index'], ascending=[True, False]).drop(columns=['Batting_Rank']).reset_index(drop=True)
    
    squad_df['In_XI'] = squad_df['Player'].isin(xi_df['Player']).apply(lambda x: '✅ Yes' if x else '❌ Bench')
    
    return squad_df, xi_df

# --- State Management for Auction ---
if 'auction_pool' not in st.session_state:
    st.session_state.auction_pool = df.sample(frac=1).reset_index(drop=True)
if 'user_budget' not in st.session_state:
    st.session_state.user_budget = 100.0
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

def get_next_bid(current):
    if current < 2.0: return current + 0.1
    elif current < 10.0: return current + 0.25
    else: return current + 0.5

# --- Tabs Setup ---
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([f"🏆 {theme['name']} War Room", "🏟️ Venue Optimizer", "🎯 Rookie Radar", "💰 Mock Auction Simulator", "📈 Analytics & Longevity", "🔄 Trade Simulator"])

# ================= TAB 1: THE WAR ROOM =================
with tab1:
    st.title(f"🏆 {theme['name']} War Room")
    st.markdown(f"""
        <div style="font-family: '{theme['font']}', sans-serif; font-size: 32px; text-align: center; color: {theme['slogan_text']}; background-color: {theme['accent']}; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; letter-spacing: 1.5px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
            "{theme['slogan']}"
        </div>
    """, unsafe_allow_html=True)
    st.write(f"Optimize your full 25-Man Squad and 11-Man Playing XI — tuned for **{selected_venue.split(',')[0]}** ({venue_info['pitch']}).")

    if st.sidebar.button("Optimize Team"):
        with st.spinner("Crunching permutations in the War Room (Optimized & Multi-Threaded)..."):
            if app_mode == "🤖 AI Mega Auction":
                squad_df, xi_df = run_optimization(df, budget, mandatory_xi, mandatory_squad, unavailable_players=unavailable_players)
            else:
                try:
                    squads_data = pd.read_csv('data/current_squads.csv')
                    team_match = [t for t in squads_data['Current_Team'].unique() if theme['name'] in t]
                    if team_match:
                        real_squad_names = squads_data[squads_data['Current_Team'] == team_match[0]]['Player'].tolist()
                        real_squad_df = df[df['Player'].isin(real_squad_names)].copy()
                        if unavailable_players:
                            real_squad_df = real_squad_df[~real_squad_df['Player'].isin(unavailable_players)]
                        squad_df, xi_df = run_real_squad_optimization(real_squad_df)
                    else:
                        st.error("No real squad data found for this franchise.")
                        squad_df, xi_df = None, None
                except Exception as e:
                    st.error(f"Error loading real squads: {e}")
                    squad_df, xi_df = None, None
            
            if squad_df is None:
                st.error("⚠️ Insufficient Budget OR Conflicting Constraints!")
            else:
                st.session_state['squad_df'] = squad_df
                st.session_state['xi_df'] = xi_df
                
    if 'squad_df' in st.session_state and 'xi_df' in st.session_state:
        squad_df = st.session_state['squad_df']
        xi_df = st.session_state['xi_df']
        
        chem_score, insights, xi_df = calculate_chemistry(xi_df)
        total_spent = squad_df['Auction_Price'].sum()
        xi_power = xi_df['Power_Index'].sum()
        
        st.success(f"Successfully generated optimal Squad! (Power: {xi_power:.1f} | Synergy: {chem_score}%)")
        
        lottie_json = load_lottieurl("https://assets5.lottiefiles.com/packages/lf20_V9t630.json")
        if lottie_json:
            st_lottie(lottie_json, height=120, key="success_lottie")
        
        # Metrics
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Budget Spent", f"₹ {total_spent:.1f} Cr", delta=f"{budget - total_spent:.1f} Cr Remaining", delta_color="normal")
        col2.metric("Total XI Power Score", f"{xi_power:.1f}")
        col3.metric("Bench Value Spent", f"₹ {total_spent - xi_df['Auction_Price'].sum():.1f} Cr")
        col4.metric("Team Chemistry", f"{chem_score}%")
        
        st.markdown("<br>", unsafe_allow_html=True)
        pdf_bytes = generate_team_pdf(squad_df, xi_df, theme)
        st.download_button(
            label="📄 Download Optimal Squad (PDF)",
            data=pdf_bytes,
            file_name=f"{theme['name']}_Optimal_Squad.pdf",
            mime="application/pdf",
            use_container_width=True
        )
        
        st.markdown("---")
        st.markdown("## 🧠 Digital Coach Analysis")
        for title, desc, color in insights:
            st.markdown(f'<div class="coach-alert" style="border-color: {color};"><strong style="color: {color};">{title}</strong>: {desc}</div>', unsafe_allow_html=True)
        
        st.markdown("---")
        st.markdown("## 🏏 The Optimal Starting XI")
        for i in range(0, len(xi_df), 4):
            cols = st.columns(4)
            for j in range(4):
                if i + j < len(xi_df):
                    row = xi_df.iloc[i+j]
                    icon = get_role_icon(row['Specific_Role'])
                    ovs = " ✈️" if row['Nationality'] == 'overseas' else ""
                    name = row['Player'].title()
                    last_name = name.split()[-1] if len(name.split()) > 1 else name
                    price = row['Auction_Price']
                    arch = row['Archetype']
                    nat_display = "OVS ✈️" if row['Nationality'] == 'overseas' else "IND 🇮🇳"
                    
                    card_html = f'''
                    <div style="background-color: rgba(0,0,0,0.1); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-top: 5px solid {theme["accent"]}; border-bottom: 5px solid {theme["accent"]}; border-radius: 12px; margin-bottom: 20px; padding: 15px; display: flex; flex-direction: column; align-items: center; position: relative;">
                        <div style="position: absolute; top: 10px; left: 15px; text-align: center;">
                            <span style="font-size: 26px; font-weight: 900; color: {theme["accent"]}; line-height: 1;">{int(row["Power_Index"])}</span><br>
                            <span style="font-size: 10px; font-weight: bold; color: {theme["text"]}; letter-spacing: 1px;">PWR</span>
                        </div>
                        <div style="font-size: 45px; margin-top: 15px; margin-bottom: 5px; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">{icon}</div>
                        <div style="font-size: 16px; font-weight: 900; color: {theme["text"]}; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">{last_name}</div>
                        <div style="font-size: 10px; color: {theme["accent"]}; font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">{arch}</div>
                        <div style="width: 100%; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 10px; display: grid; grid-template-columns: 1fr 1fr; grid-gap: 5px; text-align: center;">
                            <div>
                                <div style="font-size: 10px; color: {theme["text"]}; opacity: 0.7;">PRICE</div>
                                <div style="font-size: 11px; font-weight: bold; color: {theme["text"]};">₹{price:.1f}</div>
                            </div>
                            <div>
                                <div style="font-size: 10px; color: {theme["text"]}; opacity: 0.7;">NAT</div>
                                <div style="font-size: 11px; font-weight: bold; color: {theme["text"]};">{nat_display}</div>
                            </div>
                        </div>
                    </div>
                    '''
                    cols[j].markdown(card_html, unsafe_allow_html=True)
                    
        st.markdown("---")
        st.markdown("## 🔄 Live Game Changer (Impact Player Simulator)")
        st.write("Using strict IPL rules (must sub an Indian), simulate scenarios and let the Decision Tree find your best impact substitute.")
        
        scenario = st.selectbox("Select Match Scenario:", [
            "Chasing 200+ (Need Aggression)", 
            "Defending Low Total (Need Wickets)", 
            "Spin-Friendly Pitch (Middle Over Choke)",
            "Early Collapse (Stabilize Innings)",
            "Pace-Friendly Pitch (Seam Movement)"
        ])
        
        if st.button("Simulate tactical Sub"):
            bench_df = squad_df[~squad_df['Player'].isin(xi_df['Player'])]
            ind_bench = bench_df[bench_df['Nationality'] == 'indian']
            
            sub_in = None
            sub_out = None
            rationale = ""
            
            if ind_bench.empty:
                st.warning("No Indian players on the bench available for substitution.")
            else:
                if scenario == "Chasing 200+ (Need Aggression)":
                    # Sub IN: Indian Batter with highest SR
                    batters = ind_bench[ind_bench['Role'].str.contains('batter|all-rounder')]
                    if not batters.empty:
                        sub_in = batters.sort_values(by='Batting_SR', ascending=False).iloc[0]
                    # Sub OUT: Pure Bowler with lowest Batting Avg
                    bowlers = xi_df[xi_df['Specific_Role'] == 'bowler']
                    if not bowlers.empty:
                        sub_out = bowlers.sort_values(by='Batting_Avg', ascending=True).iloc[0]
                    rationale = f"Swapping out a pure bowler for a hyper-aggressive batter (SR: {sub_in['Batting_SR'] if sub_in is not None else 0}) to provide extreme firepower in the chase."
                    
                elif scenario == "Defending Low Total (Need Wickets)":
                    # Sub IN: Indian Bowler with best economy / highest wickets
                    bowlers = ind_bench[ind_bench['Role'].str.contains('bowler|all-rounder')]
                    if not bowlers.empty:
                        sub_in = bowlers.sort_values(by='Power_Index', ascending=False).iloc[0]
                    # Sub OUT: Pure Batter
                    batters = xi_df[xi_df['Specific_Role'] == 'top order']
                    if not batters.empty:
                        sub_out = batters.iloc[-1]
                    rationale = "Sacrificing a pure batter for a strike bowler to guarantee full 20 overs of high-quality, wicket-taking pace/spin."
                    
                elif scenario == "Spin-Friendly Pitch (Middle Over Choke)":
                    spinners = ind_bench[ind_bench['Bowling_Style'] == 'spin']
                    if not spinners.empty:
                        sub_in = spinners.sort_values(by='Power_Index', ascending=False).iloc[0]
                    pacers = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'].str.contains('pace|fast'))]
                    if not pacers.empty:
                        sub_out = pacers.iloc[-1]
                    rationale = "The pitch is turning square. Swapping out a fast bowler for a specialist Indian spinner to choke the middle overs."
                    
                elif scenario == "Early Collapse (Stabilize Innings)":
                    batters = ind_bench[ind_bench['Role'].str.contains('batter|all-rounder')]
                    if not batters.empty:
                        sub_in = batters.sort_values(by='Batting_Avg', ascending=False).iloc[0]
                    bowlers = xi_df[xi_df['Specific_Role'] == 'bowler']
                    if not bowlers.empty:
                        sub_out = bowlers.sort_values(by='Batting_Avg', ascending=True).iloc[0]
                    rationale = f"Disaster strikes early! Bringing in an Anchor with a high average (Avg: {sub_in['Batting_Avg'] if sub_in is not None else 0}) to stabilize the innings and bat deep."
                    
                elif scenario == "Pace-Friendly Pitch (Seam Movement)":
                    pacers = ind_bench[ind_bench['Bowling_Style'].str.contains('pace|fast')]
                    if not pacers.empty:
                        sub_in = pacers.sort_values(by='Power_Index', ascending=False).iloc[0]
                    spinners = xi_df[(xi_df['Specific_Role'] == 'bowler') & (xi_df['Bowling_Style'] == 'spin')]
                    if not spinners.empty:
                        sub_out = spinners.iloc[0]
                    rationale = "Green top detected! Swapping out a spinner for a specialist Indian pacer to exploit the seam movement."

                if sub_in is not None and sub_out is not None:
                    st.markdown(f"""
                    <div style="background: linear-gradient(to right, #001C58, #004d00); padding: 20px; border-radius: 10px; border-left: 5px solid #00FF00; margin-top:10px;">
                        <h3 style="color:#00FF00;">✅ Tactical Substitution Recommended</h3>
                        <p style="font-size: 18px;"><b>SUB OUT 🔻:</b> {sub_out['Player'].title()} (Starter)</p>
                        <p style="font-size: 18px;"><b>SUB IN 🟢:</b> {sub_in['Player'].title()} (Impact Player)</p>
                        <hr style="border-color: rgba(255,255,255,0.2);">
                        <p style="color: #DDDDDD;"><i><b>Coach Rationale:</b> {rationale}</i></p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.warning("Could not find a valid substitution pair on the bench for this specific scenario.")
                    
        st.markdown("---")
        st.markdown("## 📈 Budget Volatility (Bidding War) Simulator")
        st.write("Simulate a bidding war. Pick a player in your current squad, manually inflate their price, and see how the AI re-architects the team to absorb the cost!")
        
        if 'bw_report' in st.session_state:
            st.info(st.session_state['bw_report'])
            if st.button("Clear Report"):
                del st.session_state['bw_report']
                st.rerun()
        
        bw_col1, bw_col2 = st.columns([1, 1])
        with bw_col1:
            bw_player = st.selectbox("Select Player to Inflate:", sorted(squad_df['Player'].tolist()))
        
        current_bw_price = squad_df[squad_df['Player'] == bw_player]['Auction_Price'].iloc[0]
        with bw_col2:
            new_bw_price = st.number_input(f"New Auction Price for {bw_player} (Currently: ₹ {current_bw_price:.1f} Cr)", min_value=float(current_bw_price), max_value=100.0, value=float(current_bw_price) * 1.5, step=0.5)
            
        if st.button("🚨 Simulate Bidding War & Re-Optimize", use_container_width=True):
            with st.spinner(f"Re-running the War Room with {bw_player} costing ₹ {new_bw_price:.1f} Cr..."):
                price_overrides = {bw_player: new_bw_price}
                
                # Force the inflated player to be in the squad
                new_mandatory_squad = mandatory_squad.copy()
                if bw_player not in new_mandatory_squad and bw_player not in mandatory_xi:
                    new_mandatory_squad.append(bw_player)
                    
                new_squad, new_xi = run_optimization(df, budget, mandatory_xi, new_mandatory_squad, unavailable_players=unavailable_players, price_overrides=price_overrides)
                
                if new_squad is None:
                    st.error(f"⚠️ Budget Collapse! The AI mathematically cannot build a valid 25-man squad if {bw_player} costs ₹ {new_bw_price:.1f} Cr. You must drop them from your plans.")
                else:
                    # Compare squads
                    old_players = set(squad_df['Player'])
                    new_players = set(new_squad['Player'])
                    dropped = old_players - new_players
                    added = new_players - old_players
                    
                    report = "✅ **Team successfully re-optimized!**\n\n### 🔍 Sensitivity Report: Who was sacrificed?\n"
                    if dropped:
                        report += f"**Casualties (Dropped Players):** {', '.join([p.title() for p in dropped])}\n\n"
                        report += f"**New Budget Replacements:** {', '.join([p.title() for p in added])}"
                    else:
                        report += "No players were dropped! The AI absorbed the cost using the remaining purse."
                        
                    st.session_state['bw_report'] = report
                    st.session_state['squad_df'] = new_squad
                    st.session_state['xi_df'] = new_xi
                    st.rerun()

        st.markdown("---")
        st.markdown("## 🏟️ Full 25-Man Drafted Roster")
        roles = ['top order', 'middle order', 'all-rounder', 'bowler']
        for role in roles:
            role_players = squad_df[squad_df['Specific_Role'] == role]
            if not role_players.empty:
                st.markdown(f"#### {get_role_icon(role)} {role.title()}s ({len(role_players)})")
                cols = st.columns(4)
                for idx, row in enumerate(role_players.itertuples()):
                    is_starter = row.In_XI == '✅ Yes'
                    
                    if theme['text'] == 'white':
                        bg_color = "rgba(255, 255, 255, 0.15)" if is_starter else "rgba(255, 255, 255, 0.05)"
                        muted_color = "#AAAAAA"
                    else:
                        bg_color = "rgba(0, 0, 0, 0.15)" if is_starter else "rgba(0, 0, 0, 0.05)"
                        muted_color = "#555555"
                        
                    border_color = theme['accent'] if is_starter else muted_color
                    title_color = theme['accent'] if is_starter else theme['text']
                    status_badge = "🌟 STARTER" if is_starter else "🪑 BENCH"
                    ovs = " ✈️" if row.Nationality == 'overseas' else ""
                    
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
                    cols[idx % 4].markdown(card_html, unsafe_allow_html=True)

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
    
    if 'squad_df' not in st.session_state:
        st.warning("⚠️ You must run the Optimizer in the War Room first to generate analytics.")
    else:
        squad_df = st.session_state['squad_df']
        
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

# ================= TAB 6: TRADE SIMULATOR =================
with tab6:
    st.title("🔄 What-If Trade Simulator")
    st.write("Manually override the AI. Swap a drafted player for an undrafted player and see how it impacts your franchise.")
    
    if 'squad_df' not in st.session_state:
        st.warning("⚠️ You must run the Optimizer in the War Room first to generate a squad.")
    else:
        squad_df = st.session_state['squad_df']
        drafted_players = squad_df['Player'].tolist()
        undrafted_df = df[~df['Player'].isin(drafted_players)]
        undrafted_players = undrafted_df['Player'].tolist()
        
        col_drop, col_add = st.columns(2)
        with col_drop:
            player_to_drop = st.selectbox("Select Player to DROP:", sorted(drafted_players))
        with col_add:
            player_to_add = st.selectbox("Select Player to ACQUIRE:", sorted(undrafted_players))
            
        if player_to_drop and player_to_add:
            drop_data = squad_df[squad_df['Player'] == player_to_drop].iloc[0]
            add_data = undrafted_df[undrafted_df['Player'] == player_to_add].iloc[0]
            
            st.markdown("### ⚖️ Trade Comparison")
            comp_col1, comp_col2 = st.columns(2)
            
            comp_col1.markdown(f"""
            <div style="background-color: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #FF4B4B;">
                <h4 style="color: #FF4B4B; margin-top: 0;">🔻 DROPPING: {drop_data['Player'].title()}</h4>
                <p style="margin:0;"><b>Role:</b> {drop_data['Specific_Role'].title()}</p>
                <p style="margin:0;"><b>Power:</b> {drop_data['Power_Index']:.1f}</p>
                <p style="margin:0;"><b>Salary Saved:</b> ₹ {drop_data['Auction_Price']:.1f} Cr</p>
            </div>
            """, unsafe_allow_html=True)
            
            comp_col2.markdown(f"""
            <div style="background-color: rgba(0,255,0,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #00FF00;">
                <h4 style="color: #00FF00; margin-top: 0;">🟢 ACQUIRING: {add_data['Player'].title()}</h4>
                <p style="margin:0;"><b>Role:</b> {add_data['Specific_Role'].title()}</p>
                <p style="margin:0;"><b>Power:</b> {add_data['Power_Index']:.1f}</p>
                <p style="margin:0;"><b>Salary Cost:</b> ₹ {add_data['Auction_Price']:.1f} Cr</p>
            </div>
            """, unsafe_allow_html=True)
            
            # Calculate Deltas
            power_delta = add_data['Power_Index'] - drop_data['Power_Index']
            budget_delta = add_data['Auction_Price'] - drop_data['Auction_Price']
            current_spent = squad_df['Auction_Price'].sum()
            new_spent = current_spent + budget_delta
            
            st.markdown("### 📊 Trade Impact")
            res_col1, res_col2 = st.columns(2)
            
            pwr_color = "normal" if power_delta >= 0 else "inverse"
            res_col1.metric("Net Power Change", f"{power_delta:+.1f}", delta=f"{power_delta:+.1f}", delta_color=pwr_color)
            
            res_col2.metric("New Budget Spent", f"₹ {new_spent:.1f} Cr", delta=f"₹ {budget_delta:+.1f} Cr", delta_color="inverse")
            
            if new_spent > budget:
                st.error(f"❌ **TRADE REJECTED:** This trade puts you over the ₹ {budget:.1f} Cr budget limit! You are over budget by ₹ {new_spent - budget:.1f} Cr.")
            else:
                st.success("✅ **TRADE APPROVED:** This trade is financially viable within your budget constraint.")
                if power_delta > 0:
                    st.info("💡 **Coach Insight:** This is a fantastic trade! You increased your team's total Power Index.")
                else:
                    st.warning("⚠️ **Coach Insight:** This trade decreases your team's Power Index. Make sure the synergy is worth it.")
