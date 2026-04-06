import asyncio
import logging
from scrapers.bezrealitky import BezrealitkyScraper

logging.basicConfig(level=logging.INFO)

async def test():
    scraper = BezrealitkyScraper()
    props = await scraper.scrape(max_pages=1)
    print(f"Scraped {len(props)} properties")
    for p in props[:2]:
        print(p)

asyncio.run(test())
