from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.player import Player
import random

router = APIRouter()

class WinProbabilityRequest(BaseModel):
    team_a_ids: List[str]
    team_b_ids: List[str]
    venue: str

@router.post("/win-probability")
def get_win_probability(req: WinProbabilityRequest, db: Session = Depends(get_db)):
    team_a = db.query(Player).filter(
        (Player.player_id.in_(req.team_a_ids)) | (Player.name.in_(req.team_a_ids))
    ).all()
    team_b = db.query(Player).filter(
        (Player.player_id.in_(req.team_b_ids)) | (Player.name.in_(req.team_b_ids))
    ).all()
    
    def calculate_power(players, venue):
        power = 0
        for p in players:
            p_power = p.Power_Index or 0
            if venue.lower() == 'chennai' and p.role and 'spin' in p.role.lower():
                p_power *= 1.1
            elif venue.lower() == 'mumbai' and p.role and 'pace' in p.role.lower():
                p_power *= 1.1
            power += p_power
        return power

    power_a = calculate_power(team_a, req.venue)
    power_b = calculate_power(team_b, req.venue)
    
    total = power_a + power_b
    if total == 0:
        prob_a, prob_b = 50.0, 50.0
    else:
        prob_a = (power_a / total) * 100
        prob_b = (power_b / total) * 100
        
    # Generate some dummy key matchups
    matchups = [
        "Star Batter vs Leading Pacer",
        "Spin Twins vs Middle Order",
        "Death Bowling Comparison"
    ]
    random.shuffle(matchups)
    
    return {
        "team_a_win_prob": round(prob_a, 2),
        "team_b_win_prob": round(prob_b, 2),
        "key_matchups": matchups[:2]
    }
