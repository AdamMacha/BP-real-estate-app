from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
import logging

from database import SessionLocal
from scrapers.sreality import SrealityScraper
from scrapers.bezrealitky import BezrealitkyScraper
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScraperScheduler:
    """Scheduled scraping jobs"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.sreality_scraper = SrealityScraper()
        self.bezrealitky_scraper = BezrealitkyScraper()
    
    async def scrape_all_sources(self):
        """Main scheduled task - scrape all sources"""
        logger.info("Starting scheduled scraping of all sources")
        
        db = SessionLocal()
        try:
            # Scrape flats for sale
            logger.info("Scraping sreality.cz - flats for sale")
            sreality_properties = await self.sreality_scraper.scrape(
                category_main=1,  # Flats
                category_type=1,  # Sale
                max_pages=settings.MAX_PAGES_SCHEDULED_SREALITY
            )
            self._save_properties(db, sreality_properties)
            
            # Scrape houses for sale
            logger.info("Scraping sreality.cz - houses for sale")
            sreality_houses = await self.sreality_scraper.scrape(
                category_main=2,  # Houses
                category_type=1,  # Sale
                max_pages=settings.MAX_PAGES_SCHEDULED_SREALITY
            )
            self._save_properties(db, sreality_houses)
            
            # Scrape bezrealitky - flats
            logger.info("Scraping bezrealitky.cz - flats for sale")
            bezrealitky_flats = await self.bezrealitky_scraper.scrape(
                transaction_type="prodej",
                property_type="byty",
                max_pages=settings.MAX_PAGES_SCHEDULED_BEZREALITKY
            )
            self._save_properties(db, bezrealitky_flats)
            
            # Scrape bezrealitky - houses
            logger.info("Scraping bezrealitky.cz - houses for sale")
            bezrealitky_houses = await self.bezrealitky_scraper.scrape(
                transaction_type="prodej",
                property_type="domy",
                max_pages=settings.MAX_PAGES_SCHEDULED_BEZREALITKY
            )
            self._save_properties(db, bezrealitky_houses)
            
            logger.info("Scheduled scraping completed successfully")
            
        except Exception as e:
            logger.error(f"Error during scheduled scraping: {e}")
        finally:
            db.close()
    
    def _save_properties(self, db: Session, properties):
        """Save properties to database"""
        from main import _save_properties
        saved = _save_properties(db, properties)
        logger.info(f"Saved {saved} new properties")
    
    def start(self):
        """Start the scheduler"""
        # Schedule daily scraping at configured time (default 2:00 AM)
        self.scheduler.add_job(
            self.scrape_all_sources,
            CronTrigger(
                hour=settings.SCRAPE_CRON_HOUR,
                minute=settings.SCRAPE_CRON_MINUTE
            ),
            id="daily_scrape",
            name="Daily scraping of all real estate sources",
            replace_existing=True
        )
        
        logger.info(
            f"Scheduler started. Daily scraping scheduled at "
            f"{settings.SCRAPE_CRON_HOUR:02d}:{settings.SCRAPE_CRON_MINUTE:02d}"
        )
        
        self.scheduler.start()
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")


# Create global scheduler instance
scraper_scheduler = ScraperScheduler()


if __name__ == "__main__":
    import asyncio
    
    # For testing - run once
    async def test_run():
        scheduler = ScraperScheduler()
        await scheduler.scrape_all_sources()
    
    asyncio.run(test_run())
