import shutil
import os
from pathlib import Path

source_dir = r'E:\Desarrollo\BudgetApp\public'
dest_dir = r'E:\Desarrollo\BudgetApp\frontend\public'

# Mapeo: archivo origen -> nombre destino (mood)
mapping = {
    'angry.png': 'wolfi-angry.png',
    'angry1.png': 'wolfi-alert.png',
    'thinker.png': 'wolfi-thinking.png',
    'worried2.png': 'wolfi-sad.png',
    'wolfi_poor.png': 'wolfi-happy.png',  # Usamos este como happy (está sonriendo)
}

print("📁 Copiando imágenes...")
print("="*60)

for src_name, dest_name in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"✅ {src_name:20} -> {dest_name}")
    else:
        print(f"❌ No encontrado: {src_name}")

print("\n📸 Imágenes en frontend/public/:")
print("="*60)
for file in sorted(os.listdir(dest_dir)):
    if file.endswith('.png'):
        full_path = os.path.join(dest_dir, file)
        size = os.path.getsize(full_path) / 1024
        print(f"  {file:25} ({size:,.0f} KB)")

print("\n✅ Listo!")
