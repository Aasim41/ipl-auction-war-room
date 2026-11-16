import asyncio
import json
import random
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.routers.auction import FRANCHISE_AI_PERSONALITIES, evaluate_bot_desirability, get_next_bid, deduct_purse

ws_router = APIRouter(tags=["Multiplayer WebSocket Auction"])

class MultiplayerRoom:
    def __init__(self, room_id: str, title: str = "IPL 2026 Mega-Auction Room"):
        self.room_id = room_id
        self.title = title
        self.connections: Dict[str, WebSocket] = {} # client_id -> WebSocket
        self.franchise_seats: Dict[str, str] = {} # client_id -> franchise_short (e.g. "CSK")
        self.current_player: Optional[Dict[str, Any]] = {
            "id": "star_01",
            "name": "Mitchell Starc",
            "role": "BOWL",
            "nationality": "Australia",
            "is_overseas": True,
            "base_price": 2.0,
            "power_index": 88.5,
            "predicted_hammer_price": 13.5
        }
        self.current_bid: float = 2.0
        self.current_bidder: Optional[str] = None
        self.current_bidder_client: Optional[str] = None
        self.history: List[Dict[str, Any]] = []
        self.status: str = "active" # active, sold, paused
        self.ai_teams = [
            {"abbr": "CSK", "name": "Chennai Super Kings", "budget": 18.5, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["CSK"]},
            {"abbr": "MI", "name": "Mumbai Indians", "budget": 19.0, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["MI"]},
            {"abbr": "KKR", "name": "Kolkata Knight Riders", "budget": 16.5, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["KKR"]},
            {"abbr": "SRH", "name": "Sunrisers Hyderabad", "budget": 20.0, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["SRH"]},
            {"abbr": "RR", "name": "Rajasthan Royals", "budget": 19.5, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["RR"]},
            {"abbr": "DC", "name": "Delhi Capitals", "budget": 20.5, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["DC"]},
            {"abbr": "PBKS", "name": "Punjab Kings", "budget": 19.0, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["PBKS"]},
            {"abbr": "LSG", "name": "Lucknow Super Giants", "budget": 19.0, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["LSG"]},
            {"abbr": "GT", "name": "Gujarat Titans", "budget": 19.2, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["GT"]},
            {"abbr": "RCB", "name": "Royal Challengers Bengaluru", "budget": 18.5, "squad": [], "personality": FRANCHISE_AI_PERSONALITIES["RCB"]}
        ]

    def to_state_dict(self) -> Dict[str, Any]:
        return {
            "room_id": self.room_id,
            "title": self.title,
            "connected_users": len(self.connections),
            "seats": self.franchise_seats,
            "current_player": self.current_player,
            "current_bid": self.current_bid,
            "current_bidder": self.current_bidder,
            "status": self.status,
            "history": self.history[-12:],
            "ai_franchises": [
                {
                    "abbr": ai["abbr"],
                    "budget": ai["budget"],
                    "squad_size": len(ai["squad"]),
                    "is_human": ai["abbr"] in self.franchise_seats.values()
                }
                for ai in self.ai_teams
            ]
        }

ROOMS: Dict[str, MultiplayerRoom] = {}

def get_or_create_room(room_id: str) -> MultiplayerRoom:
    if room_id not in ROOMS:
        ROOMS[room_id] = MultiplayerRoom(room_id)
    return ROOMS[room_id]

@ws_router.get("/api/multiplayer/rooms")
def list_rooms():
    """Returns list of active multiplayer auction rooms."""
    if not ROOMS:
        get_or_create_room("ipl2026-global")
    return {
        "rooms": [
            {
                "room_id": r.room_id,
                "title": r.title,
                "users": len(r.connections),
                "current_player": r.current_player["name"] if r.current_player else "Waiting",
                "current_bid": r.current_bid
            }
            for r in ROOMS.values()
        ]
    }

class CreateRoomRequest(BaseModel):
    room_id: str
    title: Optional[str] = "Live IPL Mega-Auction Room"

@ws_router.post("/api/multiplayer/rooms/create")
def create_room(req: CreateRoomRequest):
    room = get_or_create_room(req.room_id)
    room.title = req.title or room.title
    return {"status": "success", "room": room.to_state_dict()}

@ws_router.websocket("/ws/auction/{room_id}/{client_id}")
async def websocket_auction_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await websocket.accept()
    room = get_or_create_room(room_id)
    room.connections[client_id] = websocket

    # Default seat assignment if none taken
    available_franchises = [
        f for f in ["RCB", "CSK", "MI", "KKR", "SRH", "RR", "DC", "PBKS", "LSG", "GT"]
        if f not in room.franchise_seats.values()
    ]
    if available_franchises and client_id not in room.franchise_seats:
        room.franchise_seats[client_id] = available_franchises[0]

    async def broadcast_state(event_type: str = "STATE_UPDATE", extra_data: dict = None):
        state = room.to_state_dict()
        msg = {"type": event_type, "payload": state}
        if extra_data:
            msg.update(extra_data)
        
        dead_clients = []
        for cid, ws in list(room.connections.items()):
            try:
                await ws.send_text(json.dumps(msg))
            except Exception:
                dead_clients.append(cid)
        for dc in dead_clients:
            if dc in room.connections:
                del room.connections[dc]

    # Initial state send
    await broadcast_state("USER_JOINED", {"joined_client": client_id, "seat": room.franchise_seats.get(client_id)})

    try:
        while True:
            raw_text = await websocket.receive_text()
            data = json.loads(raw_text)
            action = data.get("action")

            user_team = room.franchise_seats.get(client_id, "RCB")

            if action == "claim_seat":
                requested_team = data.get("franchise")
                if requested_team and requested_team not in room.franchise_seats.values():
                    room.franchise_seats[client_id] = requested_team
                    await broadcast_state("SEAT_CLAIMED", {"client_id": client_id, "franchise": requested_team})

            elif action == "bid":
                if room.status != "active":
                    continue
                next_val = get_next_bid(room.current_bid)
                room.current_bid = next_val
                room.current_bidder = user_team
                room.current_bidder_client = client_id
                room.history.append({
                    "team": user_team,
                    "amount": next_val,
                    "by": f"Human ({user_team})"
                })
                await broadcast_state("BID_PLACED", {"team": user_team, "amount": next_val})

                # Slight async delay then potential AI counter-bid if bot is interested
                await asyncio.sleep(1.2)
                
                # Check rival AI bots that are NOT human-controlled
                human_teams = set(room.franchise_seats.values())
                active_bots = [b for b in room.ai_teams if b["abbr"] not in human_teams and b["budget"] >= next_val + 0.5]

                if active_bots and random.random() > 0.45:
                    chosen_bot = random.choice(active_bots)
                    bot_next_val = get_next_bid(room.current_bid)
                    if bot_next_val <= chosen_bot["budget"]:
                        room.current_bid = bot_next_val
                        room.current_bidder = chosen_bot["abbr"]
                        room.current_bidder_client = "AI_BOT"
                        room.history.append({
                            "team": chosen_bot["abbr"],
                            "amount": bot_next_val,
                            "by": f"AI Franchise ({chosen_bot['abbr']})"
                        })
                        await broadcast_state("BID_PLACED", {"team": chosen_bot["abbr"], "amount": bot_next_val, "is_ai": True})

            elif action == "hammer_fall":
                # Finalize sale
                winner = room.current_bidder or user_team
                amt = room.current_bid
                room.status = "sold"
                room.history.append({
                    "team": winner,
                    "amount": amt,
                    "by": f"🔨 SOLD TO {winner} FOR ₹{amt} Cr!"
                })
                await broadcast_state("PLAYER_SOLD", {"winner": winner, "amount": amt})

            elif action == "nominate":
                p_name = data.get("player_name", "Marquee Star")
                p_base = float(data.get("base_price", 2.0))
                p_role = data.get("role", "BAT")
                room.current_player = {
                    "id": f"p_{random.randint(100, 999)}",
                    "name": p_name,
                    "role": p_role,
                    "nationality": "Overseas" if data.get("is_overseas") else "Indian",
                    "is_overseas": bool(data.get("is_overseas")),
                    "base_price": p_base,
                    "power_index": 82.0,
                    "predicted_hammer_price": round(p_base * 3.5, 2)
                }
                room.current_bid = p_base
                room.current_bidder = None
                room.status = "active"
                await broadcast_state("PLAYER_NOMINATED", {"player": room.current_player})

            elif action == "chat":
                chat_msg = data.get("message", "")
                await broadcast_state("CHAT_MESSAGE", {"client_id": client_id, "team": user_team, "message": chat_msg})

    except WebSocketDisconnect:
        if client_id in room.connections:
            del room.connections[client_id]
        if client_id in room.franchise_seats:
            del room.franchise_seats[client_id]
        await broadcast_state("USER_LEFT", {"left_client": client_id})
