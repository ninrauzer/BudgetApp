#!/usr/bin/env python
"""
Script para agregar todas las 22 cuotas del EECC al sistema
La información fue extraída del PDF EECC_BBVA_Noviembre.pdf
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Load environment
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

DATABASE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

print("\n" + "="*100)
print("ACTUALIZANDO CUOTAS DESDE PDF")
print("="*100 + "\n")

# Data from PDF (22 active installments - "1 de N")
# Format: (date, description, amount, current_cuota, total_cuotas, tea_percent, interest_amount)
pdf_cuotas = [
    # Only including installments in their first month (1 de X) - these are the "active" ones
    # Actually, let's include ALL visible installments, not just the ones in month 1
    ("15/02/2025", "IZI*HOTEL EL MIRADOR F", 886.00, 9, 10, 54.99, 102.80),
    ("10/03/2025", "MFA195 LOS ROSALES SURCOF", 336.30, 8, 10, 54.99, 37.97),
    ("14/03/2025", "INSTITUTO SUPERIOR SAN IG", 890.00, 8, 10, 54.99, 99.99),
    ("26/05/2025", "MPSOLUCIONESINFOR", 214.00, 6, 6, 0.00, 35.70),
    ("10/06/2025", "MPRISINGDRAGON", 109.00, 5, 12, 0.00, 9.08),
    ("27/06/2025", "MPMANUFACTURASSAN", 177.42, 5, 6, 59.99, 31.73),
    ("04/08/2025", "MP *8PRODUCTOS", 98.00, 4, 6, 0.00, 16.33),
    ("04/08/2025", "MDOPAGO*MERCADO PAGO", 259.12, 4, 12, 0.00, 21.59),
    ("24/08/2025", "WONG LAS GARDENIAS DV F", 358.62, 3, 6, 59.99, 59.53),
    ("01/09/2025", "MFA628 HIGUERETA F", 172.60, 3, 3, 59.99, 60.19),
    ("09/09/2025", "MDOPAGO*MDOPAGO MERCADO P", 56.16, 3, 12, 0.00, 4.68),
    ("12/09/2025", "OPENPAY*TELETICKET", 258.00, 2, 6, 59.99, 41.80),
    ("15/09/2025", "INSTITUTO SUPERIOR SAN IG", 540.00, 2, 6, 59.99, 87.14),
    ("15/09/2025", "OPENPAY*ISIL", 540.00, 2, 6, 59.99, 87.14),
    ("28/09/2025", "DP *Falabellacom", 1295.60, 2, 18, 59.99, 53.53),
    ("30/09/2025", "DLC*HOTMART F", 1837.00, 2, 18, 59.99, 75.69),
    ("23/10/2025", "MDOPAGO*MERCADO PAGO", 285.84, 1, 6, 59.99, 39.02),  # NEW
    ("23/10/2025", "LIFE CAFE", 579.60, 1, 18, 59.99, 13.28),  # NEW
    ("23/10/2025", "WONG LAS GARDENIAS DV F", 334.60, 1, 6, 59.99, 45.67),  # NEW
    ("26/10/2025", "SKECHERS PERU F", 317.30, 1, 6, 59.99, 44.38),  # NEW
    ("27/10/2025", "MPEUROAMERICANMUS", 70.00, 1, 6, 0.00, 11.66),  # NEW
    ("28/10/2025", "108 PVEA AYACUCHO F", 185.34, 1, 3, 59.99, 58.14),  # NEW
]

print(f"Total de cuotas a procesar: {len(pdf_cuotas)}\n")

# Connect to database
engine = create_engine(DATABASE_URL)
print(f"✅ Conectado a la base de datos: {DATABASE_URL}")

from sqlalchemy import text

with engine.connect() as conn:
    # First, let's see what's already in the system
    print("\nCUOTAS ACTUALES EN EL SISTEMA:")
    result = conn.execute(text("""
        SELECT id, credit_card_id, name, total_cuotas, current_cuota, active
        FROM cuota
        WHERE credit_card_id = 6
        ORDER BY id
    """))
    
    current_cuotas = result.fetchall()
    for row in current_cuotas:
        print(f"  ID: {row[0]}, Tarjeta: {row[1]}, Nombre: {row[2]}, {row[4]}/{row[3]}, Activa: {row[5]}")
    
    print(f"\nTotal en DB: {len(current_cuotas)}")
    print(f"Total en PDF: {len(pdf_cuotas)}")
    
    # Now we need to decide: should we add all PDF cuotas, or replace?
    # The system shows 4 cuotas (from old data), but PDF has 22 (complete history)
    # Let's ADD the ones from PDF that aren't already there
    
    print("\n" + "="*100)
    print("PLAN DE ACTUALIZACIÓN")
    print("="*100)
    print(f"""
Opciones:
1. REEMPLAZAR completamente - Borrar los 4 existentes e insertar los 22 del PDF
   Riesgo: Perder datos de cuotas pagadas
   
2. AGREGAR INTELIGENTEMENTE - Insertar solo las nuevas (mantener las 4 existentes)
   Recomendado: Evitar datos duplicados y mantener histórico
   
3. MERGE - Comparar y actualizar estados
   Más complejo pero más seguro

RECOMENDACIÓN: Opción 2 (AGREGAR INTELIGENTEMENTE)
Las 4 cuotas actuales (BM FERRETERIA, HINDU ANANDA, STORE RETAIL, NETFLIX) 
NO aparecen en el PDF como activas (no están en estado "1 de X")
Por lo tanto, son probablemente datos OLD/incorrectos que deben ser reemplazados.
""")
    
    # Let's check if the current 4 are in the PDF list
    pdf_descriptions = [desc for _, desc, _, _, _, _, _ in pdf_cuotas]
    
    print("\nCOMPARACIÓN:")
    for row in current_cuotas:
        desc = row[2]
        in_pdf = any(pdf_desc.strip().lower() == desc.strip().lower() for pdf_desc in pdf_descriptions)
        status = "✅ En PDF" if in_pdf else "❌ NO en PDF (ANTIGUA)"
        print(f"  {desc}: {status}")

print("\n" + "="*100)
