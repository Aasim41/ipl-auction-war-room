from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..services.live_pipeline_service import pipeline_service

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

@router.get("/status")
def get_pipeline_status():
    """Returns current real-time data sync status, venue pitch wear, ticks completed, and live news feed."""
    return pipeline_service.get_pipeline_status()

@router.get("/international-schedule")
def get_international_schedule():
    """Returns the full 2026 international schedule, conflict windows, and board NOC rulings."""
    return pipeline_service.get_international_schedule()

@router.get("/player-form/{player_name_or_id}")
def get_player_form(player_name_or_id: str):
    """Returns a player's recent 5-match scorecard trajectory and form status."""
    return pipeline_service.get_player_recent_form(player_name_or_id)

@router.post("/toggle-auto-sync")
def toggle_auto_sync(payload: dict = Body(...)):
    """Toggles autonomous background syncing on/off and configures interval in seconds."""
    enabled = payload.get("enabled", True)
    interval = payload.get("interval_seconds", 20)
    return pipeline_service.toggle_auto_sync(enabled, interval)

@router.post("/sync-form")
def trigger_form_sync(db: Session = Depends(get_db)):
    """Triggers automated pipeline ingestion: recalculates player form indices and updates DB in real time."""
    return pipeline_service.sync_and_recalculate_forms(db)

@router.get("/live-feed")
def get_live_feed():
    """Returns the live matchday ticker events."""
    return pipeline_service.live_feed_events[-20:]
