import sys
sys.path.insert(0, '/mnt/e/Desarrollo/BudgetApp/backend')
from app.db.database import SessionLocal
from app.models.category import Category

db = SessionLocal()
categories = db.query(Category).all()

for cat in categories:
    if '+' in cat.icon or '➕' in cat.icon:
        print(f"ID {cat.id}: {cat.name} → icon: {repr(cat.icon)}")

db.close()
