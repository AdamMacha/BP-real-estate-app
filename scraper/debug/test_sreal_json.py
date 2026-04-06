import requests
import json

url = "https://www.sreality.cz/api/cs/v2/estates?category_main_cb=1&category_type_cb=1&per_page=2"
response = requests.get(url)
data = response.json()
listings = data.get("_embedded", {}).get("estates", [])

for listing in listings:
    print(json.dumps(listing, indent=2))
