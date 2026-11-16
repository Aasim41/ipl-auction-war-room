from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.player import Player

router = APIRouter()

class TradeEvaluateRequest(BaseModel):
    team_a_players: Optional[List[str]] = None
    team_b_players: Optional[List[str]] = None
    team_a_ids: Optional[List[str]] = None
    team_b_ids: Optional[List[str]] = None

@router.post("/trade/evaluate")
def evaluate_trade(req: TradeEvaluateRequest, db: Session = Depends(get_db)):
    ids_a = req.team_a_players or req.team_a_ids or []
    ids_b = req.team_b_players or req.team_b_ids or []

    team_a = db.query(Player).filter(
        (Player.player_id.in_(ids_a)) | (Player.name.in_(ids_a))
    ).all()
    team_b = db.query(Player).filter(
        (Player.player_id.in_(ids_b)) | (Player.name.in_(ids_b))
    ).all()
    
    power_a = sum(p.Power_Index or 75.0 for p in team_a)
    power_b = sum(p.Power_Index or 75.0 for p in team_b)
    
    # Delta means what Team A gets minus what Team A gives up
    # Wait, simple power delta.
    # Team A loses power_a, gains power_b. Delta = power_b - power_a
    team_a_delta = power_b - power_a
    team_b_delta = power_a - power_b
    
    fair_trade = abs(team_a_delta) <= 10.0
    
    if fair_trade:
        recommendation = "This is a fair trade."
    elif team_a_delta > 0:
        recommendation = "This trade heavily favors Team A."
    else:
        recommendation = "This trade heavily favors Team B."
        
    return {
        "team_a_delta": team_a_delta,
        "team_b_delta": team_b_delta,
        "fair_trade": fair_trade,
        "recommendation": recommendation
    }
