from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_db, init_db, Property
from scrapers.sreality import SrealityScraper
from scrapers.bezrealitky import BezrealitkyScraper
from scrapers.base import PropertyData
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Real Estate Scraper API",
    description="API for scraping and managing real estate listings",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Scraper instances
sreality_scraper = SrealityScraper()
bezrealitky_scraper = BezrealitkyScraper()


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized!")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "real-estate-scraper",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }


@app.post("/scrape/sreality")
async def scrape_sreality(
    background_tasks: BackgroundTasks,
    category_main: Optional[int] = None,
    category_type: Optional[int] = None,
    max_pages: int = 3,
    db: Session = Depends(get_db)
):
    """
    Trigger sreality.cz scraping
    
    Args:
        category_main: 1=flats, 2=houses, 3=land, 4=commercial
        category_type: 1=sale, 2=rent
        max_pages: Maximum pages to scrape
    """
    try:
        logger.info(f"Starting sreality scraping with category_main={category_main}, category_type={category_type}")
        
        # Run scraping in background
        background_tasks.add_task(
            _run_sreality_scrape,
            db,
            category_main,
            category_type,
            max_pages
        )
        
        return {
            "status": "started",
            "message": "Sreality scraping started in background",
            "source": "sreality"
        }
    except Exception as e:
        logger.error(f"Error starting sreality scrape: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape/bezrealitky")
async def scrape_bezrealitky(
    background_tasks: BackgroundTasks,
    transaction_type: str = "prodej",
    property_type: str = "byty",
    locality: Optional[str] = None,
    max_pages: int = 3,
    db: Session = Depends(get_db)
):
    """
    Trigger bezrealitky.cz scraping
    
    Args:
        transaction_type: "prodej" or "pronajem"
        property_type: "byty", "domy", "pozemky", "komercni"
        locality: Location filter
        max_pages: Maximum pages to scrape
    """
    try:
        logger.info(f"Starting bezrealitky scraping with type={transaction_type}, property={property_type}")
        
        # Run scraping in background
        background_tasks.add_task(
            _run_bezrealitky_scrape,
            db,
            transaction_type,
            property_type,
            locality,
            max_pages
        )
        
        return {
            "status": "started",
            "message": "Bezrealitky scraping started in background",
            "source": "bezrealitky"
        }
    except Exception as e:
        logger.error(f"Error starting bezrealitky scrape: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape/all")
async def scrape_all(
    background_tasks: BackgroundTasks,
    max_pages: int = 3,
    db: Session = Depends(get_db)
):
    """Trigger scraping from all sources"""
    try:
        logger.info("Starting full scraping from all sources")
        
        # Scrape flats for sale from both sources
        background_tasks.add_task(_run_sreality_scrape, db, 1, 1, max_pages)  # Flats, Sale
        background_tasks.add_task(_run_bezrealitky_scrape, db, "prodej", "byty", None, max_pages)
        
        return {
            "status": "started",
            "message": "Full scraping started in background",
            "sources": ["sreality", "bezrealitky"]
        }
    except Exception as e:
        logger.error(f"Error starting full scrape: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scrape/status")
async def get_scrape_status(db: Session = Depends(get_db)):
    """Get scraping status and statistics"""
    try:
        # Count properties by source
        sreality_count = db.query(Property).filter(Property.source == "sreality").count()
        bezrealitky_count = db.query(Property).filter(Property.source == "bezrealitky").count()
        total_count = db.query(Property).count()
        
        # Get latest scrape time
        latest_property = db.query(Property).order_by(Property.scraped_at.desc()).first()
        latest_scrape = latest_property.scraped_at if latest_property else None
        
        return {
            "total_properties": total_count,
            "sources": {
                "sreality": sreality_count,
                "bezrealitky": bezrealitky_count
            },
            "latest_scrape": latest_scrape.isoformat() if latest_scrape else None
        }
    except Exception as e:
        logger.error(f"Error getting scrape status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Background task functions
async def _run_sreality_scrape(
    db: Session,
    category_main: Optional[int],
    category_type: Optional[int],
    max_pages: int
):
    """Background task to run sreality scraping"""
    try:
        properties = await sreality_scraper.scrape(
            category_main=category_main,
            category_type=category_type,
            max_pages=max_pages
        )
        
        # Save to database
        saved_count = _save_properties(db, properties)
        logger.info(f"Saved {saved_count} properties from sreality.cz")
        
    except Exception as e:
        logger.error(f"Error in sreality background scrape: {e}")


async def _run_bezrealitky_scrape(
    db: Session,
    transaction_type: str,
    property_type: str,
    locality: Optional[str],
    max_pages: int
):
    """Background task to run bezrealitky scraping"""
    try:
        properties = await bezrealitky_scraper.scrape(
            transaction_type=transaction_type,
            property_type=property_type,
            locality=locality,
            max_pages=max_pages
        )
        
        # Save to database
        saved_count = _save_properties(db, properties)
        logger.info(f"Saved {saved_count} properties from bezrealitky.cz")
        
    except Exception as e:
        logger.error(f"Error in bezrealitky background scrape: {e}")


def _save_properties(db: Session, properties: List[PropertyData]) -> int:
    """Save scraped properties to database"""
    saved_count = 0
    
    for prop_data in properties:
        try:
            # Check if property already exists
            existing = db.query(Property).filter(
                Property.external_id == prop_data.external_id
            ).first()
            
            if existing:
                # Update existing property
                for key, value in prop_data.dict().items():
                    if hasattr(existing, key) and value is not None:
                        setattr(existing, key, value)
                existing.updated_at = datetime.utcnow()
                existing.scraped_at = datetime.utcnow()
            else:
                # Create new property
                new_property = Property(**prop_data.dict())
                db.add(new_property)
                saved_count += 1
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error saving property {prop_data.external_id}: {e}")
            db.rollback()
            continue
    
    return saved_count


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
