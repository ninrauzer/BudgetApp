"""
Script to create accounts table in the database
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'budget.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Checking accounts table...")

# Check if table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'")
table_exists = cursor.fetchone() is not None

if table_exists:
    print("✓ accounts table already exists")
    
    # Check if icon column exists
    cursor.execute("PRAGMA table_info(accounts)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'icon' not in columns:
        print("Adding icon column...")
        cursor.execute('ALTER TABLE accounts ADD COLUMN icon VARCHAR DEFAULT "wallet"')
        conn.commit()
        print("✓ icon column added")
    else:
        print("✓ icon column already exists")
        
    if 'currency' not in columns:
        print("Adding currency column...")
        cursor.execute('ALTER TABLE accounts ADD COLUMN currency VARCHAR DEFAULT "PEN"')
        conn.commit()
        print("✓ currency column added")
    else:
        print("✓ currency column already exists")
else:
    print("Creating accounts table...")
    cursor.execute('''
    CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        icon VARCHAR DEFAULT 'wallet',
        balance REAL DEFAULT 0.0,
        currency VARCHAR DEFAULT 'PEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    print("✓ accounts table created successfully")

# Check if we need to insert default accounts
cursor.execute('SELECT COUNT(*) FROM accounts')
count = cursor.fetchone()[0]

if count > 0:
    print(f"\n✓ Database already has {count} accounts")
    # Show existing accounts
    cursor.execute('SELECT id, name, type, icon FROM accounts')
    accounts = cursor.fetchall()
    print("\nExisting accounts:")
    for acc in accounts:
        print(f"  ID: {acc[0]}, Name: {acc[1]}, Type: {acc[2]}, Icon: {acc[3]}")
    conn.close()
    exit(0)

# Insert default accounts
print("\nInserting default accounts...")

default_accounts = [
    ('Efectivo', 'cash', 'wallet'),
    ('Banco BCP', 'bank', 'landmark'),
    ('Tarjeta Visa', 'credit_card', 'credit-card'),
    ('Yape', 'digital_wallet', 'smartphone'),
]

for name, acc_type, icon in default_accounts:
    cursor.execute(
        'INSERT INTO accounts (name, type, icon, balance, currency) VALUES (?, ?, ?, 0.0, "PEN")',
        (name, acc_type, icon)
    )

conn.commit()
print(f"✓ {len(default_accounts)} default accounts inserted")

# Show created accounts
cursor.execute('SELECT id, name, type, icon FROM accounts')
accounts = cursor.fetchall()
print("\nAccounts in database:")
for acc in accounts:
    print(f"  ID: {acc[0]}, Name: {acc[1]}, Type: {acc[2]}, Icon: {acc[3]}")

conn.close()
print("\nMigration completed!")
