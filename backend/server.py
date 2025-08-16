from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
import uuid
import requests
from typing import Optional, List
import json

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.carwash_db

app = FastAPI(title="Car Wash App API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: Optional[datetime] = None

class Car(BaseModel):
    id: str
    user_id: str
    make: str
    model: str
    year: int
    license_plate: str
    created_at: Optional[datetime] = None

class CarCreate(BaseModel):
    make: str
    model: str
    year: int
    license_plate: str

class Service(BaseModel):
    id: str
    name: str
    description: str
    price: float
    duration_minutes: int

class Booking(BaseModel):
    id: str
    user_id: str
    car_id: str
    service_id: str
    booking_date: str
    booking_time: str
    status: str
    total_price: float
    created_at: Optional[datetime] = None

class BookingCreate(BaseModel):
    car_id: str
    service_id: str
    booking_date: str
    booking_time: str

# Authentication helper
async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify session token in database
    session = await db.sessions.find_one({"session_token": session_token})
    if not session or session["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    # Create default services
    services_data = [
        {"id": str(uuid.uuid4()), "name": "Quick Touchless Wash", "description": "Fast and efficient touchless wash", "price": 15.99, "duration_minutes": 15},
        {"id": str(uuid.uuid4()), "name": "Quick Wash", "description": "Basic wash with soap and rinse", "price": 12.99, "duration_minutes": 20},
        {"id": str(uuid.uuid4()), "name": "Inside Out Wash", "description": "Complete interior and exterior cleaning", "price": 35.99, "duration_minutes": 45},
        {"id": str(uuid.uuid4()), "name": "Polish", "description": "Premium polish for a brilliant shine", "price": 25.99, "duration_minutes": 30},
        {"id": str(uuid.uuid4()), "name": "Silver Wash", "description": "Premium wash with wax protection", "price": 29.99, "duration_minutes": 35},
        {"id": str(uuid.uuid4()), "name": "Gold Wash", "description": "Ultimate luxury wash package", "price": 49.99, "duration_minutes": 60}
    ]
    
    # Check if services already exist
    existing_services = await db.services.count_documents({})
    if existing_services == 0:
        await db.services.insert_many(services_data)

# Auth endpoints
@app.post("/api/auth/login")
async def login(session_id: str, response: Response):
    """Exchange session ID for user data"""
    try:
        # Call Emergent auth API
        headers = {"X-Session-ID": session_id}
        auth_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers=headers
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid session")
        
        user_data = auth_response.json()
        
        # Create or get user
        user_id = str(uuid.uuid4())
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
        if not existing_user:
            user_doc = {
                "id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "created_at": datetime.utcnow()
            }
            await db.users.insert_one(user_doc)
        else:
            user_id = existing_user["id"]
        
        # Create session
        session_token = user_data["session_token"]
        session_doc = {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": datetime.utcnow() + timedelta(days=7),
            "created_at": datetime.utcnow()
        }
        await db.sessions.insert_one(session_doc)
        
        # Set HTTP-only cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            max_age=7 * 24 * 60 * 60,  # 7 days
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {"message": "Login successful", "user": {"id": user_id, "email": user_data["email"], "name": user_data["name"], "picture": user_data.get("picture")}}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    """Logout user"""
    session_token = response.cookies.get("session_token")
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

# Car endpoints
@app.post("/api/cars", response_model=Car)
async def create_car(car_data: CarCreate, current_user: dict = Depends(get_current_user)):
    car_id = str(uuid.uuid4())
    car_doc = {
        "id": car_id,
        "user_id": current_user["id"],
        "make": car_data.make,
        "model": car_data.model,
        "year": car_data.year,
        "license_plate": car_data.license_plate,
        "created_at": datetime.utcnow()
    }
    await db.cars.insert_one(car_doc)
    return Car(**car_doc)

@app.get("/api/cars", response_model=List[Car])
async def get_user_cars(current_user: dict = Depends(get_current_user)):
    cars_cursor = db.cars.find({"user_id": current_user["id"]})
    cars = await cars_cursor.to_list(length=None)
    return [Car(**car) for car in cars]

@app.delete("/api/cars/{car_id}")
async def delete_car(car_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.cars.delete_one({"id": car_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}

# Service endpoints
@app.get("/api/services", response_model=List[Service])
async def get_services():
    services_cursor = db.services.find({})
    services = await services_cursor.to_list(length=None)
    return [Service(**service) for service in services]

# Booking endpoints
@app.post("/api/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    # Verify car belongs to user
    car = await db.cars.find_one({"id": booking_data.car_id, "user_id": current_user["id"]})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Get service details
    service = await db.services.find_one({"id": booking_data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_id = str(uuid.uuid4())
    booking_doc = {
        "id": booking_id,
        "user_id": current_user["id"],
        "car_id": booking_data.car_id,
        "service_id": booking_data.service_id,
        "booking_date": booking_data.booking_date,
        "booking_time": booking_data.booking_time,
        "status": "confirmed",
        "total_price": service["price"],
        "created_at": datetime.utcnow()
    }
    await db.bookings.insert_one(booking_doc)
    return Booking(**booking_doc)

@app.get("/api/bookings", response_model=List[dict])
async def get_user_bookings(current_user: dict = Depends(get_current_user)):
    bookings_cursor = db.bookings.find({"user_id": current_user["id"]})
    bookings = await bookings_cursor.to_list(length=None)
    
    # Populate with car and service details
    enriched_bookings = []
    for booking in bookings:
        car = await db.cars.find_one({"id": booking["car_id"]})
        service = await db.services.find_one({"id": booking["service_id"]})
        
        enriched_booking = {
            **booking,
            "car": car,
            "service": service
        }
        enriched_bookings.append(enriched_booking)
    
    return enriched_bookings

@app.delete("/api/bookings/{booking_id}")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.bookings.update_one(
        {"id": booking_id, "user_id": current_user["id"]},
        {"$set": {"status": "cancelled"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking cancelled successfully"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)