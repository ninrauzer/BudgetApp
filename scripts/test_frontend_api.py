#!/usr/bin/env python3
"""
Test script to verify frontend API endpoints are working

This simulates what the frontend does when displaying Credit Cards page
"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("TESTING CREDIT CARDS API ENDPOINTS")
print("=" * 80)

# Test 1: List all credit cards
print("\n✓ Test 1: GET /api/credit-cards/ (list all cards)")
print("-" * 80)
response = requests.get(f"{BASE_URL}/api/credit-cards/")
print(f"Status: {response.status_code}")
cards = response.json()
print(f"Cards found: {len(cards)}")
for card in cards:
    print(f"  - {card['name']} ({card['bank']}) - ID: {card['id']}")

if not cards:
    print("  ❌ No cards found!")
    exit(1)

# Test 2: Get card summary (with installments)
print("\n✓ Test 2: GET /api/credit-cards/{card_id} (get summary with cuotas)")
print("-" * 80)
card_id = cards[0]['id']
response = requests.get(f"{BASE_URL}/api/credit-cards/{card_id}")
print(f"Status: {response.status_code}")

if response.status_code != 200:
    print(f"❌ Failed with status {response.status_code}")
    print(f"Response: {response.text}")
    exit(1)

summary = response.json()
print(f"Card: {summary['card']['name']}")
print(f"Credit Limit: S/ {summary['card']['credit_limit']}")
print(f"Current Balance: S/ {summary['card']['current_balance']}")
print(f"Available Credit: S/ {summary['card']['available_credit']}")

# Test 3: Check active installments
print(f"\nActive Installments: {len(summary['active_installments'])}")
print("-" * 80)

if len(summary['active_installments']) == 0:
    print("❌ No active installments found!")
    exit(1)

total_monthly = 0
for inst in summary['active_installments']:
    monthly = float(inst['monthly_payment'])
    total_monthly += monthly
    print(f"  • {inst['concept']}")
    print(f"    Cuota: {inst['current_installment']}/{inst['total_installments']}")
    print(f"    Monto Mensual: S/ {inst['monthly_payment']}")
    print(f"    Restante: S/ {inst['remaining_capital']}")
    print(f"    TEA: {inst['interest_rate']}%")
    print()

print(f"Total Monthly Commitment: S/ {summary['total_monthly_installments']}")
print(f"Verified Total: S/ {total_monthly}")

if abs(total_monthly - float(summary['total_monthly_installments'])) < 0.01:
    print("✅ Totals match!")
else:
    print("❌ Totals don't match!")
    exit(1)

print("\n" + "=" * 80)
print("✅ ALL TESTS PASSED - API IS WORKING CORRECTLY")
print("=" * 80)
print(f"\nFrontend should display:")
print(f"  - Card: {summary['card']['name']}")
print(f"  - {len(summary['active_installments'])} active installments")
print(f"  - Total monthly commitment: S/ {summary['total_monthly_installments']}")
