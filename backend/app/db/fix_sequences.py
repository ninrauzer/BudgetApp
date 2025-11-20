"""
Database sequence fixer.
Ensures all ID sequences are synchronized with their tables.
Runs on startup to prevent duplicate key errors.
"""
from sqlalchemy import text, MetaData, Table, inspect
from sqlalchemy.orm import Session
from app.db.database import engine


def fix_all_sequences(db: Session):
    """
    Fix all sequences in the database to match the maximum ID in each table.
    This prevents duplicate key errors when inserting new records.
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    fixed_sequences = []
    
    for table_name in tables:
        # Check if table has an 'id' column
        columns = inspector.get_columns(table_name)
        has_id = any(col['name'] == 'id' for col in columns)
        
        if not has_id:
            continue
        
        # Expected sequence name (PostgreSQL convention)
        seq_name = f"{table_name}_id_seq"
        
        try:
            # Get max ID from table
            result = db.execute(text(f"SELECT MAX(id) FROM {table_name}")).scalar()
            max_id = result or 0
            
            # Reset sequence
            next_id = max_id + 1
            db.execute(text(f"ALTER SEQUENCE {seq_name} RESTART WITH {next_id}"))
            
            fixed_sequences.append({
                'table': table_name,
                'max_id': max_id,
                'next_id': next_id,
                'status': 'fixed'
            })
            
        except Exception as e:
            # Sequence might not exist
            fixed_sequences.append({
                'table': table_name,
                'status': 'skipped',
                'reason': str(e)
            })
    
    db.commit()
    return fixed_sequences
