import os
from dotenv import load_dotenv
import requests

load_dotenv()
API_KEY = os.getenv("API_KEY")


class GovData:
    def get_aqi_data():
        response =  requests.get(
            "https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&api_key="+API_KEY,
            verify=False
        )
        data = response.json()
        records = data["records"]
        return records
    
    def get_aqi_forecast():
        response = requests.get(
            "https://data.moenv.gov.tw/api/v2/aqf_p_01?api_key="+API_KEY,
            verify=False
        )
        data = response.json()
        return data
    

class AQIForecast:
    def tidy(data):
        data = data["records"]
        # 找出最新發布日期
        publishtime = [item["publishtime"] for item in data]
        latest_publishtime = max(publishtime)
        index = [time == latest_publishtime for time in publishtime]
        # 篩選出最新發布的資訊
        selected_data = [item for item, boolean in zip(data, index) if boolean]
        return selected_data