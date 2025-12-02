#!/usr/bin/env python
import pdfplumber
import re
from collections import defaultdict

print("\n" + "="*80)
print("EXTRAYENDO ESTADO DE CUENTA BBVA - NOVIEMBRE 2025")
print("="*80)

with pdfplumber.open('e:/Desarrollo/BudgetApp/docs/EECC_BBVA_Noviembre.pdf') as pdf:
    print(f"\nTotal de páginas: {len(pdf.pages)}")
    
    all_text = ""
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        all_text += text + "\n"
    
    # Extract header info
    print("\n" + "="*80)
    print("INFORMACIÓN DE LA TARJETA")
    print("="*80)
    
    # Find credit line
    credit_line = re.search(r'Línea de Crédito\s*(S/[\s\d,\.]+)', all_text)
    if credit_line:
        print(f"Línea de Crédito: {credit_line.group(1)}")
    
    # Find used credit
    used_credit = re.search(r'Crédito Utilizado\s*:\s*(S/[\s\d,\.]+)', all_text)
    if used_credit:
        print(f"Crédito Utilizado: {used_credit.group(1)}")
    
    # Find available credit
    available = re.search(r'Crédito Disponible\s*(S/[\s\d,\.]+)', all_text)
    if available:
        print(f"Crédito Disponible: {available.group(1)}")
    
    # Find card number
    card_num = re.search(r'4147-91\*\*-\*\*\*\*-0865', all_text)
    if card_num:
        print(f"Tarjeta: {card_num.group(0)}")
    
    print("\n" + "="*80)
    print("BÚSQUEDA DE CUOTAS (INSTALLMENTS)")
    print("="*80)
    
    # Find all lines with "CU" (cuotas)
    lines = all_text.split('\n')
    cuota_lines = []
    
    for i, line in enumerate(lines):
        if 'CU' in line and any(char.isdigit() for char in line):
            cuota_lines.append((i, line))
    
    print(f"\nEncontradas {len(cuota_lines)} líneas con referencias de cuotas:\n")
    
    for idx, (line_num, line) in enumerate(cuota_lines, 1):
        print(f"{idx}. {line.strip()}")
    
    # Extract more detailed patterns
    print("\n" + "="*80)
    print("ANÁLISIS DE TRANSACCIONES CON CUOTAS")
    print("="*80)
    
    # Pattern for transactions with installments
    # YYYY-MM-DD description S/ amount N CU
    transaction_pattern = r'(\d{1,2}/\d{1,2}/\d{4})\s+(.+?)\s+(S/\s*[\d,\.]+)\s+(\d+)\s+CU'
    
    transactions = re.findall(transaction_pattern, all_text)
    print(f"\nTransacciones con cuotas encontradas: {len(transactions)}\n")
    
    for i, (date, desc, amount, cuotas) in enumerate(transactions, 1):
        print(f"{i}. Fecha: {date}")
        print(f"   Descripción: {desc.strip()}")
        print(f"   Monto: {amount.strip()}")
        print(f"   Cuotas: {cuotas}")
        print()
    
    # Extract table with installments
    print("="*80)
    print("EXTRAYENDO TABLA DE OPERACIONES COMPLETA")
    print("="*80)
    
    # Find section with detailed operations
    operations_section = re.search(
        r'Fecha de Uso por Concepto Operaciones en(.*?)(?:TEA SOL|Deuda total)',
        all_text,
        re.DOTALL
    )
    
    if operations_section:
        ops_text = operations_section.group(1)
        print("\nPrimeras 3000 caracteres de la sección de operaciones:")
        print(ops_text[:3000])

print("\n" + "="*80)
print("EXTRACCIÓN COMPLETADA")
print("="*80 + "\n")
