-- Fix schema for budgetapp_demo database in Neon
-- Add missing column last_login to users table

-- Connect to budgetapp_demo schema
SET search_path TO budgetapp_demo;

-- Add last_login column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'budgetapp_demo'
  AND table_name = 'users'
ORDER BY ordinal_position;
