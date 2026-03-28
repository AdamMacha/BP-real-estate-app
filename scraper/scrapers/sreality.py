import httpx
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
                    
                    for listing in listings:
                        property_data = self._parse_listing(listing)
                        if property_data:
                            all_properties.append(property_data)
                    
                    self.logger.info(f"Scraped {len(listings)} properties from page {page}")
                    
                    # Rate limiting
                    self.rate_limit()
                    
                except Exception as e:
                    self.logger.error(f"Error scraping page {page}: {e}")
                    continue
        
        self.logger.info(f"Total properties scraped from sreality.cz: {len(all_properties)}")
        return all_properties
    
    def _parse_listing(self, listing: dict) -> Optional[PropertyData]:
        """Parse a single listing from sreality API response"""
        try:
            # Extract basic info
            external_id = str(listing.get("hash_id", ""))
            if not external_id:
                return None
            
            name = listing.get("name", "")
            
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
            
            # Property and transaction type
            seo = listing.get("seo", {})
            category_main = seo.get("category_main_cb") if isinstance(seo, dict) else None
            category_type = seo.get("category_type_cb") if isinstance(seo, dict) else None
            
            property_type = self._map_category_to_type(category_main)
            transaction_type = "sale" if category_type == 1 else "rent"
            
            # Build URL
            source_url = f"{self.base_url}/detail/{external_id}"
            
            return PropertyData(
                source="sreality",
                external_id=f"sreality_{external_id}",
                title=name,
                description=None,  # Not available in list view
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
