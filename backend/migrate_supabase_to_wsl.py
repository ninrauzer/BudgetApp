#!/usr/bin/env python3
"""
Migrate data from Supabase to WSL PostgreSQL using Python
This connects directly to Supabase (which works from Windows/WSL-guest)
and then restores to local WSL PostgreSQL
"""

import subprocess
import sys
import os
from pathlib import Path

# Supabase connection
SUPABASE_HOST = "db.ohleydwbqagxwyfdtiny.supabase.co"
SUPABASE_PORT = "6543"
SUPABASE_USER = "postgres"
SUPABASE_PASSWORD = "2mr38qsDV52NxD8NT"
SUPABASE_DB = "postgres"

# WSL connection
WSL_HOST = "localhost"
WSL_PORT = "5432"
WSL_USER = "postgres"
WSL_DB = "budgetapp_dev"

DUMP_FILE = "/tmp/supabase_dump.sql"

def run_command(cmd, env=None):
    """Run command and return output"""
    print(f"  $ {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env={**os.environ, **(env or {})},
            timeout=300
        )
        if result.returncode != 0:
            print(f"  ❌ Error: {result.stderr}")
            return False
        if result.stdout:
            print(result.stdout[:500])  # Print first 500 chars
        return True
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        return False

print("=" * 70)
print("🔄 Migrating Supabase → WSL PostgreSQL")
print("=" * 70)

# Step 1: Dump from Supabase
print("\n📤 Step 1: Dumping Supabase database...")
env = {"PGPASSWORD": SUPABASE_PASSWORD}
dump_cmd = [
    "pg_dump",
    "-h", SUPABASE_HOST,
    "-p", SUPABASE_PORT,
    "-U", SUPABASE_USER,
    "-d", SUPABASE_DB,
    "--no-owner",
    "--no-acl",
    "--if-exists",
    "--clean",
    "-v"
]

print(f"\n  Connecting to: {SUPABASE_HOST}:{SUPABASE_PORT}/{SUPABASE_DB}")
if not run_command(dump_cmd, env):
    print("\n❌ FAILED: Could not dump from Supabase")
    sys.exit(1)

# Capture dump to file
print("\n  Saving dump to file...")
env = {"PGPASSWORD": SUPABASE_PASSWORD}
with open(DUMP_FILE, 'w') as f:
    result = subprocess.run(
        dump_cmd,
        capture_output=True,
        text=True,
        env={**os.environ, **env},
        timeout=300
    )
    if result.returncode != 0:
        print(f"  ❌ Error: {result.stderr}")
        sys.exit(1)
    f.write(result.stdout)
    
file_size = os.path.getsize(DUMP_FILE) / 1024 / 1024  # MB
print(f"✅ Dump saved: {DUMP_FILE} ({file_size:.2f} MB)")

# Step 2: Restore to WSL
print("\n📥 Step 2: Restoring to WSL PostgreSQL...")
print(f"  Connecting to: {WSL_HOST}:{WSL_PORT}/{WSL_DB}")

restore_cmd = [
    "sudo", "-u", "postgres",
    "psql",
    "-h", WSL_HOST,
    "-p", WSL_PORT,
    "-d", WSL_DB,
    "-f", DUMP_FILE,
    "-v"
]

if not run_command(restore_cmd):
    print("\n❌ FAILED: Could not restore to WSL PostgreSQL")
    sys.exit(1)

print("✅ Restore completed!")

# Step 3: Verify
print("\n✅ Step 3: Verifying tables...")
verify_cmd = [
    "sudo", "-u", "postgres",
    "psql",
    "-h", WSL_HOST,
    "-p", WSL_PORT,
    "-d", WSL_DB,
    "-c", "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
]

if not run_command(verify_cmd):
    print("\n❌ FAILED: Could not verify tables")
    sys.exit(1)

print("\n" + "=" * 70)
print("🎉 Migration complete!")
print("=" * 70)
print(f"\nData is now available in: postgresql://postgres@{WSL_HOST}:{WSL_PORT}/{WSL_DB}")
