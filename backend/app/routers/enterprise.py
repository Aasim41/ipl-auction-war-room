from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.player import Player
from app.services.enterprise_auction_service import (
    get_player_noc_and_risk,
    DEFAULT_FALLBACK_TREES,
    compute_tactical_matchup,
    simulate_20_over_match,
    save_user_draft,
    list_user_drafts,
    benchmark_draft_accuracy
)

router = APIRouter(prefix="/api/enterprise", tags=["Enterprise Auction Intelligence"])

# ─── 1. AVAILABILITY & NOC RISK ───

@router.get("/availability-risk")
def get_availability_risk(
    player_name: str = Query(..., description="Player full name"),
    nationality: Optional[str] = Query("Indian", description="Player nationality"),
    is_overseas: Optional[bool] = Query(False, description="Is overseas player")
):
    """Calculates board clearance, playoff availability, and injury fragility discount."""
    return get_player_noc_and_risk(player_name, nationality, is_overseas)

@router.get("/batch-availability-risk")
def get_batch_availability(db: Session = Depends(get_db)):
    """Returns NOC and injury profiles for all players in database."""
    players = db.query(Player).all()
    results = []
    for p in players:
        res = get_player_noc_and_risk(p.name, p.nationality or "Indian", bool(p.is_overseas))
        res["player_id"] = p.player_id
        results.append(res)
    return results

# ─── 2. DYNAMIC FALLBACK TREES (PLAN A / B / C) ───

@router.get("/fallback-trees")
def get_fallback_trees():
    """Returns the pre-configured dynamic contingency trees for all franchise positions."""
    return DEFAULT_FALLBACK_TREES

class FallbackEvaluationRequest(BaseModel):
    tree_id: str
    current_hammer_price: float
    current_player_name: str

@router.post("/fallback-trees/evaluate")
def evaluate_contingency_pivot(req: FallbackEvaluationRequest):
    """
    Evaluates whether the current hammer price has breached Plan A's ceiling,
    recommending an instant pivot to Plan B or Plan C.
    """
    tree = next((t for t in DEFAULT_FALLBACK_TREES if t["id"] == req.tree_id), None)
    if not tree:
        return {"action": "HOLD", "message": "Contingency tree not found."}

    plan_a = tree["plans"][0]
    plan_b = tree["plans"][1]
    plan_c = tree["plans"][2]

    if req.current_player_name.lower() == plan_a["player_name"].lower():
        if req.current_hammer_price > plan_a["max_ceiling_price"]:
            return {
                "action": "PIVOT_TO_PLAN_B",
                "alert_level": "CRITICAL_CEILING_BREACH",
                "current_target": plan_a["player_name"],
                "exceeded_by": round(req.current_hammer_price - plan_a["max_ceiling_price"], 2),
                "recommended_pivot": plan_b,
                "message": f"🚨 CEILING BREACH! {plan_a['player_name']} has reached ₹{req.current_hammer_price} Cr (Limit: ₹{plan_a['max_ceiling_price']} Cr). Drop out now and pivot to Plan B: {plan_b['player_name']} (Cap: ₹{plan_b['max_ceiling_price']} Cr)."
            }
        else:
            return {
                "action": "CONTINUE_BIDDING",
                "alert_level": "WITHIN_LIMITS",
                "current_target": plan_a["player_name"],
                "remaining_headroom": round(plan_a["max_ceiling_price"] - req.current_hammer_price, 2),
                "message": f"Target active: Within Plan A ceiling (Headroom: ₹{round(plan_a['max_ceiling_price'] - req.current_hammer_price, 2)} Cr)."
            }
    elif req.current_player_name.lower() == plan_b["player_name"].lower():
        if req.current_hammer_price > plan_b["max_ceiling_price"]:
            return {
                "action": "PIVOT_TO_PLAN_C",
                "alert_level": "PLAN_B_EXCEEDED",
                "current_target": plan_b["player_name"],
                "recommended_pivot": plan_c,
                "message": f"⚠️ Plan B ceiling breached. Pivot to Moneyball fallback: {plan_c['player_name']} (Cap: ₹{plan_c['max_ceiling_price']} Cr)."
            }
    
    return {"action": "ACTIVE", "message": "Monitoring bid progression."}

# ─── 3. TACTICAL MATCHUP MATRIX ───

@router.get("/matchup")
def get_matchup(
    batter: str = Query(..., description="Batter full name"),
    bowler: str = Query(..., description="Bowler full name")
):
    """Calculates Hawkeye-style granular match-ups across phases, stances, and bowling types."""
    return compute_tactical_matchup(batter, bowler)

# ─── 4. CRICSHEET 20-OVER MATCH SIMULATION ───

class MatchSimulationRequest(BaseModel):
    team_a_name: str
    team_a_squad: List[Dict[str, Any]]
    team_b_name: str
    team_b_squad: List[Dict[str, Any]]
    venue: Optional[str] = "Wankhede Stadium"

@router.post("/simulate-match-balls")
def simulate_full_match(req: MatchSimulationRequest):
    """Executes an over-by-over, ball-by-ball 120-ball T20 match simulation with worm charts and scorecard."""
    return simulate_20_over_match(
        req.team_a_name, 
        req.team_a_squad, 
        req.team_b_name, 
        req.team_b_squad, 
        req.venue or "Wankhede Stadium"
    )

# ─── 5. PERSISTENT DRAFTS & HISTORICAL BENCHMARK ACCURACY ───

class SaveDraftRequest(BaseModel):
    draft_id: str
    title: str
    franchise_short: str
    squad: List[Dict[str, Any]]
    purse_spent: float

@router.post("/drafts/save")
def save_draft(req: SaveDraftRequest):
    """Saves a custom user auction draft to persistent memory."""
    saved = save_user_draft(req.draft_id, req.title, req.franchise_short, req.squad, req.purse_spent)
    return {"status": "success", "draft": saved}

@router.get("/drafts")
def get_all_drafts():
    """Lists all saved mock auction drafts."""
    return {"drafts": list_user_drafts()}

class BenchmarkAccuracyRequest(BaseModel):
    squad: List[Dict[str, Any]]

@router.post("/drafts/benchmark")
def benchmark_draft(req: BenchmarkAccuracyRequest):
    """Compares user drafted prices against 2026 auction valuation benchmark and scores accuracy."""
    return benchmark_draft_accuracy(req.squad)
