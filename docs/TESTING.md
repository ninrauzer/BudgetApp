# BudgetApp - Testing Guide

## 🧪 Testing

### Ejecutar Tests

La aplicación incluye tests automatizados usando **pytest** para validar la lógica de negocio crítica sin afectar tus datos reales.

```bash
# Activar entorno virtual (si no está activado)
cd backend
.\.venv\Scripts\Activate.ps1

# Ejecutar todos los tests
pytest

# Ejecutar con output detallado
pytest -v

# Ejecutar solo tests específicos
pytest tests/test_budget_comparison.py
pytest tests/test_merge_categories.py

# Ver cobertura de código (requiere pytest-cov)
pytest --cov=app --cov-report=html
```

### Estructura de Tests

```
tests/
├── conftest.py                    # Fixtures compartidos (DB in-memory, seed data)
├── test_budget_comparison.py      # Tests del endpoint de comparación presupuesto vs. real
├── test_merge_categories.py       # Tests de merge de categorías duplicadas
└── test_smoke.py                  # Test básico de sanidad
```

### Fixtures Principales

- **`db_session`**: Sesión de base de datos SQLite en memoria con datos semilla (ciclo, categorías, transacciones, presupuesto).
- **`client`**: Cliente HTTP de prueba (FastAPI TestClient) listo para invocar endpoints.

Los tests usan una base de datos completamente aislada en memoria (`sqlite://`), configurada mediante la variable de entorno `BUDGETAPP_DATABASE_URL`. **Tus datos reales (`backend/budget.db`) nunca se tocan durante los tests.**

### Tests Implementados

#### 1. `test_budget_vs_actual_noviembre`

Valida que el endpoint `/api/budget-plans/comparison/Noviembre` calcule correctamente:

- ✅ Montos presupuestados y reales por categoría
- ✅ Varianzas y porcentajes de compliance  
- ✅ Totales de ingresos, gastos y ahorros
- ✅ Fórmula de compliance global

**Archivo:** `tests/test_budget_comparison.py`

**Qué verifica:**
```python
# Estructura de respuesta
assert data["cycle_name"] == "Noviembre"
assert "categories" in data
assert "summary" in data

# Datos de categorías
assert salario["budgeted"] == 10000.0
assert salario["actual"] == 8000.0
assert salario["variance"] == 2000.0
assert salario["compliance_percentage"] == 80.0

# Totales y ahorros
assert summary["total_budgeted_income"] == 10000.0
assert summary["total_actual_saving"] == 7550.0
```

#### 2. `test_merge_duplicate_categories`

Verifica que la función de merge de categorías duplicadas:

- ✅ Elija la categoría canónica correcta (más transacciones, o menor ID en empate)
- ✅ Reasigne todas las transacciones
- ✅ Combine budget plans del mismo ciclo sumando montos
- ✅ Elimine categorías obsoletas sin dejar huérfanos

**Archivo:** `tests/test_merge_categories.py`

**Qué verifica:**
```python
# Resultado de merge
assert result["removed_count"] == 1
assert dup_info["canonical_id"] == cat_a_id  # cat_a tenía más transacciones

# Estado de la base de datos
remaining_categories = db_session.query(Category).filter(Category.name == "Extra").all()
assert len(remaining_categories) == 1  # Solo queda la canónica

# Transacciones reasignadas
reassigned_txs = db_session.query(Transaction).filter(Transaction.category_id == cat_a_id).all()
assert len(reassigned_txs) == 4  # 3 originales + 1 reasignada

# Budget plans fusionados
plans = db_session.query(BudgetPlan).filter(BudgetPlan.category_id == cat_a_id).all()
assert len(plans) == 1
assert plans[0].amount == 450  # 300 + 150 sumados

# Sin huérfanos
orphan_count = db_session.query(Transaction).filter(Transaction.category_id == cat_b_id).count()
assert orphan_count == 0
```

### Añadir Nuevos Tests

Para crear un nuevo test:

1. **Crea un archivo** `test_*.py` en `tests/`
2. **Usa fixtures** para obtener recursos preparados:
   ```python
   def test_my_feature(db_session, client):
       # db_session: BD limpia con datos seed
       # client: FastAPI TestClient
       ...
   ```
3. **Escribe asserts** para validar respuesta o estado de BD

**Ejemplo básico:**

```python
def test_categories_list(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
```

**Ejemplo con datos semilla:**

```python
from app.models.category import Category

def test_create_category(db_session, client):
    # Arrange: preparar datos
    payload = {"name": "Test Category", "type": "expense", "icon": "test"}
    
    # Act: invocar endpoint
    response = client.post("/api/categories", json=payload)
    
    # Assert: verificar respuesta y BD
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Test Category"
    
    # Confirmar en BD
    cat = db_session.query(Category).filter(Category.name == "Test Category").first()
    assert cat is not None
    assert cat.type == "expense"
```

### Ventajas del Enfoque Actual

1. **Aislamiento Total:** Base de datos en memoria separada de producción
2. **Rapidez:** Tests ejecutan en <1 segundo cada uno
3. **Reproducibilidad:** Cada test arranca con estado conocido (seed data)
4. **Seguridad:** Cero riesgo de corromper datos reales
5. **Cobertura:** Validamos lógica crítica (comparación, merge, agregaciones)

### Próximos Pasos Sugeridos

- [ ] Añadir test para endpoint de creación de transacciones
- [ ] Test de validación de fechas de ciclo de facturación
- [ ] Test de filtrado de transacciones por rango de fechas
- [ ] Test de soft-delete de categorías
- [ ] Integración con GitHub Actions para CI/CD

---

**Documentación adicional:**
- [Configuración de conftest.py](../tests/conftest.py)
- [Modelo de Datos](./RFC-002-data-model.md)
- [API Design](./RFC-003-api-design.md)
