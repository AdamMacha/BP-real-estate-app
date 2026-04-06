from database import SessionLocal, Property

def clear_properties():
    db = SessionLocal()
    try:
        deleted_count = db.query(Property).delete()
        db.commit()
        print(f"✅ Úspěšně smazáno {deleted_count} inzerátů!")
    except Exception as e:
        print("❌ Chyba při mazání:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_properties()
