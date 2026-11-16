from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import random
from ..database import get_db
from ..models.player import Player
from ..services.predictive_model_service import predictive_service

router = APIRouter()

# Multi-Agent AI Franchise Bidding Personalities & Game-Theory Archetypes
FRANCHISE_AI_PERSONALITIES: Dict[str, Dict[str, Any]] = {
    "CSK": {
        "title": "Spin Syndicate & Veteran Anchor",
        "tagline": "The Dad's Army & Chepauk Spin Fortress",
        "description": "Patient, relentless for spin-bowling all-rounders and experienced veterans (age 30+). Never overpays for unproven pace.",
        "target_roles": ["AR", "WK", "BOWL"],
        "target_styles": ["spin", "slow", "off break", "leg break"],
        "min_exp_bias": 1.35,
        "panic_threshold": 0.15,
        "max_bid_multiplier": 1.25,
        "role_multipliers": {"AR": 1.50, "WK": 1.25, "BOWL": 1.20, "BAT": 1.0},
        "color": "#eab308"
    },
    "PBKS": {
        "title": "Panic-Buying Express Pace Enforcer",
        "tagline": "The Big Money & 145+ km/h Speed Frenzy",
        "description": "Notorious for frantic bidding wars on express fast bowlers and overseas marquee superstars. High FOMO.",
        "target_roles": ["BOWL", "BAT"],
        "target_styles": ["fast", "pace", "seam", "express"],
        "min_exp_bias": 1.0,
        "panic_threshold": 0.85,
        "max_bid_multiplier": 1.70,
        "role_multipliers": {"BOWL": 1.65, "BAT": 1.35, "AR": 1.10, "WK": 1.0},
        "color": "#ef4444"
    },
    "MI": {
        "title": "Data Scouting & Death Bowler Factory",
        "tagline": "Calculated Precision & Match-Winner Hoarding",
        "description": "Strategic and ruthless; zeroes in on unplayable death seamers, explosive top-order openers, and high-ceiling Indian talent.",
        "target_roles": ["BOWL", "BAT"],
        "target_styles": ["pace", "yorker", "death", "explosive"],
        "min_exp_bias": 1.15,
        "panic_threshold": 0.30,
        "max_bid_multiplier": 1.45,
        "role_multipliers": {"BOWL": 1.45, "BAT": 1.40, "AR": 1.20, "WK": 1.05},
        "color": "#3b82f6"
    },
    "KKR": {
        "title": "Caribbean Power & Mystery Spin Collective",
        "tagline": "Eden Gardens Mystery Spin & Huge Sixes",
        "description": "Unafraid to break the bank for mystery spinners, dynamic Caribbean all-rounders, and death-ball powerhitters.",
        "target_roles": ["AR", "BOWL"],
        "target_styles": ["mystery", "spin", "power", "finisher"],
        "min_exp_bias": 1.10,
        "panic_threshold": 0.50,
        "max_bid_multiplier": 1.50,
        "role_multipliers": {"AR": 1.60, "BOWL": 1.30, "BAT": 1.15, "WK": 1.05},
        "color": "#8b5cf6"
    },
    "SRH": {
        "title": "Powerplay Destruction & Strike Seamers",
        "tagline": "275+ Carnage Intent & Red-Hot Fast Bowling",
        "description": "Ultra-aggressive on top-order demolition openers (200+ strike rate) and frontline swing spearheads.",
        "target_roles": ["BAT", "BOWL"],
        "target_styles": ["fast", "swing", "aggressive", "strike"],
        "min_exp_bias": 1.05,
        "panic_threshold": 0.60,
        "max_bid_multiplier": 1.55,
        "role_multipliers": {"BAT": 1.55, "BOWL": 1.40, "WK": 1.25, "AR": 1.10},
        "color": "#f97316"
    },
    "RR": {
        "title": "Moneyball & Leg-Spin Prodigy Cult",
        "tagline": "Analytical ROI & Uncapped Talent Hunting",
        "description": "Calculated value investor. Targets high-upside uncapped Indian prodigies and elite international leg-spinners.",
        "target_roles": ["BOWL", "BAT"],
        "target_styles": ["leg break", "googly", "spin", "young"],
        "min_exp_bias": 0.85,
        "panic_threshold": 0.25,
        "max_bid_multiplier": 1.30,
        "role_multipliers": {"BOWL": 1.35, "BAT": 1.30, "WK": 1.20, "AR": 1.15},
        "color": "#ec4899"
    },
    "RCB": {
        "title": "Superstar Brand & Chinnaswamy Belters",
        "tagline": "Bold Army & High-Scoring Boundary Clearing",
        "description": "Pushes the price ceiling for marquee batters, box-office icons, and Chinnaswamy swing/death specialists.",
        "target_roles": ["BAT", "BOWL", "WK"],
        "target_styles": ["batting", "six hitting", "pace"],
        "min_exp_bias": 1.20,
        "panic_threshold": 0.65,
        "max_bid_multiplier": 1.60,
        "role_multipliers": {"BAT": 1.55, "BOWL": 1.35, "WK": 1.30, "AR": 1.15},
        "color": "#dc2626"
    },
    "DC": {
        "title": "Young Indian Core & Wicket-Keeper Blitz",
        "tagline": "Fearless Youth & Left-Arm Pace Arsenal",
        "description": "Aggressively scouts dynamic Indian wicket-keeper batsmen and left-arm express pacers.",
        "target_roles": ["WK", "BOWL"],
        "target_styles": ["left-arm", "keeper", "youth"],
        "min_exp_bias": 1.00,
        "panic_threshold": 0.45,
        "max_bid_multiplier": 1.40,
        "role_multipliers": {"WK": 1.55, "BOWL": 1.35, "BAT": 1.20, "AR": 1.10},
        "color": "#0ea5e9"
    },
    "LSG": {
        "title": "Multi-Dimensional All-Rounder Fortress",
        "tagline": "Batting Deep & Slow-Deck Ekana Masters",
        "description": "Hoards versatile all-rounders who can bowl 4 overs and bat deep. High priority on gripping pitch specialists.",
        "target_roles": ["AR"],
        "target_styles": ["cutters", "finger spin", "ar"],
        "min_exp_bias": 1.10,
        "panic_threshold": 0.40,
        "max_bid_multiplier": 1.35,
        "role_multipliers": {"AR": 1.65, "BOWL": 1.25, "BAT": 1.15, "WK": 1.10},
        "color": "#06b6d4"
    },
    "GT": {
        "title": "Clutch Match-Finishers & Hard-Length Pace",
        "tagline": "Ice-Cool Composure & Gritty Team Balance",
        "description": "Ice-cool bidding on clutch lower-order enforcers and hard-length 140+ seamers. Refuses to get baited.",
        "target_roles": ["AR", "BOWL"],
        "target_styles": ["pace", "finisher", "hard-length"],
        "min_exp_bias": 1.15,
        "panic_threshold": 0.20,
        "max_bid_multiplier": 1.35,
        "role_multipliers": {"BOWL": 1.40, "AR": 1.35, "BAT": 1.25, "WK": 1.10},
        "color": "#1e293b"
    }
}

# Official Former Franchise Registry for RTM Triggers
PLAYER_FORMER_FRANCHISES = {
    "rishabh pant": "DC",
    "shreyas iyer": "KKR",
    "kl rahul": "LSG",
    "arshdeep singh": "PBKS",
    "yuzvendra chahal": "RR",
    "mitchell starc": "KKR",
    "jos buttler": "RR",
    "mohammed siraj": "RCB",
    "ishan kishan": "MI",
    "liam livingstone": "PBKS",
    "washington sundar": "SRH",
    "glenn maxwell": "RCB",
    "faf du plessis": "RCB",
    "david warner": "DC",
    "phil salt": "KKR",
    "kagiso rabada": "PBKS",
    "quinton de kock": "LSG",
    "trent boult": "RR",
    "marcus stoinis": "LSG",
    "ravichandran ashwin": "RR",
    "bhuvneshwar kumar": "SRH",
    "mohammed shami": "GT",
    "sam curran": "PBKS",
    "harshal patel": "PBKS",
    "venkatesh iyer": "KKR"
}

# Official BCCI Mega Auction Retention Slabs (in Crores)
BCCI_CAPPED_SLABS = [18.0, 14.0, 11.0, 18.0, 14.0]
BCCI_UNCAPPED_SLAB = 4.0
BCCI_MEGA_PURSE = 120.0

# Official Mega Auction Presets for all 10 Franchises
OFFICIAL_MEGA_PRESETS = {
    "RCB": {
        "retentions": [
            {"name": "Virat Kohli", "price": 21.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Rajat Patidar", "price": 11.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Yash Dayal", "price": 5.0, "is_uncapped": True, "role": "BOWL"}
        ],
        "deducted_purse": 37.0,
        "starting_purse": 83.0,
        "rtm_cards": 3
    },
    "CSK": {
        "retentions": [
            {"name": "Ruturaj Gaikwad", "price": 18.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Ravindra Jadeja", "price": 18.0, "is_uncapped": False, "role": "AR"},
            {"name": "Matheesha Pathirana", "price": 14.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Shivam Dube", "price": 12.0, "is_uncapped": False, "role": "AR"},
            {"name": "MS Dhoni", "price": 4.0, "is_uncapped": True, "role": "WK"}
        ],
        "deducted_purse": 66.0,
        "starting_purse": 54.0,
        "rtm_cards": 1
    },
    "MI": {
        "retentions": [
            {"name": "Jasprit Bumrah", "price": 18.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Suryakumar Yadav", "price": 16.35, "is_uncapped": False, "role": "BAT"},
            {"name": "Hardik Pandya", "price": 16.35, "is_uncapped": False, "role": "AR"},
            {"name": "Rohit Sharma", "price": 16.3, "is_uncapped": False, "role": "BAT"},
            {"name": "Tilak Varma", "price": 8.0, "is_uncapped": False, "role": "BAT"}
        ],
        "deducted_purse": 75.0,
        "starting_purse": 45.0,
        "rtm_cards": 1
    },
    "KKR": {
        "retentions": [
            {"name": "Rinku Singh", "price": 13.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Varun Chakaravarthy", "price": 12.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Sunil Narine", "price": 12.0, "is_uncapped": False, "role": "AR"},
            {"name": "Andre Russell", "price": 12.0, "is_uncapped": False, "role": "AR"},
            {"name": "Harshit Rana", "price": 4.0, "is_uncapped": True, "role": "BOWL"},
            {"name": "Ramandeep Singh", "price": 4.0, "is_uncapped": True, "role": "AR"}
        ],
        "deducted_purse": 69.0,
        "starting_purse": 51.0,
        "rtm_cards": 0
    },
    "PBKS": {
        "retentions": [
            {"name": "Shashank Singh", "price": 5.5, "is_uncapped": True, "role": "BAT"},
            {"name": "Prabhsimran Singh", "price": 4.0, "is_uncapped": True, "role": "WK"}
        ],
        "deducted_purse": 9.5,
        "starting_purse": 110.5,
        "rtm_cards": 4
    },
    "SRH": {
        "retentions": [
            {"name": "Heinrich Klaasen", "price": 23.0, "is_uncapped": False, "role": "WK"},
            {"name": "Pat Cummins", "price": 18.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Abhishek Sharma", "price": 14.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Travis Head", "price": 14.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Nitish Kumar Reddy", "price": 6.0, "is_uncapped": False, "role": "AR"}
        ],
        "deducted_purse": 75.0,
        "starting_purse": 45.0,
        "rtm_cards": 1
    },
    "RR": {
        "retentions": [
            {"name": "Sanju Samson", "price": 18.0, "is_uncapped": False, "role": "WK"},
            {"name": "Yashasvi Jaiswal", "price": 18.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Riyan Parag", "price": 14.0, "is_uncapped": False, "role": "AR"},
            {"name": "Dhruv Jurel", "price": 14.0, "is_uncapped": False, "role": "WK"},
            {"name": "Shimron Hetmyer", "price": 11.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Sandeep Sharma", "price": 4.0, "is_uncapped": True, "role": "BOWL"}
        ],
        "deducted_purse": 79.0,
        "starting_purse": 41.0,
        "rtm_cards": 0
    },
    "DC": {
        "retentions": [
            {"name": "Axar Patel", "price": 16.5, "is_uncapped": False, "role": "AR"},
            {"name": "Kuldeep Yadav", "price": 13.25, "is_uncapped": False, "role": "BOWL"},
            {"name": "Tristan Stubbs", "price": 10.0, "is_uncapped": False, "role": "BAT"},
            {"name": "Abishek Porel", "price": 4.0, "is_uncapped": True, "role": "WK"}
        ],
        "deducted_purse": 47.0,
        "starting_purse": 73.0,
        "rtm_cards": 2
    },
    "LSG": {
        "retentions": [
            {"name": "Nicholas Pooran", "price": 21.0, "is_uncapped": False, "role": "WK"},
            {"name": "Ravi Bishnoi", "price": 11.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Mayank Yadav", "price": 11.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Mohsin Khan", "price": 4.0, "is_uncapped": True, "role": "BOWL"},
            {"name": "Ayush Badoni", "price": 4.0, "is_uncapped": True, "role": "BAT"}
        ],
        "deducted_purse": 51.0,
        "starting_purse": 69.0,
        "rtm_cards": 1
    },
    "GT": {
        "retentions": [
            {"name": "Rashid Khan", "price": 18.0, "is_uncapped": False, "role": "BOWL"},
            {"name": "Shubman Gill", "price": 16.5, "is_uncapped": False, "role": "BAT"},
            {"name": "Sai Sudharsan", "price": 8.5, "is_uncapped": False, "role": "BAT"},
            {"name": "Rahul Tewatia", "price": 4.0, "is_uncapped": True, "role": "AR"},
            {"name": "Shahrukh Khan", "price": 4.0, "is_uncapped": True, "role": "AR"}
        ],
        "deducted_purse": 51.0,
        "starting_purse": 69.0,
        "rtm_cards": 1
    }
}

# Single global auction state
auction_state = {
    "started": False,
    "mode": "mini", # "mini" or "mega"
    "team_name": "",
    "my_budget": 125.0,
    "my_squad": [],
    "my_rtm_cards": 0,
    "available_players": [],
    "current_player_idx": 0,
    "current_bid": 0,
    "current_bidder": None,
    "current_bidder_rationale": "",
    "history": [],
    "ai_teams": [],
    "bid_round": 0,
    "rtm_active": False,
    "rtm_info": None
}

AI_FRANCHISE_NAMES = [
    "Chennai Super Kings", "Mumbai Indians", "Kolkata Knight Riders",
    "Sunrisers Hyderabad", "Rajasthan Royals", "Delhi Capitals",
    "Punjab Kings", "Lucknow Super Giants", "Gujarat Titans",
    "Royal Challengers Bengaluru"
]

class RetentionItem(BaseModel):
    name: str
    price: float
    is_uncapped: bool = False
    role: Optional[str] = "BAT"

class RetentionMathRequest(BaseModel):
    retentions: List[RetentionItem]
    total_purse: float = 120.0

class AuctionStartRequest(BaseModel):
    team_name: str
    budget: float = 18.5
    mode: Optional[str] = "mini" # "mini" or "mega"
    rtm_cards: Optional[int] = 0

class AuctionBidRequest(BaseModel):
    action: str  # 'bid' or 'pass'

class RtmDecisionRequest(BaseModel):
    exercise: bool
    raised_bid: Optional[float] = None

def calculate_bcci_retention_deduction(retentions: List[RetentionItem], total_purse: float = 120.0) -> Dict[str, Any]:
    """Calculates official BCCI slab deductions, total cost, remaining purse, and RTM cards."""
    capped = [r for r in retentions if not r.is_uncapped]
    uncapped = [r for r in retentions if r.is_uncapped]

    if len(capped) > 5:
        raise HTTPException(status_code=400, detail="BCCI Rule Violation: Max 5 capped retentions allowed.")
    if len(uncapped) > 2:
        raise HTTPException(status_code=400, detail="BCCI Rule Violation: Max 2 uncapped retentions allowed.")
    if len(retentions) > 6:
        raise HTTPException(status_code=400, detail="BCCI Rule Violation: Max 6 total retentions allowed.")

    capped_sorted = sorted(capped, key=lambda x: x.price, reverse=True)
    slab_breakdown = []
    total_deducted = 0.0

    for i, p in enumerate(capped_sorted):
        slab_cost = BCCI_CAPPED_SLABS[i] if i < len(BCCI_CAPPED_SLABS) else 14.0
        actual_deduction = max(slab_cost, p.price)
        total_deducted += actual_deduction
        slab_breakdown.append({
            "player": p.name,
            "tier": f"Capped Slot #{i+1}",
            "slab_amount": slab_cost,
            "actual_salary": p.price,
            "deducted": actual_deduction
        })

    for j, p in enumerate(uncapped):
        slab_cost = BCCI_UNCAPPED_SLAB
        actual_deduction = max(slab_cost, p.price)
        total_deducted += actual_deduction
        slab_breakdown.append({
            "player": p.name,
            "tier": f"Uncapped Slot #{j+1}",
            "slab_amount": slab_cost,
            "actual_salary": p.price,
            "deducted": actual_deduction
        })

    total_deducted = round(total_deducted, 2)
    remaining_purse = max(0.0, round(total_purse - total_deducted, 2))
    rtm_cards = max(0, 6 - len(retentions))

    return {
        "status": "success",
        "retention_count": len(retentions),
        "capped_count": len(capped),
        "uncapped_count": len(uncapped),
        "total_deducted": total_deducted,
        "total_purse": total_purse,
        "remaining_purse": remaining_purse,
        "rtm_cards_available": rtm_cards,
        "slab_breakdown": slab_breakdown
    }

def player_to_dict(p):
    return {
        "id": str(getattr(p, 'player_id', getattr(p, 'id', ''))),
        "name": p.name,
        "role": getattr(p, 'role', 'AR') or "AR",
        "nationality": getattr(p, 'nationality', 'Indian') or "Indian",
        "is_overseas": bool(getattr(p, 'is_overseas', False)),
        "base_price": float(getattr(p, 'base_price', 0.5) or 0.5),
        "power_index": float(getattr(p, 'Power_Index', 75.0) or 75.0),
        "batting_sr": float(getattr(p, 'batting_sr', 135.0) or 135.0),
        "batting_avg": float(getattr(p, 'batting_avg', 25.0) or 25.0),
        "bowling_econ": float(getattr(p, 'bowling_econ', 8.5) or 8.5)
    }

def get_next_bid(current_bid: float) -> float:
    if current_bid < 1.0:
        return round(current_bid + 0.10, 2)
    elif current_bid < 2.0:
        return round(current_bid + 0.20, 2)
    elif current_bid < 5.0:
        return round(current_bid + 0.25, 2)
    elif current_bid < 10.0:
        return round(current_bid + 0.50, 2)
    else:
        return round(current_bid + 1.00, 2)

def deduct_purse(budget: float, bid_amount: float) -> float:
    return max(0.0, round(budget - bid_amount, 2))

def build_state_response():
    global auction_state
    state = auction_state
    players = state["available_players"]
    idx = state["current_player_idx"]

    if idx < len(players):
        current_player = player_to_dict(players[idx])
        pred = predictive_service.predict_player(current_player)
        current_player["predicted_hammer_price"] = pred["predicted_hammer_price"]
        current_player["expected_points"] = pred["expected_matchday_points"]
        current_player["valuation_tier"] = pred["valuation_tier"]
        current_player["former_team"] = PLAYER_FORMER_FRANCHISES.get(current_player["name"].lower(), None)
        status = "active"
    else:
        current_player = None
        status = "complete"

    return {
        "mode": state.get("mode", "mini"),
        "current_player": current_player,
        "current_bid": state["current_bid"],
        "current_bidder": state["current_bidder"],
        "current_bidder_rationale": state.get("current_bidder_rationale", ""),
        "status": status,
        "history": state["history"][-20:],
        "my_budget": state["my_budget"],
        "my_squad": state["my_squad"],
        "my_rtm_cards": state.get("my_rtm_cards", 0),
        "rtm_active": state.get("rtm_active", False),
        "rtm_info": state.get("rtm_info", None),
        "ai_teams": [
            {
                "abbr": ai["abbr"],
                "name": ai["name"],
                "budget": ai["budget"],
                "rtm_cards": ai.get("rtm_cards", 0),
                "squad_size": len(ai["squad"]),
                "overseas_count": sum(1 for p in ai["squad"] if p.get("is_overseas")),
                "personality": ai["personality"]["title"],
                "tagline": ai["personality"]["tagline"]
            }
            for ai in state["ai_teams"]
        ]
    }

@router.get("/auction/mega-retentions")
def get_mega_retentions():
    """Returns official BCCI Mega Auction retention profiles and math for all 10 franchises."""
    return {
        "status": "success",
        "total_purse": BCCI_MEGA_PURSE,
        "slabs": {
            "capped": BCCI_CAPPED_SLABS,
            "uncapped": BCCI_UNCAPPED_SLAB
        },
        "presets": OFFICIAL_MEGA_PRESETS
    }

@router.post("/auction/retention-math")
def compute_retention_math(req: RetentionMathRequest):
    """Computes BCCI Mega Auction retention deductions, net purse, and RTM card allocation."""
    return calculate_bcci_retention_deduction(req.retentions, req.total_purse)

@router.get("/auction/personalities")
def get_personalities():
    """Returns the game-theory bidding personalities of all 10 IPL franchise bots."""
    return FRANCHISE_AI_PERSONALITIES

@router.get("/auction/state")
def get_auction_state(db: Session = Depends(get_db)):
    """Returns the current state of the live auction, initializing if not started."""
    global auction_state
    if not auction_state.get("started"):
        start_auction(AuctionStartRequest(team_name="RCB", budget=18.5, mode="mini"), db)
    return build_state_response()

@router.post("/auction/start")
def start_auction(req: AuctionStartRequest, db: Session = Depends(get_db)):
    global auction_state

    players = db.query(Player).all()
    if not players:
        raise HTTPException(status_code=404, detail="No players in database")

    player_list = list(players)
    player_list.sort(key=lambda p: float(p.Power_Index or 0), reverse=True)

    user_team_upper = req.team_name.upper()
    ai_teams = []
    
    abbr_map = {
        "Chennai Super Kings": "CSK", "Mumbai Indians": "MI",
        "Kolkata Knight Riders": "KKR", "Sunrisers Hyderabad": "SRH",
        "Rajasthan Royals": "RR", "Delhi Capitals": "DC",
        "Punjab Kings": "PBKS", "Lucknow Super Giants": "LSG",
        "Gujarat Titans": "GT", "Royal Challengers Bengaluru": "RCB",
    }

    # Determine default starting purse and RTM cards
    preset = OFFICIAL_MEGA_PRESETS.get(user_team_upper, OFFICIAL_MEGA_PRESETS["RCB"])
    if req.mode == "mega":
        user_budget = req.budget if req.budget > 25.0 else preset["starting_purse"]
        user_rtm = req.rtm_cards if req.rtm_cards > 0 else preset["rtm_cards"]
    else:
        user_budget = req.budget
        user_rtm = 0

    for name in AI_FRANCHISE_NAMES:
        abbr = abbr_map.get(name, "BOT")
        if abbr == user_team_upper or abbr.lower() == req.team_name.lower():
            continue
        personality = FRANCHISE_AI_PERSONALITIES.get(abbr, FRANCHISE_AI_PERSONALITIES["CSK"])
        bot_preset = OFFICIAL_MEGA_PRESETS.get(abbr, OFFICIAL_MEGA_PRESETS["CSK"])
        
        bot_budget = bot_preset["starting_purse"] if req.mode == "mega" else round(18.5 * random.uniform(0.85, 1.15), 2)
        bot_rtm = bot_preset["rtm_cards"] if req.mode == "mega" else 0

        ai_teams.append({
            "name": name,
            "abbr": abbr,
            "budget": bot_budget,
            "rtm_cards": bot_rtm,
            "squad": [],
            "personality": personality,
        })

    first_player = player_list[0] if player_list else None

    auction_state = {
        "started": True,
        "mode": req.mode or "mini",
        "team_name": req.team_name.upper(),
        "my_budget": user_budget,
        "my_squad": [],
        "my_rtm_cards": user_rtm,
        "available_players": player_list,
        "current_player_idx": 0,
        "current_bid": float(first_player.base_price) if first_player else 0.5,
        "current_bidder": None,
        "current_bidder_rationale": f"Auction Hammer opened ({req.mode.upper()} AUCTION). Place your opening bid or pass.",
        "history": [],
        "ai_teams": ai_teams,
        "bid_round": 0,
        "rtm_active": False,
        "rtm_info": None
    }

    return build_state_response()

def evaluate_bot_desirability(ai, player_obj, current_bid: float) -> tuple[bool, float, str]:
    pers = ai["personality"]
    role = str(getattr(player_obj, 'role', 'AR') or "AR").upper()
    pi = float(getattr(player_obj, 'Power_Index', 75.0) or 75.0)
    base_p = float(getattr(player_obj, 'base_price', 1.0) or 1.0)
    is_os = bool(getattr(player_obj, 'is_overseas', False))
    abbr = ai["abbr"]

    overseas_count = sum(1 for p in ai["squad"] if p.get("is_overseas"))
    if is_os and overseas_count >= 8:
        return False, 0.0, f"{abbr} skipped: Overseas quota full (8/8)."

    role_mult = pers["role_multipliers"].get(role, 1.0)
    matches = float(getattr(player_obj, 'matches_played', 30.0) or 30.0)
    exp_mult = pers["min_exp_bias"] if matches >= 60 else (1.0 if matches >= 20 else (1.2 if pers["min_exp_bias"] < 1.0 else 0.85))

    neural_pred = predictive_service.predict_player({
        "Power_Index": pi,
        "base_price": base_p,
        "role": role,
        "is_overseas": is_os
    })
    market_val = neural_pred["predicted_hammer_price"]

    fomo_spike = 1.0 + (random.uniform(0.1, 0.4) if random.random() < pers["panic_threshold"] else 0.0)
    max_valuation = round(market_val * role_mult * exp_mult * pers["max_bid_multiplier"] * fomo_spike, 2)
    max_valuation = min(max_valuation, ai["budget"] * 0.85)

    next_bid = get_next_bid(current_bid)
    if ai["budget"] < next_bid or next_bid > max_valuation:
        return False, max_valuation, f"{abbr} bows out: valuation ceiling ₹{max_valuation} Cr exceeded."

    if abbr == "PBKS" and fomo_spike > 1.1:
        commentary = f"PBKS triggers panic-bid mode for {getattr(player_obj, 'name', 'Player')}! Raising to ₹{next_bid} Cr."
    elif abbr == "CSK":
        commentary = f"CSK methodically targets {role} {getattr(player_obj, 'name', 'Player')} with Chepauk poise."
    elif abbr == "MI":
        commentary = f"MI analytical scouting team signals high conviction bid at ₹{next_bid} Cr."
    else:
        commentary = f"{abbr} counter-bids with aggressive tactical interest at ₹{next_bid} Cr."

    return True, max_valuation, commentary

@router.post("/auction/bid")
def process_bid(req: AuctionBidRequest):
    global auction_state
    state = auction_state

    if not state["started"]:
        raise HTTPException(status_code=400, detail="Auction not started. Call /auction/start first.")

    players = state["available_players"]
    idx = state["current_player_idx"]

    if idx >= len(players):
        return {**build_state_response(), "status": "complete"}

    current_player = players[idx]

    if req.action == "bid":
        new_bid = get_next_bid(state["current_bid"])

        if new_bid > state["my_budget"]:
            raise HTTPException(status_code=400, detail="Insufficient budget")

        state["current_bid"] = new_bid
        state["current_bidder"] = state["team_name"]
        state["current_bidder_rationale"] = f"You hold the highest bid at ₹{new_bid} Cr!"
        state["bid_round"] += 1

        state["history"].append({
            "team": state["team_name"],
            "amount": new_bid,
            "comment": "User franchise placed bid"
        })

        random.shuffle(state["ai_teams"])
        ai_responded = False

        for ai in state["ai_teams"]:
            will_bid, max_val, reason = evaluate_bot_desirability(ai, current_player, state["current_bid"])
            if will_bid:
                ai_bid = get_next_bid(state["current_bid"])
                state["current_bid"] = ai_bid
                state["current_bidder"] = ai["abbr"]
                state["current_bidder_rationale"] = reason
                state["history"].append({
                    "team": ai["abbr"],
                    "amount": ai_bid,
                    "comment": reason
                })
                ai_responded = True
                break

        if not ai_responded:
            state["current_bidder_rationale"] = "All rival franchises are deliberating or near valuation limit! One more pass and hammer falls."

        return build_state_response()

    elif req.action == "pass":
        # Check if RTM (Right to Match) triggers!
        former_franchise = PLAYER_FORMER_FRANCHISES.get(getattr(current_player, 'name', '').lower(), None)
        high_bidder = state["current_bidder"]
        high_bid = state["current_bid"]

        # RTM Situation Check
        if state.get("mode") == "mega" and former_franchise and high_bidder and former_franchise != high_bidder:
            # If former franchise is the User's team:
            if former_franchise == state["team_name"] and state.get("my_rtm_cards", 0) > 0 and state["my_budget"] >= high_bid:
                state["rtm_active"] = True
                state["rtm_info"] = {
                    "player_name": getattr(current_player, 'name', 'Player'),
                    "former_team": former_franchise,
                    "winning_team": high_bidder,
                    "current_bid": high_bid,
                    "prompt": f"🎯 RTM CARD ELIGIBLE! {getattr(current_player, 'name', 'Player')} was in your squad. Match {high_bidder}'s bid of ₹{high_bid} Cr?"
                }
                resp = build_state_response()
                resp["status"] = "rtm_prompt"
                return resp

            # If former franchise is an AI bot:
            for ai in state["ai_teams"]:
                if ai["abbr"] == former_franchise and ai.get("rtm_cards", 0) > 0 and ai["budget"] >= high_bid:
                    # AI decides whether to exercise RTM
                    will_rtm = (float(getattr(current_player, 'Power_Index', 75.0)) >= 84.0) or (random.random() < 0.45)
                    if will_rtm:
                        ai["rtm_cards"] -= 1
                        state["rtm_active"] = True
                        state["rtm_info"] = {
                            "player_name": getattr(current_player, 'name', 'Player'),
                            "former_team": ai["abbr"],
                            "winning_team": high_bidder,
                            "current_bid": high_bid,
                            "prompt": f"🚨 {ai['abbr']} EXERCISED RTM! They matched your ₹{high_bid} Cr bid for {getattr(current_player, 'name', 'Player')}."
                        }
                        # If user was the winning bidder, give user ONE chance to raise!
                        if high_bidder == state["team_name"]:
                            resp = build_state_response()
                            resp["status"] = "rtm_user_raise_prompt"
                            return resp
                        else:
                            # AI-to-AI RTM resolution: AI claims player
                            ai["budget"] = deduct_purse(ai["budget"], high_bid)
                            ai["squad"].append(player_to_dict(current_player))
                            state["current_bidder"] = ai["abbr"]
                            state["history"].append({
                                "team": ai["abbr"],
                                "amount": high_bid,
                                "comment": f"🎯 RTM EXERCISED! {ai['abbr']} matched {high_bidder}'s bid and claimed {getattr(current_player, 'name', '')}."
                            })
                            # Conclude hammer
                            state["rtm_active"] = False
                            state["rtm_info"] = None
                            return resolve_sold_and_advance(current_player, "sold")

        # Standard hammer resolution
        if state["current_bidder"] is None:
            claimed = False
            for ai in state["ai_teams"]:
                will_bid, max_val, reason = evaluate_bot_desirability(ai, current_player, 0.0)
                base = float(getattr(current_player, 'base_price', 0.5) or 0.5)
                if will_bid and ai["budget"] >= base:
                    ai["budget"] = deduct_purse(ai["budget"], base)
                    ai["squad"].append(player_to_dict(current_player))
                    state["history"].append({
                        "team": ai["abbr"],
                        "amount": base,
                        "comment": f"Hammer fell! Sold to {ai['abbr']} at base price ₹{base} Cr."
                    })
                    state["current_bidder"] = ai["abbr"]
                    state["current_bid"] = base
                    claimed = True
                    break
            status = "sold" if claimed else "unsold"
        elif state["current_bidder"] == state["team_name"]:
            state["my_budget"] = deduct_purse(state["my_budget"], state["current_bid"])
            state["my_squad"].append(player_to_dict(current_player))
            status = "sold"
        else:
            for ai in state["ai_teams"]:
                if ai["abbr"] == state["current_bidder"]:
                    ai["budget"] = deduct_purse(ai["budget"], state["current_bid"])
                    ai["squad"].append(player_to_dict(current_player))
                    break
            status = "sold"

        return resolve_sold_and_advance(current_player, status)

def resolve_sold_and_advance(current_player, status: str):
    global auction_state
    state = auction_state
    players = state["available_players"]

    state["current_player_idx"] += 1
    next_idx = state["current_player_idx"]
    if next_idx < len(players):
        next_player = players[next_idx]
        state["current_bid"] = float(getattr(next_player, 'base_price', 0.5) or 0.5)
        state["current_bidder"] = None
    else:
        state["current_bid"] = 0
        state["current_bidder"] = None

    state["rtm_active"] = False
    state["rtm_info"] = None

    resp = build_state_response()
    resp["status"] = status
    return resp

@router.post("/auction/rtm-decision")
def process_rtm_decision(req: RtmDecisionRequest):
    """Processes user or AI RTM 2-step decision."""
    global auction_state
    state = auction_state

    if not state.get("rtm_active"):
        raise HTTPException(status_code=400, detail="No active RTM situation.")

    players = state["available_players"]
    idx = state["current_player_idx"]
    current_player = players[idx] if idx < len(players) else None

    if not current_player:
        raise HTTPException(status_code=400, detail="Invalid player index.")

    rtm_info = state["rtm_info"]

    if req.exercise:
        # User exercised RTM!
        if state["my_rtm_cards"] <= 0:
            raise HTTPException(status_code=400, detail="No RTM cards remaining.")

        state["my_rtm_cards"] -= 1
        final_price = req.raised_bid or rtm_info["current_bid"]
        state["my_budget"] = deduct_purse(state["my_budget"], final_price)
        state["my_squad"].append(player_to_dict(current_player))
        state["current_bidder"] = state["team_name"]
        state["current_bid"] = final_price

        state["history"].append({
            "team": state["team_name"],
            "amount": final_price,
            "comment": f"🎯 RIGHT TO MATCH EXERCISED! {state['team_name']} matched {rtm_info['winning_team']}'s bid and retained {getattr(current_player, 'name', '')}!"
        })
        return resolve_sold_and_advance(current_player, "sold")
    else:
        # Declined RTM: original winning team gets player
        winning_team = rtm_info["winning_team"]
        winning_price = rtm_info["current_bid"]

        if winning_team == state["team_name"]:
            state["my_budget"] = deduct_purse(state["my_budget"], winning_price)
            state["my_squad"].append(player_to_dict(current_player))
        else:
            for ai in state["ai_teams"]:
                if ai["abbr"] == winning_team:
                    ai["budget"] = deduct_purse(ai["budget"], winning_price)
                    ai["squad"].append(player_to_dict(current_player))
                    break

        state["history"].append({
            "team": winning_team,
            "amount": winning_price,
            "comment": f"RTM Declined. Sold to {winning_team} for ₹{winning_price} Cr."
        })
        return resolve_sold_and_advance(current_player, "sold")

@router.post("/auction/reset")
def reset_auction():
    global auction_state
    auction_state["started"] = False
    auction_state["current_player_idx"] = 0
    auction_state["my_squad"] = []
    auction_state["history"] = []
    auction_state["rtm_active"] = False
    auction_state["rtm_info"] = None
    return {"status": "success", "message": "Auction reset."}

class AuctionNominateRequest(BaseModel):
    player_id: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "BAT"
    base_price: Optional[float] = 1.0
    Power_Index: Optional[float] = 75.0
    is_overseas: Optional[bool] = False

@router.post("/auction/nominate")
def nominate_player(req: AuctionNominateRequest, db: Session = Depends(get_db)):
    global auction_state

    if not auction_state.get("started"):
        start_auction(AuctionStartRequest(team_name="RCB", budget=18.5, mode="mini"), db)

    p = None
    if req.player_id:
        p = db.query(Player).filter((Player.player_id == req.player_id) | (Player.name == req.player_id)).first()
    elif req.name:
        p = db.query(Player).filter(Player.name.ilike(f"%{req.name}%")).first()

    if not p:
        class MockPlayer:
            def __init__(self, pid, name, role, base, pi, is_os):
                self.player_id = pid
                self.name = name
                self.role = role
                self.base_price = base
                self.Power_Index = pi
                self.is_overseas = is_os
                self.nationality = "Overseas" if is_os else "Indian"
                self.batting_sr = 140.0
                self.batting_avg = 28.0
                self.bowling_econ = 8.2
                self.bowling_wpm = 1.0
                self.matches_played = 45
        p = MockPlayer(
            pid=req.player_id or f"nom_{random.randint(100, 999)}",
            name=req.name or "Marquee Player",
            role=req.role or "BAT",
            base=req.base_price or 1.5,
            pi=req.Power_Index or 82.0,
            is_os=req.is_overseas or False
        )

    curr_idx = auction_state["current_player_idx"]
    auction_state["available_players"].insert(curr_idx, p)
    auction_state["current_bid"] = float(getattr(p, 'base_price', 0.5) or 0.5)
    auction_state["current_bidder"] = None
    auction_state["current_bidder_rationale"] = f"🎯 {getattr(p, 'name', 'Player')} nominated to the auction hammer! Bidding starts at ₹{auction_state['current_bid']} Cr."
    
    return build_state_response()
