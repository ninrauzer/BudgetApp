import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'budget.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Update icons based on account type
cursor.execute('UPDATE accounts SET icon = "wallet" WHERE type = "cash"')
cursor.execute('UPDATE accounts SET icon = "landmark" WHERE type = "bank"')
cursor.execute('UPDATE accounts SET icon = "credit-card" WHERE type = "credit_card"')
cursor.execute('UPDATE accounts SET icon = "smartphone" WHERE type = "digital_wallet"')

conn.commit()

# Show updated accounts
cursor.execute('SELECT id, name, type, icon FROM accounts')
accounts = cursor.fetchall()
print('Cuentas actualizadas:')
for acc in accounts:
    print(f'  {acc[1]} ({acc[2]}): {acc[3]}')

conn.close()
print('\n✓ Iconos actualizados correctamente')
