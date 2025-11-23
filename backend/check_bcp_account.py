from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod')

with engine.connect() as conn:
    # Get BCP account
    result = conn.execute(text("SELECT id, name, balance, is_default FROM accounts WHERE name LIKE '%BCP%'"))
    accounts = result.fetchall()
    
    print('🏦 Cuentas BCP:')
    for a in accounts:
        print(f'  ID: {a[0]}, Nombre: {a[1]}, Balance Inicial: S/ {a[2]:.2f}, Default: {a[3]}')
    
    if accounts:
        bcp_id = accounts[0][0]
        
        # Get transactions for BCP account
        result = conn.execute(text(f"SELECT COUNT(*), type, SUM(amount) FROM transactions WHERE account_id = {bcp_id} GROUP BY type"))
        txs = result.fetchall()
        
        print(f'\n💰 Transacciones vinculadas a cuenta ID {bcp_id}:')
        if txs:
            for t in txs:
                print(f'  {t[0]} transacciones {t[1]}: S/ {t[2]:.2f}')
        else:
            print('  ⚠️ NO HAY TRANSACCIONES VINCULADAS A ESTA CUENTA')
        
        # Check total transactions
        result = conn.execute(text("SELECT COUNT(*) FROM transactions"))
        total = result.fetchone()[0]
        print(f'\n📊 Total de transacciones en la BD: {total}')
        
        # Check transactions without account
        result = conn.execute(text("SELECT COUNT(*) FROM transactions WHERE account_id IS NULL"))
        no_account = result.fetchone()[0]
        print(f'⚠️  Transacciones sin cuenta asignada: {no_account}')
