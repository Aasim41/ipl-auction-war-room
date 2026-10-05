import sys
import requests

api_key = sys.argv[1]
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
headers = {'Content-Type': 'application/json'}
data = {
    "contents": [{"parts":[{"text": "Hello! Are you alive?"}]}]
}
response = requests.post(url, headers=headers, json=data)
print(f"Status Code: {response.status_code}")
print(response.text)
