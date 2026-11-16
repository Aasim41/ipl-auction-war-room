from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import pandas as pd
from ..database import get_db
from ..models.player import Player
from ..services import optimizer_service

router = APIRouter()

class Constraints(BaseModel):
    max_overseas: int = 8
    min_bowlers: int = 5
    min_wk: int = 2
    squad_size_min: int = 18
    squad_size_max: int = 25

class SquadBuildRequest(BaseModel):
    team_name: str
    budget: float
    locked_players: List[str]
    constraints: Constraints

@router.post("/squad/build")
def build_squad(req: SquadBuildRequest, db: Session = Depends(get_db)):
    players = db.query(Player).all()
    if not players:
        raise HTTPException(status_code=404, detail="No players found in database")
    
    players_data = []
    for p in players:
        players_data.append({
            'player_id': p.player_id,
            'name': p.name,
            'nationality': p.nationality,
            'is_overseas': p.is_overseas,
            'role': p.role,
            'capped_status': p.capped_status,
            'base_price': p.base_price,
            'Power_Index': p.Power_Index,
            'age': p.age,
            'seasons_played': p.seasons_played
        })
    df = pd.DataFrame(players_data)
    
    # We call the existing optimizer_service.optimize_squad
    selected_ids = optimizer_service.optimize_squad(df, req.budget, req.locked_players)
    if not selected_ids:
        raise HTTPException(status_code=400, detail="Could not find an optimal squad with given constraints.")
        
    selected_df = df[df['player_id'].isin(selected_ids)]
    total_cost = float(selected_df['base_price'].sum())
    remaining_budget = req.budget - total_cost
    
    selected_players = selected_df.to_dict(orient='records')
    
    return {
        "squad": selected_players,
        "total_cost": total_cost,
        "remaining_budget": remaining_budget
    }

@router.get("/squad/score")
def score_squad(player_ids: str = Query(...), db: Session = Depends(get_db)):
    ids = [pid.strip() for pid in player_ids.split(',')]
    players = db.query(Player).filter(Player.player_id.in_(ids)).all()
    
    total_power = sum((p.Power_Index or 0) for p in players)
    batters = sum(1 for p in players if p.role in ['BAT', 'AR', 'WK'])
    bowlers = sum(1 for p in players if p.role in ['BOWL', 'AR'])
    wks = sum(1 for p in players if p.role == 'WK')
    overseas_count = sum(1 for p in players if p.is_overseas)
    experienced = sum(1 for p in players if (p.seasons_played or 0) >= 5)
    
    weakness_alerts = []
    if wks == 1:
        weakness_alerts.append("Only 1 WK")
    elif wks == 0:
        weakness_alerts.append("No WK in squad")
        
    if overseas_count < 8:
        weakness_alerts.append("Overseas slots underused")
    elif overseas_count > 8:
        weakness_alerts.append("Too many overseas players")
        
    if experienced == 0:
        weakness_alerts.append("No experienced players (5+ seasons)")
        
    # Dummy logic for death-overs specialist
    has_death_bowler = any(p.role == 'BOWL' and (p.Power_Index or 0) > 85 for p in players)
    if not has_death_bowler:
        weakness_alerts.append("No death-overs specialist")
        
    return {
        "total_power": total_power,
        "batting_depth": batters,
        "bowling_depth": bowlers,
        "overseas_count": overseas_count,
        "weakness_alerts": weakness_alerts
    }
