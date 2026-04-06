import json
from bs4 import BeautifulSoup

with open("/tmp/bez_raw.html") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
next_data = soup.find('script', id='__NEXT_DATA__')

if next_data:
    print("Found __NEXT_DATA__!")
    data = json.loads(next_data.string)
    apollo_cache = data.get('props', {}).get('pageProps', {}).get('apolloCache', {})
    
    adverts = {k: v for k, v in apollo_cache.items() if k.startswith('Advert:')}
    print(f"Extracted {len(adverts)} adverts from Apollo cache")
    if len(adverts) > 0:
        print("First advert ID:", list(adverts.values())[0].get('id'))
else:
    print("No __NEXT_DATA__. Structure changed!")
