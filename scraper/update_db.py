import re
from sqlalchemy.orm import Session
from database import SessionLocal, Property

def update_missing_details():
    db = SessionLocal()
    try:
        # Find sreality properties with missing area or room_count
        properties = db.query(Property).filter(
            Property.source == 'sreality',
            (Property.area_size == None) | (Property.room_count == None)
        ).all()
        
        print(f"Found {len(properties)} properties to update.")
        updated_count = 0
        
        for prop in properties:
            clean_title = prop.title.replace('\xa0', ' ').replace('&nbsp;', ' ')
            updated = False
            
            # Extract layout
            if not prop.room_count:
                layout_match = re.search(r'(\d\+(?:1|kk|[1-9]))', clean_title, re.IGNORECASE)
                if layout_match:
                    prop.room_count = layout_match.group(1).lower()
                    updated = True
                    
            # Extract area
            if not prop.area_size:
                area_match = re.search(r'(\d+(?:[.,]\d+)?)\s*m', clean_title, re.IGNORECASE)
                if area_match:
                    try:
                        area_str = area_match.group(1).replace(',', '.')
                        prop.area_size = float(area_str)
                        updated = True
                    except ValueError:
                        pass
            
            if updated:
                updated_count += 1
                
        db.commit()
        print(f"Successfully updated {updated_count} properties.")
        
    except Exception as e:
        print(f"Error updating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_missing_details()
