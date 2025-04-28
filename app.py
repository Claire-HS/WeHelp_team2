import os
from dotenv import load_dotenv
import requests

from fastapi import FastAPI

from pydantic import BaseModel
from datetime import datetime

load_dotenv()

app = FastAPI()


class AqiOfSite(BaseModel):
    sitename: str
    county: str
    aqi: int | None
    pollutant: str | None
    status: str | None
    so2: float | None
    co: float | None
    o3: float | None
    o3_8hr: float | None
    pm10: float | None
    pm2dot5: float | None
    no2: float | None
    nox: float | None
    no: float | None
    wind_speed: float | None
    wind_direc: float | None
    publishtime: datetime | None
    co_8hr: float | None
    pm2dot5_avg: float | None
    pm10_avg: float | None
    so2_avg: float | None
    longitude: float | None
    latitude: float | None
    siteid: int | None
class AQI(BaseModel):
    records: list[AqiOfSite]



@app.get("/api/aqi")
        #  response_model=AQI)
async def get_info():
    API_KEY = os.getenv("API_KEY")
    response =  requests.get(
        "https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&api_key="+API_KEY,
        verify=False
    )
    data = response.json()
    records = data["records"]
    # modified_records = modify_name_with_pm2dot5(records)
    return {"records": records}


def modify_name_with_pm2dot5(datas):
    for site in datas:
        site["pm2dot5"] = site["pm2.5"]
        del site["pm2.5"]
        site["pm2dot5_avg"] = site["pm2.5_avg"]
        del site["pm2.5_avg"]
    return datas