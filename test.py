import requests

API_KEY="029a5fe4-6807-4d46-aea5-34637047d215"

# response = requests.get("https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization="+API_KEY)
response = requests.get(
    "https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&api_key="+API_KEY,
    verify=False
)
data = response.json()
records = data["records"]
print(records[0])
print(len(records))