import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.db.database import SessionLocal
from app.models.category import Category

db = SessionLocal()

# Listar todas las categorías activas
categories = db.query(Category).filter_by(is_active=True).order_by(Category.type, Category.name).all()
print(f"\nCategorías activas ({len(categories)}):\n")
for cat in categories:
    print(f"  [{cat.type:8}] {cat.name:30} → icono: '{cat.icon}'")

db.close()
