from sqlalchemy import create_engine, Column, String, Integer, Numeric, DateTime, Boolean, Enum, Text, ARRAY, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import enum

from config import settings

# Create engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enums
class PropertySource(str, enum.Enum):
    SREALITY = "sreality"
    BEZREALITKY = "bezrealitky"


class PropertyType(str, enum.Enum):
    FLAT = "flat"
    HOUSE = "house"
    LAND = "land"
    COMMERCIAL = "commercial"


class TransactionType(str, enum.Enum):
    SALE = "sale"
    RENT = "rent"


# Models
class Property(Base):
    __tablename__ = "properties"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False)  
    external_id = Column(String, unique=True, nullable=False, index=True)
    
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Numeric(12, 2))
    price_note = Column(String)
    property_type = Column(String, nullable=False)  
    transaction_type = Column(String, nullable=False)  
    
    # Location
    address = Column(String)
    city = Column(String, index=True)
    district = Column(String)
    region = Column(String)
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    
    # Parameters
    area_size = Column(Numeric(10, 2))  # m²
    room_count = Column(String)
    floor = Column(Integer)
    total_floors = Column(Integer)
    
    # Media
    images = Column(ARRAY(String))
    thumbnail = Column(String)
    
    # Meta
    source_url = Column(String, nullable=False)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True)
    notification_filters = Column(JSON)  # Stored filter preferences


class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    property_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    property_id = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'new_listing', 'price_change'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Database utilities
def get_db():
    """Dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")
