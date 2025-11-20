import sys, json

data = json.load(sys.stdin)
print(f"Ciclo: {data['cycle_name']}")
print(f"Fechas: {data['start_date']} a {data['end_date']}")
print(f"Monto: {data['amount']}")
