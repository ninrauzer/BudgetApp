from PIL import Image
import os
from pathlib import Path

# Carpeta donde están las imágenes
public_dir = r'e:\Desarrollo\BudgetApp\frontend\public'

# Buscar todas las imágenes de Wolfi que NO sean ya PNG transparente
wolfi_images = []
for file in os.listdir(public_dir):
    if file.startswith('wolfi-') and file.endswith('.png'):
        wolfi_images.append(file)

print(f"📸 Imágenes encontradas: {len(wolfi_images)}")
for img in wolfi_images:
    print(f"  - {img}")

if not wolfi_images:
    print("❌ No hay imágenes wolfi-* en /public")
    print("Por favor, coloca las imágenes de Wolfi en:")
    print(f"  {public_dir}")
    print("\nEj: wolfi-happy.png, wolfi-sad.png, wolfi-angry.png, etc.")
else:
    # Procesar cada imagen
    for filename in wolfi_images:
        input_path = os.path.join(public_dir, filename)
        
        try:
            print(f"\n🔄 Procesando: {filename}")
            
            # Abrir imagen
            img = Image.open(input_path)
            print(f"   Tamaño original: {img.size}, Modo: {img.mode}")
            
            # Convertir a RGBA si no lo está
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Obtener datos de píxeles
            data = img.getdata()
            new_data = []
            
            # Contar píxeles modificados
            transparent_count = 0
            
            for item in data:
                r, g, b = item[0], item[1], item[2]
                
                # MEJORADO: Solo hacer transparente el fondo BLANCO puro/muy claro
                # Pero proteger los ojos y detalles negros/oscuros
                if r > 245 and g > 245 and b > 245:  # Solo píxeles MUY blancos
                    new_data.append((r, g, b, 0))  # Transparente
                    transparent_count += 1
                else:
                    new_data.append(item)  # Mantener original
            
            # Aplicar datos
            img.putdata(new_data)
            
            # Guardar (sobrescribir)
            img.save(input_path, 'PNG')
            
            print(f"   ✅ Guardada con transparencia ({transparent_count} píxeles)")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("✅ Procesamiento completado")
print("="*60)
