"""
Import service for Excel files
"""
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ExcelImportResult:
    """Result of Excel import operation"""
    def __init__(self):
        self.success_count = 0
        self.error_count = 0
        self.errors: List[Dict[str, Any]] = []
        self.warnings: List[str] = []
    
    def add_success(self):
        self.success_count += 1
    
    def add_error(self, row: int, message: str):
        self.error_count += 1
        self.errors.append({"row": row, "message": message})
    
    def add_warning(self, message: str):
        self.warnings.append(message)
    
    def to_dict(self):
        return {
            "success_count": self.success_count,
            "error_count": self.error_count,
            "total_processed": self.success_count + self.error_count,
            "errors": self.errors,
            "warnings": self.warnings
        }


def parse_excel_transactions(file_path: str, sheet_name: str = None) -> pd.DataFrame:
    """
    Parse Excel file and return DataFrame with transactions.
    
    Expected columns (case-insensitive):
    - Fecha / Date
    - Categoría / Category
    - Monto / Amount
    - Tipo / Type (Ingreso/Egreso or Income/Expense)
    - Descripción / Description (optional)
    - Cuenta / Account (optional)
    - Notas / Notes (optional)
    """
    try:
        # Read Excel file
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
        else:
            # Read first sheet
            df = pd.read_excel(file_path)
        
        # Normalize column names (lowercase, strip spaces)
        df.columns = df.columns.str.strip().str.lower()
        
        logger.info(f"Read {len(df)} rows from Excel. Columns: {df.columns.tolist()}")
        
        return df
    
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        raise


def map_excel_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Map Excel columns to standard transaction fields.
    """
    column_mapping = {
        # Date column
        'fecha': 'date',
        'date': 'date',
        'día': 'date',
        
        # Category column
        'categoría': 'category_name',
        'category': 'category_name',
        'categoria': 'category_name',
        
        # Amount column
        'monto': 'amount',
        'amount': 'amount',
        'valor': 'amount',
        'importe': 'amount',
        
        # Type column
        'tipo': 'type',
        'type': 'type',
        
        # Description column
        'descripción': 'description',
        'description': 'description',
        'descripcion': 'description',
        'concepto': 'description',
        
        # Account column
        'cuenta': 'account_name',
        'account': 'account_name',
        
        # Notes column
        'notas': 'notes',
        'notes': 'notes',
        'observaciones': 'notes',
    }
    
    # Rename columns based on mapping
    for old_col, new_col in column_mapping.items():
        if old_col in df.columns:
            df.rename(columns={old_col: new_col}, inplace=True)
    
    return df


def clean_transaction_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and validate transaction data.
    """
    # Remove rows with all NaN values
    df = df.dropna(how='all')
    
    # Convert date column
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    
    # Clean amount column (remove currency symbols, convert to float)
    if 'amount' in df.columns:
        if df['amount'].dtype == 'object':
            df['amount'] = df['amount'].astype(str).str.replace(r'[S/\$,]', '', regex=True)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        # Take absolute value
        df['amount'] = df['amount'].abs()
    
    # Normalize type column
    if 'type' in df.columns:
        df['type'] = df['type'].astype(str).str.strip().str.lower()
        df['type'] = df['type'].replace({
            'ingreso': 'income',
            'ingresos': 'income',
            'entrada': 'income',
            'egreso': 'expense',
            'egresos': 'expense',
            'gasto': 'expense',
            'gastos': 'expense',
            'salida': 'expense',
        })
    
    return df
