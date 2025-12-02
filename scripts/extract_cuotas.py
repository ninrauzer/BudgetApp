#!/usr/bin/env python
import pdfplumber
import re

print("\n" + "="*100)
print("EXTRAYENDO TABLA DETALLADA DE CUOTAS")
print("="*100 + "\n")

with pdfplumber.open('e:/Desarrollo/BudgetApp/docs/EECC_BBVA_Noviembre.pdf') as pdf:
    all_text = ""
    
    # Extract from all pages
    for page in pdf.pages:
        all_text += page.extract_text() + "\n"
    
    # Find the installments table (CUOTA section)
    # This is usually after "CUOTA" keyword
    
    # Look for lines that have the pattern: DATE DESC INSTALLMENTS TEA AMOUNT DAYS TOTAL
    # Example: "28/10/2025 108 PVEA AYACUCHO F 185.34 1 de 3 59.99% 58.14 9 67.57"
    
    print("BUSCANDO TABLA DE CUOTAS EN DESARROLLO...\n")
    
    # Split by lines and look for cuota patterns
    lines = all_text.split('\n')
    
    # Find where installments table starts
    cuota_table_started = False
    cuota_lines = []
    
    for i, line in enumerate(lines):
        # Look for lines with "de" pattern (1 de 3, 4 de 6, etc)
        if re.search(r'\d+\s+de\s+\d+', line):
            cuota_lines.append((i, line))
    
    print(f"Encontradas {len(cuota_lines)} líneas de cuotas:\n")
    for idx, (line_num, line) in enumerate(cuota_lines, 1):
        print(f"{idx}. Línea {line_num}: {line.strip()}")
    
    # Try extracting with better pattern
    print("\n" + "="*100)
    print("BUSCANDO TODA LA INFORMACIÓN DE CUOTAS CON PATRÓN AVANZADO")
    print("="*100 + "\n")
    
    # Pattern: DD/MM/YYYY description amount X de Y rate interest_amount days total_amount
    detailed_pattern = r'(\d{1,2}/\d{1,2}/\d{4})\s+(.+?)\s+(S/\s*[\d,\.]+)\s+(\d+)\s+de\s+(\d+)\s+([\d,\.]+%)\s+([\d,\.]+)\s+(\d+)\s+([\d,\.]+)'
    
    matches = re.findall(detailed_pattern, all_text)
    print(f"Coincidencias encontradas: {len(matches)}\n")
    
    for i, match in enumerate(matches, 1):
        date, desc, total_amount, current_cuota, total_cuotas, tea, interest, days, final_amount = match
        print(f"CUOTA {i}:")
        print(f"  Fecha: {date}")
        print(f"  Descripción: {desc.strip()}")
        print(f"  Monto Total: {total_amount.strip()}")
        print(f"  Cuota: {current_cuota} de {total_cuotas}")
        print(f"  TEA: {tea}")
        print(f"  Interés: {interest}")
        print(f"  Días: {days}")
        print(f"  Monto Final: {final_amount}")
        print()
    
    # Also try to find in table format using pdfplumber tables
    print("\n" + "="*100)
    print("EXTRAYENDO TABLAS CON PDFPLUMBER")
    print("="*100 + "\n")
    
    for page_num, page in enumerate(pdf.pages, 1):
        tables = page.extract_tables()
        if tables:
            print(f"\nPágina {page_num}: Encontradas {len(tables)} tabla(s)")
            for table_idx, table in enumerate(tables):
                print(f"\nTabla {table_idx + 1}:")
                # Print first 5 rows
                for row_idx, row in enumerate(table[:15]):
                    print(f"  Row {row_idx}: {row}")
                if len(table) > 15:
                    print(f"  ... ({len(table) - 15} rows más)")

print("\n" + "="*100)
