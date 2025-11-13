"""
Script para crear categorías simplificadas en la base de datos.
Reemplaza las 33 categorías del Excel por 18 categorías más manejables.
"""
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.db.database import SessionLocal
from app.models.category import Category

def create_simplified_categories():
    """Crear categorías simplificadas organizadas"""
    
    db = SessionLocal()
    
    try:
        # Definir categorías simplificadas
        categories = [
            # GASTOS (Expense)
            {"name": "Alquiler", "type": "expense", "icon": "🏠", "color": "#dc2626"},
            {"name": "Telefonía e Internet", "type": "expense", "icon": "📱", "color": "#dc2626"},
            {"name": "Servicios & Streaming", "type": "expense", "icon": "⚡", "color": "#dc2626"},
            {"name": "Préstamos Bancarios", "type": "expense", "icon": "🏦", "color": "#dc2626"},
            {"name": "Tarjeta de Crédito", "type": "expense", "icon": "💳", "color": "#dc2626"},
            {"name": "Alimentación", "type": "expense", "icon": "🍔", "color": "#dc2626"},
            {"name": "Transporte", "type": "expense", "icon": "🚕", "color": "#dc2626"},
            {"name": "Ropa & Cuidado Personal", "type": "expense", "icon": "👕", "color": "#dc2626"},
            {"name": "Salud & Deporte", "type": "expense", "icon": "🏋️", "color": "#dc2626"},
            {"name": "Mascotas", "type": "expense", "icon": "🐕", "color": "#dc2626"},
            {"name": "Hogar", "type": "expense", "icon": "🧺", "color": "#dc2626"},
            {"name": "Educación", "type": "expense", "icon": "📚", "color": "#dc2626"},
            {"name": "Tecnología", "type": "expense", "icon": "💻", "color": "#dc2626"},
            {"name": "Ocio & Vacaciones", "type": "expense", "icon": "🎉", "color": "#dc2626"},
            {"name": "Otros Gastos", "type": "expense", "icon": "🎁", "color": "#dc2626"},
            {"name": "Contador & Gestiones", "type": "expense", "icon": "📊", "color": "#dc2626"},
            {"name": "Pensión Giordano", "type": "expense", "icon": "🏫", "color": "#dc2626"},
            
            # INGRESOS (Income)
            {"name": "Salario", "type": "income", "icon": "💰", "color": "#059669"},
            {"name": "Ingresos Extra", "type": "income", "icon": "💼", "color": "#059669"},
            {"name": "Devolución de Préstamos", "type": "income", "icon": "🔄", "color": "#059669"},
            
            # AHORROS (Saving)
            {"name": "Ahorro General", "type": "saving", "icon": "🏦", "color": "#2563eb"},
            {"name": "Fondo de Emergencia", "type": "saving", "icon": "🎯", "color": "#2563eb"},
        ]
        
        print("=" * 60)
        print("CREANDO CATEGORÍAS SIMPLIFICADAS")
        print("=" * 60)
        
        created_count = 0
        skipped_count = 0
        
        for cat_data in categories:
            # Verificar si ya existe
            existing = db.query(Category).filter(
                Category.name == cat_data["name"],
                Category.type == cat_data["type"]
            ).first()
            
            if existing:
                print(f"⏭️  Ya existe: {cat_data['name']} ({cat_data['type']})")
                skipped_count += 1
                continue
            
            # Crear nueva categoría
            new_category = Category(
                name=cat_data["name"],
                type=cat_data["type"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_active=True
            )
            db.add(new_category)
            created_count += 1
            print(f"✅ Creada: {cat_data['icon']} {cat_data['name']} ({cat_data['type']})")
        
        db.commit()
        
        print("\n" + "=" * 60)
        print("RESUMEN")
        print("=" * 60)
        print(f"✅ Categorías creadas: {created_count}")
        print(f"⏭️  Categorías omitidas (ya existían): {skipped_count}")
        print(f"📊 Total de categorías: {len(categories)}")
        
        # Mostrar estadísticas por tipo
        print("\nPOR TIPO:")
        expense_count = db.query(Category).filter(Category.type == "expense", Category.is_active == True).count()
        income_count = db.query(Category).filter(Category.type == "income", Category.is_active == True).count()
        saving_count = db.query(Category).filter(Category.type == "saving", Category.is_active == True).count()
        
        print(f"  💸 Gastos: {expense_count}")
        print(f"  💰 Ingresos: {income_count}")
        print(f"  🏦 Ahorros: {saving_count}")
        print(f"  📈 TOTAL ACTIVAS: {expense_count + income_count + saving_count}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🚀 Iniciando creación de categorías simplificadas...\n")
    success = create_simplified_categories()
    
    if success:
        print("\n✅ ¡Categorías creadas exitosamente!")
        print("\n💡 TIP: Las categorías antiguas NO fueron eliminadas.")
        print("   Puedes desactivarlas desde Settings → Categorías si no las necesitas.")
    else:
        print("\n❌ Hubo un error al crear las categorías.")
        sys.exit(1)
