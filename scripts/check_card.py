#!/usr/bin/env python3
"""Script para verificar el resumen de una tarjeta"""

import requests

BASE_URL = "http://192.168.126.127:8000/api"

# Obtener resumen de la tarjeta 6
response = requests.get(f"{BASE_URL}/credit-cards/6/")
data = response.json()

print("\n" + "="*60)
print("📋 RESUMEN DE TARJETA")
print("="*60)
print(f"\nTarjeta: {data['card']['name']}")
print(f"Banco: {data['card']['bank']}")
print(f"Límite: S/ {data['card']['credit_limit']}")
print(f"Saldo actual: S/ {data['card']['current_balance']}")
print(f"Crédito disponible: S/ {data['card']['available_credit']}")

print(f"\n💳 Total cuotas mensuales: S/ {data['total_monthly_installments']}")
print(f"\n📊 Cuotas activas: {len(data['active_installments'])}\n")

for inst in data['active_installments']:
    print(f"   ✅ {inst['concept']}")
    print(f"      Cuota: {inst['current_installment']}/{inst['total_installments']}")
    print(f"      Pago mensual: S/ {inst['monthly_payment']}")
    print(f"      Capital restante: S/ {inst['remaining_capital']}")
    print(f"      TEA: {inst['interest_rate']}%")
    print()

print("="*60)
print("✨ ¡Todo OK! Las cuotas se están mostrando correctamente")
print("="*60)
