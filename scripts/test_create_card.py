"""
Script simplificado para crear tarjeta BBVA con cuotas
"""
import requests
import json

BASE_URL = "http://192.168.126.127:8000/api"

print("=" * 60)
print("CREANDO TARJETA BBVA VISA SIGNATURE")
print("=" * 60)

# 1. Crear tarjeta
print("\n1️⃣ Creando tarjeta...")
card_data = {
    "name": "BBVA Visa Signature",
    "bank": "BBVA",
    "credit_limit": 13000.00,
    "statement_close_day": 10,
    "payment_due_day": 5,
    "tea_revolvente": 44.99
}

response = requests.post(f"{BASE_URL}/credit-cards/", json=card_data)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.text[:200]}")

if response.status_code not in [200, 201]:
    print("❌ Error creando tarjeta")
    exit(1)

card = response.json()
card_id = card['id']
print(f"✅ Tarjeta creada con ID: {card_id}")

# 2. Crear primera cuota
print("\n2️⃣ Creando cuota BM FERRETERIA...")
installment_data = {
    "credit_card_id": card_id,
    "concept": "BM FERRETERIA",
    "original_amount": 14610.00,
    "total_installments": 6,
    "current_installment": 4,
    "monthly_payment": 2435.00,
    "interest_rate": 17.63,
    "purchase_date": "2024-07-15"
}

url = f"{BASE_URL}/credit-cards/{card_id}/installments"
print(f"   URL: {url}")
print(f"   Payload: {json.dumps(installment_data, indent=2)}")

response = requests.post(url, json=installment_data)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.text[:500]}")

if response.status_code in [200, 201]:
    print("✅ Cuota creada")
else:
    print(f"❌ Error: {response.status_code}")
    print(f"   Detail: {response.text}")

# 3. Verificar cuotas
print("\n3️⃣ Verificando cuotas...")
response = requests.get(f"{BASE_URL}/credit-cards/{card_id}/installments")
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    installments = response.json()
    print(f"   Total cuotas: {len(installments)}")
    for inst in installments:
        print(f"      - {inst['concept']}: {inst['current_installment']}/{inst['total_installments']}")
else:
    print(f"   Error: {response.text}")

# 4. Ver resumen
print("\n4️⃣ Resumen de tarjeta...")
response = requests.get(f"{BASE_URL}/credit-cards/{card_id}/")
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    summary = response.json()
    print(f"   Cuotas activas: {len(summary.get('installments', []))}")
    print(f"   Saldo actual: S/ {summary.get('current_balance', 0)}")

print("\n" + "=" * 60)
print(f"✅ Accede a: http://192.168.126.127:8080/credit-cards")
print("=" * 60)
