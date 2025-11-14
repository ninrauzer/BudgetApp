import requests

r = requests.get('http://localhost:8000/health')
print(f'Status: {r.status_code}')
data = r.json()
print(f'Version: {data["version"]}')
print(f'CORS Header: {r.headers.get("Access-Control-Allow-Origin", "NOT PRESENT")}')

print('\nTesting dashboard endpoint:')
r2 = requests.get('http://localhost:8000/api/dashboard/summary?year=2025&month=11')
print(f'Status: {r2.status_code}')
print(f'CORS Header: {r2.headers.get("Access-Control-Allow-Origin", "NOT PRESENT")}')
data2 = r2.json()
print(f'Total Income: {data2.get("total_income_actual", 0)}')
print(f'Total Expense: {data2.get("total_expense_actual", 0)}')
