from database import SessionLocal, Property
import sys

def clean_germany():
    db = SessionLocal()
    try:
        # Hledáme inzeráty, které mají v adrese nebo městě "Německo", "Germany" nebo "Deutschland"
        # Nebo ty, které jsou z Bezrealitky a mají podezřelé ceny (pokud se nám podařilo detekovat country kód, ale u existujících asi ne)
        
        query = db.query(Property).filter(
            (Property.address.ilike('%Německo%')) | 
            (Property.address.ilike('%Germany%')) | 
            (Property.address.ilike('%Deutschland%')) |
            (Property.city.ilike('%Německo%')) |
            (Property.city.ilike('%Germany%'))
        )
        
        count = query.count()
        if count > 0:
            query.delete(synchronize_session=False)
            db.commit()
            print(f"✅ Smazáno {count} německých inzerátů.")
        else:
            print("ℹ️ Žádné německé inzeráty nebyly nalezeny podle adresy.")
            
    except Exception as e:
        print("❌ Chyba:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_germany()
