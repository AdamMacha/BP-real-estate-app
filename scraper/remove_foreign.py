import asyncio
import os
import sys

# Setup environment
parent_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(parent_dir)

from database import SessionLocal, Property

def remove_foreign_properties():
    db = SessionLocal()
    try:
        properties = db.query(Property).all()
        to_delete = []
        
        foreign_terms = [
            'Německo', 'Germany', 'Deutschland', 'Stuttgart', 'Pirna', 'Wien', 'Rakousko', 
            'Austria', 'Österreich', 'Slovensko', 'Slovakia', 'Bratislava', 'Chorvatsko', 
            'Croatia', 'Španělsko', 'Spain', 'Tenerife', 'Lugstr'
        ]
        
        for prop in properties:
            is_foreign = False
            for term in foreign_terms:
                if prop.city and term.lower() in prop.city.lower():
                    is_foreign = True
                    break
                if prop.address and term.lower() in prop.address.lower():
                    is_foreign = True
                    break
                if prop.title and term.lower() in prop.title.lower():
                    is_foreign = True
                    break
            
            if is_foreign:
                to_delete.append(prop)
                
        print(f"Found {len(to_delete)} foreign properties.")
        
        for prop in to_delete:
            db.delete(prop)
            
        db.commit()
        print("Deleted foreign properties.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    remove_foreign_properties()
