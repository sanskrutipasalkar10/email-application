import requests
import json

url = "http://localhost:5000/api/analyze"
data = {
    "email_body": "CRITICAL: Hydraulic press on Line 4 has seized. Production is halted. We need help.",
    "attachment_text": None
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
