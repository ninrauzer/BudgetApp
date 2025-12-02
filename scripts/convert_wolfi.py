import base64
import os

# Ruta de la imagen (ajusta según donde esté tu imagen)
image_path = r'e:\Desarrollo\BudgetApp\docs\EECC_BBVA_Noviembre.pdf'

# Buscar archivos PNG en el proyecto
for root, dirs, files in os.walk(r'e:\Desarrollo\BudgetApp'):
    for file in files:
        if file.endswith('.png'):
            full_path = os.path.join(root, file)
            print(f"Encontrado: {full_path}")

# Si tienes la imagen guardada, convertir a base64
try:
    # Intentar con diferentes rutas posibles
    possible_paths = [
        r'e:\Desarrollo\BudgetApp\wolfi_poor.png',
        r'e:\Desarrollo\BudgetApp\frontend\public\wolfi.png',
        r'e:\Desarrollo\BudgetApp\wolfi.png',
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, 'rb') as image_file:
                base64_string = base64.b64encode(image_file.read()).decode('utf-8')
                
                # Guardar como string importable
                output = f'''// AUTO-GENERATED: Base64 image of Wolfi
export const WOLFI_BASE64 = "data:image/png;base64,{base64_string}";
'''
                
                with open(r'e:\Desarrollo\BudgetApp\frontend\src\constants\wolfi.ts', 'w') as f:
                    f.write(output)
                
                print(f"✅ Convertida imagen desde: {path}")
                print(f"✅ Guardada en: e:\\Desarrollo\\BudgetApp\\frontend\\src\\constants\\wolfi.ts")
                break
    else:
        print("❌ No se encontró wolfi.png en las rutas esperadas")
        
except Exception as e:
    print(f"Error: {e}")
