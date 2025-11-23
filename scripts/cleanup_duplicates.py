#!/usr/bin/env python3
"""Script para listar y limpiar tarjetas"""

import requests

BASE_URL = "http://192.168.126.127:8000/api"

# Listar tarjetas
response = requests.get(f"{BASE_URL}/credit-cards/")
cards = response.json()

print(f"\n📋 Tarjetas encontradas: {len(cards)}\n")

for card in cards:
    print(f"ID: {card['id']}")
    print(f"   Nombre: {card['name']}")
    print(f"   Banco: {card['bank']}")
    print(f"   Límite: S/ {card['credit_limit']}")
    print(f"   Saldo: S/ {card['current_balance']}")
    print()

# Eliminar todas menos la más reciente (ID mayor)
if len(cards) > 1:
    print("⚠️ Detectadas tarjetas duplicadas")
    print("\n🗑️ Eliminando tarjetas antiguas...\n")
    
    # Ordenar por ID y mantener solo la última
    cards_sorted = sorted(cards, key=lambda x: x['id'])
    
    for card in cards_sorted[:-1]:  # Todas menos la última
        print(f"   Eliminando ID {card['id']}...", end=" ")
        r = requests.delete(f"{BASE_URL}/credit-cards/{card['id']}")
        print("✅" if r.status_code == 204 else f"❌ {r.status_code}")

print("\n✅ Limpieza completada\n")
