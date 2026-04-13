import re
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from typing import List, Optional

from scrapers.base import BaseScraper, PropertyData
from config import settings


class BezrealitkyScraper(BaseScraper):
    """Scraper for bezrealitky.cz using Next.js data extraction"""
    
    def __init__(self):
        super().__init__()
        self.base_url = settings.BEZREALITKY_BASE_URL
    
    async def scrape(
        self,
        transaction_type: str = "prodej",
        property_type: str = "byty",
        locality: Optional[str] = None,
        max_pages: int = 5
    ) -> List[PropertyData]:
        """Scrape bezrealitky.cz by extracting Next.js data using httpx"""
        all_properties = []
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "cs,en-US;q=0.9,en;q=0.8"
        }
        
        async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
            try:
                for page_num in range(1, max_pages + 1):
                    self.logger.info(f"Scraping bezrealitky.cz page {page_num}/{max_pages}")
                    
                    url = self._build_url(transaction_type, property_type, locality, page_num)
                    self.logger.info(f"URL: {url}")
                    
                    try:
                        response = await client.get(url)
                        if response.status_code == 404:
                            self.logger.warning(f"Zřejmě jsme na konci výsledků (404) na stránce {page_num}")
                            break
                        response.raise_for_status()
                        
                        # Získáme HTML
                        content = response.text
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        # Hledáme __NEXT_DATA__ script s JSON daty
                        next_data = soup.find('script', id='__NEXT_DATA__')
                        if next_data:
                            try:
                                data = json.loads(next_data.string)
                                apollo_cache = data.get('props', {}).get('pageProps', {}).get('apolloCache', {})
                                
                                # Najdeme všechny inzeráty v cache a vytvoříme tasky pro jejich parsování a stažení detailu
                                advert_keys = [k for k in apollo_cache.keys() if k.startswith('Advert:') and isinstance(apollo_cache[k], dict)]
                                
                                if advert_keys:
                                    tasks = [self._parse_apollo_advert(client, apollo_cache[k], apollo_cache) for k in advert_keys]
                                    parsed_listings = await asyncio.gather(*tasks, return_exceptions=True)
                                    
                                    for res in parsed_listings:
                                        if isinstance(res, Exception):
                                            self.logger.error(f"Task failed: {res}")
                                        elif res:
                                            all_properties.append(res)
                                
                                adverts_count = len(advert_keys)
                                self.logger.info(f"Extracted and fetched {adverts_count} adverts from Apollo cache")
                                
                                if adverts_count == 0:
                                    self.logger.warning("No adverts found in Apollo cache. Maybe the end of results.")
                                    break
                                
                            except json.JSONDecodeError as e:
                                self.logger.error(f"Failed to parse Next.js data: {e}")
                        else:
                            self.logger.warning("No __NEXT_DATA__ found on page")
                        
                    except httpx.HTTPError as e:
                        self.logger.error(f"HTTP error on page {page_num}: {e}")
                        break
                    except Exception as e:
                        self.logger.error(f"Error on page {page_num}: {e}")
                        break
                    
                    self.rate_limit()
                    
            except Exception as e:
                self.logger.error(f"Client error: {e}")
        
        self.logger.info(f"Total properties scraped: {len(all_properties)}")
        return all_properties
    
    def _build_url(
        self,
        transaction_type: str,
        property_type: str,
        locality: Optional[str],
        page: int
    ) -> str:
        """Build search URL"""
        # Correct format
        trans_map = {"prodej": "nabidka-prodej", "pronajem": "nabidka-pronajem"}
        prop_map = {"byty": "byt", "domy": "dum", "pozemky": "pozemek"}
        
        trans = trans_map.get(transaction_type, "nabidka-prodej")
        prop = prop_map.get(property_type, "byt")
        
        url = f"{self.base_url}/vypis/{trans}/{prop}"
        
        params = ["country=ceska-republika"]
        if page > 1:
            params.append(f"page={page}")
        if locality:
            params.append(f"searchType=map&locality={locality}")
        
        if params:
            url += "?" + "&".join(params)
        
        return url
    
    async def _parse_apollo_advert(self, client: httpx.AsyncClient, advert: dict, apollo_cache: dict) -> Optional[PropertyData]:
        """Parse advert from Apollo GraphQL cache and fetch description from detail page"""
        try:
            advert_id = str(advert.get('id', ''))
            uri = advert.get('uri', advert_id)
            
            # Source URL
            source_url = f"{self.base_url}/nemovitosti-byty-domy/{uri}"
            
            # Fetch detail page to get description and country info
            description = None
            try:
                detail_response = await client.get(source_url)
                detail_response.raise_for_status()
                detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                detail_next_data = detail_soup.find('script', id='__NEXT_DATA__')
                if detail_next_data:
                    detail_data = json.loads(detail_next_data.string)
                    orig_advert = detail_data.get('props', {}).get('pageProps', {}).get('origAdvert', {})
                    description = orig_advert.get('description')
                    
                    # Filtering for non-Czech properties (German, Austrian specifically)
                    country = orig_advert.get('country')
                    address_raw = advert.get('address({"locale":"CS"})', '')
                    title = advert.get('imageAltText({"locale":"CS"})', '')
                    if not title:
                        title = advert.get('address({"locale":"CS"})', f'Nemovitost {advert_id}')
                    
                    foreign_terms = [
                        'Německo', 'Germany', 'Deutschland', 'Stuttgart', 'Pirna', 'Wien', 'Rakousko', 
                        'Austria', 'Österreich', 'Slovensko', 'Slovakia', 'Bratislava', 'Chorvatsko', 
                        'Croatia', 'Španělsko', 'Spain', 'Tenerife'
                    ]
                    
                    is_foreign_term_found = any(term.lower() in address_raw.lower() or term.lower() in title.lower() for term in foreign_terms)

                    is_non_cz = (
                        (country and country.upper() not in ['CZ', 'CZE', 'CZECH REPUBLIC', 'ČESKO', 'ČESKÁ REPUBLIKA']) or
                        is_foreign_term_found
                    )
                    
                    if is_non_cz:
                        self.logger.info(f"Skipping non-Czech property: {advert_id} ({address_raw})")
                        return None
            except Exception as e:
                self.logger.warning(f"Could not fetch detail description for {advert_id}: {e}")
            
            # Title from imageAltText or construct from address
            title = advert.get('imageAltText({"locale":"CS"})', '')
            if not title:
                title = advert.get('address({"locale":"CS"})', f'Nemovitost {advert_id}')
            
            # Price
            price = advert.get('price')
            
            # Address and location
            address = advert.get('address({"locale":"CS"})')
            city = None
            if address:
                # Address format: "Ulice, Praha - Čtvrť" or "Ulice, Město"
                parts = address.split(',')
                if len(parts) >= 2:
                    # Second part contains "Praha - Čtvrť" or just "Město"
                    city_part = parts[1].strip()
                    # If it contains " - ", take the first part before dash
                    if ' - ' in city_part:
                        city = city_part.split(' - ')[0].strip()
                    else:
                        city = city_part
                elif len(parts) == 1:
                    # Only one part, might be just city
                    city = parts[0].strip()
            
            # GPS coordinates
            gps = advert.get('gps', {})
            latitude = gps.get('lat') if gps else None
            longitude = gps.get('lng') if gps else None
            
            # Area
            area_size = advert.get('surface')
            
            # Disposition (room count)
            disposition = advert.get('disposition', '')
            room_count = self._parse_disposition(disposition)
            
            # Property and transaction types
            estate_type = advert.get('estateType', 'BYT')
            offer_type = advert.get('offerType', 'PRODEJ')
            
            property_type = self.normalize_property_type(estate_type.lower())
            transaction_type = 'sale' if offer_type == 'PRODEJ' else 'rent'
            
            # Images
            images = []
            main_image_ref = advert.get('mainImage', {}).get('__ref')
            if main_image_ref and main_image_ref in apollo_cache:
                img_data = apollo_cache[main_image_ref]
                img_url = img_data.get('url({"filter":"RECORD_MAIN"})')
                if img_url and not img_url.startswith('http'):
                    img_url = f"https://api.bezrealitky.cz{img_url}"
                if img_url:
                    images.append(img_url)
            
            thumbnail = images[0] if images else None
            
            return PropertyData(
                source="bezrealitky",
                external_id=f"bezrealitky_{advert_id}",
                title=title,
                description=description,
                price=float(price) if price else None,
                price_note=None,
                property_type=property_type,
                transaction_type=transaction_type,
                address=address,
                city=city,
                latitude=float(latitude) if latitude else None,
                longitude=float(longitude) if longitude else None,
                area_size=float(area_size) if area_size else None,
                room_count=room_count,
                images=images,
                thumbnail=thumbnail,
                source_url=source_url,
                published_at=None
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing Apollo advert: {e}")
            return None
    
    def _parse_disposition(self, disposition: str) -> Optional[str]:
        """Convert disposition code to room count string"""
        # DISP_4_1 -> 4+1, DISP_2_KK -> 2+kk
        if not disposition or disposition == 'UNDEFINED':
            return None
        
        parts = disposition.replace('DISP_', '').split('_')
        if len(parts) == 2:
            if parts[1].upper() == 'KK':
                return f"{parts[0]}+kk"
            else:
                return f"{parts[0]}+{parts[1]}"
        return None
    
    def normalize_property_type(self, estate_type: str) -> str:
        """Normalize estate type to our schema"""
        mapping = {
            'byt': 'flat',
            'dum': 'house',
            'pozemek': 'land',
            'komercni': 'commercial'
        }
        return mapping.get(estate_type.lower(), 'flat')
