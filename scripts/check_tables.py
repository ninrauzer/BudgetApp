#!/usr/bin/env python
from sqlalchemy import create_engine, inspect

DATABASE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

print("\nTABLAS EN budgetapp_dev:")
print("="*50)
for table_name in inspector.get_table_names():
    print(f"\n{table_name}:")
    columns = inspector.get_columns(table_name)
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")

# Also check budgetapp_prod
print("\n\n" + "="*50)
print("TABLAS EN budgetapp_prod:")
print("="*50)

DATABASE_URL_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
engine_prod = create_engine(DATABASE_URL_PROD)
inspector_prod = inspect(engine_prod)

for table_name in inspector_prod.get_table_names():
    print(f"\n{table_name}:")
    columns = inspector_prod.get_columns(table_name)
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")
