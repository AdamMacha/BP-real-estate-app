from sqlalchemy.orm import Session
from database import SessionLocal, Property
import re
import httpx
import logging

logging.basicConfig(level=logging.INFO)

def _build_sreality_url(external_id: str) -> str:
    """Fetch the specific property API to get its SEO since it's not in DB, 
       then reconstruct URL. Fallback if API fails."""
    # external_id in DB is "sreality_9056844"
    if not external_id.startswith("sreality_"):
        return None
        
    hash_id = external_id.replace("sreality_", "")
    url = f"https://www.sreality.cz/api/cs/v2/estates/{hash_id}"
    try:
        r = httpx.get(url, timeout=5.0)
        data = r.json()
        seo = data.get("seo", {})
        
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
        
        t_str = type_map.get(seo.get("category_type_cb"), "prodej")
        m_str = main_map.get(seo.get("category_main_cb"), "byt")
        s_str = sub_map.get(seo.get("category_sub_cb"), "ostatni")
        loc_str = seo.get("locality", "lokalita")
        
        return f"https://www.sreality.cz/detail/{t_str}/{m_str}/{s_str}/{loc_str}/{hash_id}"
    except Exception as e:
        # Fallback to a rudimentary URL that might still 404, or just leave it
        return None

def update_urls():
    db = SessionLocal()
    try:
        # Limit to 50 for speed right now, users can run full scrape later
        properties = db.query(Property).filter(
            Property.source == 'sreality'
        ).limit(100).all()
        
        updated_count = 0
        for prop in properties:
            if prop.source_url and prop.source_url.endswith(prop.external_id.replace("sreality_", "")) and len(prop.source_url.split('/')) == 5:
                # The URL is probably like https://www.sreality.cz/detail/1781154636 which is exactly 5 segments
                new_url = _build_sreality_url(prop.external_id)
                if new_url:
                    prop.source_url = new_url
                    updated_count += 1
                    
        db.commit()
        logging.info(f"Successfully updated {updated_count} Sreality URLs.")
        
    except Exception as e:
        logging.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_urls()
