"""
Script para crear tarjeta BBVA Visa Signature con datos reales del estado de cuenta.
Basado en las imágenes del EECC en docs/EECC/
"""
import requests
import json
from datetime import datetime

# API Base URL
BASE_URL = "http://192.168.126.127:8000/api"

def create_credit_card():
    """Crear tarjeta BBVA Visa Signature"""
    card_data = {
        "name": "BBVA Visa Signature",
        "bank": "BBVA",
        "credit_limit": 13000.00,  # Línea de crédito
        "statement_close_day": 10,  # Día de corte
        "payment_due_day": 5,       # Día de pago (siguiente mes)
        "tea_revolvente": 44.99     # TEA revolvente típica de BBVA
    }
    
    print("🏦 Creando tarjeta de crédito...")
    print(f"   Nombre: {card_data['name']}")
    print(f"   Banco: {card_data['bank']}")
    print(f"   Límite: S/ {card_data['credit_limit']:,.2f}")
    print(f"   Día de corte: {card_data['statement_close_day']}")
    print(f"   Día de pago: {card_data['payment_due_day']}")
    
    response = requests.post(f"{BASE_URL}/credit-cards/", json=card_data)
    
    if response.status_code in [200, 201]:
        card = response.json()
        print(f"✅ Tarjeta creada exitosamente! ID: {card['id']}")
        return card
    else:
        print(f"❌ Error al crear tarjeta: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return None

def create_installments(card_id):
    """Crear cuotas basadas en las imágenes del estado de cuenta"""
    
    # Cuotas extraídas de las imágenes del EECC
    installments = [
        {
            "concept": "BM FERRETERIA",
            "original_amount": 14610.00,
            "total_installments": 6,
            "current_installment": 4,
            "monthly_payment": 2435.00,
            "interest_rate": 17.63,
            "purchase_date": "2024-07-15"  # Estimado (cuota 4 de 6)
        },
        {
            "concept": "HINDU ANANDA",
            "original_amount": 1200.00,
            "total_installments": 12,
            "current_installment": 8,
            "monthly_payment": 100.00,
            "interest_rate": 35.99,
            "purchase_date": "2024-03-15"  # Estimado (cuota 8 de 12)
        },
        {
            "concept": "STORE RETAIL",
            "original_amount": 899.00,
            "total_installments": 12,
            "current_installment": 5,
            "monthly_payment": 74.92,
            "interest_rate": 35.99,
            "purchase_date": "2024-06-15"  # Estimado (cuota 5 de 12)
        },
        {
            "concept": "NETFLIX",
            "original_amount": 539.88,
            "total_installments": 12,
            "current_installment": 1,
            "monthly_payment": 44.99,
            "interest_rate": 0.00,  # Sin intereses
            "purchase_date": "2024-10-15"  # Estimado (cuota 1 de 12)
        }
    ]
    
    print(f"\n💳 Agregando {len(installments)} cuotas a la tarjeta...")
    
    created_count = 0
    for inst_data in installments:
        # Calcular capital restante
        remaining_installments = inst_data["total_installments"] - inst_data["current_installment"] + 1
        remaining_capital = inst_data["monthly_payment"] * remaining_installments
        
        payload = {
            "credit_card_id": card_id,
            "concept": inst_data["concept"],
            "original_amount": inst_data["original_amount"],
            "total_installments": inst_data["total_installments"],
            "current_installment": inst_data["current_installment"],
            "monthly_payment": inst_data["monthly_payment"],
            "interest_rate": inst_data["interest_rate"],
            "purchase_date": inst_data["purchase_date"]
        }
        
        print(f"   📝 {inst_data['concept']}: Cuota {inst_data['current_installment']}/{inst_data['total_installments']} - S/ {inst_data['monthly_payment']}/mes")
        
        response = requests.post(f"{BASE_URL}/credit-cards/{card_id}/installments/", json=payload)
        
        if response.status_code in [200, 201]:
            created_count += 1
            print(f"      ✅ Cuota agregada")
        else:
            print(f"      ❌ Error: {response.status_code} - {response.text}")
    
    print(f"\n✨ Total cuotas creadas: {created_count}/{len(installments)}")

def main():
    print("=" * 60)
    print("🎯 CREACIÓN DE TARJETA BBVA VISA SIGNATURE")
    print("=" * 60)
    print()
    
    # Crear tarjeta
    card = create_credit_card()
    
    if card:
        # Crear cuotas
        create_installments(card['id'])
        
        print("\n" + "=" * 60)
        print("🎉 ¡Proceso completado!")
        print("=" * 60)
        print(f"\n📊 Accede a: http://192.168.126.127:8080/credit-cards")
        print(f"   Para ver tu tarjeta y todas las cuotas activas")
    else:
        print("\n❌ No se pudo completar el proceso")

if __name__ == "__main__":
    main()
