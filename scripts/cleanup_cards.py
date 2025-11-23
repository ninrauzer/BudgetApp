"""
Script para limpiar tarjetas duplicadas y verificar datos
"""
import requests

BASE_URL = "http://192.168.126.127:8000/api"

def list_cards():
    """Listar todas las tarjetas"""
    response = requests.get(f"{BASE_URL}/credit-cards/")
    if response.status_code == 200:
        return response.json()
    return []

def delete_card(card_id):
    """Eliminar una tarjeta"""
    response = requests.delete(f"{BASE_URL}/credit-cards/{card_id}/")
    return response.status_code in [200, 204]

def get_card_summary(card_id):
    """Obtener resumen de tarjeta con cuotas"""
    response = requests.get(f"{BASE_URL}/credit-cards/{card_id}/")
    if response.status_code == 200:
        return response.json()
    return None

def main():
    print("🔍 Listando tarjetas...")
    cards = list_cards()
    
    print(f"\n📋 Tarjetas encontradas: {len(cards)}")
    for card in cards:
        print(f"\n   ID: {card['id']}")
        print(f"   Nombre: {card['name']}")
        print(f"   Banco: {card['bank']}")
        print(f"   Límite: S/ {float(card['credit_limit']):,.2f}")
        
        # Obtener resumen con cuotas
        summary = get_card_summary(card['id'])
        if summary:
            installments = summary.get('installments', [])
            print(f"   Cuotas activas: {len(installments)}")
            if installments:
                for inst in installments:
                    print(f"      - {inst['concept']}: {inst['current_installment']}/{inst['total_installments']}")
    
    if len(cards) > 1:
        print("\n⚠️  Detectadas tarjetas duplicadas")
        print("\n¿Desea eliminar las tarjetas vacías? (ids sin cuotas)")
        
        # Eliminar tarjetas sin cuotas (IDs 1 y 2)
        for card in cards:
            summary = get_card_summary(card['id'])
            if summary and len(summary.get('installments', [])) == 0:
                print(f"\n🗑️  Eliminando tarjeta ID {card['id']} (sin cuotas)...")
                if delete_card(card['id']):
                    print(f"   ✅ Eliminada")
                else:
                    print(f"   ❌ Error al eliminar")
        
        print("\n✅ Limpieza completada")
        
        # Listar de nuevo
        print("\n📋 Tarjetas restantes:")
        cards = list_cards()
        for card in cards:
            summary = get_card_summary(card['id'])
            installments = summary.get('installments', []) if summary else []
            print(f"   ID {card['id']}: {card['name']} ({len(installments)} cuotas)")

if __name__ == "__main__":
    main()
