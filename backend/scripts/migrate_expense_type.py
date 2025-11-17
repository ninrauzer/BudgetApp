"""
Migración manual: Agregar columna expense_type a categories
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import engine, SessionLocal
from sqlalchemy import text

def migrate():
    """Add expense_type column to categories table."""
    
    print("🔧 Iniciando migración: add_expense_type_to_categories")
    
    with engine.connect() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("PRAGMA table_info(categories)"))
            columns = [row[1] for row in result]
            
            if 'expense_type' in columns:
                print("✅ Columna 'expense_type' ya existe, saltando migración")
                return
            
            # Add column
            print("📝 Agregando columna 'expense_type' a tabla 'categories'...")
            conn.execute(text("ALTER TABLE categories ADD COLUMN expense_type VARCHAR(20)"))
            conn.commit()
            
            print("✅ Columna agregada exitosamente")
            
            # Set default values for existing categories
            print("📝 Configurando valores por defecto...")
            db = SessionLocal()
            
            try:
                # Common fixed expense categories
                fixed_categories = [
                    'Alquiler', 'Vivienda', 'Servicios', 'Internet', 'Teléfono',
                    'Suscripciones', 'Seguros', 'Préstamos', 'Cuotas'
                ]
                
                for cat_name in fixed_categories:
                    db.execute(
                        text("UPDATE categories SET expense_type = 'fixed' WHERE type = 'expense' AND name LIKE :name"),
                        {"name": f"%{cat_name}%"}
                    )
                
                # Set remaining expenses as variable
                db.execute(
                    text("UPDATE categories SET expense_type = 'variable' WHERE type = 'expense' AND expense_type IS NULL")
                )
                
                db.commit()
                print("✅ Valores por defecto configurados")
                
            finally:
                db.close()
            
            print("🎉 Migración completada exitosamente")
            
        except Exception as e:
            print(f"❌ Error durante la migración: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    migrate()
