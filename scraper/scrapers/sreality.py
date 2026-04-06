import httpx
import asyncio
from typing import List, Optional
from datetime import datetime

from scrapers.base import BaseScraper, PropertyData
from config import settings


class SrealityScraper(BaseScraper):
    """Scraper for sreality.cz using their unofficial JSON API"""
    
    def __init__(self):
        super().__init__()
        self.api_url = settings.SREALITY_API_URL
        self.base_url = "https://www.sreality.cz"
    
    async def scrape(
        self,
        category_main: Optional[int] = None,  # 1=byty, 2=domy, 3=pozemky, 4=komerční
        category_type: Optional[int] = None,  # 1=prodej, 2=pronájem
        locality: Optional[str] = None,
        max_pages: int = 20
    ) -> List[PropertyData]:
        """
        Scrape sreality.cz using their API
        
        Args:
            category_main: Main category (1=flats, 2=houses, 3=land, 4=commercial)
            category_type: Transaction type (1=sale, 2=rent)
            locality: Location filter
            max_pages: Maximum number of pages to scrape
        """
        all_properties = []
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for page in range(1, max_pages + 1):
                self.logger.info(f"Scraping sreality.cz page {page}/{max_pages}")
                
                # Build query parameters
                params = {
                    "per_page": 60,
                    "page": page,
                }
                
                if category_main:
                    params["category_main_cb"] = category_main
                if category_type:
                    params["category_type_cb"] = category_type
                if locality:
                    params["locality_region_id"] = locality
                
                try:
                    response = await self.fetch_with_retry(
                        client.get,
                        self.api_url,
                        params=params
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    # Parse listings from response
                    listings = data.get("_embedded", {}).get("estates", [])
                    
                    if not listings:
                        self.logger.info("No more listings found")
                        break
                    
                    tasks = [self._parse_listing(client, listing) for listing in listings]
                    parsed_listings = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    for res in parsed_listings:
                        if isinstance(res, Exception):
                            self.logger.error(f"Task failed: {res}")
                        elif res:
                            all_properties.append(res)
                    
                    self.logger.info(f"Scraped {len(listings)} properties from page {page}")
                    
                    # Rate limiting
                    self.rate_limit()
                    
                except Exception as e:
                    self.logger.error(f"Error scraping page {page}: {e}")
                    continue
        
        self.logger.info(f"Total properties scraped from sreality.cz: {len(all_properties)}")
        return all_properties
    
    async def _parse_listing(self, client: httpx.AsyncClient, listing: dict) -> Optional[PropertyData]:
        """Parse a single listing from sreality API response and fetch description"""
        try:
            # Extract basic info
            external_id = str(listing.get("hash_id", ""))
            if not external_id:
                return None
            
            name = listing.get("name", "")
            
            description = None
            try:
                # Fetch details for the description
                detail_url = f"{self.api_url}/{external_id}"
                detail_response = await self.fetch_with_retry(client.get, detail_url)
                detail_response.raise_for_status()
                detail_data = detail_response.json()
                
                text_field = detail_data.get("text", {})
                if isinstance(text_field, dict):
                    description = text_field.get("value")
            except Exception as e:
                self.logger.warning(f"Could not fetch detail description for {external_id}: {e}")
            
            # Price
            price_raw = listing.get("price")
            price = None
            price_note = None
            if isinstance(price_raw, dict):
                price = price_raw.get("value")
                price_note = price_raw.get("name")
            elif isinstance(price_raw, (int, float)):
                price = float(price_raw)
            
            # Location
            locality = listing.get("locality")
            address = locality if locality else name  # Use locality as address if available
            
            # Try to extract city from locality
            city = None
            region = None
            
            if isinstance(locality, str):
                # Format: "Ulice, Město" or "Město"
                parts = locality.split(',')
                if len(parts) >= 2:
                    city = parts[-1].strip()
                else:
                    city = locality.strip()
                    
                # Clean up city name (remove district if present)
                # "Praha 5 - Smíchov" -> "Praha 5"
                if city and ' - ' in city:
                    city = city.split(' - ')[0].strip()
                    
            elif isinstance(locality, dict):
                city = locality.get("value")
                region = locality.get("region", {}).get("value") if isinstance(locality.get("region"), dict) else None
            
            # GPS coordinates
            gps = listing.get("gps", {})
            latitude = gps.get("lat") if isinstance(gps, dict) else None
            longitude = gps.get("lon") if isinstance(gps, dict) else None
            
            # Property details
            items = listing.get("items", [])
            area_size = None
            room_count = None
            
            for item in items:
                if not isinstance(item, dict):
                    continue
                    
                item_name = item.get("name", "").lower()
                item_value = item.get("value")
                
                if "užitná plocha" in item_name or "plocha" in item_name:
                    area_size = self.normalize_area(str(item_value))
                elif "dispozice" in item_name or "pokoje" in item_name:
                    room_count = str(item_value)
            
            # Fallback to extracting from name if not found in items
            if not room_count or not area_size:
                import re
                clean_name = name.replace('\xa0', ' ').replace('&nbsp;', ' ')
                
                if not room_count:
                    layout_match = re.search(r'(\d\+(?:1|kk|[1-9]))', clean_name, re.IGNORECASE)
                    if layout_match:
                        room_count = layout_match.group(1).lower()
                        
                if not area_size:
                    area_match = re.search(r'(\d+(?:[.,]\d+)?)\s*m', clean_name, re.IGNORECASE)
                    if area_match:
                        area_str = area_match.group(1).replace(',', '.')
                        area_size = self.normalize_area(area_str)
            
            # Images
            images = []
            thumbnail = None
            
            image_data = listing.get("_links", {}).get("images", [])
            if image_data:
                for img in image_data:
                    if isinstance(img, dict) and "href" in img:
                        img_url = img["href"]
                        images.append(img_url)
                        if not thumbnail:
                            thumbnail = img_url
            
            seo = listing.get("seo", {})
            category_main_cb = seo.get("category_main_cb") if isinstance(seo, dict) else None
            category_type_cb = seo.get("category_type_cb") if isinstance(seo, dict) else None
            category_sub_cb = seo.get("category_sub_cb") if isinstance(seo, dict) else None
            
            property_type = self._map_category_to_type(category_main_cb)
            transaction_type = "sale" if category_type_cb == 1 else "rent"
            
            # Build proper SEO URL
            type_map = {1: "prodej", 2: "pronajem", 3: "drazby"}
            main_map = {1: "byt", 2: "dum", 3: "pozemek", 4: "komercni", 5: "ostatni"}
            sub_map = {
                2: "1+1", 3: "1+kk", 4: "2+1", 5: "2+kk", 6: "3+1", 7: "3+kk",
                8: "4+1", 9: "4+kk", 10: "5+1", 11: "5+kk", 12: "6-a-vice", 16: "atypicky",
                47: "pokoj", 37: "rodinny", 39: "vila", 43: "chalupa", 33: "chata",
                53: "pamatka", 40: "na-klic", 44: "zemedelska-usedlost",
                19: "bydleni", 18: "komercni", 20: "pole", 22: "louka", 21: "les",
                46: "rybnik", 48: "zahrada",
                25: "kancelare", 26: "sklad", 27: "vyroba", 28: "obchodni-prostor",
                29: "ubytovani", 30: "restaurace", 31: "zemedelsky", 38: "cinzovni-dum",
                34: "garaz", 52: "garazove-stani"
            }
            
            t_str = type_map.get(category_type_cb, "prodej")
            m_str = main_map.get(category_main_cb, "byt")
            s_str = sub_map.get(category_sub_cb, "ostatni")
            loc_str = seo.get("locality", "lokalita") if isinstance(seo, dict) else "lokalita"
            
            source_url = f"{self.base_url}/detail/{t_str}/{m_str}/{s_str}/{loc_str}/{external_id}"
            
            return PropertyData(
                source="sreality",
                external_id=f"sreality_{external_id}",
                title=name,
                description=description,
                price=price,
                price_note=price_note,
                property_type=property_type,
                transaction_type=transaction_type,
                address=address,
                city=city,
                region=region,
                latitude=latitude,
                longitude=longitude,
                area_size=area_size,
                room_count=room_count,
                images=images,
                thumbnail=thumbnail,
                source_url=source_url,
                published_at=None
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing listing: {e}")
            return None
    
    def _map_category_to_type(self, category: Optional[int]) -> str:
        """Map sreality category to property type"""
        mapping = {
            1: "flat",
            2: "house",
            3: "land",
            4: "commercial"
        }
        return mapping.get(category, "flat")
