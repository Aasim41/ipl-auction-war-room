from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from ..database import get_db
from ..models.player import Player
from ..services.optimizer_service import optimize_squad, calculate_predicted_price
from ..services.predictive_model_service import predictive_service

router = APIRouter(prefix="/optimize", tags=["optimizer"])

class OptimizationRequest(BaseModel):
    budget: float
    locked_players: List[str] = []
    optimization_target: Optional[str] = "power_index" # "power_index" | "expected_points" | "value_for_money"
    venue: Optional[str] = "bengaluru"

@router.post("/")
def run_optimization(request: OptimizationRequest, db: Session = Depends(get_db)):
    players = db.query(Player).all()
    players_data = []
    for p in players:
        base = float(p.base_price or 0.0)
        power = float(p.Power_Index or 0.0)
        predicted = calculate_predicted_price(power, base)
        
        players_data.append({
            'player_id': p.player_id,
            'Power_Index': p.Power_Index,
            'base_price': p.base_price,
            'predicted_price': predicted,
            'is_overseas': p.is_overseas,
            'role': p.role,
            'seasons_played': p.seasons_played,
            'age': p.age,
            'batting_sr': p.batting_sr,
            'batting_avg': p.batting_avg,
            'bowling_econ': p.bowling_econ,
            'bowling_wpm': p.bowling_wpm,
            'matches_played': p.matches_played
        })
    df = pd.DataFrame(players_data)
    
    selected_ids = optimize_squad(
        df, 
        request.budget, 
        request.locked_players,
        optimization_target=request.optimization_target or "power_index",
        venue=request.venue or "bengaluru"
    )
    
    if not selected_ids:
        return {"status": "error", "message": "No optimal solution found within constraints."}
        
    selected_players = db.query(Player).filter(Player.player_id.in_(selected_ids)).all()
    
    response_players = []
    for p in selected_players:
        p_dict = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        base = float(p.base_price or 0.0)
        power = float(p.Power_Index or 0.0)
        p_dict['predicted_price'] = calculate_predicted_price(power, base)
        
        # Attach neural predictions
        neural_pred = predictive_service.predict_player(p_dict, venue=request.venue or "bengaluru")
        p_dict['expected_matchday_points'] = neural_pred['expected_matchday_points']
        p_dict['value_for_money'] = neural_pred['value_for_money']
        p_dict['valuation_tier'] = neural_pred['valuation_tier']
        p_dict['tier_color'] = neural_pred['tier_color']
        
        response_players.append(p_dict)
        
    return {
        "status": "success", 
        "optimization_target": request.optimization_target,
        "venue": request.venue,
        "players": response_players
    }
