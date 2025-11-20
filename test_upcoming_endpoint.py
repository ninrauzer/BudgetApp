"""
Test del endpoint /api/dashboard/upcoming-payments
"""
import sys
import os

# Agregar el backend a la ruta de búsqueda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.main import app
from starlette.testclient import TestClient

client = TestClient(app)

print("=" * 70)
print("🧪 Testing: GET /api/dashboard/upcoming-payments")
print("=" * 70)

try:
    response = client.get('/api/dashboard/upcoming-payments')
    
    print(f"\n📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Response:")
        print(f"   - Total Upcoming Payments: {data.get('total_amount')}")
        print(f"   - Count: {len(data.get('upcoming_payments', []))}")
        print(f"   - Current Available: {data.get('current_available')}")
        print(f"   - Has Deficit: {data.get('has_deficit')}")
        
        print("\n📋 Próximos Pagos:")
        for payment in data.get('upcoming_payments', []):
            print(f"   • {payment['entity']} - {payment['loan_name']}")
            print(f"     Amount: S/ {payment['amount']:.2f}")
            print(f"     Date: {payment['payment_date']}")
            print(f"     Days until due: {payment['days_until_due']}")
            print()
    else:
        print(f"\n❌ Error: {response.text}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")
    import traceback
    traceback.print_exc()

print("=" * 70)
