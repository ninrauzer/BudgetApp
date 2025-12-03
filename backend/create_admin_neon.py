"""
Script para crear usuario admin en Neon PostgreSQL
Ejecutar: python backend/create_admin_neon.py
"""
import os
from sqlalchemy import create_engine, text

# Conexión a Neon
DATABASE_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require"

engine = create_engine(DATABASE_URL)

# Tu email
ADMIN_EMAIL = "ninrauzer@gmail.com"

print("🔧 Conectando a Neon PostgreSQL...")

with engine.connect() as conn:
    # 1. Crear tabla users si no existe
    print("📋 Creando/actualizando tabla users...")
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))
    conn.commit()
    
    # 2. Agregar columna is_admin si no existe
    try:
        print("🔧 Verificando columna is_admin...")
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
        """))
        conn.commit()
        print("✅ Columna is_admin verificada")
    except Exception as e:
        print(f"⚠️  Columna ya existe o error: {e}")
        conn.rollback()
    
    # 3. Verificar si ya existe el usuario
    result = conn.execute(
        text("SELECT id, email, is_admin FROM users WHERE email = :email"),
        {"email": ADMIN_EMAIL}
    )
    existing = result.fetchone()
    
    if existing:
        print(f"✅ Usuario ya existe: {existing[1]} (admin={existing[2]})")
        
        # Asegurar que es admin
        if not existing[2]:
            print("🔧 Actualizando a admin...")
            conn.execute(
                text("UPDATE users SET is_admin = TRUE WHERE email = :email"),
                {"email": ADMIN_EMAIL}
            )
            conn.commit()
            print("✅ Usuario actualizado a admin")
    else:
        # 3. Crear usuario admin
        print(f"➕ Creando usuario admin: {ADMIN_EMAIL}")
        conn.execute(
            text("INSERT INTO users (email, is_admin) VALUES (:email, TRUE)"),
            {"email": ADMIN_EMAIL}
        )
        conn.commit()
        print("✅ Usuario admin creado exitosamente")

print("\n🎉 Listo! Ahora puedes loguearte con Google en Render")
print(f"   Email autorizado: {ADMIN_EMAIL}")
