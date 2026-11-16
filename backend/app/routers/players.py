from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from app.models.player import Player
from app.services.optimizer_service import calculate_predicted_price

router = APIRouter(prefix="/players", tags=["players"])

@router.get("/")
def get_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    result = []
    for p in players:
        p_dict = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        
        base = float(p.base_price or 0.0)
        power = float(p.Power_Index or 0.0)
        
        p_dict['predicted_price'] = calculate_predicted_price(power, base)
        result.append(p_dict)
        
    return result
