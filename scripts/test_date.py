#!/usr/bin/env python3
"""
Test para verificar cómo el backend maneja las fechas de transacciones.
"""

import requests
import json
from datetime import date

# Endpoint del backend
url = "http://localhost:8000/api/transactions"

# Payload de prueba - grabando con fecha 22/11/2025
payload = {
    "date": "2025-11-22",  # String ISO format
    "category_id": 2,       # Cuidado Personal (expense)
    "account_id": 1,        # BCP
    "amount": 100.0,
    "currency": "PEN",
    "type": "expense",
    "description": "Test transaction with date 2025-11-22",
    "notes": "Testing timezone handling",
    "status": "completed"
}

print("=" * 60)
print("ENVIANDO TRANSACCIÓN AL BACKEND")
print("=" * 60)
print(f"\nPayload enviado:")
print(json.dumps(payload, indent=2))
print(f"\nFecha enviada: {payload['date']}")
print(f"Tipo de fecha: {type(payload['date'])}")

try:
    response = requests.post(url, json=payload)
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"\n✅ ÉXITO - Transacción creada")
        print(f"\nFecha guardada en DB: {data.get('date')}")
        print(f"ID: {data.get('id')}")
        print(f"\nRespuesta completa:")
        print(json.dumps(data, indent=2))
    else:
        print(f"\n❌ ERROR")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"\n❌ Error de conexión: {e}")
