#!/usr/bin/env python3
"""Crear la imagen PNG de Wolfi el lobo de Wall Street"""

from PIL import Image, ImageDraw
import os

# Crear una imagen más grande para mejor calidad
width, height = 600, 600
img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Colores (basados en la imagen de Wolfi)
gris_claro = (180, 195, 220)
gris_oscuro = (70, 90, 130)
crema = (240, 235, 220)
negro = (20, 20, 20)
rojo_corbata = (200, 50, 50)
azul_traje = (60, 80, 130)
gris_pants = (70, 85, 125)

# ===== CABEZA =====
# Cara principal
draw.ellipse([150, 80, 450, 300], fill=gris_claro, outline=negro, width=3)

# Orejas izquierda
draw.polygon([(180, 80), (150, 20), (200, 60)], fill=gris_oscuro, outline=negro)
draw.ellipse([170, 50, 195, 85], fill=crema, outline=negro, width=2)

# Orejas derecha
draw.polygon([(420, 80), (450, 20), (400, 60)], fill=gris_oscuro, outline=negro)
draw.ellipse([405, 50, 430, 85], fill=crema, outline=negro, width=2)

# Mejillas/hocico (crema)
draw.ellipse([170, 150, 430, 280], fill=crema, outline=negro, width=2)

# Líneas en las mejillas (textura)
draw.line([(200, 160), (210, 200)], fill=negro, width=2)
draw.line([(220, 155), (230, 195)], fill=negro, width=2)
draw.line([(240, 160), (250, 200)], fill=negro, width=2)
draw.line([(400, 160), (390, 200)], fill=negro, width=2)
draw.line([(380, 155), (370, 195)], fill=negro, width=2)
draw.line([(360, 160), (350, 200)], fill=negro, width=2)

# ===== OJOS =====
# Ojo izquierdo
draw.ellipse([210, 140, 280, 210], fill=(255, 255, 255), outline=negro, width=2)
draw.ellipse([230, 160, 270, 195], fill=negro)  # Iris
draw.ellipse([240, 165, 260, 185], fill=(100, 100, 100))  # Pupila
draw.ellipse([245, 170, 255, 175], fill=(255, 255, 255))  # Brillo

# Ojo derecho
draw.ellipse([320, 140, 390, 210], fill=(255, 255, 255), outline=negro, width=2)
draw.ellipse([330, 160, 370, 195], fill=negro)  # Iris
draw.ellipse([340, 165, 360, 185], fill=(100, 100, 100))  # Pupila
draw.ellipse([345, 170, 355, 175], fill=(255, 255, 255))  # Brillo

# ===== NARIZ =====
draw.ellipse([285, 200, 315, 230], fill=negro, outline=negro, width=2)

# ===== BOCA =====
draw.arc([260, 210, 340, 260], 0, 180, fill=negro, width=3)
draw.line([(300, 235), (300, 255)], fill=negro, width=2)  # Línea al mentón

# ===== CUERPO - TRAJE =====
# Torso (traje azul)
draw.rectangle([120, 280, 480, 480], fill=azul_traje, outline=negro, width=3)

# Cuello/Camisa
draw.rectangle([260, 260, 340, 300], fill=crema, outline=negro, width=1)

# Solapas izquierda
draw.polygon([(120, 280), (80, 310), (120, 360)], fill=gris_pants, outline=negro)

# Solapas derecha
draw.polygon([(480, 280), (520, 310), (480, 360)], fill=gris_pants, outline=negro)

# Corbata roja
draw.polygon([(290, 300), (270, 380), (310, 380)], fill=rojo_corbata, outline=negro, width=2)

# Botones del traje
draw.ellipse([(285, 320), (315, 350)], fill=(180, 120, 60), outline=negro, width=2)
draw.ellipse([(285, 380), (315, 410)], fill=(180, 120, 60), outline=negro, width=2)

# Puños de la camisa
draw.rectangle([80, 450, 140, 480], fill=crema, outline=negro, width=1)
draw.rectangle([460, 450, 520, 480], fill=crema, outline=negro, width=1)

# ===== COLA (asomando a la derecha) =====
draw.arc([(450, 380), (550, 520)], 270, 360, fill=gris_oscuro, width=12)

# ===== PATAS =====
# Pata izquierda
draw.rectangle([180, 480, 220, 550], fill=gris_oscuro, outline=negro, width=2)
draw.ellipse([(170, 540), (230, 570)], fill=gris_oscuro, outline=negro, width=2)

# Pata derecha
draw.rectangle([380, 480, 420, 550], fill=gris_oscuro, outline=negro, width=2)
draw.ellipse([(370, 540), (430, 570)], fill=gris_oscuro, outline=negro, width=2)

# ===== VASO EN LA MANO =====
# Vaso (derecha)
draw.rectangle([(460, 400), (510, 460)], fill=(200, 200, 200), outline=negro, width=2)
draw.rectangle([(465, 410), (505, 450)], fill=(220, 220, 220))  # Contenido
draw.line([(460, 405), (510, 405)], fill=negro, width=2)  # Borde superior

# Asa del vaso
draw.arc([(500, 410), (540, 455)], 0, 180, fill=negro, width=3)

# Guardar
output_path = r'e:\Desarrollo\BudgetApp\frontend\public\wolfi.png'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
img.save(output_path)
print(f'✅ Wolfi creado exitosamente')
print(f'📏 Tamaño: {width}x{height} px')
print(f'💾 Ubicación: {output_path}')
print(f'📊 Tamaño de archivo: {os.path.getsize(output_path) / 1024:.1f} KB')
