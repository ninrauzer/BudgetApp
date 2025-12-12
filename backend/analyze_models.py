"""
Analyze all SQLAlchemy models to identify tables needing user_id
"""
import os
import re
from pathlib import Path

def analyze_models():
    models_dir = Path("app/models")
    tables_needing_user_id = []
    tables_already_have_user_id = []
    
    print("=" * 80)
    print("MULTI-TENANT MIGRATION ANALYSIS")
    print("=" * 80)
    print()
    
    for model_file in models_dir.glob("*.py"):
        if model_file.name == "__init__.py":
            continue
            
        content = model_file.read_text(encoding='utf-8')
        
        # Find table name
        table_match = re.search(r'__tablename__\s*=\s*["\'](\w+)["\']', content)
        if not table_match:
            continue
            
        table_name = table_match.group(1)
        
        # Check if already has user_id
        has_user_id = 'user_id' in content or 'Column(Integer, ForeignKey("users.id")' in content
        
        if table_name == "users":
            continue  # Skip users table itself
            
        if table_name == "allowed_users":
            continue  # Skip whitelist table
            
        if has_user_id:
            tables_already_have_user_id.append(table_name)
        else:
            tables_needing_user_id.append({
                'table': table_name,
                'file': model_file.name,
                'path': str(model_file)
            })
    
    print(f"✅ Tables that ALREADY have user_id: {len(tables_already_have_user_id)}")
    for table in tables_already_have_user_id:
        print(f"   - {table}")
    
    print()
    print(f"❌ Tables that NEED user_id: {len(tables_needing_user_id)}")
    for info in tables_needing_user_id:
        print(f"   - {info['table']:30} ({info['file']})")
    
    print()
    print("=" * 80)
    print("NEXT STEPS:")
    print("=" * 80)
    print("1. Add user_id column to each model")
    print("2. Create Alembic migration")
    print("3. Update all API endpoints to filter by current_user.id")
    print("4. Add indexes for performance")
    print("5. Test with multiple users")
    print()
    
    return tables_needing_user_id

if __name__ == "__main__":
    tables = analyze_models()
    
    print(f"\n📝 Total tables to modify: {len(tables)}")
    print(f"⏱️  Estimated time: {len(tables) * 15} minutes for models + endpoint updates")
