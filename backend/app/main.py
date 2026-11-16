import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import optimizer, players, squad, auction, trade, playing_xi, win_probability, predict, pipeline, enterprise, websocket_auction
from .services.live_pipeline_service import pipeline_service

app = FastAPI(title="AuctionXI API - Enterprise Decision Support & AI Powerhouse")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimizer.router, prefix="/api")
app.include_router(players.router, prefix="/api")
app.include_router(squad.router, prefix="/api")
app.include_router(auction.router, prefix="/api")
app.include_router(trade.router, prefix="/api")
app.include_router(playing_xi.router, prefix="/api")
app.include_router(win_probability.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(enterprise.router)
app.include_router(websocket_auction.ws_router)

@app.on_event("startup")
async def startup_event():
    """Starts autonomous data pipeline daemon on FastAPI startup."""
    asyncio.create_task(pipeline_service.start_autonomous_background_worker())

@app.on_event("shutdown")
def shutdown_event():
    pipeline_service.background_task_running = False

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "message": "Welcome to AuctionXI Enterprise AI Predictive Backend",
        "modules": [
            "Autonomous Live Ingestion & International Schedule Pipeline",
            "PuLP Linear Programming Optimizer",
            "PyTorch Predictive Valuation & Fantasy Modeling",
            "Multi-Agent Game-Theory AI Bidding Personalities",
            "Dynamic Fallback Contingency Trees (Plan A/B/C)",
            "NOC & Injury Fragility Valuation Discounts",
            "Hawkeye Tactical Matchup Matrix",
            "Cricsheet 120-Ball Over-by-Over Trajectory Engine",
            "Persistent Drafts & Real-World Accuracy Benchmarking",
            "Multiplayer WebSocket Live Auction Arena"
        ]
    }
