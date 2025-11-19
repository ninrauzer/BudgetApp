#!/bin/bash
# SSH Tunnel script - Forward Supabase traffic through IPv4
# Ejecutar en WSL para crear un túnel a Supabase

# Cerrar túnel anterior si existe
pkill -f "ssh.*6543:db.ohleydwbqagxwyfdtiny"  2>/dev/null || true

echo "🔗 Creando túnel SSH a Supabase..."
echo "Esto permite que Docker (IPv6-less) acceda a Supabase por IPv4"

# Crear túnel SSH
# Local port 6543 → Supabase IPv6 a través de SSH
ssh -N -L 6543:db.ohleydwbqagxwyfdtiny.supabase.co:6543 renan@192.168.100.104 &

sleep 2

# Verificar si el túnel está activo
if pgrep -f "ssh.*6543:db.ohleydwbqagxwyfdtiny" > /dev/null; then
    echo "✅ Túnel SSH activo"
    echo "Backend puede conectar a: localhost:6543"
else
    echo "❌ Error creando túnel"
    exit 1
fi

# Mantener script activo
wait
