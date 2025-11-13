import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.db.database import SessionLocal
from app.models.category import Category

# Mapeo COMPLETO de todas las categorías a iconos de Lucide
category_icon_mapping = {
    # GASTOS (expense)
    'Alimentación': 'utensils',
    'Alquiler': 'home',
    'Arreglos Casa': 'wrench',
    'Cuidado Personal': 'sparkles',
    'Deporte': 'dumbbell',
    'Contador & Gestiones': 'calculator',
    'Educación': 'graduation-cap',
    'Entretenimiento': 'film',
    'Mascotas': 'paw-print',
    'Ocio & Vacaciones': 'plane',
    'Otros Gastos': 'package',
    'Pensión Giordano': 'gift',
    'Propinas': 'hand-coins',
    'Préstamos Bancarios': 'landmark',
    'Ropa': 'shirt',
    'Salud': 'heart-pulse',
    'Servicios & Streaming': 'tv',
    'Tarjeta de Crédito': 'credit-card',
    'Tecnología': 'laptop',
    'Telefonía e Internet': 'smartphone',
    'Transporte': 'car',
    
    # INGRESOS (income)
    'Devolución de Préstamos': 'arrow-left-right',
    'Freelance': 'briefcase',
    'Ingresos Extras': 'coins',
    'Inversiones': 'trending-up',
    'Salario': 'wallet',
    
    # AHORROS (saving)
    'Ahorros': 'piggy-bank',
    'Fondo de Emergencia': 'shield',
    'Inversión': 'gem',
    'Metas Específicas': 'target'
}

db = SessionLocal()

print("\n" + "="*60)
print("ACTUALIZANDO ICONOS DE CATEGORÍAS")
print("="*60 + "\n")

updated = 0
not_found = 0

# Actualizar iconos
for category_name, icon_name in category_icon_mapping.items():
    category = db.query(Category).filter_by(name=category_name, is_active=True).first()
    if category:
        old_icon = category.icon
        category.icon = icon_name
        print(f"✓ {category_name:30} | {old_icon:10} → {icon_name}")
        updated += 1
    else:
        print(f"✗ {category_name:30} | NO ENCONTRADA")
        not_found += 1

db.commit()
db.close()

print("\n" + "="*60)
print(f"Resultado: {updated} actualizadas, {not_found} no encontradas")
print("="*60 + "\n")
