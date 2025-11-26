#!/usr/bin/env python3
import re

with open('frontend/src/components/MascotBubble.tsx', 'r') as f:
    content = f.read()
    lines = content.splitlines()

# Verificar que el export está
if 'export type MascotMood' in content:
    print('✅ Export type MascotMood encontrado')
    for i, line in enumerate(lines):
        if 'export type MascotMood' in line:
            print(f'   Línea {i+1}: {line.strip()}')
else:
    print('❌ Export type MascotMood NO encontrado')

# Verificar que el export default está
if 'export default function MascotBubble' in content:
    print('✅ Export default function encontrado')
else:
    print('❌ Export default function NO encontrado')

# Verificar que no hay errores de sintaxis obvios
if content.count('{') == content.count('}'):
    print('✅ Llaves balanceadas')
else:
    print(f'❌ Llaves no balanceadas: {{ = {content.count("{")} }} = {content.count("}")}')

print(f'\nLíneas totales: {len(lines)}')
