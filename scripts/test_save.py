import requests
import json

url = "http://192.168.126.127:8000/api/budget-plans/cell/update"
data = {
    "cycle_name": "Enero",
    "category_id": 4,
    "amount": 5000,
    "notes": "test"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Ahora verificar si se guardó
url2 = "http://192.168.126.127:8000/api/budget-plans/annual/2025"
response2 = requests.get(url2)
data2 = response2.json()
print(f"\nEnero amounts: {data2['amounts']['Enero']}")
