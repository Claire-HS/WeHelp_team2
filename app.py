from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.aqi import aqi_routes

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(aqi_routes)