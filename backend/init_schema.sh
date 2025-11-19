#!/bin/bash
cd /mnt/e/Desarrollo/BudgetApp/backend
export DATABASE_URL="postgresql://postgres@localhost:5432/budgetapp_dev"
python3 scripts/init_supabase_schema.py
