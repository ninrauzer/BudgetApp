"""
Create quick_templates table
"""
import sqlite3
from pathlib import Path

# Database path
db_path = Path(__file__).parent.parent / "budget.db"

def migrate():
    """Create quick_templates table"""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        print("Creating quick_templates table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quick_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                description VARCHAR NOT NULL,
                amount FLOAT NOT NULL,
                type VARCHAR NOT NULL DEFAULT 'expense',
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        """)
        conn.commit()
        print("✓ quick_templates table created successfully")
        
        # Insert default templates
        print("Inserting default templates...")
        
        # Get category IDs
        cursor.execute("SELECT id, name FROM categories")
        categories = {name: id for id, name in cursor.fetchall()}
        
        default_templates = [
            ("Almuerzo", "Almuerzo", 25.0, "expense", categories.get("Alimentación", 1)),
            ("Transporte", "Transporte público", 15.0, "expense", categories.get("Transporte", 2)),
            ("Café", "Café", 8.0, "expense", categories.get("Alimentación", 1)),
            ("Mercado", "Compras de mercado", 100.0, "expense", categories.get("Alimentación", 1)),
        ]
        
        cursor.executemany("""
            INSERT INTO quick_templates (name, description, amount, type, category_id)
            VALUES (?, ?, ?, ?, ?)
        """, default_templates)
        
        conn.commit()
        print(f"✓ {len(default_templates)} default templates inserted")
        
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting quick_templates migration...")
    migrate()
    print("Migration completed!")
