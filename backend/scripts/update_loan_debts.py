"""
Script to update current debt for multiple loans

Usage:
1. Export current loans: python update_loan_debts.py --export [--db prod]
2. Edit the exported CSV with actual debt amounts
3. Import updated debts: python update_loan_debts.py --import loans_update.csv [--db prod]
"""

import sys
import csv
import argparse
import os
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.loan import Loan


def get_db_session(db_name: str = "dev"):
    """Get database session for specified database"""
    if db_name == "prod":
        db_url = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
        print(f"🔴 Using PRODUCTION database: budgetapp_prod")
    else:
        db_url = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
        print(f"🟢 Using DEVELOPMENT database: budgetapp_dev")
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def export_loans(output_file: str = "loans_current.csv", db_name: str = "dev"):
    """Export current loans to CSV for editing"""
    db = get_db_session(db_name)
    try:
        loans = db.query(Loan).filter(Loan.status == "active").all()
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'ID',
                'Nombre',
                'Entidad',
                'Monto Original',
                'Deuda Actual (EDITAR AQUÍ)',
                'Cuota Mensual Real (EDITAR AQUÍ)',
                'Cuotas Totales',
                'Cuotas Pagadas (base)',
                'Fecha Inicio',
                'Notas'
            ])
            
            for loan in loans:
                writer.writerow([
                    loan.id,
                    loan.name,
                    loan.entity,
                    f"{loan.original_amount:.2f}",
                    f"{loan.current_debt:.2f}",  # This is what they need to update
                    f"{loan.monthly_payment:.2f}",  # This is what they need to update
                    loan.total_installments,
                    loan.base_installments_paid,
                    loan.start_date.strftime('%Y-%m-%d') if loan.start_date else '',
                    loan.notes or ''
                ])
        
        print(f"✅ Exported {len(loans)} loans to {output_file}")
        print(f"\nNext steps:")
        print(f"1. Open {output_file}")
        print(f"2. Update 'Deuda Actual (EDITAR AQUÍ)' column with real values")
        print(f"3. Run: python update_loan_debts.py --import {output_file}")
        
    finally:
        db.close()


def parse_amount(amount_str: str) -> float:
    """Parse amount string handling Spanish/English formats"""
    # Remove spaces and currency symbols
    amount_str = amount_str.strip().replace('S/', '').replace('$', '').strip()
    
    # Count commas and dots to determine format
    comma_count = amount_str.count(',')
    dot_count = amount_str.count('.')
    
    if comma_count > 0 and dot_count > 0:
        # Has both separators
        # Find which one appears last (that's the decimal separator)
        last_comma_pos = amount_str.rfind(',')
        last_dot_pos = amount_str.rfind('.')
        
        if last_comma_pos > last_dot_pos:
            # Format: 1.234,56 (European: dot=thousands, comma=decimal)
            amount_str = amount_str.replace('.', '').replace(',', '.')
        else:
            # Format: 1,234.56 (US: comma=thousands, dot=decimal)
            amount_str = amount_str.replace(',', '')
    elif comma_count > 0:
        # Only commas - check if it's thousands or decimal
        # If comma is in last 3 positions, it's decimal
        comma_pos = amount_str.rfind(',')
        if len(amount_str) - comma_pos <= 3:
            # Likely decimal separator
            amount_str = amount_str.replace(',', '.')
        else:
            # Likely thousands separator
            amount_str = amount_str.replace(',', '')
    # If only dots, keep as is (US format)
    
    return float(amount_str)


def import_loans(input_file: str, db_name: str = "dev"):
    """Import updated loan debts from CSV"""
    if not Path(input_file).exists():
        print(f"❌ Error: File {input_file} not found")
        return
    
    db = get_db_session(db_name)
    try:
        updates = []
        
        # Try to detect delimiter
        with open(input_file, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            delimiter = ';' if ';' in first_line else ','
        
        print(f"📄 Detected delimiter: '{delimiter}'")
        
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            for row in reader:
                loan_id = int(row['ID'])
                new_debt = parse_amount(row['Deuda Actual (EDITAR AQUÍ)'])
                new_payment = parse_amount(row['Cuota Mensual Real (EDITAR AQUÍ)'])
                updates.append((loan_id, new_debt, new_payment))
        
        print(f"\n📋 Found {len(updates)} loans to update")
        print(f"\nChanges to be made:")
        print(f"{'ID':<5} {'Nombre':<25} {'Deuda Anterior':<15} {'Deuda Nueva':<15} {'Cuota Anterior':<15} {'Cuota Nueva':<15}")
        print("-" * 110)
        
        for loan_id, new_debt, new_payment in updates:
            loan = db.query(Loan).filter(Loan.id == loan_id).first()
            if not loan:
                print(f"⚠️  Loan ID {loan_id} not found, skipping")
                continue
            
            old_debt = loan.current_debt
            old_payment = loan.monthly_payment
            print(f"{loan.id:<5} {loan.name[:24]:<25} S/ {old_debt:>10,.2f}   S/ {new_debt:>10,.2f}   S/ {old_payment:>10,.2f}   S/ {new_payment:>10,.2f}")
        
        print("\n" + "=" * 110)
        confirm = input("\n⚠️  Apply these changes? (yes/no): ").strip().lower()
        
        if confirm != 'yes':
            print("❌ Update cancelled")
            return
        
        # Apply updates
        updated_count = 0
        for loan_id, new_debt, new_payment in updates:
            loan = db.query(Loan).filter(Loan.id == loan_id).first()
            if loan:
                loan.current_debt = new_debt
                loan.monthly_payment = new_payment
                loan.updated_at = datetime.utcnow()
                updated_count += 1
        
        db.commit()
        print(f"\n✅ Successfully updated {updated_count} loans")
        
        # Show summary
        print(f"\n📊 Summary:")
        total_debt = sum(new_debt for _, new_debt, _ in updates)
        total_payment = sum(new_payment for _, _, new_payment in updates)
        print(f"Total debt across all loans: S/ {total_debt:,.2f}")
        print(f"Total monthly payments: S/ {total_payment:,.2f}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description='Update loan current debts')
    parser.add_argument('--export', action='store_true', help='Export loans to CSV')
    parser.add_argument('--import', dest='import_file', help='Import updated loans from CSV')
    parser.add_argument('--output', default='loans_current.csv', help='Output file for export (default: loans_current.csv)')
    parser.add_argument('--db', choices=['dev', 'prod'], default='dev', help='Database to use (dev or prod, default: dev)')
    
    args = parser.parse_args()
    
    if args.export:
        export_loans(args.output, args.db)
    elif args.import_file:
        import_loans(args.import_file, args.db)
    else:
        parser.print_help()
        print("\nExamples:")
        print("  Export DEV:   python update_loan_debts.py --export")
        print("  Export PROD:  python update_loan_debts.py --export --db prod")
        print("  Import DEV:   python update_loan_debts.py --import loans_current.csv")
        print("  Import PROD:  python update_loan_debts.py --import loans_current.csv --db prod")


if __name__ == "__main__":
    main()
