#!/usr/bin/env python3
"""
Verify that we're connected to budgetapp_dev database
and that it has the credit card data
"""

import subprocess
import json

# Connect to budgetapp_dev and query credit cards
print("=" * 80)
print("VERIFICANDO CONEXIÓN A budgetapp_dev")
print("=" * 80)

# Using psql via WSL
psql_cmd = """
psql -h 192.168.126.127 -U postgres -d budgetapp_dev -c "
SELECT 
    id,
    name,
    bank,
    credit_limit,
    current_balance,
    is_active
FROM credit_cards
ORDER BY id DESC;"
"""

print("\nConectando a: postgresql://postgres@192.168.126.127:5432/budgetapp_dev")
print("Ejecutando query...\n")

result = subprocess.run(psql_cmd, shell=True, capture_output=True, text=True)

if result.returncode == 0:
    print(result.stdout)
    print("\n✅ ÉXITO: Estamos conectados a budgetapp_dev")
    
    # Now get installments
    print("\n" + "=" * 80)
    print("VERIFICANDO CUOTAS EN budgetapp_dev")
    print("=" * 80)
    
    psql_cmd2 = """
psql -h 192.168.126.127 -U postgres -d budgetapp_dev -c "
SELECT 
    id,
    credit_card_id,
    concept,
    monthly_payment,
    current_installment,
    total_installments,
    is_active
FROM credit_card_installments
ORDER BY id;"
"""
    
    result2 = subprocess.run(psql_cmd2, shell=True, capture_output=True, text=True)
    if result2.returncode == 0:
        print(result2.stdout)
        print("\n✅ ÉXITO: Cuotas encontradas en budgetapp_dev")
    else:
        print(f"❌ ERROR: {result2.stderr}")
else:
    print(f"❌ ERROR: {result.stderr}")
    print("\nVerifica que:")
    print("1. PostgreSQL esté corriendo en WSL2 (192.168.126.127:5432)")
    print("2. La base de datos 'budgetapp_dev' exista")
    print("3. El usuario 'postgres' tenga permisos")

print("\n" + "=" * 80)
