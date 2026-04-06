import urllib.request
import json
from bs4 import BeautifulSoup

url = "https://www.bezrealitky.cz/vypis/nabidka-prodej/byt"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

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
                print("No adverts found inside cache!? Let's print keys:")
                print(list(apollo_cache.keys())[:20])
        else:
            print("No __NEXT_DATA__ found. Did they remove Next.js?")
            
except Exception as e:
    import traceback
    traceback.print_exc()
