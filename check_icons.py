import sys
sys.path.insert(0, '.')

from app.database import get_db
from app.models.category import Category

db = next(get_db())
categories = db.query(Category).filter_by(is_active=True).all()
for c in categories:
    print(f"{c.name}: '{c.icon}' (type: {c.type})")
