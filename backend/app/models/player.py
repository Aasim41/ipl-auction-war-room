from sqlalchemy import Column, String, Boolean, Float, Integer
from ..database import Base

class Player(Base):
    __tablename__ = "players"

    player_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    nationality = Column(String)
    is_overseas = Column(Boolean)
    role = Column(String)
    specific_role = Column(String)
    bowling_style = Column(String)
    capped_status = Column(String)
    base_price = Column(Float)
    Power_Index = Column(Float)
    batting_sr = Column(Float)
    batting_avg = Column(Float)
    bowling_econ = Column(Float)
    bowling_wpm = Column(Float)
    matches_played = Column(Integer)
    age = Column(Integer)
    seasons_played = Column(Integer)
