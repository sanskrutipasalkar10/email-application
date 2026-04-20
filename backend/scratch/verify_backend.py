import requests
import json

URL = "http://localhost:5000/api/analyze"
DATA = {
    "email_body": "CRITICAL: The production line in Shanghai has stopped due to a power outage. We are losing $50k per hour."
}

try:
    print(f"Sending test request to {URL}...")
    response = requests.post(URL, json=DATA)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error during verification: {e}")
