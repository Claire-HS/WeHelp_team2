import os
from dotenv import load_dotenv
import requests
from aqi import GovData

load_dotenv()
webhooks = os.getenv("Discord_Webhooks")

def get_aqi_level(aqi):
    aqi = int(aqi)
    try:
        if aqi <= 50:
            return 5763719 # 綠色
        elif aqi <= 100:
            return 16776960 # 黃色
        elif aqi <= 150:
            return 16737095 # 橙色
        elif aqi <= 200:
            return 16711680 # 紅色
        elif aqi <= 300:
            return 10494192 # 紫色
        else:
            return 8388736  # 棕色
    except: 
        return 3447003 # 藍色

def get_status_emoji(status):
    if "良好" in status:
        return "🟢"
    elif "普通" in status: 
        return "🟡"
    elif "敏感族群" in status: 
        return "🟠"
    elif "不健康" in status: 
        return "🔴"
    elif "非常不健康" in status: 
        return "🟣"
    elif "危害" in status: 
        return "🟤"
    return ""

data = GovData.get_aqi_data()
site = data[11]
color = get_aqi_level(site["aqi"])
status_emoji = get_status_emoji(site["status"])
print(site)
print(color)

response = requests.post(
    webhooks,
    json={
        "username": "空氣品質監測",
        "embeds": [
            {
                "title": f"觀測站：{site["county"]}  -  {site["sitename"]}",
                "color": color,
                "fields": [
                    {
                        "name": "**AQI**",
                        "value": f"**{site["aqi"]}**",
                        "inline": True
                    },
                    {
                        "name": "**空氣品質**",
                        "value": f"{status_emoji}    **{site["status"]}**",
                        "inline": True
                    },
                    {
                        "name": "\u200b",
                        "value": "\u200b",
                        "inline": True
                    },
                    {
                        "name": "\u200b",
                        "value": "───────────── 相關數據 ─────────────",
                        "inline": False
                    },
                    {
                        "name": "pm2.5",
                        "value": f"{site["pm2.5"]} μg/m3",
                        "inline": True
                    },
                    {
                        "name": "pm10",
                        "value": f"{site["pm10"]} μg/m3",
                        "inline": True
                    },
                    {
                        "name": "so2",
                        "value": f"{site["so2"]} ppb",
                        "inline": True
                    },
                    {
                        "name": "co",
                        "value": f"{site["co"]} ppm",
                        "inline": True
                    },
                    {
                        "name": "o3",
                        "value": f"{site["o3"]} ppb",
                        "inline": True
                    },
                    {
                        "name": "no2",
                        "value": f"{site["no2"]} ppb",
                        "inline": True
                    }
                ],
                "footer": {
                    "text": f"更新時間：{site["publishtime"]}｜資料來源：行政院環境部"
                }
            }
        ]
    }
)

print(response)

 
    
