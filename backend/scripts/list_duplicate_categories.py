from app.db.database import SessionLocal
from app.models.category import Category

def main():
    db = SessionLocal()
    try:
        rows = db.query(Category.id, Category.name).all()
        name_map = {}
        for cid, name in rows:
            name_map.setdefault(name, []).append(cid)
        duplicates = {name: ids for name, ids in name_map.items() if len(ids) > 1}
        if not duplicates:
            print("No duplicate category names found.")
        else:
            print("Duplicate category names:")
            for name, ids in duplicates.items():
                print(f"  {name}: IDs={ids}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
