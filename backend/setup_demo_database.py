"""
Demo Database Setup Script
Creates and populates budgetapp_demo database in Neon PostgreSQL
"""
import os
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import random

# Demo database connection
DEMO_DATABASE_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_demo?sslmode=require"

print("🔧 Conectando a Neon PostgreSQL (budgetapp_demo)...")
engine = create_engine(DEMO_DATABASE_URL)

# Datos ficticios para demo
DEMO_CATEGORIES = [
    {"name": "Salario", "icon": "Briefcase", "type": "income", "color": "#10B981"},
    {"name": "Freelance", "icon": "Laptop", "type": "income", "color": "#34D399"},
    {"name": "Supermercado", "icon": "ShoppingCart", "type": "expense", "color": "#EF4444", "expense_type": "variable"},
    {"name": "Restaurantes", "icon": "UtensilsCrossed", "type": "expense", "color": "#F97316", "expense_type": "variable"},
    {"name": "Transporte", "icon": "Car", "type": "expense", "color": "#F59E0B", "expense_type": "variable"},
    {"name": "Alquiler", "icon": "Home", "type": "expense", "color": "#DC2626", "expense_type": "fixed"},
    {"name": "Servicios", "icon": "Zap", "type": "expense", "color": "#7C3AED", "expense_type": "fixed"},
    {"name": "Entretenimiento", "icon": "Tv", "type": "expense", "color": "#EC4899", "expense_type": "variable"},
    {"name": "Salud", "icon": "Heart", "type": "expense", "color": "#EF4444", "expense_type": "variable"},
    {"name": "Educación", "icon": "GraduationCap", "type": "expense", "color": "#3B82F6", "expense_type": "variable"},
]

DEMO_ACCOUNTS = [
    {"name": "Efectivo", "type": "cash", "balance": 1500.00, "currency": "PEN"},
    {"name": "Banco Nacional", "type": "bank", "balance": 8500.00, "currency": "PEN"},
    {"name": "Ahorros USD", "type": "savings", "balance": 2000.00, "currency": "USD"},
]

def create_demo_tables(conn):
    """Crear todas las tablas necesarias"""
    print("📋 Creando tablas...")
    
    # Users
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            picture VARCHAR(500),
            provider VARCHAR(50) NOT NULL,
            provider_id VARCHAR(255) UNIQUE NOT NULL,
            is_demo BOOLEAN DEFAULT FALSE,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """))
    
    # Allowed users (whitelist)
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS allowed_users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            added_by VARCHAR(255)
        )
    """))
    
    # Categories
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            icon VARCHAR(50),
            type VARCHAR(20) NOT NULL,
            color VARCHAR(20),
            expense_type VARCHAR(20),
            display_order INTEGER DEFAULT 0
        )
    """))
    
    # Accounts
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            balance DECIMAL(15, 2) DEFAULT 0,
            currency VARCHAR(10) DEFAULT 'PEN',
            is_default BOOLEAN DEFAULT FALSE
        )
    """))
    
    # Transactions
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            description VARCHAR(500) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            type VARCHAR(20) NOT NULL,
            category_id INTEGER REFERENCES categories(id),
            account_id INTEGER REFERENCES accounts(id),
            transaction_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    # Billing cycles
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS billing_cycle (
            id SERIAL PRIMARY KEY,
            start_date DATE NOT NULL UNIQUE,
            end_date DATE NOT NULL,
            start_day INTEGER DEFAULT 23
        )
    """))
    
    conn.commit()
    print("✅ Tablas creadas")

def seed_demo_data(conn):
    """Popular base de datos con datos ficticios"""
    print("🌱 Insertando datos demo...")
    
    # 1. Usuario demo
    conn.execute(text("""
        INSERT INTO users (email, name, picture, provider, provider_id, is_demo, is_admin)
        VALUES ('demo@budgetapp.local', 'Usuario Demo', '', 'demo', 'demo', TRUE, FALSE)
        ON CONFLICT (email) DO NOTHING
    """))
    
    # 2. Categorías
    for cat in DEMO_CATEGORIES:
        conn.execute(text("""
            INSERT INTO categories (name, icon, type, color, expense_type)
            VALUES (:name, :icon, :type, :color, :expense_type)
            ON CONFLICT DO NOTHING
        """), cat)
    
    # 3. Cuentas
    for acc in DEMO_ACCOUNTS:
        conn.execute(text("""
            INSERT INTO accounts (name, type, balance, currency)
            VALUES (:name, :type, :balance, :currency)
        """), acc)
    
    # 4. Ciclos de facturación (últimos 3 meses)
    today = datetime.now()
    for i in range(3):
        cycle_start = datetime(today.year, today.month - i, 23)
        if cycle_start.month == 12:
            cycle_end = datetime(cycle_start.year + 1, 1, 22)
        else:
            cycle_end = datetime(cycle_start.year, cycle_start.month + 1, 22)
        
        conn.execute(text("""
            INSERT INTO billing_cycle (start_date, end_date, start_day)
            VALUES (:start_date, :end_date, 23)
            ON CONFLICT (start_date) DO NOTHING
        """), {"start_date": cycle_start.date(), "end_date": cycle_end.date()})
    
    # 5. Transacciones ficticias (50 transacciones en los últimos 3 meses)
    categories = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  # IDs de categorías
    accounts = [1, 2, 3]  # IDs de cuentas
    
    transactions = []
    for i in range(50):
        days_ago = random.randint(0, 90)
        trans_date = (today - timedelta(days=days_ago)).date()
        
        cat_id = random.choice(categories)
        trans_type = "income" if cat_id <= 2 else "expense"
        
        if trans_type == "income":
            amount = random.uniform(1000, 5000)
        else:
            amount = random.uniform(20, 500)
        
        descriptions = {
            "income": ["Pago mensual", "Proyecto freelance", "Bono", "Ingreso extra"],
            "expense": ["Compra en supermercado", "Almuerzo", "Taxi", "Netflix", 
                       "Luz", "Agua", "Internet", "Compras varias", "Medicinas"]
        }
        
        desc = random.choice(descriptions[trans_type])
        
        transactions.append({
            "description": desc,
            "amount": round(amount, 2),
            "type": trans_type,
            "category_id": cat_id,
            "account_id": random.choice(accounts),
            "transaction_date": trans_date
        })
    
    for trans in transactions:
        conn.execute(text("""
            INSERT INTO transactions (description, amount, type, category_id, account_id, transaction_date)
            VALUES (:description, :amount, :type, :category_id, :account_id, :transaction_date)
        """), trans)
    
    conn.commit()
    print(f"✅ {len(transactions)} transacciones demo creadas")

def reset_demo_database():
    """Resetear y repopular base de datos demo"""
    with engine.connect() as conn:
        print("🗑️  Limpiando base de datos demo...")
        
        # Drop all tables
        conn.execute(text("DROP TABLE IF EXISTS transactions CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS billing_cycle CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS accounts CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS categories CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS allowed_users CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        conn.commit()
        
        # Recreate and seed
        create_demo_tables(conn)
        seed_demo_data(conn)
        
        print("\n🎉 Base de datos demo lista!")
        print("   - 10 categorías")
        print("   - 3 cuentas")
        print("   - 50 transacciones")
        print("   - 3 ciclos de facturación")
        print("\n✅ Usuario demo puede acceder ahora de forma segura")

if __name__ == "__main__":
    reset_demo_database()
