from PIL import Image
import os

# Ruta de la imagen original
input_path = r'e:\Desarrollo\BudgetApp\wolfi_poor.png'
output_path = r'e:\Desarrollo\BudgetApp\frontend\public\wolfi.png'

try:
    # Abrir imagen
    img = Image.open(input_path)
    
    # Convertir a RGBA si no lo está
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Obtener datos de píxeles
    data = img.getdata()
    
    # Crear nueva lista de datos con fondo transparente
    new_data = []
    for item in data:
        # Si el píxel es blanco o muy cercano (gris claro de fondo), hacerlo transparente
        if item[0] > 240 and item[1] > 240 and item[2] > 240:  # Píxeles blancos
            new_data.append((item[0], item[1], item[2], 0))  # Transparente
        else:
            new_data.append(item)
    
    # Aplicar datos
    img.putdata(new_data)
    
    # Crear directorio si no existe
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Guardar
    img.save(output_path, 'PNG')
    
    print(f'✅ Imagen con fondo transparente guardada en: {output_path}')
    
except Exception as e:
    print(f'❌ Error: {e}')
