import requests
import json

API_KEY = "8a974385-7ed5-4355-b573-cc7729801dfa"
url = f"https://api.cricapi.com/v1/players?apikey={API_KEY}&offset=0&search=Virat Kohli"
response = requests.get(url)
print(json.dumps(response.json(), indent=2))
