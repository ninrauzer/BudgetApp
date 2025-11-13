import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.db.database import SessionLocal
from app.models.category import Category

# Mapeo de categorías a iconos de Lucide
category_icon_mapping = {
    'Alquiler': 'home',
    'Telefonía e Internet': 'smartphone',
    'Servicios & Streaming': 'tv',
    'Préstamos Bancarios': 'landmark',
    'Tarjeta de Crédito': 'credit-card',
    'Alimentación': 'utensils',
    'Transporte': 'car',
    'Ropa & Cuidado Personal': 'shirt',
    'Salud & Deporte': 'heart-pulse',
    'Mascotas': 'paw-print',
    'Hogar': 'house',
    'Educación': 'graduation-cap',
    'Tecnología': 'laptop',
    'Ocio & Vacaciones': 'plane',
    'Otros Gastos': 'package',
    'Contador & Gestiones': 'calculator',
    'Pensión Giordano': 'gift',
    'Ingresos Extra': 'coins',
    'Devolución de Préstamos': 'arrow-left-right',
    'Ahorro General': 'piggy-bank',
    'Salario': 'briefcase',
    'Bonos': 'award'
}

db = SessionLocal()

# Actualizar iconos
for category_name, icon_name in category_icon_mapping.items():
    category = db.query(Category).filter_by(name=category_name, is_active=True).first()
    if category:
        category.icon = icon_name
        print(f"✓ Actualizado: {category_name} → {icon_name}")
    else:
        print(f"✗ No encontrado: {category_name}")

db.commit()
db.close()
print(f"\n¡Iconos actualizados! Total: {len(category_icon_mapping)}")
