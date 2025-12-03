#!/usr/bin/env python3
"""
Create secure users file for BudgetApp authentication.

This script creates a .users.json file with hashed passwords.
The file should NOT be committed to Git (.gitignore)

Usage:
    python backend/create_users.py

The script will prompt for passwords securely.
"""
import json
import sys
import getpass
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.auth import hash_password

def create_users():
    """Create .users.json file with secure credentials."""
    
    users_file = Path(__file__).parent / ".users.json"
    
    print("=" * 60)
    print("BudgetApp - Secure Users Creation")
    print("=" * 60)
    print()
    
    if users_file.exists():
        print(f"⚠️  Warning: {users_file} already exists!")
        response = input("Do you want to overwrite it? (yes/no): ")
        if response.lower() != 'yes':
            print("Aborted.")
            return
        print()
    
    print("Creating two users:")
    print("1. admin - Full access to real data")
    print("2. demo  - Obfuscated demo data")
    print()
    
    # Get admin password
    while True:
        admin_pass = getpass.getpass("Enter password for 'admin' user: ")
        admin_pass_confirm = getpass.getpass("Confirm password: ")
        
        if admin_pass != admin_pass_confirm:
            print("❌ Passwords don't match. Try again.\n")
            continue
        
        if len(admin_pass) < 8:
            print("❌ Password must be at least 8 characters.\n")
            continue
        
        break
    
    # Get demo password
    while True:
        demo_pass = getpass.getpass("\nEnter password for 'demo' user: ")
        demo_pass_confirm = getpass.getpass("Confirm password: ")
        
        if demo_pass != demo_pass_confirm:
            print("❌ Passwords don't match. Try again.\n")
            continue
        
        if len(demo_pass) < 8:
            print("❌ Password must be at least 8 characters.\n")
            continue
        
        break
    
    print("\n🔒 Hashing passwords... (this may take a few seconds)")
    
    # Create users dictionary
    users = {
        "admin": {
            "password_hash": hash_password(admin_pass),
            "type": "admin"
        },
        "demo": {
            "password_hash": hash_password(demo_pass),
            "type": "demo"
        }
    }
    
    # Save to file
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2)
    
    print(f"✅ Users file created: {users_file}")
    print()
    print("=" * 60)
    print("For Render.com deployment:")
    print("=" * 60)
    print("Add these environment variables:")
    print()
    print(f"ADMIN_PASSWORD_HASH={users['admin']['password_hash']}")
    print()
    print(f"DEMO_PASSWORD_HASH={users['demo']['password_hash']}")
    print()
    print("=" * 60)
    print("⚠️  IMPORTANT:")
    print("   - Keep .users.json file secret (it's in .gitignore)")
    print("   - Never commit passwords to Git")
    print("   - Store environment variables securely in Render.com")
    print("=" * 60)


if __name__ == "__main__":
    try:
        create_users()
    except KeyboardInterrupt:
        print("\n\nAborted.")
        sys.exit(1)
