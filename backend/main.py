from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import engine

app = FastAPI(title="IPL War Room Mobile API")

# Allow React Native (or web) clients to connect without CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizeRequest(BaseModel):
    budget_limit: float
    venue: str
    mandatory_xi: List[str] = []
    mandatory_squad: List[str] = []
    unavailable_players: List[str] = []
    price_overrides: Dict[str, float] = {}

@app.get("/")
def health_check():
    return {"status": "online", "message": "IPL War Room API is running."}

@app.get("/api/metadata")
def get_metadata():
    """Returns available venues and all player names for dropdowns."""
    df = engine.load_data()
    return {
        "venues": list(engine.VENUES.keys()),
        "players": sorted(df['Player'].tolist())
    }

@app.post("/api/optimize")
def optimize_squad(req: OptimizeRequest):
    df = engine.load_data()
    df = engine.apply_venue_boost(df, req.venue)
    
    squad_df, xi_df = engine.run_optimization(
        df,
        budget_limit=req.budget_limit,
        mandatory_xi=req.mandatory_xi,
        mandatory_squad=req.mandatory_squad,
        unavailable_players=req.unavailable_players,
        price_overrides=req.price_overrides
    )
    
    if squad_df is None:
        raise HTTPException(status_code=400, detail="Optimization failed. Constraints too rigid or budget too low.")
        
    chem_score, xi_df = engine.calculate_chemistry(xi_df)
    
    return {
        "chemistry_score": chem_score,
        "total_spent": squad_df['Auction_Price'].sum(),
        "xi_power": xi_df['Power_Index'].sum(),
        "squad": squad_df.to_dict(orient="records"),
        "playing_xi": xi_df.to_dict(orient="records")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
