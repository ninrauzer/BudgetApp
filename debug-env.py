#!/usr/bin/env python3
"""
Debug script to check what DATABASE_URL the backend is seeing
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Simulate what the backend does
backend_dir = Path(__file__).parent / "backend"
env_path = backend_dir / ".env"

print(f"Backend directory: {backend_dir}")
print(f"Expected .env path: {env_path}")
print(f".env exists: {env_path.exists()}")
print()

if env_path.exists():
    print("Loading from .env...")
    load_dotenv(env_path)
else:
    print("Loading from current environment...")
    load_dotenv()

print()
print("=== ENVIRONMENT VARIABLES ===")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL', '(NOT SET)')}")
print(f"DEBUG: {os.getenv('DEBUG', '(NOT SET)')}")
print(f"APP_NAME: {os.getenv('APP_NAME', '(NOT SET)')}")
print(f"APP_VERSION: {os.getenv('APP_VERSION', '(NOT SET)')}")

# Show if it contains dev or prod
db_url = os.getenv("DATABASE_URL", "").lower()
print()
print("=== DATABASE DETECTION ===")
print(f"Contains 'budgetapp_dev': {'budgetapp_dev' in db_url}")
print(f"Contains 'budgetapp_prod': {'budgetapp_prod' in db_url}")
print(f"Contains 'localhost': {'localhost' in db_url}")
print(f"Contains '127.0.0.1': {'127.0.0.1' in db_url}")
print(f"Contains 'sqlite': {'sqlite' in db_url}")
print(f"Is empty: {db_url == ''}")
