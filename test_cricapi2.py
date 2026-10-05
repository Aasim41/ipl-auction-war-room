import requests
import json

API_KEY = "8a974385-7ed5-4355-b573-cc7729801dfa"
url = f"https://api.cricapi.com/v1/players_info?apikey={API_KEY}&id=c61d247d-7f77-452c-b495-2813a9cd0ac4"
response = requests.get(url)
print(json.dumps(response.json(), indent=2))
