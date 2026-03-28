from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import time
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PropertyData(BaseModel):
    """Normalized property data model"""
    source: str
    external_id: str
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    price_note: Optional[str] = None
    property_type: str
    transaction_type: str
    
    # Location
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Parameters
    area_size: Optional[float] = None
    room_count: Optional[str] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    
    # Media
    images: List[str] = Field(default_factory=list)
    thumbnail: Optional[str] = None
    
    # Meta
    source_url: str
    published_at: Optional[datetime] = None


class BaseScraper(ABC):
    """Base class for all scrapers"""
    
    def __init__(self):
        self.delay = settings.REQUEST_DELAY
        self.max_retries = settings.MAX_RETRIES
        self.logger = logging.getLogger(self.__class__.__name__)
    
    @abstractmethod
    async def scrape(self, **kwargs) -> List[PropertyData]:
        """
        Main scraping method to be implemented by each scraper
        Returns list of normalized PropertyData objects
        """
        pass
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def fetch_with_retry(self, fetch_func, *args, **kwargs):
        """Wrapper for fetching with retry logic"""
        try:
            return await fetch_func(*args, **kwargs)
        except Exception as e:
            self.logger.error(f"Error fetching data: {e}")
            raise
    
    def rate_limit(self):
        """Simple rate limiting"""
        time.sleep(self.delay)
    
    def normalize_price(self, price_str: str) -> Optional[float]:
        """Extract numeric price from string"""
        if not price_str:
            return None
        
        # Remove currency symbols, spaces, and convert to float
        try:
            # Handle Czech number format (spaces as thousands separator)
            clean_price = price_str.replace(' ', '').replace('Kč', '').replace(',', '.')
            return float(clean_price)
        except (ValueError, AttributeError):
            self.logger.warning(f"Could not parse price: {price_str}")
            return None
    
    def normalize_area(self, area_str: str) -> Optional[float]:
        """Extract area in m² from string"""
        if not area_str:
            return None
        
        try:
            # Extract number, assuming format like "75 m²" or "75m2"
            clean_area = area_str.replace('m²', '').replace('m2', '').replace(' ', '').replace(',', '.')
            return float(clean_area)
        except (ValueError, AttributeError):
            self.logger.warning(f"Could not parse area: {area_str}")
            return None
    
    def map_property_type(self, type_str: str) -> str:
        """Map source-specific property type to standardized type"""
        type_lower = type_str.lower()
        
        if any(word in type_lower for word in ['byt', 'flat', 'apartment']):
            return 'flat'
        elif any(word in type_lower for word in ['dům', 'house', 'rodinný']):
            return 'house'
        elif any(word in type_lower for word in ['pozemek', 'land', 'parcela', 'louka']):
            return 'land'
        elif any(word in type_lower for word in ['komerční', 'commercial', 'kancelář', 'office']):
            return 'commercial'
        
        return 'flat'  # default
    
    def map_transaction_type(self, type_str: str) -> str:
        """Map source-specific transaction type to standardized type"""
        type_lower = type_str.lower()
        
        if any(word in type_lower for word in ['pronájem', 'rent', 'nájem']):
            return 'rent'
        else:
            return 'sale'  # default
