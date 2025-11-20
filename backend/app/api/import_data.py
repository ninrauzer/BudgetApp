"""
Import API router for Excel files
"""
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from datetime import datetime
import tempfile
import os
import logging
import pandas as pd

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.services.excel_import import (
    parse_excel_transactions,
    map_excel_columns,
    clean_transaction_data,
    ExcelImportResult
)

router = APIRouter(prefix="/import", tags=["import"])
logger = logging.getLogger(__name__)


@router.post("/excel")
async def import_excel_transactions(
    file: UploadFile = File(...),
    sheet_name: str = Form(None),
    default_account_id: int = Form(None),
    db: Session = Depends(get_db)
):
    """
    Import transactions from Excel file.
    
    Expected Excel columns (flexible naming):
    - Fecha/Date
    - Categoría/Category
    - Monto/Amount
    - Tipo/Type (Ingreso/Egreso)
    - Descripción/Description (optional)
    - Cuenta/Account (optional)
    - Notas/Notes (optional)
    """
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xlsm', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only Excel files (.xlsx, .xlsm, .xls) are supported."
        )
    
    result = ExcelImportResult()
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Parse Excel
        df = parse_excel_transactions(tmp_file_path, sheet_name)
        result.add_warning(f"Found {len(df)} rows in Excel file")
        
        # Map and clean columns
        df = map_excel_columns(df)
        df = clean_transaction_data(df)
        
        # Validate required columns
        required_columns = ['date', 'amount']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_columns}. Found columns: {df.columns.tolist()}"
            )
        
        # Get all categories and accounts for mapping
        categories = {cat.name.lower(): cat for cat in db.query(Category).all()}
        accounts = {acc.name.lower(): acc for acc in db.query(Account).all()}
        
        # Get default account if specified
        default_account = None
        if default_account_id:
            default_account = db.query(Account).filter(Account.id == default_account_id).first()
        
        # Process each row
        for idx, row in df.iterrows():
            try:
                # Skip rows with missing required data
                if pd.isna(row.get('date')) or pd.isna(row.get('amount')):
                    result.add_warning(f"Row {idx + 2}: Skipped - missing date or amount")
                    continue
                
                # Find or create category
                category = None
                category_name = str(row.get('category_name', '')).strip().lower()
                
                if category_name and category_name in categories:
                    category = categories[category_name]
                else:
                    # Try to determine type and use first matching category
                    tx_type = row.get('type', 'expense')
                    matching_cats = [c for c in categories.values() if c.type == tx_type]
                    if matching_cats:
                        category = matching_cats[0]
                        result.add_warning(f"Row {idx + 2}: Category '{category_name}' not found, using '{category.name}'")
                
                if not category:
                    result.add_error(idx + 2, f"Could not determine category for '{category_name}'")
                    continue
                
                # Find or use default account
                account = default_account
                account_name = str(row.get('account_name', '')).strip().lower()
                
                if account_name and account_name in accounts:
                    account = accounts[account_name]
                
                if not account:
                    # Use first available account
                    account = db.query(Account).filter(Account.is_active == True).first()
                    if not account:
                        result.add_error(idx + 2, "No active account found")
                        continue
                
                # Create transaction
                transaction = Transaction(
                    date=row['date'].date() if hasattr(row['date'], 'date') else row['date'],
                    category_id=category.id,
                    account_id=account.id,
                    amount=float(row['amount']),
                    currency='PEN',  # Default to PEN
                    amount_pen=float(row['amount']),
                    type=category.type,
                    description=str(row.get('description', ''))[:200] if pd.notna(row.get('description')) else None,
                    notes=str(row.get('notes', '')) if pd.notna(row.get('notes')) else None,
                    status='completed'
                )
                
                db.add(transaction)
                result.add_success()
                
            except Exception as e:
                logger.error(f"Error processing row {idx + 2}: {e}")
                result.add_error(idx + 2, str(e))
        
        # Commit all transactions
        if result.success_count > 0:
            db.commit()
            result.add_warning(f"Successfully imported {result.success_count} transactions")
        
        # Clean up temp file
        os.unlink(tmp_file_path)
        
        return result.to_dict()
    
    except Exception as e:
        logger.error(f"Error importing Excel: {e}")
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error importing Excel: {str(e)}")


@router.get("/template")
async def download_template():
    """
    Download Excel template for importing transactions.
    """
    import pandas as pd
    from fastapi.responses import StreamingResponse
    import io
    
    # Create template DataFrame
    template_data = {
        'Fecha': ['2025-01-15', '2025-01-16'],
        'Categoría': ['Salario', 'Comida'],
        'Monto': [5000, 50],
        'Tipo': ['Ingreso', 'Egreso'],
        'Descripción': ['Salario mensual', 'Almuerzo'],
        'Cuenta': ['Banco BBVA', 'Efectivo'],
        'Notas': ['', 'Restaurante XYZ']
    }
    
    df = pd.DataFrame(template_data)
    
    # Create Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Transacciones')
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment; filename=plantilla_transacciones.xlsx'}
    )
