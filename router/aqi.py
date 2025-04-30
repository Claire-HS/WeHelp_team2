from fastapi import APIRouter

from model.aqi import GovData, AQIForecast

aqi_routes = APIRouter(tags=["aqi"])

@aqi_routes.get("/api/aqi")
async def get_aqi():
    records = GovData.get_aqi_data()
    return {"records": records}

@aqi_routes.get("/api/aqi/forecast")
async def get_aqi_forecast():
    data = GovData.get_aqi_forecast()
    result = AQIForecast.tidy(data)
    return {"records": result}