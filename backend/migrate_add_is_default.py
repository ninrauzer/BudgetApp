from sqlalchemy import create_engine, text

# Apply migration to production database
engine = create_engine('postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod')
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE'))
    conn.commit()
    print('✅ Column is_default added to accounts table in budgetapp_prod')

# Apply migration to development database
engine_dev = create_engine('postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev')
with engine_dev.connect() as conn:
    conn.execute(text('ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE'))
    conn.commit()
    print('✅ Column is_default added to accounts table in budgetapp_dev')
