# ADR-004: Sistema de Etiquetas (Tags) para Transacciones

**Estado:** Propuesto  
**Fecha:** 2025-11-15  
**Autores:** Equipo BudgetApp  
**Contexto:** Necesidad de desglosar categorías sin crear subcategorías jerárquicas

---

## Contexto y Problema

Los usuarios necesitan **analizar el desglose interno de sus categorías** sin tener visibilidad granular de en qué se está gastando exactamente. 

### Problema Específico

**Escenario Real:**
```
Categoría: Mascotas
Total gastado: 849 PEN

Preguntas sin respuesta:
- ¿Cuánto gasté en comida vs baño vs veterinario?
- ¿Están aumentando los gastos de paseos?
- ¿El gasto de veterinario es recurrente o fue emergencia?
```

**Otros casos:**
- **Préstamos:** No se distingue entre capital, intereses y comisiones
- **Alimentación:** No se sabe cuánto es delivery vs supermercado vs restaurante
- **Transporte:** No se diferencia Uber vs gasolina vs peajes
- **Salud:** Medicinas vs consultas vs exámenes

### Soluciones Evaluadas y Descartadas

#### ❌ Opción 1: Subcategorías Jerárquicas
```
Mascotas
  ├── Comida
  │   ├── Alimento seco
  │   └── Alimento húmedo
  ├── Salud
  │   ├── Veterinario
  │   └── Medicinas
  └── Servicios
      ├── Baño
      └── Paseos
```

**Problemas:**
- ✗ Jerarquía rígida difícil de mantener
- ✗ No permite clasificaciones múltiples (¿un gasto de "comida especial por enfermedad" va en Comida o Salud?)
- ✗ Complica la UI con dropdowns anidados
- ✗ Migración compleja de datos existentes
- ✗ Reportes y análisis más complejos (joins adicionales)

#### ❌ Opción 2: Campo "Descripción" estructurado
```
Descripción: "Comida | Hills 15kg | Pet Shop La Molina"
```

**Problemas:**
- ✗ No es queryable/filtrable eficientemente
- ✗ Requiere parsing manual
- ✗ Sin validación ni sugerencias
- ✗ Propenso a errores de tipeo e inconsistencias

#### ❌ Opción 3: Múltiples categorías por transacción
```
Transaction:
  primary_category: "Mascotas"
  secondary_category: "Comida"
  tertiary_category: "Alimento Seco"
```

**Problemas:**
- ✗ Limita a 2-3 niveles fijos
- ✗ No resuelve clasificaciones cruzadas
- ✗ Complica cálculos y agregaciones

---

## Decisión

Implementaremos un **sistema flexible de etiquetas (tags)** que permite:

1. **Múltiples tags por transacción** (sin jerarquía fija)
2. **Sugerencias inteligentes** basadas en categoría y contexto
3. **Formato especial para valores** (ej: `capital:1200` para préstamos)
4. **Filtros y agrupaciones dinámicas** en análisis y reportes

---

## Diseño de la Solución

### 1. Modelo de Datos

#### Backend (SQLAlchemy)
```python
# app/models/transaction.py
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String(500), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))
    currency = Column(String(3), default="PEN")
    transaction_type = Column(String(20))  # income, expense, transfer
    transfer_id = Column(String(36), nullable=True)
    related_transaction_id = Column(Integer, nullable=True)
    
    # NUEVO CAMPO
    tags = Column(JSON, nullable=True, default=list)
    # Formato: ["comida", "delivery", "saludable"]
    # O con valores: ["capital:1200", "intereses:250", "comisión:50"]
```

#### Migración (Alembic)
```python
# alembic/versions/xxx_add_tags_to_transactions.py
def upgrade():
    op.add_column('transactions', sa.Column('tags', sa.JSON(), nullable=True))
    
    # Índice GIN para búsquedas eficientes (PostgreSQL)
    # op.execute('CREATE INDEX idx_transactions_tags ON transactions USING GIN (tags)')
    
    # Para SQLite (actual)
    # No soporta GIN, pero el campo JSON es queryable

def downgrade():
    op.drop_column('transactions', 'tags')
```

#### Schemas (Pydantic)
```python
# app/schemas/transaction.py
class TransactionBase(BaseModel):
    date: date
    amount: float
    description: str
    category_id: int
    account_id: int
    currency: str = "PEN"
    transaction_type: str
    tags: list[str] | None = None  # NUEVO

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    transfer_id: str | None = None
    related_transaction_id: int | None = None
    
    class Config:
        from_attributes = True

class TransactionWithDetails(Transaction):
    category_name: str
    category_icon: str
    category_type: str
    account_name: str
```

### 2. Endpoints de API

#### 2.1. Obtener todos los tags usados
```python
# app/api/transactions.py
@router.get("/tags", response_model=TagsResponse)
def get_all_tags(
    category_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Retorna todos los tags únicos usados en transacciones.
    
    Query params:
    - category_id: Filtrar tags de una categoría específica
    
    Returns:
    {
      "tags": ["comida", "baño", "veterinario", ...],
      "tag_counts": {
        "comida": 45,
        "baño": 12,
        "veterinario": 8
      }
    }
    """
    query = db.query(Transaction)
    
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    transactions = query.all()
    
    # Extraer todos los tags
    tag_counter = Counter()
    for transaction in transactions:
        if transaction.tags:
            tag_counter.update(transaction.tags)
    
    return {
        "tags": sorted(tag_counter.keys()),
        "tag_counts": dict(tag_counter)
    }
```

#### 2.2. Analizar gastos por tags
```python
@router.get("/analysis/by-tags", response_model=TagAnalysisResponse)
def analyze_by_tags(
    category_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db)
):
    """
    Agrupa transacciones de una categoría por tags.
    
    Returns:
    {
      "category_name": "Mascotas",
      "total_amount": 849.00,
      "tag_breakdown": [
        {
          "tag": "comida",
          "total": 350.00,
          "count": 4,
          "percentage": 41.2,
          "average": 87.50,
          "transactions": [...]
        },
        {
          "tag": "baño",
          "total": 240.00,
          "count": 3,
          "percentage": 28.3,
          "average": 80.00,
          "transactions": [...]
        }
      ]
    }
    """
    query = db.query(Transaction).filter(
        Transaction.category_id == category_id
    )
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.all()
    total_amount = sum(t.amount for t in transactions)
    
    # Agrupar por tag
    tag_groups = defaultdict(list)
    for transaction in transactions:
        if transaction.tags:
            for tag in transaction.tags:
                tag_groups[tag].append(transaction)
    
    # Calcular estadísticas por tag
    breakdown = []
    for tag, tag_transactions in tag_groups.items():
        tag_total = sum(t.amount for t in tag_transactions)
        breakdown.append({
            "tag": tag,
            "total": tag_total,
            "count": len(tag_transactions),
            "percentage": (tag_total / total_amount * 100) if total_amount > 0 else 0,
            "average": tag_total / len(tag_transactions),
            "transactions": [TransactionWithDetails.from_orm(t) for t in tag_transactions]
        })
    
    # Ordenar por total descendente
    breakdown.sort(key=lambda x: x["total"], reverse=True)
    
    category = db.query(Category).get(category_id)
    
    return {
        "category_name": category.name,
        "total_amount": total_amount,
        "tag_breakdown": breakdown
    }
```

### 3. Frontend - UI Components

#### 3.1. TransactionModal - Input de Tags
```tsx
// frontend/src/components/TransactionModal.tsx
import { X } from 'lucide-react';

// Sugerencias predefinidas por categoría
const TAG_SUGGESTIONS: Record<string, string[]> = {
  'Mascotas': ['comida', 'baño', 'veterinario', 'paseos', 'juguetes', 'medicinas', 'accesorios'],
  'Préstamos': ['capital', 'intereses', 'comisión', 'seguro', 'adelanto'],
  'Alimentación': ['delivery', 'supermercado', 'restaurante', 'snacks', 'bebidas'],
  'Transporte': ['uber', 'gasolina', 'peaje', 'estacionamiento', 'mantenimiento', 'taxi'],
  'Salud': ['medicinas', 'consulta', 'exámenes', 'emergencia', 'preventivo'],
  'Entretenimiento': ['cine', 'streaming', 'videojuegos', 'libros', 'conciertos'],
  'Hogar': ['alquiler', 'servicios', 'mantenimiento', 'decoración', 'limpieza'],
};

export function TransactionModal({ ... }) {
  const [tags, setTags] = useState<string[]>(transaction?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  // Obtener sugerencias según categoría seleccionada
  const suggestions = selectedCategoryName 
    ? TAG_SUGGESTIONS[selectedCategoryName] || [] 
    : [];
  
  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  return (
    <Modal>
      {/* ... campos existentes ... */}
      
      {/* NUEVO CAMPO DE TAGS */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary">
          Etiquetas (Opcional)
        </label>
        
        {/* Tags actuales */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-surface rounded-lg border border-border">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Input para agregar tags */}
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Escribe y presiona Enter para agregar"
            className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        {/* Sugerencias rápidas */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary font-medium">
              Sugerencias rápidas:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions
                .filter(s => !tags.includes(s))
                .map(suggested => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => addTag(suggested)}
                    className="text-xs px-3 py-1.5 bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary border border-border hover:border-primary/30 rounded-lg transition-all"
                  >
                    + {suggested}
                  </button>
                ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-text-secondary italic">
          Las etiquetas te ayudan a desglosar tus gastos dentro de cada categoría
        </p>
      </div>
      
      {/* ... resto del modal ... */}
    </Modal>
  );
}
```

#### 3.2. TransactionTable - Mostrar Tags
```tsx
// frontend/src/components/TransactionTable.tsx
<td className="px-6 py-4">
  <div className="flex flex-col gap-2">
    <span className="text-sm text-text-primary">{transaction.description}</span>
    
    {/* Tags */}
    {transaction.tags && transaction.tags.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {transaction.tags.map(tag => (
          <span
            key={tag}
            className="inline-block bg-primary/5 text-primary px-2 py-0.5 rounded-md text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</td>
```

#### 3.3. Filtro por Tags en Transactions.tsx
```tsx
// frontend/src/pages/Transactions.tsx
const { data: allTagsData } = useQuery({
  queryKey: ['transaction-tags'],
  queryFn: () => transactionApi.getAllTags()
});

const [selectedTags, setSelectedTags] = useState<string[]>([]);

// Filtrar transacciones
const filteredTransactions = transactions.filter(t => {
  if (selectedTags.length === 0) return true;
  return selectedTags.some(tag => t.tags?.includes(tag));
});

return (
  <>
    {/* Filtros existentes */}
    
    {/* NUEVO: Filtro de tags */}
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-semibold text-text-secondary">
        Filtrar por etiquetas:
      </span>
      {allTagsData?.tags.map(tag => (
        <button
          key={tag}
          onClick={() => {
            setSelectedTags(prev =>
              prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
            );
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            selectedTags.includes(tag)
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary border border-border hover:border-primary'
          }`}
        >
          {tag} ({allTagsData.tag_counts[tag]})
        </button>
      ))}
    </div>
  </>
);
```

#### 3.4. Análisis por Tags - Componente Nuevo
```tsx
// frontend/src/components/CategoryTagBreakdown.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TagBreakdownProps {
  categoryId: number;
  categoryName: string;
  startDate?: string;
  endDate?: string;
}

export function CategoryTagBreakdown({ categoryId, categoryName, startDate, endDate }: TagBreakdownProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['tag-analysis', categoryId, startDate, endDate],
    queryFn: () => analysisApi.getTagBreakdown(categoryId, startDate, endDate)
  });
  
  const [expandedTag, setExpandedTag] = useState<string | null>(null);
  
  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Desglose: {categoryName}
          <span className="ml-2 text-lg font-bold text-primary">
            {formatCurrencyISO(data.total_amount, 'PEN')}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Gráfico de barras */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.tag_breakdown}>
            <XAxis dataKey="tag" />
            <YAxis />
            <Tooltip 
              formatter={(value) => formatCurrencyISO(value as number, 'PEN')}
            />
            <Bar dataKey="total" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Tabla detallada */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50 border-b border-border">
              <tr className="text-xs text-text-secondary font-semibold">
                <th className="text-left px-4 py-3">Etiqueta</th>
                <th className="text-right px-4 py-3">Monto Total</th>
                <th className="text-right px-4 py-3">% del Total</th>
                <th className="text-right px-4 py-3">Transacciones</th>
                <th className="text-right px-4 py-3">Promedio</th>
                <th className="text-center px-4 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {data.tag_breakdown.map(tagData => (
                <>
                  <tr 
                    key={tagData.tag}
                    className="border-b border-border hover:bg-surface/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                        {tagData.tag}
                      </span>
                    </td>
                    <td className="text-right px-4 py-4 font-bold text-text-primary">
                      {formatCurrencyISO(tagData.total, 'PEN')}
                    </td>
                    <td className="text-right px-4 py-4 text-text-secondary">
                      {tagData.percentage.toFixed(1)}%
                    </td>
                    <td className="text-right px-4 py-4 text-text-secondary">
                      {tagData.count}
                    </td>
                    <td className="text-right px-4 py-4 text-text-secondary">
                      {formatCurrencyISO(tagData.average, 'PEN')}
                    </td>
                    <td className="text-center px-4 py-4">
                      <button
                        onClick={() => setExpandedTag(
                          expandedTag === tagData.tag ? null : tagData.tag
                        )}
                        className="text-primary hover:text-primary/70 transition-colors"
                      >
                        {expandedTag === tagData.tag ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Transacciones expandidas */}
                  {expandedTag === tagData.tag && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-surface/20">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-text-secondary mb-3">
                            Transacciones con etiqueta "{tagData.tag}":
                          </p>
                          {tagData.transactions.map(t => (
                            <div 
                              key={t.id}
                              className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-border"
                            >
                              <div>
                                <p className="font-medium text-text-primary">{t.description}</p>
                                <p className="text-xs text-text-secondary">
                                  {new Date(t.date).toLocaleDateString('es-PE')}
                                </p>
                              </div>
                              <span className="font-bold text-text-primary">
                                {formatCurrencyISO(t.amount, t.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.5. Integración en Analysis.tsx
```tsx
// frontend/src/pages/Analysis.tsx

// Al hacer click en una categoría del pie chart
const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

<PieChart>
  <Pie
    data={pieData}
    onClick={(data) => setSelectedCategory(data.categoryId)}
    // ... resto de props
  />
</PieChart>

{/* Mostrar desglose cuando se selecciona una categoría */}
{selectedCategory && (
  <CategoryTagBreakdown
    categoryId={selectedCategory}
    categoryName={categories.find(c => c.id === selectedCategory)?.name || ''}
    startDate={cycleParams?.startDate}
    endDate={cycleParams?.endDate}
  />
)}
```

### 4. Tags con Valores (Caso Préstamos)

#### Formato especial: `clave:valor`
```typescript
// Ejemplo: Cuota de préstamo
{
  category: "Préstamos",
  description: "Cuota BCP - Préstamo Personal",
  amount: 1500,
  tags: [
    "capital:1200",
    "intereses:250",
    "comisión:50",
    "prestamo-bcp",
    "cuota-12-36"
  ]
}
```

#### Parser de tags con valores
```typescript
// frontend/src/lib/tagUtils.ts
export interface ParsedTag {
  key: string;
  value: number | null;
  original: string;
}

export function parseTag(tag: string): ParsedTag {
  const colonIndex = tag.indexOf(':');
  if (colonIndex === -1) {
    return { key: tag, value: null, original: tag };
  }
  
  const key = tag.substring(0, colonIndex);
  const valueStr = tag.substring(colonIndex + 1);
  const value = parseFloat(valueStr);
  
  return {
    key,
    value: isNaN(value) ? null : value,
    original: tag
  };
}

export function aggregateTagValues(tags: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  tags.forEach(tag => {
    const parsed = parseTag(tag);
    if (parsed.value !== null) {
      result[parsed.key] = (result[parsed.key] || 0) + parsed.value;
    }
  });
  
  return result;
}
```

#### UI para tags de préstamos
```tsx
// Componente especializado para préstamos
export function LoanBreakdown({ categoryId }: { categoryId: number }) {
  const { data } = useQuery({
    queryKey: ['tag-analysis', categoryId],
    queryFn: () => analysisApi.getTagBreakdown(categoryId)
  });
  
  // Extraer y agregar tags con valores
  const loanComponents = useMemo(() => {
    const components: Record<string, number> = {};
    
    data?.tag_breakdown.forEach(tagData => {
      tagData.transactions.forEach(t => {
        t.tags?.forEach(tag => {
          const parsed = parseTag(tag);
          if (parsed.value !== null) {
            components[parsed.key] = (components[parsed.key] || 0) + parsed.value;
          }
        });
      });
    });
    
    return components;
  }, [data]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de Préstamos - Año 2025</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            variant="info"
            label="Capital Pagado"
            value={loanComponents.capital || 0}
            currency="PEN"
          />
          <StatCard
            variant="warning"
            label="Intereses"
            value={loanComponents.intereses || 0}
            currency="PEN"
          />
          <StatCard
            variant="danger"
            label="Comisiones"
            value={loanComponents.comisión || 0}
            currency="PEN"
          />
        </div>
        
        {/* Gráfico de barras apiladas por mes */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyLoanData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="capital" stackId="a" fill="#3B82F6" />
            <Bar dataKey="intereses" stackId="a" fill="#F59E0B" />
            <Bar dataKey="comisión" stackId="a" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## Casos de Uso

### Caso 1: Analizar gastos de Mascotas

**Escenario:**
Usuario quiere saber cuánto gasta en comida vs servicios para su mascota.

**Flujo:**
1. Registra transacciones con tags:
   - "Comida Hills 15kg" → tags: `["comida", "alimento-seco"]`
   - "Baño en Pet Shop" → tags: `["baño", "grooming"]`
   - "Consulta veterinaria" → tags: `["veterinario", "chequeo"]`

2. En página de Análisis, hace click en categoría "Mascotas"

3. Ve desglose automático:
   ```
   Mascotas - 849 PEN
   ├── comida: 350 PEN (41%) - 4 transacciones
   ├── baño: 240 PEN (28%) - 3 transacciones
   ├── veterinario: 180 PEN (21%) - 1 transacción
   └── paseos: 79 PEN (9%) - 8 transacciones
   ```

4. Puede expandir cada tag para ver transacciones individuales

**Beneficio:** Identifica que está gastando mucho en baños y puede optimizar (ej: bañar en casa)

### Caso 2: Desglosar pagos de préstamos

**Escenario:**
Usuario tiene múltiples préstamos y quiere saber cuánto paga en intereses.

**Flujo:**
1. Al registrar cuota mensual:
   ```
   Descripción: "Cuota BCP Préstamo Personal"
   Monto: 1,500 PEN
   Tags: ["capital:1200", "intereses:250", "comisión:50", "prestamo-bcp"]
   ```

2. En análisis anual, ve componente especializado de préstamos:
   ```
   Préstamos - Total pagado: 18,000 PEN
   
   Capital:       14,400 PEN (80.0%)
   Intereses:      3,000 PEN (16.7%)
   Comisiones:       600 PEN (3.3%)
   ```

3. Puede comparar diferentes préstamos filtrando por tag `prestamo-bcp` vs `prestamo-interbank`

**Beneficio:** Visibilidad clara del costo real del crédito

### Caso 3: Comparar delivery vs supermercado

**Escenario:**
Usuario sospecha que gasta mucho en delivery pero no tiene datos.

**Flujo:**
1. Etiqueta transacciones de alimentación:
   - Rappi/Uber Eats → tag: `delivery`
   - Compras en Wong/Plaza Vea → tag: `supermercado`
   - Restaurantes → tag: `restaurante`

2. Filtra categoría "Alimentación" por tags

3. Ve comparación:
   ```
   Alimentación - 2,500 PEN
   ├── delivery: 1,200 PEN (48%) - 🚨 ¡Casi la mitad!
   ├── supermercado: 900 PEN (36%)
   └── restaurante: 400 PEN (16%)
   ```

**Beneficio:** Decide reducir deliveries y cocinar más en casa

---

## Ventajas de esta Solución

### ✅ Flexibilidad
- Sin jerarquías rígidas
- Múltiples tags por transacción
- Fácil agregar/quitar tags en cualquier momento

### ✅ Usabilidad
- Sugerencias inteligentes por categoría
- Autocompletado mientras escribes
- Tags rápidos con un click

### ✅ Análisis Potente
- Filtrado dinámico por uno o múltiples tags
- Agregaciones automáticas
- Comparaciones cruzadas (ej: todos los gastos con tag "delivery" sin importar categoría)

### ✅ Escalabilidad
- No aumenta complejidad del modelo de datos
- Queries eficientes con índices JSON
- Backend agnóstico a los tags (no necesita conocer lista predefinida)

### ✅ Migración Suave
- Columna nullable - no rompe datos existentes
- No requiere recategorización masiva
- Usuarios pueden adoptar gradualmente

### ✅ Casos Especiales
- Formato `clave:valor` para datos estructurados (préstamos)
- Tags compartidos entre categorías (ej: `delivery` en Alimentación y Farmacia)

---

## Desventajas y Mitigaciones

### ⚠️ Inconsistencia de tags
**Problema:** Usuarios pueden crear typos (`comda` vs `comida`)

**Mitigación:**
- Sugerencias predefinidas por categoría
- Normalización automática (lowercase, trim)
- En futuro: IA que sugiere tags basado en descripción (ADR-005)

### ⚠️ Performance en queries complejas
**Problema:** Búsquedas en JSON pueden ser lentas con muchos datos

**Mitigación:**
- SQLite tiene soporte nativo para JSON
- Si migra a PostgreSQL: índices GIN para JSON
- Límite razonable de tags por transacción (ej: máx 10)
- Caching de queries frecuentes

### ⚠️ Tags no validados
**Problema:** Backend no valida tags, pueden ser cualquier string

**Mitigación:**
- Frontend maneja validación (longitud, caracteres permitidos)
- En futuro: endpoint para obtener tags "oficiales" más usados
- Opción de "tag management" para renombrar/fusionar tags

---

## Plan de Implementación

### Fase 1: Backend Base (1-2 horas)
- [ ] Migración Alembic: agregar columna `tags JSON`
- [ ] Actualizar schemas Pydantic
- [ ] Modificar endpoints CRUD para aceptar/retornar tags
- [ ] Endpoint GET `/api/transactions/tags`

### Fase 2: UI Básica (2-3 horas)
- [ ] Input de tags en `TransactionModal`
- [ ] Sugerencias predefinidas por categoría
- [ ] Mostrar tags en tabla de transacciones
- [ ] Normalización de tags (lowercase, trim)

### Fase 3: Filtros (1-2 horas)
- [ ] Filtro por tags en página Transactions
- [ ] Contador de transacciones por tag
- [ ] Multi-selección de tags

### Fase 4: Análisis Avanzado (3-4 horas)
- [ ] Endpoint `/api/analysis/by-tags`
- [ ] Componente `CategoryTagBreakdown`
- [ ] Integración en página Analysis
- [ ] Click en categoría → mostrar desglose

### Fase 5: Casos Especiales (2 horas)
- [ ] Parser de tags con valores (`capital:1200`)
- [ ] Componente especializado `LoanBreakdown`
- [ ] Gráficos de barras apiladas

### Fase 6: Refinamientos (opcional)
- [ ] Tag management (renombrar, fusionar)
- [ ] Exportar CSV con tags
- [ ] Búsqueda de transacciones por tag
- [ ] Estadísticas de uso de tags

**Total estimado:** 9-13 horas de desarrollo

---

## Alternativas Consideradas

### Alternativa 1: Campo de notas estructurado
Agregar campo `notes` con sintaxis markdown:
```
#comida #delivery Comida de Rappi - Pizza
```

**Descartado porque:**
- Más difícil de parsear y queryar
- Confunde notas de usuario con metadata estructurada
- No permite sugerencias fáciles

### Alternativa 2: Tabla relacional tags
```sql
CREATE TABLE tags (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE transaction_tags (
  transaction_id INT,
  tag_id INT,
  PRIMARY KEY (transaction_id, tag_id)
);
```

**Descartado porque:**
- Overhead de joins en queries
- Complejidad adicional en backend
- Migración más compleja
- JSON es suficiente para este caso de uso

---

## Referencias

- SQLite JSON support: https://www.sqlite.org/json1.html
- PostgreSQL JSONB operators: https://www.postgresql.org/docs/current/functions-json.html
- Recharts documentation: https://recharts.org/
- Similar pattern: GitHub labels, Gmail tags

---

## Notas de Decisión

- **JSON vs tabla relacional:** JSON elegido por simplicidad y flexibilidad
- **Tags sin validación:** Permite experimentación del usuario sin restricciones
- **Formato `clave:valor`:** Conveniente para casos específicos sin complejidad adicional
- **Sugerencias por categoría:** Balance entre estructura y flexibilidad

---

## Criterios de Aceptación

- [ ] Usuario puede agregar múltiples tags a una transacción
- [ ] Tags se persisten correctamente en base de datos
- [ ] Sugerencias de tags aparecen según categoría seleccionada
- [ ] Transacciones se pueden filtrar por uno o múltiples tags
- [ ] Análisis muestra desglose automático por tags de una categoría
- [ ] Tags con formato `clave:valor` se parsean correctamente
- [ ] Performance aceptable con 10,000+ transacciones
- [ ] Tags son opcionales - no afectan flujo existente

---

**Próximo ADR sugerido:** ADR-005 - IA/ML para Auto-etiquetado y Sugerencias Inteligentes
