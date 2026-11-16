from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import pulp
from ..database import get_db
from ..models.player import Player

router = APIRouter()

class PlayerItem(BaseModel):
    player_id: str
    name: str
    role: str
    nationality: Optional[str] = "Indian"
    is_overseas: Optional[bool] = False
    Power_Index: Optional[float] = 75.0
    batting_avg: Optional[float] = 25.0
    batting_sr: Optional[float] = 135.0
    bowling_econ: Optional[float] = 8.5
    bowling_wpm: Optional[float] = 1.0

class PlayingXIOptimizeRequest(BaseModel):
    squad_player_ids: Optional[List[str]] = []
    venue: str
    impact_player: bool
    match_situation: Optional[str] = "Neutral"
    players_data: Optional[List[dict]] = None

@router.post("/playing-xi/optimize")
def optimize_playing_xi(req: PlayingXIOptimizeRequest, db: Session = Depends(get_db)):
    class Candidate:
        def __init__(self, pid, name, role, is_overseas, power, bat_avg, bat_sr):
            self.player_id = str(pid)
            self.name = name
            self.role = role or "BAT"
            self.is_overseas = bool(is_overseas)
            self.Power_Index = float(power or 75.0)
            self.batting_avg = float(bat_avg or 25.0)
            self.batting_sr = float(bat_sr or 135.0)

    candidates: List[Candidate] = []

    # 1. If explicit player objects passed from frontend
    if req.players_data and len(req.players_data) > 0:
        for p in req.players_data:
            candidates.append(Candidate(
                pid=p.get("player_id") or p.get("id") or p.get("name"),
                name=p.get("name", "Unknown"),
                role=p.get("role", "BAT"),
                is_overseas=p.get("is_overseas", False),
                power=p.get("Power_Index") or p.get("power_index") or 75.0,
                bat_avg=p.get("batting_avg") or 28.0,
                bat_sr=p.get("batting_sr") or 140.0
            ))
    # 2. Otherwise query SQLite database
    elif req.squad_player_ids:
        db_players = db.query(Player).filter(
            (Player.player_id.in_(req.squad_player_ids)) | 
            (Player.name.in_(req.squad_player_ids))
        ).all()
        for p in db_players:
            candidates.append(Candidate(
                pid=p.player_id,
                name=p.name,
                role=p.role,
                is_overseas=p.is_overseas,
                power=p.Power_Index,
                bat_avg=p.batting_avg,
                bat_sr=p.batting_sr
            ))

    if len(candidates) < 11:
        raise HTTPException(
            status_code=400, 
            detail=f"At least 11 players required to pick a Playing XI (current candidate count: {len(candidates)})."
        )

    prob = pulp.LpProblem("PlayingXI", pulp.LpMaximize)

    # Variables
    x = {p.player_id: pulp.LpVariable(f"x_{p.player_id}", cat="Binary") for p in candidates}

    # Venue adjusted power
    def get_adjusted_power(p: Candidate):
        power = p.Power_Index or 75.0
        v = req.venue.lower()
        r = p.role.lower()
        if v in ['chennai', 'lucknow'] and ('spin' in r or r == 'ar'):
            power *= 1.15
        elif v in ['mumbai', 'bengaluru'] and ('pace' in r or r == 'bowl'):
            power *= 1.10
        elif v in ['mumbai', 'bengaluru'] and ('bat' in r or r == 'wk'):
            power *= 1.12
        elif v == 'dharamsala' and ('pace' in r or r == 'bowl'):
            power *= 1.15
        return power

    # Objective
    prob += pulp.lpSum(get_adjusted_power(p) * x[p.player_id] for p in candidates)

    total_target = 12 if req.impact_player else 11
    # If candidates count is less than target, adjust
    total_target = min(total_target, len(candidates))
    prob += pulp.lpSum(x[p.player_id] for p in candidates) == total_target

    # Overseas max 4
    prob += pulp.lpSum(x[p.player_id] for p in candidates if p.is_overseas) <= 4

    # Role constraints (softened if pool doesn't meet strict requirements)
    has_wk = any(p.role == 'WK' for p in candidates)
    if has_wk:
        prob += pulp.lpSum(x[p.player_id] for p in candidates if p.role == 'WK') >= 1

    wk_or_bat = [p for p in candidates if p.role in ['BAT', 'WK']]
    if len(wk_or_bat) >= 3:
        prob += pulp.lpSum(x[p.player_id] for p in wk_or_bat) >= 3

    bowl_or_ar = [p for p in candidates if p.role in ['BOWL', 'AR']]
    if len(bowl_or_ar) >= 3:
        prob += pulp.lpSum(x[p.player_id] for p in bowl_or_ar) >= 3

    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    if pulp.LpStatus[prob.status] != 'Optimal':
        # Fallback greedy selection if LP fails due to narrow constraints
        sorted_by_pow = sorted(candidates, key=get_adjusted_power, reverse=True)
        chosen = []
        os_cnt = 0
        for p in sorted_by_pow:
            if len(chosen) >= total_target:
                break
            if p.is_overseas and os_cnt >= 4:
                continue
            chosen.append(p)
            if p.is_overseas:
                os_cnt += 1
        selected_candidates = chosen
    else:
        selected_candidates = [p for p in candidates if x[p.player_id].varValue == 1]

    selected_players = []
    for p in selected_candidates:
        selected_players.append({
            "player_id": p.player_id,
            "name": p.name,
            "role": p.role,
            "is_overseas": p.is_overseas,
            "adjusted_power": round(get_adjusted_power(p), 1),
            "batting_avg": p.batting_avg,
            "batting_sr": p.batting_sr,
            "is_impact_player": False
        })
            
    # Impact Player Logic
    if req.impact_player and len(selected_players) == 12:
        impact_idx = -1
        sorted_players = sorted(selected_players, key=lambda p: p['adjusted_power'], reverse=True)
        
        if req.match_situation == "Batting First":
            # Bench the best pure bowler for the first innings
            for i, p in enumerate(sorted_players):
                if p['role'] == 'BOWL':
                    impact_idx = i
                    break
        elif req.match_situation == "Bowling First":
            # Bench the best pure batter for the first innings
            for i, p in enumerate(sorted_players):
                if p['role'] == 'BAT':
                    impact_idx = i
                    break
        elif req.match_situation == "Early Collapse":
            # Need an anchor to stabilize. Find the batter/AR with the highest batting average.
            batters = [p for p in selected_players if p['role'] in ['BAT', 'WK', 'AR']]
            if batters:
                best_anchor = max(batters, key=lambda x: x.get('batting_avg') or 0)
                impact_idx = sorted_players.index(next(p for p in sorted_players if p['player_id'] == best_anchor['player_id']))
        elif req.match_situation == "Aggressive Finish":
            # Need a finisher to accelerate. Find the batter/AR with the highest strike rate.
            batters = [p for p in selected_players if p['role'] in ['BAT', 'WK', 'AR']]
            if batters:
                best_finisher = max(batters, key=lambda x: x.get('batting_sr') or 0)
                impact_idx = sorted_players.index(next(p for p in sorted_players if p['player_id'] == best_finisher['player_id']))
                    
        # Fallback to the lowest power player if strict role not found
        if impact_idx == -1:
            impact_idx = len(sorted_players) - 1
            
        for p in selected_players:
            if p['player_id'] == sorted_players[impact_idx]['player_id']:
                p['is_impact_player'] = True
                break

    # Sort for realistic batting order
    def get_batting_sort_key(p):
        role_rank = {'BAT': 1, 'WK': 2, 'AR': 3, 'BOWL': 4}.get(p['role'], 5)
        avg = p.get('batting_avg') or 0
        return (role_rank, -avg)

    selected_players.sort(key=get_batting_sort_key)
                
    return {
        "playing_xi": selected_players,
        "total_power": sum(p["adjusted_power"] for p in selected_players),
        "match_situation": req.match_situation
    }
