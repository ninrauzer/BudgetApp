import sqlite3

conn = sqlite3.connect('budget.db')
cursor = conn.cursor()

# Ver columnas de transactions
cursor.execute("PRAGMA table_info(transactions)")
columns = cursor.fetchall()
print("Columnas actuales en 'transactions':")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

# Agregar columnas faltantes si no existen
columns_names = [col[1] for col in columns]

if 'transaction_type' not in columns_names:
    print("\n✓ Agregando columna 'transaction_type'...")
    cursor.execute("ALTER TABLE transactions ADD COLUMN transaction_type VARCHAR")
    conn.commit()

# Crear tabla billing_cycles si no existe
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='billing_cycles'")
if not cursor.fetchone():
    print("\n✓ Creando tabla 'billing_cycles'...")
    cursor.execute("""
        CREATE TABLE billing_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR,
            start_day INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Insertar ciclo por defecto (día 23)
    cursor.execute("INSERT INTO billing_cycles (name, start_day, is_active) VALUES ('Ciclo Principal', 23, 1)")
    conn.commit()

# Crear tablas de credit cards si no existen
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='credit_cards'")
if not cursor.fetchone():
    print("\n✓ Creando tablas de tarjetas de crédito...")
    cursor.execute("""
        CREATE TABLE credit_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR NOT NULL,
            bank VARCHAR,
            card_number_last4 VARCHAR(4),
            credit_limit DECIMAL(15,2) NOT NULL,
            current_balance DECIMAL(15,2) DEFAULT 0,
            available_credit DECIMAL(15,2),
            cutoff_day INTEGER,
            payment_due_day INTEGER,
            is_active BOOLEAN DEFAULT 1,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE credit_card_statements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            credit_card_id INTEGER NOT NULL,
            statement_date DATE NOT NULL,
            due_date DATE NOT NULL,
            total_amount DECIMAL(15,2) NOT NULL,
            minimum_payment DECIMAL(15,2),
            is_paid BOOLEAN DEFAULT 0,
            payment_date DATE,
            pdf_path VARCHAR,
            pdf_text TEXT,
            ai_parsed BOOLEAN DEFAULT 0,
            ai_parse_date DATETIME,
            ai_confidence FLOAT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE credit_card_installments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            credit_card_id INTEGER NOT NULL,
            concept VARCHAR NOT NULL,
            original_amount DECIMAL(15,2) NOT NULL,
            total_installments INTEGER NOT NULL,
            current_installment INTEGER NOT NULL DEFAULT 1,
            monthly_payment DECIMAL(15,2) NOT NULL,
            monthly_principal DECIMAL(15,2),
            monthly_interest DECIMAL(15,2),
            interest_rate FLOAT,
            start_date DATE,
            is_active BOOLEAN DEFAULT 1,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()

print("\n✓ Migración completada exitosamente")
conn.close()
