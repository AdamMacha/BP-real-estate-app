import httpx
import json

def test():
    url = "https://www.sreality.cz/api/cs/v2/estates?category_main_cb=1&category_type_cb=1&per_page=10"
    r = httpx.get(url)
    data = r.json()
    for est in data.get('_embedded', {}).get('estates', []):
        seo = est.get('seo', {})
        print(est.get('hash_id'), est.get('name'), seo)

test()
