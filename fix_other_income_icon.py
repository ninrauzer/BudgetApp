import sys
sys.path.insert(0, '/mnt/e/Desarrollo/BudgetApp/backend')
from app.db.database import SessionLocal
from app.models.category import Category

db = SessionLocal()
cat = db.query(Category).filter(Category.id == 7).first()

if cat:
    print(f"Antes: {repr(cat.icon)}")
    cat.icon = "Plus"
    db.commit()
    print(f"Después: {repr(cat.icon)}")

db.close()
