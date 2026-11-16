from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.player import Player
from ..services.predictive_model_service import predictive_service

router = APIRouter()

class PlayerPredictRequest(BaseModel):
    player_id: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "BAT"
    base_price: Optional[float] = 1.0
    Power_Index: Optional[float] = 75.0
    batting_sr: Optional[float] = 135.0
    batting_avg: Optional[float] = 28.0
    bowling_econ: Optional[float] = 8.2
    bowling_wpm: Optional[float] = 1.0
    matches_played: Optional[int] = 40
    is_overseas: Optional[bool] = False
    venue: Optional[str] = "bengaluru"
    form_factor: Optional[float] = 1.0

class BatchPredictRequest(BaseModel):
    players: Optional[List[Dict[str, Any]]] = None
    player_ids: Optional[List[str]] = None
    venue: Optional[str] = "bengaluru"
    form_factor: Optional[float] = 1.0

class VenueComparisonRequest(BaseModel):
    player_id: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "BAT"
    Power_Index: Optional[float] = 75.0

@router.get("/predict/model-info")
def get_model_info():
    """Returns PyTorch neural net architecture, R2 accuracy, and supported stadium features."""
    return predictive_service.get_model_metadata()

@router.post("/predict/player")
def predict_single_player(req: PlayerPredictRequest, db: Session = Depends(get_db)):
    """Predicts Auction Hammer Price and Matchday Fantasy Points using neural inference."""
    player_dict = req.model_dump()

    # If ID or name provided and fields are default, enrich from DB
    if req.player_id or req.name:
        query = db.query(Player)
        if req.player_id:
            db_p = query.filter((Player.player_id == req.player_id) | (Player.name == req.player_id)).first()
        else:
            db_p = query.filter(Player.name == req.name).first()

        if db_p:
            player_dict["name"] = db_p.name
            player_dict["role"] = db_p.role or player_dict["role"]
            player_dict["base_price"] = db_p.base_price or player_dict["base_price"]
            player_dict["Power_Index"] = db_p.Power_Index or player_dict["Power_Index"]
            player_dict["batting_sr"] = db_p.batting_sr or player_dict["batting_sr"]
            player_dict["batting_avg"] = db_p.batting_avg or player_dict["batting_avg"]
            player_dict["bowling_econ"] = db_p.bowling_econ or player_dict["bowling_econ"]
            player_dict["bowling_wpm"] = db_p.bowling_wpm or player_dict["bowling_wpm"]
            player_dict["matches_played"] = db_p.matches_played or player_dict["matches_played"]
            player_dict["is_overseas"] = db_p.is_overseas if db_p.is_overseas is not None else player_dict["is_overseas"]

    pred = predictive_service.predict_player(
        player_dict, 
        venue=req.venue or "bengaluru", 
        form_factor=req.form_factor or 1.0
    )
    return pred

@router.post("/predict/batch")
def predict_batch_players(req: BatchPredictRequest, db: Session = Depends(get_db)):
    """Batch prediction for an entire squad or auction pool across a selected venue."""
    candidate_list: List[Dict[str, Any]] = []

    if req.players and len(req.players) > 0:
        candidate_list = req.players
    elif req.player_ids and len(req.player_ids) > 0:
        db_players = db.query(Player).filter(
            (Player.player_id.in_(req.player_ids)) | (Player.name.in_(req.player_ids))
        ).all()
        for p in db_players:
            candidate_list.append({
                "player_id": p.player_id,
                "name": p.name,
                "role": p.role,
                "base_price": p.base_price,
                "Power_Index": p.Power_Index,
                "batting_sr": p.batting_sr,
                "batting_avg": p.batting_avg,
                "bowling_econ": p.bowling_econ,
                "bowling_wpm": p.bowling_wpm,
                "matches_played": p.matches_played,
                "is_overseas": p.is_overseas
            })
    else:
        # Predict for top 30 database players
        db_players = db.query(Player).order_by(Player.Power_Index.desc()).limit(30).all()
        for p in db_players:
            candidate_list.append({
                "player_id": p.player_id,
                "name": p.name,
                "role": p.role,
                "base_price": p.base_price,
                "Power_Index": p.Power_Index,
                "is_overseas": p.is_overseas
            })

    results = predictive_service.predict_batch(
        candidate_list, 
        venue=req.venue or "bengaluru", 
        form_factor=req.form_factor or 1.0
    )
    return {
        "count": len(results),
        "venue": req.venue,
        "predictions": results
    }

@router.post("/predict/venue-comparison")
def compare_player_across_venues(req: VenueComparisonRequest, db: Session = Depends(get_db)):
    """Evaluates how a player's expected points change across all 10 IPL home fortress stadiums."""
    player_dict = req.model_dump()
    if req.player_id or req.name:
        query = db.query(Player)
        p = query.filter((Player.player_id == req.player_id) | (Player.name == req.name)).first()
        if p:
            player_dict["name"] = p.name
            player_dict["role"] = p.role
            player_dict["Power_Index"] = p.Power_Index
            player_dict["base_price"] = p.base_price
            player_dict["is_overseas"] = p.is_overseas

    venues = ["bengaluru", "chennai", "mumbai", "kolkata", "hyderabad", "delhi", "jaipur", "lucknow", "ahmedabad", "dharamsala"]
    venue_breakdown = []
    for v in venues:
        pred = predictive_service.predict_player(player_dict, venue=v, form_factor=1.0)
        venue_breakdown.append({
            "venue": v,
            "expected_points": pred["expected_matchday_points"],
            "value_for_money": pred["value_for_money"]
        })

    venue_breakdown.sort(key=lambda x: x["expected_points"], reverse=True)
    return {
        "player_name": player_dict.get("name", "Player"),
        "best_venue": venue_breakdown[0]["venue"],
        "tough_venue": venue_breakdown[-1]["venue"],
        "breakdown": venue_breakdown
    }
