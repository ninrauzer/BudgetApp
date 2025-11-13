"""
Frontend routes for serving HTML partials with HTMX
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import date

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.models.budget_plan import BudgetPlan

router = APIRouter(tags=["frontend"])


@router.get("/dashboard/summary", response_class=HTMLResponse)
async def dashboard_summary_partial(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Resumen del dashboard como HTML partial"""
    # Calcular rango de fechas
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Ingresos
    income = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.type == "income",
            Transaction.status == "completed"
        )
    ).scalar() or 0.0
    
    # Gastos
    expenses = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.type == "expense",
            Transaction.status == "completed"
        )
    ).scalar() or 0.0
    
    # Ahorros
    savings = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.type == "saving",
            Transaction.status == "completed"
        )
    ).scalar() or 0.0
    
    balance = income - expenses - savings
    
    return f"""
    <div class="grid grid-3">
        <div class="stat-card income">
            <div class="stat-icon"><i data-lucide="trending-up" style="width: 32px; height: 32px;"></i></div>
            <div class="stat-label"><strong>Período:</strong></div>
            <div class="stat-value">S/ {income:,.2f}</div>
            <div class="stat-subtitle"><i data-lucide="bar-chart-3" style="width: 14px; height: 14px; vertical-align: middle;"></i> Total recibido</div>
        </div>
        <div class="stat-card expense">
            <div class="stat-icon"><i data-lucide="trending-down" style="width: 32px; height: 32px;"></i></div>
            <div class="stat-label"><strong>Período:</strong></div>
            <div class="stat-value">S/ {expenses:,.2f}</div>
            <div class="stat-subtitle"><i data-lucide="bar-chart-3" style="width: 14px; height: 14px; vertical-align: middle;"></i> Total gastado</div>
        </div>
        <div class="stat-card saving">
            <div class="stat-icon"><i data-lucide="{'trophy' if balance >= 0 else 'alert-triangle'}" style="width: 32px; height: 32px;"></i></div>
            <div class="stat-label">Balance Disponible</div>
            <div class="stat-value" style="{'color: #10b981;' if balance >= 0 else 'color: #ef4444;'}">S/ {balance:,.2f}</div>
            <div class="stat-subtitle"><i data-lucide="piggy-bank" style="width: 14px; height: 14px; vertical-align: middle;"></i> Ahorros: S/ {savings:,.2f}</div>
        </div>
    </div>
    """


@router.get("/transactions/list", response_class=HTMLResponse)
async def transactions_list_partial(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Lista de transacciones recientes como HTML"""
    transactions = db.query(Transaction).order_by(Transaction.date.desc()).limit(limit).all()
    
    # Obtener categorías y cuentas para la fila de ingreso rápido
    categories_expense = db.query(Category).filter(Category.type == "expense", Category.is_active == True).all()
    accounts = db.query(Account).filter(Account.is_active == True).all()
    
    # Generar opciones para los selects
    category_options = "".join([f'<option value="{c.id}">{c.name}</option>' for c in categories_expense])
    account_options = "".join([f'<option value="{a.id}">{a.name}</option>' for a in accounts])
    
    if not transactions:
        empty_message = '''
        <div style="text-align: center; padding: 4rem 2rem; background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); border-radius: 1rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;"><i data-lucide="inbox" style="width: 64px; height: 64px;"></i></div>
            <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No hay transacciones</h3>
            <p style="color: var(--text-secondary);">Usa la fila superior para agregar tu primera transacción</p>
        </div>
        '''
        rows = []
    else:
        rows = []
    
    for t in transactions:
        type_config = {
            'income': {'badge': 'badge-success', 'text': '💚 Ingreso', 'icon': '↗️'},
            'expense': {'badge': 'badge-danger', 'text': '💸 Gasto', 'icon': '↘️'},
            'saving': {'badge': 'badge-info', 'text': '🏦 Ahorro', 'icon': '💰'}
        }
        
        status_config = {
            'completed': {'badge': 'badge-success', 'text': '✅ Completado'},
            'pending': {'badge': 'badge-warning', 'text': '⏳ Pendiente'},
            'cancelled': {'badge': 'badge-danger', 'text': '❌ Cancelado'}
        }
        
        type_info = type_config.get(t.type, {'badge': 'badge-info', 'text': t.type, 'icon': '•'})
        status_info = status_config.get(t.status, {'badge': 'badge-info', 'text': t.status})
        
        # Determinar el color del icono según el tipo
        icon_color = {'income': '#059669', 'expense': '#dc2626', 'saving': '#2563eb'}[t.type]
        icon = t.category.icon if t.category.icon else 'circle'
        
        rows.append(f"""
        <tr style="transition: all 0.2s; cursor: pointer;" 
            data-transaction-id="{t.id}"
            ondblclick="editTransaction({t.id})"
            onmouseover="this.style.background='var(--primary-light)'"
            onmouseout="this.style.background=''">
            <td><strong>{t.date.strftime('%d/%m/%Y')}</strong></td>
            <td><span class="badge {type_info['badge']}">{type_info['text']}</span></td>
            <td><i data-lucide="{icon}" style="width: 18px; height: 18px; vertical-align: middle; color: {icon_color};"></i> {t.category.name}</td>
            <td>{t.account.name}</td>
            <td>
                <strong style="font-size: 1.1em;">S/ {t.amount:,.2f}</strong>
            </td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                {t.description or '—'}
            </td>
            <td><span class="badge {status_info['badge']}">{status_info['text']}</span></td>
        </tr>
        """)
    
    # Fila de ingreso rápido
    quick_add_row = f"""
    <tr id="quick-add-row" class="quick-add-row">
        <td>
            <input type="date" id="quick-date" class="quick-input" value="{date.today().isoformat()}" />
        </td>
        <td>
            <select id="quick-type" class="quick-select" onchange="loadQuickCategories(this.value)">
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
                <option value="saving">Ahorro</option>
            </select>
        </td>
        <td>
            <select id="quick-category" class="quick-select">
                {category_options}
            </select>
        </td>
        <td>
            <select id="quick-account" class="quick-select">
                {account_options}
            </select>
        </td>
        <td>
            <input type="number" id="quick-amount" class="quick-input" placeholder="0.00" step="0.01" />
        </td>
        <td>
            <input type="text" id="quick-description" class="quick-input" placeholder="Descripción..." />
        </td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="saveQuickTransaction()" title="Guardar (Enter)">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i>
            </button>
        </td>
    </tr>
    """
    
    return f"""
    <table class="table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Cuenta</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            {quick_add_row}
            {''.join(rows) if rows else empty_message if not transactions else ''}
        </tbody>
    </table>
    """


@router.get("/transactions/category-summary", response_class=HTMLResponse)
async def category_summary_partial(db: Session = Depends(get_db)):
    """Resumen por categoría como HTML"""
    summary = db.query(
        Category.name,
        Category.type,
        func.sum(Transaction.amount).label('total')
    ).join(Transaction).filter(
        Transaction.status == 'completed'
    ).group_by(Category.id, Category.name, Category.type).all()
    
    if not summary:
        return '''
        <div style="text-align: center; padding: 4rem 2rem; background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); border-radius: 1rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
            <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No hay datos disponibles</h3>
            <p style="color: var(--text-secondary);">Los datos aparecerán aquí cuando registres transacciones</p>
        </div>
        '''
    
    rows = []
    for cat_name, cat_type, total in summary:
        type_config = {
            'income': {'badge': 'badge-success', 'text': '💚 Ingreso'},
            'expense': {'badge': 'badge-danger', 'text': '💸 Gasto'},
            'saving': {'badge': 'badge-info', 'text': '🏦 Ahorro'}
        }
        
        type_info = type_config.get(cat_type, {'badge': 'badge-info', 'text': cat_type})
        
        rows.append(f"""
        <tr style="transition: all 0.2s;">
            <td><strong>{cat_name}</strong></td>
            <td><span class="badge {type_info['badge']}">{type_info['text']}</span></td>
            <td class="text-right"><strong style="font-size: 1.1em; color: var(--primary-color);">S/ {total:,.2f}</strong></td>
        </tr>
        """)
    
    return f"""
    <table class="table">
        <thead>
            <tr>
                <th>Categoría</th>
                <th>Tipo</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            {''.join(rows)}
        </tbody>
    </table>
    """


@router.get("/categories/by-type", response_class=HTMLResponse)
async def categories_by_type_partial(
    type: str = "expense",
    db: Session = Depends(get_db)
):
    """Opciones de categorías filtradas por tipo"""
    categories = db.query(Category).filter(
        Category.type == type,
        Category.is_active == True
    ).all()
    
    options = ['<option value="">Selecciona una categoría</option>']
    for cat in categories:
        # Solo usar el nombre, sin icono en el option
        options.append(f'<option value="{cat.id}">{cat.name}</option>')
    
    return ''.join(options)


@router.get("/accounts/select", response_class=HTMLResponse)
async def accounts_select_partial(db: Session = Depends(get_db)):
    """Opciones de cuentas para select"""
    accounts = db.query(Account).filter(Account.is_active == True).all()
    
    options = ['<option value="">Selecciona una cuenta</option>']
    for acc in accounts:
        options.append(f'<option value="{acc.id}">{acc.name} (S/ {acc.balance:,.2f})</option>')
    
    return ''.join(options)


@router.get("/budget/load", response_class=HTMLResponse)
async def budget_load_partial(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Cargar presupuesto del mes con todas las categorías"""
    from datetime import date
    
    # Obtener solo las categorías activas
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.type, Category.name).all()
    
    # Obtener planes de presupuesto existentes para el período
    budget_plans = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.year == year,
            BudgetPlan.month == month
        )
    ).all()
    
    # Crear mapa de presupuestos por categoría
    budget_map = {bp.category_id: bp for bp in budget_plans}
    
    # Calcular transacciones reales del período
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Obtener totales por categoría
    actual_map = {}
    transactions = db.query(
        Transaction.category_id,
        func.sum(Transaction.amount).label('total')
    ).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.status == 'completed'
        )
    ).group_by(Transaction.category_id).all()
    
    for cat_id, total in transactions:
        actual_map[cat_id] = total
    
    # Agrupar por tipo
    categories_by_type = {'income': [], 'expense': [], 'saving': []}
    for cat in categories:
        categories_by_type[cat.type].append(cat)
    
    # Generar HTML
    sections_html = []
    
    for type_key, type_config in [
        ('income', {'title': '<i data-lucide="trending-up" style="width: 18px; height: 18px; vertical-align: middle;"></i> Ingresos', 'color': 'success'}),
        ('expense', {'title': '<i data-lucide="trending-down" style="width: 18px; height: 18px; vertical-align: middle;"></i> Gastos', 'color': 'danger'}),
        ('saving', {'title': '<i data-lucide="piggy-bank" style="width: 18px; height: 18px; vertical-align: middle;"></i> Ahorros', 'color': 'info'})
    ]:
        cats = categories_by_type[type_key]
        if not cats:
            continue
        
        rows = []
        total_budgeted = 0
        total_actual = 0
        
        for cat in cats:
            budget_plan = budget_map.get(cat.id)
            budgeted = budget_plan.amount if budget_plan else 0
            actual = actual_map.get(cat.id, 0)
            difference = actual - budgeted
            percentage = (actual / budgeted * 100) if budgeted > 0 else 0
            
            total_budgeted += budgeted
            total_actual += actual
            
            # Determinar color de la barra de progreso
            if percentage > 100:
                bar_color = '#ef4444'  # Rojo
            elif percentage > 80:
                bar_color = '#f59e0b'  # Amarillo
            else:
                bar_color = '#10b981'  # Verde
            
            # Usar el icono guardado en la BD, con color según tipo
            icon_color = {'income': '#059669', 'expense': '#dc2626', 'saving': '#2563eb'}[cat.type]
            icon = cat.icon if cat.icon else 'circle'
            
            rows.append(f"""
            <tr style="transition: all 0.2s;">
                <td class="category-name-cell" data-category-id="{cat.id}" style="cursor: pointer; transition: background 0.2s;" 
                    onmouseover="this.style.background='#f1f5f9'" 
                    onmouseout="this.style.background='transparent'">
                    <i data-lucide="{icon}" style="width: 18px; height: 18px; vertical-align: middle; color: {icon_color}; margin-right: 8px;"></i>
                    <strong>{cat.name}</strong>
                </td>
                <td class="text-right"><strong>S/ {budgeted:,.2f}</strong></td>
                <td class="text-right">S/ {actual:,.2f}</td>
                <td class="text-right" style="color: {'#ef4444' if difference > 0 else '#10b981'}">
                    S/ {difference:,.2f}
                </td>
                <td>
                    <div style="background: #e2e8f0; border-radius: 9999px; height: 8px; overflow: hidden;">
                        <div style="background: {bar_color}; width: {min(percentage, 100)}%; height: 100%; transition: width 0.3s;"></div>
                    </div>
                    <small style="color: var(--text-secondary);">{percentage:.1f}%</small>
                </td>
                <td class="text-right">
                    <button class="btn btn-sm" style="padding: 0.25rem 0.5rem; background: var(--primary-color); color: white;"
                            onclick="openBudgetModal({cat.id}, '{cat.name}', '{cat.type}', {budget_plan.id if budget_plan else 'null'}, {budgeted}, '{budget_plan.notes if budget_plan and budget_plan.notes else ''}', {year}, {month})">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px; vertical-align: middle;"></i> Editar Presupuesto
                    </button>
                </td>
            </tr>
            """)
        
        sections_html.append(f"""
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{type_config['title']}</h3>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <span class="badge badge-{type_config['color']}">Presupuestado: S/ {total_budgeted:,.2f}</span>
                    <span class="badge badge-{type_config['color']}">Real: S/ {total_actual:,.2f}</span>
                </div>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th class="text-right">Presupuestado</th>
                        <th class="text-right">Real</th>
                        <th class="text-right">Diferencia</th>
                        <th>Progreso</th>
                        <th class="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
        </div>
        """)
    
    return ''.join(sections_html)


@router.get("/budget/load-annual", response_class=HTMLResponse)
async def budget_load_annual_partial(
    year: int,
    db: Session = Depends(get_db)
):
    """Cargar presupuesto anual completo (12 meses) en formato tabla"""
    
    # Obtener solo las categorías activas ordenadas por tipo
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.type, Category.name).all()
    
    # Obtener todos los planes de presupuesto del año
    budget_plans = db.query(BudgetPlan).filter(BudgetPlan.year == year).all()
    
    # Crear mapa de presupuestos: {category_id: {month: amount}}
    budget_map = {}
    for bp in budget_plans:
        if bp.category_id not in budget_map:
            budget_map[bp.category_id] = {}
        budget_map[bp.category_id][bp.month] = bp.amount
    
    # Agrupar categorías por tipo
    categories_by_type = {'income': [], 'expense': [], 'saving': []}
    for cat in categories:
        categories_by_type[cat.type].append(cat)
    
    # Generar encabezados de meses
    month_names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    header_cells = ['<th>Categoría</th>']
    for month_name in month_names:
        header_cells.append(f'<th>{month_name}</th>')
    header_cells.append('<th>Total</th>')
    
    # Generar filas de categorías
    all_rows = []
    
    # Totales por mes para cálculos
    monthly_income = [0] * 12
    monthly_expense = [0] * 12
    monthly_saving = [0] * 12
    
    # Sección de Ingresos
    if categories_by_type['income']:
        all_rows.append('<tr class="category-section category-income"><td colspan="14"><i data-lucide="trending-up" style="width: 14px; height: 14px; vertical-align: middle;"></i> INGRESOS</td></tr>')
        for cat in categories_by_type['income']:
            # Usar el icono guardado en la BD, o un icono por defecto
            icon = cat.icon if cat.icon else 'circle-dollar-sign'
            row_cells = [f'<td><i data-lucide="{icon}" style="width: 16px; height: 16px; vertical-align: middle; color: #059669;"></i> {cat.name}</td>']
            row_total = 0
            for month in range(1, 13):
                amount = budget_map.get(cat.id, {}).get(month, 0)
                monthly_income[month - 1] += amount
                row_total += amount
                cell_html = f'''<td class="editable-cell" 
                                   onclick="editCell(this, {cat.id}, {month}, {amount})"
                                   data-category="{cat.id}" 
                                   data-month="{month}">
                    {f"{amount:,.2f}" if amount > 0 else "-"}
                </td>'''
                row_cells.append(cell_html)
            row_cells.append(f'<td><strong>{row_total:,.2f}</strong></td>')
            all_rows.append('<tr>' + ''.join(row_cells) + '</tr>')
    
    # Sección de Gastos
    if categories_by_type['expense']:
        all_rows.append('<tr class="category-section category-expense"><td colspan="14"><i data-lucide="trending-down" style="width: 14px; height: 14px; vertical-align: middle;"></i> GASTOS</td></tr>')
        for cat in categories_by_type['expense']:
            # Usar el icono guardado en la BD, o un icono por defecto
            icon = cat.icon if cat.icon else 'circle'
            row_cells = [f'<td><i data-lucide="{icon}" style="width: 16px; height: 16px; vertical-align: middle; color: #dc2626;"></i> {cat.name}</td>']
            row_total = 0
            for month in range(1, 13):
                amount = budget_map.get(cat.id, {}).get(month, 0)
                monthly_expense[month - 1] += amount
                row_total += amount
                cell_html = f'''<td class="editable-cell" 
                                   onclick="editCell(this, {cat.id}, {month}, {amount})"
                                   data-category="{cat.id}" 
                                   data-month="{month}">
                    {f"{amount:,.2f}" if amount > 0 else "-"}
                </td>'''
                row_cells.append(cell_html)
            row_cells.append(f'<td><strong>{row_total:,.2f}</strong></td>')
            all_rows.append('<tr>' + ''.join(row_cells) + '</tr>')
    
    # Sección de Ahorros
    if categories_by_type['saving']:
        all_rows.append('<tr class="category-section category-saving"><td colspan="14"><i data-lucide="piggy-bank" style="width: 14px; height: 14px; vertical-align: middle;"></i> AHORROS</td></tr>')
        for cat in categories_by_type['saving']:
            # Usar el icono guardado en la BD, o un icono por defecto
            icon = cat.icon if cat.icon else 'wallet'
            row_cells = [f'<td><i data-lucide="{icon}" style="width: 16px; height: 16px; vertical-align: middle; color: #2563eb;"></i> {cat.name}</td>']
            row_total = 0
            for month in range(1, 13):
                amount = budget_map.get(cat.id, {}).get(month, 0)
                monthly_saving[month - 1] += amount
                row_total += amount
                cell_html = f'''<td class="editable-cell" 
                                   onclick="editCell(this, {cat.id}, {month}, {amount})"
                                   data-category="{cat.id}" 
                                   data-month="{month}">
                    {f"{amount:,.2f}" if amount > 0 else "-"}
                </td>'''
                row_cells.append(cell_html)
            row_cells.append(f'<td><strong>{row_total:,.2f}</strong></td>')
            all_rows.append('<tr>' + ''.join(row_cells) + '</tr>')
    
    # Fila de totales
    total_row_cells = ['<td><strong>TOTALES</strong></td>']
    year_total_income = sum(monthly_income)
    year_total_expense = sum(monthly_expense)
    year_total_saving = sum(monthly_saving)
    
    for month in range(12):
        month_total = monthly_income[month] - monthly_expense[month] - monthly_saving[month]
        total_row_cells.append(f'<td><strong>{month_total:,.2f}</strong></td>')
    
    year_grand_total = year_total_income - year_total_expense - year_total_saving
    total_row_cells.append(f'<td><strong>{year_grand_total:,.2f}</strong></td>')
    all_rows.append('<tr class="total-row">' + ''.join(total_row_cells) + '</tr>')
    
    # Fila "Por asignar" (To be allocated)
    allocate_row_cells = ['<td><strong><i data-lucide="wallet" style="width: 14px; height: 14px; vertical-align: middle;"></i> POR ASIGNAR</strong></td>']
    for month in range(12):
        to_allocate = monthly_income[month] - monthly_expense[month] - monthly_saving[month]
        color = '#059669' if to_allocate >= 0 else '#dc2626'
        allocate_row_cells.append(f'<td style="color: {color};"><strong>{to_allocate:,.2f}</strong></td>')
    
    year_to_allocate = year_total_income - year_total_expense - year_total_saving
    allocate_color = '#059669' if year_to_allocate >= 0 else '#dc2626'
    allocate_row_cells.append(f'<td style="color: {allocate_color};"><strong>{year_to_allocate:,.2f}</strong></td>')
    
    # Insertar fila "Por asignar" al inicio
    all_rows.insert(0, '<tr class="to-allocate-row">' + ''.join(allocate_row_cells) + '</tr>')
    
    # Generar HTML completo
    html = f"""
    <div class="card">
        <div class="table-wrapper">
            <table class="budget-table">
                <thead>
                    <tr>
                        {''.join(header_cells)}
                    </tr>
                </thead>
                <tbody>
                    {''.join(all_rows)}
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="card" style="margin-top: 1rem;">
        <div class="card-header">
            <h3 class="card-title"><i data-lucide="wrench" style="width: 18px; height: 18px; vertical-align: middle;"></i> Herramientas</h3>
        </div>
        <div class="toolbar">
            <button class="btn" onclick="copyMonth(1)"><i data-lucide="copy" style="width: 16px; height: 16px; vertical-align: middle;"></i> Copiar Enero a todos</button>
            <button class="btn" onclick="copyMonth(2)"><i data-lucide="copy" style="width: 16px; height: 16px; vertical-align: middle;"></i> Copiar Febrero a todos</button>
            <button class="btn" onclick="copyMonth(3)"><i data-lucide="copy" style="width: 16px; height: 16px; vertical-align: middle;"></i> Copiar Marzo a todos</button>
        </div>
        <p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
            <i data-lucide="info" style="width: 14px; height: 14px; vertical-align: middle;"></i> Haz clic en cualquier celda para editar. Presiona Enter para guardar, Escape para cancelar.
        </p>
    </div>
    """
    
    return html


@router.get("/api/analysis/data")
async def analysis_data(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Datos para el análisis presupuestario"""
    # Calcular rango de fechas
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Obtener categorías activas
    categories = db.query(Category).filter(Category.is_active == True).all()
    
    # Agrupar categorías por tipo
    income_cats = [c for c in categories if c.type == "income"]
    expense_cats = [c for c in categories if c.type == "expense"]
    saving_cats = [c for c in categories if c.type == "saving"]
    
    # Función para obtener datos de una categoría
    def get_category_data(cat):
        # Obtener presupuesto
        budget_plan = db.query(BudgetPlan).filter(
            and_(
                BudgetPlan.category_id == cat.id,
                BudgetPlan.year == year,
                BudgetPlan.month == month
            )
        ).first()
        budget_amount = budget_plan.amount if budget_plan else 0.0
        
        # Obtener transacciones trackeadas
        tracked_amount = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.category_id == cat.id,
                Transaction.date >= start_date,
                Transaction.date < end_date,
                Transaction.status == "completed"
            )
        ).scalar() or 0.0
        
        return {
            "name": cat.name,
            "budget": budget_amount,
            "tracked": tracked_amount,
            "icon": cat.icon,
            "color": cat.color
        }
    
    # Obtener datos de cada categoría
    income_data = [get_category_data(c) for c in income_cats]
    expense_data = [get_category_data(c) for c in expense_cats]
    saving_data = [get_category_data(c) for c in saving_cats]
    
    # Calcular totales
    total_income_budget = sum(c["budget"] for c in income_data)
    total_income_tracked = sum(c["tracked"] for c in income_data)
    total_expense_budget = sum(c["budget"] for c in expense_data)
    total_expense_tracked = sum(c["tracked"] for c in expense_data)
    total_saving_budget = sum(c["budget"] for c in saving_data)
    total_saving_tracked = sum(c["tracked"] for c in saving_data)
    
    # Calcular KPIs
    # 1. Cumplimiento del período (% de transacciones vs presupuesto total)
    total_budget = total_income_budget + total_expense_budget + total_saving_budget
    total_tracked = total_income_tracked + total_expense_tracked + total_saving_tracked
    completion = round((total_tracked / total_budget * 100) if total_budget > 0 else 0, 1)
    
    # 2. Balance de seguimiento (ingresos trackeados - gastos trackeados - ahorros trackeados)
    balance = total_income_tracked - total_expense_tracked - total_saving_tracked
    
    # 3. Tasa de ahorro (ahorros / ingresos)
    savings_rate = round((total_saving_tracked / total_income_tracked * 100) if total_income_tracked > 0 else 0, 1)
    
    # Preparar datos para gráficos de donut
    def prepare_chart_data(data_list, type_color):
        # Filtrar categorías con datos y ordenar por monto trackeado (descendente)
        filtered = [c for c in data_list if c["tracked"] > 0 or c["budget"] > 0]
        filtered.sort(key=lambda x: x["tracked"], reverse=True)
        
        # Si no hay datos, retornar placeholder
        if not filtered:
            return {
                "labels": ["Sin datos"],
                "datasets": [{
                    "data": [1],
                    "backgroundColor": ["#e5e7eb"],
                    "borderWidth": 0
                }]
            }
        
        # Tomar solo el Top 5
        top_5 = filtered[:5]
        
        # Si hay más de 5, agrupar el resto como "Otros"
        if len(filtered) > 5:
            others_sum = sum(c["tracked"] for c in filtered[5:])
            top_5.append({"name": "Otros", "tracked": others_sum, "budget": 0})
        
        labels = [c["name"] for c in top_5]
        tracked_values = [c["tracked"] for c in top_5]
        
        # Colores más distinguibles y contrastantes
        if type_color == "income":
            # Verde, Turquesa, Esmeralda, Cyan, Lima, Gris
            base_colors = [
                "#10b981", "#14b8a6", "#059669", "#06b6d4", "#84cc16", "#94a3b8"
            ]
        elif type_color == "expense":
            # Rojo, Naranja, Rosa, Morado, Ámbar, Gris
            base_colors = [
                "#ef4444", "#f97316", "#ec4899", "#a855f7", "#f59e0b", "#94a3b8"
            ]
        else:  # saving
            # Azul, Índigo, Violeta, Cyan oscuro, Azul claro, Gris
            base_colors = [
                "#3b82f6", "#6366f1", "#8b5cf6", "#0891b2", "#0ea5e9", "#94a3b8"
            ]
        
        # Asignar colores (el último color gris es para "Otros")
        colors = [base_colors[i] for i in range(len(top_5))]
        
        return {
            "labels": labels,
            "datasets": [{
                "data": tracked_values,
                "backgroundColor": colors,
                "borderWidth": 2,
                "borderColor": "#ffffff"
            }]
        }
    
    # Preparar respuesta
    response = {
        "kpis": {
            "completion": completion,
            "balance": balance,
            "savings_rate": savings_rate
        },
        "charts": {
            "income": prepare_chart_data(income_data, "income"),
            "expenses": prepare_chart_data(expense_data, "expense"),
            "savings": prepare_chart_data(saving_data, "saving")
        },
        "breakdowns": {
            "income": sorted(income_data, key=lambda x: x["tracked"], reverse=True),
            "expenses": sorted(expense_data, key=lambda x: x["tracked"], reverse=True),
            "savings": sorted(saving_data, key=lambda x: x["tracked"], reverse=True)
        }
    }
    
    return response


