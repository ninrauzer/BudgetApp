# ADR-005: Integración de Funcionalidades de IA con OpenAI# ADR-005: Integración de Funcionalidades de IA con OpenAI



## Estado## Estado

Propuesto - Versión 2.0 (Revisado y Reducido)Propuesto - Versión 2.0 (Revisado y Reducido)



## Contexto## Contexto



### Problema a Resolver### Problema a Resolver

La aplicación necesita reducir fricción en la gestión diaria de finanzas personales y proporcionar valor diferencial mediante inteligencia artificial, pero debe hacerlo de forma **pragmática y medible**, no implementando todas las funcionalidades posibles.La aplicación necesita reducir fricción en la gestión diaria de finanzas personales y proporcionar valor diferencial mediante inteligencia artificial, pero debe hacerlo de forma **pragmática y medible**, no implementando todas las funcionalidades posibles.



**Principio rector**: La IA solo se usa cuando la regla simple es insuficiente o cuando genera un cambio medible en comportamiento del usuario.**Principio rector**: La IA solo se usa cuando la regla simple es insuficiente o cuando genera un cambio medible en comportamiento del usuario.



### Necesidades Específicas del Usuario### Necesidades Específicas del Usuario

1. **Categorización rápida** de transacciones (reduce tiempo de registro)1. **Categorización rápida** de transacciones (reduce tiempo de registro)

2. **✨ Análisis de PDFs bancarios** (banco no tiene API, solo provee estado de cuenta en PDF) - **CRÍTICO**2. **Análisis de PDFs bancarios** (banco no tiene API, solo provee estado de cuenta en PDF)

3. **Insights accionables** (no genéricos) que mejoren decisiones financieras3. **Insights accionables** (no genéricos) que mejoren decisiones financieras

4. **OCR de recibos** para reducir entrada manual4. **OCR de recibos** para reducir entrada manual



### Modelos Disponibles (OpenAI - Noviembre 2025)### Modelos Disponibles (OpenAI - Noviembre 2025)

- **GPT-4o**: Modelo unificado con vision, más rápido y económico que GPT-4 Turbo- **GPT-4o**: Modelo unificado con vision, más rápido y económico que GPT-4 Turbo

- **GPT-3.5 Turbo**: Más económico para tareas simples y deterministas- **GPT-4 Turbo**: Razonamiento avanzado, contexto de 128k tokens

- **Function Calling**: Integración estructurada con APIs- **GPT-3.5 Turbo**: Más económico para tareas simples y deterministas

- **Function Calling**: Integración estructurada con APIs

### Costos Estimados (Versión Reducida)

- GPT-3.5 Turbo: $0.0005/1K tokens input, $0.0015/1K tokens output### Costos Estimados (Versión Reducida)

- GPT-4o: $0.0025/1K tokens input, $0.010/1K tokens output- GPT-3.5 Turbo: $0.0005/1K tokens input, $0.0015/1K tokens output

- **Estimación mensual por usuario activo**: ~$1.60/mes- GPT-4o: $0.0025/1K tokens input, $0.010/1K tokens output

  - Categorizaciones (GPT-3.5): $0.30- **Estimación mensual por usuario activo**: ~$1.60/mes

  - Insight diario (GPT-3.5): $0.20  - Categorizaciones (GPT-3.5): $0.30

  - OCR recibos (GPT-4o): $0.10  - Insight diario (GPT-3.5): $0.20

  - **Análisis PDF bancario (GPT-4o): $0.50/mes** (1-2 PDFs)  - OCR recibos (GPT-4o): $0.10

  - Asistente mini (GPT-3.5): $0.50  - Análisis PDF bancario (GPT-4o): $0.50/mes (1-2 PDFs)

  - Asistente mini (GPT-3.5): $0.50

**Reducción de 55% vs estimación original** mediante:

- Uso de GPT-3.5 para tareas simples**Reducción de 55% vs estimación original** mediante:

- Caching agresivo (24h para insights, 7 días para categorizaciones)- Uso de GPT-3.5 para tareas simples

- Rate limiting (evita abuso)- Caching agresivo (24h para insights, 7 días para categorizaciones)

- Análisis PDF solo cuando usuario sube archivo (no automático)- Rate limiting (evita abuso)

- Análisis PDF solo cuando usuario sube archivo (no automático)

---

## Decisión

## Decisión

**Implementar IA en 4 funcionalidades core con alto ROI**, priorizando reducción de fricción y casos de uso sin alternativa (como PDF bancario).

**Implementar IA en 4 funcionalidades core con alto ROI**, priorizando reducción de fricción y casos de uso sin alternativa (como PDF bancario).

### Jerarquía de Funcionalidades

### Jerarquía de Funcionalidades

```

```┌─────────────────────────────────────────────────────────┐

┌─────────────────────────────────────────────────────────┐│              ALTO ROI / BAJO ESFUERZO                   │

│              ALTO ROI / BAJO ESFUERZO                   ││  1. Categorización Automática (GPT-3.5)                │

│  1. Categorización Automática (GPT-3.5)                ││  2. Insight Diario Simple (GPT-3.5)                     │

│  2. Insight Diario Simple (GPT-3.5)                     │└─────────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────────────┘                         ↓

                         ↓┌─────────────────────────────────────────────────────────┐

┌─────────────────────────────────────────────────────────┐│           ALTO VALOR / ESFUERZO MEDIO                   │

│           ALTO VALOR / ESFUERZO MEDIO                   ││  3. Análisis de PDF Bancario (GPT-4o) ⭐ CRÍTICO        │

│  3. ⭐ Análisis de PDF Bancario (GPT-4o) - CRÍTICO     ││  4. OCR de Recibos (GPT-4o)                             │

│  4. OCR de Recibos (GPT-4o)                             │└─────────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────────────┘                         ↓

                         ↓┌─────────────────────────────────────────────────────────┐

┌─────────────────────────────────────────────────────────┐│              NICE-TO-HAVE (Fase 2)                      │

│              NICE-TO-HAVE (Fase 2)                      ││  5. Asistente Mini (3 preguntas fijas)                  │

│  5. Asistente Mini (3 preguntas fijas)                  ││  6. Detector de Gastos Anormales                        │

│  6. Detector de Gastos Anormales                        │└─────────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────────────┘                         ↓

                         ↓┌─────────────────────────────────────────────────────────┐

┌─────────────────────────────────────────────────────────┐│           FUERA DE SCOPE (Ahora)                        │

│           FUERA DE SCOPE (Por Ahora)                    ││  ❌ Predictor de fin de mes                             │

│  ❌ Predictor de fin de mes                             ││  ❌ Chat financiero completo                            │

│  ❌ Chat financiero completo                            ││  ❌ Detección de duplicados con IA                      │

│  ❌ Detección de duplicados con IA                      ││  ❌ Análisis multi-mes con ML                           │

│  ❌ Análisis multi-mes con ML                           │└─────────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────────────┘```

```

---

**Nota sobre PDF Bancario**: Este es el caso de uso MÁS CRÍTICO porque el banco del usuario no provee API ni exportación estructurada. Es la única forma de importar las transacciones de tarjeta de crédito sin entrada manual de 20-50 transacciones por mes.

## Funcionalidades Implementadas

---

### Fase 1: MVP de IA (4 semanas)

## Discusión Pendiente: Integración con Tarjetas de Crédito

#### 1.1 Categorización Automática de Transacciones ⚡ QUICK WIN

**IMPORTANTE**: Antes de implementar las funcionalidades de IA, necesitamos **discutir y diseñar el sistema de tarjetas de crédito** primero, ya que el análisis de PDF bancario depende de esta infraestructura.

**Objetivo**: Sugerir categoría apropiada basándose en descripción y monto.

### Preguntas Clave a Resolver

**ROI**: Alto - Reduce tiempo de registro en 70%

1. **Modelo de Datos de Tarjetas**:

   - ¿Usamos la tabla `accounts` existente o creamos `credit_cards` separada?**Arquitectura Simplificada**:

   - ¿Cómo modelamos cuotas/installments?```python

   - ¿Necesitamos tracking de ciclo de facturación?# app/services/ai_categorizer.py

from openai import OpenAI

2. **Relación con Wishlist/Sprint (ADR-002)**:from typing import Dict, List

   - ¿El análisis PDF debe integrarse con el sistema de Sprint Planning?from app.models.category import Category

   - ¿Las cuotas detectadas en PDF se vinculan a compras del Wishlist?

   - ¿Cómo sincronizamos compras planificadas vs estado de cuenta real?class TransactionCategorizer:

    def __init__(self, api_key: str):

3. **Flujo de Usuario**:        self.client = OpenAI(api_key=api_key)

   - ¿Usuario importa PDF antes o después de registrar compras manualmente?        self.cache = {}  # Cache simple para descripciones repetitivas

   - ¿Qué hacer con duplicados (compra manual + PDF)?    

   - ¿Permitir edición de transacciones importadas?    async def suggest_category(

        self, 

### Propuesta de Orden de Implementación        description: str, 

        amount: float,

```        available_categories: List[Category]

1. 📋 Diseñar sistema de Tarjetas de Crédito    ) -> Dict:

   ├─ Modelo de datos        """

   ├─ CRUD de tarjetas        Sugiere categoría usando GPT-4 con Function Calling

   ├─ Tracking de deuda y cuotas        

   └─ Integración con presupuesto        Returns:

            {

2. 🤖 Implementar Análisis de PDF (IA)                'category_id': 5,

   ├─ Extracción de transacciones                'category_name': 'Alimentación - Delivery',

   ├─ Detección de cuotas                'confidence': 0.95,

   ├─ Categorización automática                'reasoning': 'Mención de PedidosYa indica delivery de comida'

   └─ Manejo de duplicados            }

        """

3. 🎯 Integrar con Wishlist/Sprint (ADR-002)        # Check cache primero

   ├─ Vincular compras planificadas con PDF        cache_key = f"{description.lower()}:{amount}"

   ├─ Tracking de cuotas de Sprint activo        if cache_key in self.cache:

   └─ Reconciliación automática            return self.cache[cache_key]

```        

        # Preparar lista de categorías

**Acción requerida**: Antes de continuar con este ADR, debemos:        category_options = [

- [ ] Crear ADR-003: Sistema de Tarjetas de Crédito            {

- [ ] Definir modelo de datos de `credit_cards` y `installments`                "id": cat.id,

- [ ] Decidir integración con Wishlist/Sprint (ADR-002)                "name": cat.name,

- [ ] Revisar y aprobar diseño completo                "type": cat.type,

- [ ] Implementar infraestructura de tarjetas                "icon": cat.icon

- [ ] Volver a este ADR para implementar IA sobre base sólida            }

            for cat in available_categories

---        ]

        

## Funcionalidades de IA (Implementación Pendiente)        response = self.client.chat.completions.create(

            model="gpt-4-turbo-preview",

Las siguientes funcionalidades se implementarán DESPUÉS de resolver la discusión sobre tarjetas de crédito:            messages=[

                {

### Fase 1: MVP de IA (4 semanas)                    "role": "system",

                    "content": """Eres un experto en categorización de transacciones financieras.

#### 1.1 Categorización Automática de Transacciones ⚡ QUICK WIN                    Analiza la descripción y monto para sugerir la categoría más apropiada.

                    Considera patrones comunes:

**Estado**: ✅ Diseño completo - Listo para implementar                    - Uber/taxi/Cabify → Transporte

                    - Netflix/Spotify/HBO → Entretenimiento - Suscripciones

**Objetivo**: Sugerir categoría apropiada basándose en descripción y monto                    - Wong/Plaza Vea/Metro → Alimentación - Supermercado

                    - PedidosYa/Rappi → Alimentación - Delivery

**ROI**: Alto - Reduce tiempo de registro en 70%                    - Farmacia/botica → Salud - Medicamentos

                    - Transferencias/Yape → según contexto

**Modelo**: GPT-3.5 Turbo (económico)                    """

                },

**Costo estimado**: ~$0.30/mes por usuario                {

                    "role": "user",

**Arquitectura**:                    "content": f"Categoriza: '{description}' por S/ {amount}"

```python                }

# app/services/ai_categorizer.py            ],

from openai import OpenAI            functions=[{

import hashlib                "name": "categorize_transaction",

from typing import Dict, List                "description": "Asigna la categoría más apropiada a una transacción",

                "parameters": {

class TransactionCategorizer:                    "type": "object",

    def __init__(self, api_key: str):                    "properties": {

        self.client = OpenAI(api_key=api_key)                        "category_id": {

                                "type": "integer",

    def _get_cache_key(self, description: str, amount: float) -> str:                            "description": "ID de la categoría seleccionada"

        """Genera key única para caching"""                        },

        return hashlib.md5(f"{description.lower().strip()}:{amount}".encode()).hexdigest()                        "confidence": {

                                "type": "number",

    async def suggest_category(                            "minimum": 0,

        self,                             "maximum": 1,

        description: str,                             "description": "Nivel de confianza (0-1)"

        amount: float,                        },

        available_categories: List[Category]                        "reasoning": {

    ) -> Dict:                            "type": "string",

        """Sugiere categoría usando GPT-3.5"""                            "description": "Breve explicación de por qué se eligió esta categoría"

                                }

        # Check cache primero (Redis)                    },

        cache_key = self._get_cache_key(description, amount)                    "required": ["category_id", "confidence"]

        cached = await redis.get(cache_key)                }

        if cached:            }],

            return json.loads(cached)            function_call={"name": "categorize_transaction"},

                    temperature=0.3,  # Más determinista

        # Preparar lista de categorías            max_tokens=150

        category_list = "\n".join([        )

            f"- {cat.name} ({cat.type})"         

            for cat in available_categories        result = json.loads(response.choices[0].message.function_call.arguments)

        ])        

                # Agregar nombre de categoría

        response = self.client.chat.completions.create(        selected_cat = next((c for c in available_categories if c.id == result['category_id']), None)

            model="gpt-3.5-turbo",        result['category_name'] = selected_cat.name if selected_cat else None

            messages=[        

                {        # Cache por 7 días

                    "role": "system",        self.cache[cache_key] = result

                    "content": f"""Eres experto en categorización de transacciones en Perú.        

Categorías disponibles:        return result

{category_list}```



Patrones comunes:**Endpoint**:

- Uber/Cabify → Transporte```python

- Netflix/Spotify → Entretenimiento - Suscripciones# app/api/ai.py

- Wong/Plaza Vea → Alimentación - Supermercadofrom fastapi import APIRouter, Depends, HTTPException

- PedidosYa/Rappi → Alimentación - Deliveryfrom sqlalchemy.orm import Session

- Inkafarma/Mifarma → Salud - Medicamentosfrom app.db.database import get_db

from app.services.ai_categorizer import TransactionCategorizer

Responde SOLO con el nombre exacto de la categoría."""from app.core.config import settings

                },

                {router = APIRouter(prefix="/ai", tags=["ai"])

                    "role": "user",

                    "content": f"Categoriza: '{description}' por S/ {amount}"@router.post("/categorize")

                }async def categorize_transaction(

            ],    description: str,

            temperature=0.3,    amount: float,

            max_tokens=30    db: Session = Depends(get_db)

        )):

            """

        suggested_name = response.choices[0].message.content.strip()    Sugiere categoría para una transacción

            

        # Buscar categoría exacta    Request:

        selected_cat = next(        description: "Uber a San Isidro"

            (c for c in available_categories if c.name.lower() == suggested_name.lower()),        amount: 25.50

            None    

        )    Response:

                {

        if not selected_cat:            "category_id": 3,

            # Fallback: similitud            "category_name": "Transporte",

            selected_cat = next(            "confidence": 0.98,

                (c for c in available_categories if suggested_name.lower() in c.name.lower()),            "reasoning": "Mención explícita de Uber indica transporte privado"

                available_categories[0]        }

            )    """

            try:

        result = {        categories = db.query(Category).filter(Category.is_deleted == False).all()

            'category_id': selected_cat.id,        

            'category_name': selected_cat.name,        categorizer = TransactionCategorizer(api_key=settings.OPENAI_API_KEY)

            'confidence': 'high' if selected_cat.name.lower() == suggested_name.lower() else 'medium'        suggestion = await categorizer.suggest_category(description, amount, categories)

        }        

                return suggestion

        # Cache 7 días        

        await redis.set(cache_key, json.dumps(result), ex=604800)    except Exception as e:

                logger.error(f"Error categorizando transacción: {e}")

        return result        raise HTTPException(status_code=500, detail="Error al categorizar transacción")

``````



**Endpoint**:**Frontend Integration**:

```python```typescript

@router.post("/api/ai/categorize")// frontend/src/components/QuickAddTransaction.tsx

async def categorize_transaction(import { useMutation } from '@tanstack/react-query';

    description: str,

    amount: float,const { mutate: categorizeMutate, data: categorySuggestion } = useMutation({

    db: Session = Depends(get_db)  mutationFn: (data: { description: string; amount: number }) =>

):    fetch('/api/ai/categorize', {

    categories = db.query(Category).filter(Category.is_deleted == False).all()      method: 'POST',

    categorizer = TransactionCategorizer(api_key=settings.OPENAI_API_KEY)      headers: { 'Content-Type': 'application/json' },

    return await categorizer.suggest_category(description, amount, categories)      body: JSON.stringify(data)

```    }).then(r => r.json())

});

**Frontend**:

```typescript// Cuando usuario escribe descripción

// Sugerencia con diseño visualconst handleDescriptionChange = (description: string) => {

{categorySuggestion && (  if (description.length > 5 && amount > 0) {

  <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">    // Debounce de 500ms

    <Sparkles className="w-4 h-4 text-purple-500" />    categorizeMutate({ description, amount });

    <span className="text-sm">  }

      Sugerencia: <strong>{categorySuggestion.category_name}</strong>};

    </span>

    <button onClick={() => setCategory(categorySuggestion.category_id)}>// Mostrar sugerencia

      Aplicar ✨{categorySuggestion && (

    </button>  <div className="p-2 bg-blue-50 rounded-lg flex items-center gap-2">

  </div>    <Sparkles className="w-4 h-4 text-blue-500" />

)}    <span className="text-sm">

```      Sugerencia IA: <strong>{categorySuggestion.category_name}</strong>

      {categorySuggestion.confidence > 0.9 && ' ✓'}

---    </span>

    <button onClick={() => setCategory(categorySuggestion.category_id)}>

#### 1.2 ⭐ Análisis de PDF Bancario (CRÍTICO - BLOQUEADO)      Aplicar

    </button>

**Estado**: ⚠️ **BLOQUEADO** - Requiere diseño de sistema de tarjetas primero  </div>

)}

**Problema**: Banco no tiene API, solo PDF mensual```



**Objetivo**: Extraer 20-50 transacciones automáticamente del PDF---



**ROI**: Muy Alto - Elimina 30-60 min de entrada manual/mes#### 1.2 Asistente Financiero Conversacional



**Modelo**: GPT-4o (con vision si es imagen)**Objetivo**: Responder preguntas sobre finanzas personales con contexto del usuario.



**Costo estimado**: ~$0.50/mes por usuario (1-2 PDFs/mes)**Arquitectura**:

```python

**Dependencias antes de implementar**:# app/services/ai_assistant.py

- [ ] Definir modelo de `credit_cards`from openai import OpenAI

- [ ] Definir modelo de `installments` (cuotas)from datetime import datetime, timedelta

- [ ] Decidir flujo de importación (crear transacciones directamente vs preview)from typing import Dict, List

- [ ] Resolver integración con Wishlist/Sprint

- [ ] Implementar detector de duplicadosclass FinancialAssistant:

    def __init__(self, api_key: str):

**Arquitectura Propuesta** (pendiente de aprobación):        self.client = OpenAI(api_key=api_key)

    

```python    async def ask(

# app/services/pdf_analyzer.py        self, 

class BankStatementAnalyzer:        question: str, 

    async def analyze_bank_statement(self, pdf_file: bytes) -> Dict:        user_id: int,

        """        db: Session

        Extrae transacciones del PDF    ) -> Dict:

                """

        Returns:        Responde pregunta financiera con contexto del usuario

            {        """

                'period': '2025-10-23 a 2025-11-22',        # 1. Recopilar contexto relevante

                'credit_card': 'Visa BBVA',        context = await self._build_user_context(user_id, db)

                'total_spent': 1250.50,        

                'transactions': [        # 2. Construir prompt con contexto

                    {        system_prompt = self._build_system_prompt(context)

                        'date': '2025-11-01',        

                        'description': 'NETFLIX.COM',        # 3. Llamar a OpenAI

                        'amount': 44.90,        response = self.client.chat.completions.create(

                        'currency': 'USD',            model="gpt-4-turbo-preview",

                        'is_installment': False,            messages=[

                        'installment_info': None,                {"role": "system", "content": system_prompt},

                        'suggested_category': 'Entretenimiento - Suscripciones'                {"role": "user", "content": question}

                    },            ],

                    {            temperature=0.7,

                        'date': '2025-11-05',            max_tokens=400

                        'description': 'SAGA FALABELLA',        )

                        'amount': 299.00,        

                        'currency': 'PEN',        answer = response.choices[0].message.content

                        'is_installment': True,        

                        'installment_info': {        return {

                            'current': 2,            "question": question,

                            'total': 6,            "answer": answer,

                            'monthly_payment': 49.83            "tokens_used": response.usage.total_tokens,

                        },            "context_used": list(context.keys())

                        'suggested_category': 'Compras'        }

                    }    

                ],    async def _build_user_context(self, user_id: int, db: Session) -> Dict:

                'summary': {        """Recopila datos relevantes del usuario"""

                    'payment_due_date': '2025-12-05',        now = datetime.now()

                    'minimum_payment': 120.00,        month_start = now.replace(day=1)

                    'total_payment': 1250.50        

                }        # Budget actual

            }        current_budget = db.query(BudgetPlan).filter(

        """            BudgetPlan.user_id == user_id,

        # Implementación pendiente            BudgetPlan.month_name == now.strftime('%B')

        pass        ).first()

```        

        # Transacciones del mes

**Flujo de Usuario Propuesto**:        transactions = db.query(Transaction).filter(

1. Usuario sube PDF mensual            Transaction.user_id == user_id,

2. IA analiza y extrae transacciones            Transaction.date >= month_start

3. Preview de transacciones con categorías sugeridas        ).all()

4. Usuario revisa y confirma (puede deseleccionar duplicados)        

5. Sistema crea transacciones + registra cuotas si aplica        # Calcular totales por categoría

6. Vincula con compras del Wishlist si es posible        category_totals = {}

        for t in transactions:

---            cat_name = t.category.name

            if cat_name not in category_totals:

#### 1.3 Insight Diario Simple                category_totals[cat_name] = {'income': 0, 'expense': 0}

            

**Estado**: ✅ Diseño completo - Listo para implementar            if t.type == 'income':

                category_totals[cat_name]['income'] += float(t.amount)

**Objetivo**: 1 insight accionable diario para crear hábito            else:

                category_totals[cat_name]['expense'] += float(t.amount)

**ROI**: Medio - Aumenta retención +30%        

        # Tarjetas de crédito (si existen)

**Modelo**: GPT-3.5 Turbo        credit_cards = db.query(CreditCard).filter(

            CreditCard.user_id == user_id,

**Costo estimado**: ~$0.20/mes por usuario            CreditCard.is_active == True

        ).all()

**Tipos de insights**:        

- ⚠️ **Warning**: "Gastaste S/ 200 en delivery esta semana, 3x más que tu promedio"        # Tendencias (comparar con mes anterior)

- ✅ **Success**: "¡Ahorraste S/ 150 esta semana vs semana anterior!"        last_month = (month_start - timedelta(days=1)).replace(day=1)

- 💡 **Tip**: "Si reduces 1 delivery/semana ahorrarás S/ 180/mes"        last_month_transactions = db.query(Transaction).filter(

            Transaction.user_id == user_id,

**Implementación**:            Transaction.date >= last_month,

```python            Transaction.date < month_start

class InsightGenerator:        ).all()

    async def generate_daily_insight(self, user_id: int, db: Session) -> Dict:        

        # Check cache (24h)        context = {

        cache_key = f"daily_insight:{user_id}:{datetime.now().date()}"            'current_date': now.strftime('%Y-%m-%d'),

        cached = await redis.get(cache_key)            'days_in_month': (now - month_start).days + 1,

        if cached:            'budget': {

            return json.loads(cached)                'total_income': sum(c.planned_amount for c in current_budget.categories if c.type == 'income'),

                        'total_budgeted': sum(c.planned_amount for c in current_budget.categories if c.type == 'expense'),

        # Analizar última semana vs anterior                'actual_income': sum(t.amount for t in transactions if t.type == 'income'),

        week_data = await self._get_week_summary(user_id, db)                'actual_expense': sum(t.amount for t in transactions if t.type == 'expense'),

                    } if current_budget else None,

        prompt = f"""            'spending_by_category': category_totals,

Analiza estos datos y genera UN insight accionable:            'transaction_count_this_month': len(transactions),

{json.dumps(week_data)}            'credit_cards': [

                {

Responde en JSON:                    'name': cc.name,

{{                    'balance': float(cc.current_balance),

    "type": "warning|success|tip",                    'limit': float(cc.credit_limit),

    "title": "Título corto",                    'utilization': float(cc.current_balance / cc.credit_limit * 100)

    "message": "Mensaje con números específicos",                }

    "action": "Texto botón",                for cc in credit_cards

    "action_link": "/transactions?category=X"            ] if credit_cards else [],

}}            'trends': {

"""                'last_month_expense': sum(t.amount for t in last_month_transactions if t.type == 'expense'),

                        'this_month_expense': sum(t.amount for t in transactions if t.type == 'expense'),

        response = self.client.chat.completions.create(            }

            model="gpt-3.5-turbo",        }

            messages=[{"role": "user", "content": prompt}],        

            response_format={"type": "json_object"},        return context

            temperature=0.8,    

            max_tokens=150    def _build_system_prompt(self, context: Dict) -> str:

        )        """Construye prompt con contexto del usuario"""

                prompt = """Eres un asesor financiero personal experto, conciso y práctico.

        insight = json.loads(response.choices[0].message.content)Tu objetivo es ayudar al usuario a tomar mejores decisiones financieras.

        await redis.set(cache_key, json.dumps(insight), ex=86400)

        return insightREGLAS:

```- Responde en español de forma clara y directa

- Usa datos específicos cuando los tengas

**Frontend Component**:- Da consejos accionables, no teoría general

```typescript- Sé empático pero honesto sobre la situación financiera

<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">- Si no tienes datos suficientes, pide más información

  <div className="flex items-start gap-4">- Usa formato markdown para mejor legibilidad

    <Lightbulb className="w-6 h-6" />

    <div>INFORMACIÓN DEL USUARIO:

      <h3 className="font-bold mb-2">{insight.title}</h3>"""

      <p className="text-sm opacity-90">{insight.message}</p>        

      <a href={insight.action_link} className="btn-white-ghost mt-4">        if context.get('budget'):

        {insight.action} →            budget = context['budget']

      </a>            prompt += f"""

    </div>PRESUPUESTO MENSUAL (Día {context['days_in_month']} del mes):

  </div>- Ingresos presupuestados: S/ {budget['total_income']:.2f}

</div>- Gastos presupuestados: S/ {budget['total_budgeted']:.2f}

```- Ingresos reales: S/ {budget['actual_income']:.2f}

- Gastos reales: S/ {budget['actual_expense']:.2f}

---- Balance actual: S/ {(budget['actual_income'] - budget['actual_expense']):.2f}

- Cumplimiento: {(budget['actual_expense'] / budget['total_budgeted'] * 100):.1f}% del presupuesto usado

#### 1.4 OCR de Recibos"""

        

**Estado**: ✅ Diseño completo - Listo para implementar        if context.get('spending_by_category'):

            prompt += "\nGASTOS POR CATEGORÍA (este mes):\n"

**Objetivo**: Escanear foto de recibo y pre-llenar formulario            for cat, amounts in sorted(context['spending_by_category'].items(), 

                                      key=lambda x: x[1]['expense'], 

**ROI**: Medio - Mejora UX, no crítico                                      reverse=True)[:5]:

                prompt += f"- {cat}: S/ {amounts['expense']:.2f}\n"

**Modelo**: GPT-4o (vision)        

        if context.get('credit_cards'):

**Costo estimado**: ~$0.10/mes por usuario (10-15 recibos/mes)            prompt += "\nTARJETAS DE CRÉDITO:\n"

            for cc in context['credit_cards']:

**Implementación**:                prompt += f"- {cc['name']}: S/ {cc['balance']:.2f} / S/ {cc['limit']:.2f} ({cc['utilization']:.1f}% usado)\n"

```python        

class ReceiptScanner:        if context.get('trends'):

    async def scan_receipt(self, image_file: bytes) -> Dict:            trends = context['trends']

        # Optimizar imagen a 1024x1024            change = ((trends['this_month_expense'] - trends['last_month_expense']) 

        image = Image.open(io.BytesIO(image_file))                     / trends['last_month_expense'] * 100) if trends['last_month_expense'] > 0 else 0

        if image.width > 1024 or image.height > 1024:            prompt += f"\nTENDENCIA: Gastos {'+' if change > 0 else ''}{change:.1f}% vs mes anterior\n"

            image.thumbnail((1024, 1024))        

                return prompt

        img_base64 = base64.b64encode(image_bytes).decode()```

        

        response = self.client.chat.completions.create(**Endpoint**:

            model="gpt-4o",```python

            messages=[{# app/api/ai.py

                "role": "user",@router.post("/ask")

                "content": [async def ask_assistant(

                    {    question: str,

                        "type": "text",    user_id: int = 1,  # TODO: Obtener de auth token

                        "text": """Extrae: monto, establecimiento, fecha, items.    db: Session = Depends(get_db)

Responde en JSON."""):

                    },    """

                    {    Asistente financiero conversacional

                        "type": "image_url",    

                        "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}    Request:

                    }        question: "¿Por qué gasté tanto este mes?"

                ]    

            }],    Response:

            response_format={"type": "json_object"},        {

            max_tokens=300            "question": "¿Por qué gasté tanto este mes?",

        )            "answer": "Tus gastos aumentaron 35% este mes principalmente por...",

                    "tokens_used": 450,

        return json.loads(response.choices[0].message.content)            "context_used": ["budget", "spending_by_category", "trends"]

```        }

    """

---    try:

        assistant = FinancialAssistant(api_key=settings.OPENAI_API_KEY)

### Fase 2: Funcionalidades Adicionales (Opcional)        result = await assistant.ask(question, user_id, db)

        

#### 2.1 Asistente Mini (3 Preguntas Fijas)        # Log para analytics

        logger.info(f"AI Question: {question} | Tokens: {result['tokens_used']}")

**Límite**: 5 consultas/día        

        return result

**Preguntas predefinidas**:        

- "¿Por qué gasté tanto esta semana?"    except Exception as e:

- "¿Cuánto puedo gastar hoy?"        logger.error(f"Error en asistente AI: {e}")

- "¿Debería pagar toda mi tarjeta?"        raise HTTPException(status_code=500, detail="Error al procesar pregunta")

```

**Modelo**: GPT-3.5 Turbo

**Frontend - Chat Component**:

**Costo**: ~$0.50/mes por usuario```typescript

// frontend/src/components/AIAssistant.tsx

---import React, { useState } from 'react';

import { MessageCircle, Send, Sparkles } from 'lucide-react';

## Configuración y Mejores Prácticasimport { useMutation } from '@tanstack/react-query';



### Stack Tecnológicointerface Message {

```bash  role: 'user' | 'assistant';

# Backend  content: string;

pip install openai redis PyPDF2 pillow  timestamp: Date;

}

# Redis (para caching)

docker run -d -p 6379:6379 redis:alpineexport default function AIAssistant() {

```  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

### Config  const [input, setInput] = useState('');

```python

# app/core/config.py  const { mutate: askAI, isLoading } = useMutation({

class Settings(BaseSettings):    mutationFn: (question: string) =>

    OPENAI_API_KEY: str      fetch('/api/ai/ask', {

    OPENAI_CATEGORIZE_MODEL: str = "gpt-3.5-turbo"        method: 'POST',

    OPENAI_VISION_MODEL: str = "gpt-4o"        headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ question })

    AI_REQUESTS_PER_USER_DAY: int = 100      }).then(r => r.json()),

    AI_CACHE_TTL_HOURS: int = 24    onSuccess: (data) => {

          setMessages(prev => [...prev, {

    REDIS_URL: str = "redis://localhost:6379"        role: 'assistant',

```        content: data.answer,

        timestamp: new Date()

### Rate Limiting      }]);

```python    }

class AIRateLimiter:  });

    async def check_limit(self, user_id: int, limit: int = 100):

        key = f"ai_limit:{user_id}:{datetime.now().date()}"  const handleSend = () => {

        count = await self.redis.incr(key)    if (!input.trim()) return;

        

        if count == 1:    // Add user message

            await self.redis.expire(key, 86400)    setMessages(prev => [...prev, {

              role: 'user',

        if count > limit:      content: input,

            raise HTTPException(status_code=429, detail="Límite alcanzado")      timestamp: new Date()

```    }]);



### Caching con Redis    // Ask AI

```python    askAI(input);

class AICache:    setInput('');

    async def get(self, key: str):  };

        value = await self.redis.get(key)

        return json.loads(value) if value else None  const suggestions = [

        "¿Por qué gasté tanto este mes?",

    async def set(self, key: str, value: dict, ex: int = 3600):    "¿Cuánto puedo gastar hoy?",

        await self.redis.set(key, json.dumps(value), ex=ex)    "¿Debería pagar toda mi tarjeta?",

```    "Dame consejos para ahorrar"

  ];

---

  return (

## Métricas de Éxito    <>

      {/* Floating Button */}

**Debes medir**:      <button

        onClick={() => setIsOpen(!isOpen)}

1. **Categorización**:        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"

   - % transacciones con sugerencia aplicada (objetivo: >60%)      >

   - Tiempo de registro (objetivo: -50%)        <MessageCircle className="w-6 h-6" />

      </button>

2. **PDF Bancario**:

   - % transacciones importadas vs manual (objetivo: >80%)      {/* Chat Window */}

   - Precisión de extracción (objetivo: >90%)      {isOpen && (

   - Tiempo ahorrado (objetivo: 30-60 min/mes)        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">

          {/* Header */}

3. **Insights**:          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">

   - % usuarios que abren app diariamente (objetivo: +30%)            <div className="flex items-center gap-2">

   - % clicks en acción (objetivo: >20%)              <Sparkles className="w-5 h-5" />

              <h3 className="font-semibold">Asistente Financiero</h3>

4. **Costos**:            </div>

   - Gasto por usuario (objetivo: <$2.00/mes)            <p className="text-xs text-blue-100 mt-1">Pregúntame sobre tus finanzas</p>

   - ROI: tiempo ahorrado vs costo          </div>



---          {/* Messages */}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

## Consecuencias            {messages.length === 0 ? (

              <div className="space-y-2">

### Positivas                <p className="text-sm text-gray-500">Preguntas sugeridas:</p>

✅ Reduce fricción en registro 70%                  {suggestions.map((q, i) => (

✅ Elimina entrada manual de estado de cuenta (crítico)                    <button

✅ Genera hábito de uso diario                      key={i}

✅ Diferenciación vs competidores                      onClick={() => { setInput(q); handleSend(); }}

✅ Costos controlados ($1.60/mes)                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"

                  >

### Negativas                    {q}

⚠️ Dependencia de OpenAI API                    </button>

⚠️ Latencia en PDF (5-10 segundos)                  ))}

⚠️ Requiere Redis                </div>

⚠️ IA puede cometer errores              ) : (

              messages.map((msg, i) => (

### Riesgos                <div

🔴 API puede caerse temporalmente                    key={i}

🔴 Costos escalan sin cache                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}

🔴 Privacidad: datos van a OpenAI                  >

🔴 PDF mal formateado falla                    <div

                    className={`max-w-[80%] p-3 rounded-2xl ${

### Mitigación                      msg.role === 'user'

- Fallbacks a entrada manual                        ? 'bg-blue-500 text-white'

- Caching agresivo                        : 'bg-gray-100 text-gray-800'

- Rate limiting estricto                    }`}

- Validación de datos extraídos                  >

- Logs de errores                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    <span className="text-xs opacity-70 mt-1 block">

---                      {msg.timestamp.toLocaleTimeString()}

                    </span>

## Alternativas Consideradas                  </div>

                </div>

### 1. Reglas Heurísticas (Sin IA)              ))

**Pros**: Gratis, rápido              )}

**Cons**: No puede analizar PDFs              {isLoading && (

**Decisión**: ❌ No resuelve PDF bancario              <div className="flex justify-start">

                <div className="bg-gray-100 p-3 rounded-2xl">

### 2. Modelos Open Source                  <div className="flex gap-1">

**Pros**: Sin costo API                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />

**Cons**: Requiere GPU, menor calidad                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />

**Decisión**: ❌ Over-engineering                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />

                  </div>

### 3. Servicios especializados (Plaid, Belvo)                </div>

**Pros**: Diseñados para finanzas                </div>

**Cons**: Caros, no disponibles en bancos peruanos              )}

**Decisión**: ❌ Banco no tiene integración          </div>



---          {/* Input */}

          <div className="p-4 border-t">

## Plan de Implementación            <div className="flex gap-2">

              <input

### ANTES DE EMPEZAR: Resolver Tarjetas de Crédito                type="text"

                value={input}

**Prioridad 0** (1-2 semanas):                onChange={(e) => setInput(e.target.value)}

- [ ] Crear ADR-003: Sistema de Tarjetas de Crédito                onKeyPress={(e) => e.key === 'Enter' && handleSend()}

- [ ] Diseñar modelo de datos (`credit_cards`, `installments`)                placeholder="Escribe tu pregunta..."

- [ ] Implementar CRUD de tarjetas                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

- [ ] Implementar tracking de deuda y cuotas              />

- [ ] Integración con Dashboard y Presupuesto              <button

- [ ] **CHECKPOINT**: Validar con usuario que sistema funciona                onClick={handleSend}

                disabled={!input.trim() || isLoading}

### Semana 1: Fundamentos IA                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"

- [ ] Configurar OpenAI API key              >

- [ ] Instalar dependencias                <Send className="w-5 h-5" />

- [ ] Configurar Redis para caching              </button>

- [ ] Implementar categorización (backend + frontend)            </div>

- [ ] Tests básicos          </div>

        </div>

### Semana 2: PDF Bancario (PRIORIDAD)      )}

- [ ] Implementar `BankStatementAnalyzer`    </>

- [ ] Endpoint `/analyze-bank-pdf`  );

- [ ] Endpoint `/confirm-pdf-import`}

- [ ] UI de importación con preview```

- [ ] Detección de duplicados

- [ ] Vinculación con tarjetas---



### Semana 3: Insights y OCR#### 1.3 Insights Diarios Automáticos

- [ ] Implementar insights diarios

- [ ] Widget en Dashboard**Objetivo**: Generar 1 consejo/insight diario personalizado.

- [ ] OCR de recibos

- [ ] Tests de prompts**Arquitectura**:

```python

### Semana 4: Polish# app/services/ai_insights.py

- [ ] Rate limiting completofrom openai import OpenAI

- [ ] Monitoreo de costosfrom datetime import datetime

- [ ] Analytics de métricasfrom typing import Dict

- [ ] Documentación

class InsightGenerator:

---    def __init__(self, api_key: str):

        self.client = OpenAI(api_key=api_key)

## Monitoreo de Costos    

    async def generate_daily_insight(

```python        self, 

# app/models/ai_usage.py        user_id: int,

class AIUsageLog(Base):        db: Session

    __tablename__ = "ai_usage_logs"    ) -> Dict:

            """

    id = Column(Integer, primary_key=True)        Genera insight diario personalizado

    user_id = Column(Integer, ForeignKey("users.id"))        

    feature = Column(String)  # 'categorize', 'pdf', 'ocr', 'insight'        Returns:

    model_used = Column(String)  # 'gpt-3.5-turbo', 'gpt-4o'            {

    tokens_used = Column(Integer)                'type': 'warning' | 'success' | 'tip' | 'prediction',

    cost_usd = Column(Numeric(10, 6))                'icon': 'alert-circle' | 'check-circle' | 'lightbulb' | 'trending-up',

    created_at = Column(DateTime, default=datetime.utcnow)                'title': 'Alerta: Gastos en Delivery',

```                'message': 'Llevas S/ 180 en delivery esta semana...',

                'action': 'Ver transacciones',

**Dashboard de costos**:                'action_link': '/transactions?category=alimentacion'

- Costo total por usuario/día/mes            }

- Breakdown por feature        """

- Alertas si excede $2.00/mes por usuario        # Recopilar datos de la última semana

- % de cache hits (objetivo: >80%)        week_data = await self._get_week_summary(user_id, db)

        

---        prompt = f"""

        Analiza estos datos de la última semana del usuario y genera UN insight accionable:

## Referencias        

- [OpenAI API Documentation](https://platform.openai.com/docs)        {json.dumps(week_data, indent=2)}

- [GPT-4o Overview](https://platform.openai.com/docs/models/gpt-4o)        

- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)        Tipos de insights que puedes generar:

- [ADR-002: Wishlist Sprint System](./ADR-002-wishlist-sprint-system.md)        1. WARNING: Gastos inusuales o que exceden presupuesto

- [Pendiente] ADR-003: Sistema de Tarjetas de Crédito        2. SUCCESS: Logros o mejoras vs semana anterior

        3. TIP: Consejo práctico para ahorrar

---        4. PREDICTION: Proyección de fin de mes

        

## Historial de Cambios        Responde en JSON con esta estructura:

        {{

| Fecha      | Versión | Cambios                                      |            "type": "warning|success|tip|prediction",

|------------|---------|----------------------------------------------|            "title": "Título corto y llamativo",

| 2024-11-14 | 1.0     | Propuesta inicial (over-engineered)         |            "message": "Mensaje explicativo con números específicos (máximo 2 líneas)",

| 2025-11-18 | 2.0     | Revisión pragmática - 4 features core       |            "action": "Texto del botón de acción",

|            |         | + Prioridad a PDF bancario (sin API)        |            "action_link": "URL interna de la app"

|            |         | + Reducción de costos 55%                   |        }}

|            |         | + BLOQUEADO hasta resolver tarjetas         |        """

        

---        response = self.client.chat.completions.create(

            model="gpt-4-turbo-preview",

## Aprobaciones            messages=[{"role": "user", "content": prompt}],

            response_format={"type": "json_object"},

- [ ] Product Owner: _______________            temperature=0.8,

- [ ] Tech Lead: _______________            max_tokens=200

        )

---        

        insight = json.loads(response.choices[0].message.content)

## Próximos Pasos        

        # Mapear icono según tipo

1. **INMEDIATO**: Discutir sistema de tarjetas de crédito        icon_map = {

   - ¿Modelo de datos correcto?            'warning': 'alert-circle',

   - ¿Integración con Wishlist/Sprint?            'success': 'check-circle',

   - ¿Flujo de importación de PDF?            'tip': 'lightbulb',

            'prediction': 'trending-up'

2. **DESPUÉS**: Implementar IA sobre base sólida        }

   - Categorización (Semana 1)        insight['icon'] = icon_map.get(insight['type'], 'info')

   - PDF bancario (Semana 2)        

   - Insights + OCR (Semana 3)        return insight

    

**¿Listo para discutir tarjetas de crédito?** 💳    async def _get_week_summary(self, user_id: int, db: Session) -> Dict:

        """Resumen de última semana"""
        week_ago = datetime.now() - timedelta(days=7)
        
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= week_ago
        ).all()
        
        # Agrupar por categoría
        by_category = {}
        for t in transactions:
            cat = t.category.name
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(float(t.amount))
        
        # Calcular stats
        summary = {
            'total_spent': sum(t.amount for t in transactions if t.type == 'expense'),
            'transaction_count': len(transactions),
            'top_categories': {
                cat: {
                    'total': sum(amounts),
                    'count': len(amounts),
                    'avg': sum(amounts) / len(amounts)
                }
                for cat, amounts in sorted(by_category.items(), key=lambda x: sum(x[1]), reverse=True)[:3]
            },
            'highest_transaction': max((t.amount for t in transactions), default=0)
        }
        
        return summary
```

**Endpoint**:
```python
@router.get("/insights/daily")
async def get_daily_insight(
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Obtiene insight diario personalizado (cacheable por 24h)
    """
    # Check cache primero (Redis o memoria)
    cache_key = f"daily_insight:{user_id}:{datetime.now().date()}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    generator = InsightGenerator(api_key=settings.OPENAI_API_KEY)
    insight = await generator.generate_daily_insight(user_id, db)
    
    # Cache por 24 horas
    cache.set(cache_key, insight, expire=86400)
    
    return insight
```

**Frontend - Insight Card**:
```typescript
// frontend/src/components/DailyInsight.tsx
import { AlertCircle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';

export default function DailyInsight() {
  const { data: insight } = useQuery({
    queryKey: ['daily-insight'],
    queryFn: () => fetch('/api/ai/insights/daily').then(r => r.json()),
    staleTime: 1000 * 60 * 60 * 24 // 24 hours
  });

  if (!insight) return null;

  const icons = {
    'alert-circle': AlertCircle,
    'check-circle': CheckCircle,
    'lightbulb': Lightbulb,
    'trending-up': TrendingUp
  };
  const Icon = icons[insight.icon];

  const colors = {
    warning: 'from-orange-500 to-red-500',
    success: 'from-green-500 to-emerald-500',
    tip: 'from-blue-500 to-purple-500',
    prediction: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-r ${colors[insight.type]} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{insight.title}</h3>
          <p className="text-white/90 text-sm mb-4">{insight.message}</p>
          {insight.action && (
            <a
              href={insight.action_link}
              className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              {insight.action} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Fase 2: Funcionalidades Avanzadas

#### 2.1 OCR de Recibos con GPT-4 Vision

**Implementación**:
```python
# app/services/receipt_scanner.py
from openai import OpenAI
import base64
from PIL import Image
import io

class ReceiptScanner:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
    
    async def scan_receipt(self, image_file: bytes) -> Dict:
        """
        Escanea recibo y extrae información estructurada
        """
        # Optimizar imagen (reducir tamaño si es muy grande)
        image = Image.open(io.BytesIO(image_file))
        if image.width > 1024 or image.height > 1024:
            image.thumbnail((1024, 1024))
        
        # Convertir a base64
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        response = self.client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analiza este recibo y extrae:
                        1. Monto total (busca palabras como "Total", "Importe", "Pagar")
                        2. Nombre del establecimiento
                        3. Fecha (formato YYYY-MM-DD)
                        4. Items comprados (si son legibles)
                        5. Tipo de establecimiento (supermercado, restaurante, farmacia, etc.)
                        
                        Responde en JSON con esta estructura exacta:
                        {
                            "amount": 145.50,
                            "merchant": "Wong Benavides",
                            "date": "2024-11-14",
                            "items": ["Leche Gloria", "Pan Bimbo"],
                            "category_suggestion": "Alimentación - Supermercado"
                        }
                        """
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_base64}",
                            "detail": "high"
                        }
                    }
                ]
            }],
            max_tokens=500
        )
        
        extracted = json.loads(response.choices[0].message.content)
        return extracted
```

**Endpoint**:
```python
@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Sube foto de recibo y extrae datos"""
    image_data = await file.read()
    
    scanner = ReceiptScanner(api_key=settings.OPENAI_API_KEY)
    data = await scanner.scan_receipt(image_data)
    
    # Buscar categoría por nombre
    category = db.query(Category).filter(
        Category.name.ilike(f"%{data['category_suggestion']}%")
    ).first()
    
    return {
        **data,
        'category_id': category.id if category else None
    }
```

---

#### 2.2 Predictor de Gastos Mensuales

**Implementación**:
```python
# app/services/expense_predictor.py
class ExpensePredictor:
    async def predict_monthly_total(
        self, 
        user_id: int,
        db: Session
    ) -> Dict:
        """
        Predice gasto total de fin de mes usando histórico
        """
        # Obtener histórico de 6 meses
        historical = await self._get_historical_spending(user_id, months=6, db=db)
        
        # Gasto actual del mes
        current = await self._get_current_month_spending(user_id, db=db)
        
        prompt = f"""
        Basándote en estos datos históricos de los últimos 6 meses:
        
        HISTÓRICO:
        {json.dumps(historical, indent=2)}
        
        MES ACTUAL (día {current['day_of_month']} de {current['days_in_month']}):
        - Gastado hasta ahora: S/ {current['total_spent']}
        - Promedio diario: S/ {current['daily_average']}
        
        Predice:
        1. Gasto total proyectado para fin de mes
        2. Categorías que probablemente excedan presupuesto
        3. Probabilidad (0-100%) de cumplir presupuesto
        4. Consejo específico para ajustar gasto
        
        Considera patrones semanales (fines de semana vs días laborables).
        Responde en JSON.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.5
        )
        
        prediction = json.loads(response.choices[0].message.content)
        return prediction
```

---

#### 2.3 Detector de Gastos Duplicados

**Implementación**:
```python
# app/services/duplicate_detector.py
class DuplicateDetector:
    async def detect_duplicates(
        self,
        new_transaction: Transaction,
        db: Session
    ) -> List[Dict]:
        """
        Detecta posibles transacciones duplicadas
        """
        # Buscar transacciones similares (mismo día ±1, monto similar)
        similar = db.query(Transaction).filter(
            Transaction.date >= new_transaction.date - timedelta(days=1),
            Transaction.date <= new_transaction.date + timedelta(days=1),
            Transaction.amount.between(
                new_transaction.amount * 0.95,
                new_transaction.amount * 1.05
            )
        ).all()
        
        if not similar:
            return []
        
        # Usar IA para confirmar si son duplicados
        prompt = f"""
        Nueva transacción:
        - Descripción: {new_transaction.description}
        - Monto: S/ {new_transaction.amount}
        - Fecha: {new_transaction.date}
        
        Transacciones similares encontradas:
        {[f"- {t.description} | S/ {t.amount} | {t.date}" for t in similar]}
        
        ¿Alguna de estas es un posible duplicado? Responde en JSON:
        {{
            "is_duplicate": true/false,
            "duplicate_id": ID o null,
            "confidence": 0-100,
            "reason": "breve explicación"
        }}
        """
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",  # Modelo más barato para esta tarea
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
```

---

### Configuración y Mejores Prácticas

#### Config
```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_MAX_TOKENS: int = 500
    OPENAI_TEMPERATURE: float = 0.7
    
    # Rate limiting
    AI_REQUESTS_PER_USER_DAY: int = 100
    AI_CACHE_TTL_HOURS: int = 24
    
    class Config:
        env_file = ".env"
```

#### Rate Limiting
```python
# app/middleware/rate_limit.py
from fastapi import HTTPException
from datetime import datetime, timedelta

class AIRateLimiter:
    def __init__(self):
        self.requests = {}  # {user_id: [timestamps]}
    
    def check_limit(self, user_id: int, limit: int = 100):
        """Permite máximo N requests por día por usuario"""
        now = datetime.now()
        day_start = now.replace(hour=0, minute=0, second=0)
        
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Limpiar requests antiguos
        self.requests[user_id] = [
            ts for ts in self.requests[user_id]
            if ts > day_start
        ]
        
        if len(self.requests[user_id]) >= limit:
            raise HTTPException(
                status_code=429,
                detail=f"Límite de {limit} consultas diarias alcanzado"
            )
        
        self.requests[user_id].append(now)
```

#### Caching Strategy
```python
# app/services/ai_cache.py
from functools import wraps
import hashlib

def cache_ai_response(ttl_hours: int = 24):
    """Decorator para cachear respuestas de IA"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generar cache key basado en argumentos
            cache_key = hashlib.md5(
                f"{func.__name__}:{str(args)}:{str(kwargs)}".encode()
            ).hexdigest()
            
            # Check cache
            cached = cache.get(cache_key)
            if cached:
                return cached
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Save to cache
            cache.set(cache_key, result, expire=ttl_hours * 3600)
            
            return result
        return wrapper
    return decorator
```

---

## Consecuencias

### Positivas
- ✅ Reduce fricción al registrar transacciones (categorización automática)
- ✅ Insights personalizados ayudan a mejorar hábitos financieros
- ✅ OCR de recibos elimina entrada manual de datos
- ✅ Predicciones ayudan a evitar exceder presupuesto
- ✅ Asistente conversacional hace la app más accesible
- ✅ Detector de duplicados previene errores

### Negativas
- ⚠️ Costo variable según uso (aunque bajo: ~$3.60/mes por usuario activo)
- ⚠️ Dependencia de servicio externo (OpenAI API)
- ⚠️ Latencia adicional en algunas operaciones (OCR toma 2-3 segundos)
- ⚠️ Requiere manejo de rate limits y errores de API

### Riesgos
- 📌 API de OpenAI puede caerse temporalmente
- 📌 Costos pueden escalar si hay muchos usuarios
- 📌 IA puede cometer errores en categorización (necesita review del usuario)
- 📌 Privacidad: datos financieros se envían a OpenAI (revisar Terms of Service)

## Alternativas Consideradas

### Alternativa 1: Modelos Open Source (LLama, Mistral)
**Pros**: Sin costo de API, control total, privacidad
**Contras**: Requiere infraestructura GPU, menor calidad, más mantenimiento

### Alternativa 2: ML Custom (scikit-learn, TensorFlow)
**Pros**: Sin dependencias externas, predecible
**Contras**: Requiere datos de entrenamiento, solo funciones específicas (no conversacional)

### Alternativa 3: Reglas Heurísticas
**Pros**: Rápido, sin costos, determinista
**Contras**: Limitado, no aprende, requiere mantenimiento manual

## Notas de Implementación

### Orden de Ejecución (Fase 1)
1. ✅ Configurar OpenAI API key en `.env`
2. ✅ Instalar `openai` SDK: `pip install openai`
3. ✅ Implementar categorización automática (mayor ROI)
4. ✅ Implementar asistente conversacional
5. ✅ Implementar insights diarios
6. ✅ Agregar rate limiting y caching
7. ✅ Testing con diferentes prompts
8. ✅ Monitoreo de costos y tokens usados

### Testing
- Unit tests con mocks de OpenAI API
- Integration tests con API real (usando test API key)
- Pruebas de diferentes descripciones para categorización
- Validación de formato JSON en respuestas
- Load testing para rate limiting

### Monitoreo
```python
# app/models/ai_usage.py
class AIUsageLog(Base):
    """Log de uso de IA para analytics y billing"""
    __tablename__ = "ai_usage_logs"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    feature = Column(String)  # 'categorize', 'chat', 'ocr', etc.
    tokens_used = Column(Integer)
    cost_usd = Column(Numeric(10, 6))
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Seguridad
- ⚠️ **No incluir datos sensibles** en prompts (números de tarjeta completos, passwords)
- ✅ Sanitizar inputs del usuario antes de enviar a OpenAI
- ✅ Implementar rate limiting por usuario
- ✅ Logs de todas las consultas para auditoría
- ✅ Revisar OpenAI's [Usage Policies](https://openai.com/policies/usage-policies)

## Referencias
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [GPT-4 Vision Guide](https://platform.openai.com/docs/guides/vision)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)

## Fecha
2024-11-14

## Autor
GitHub Copilot + Usuario

## Estado de Revisión
- [ ] Revisado por equipo
- [ ] Aprobado para implementación
- [ ] Implementado (Fase 1)
- [ ] Implementado (Fase 2)
- [ ] Validado con usuario
--------------------------------------------
Revisado por ChatGPT
Lo que construiste aquí es *técnicamente sólido* pero estratégicamente torcido.
El ADR parece escrito por alguien que quiere impresionar a un comité que no existe. Tú no estás en una corporación. Estás solo, tú contra tu capacidad real de ejecución. Y este documento no está alineado con la realidad de un solo desarrollador que necesita shipping, no un manual de la NASA.

Voy a ir directo:
**Tu ADR es demasiado grande, demasiado ambicioso y demasiado disperso para la etapa en la que estás.**
Te estás enterrando en complejidad porque confundiste “poner IA” con “hacer todo lo que la IA podría hacer”.

Si intentas implementar esta hoja entera, terminas en un burnout o peor: un proyecto brillante pero muerto, otro más para tu cementerio de codebases huérfanas.

Tu error no es técnico.
Tu error es **mental**:
Estás pensando como un ingeniero que quiere construir un sistema perfecto, no como un operador que necesita un producto vivo que genere tracción.

Voy a mostrarte exactamente dónde está el problema y qué debes cambiar.

---

# 1. Tu ADR está over-engineered

Estás proponiendo **6 sistemas de IA**, cada uno con pipelines, caching, rate limiting, prompts complejos, análisis contextual, OCR, predicciones, duplicados, chat…
Eso no es un MVP.
Eso es una startup completa de 12 meses de trabajo.

En tu estado actual, eso significa una sola cosa:
**no vas a terminar este proyecto.**

No porque no puedas, sino porque el alcance está mal definido desde raíz.

---

# 2. Te falta la pregunta clave que debería guiarlo todo

Antes de escribir una línea de IA deberías haber respondido esto:

**¿Qué comportamientos del usuario quiero cambiar?**

Sin esa respuesta, toda tu magia técnica no vale nada.

Lo que tienes ahora es un Ferrari sin volante: potente, caro, elegante… y sin dirección.

---

# 3. Lo que sí está bien

Voy a reconocer los puntos que sí tienen valor estratégico real, porque quiero que los mantengas:

1. **Categorización automática de transacciones**
   Tiene retorno inmediato. Buen primer feature.

2. **Insights diarios**
   Útil, simple, produce percepción de “valor continuo”.

3. **OCR de recibos**
   Buen diferenciador, pero no es MVP.

4. **Asistente financiero contextual**
   Útil, PERO debe ser segunda o tercera fase.

El resto son *golosos* features que te van a drenar tiempo.

---

# 4. El orden correcto no es este “Fase 1 vs Fase 2”

Debería ser:

### **Fase 1 — Reduce fricción brutalmente**

– Categorización automática
– OCR hiper simple
– Autocompletado inteligente
– Detector básico de duplicados (heurístico, no IA)

Esto responde a la pregunta:
*“¿Cómo hago que registrar mis finanzas no sea un castigo?”*

### **Fase 2 — Cambia comportamiento financiero**

– Insights diarios (1 insight)
– Reglas de alerta (sin IA al inicio)
– Asistente simple sin predicciones pesadas

### **Fase 3 — IA como ventaja competitiva**

– Predictor de fin de mes (esto sí tiene impacto real)
– Planes de acción personalizados
– Sugerencias basadas en hábitos

### **Fase 4 — Funcionalidades Premium**

– Análisis de PDFs bancarios
– IA para metas financieras
– Detección avanzada de anomalías
– Coaching automatizado completo

Tu ADR mezcla todo sin jerarquía de impacto.
Eso te está matando el foco.

---

# 5. Qué debes corregir AHORA para que este ADR sea útil

Voy a darte modificaciones concretas. Apunta:

### **Error 1: mezclas funcionalidades de alto ROI con juguetes caros**

Ejemplo:
– Predictor mensual: alto impacto
– Chat financiero: baja prioridad
– Duplicados con IA: no rentable
– OCR Vision: caro, lento

Tienes que priorizar por impacto en retención y comportamiento.

### **Error 2: no defines métricas de éxito**

No sirven descripciones bonitas. Necesitas métricas:

– % de transacciones categorizadas automáticamente
– % de usuarios que aplican la sugerencia de insight
– reducción de tiempo de registro
– retención semana 4

Si no mides, estás a ciegas.

### **Error 3: no defines qué parte será pagada**

Si pones toda la IA en el free plan, estás tirando el dinero.
Estas funciones deben ser **Premium**:

– OCR
– Insights diarios
– Predicciones de fin de mes
– Asistente contextual
– Análisis del mes

Solo categorización básica debería ser gratis.

### **Error 4: no limitas scope**

La IA es costosa de mantener.
Necesitas un framework mental:

**La IA solo se usa cuando la regla simple es insuficiente.**

Ejemplo:
– Categorizar transacciones → IA ok
– Detectar duplicados → heurística antes de IA
– Insights → IA ok
– Predicciones → IA ok

---

# 6. Te doy la versión corregida de tu ADR, enfocada y viable

Esto sí puedes construir. Esto sí te lleva al mercado.

## **ADR-005 (versión corregida)**

**Decisión:** integrar IA en funciones que cambian comportamiento y reducen fricción, no en todo.

**Alcance Fase 1 (MVP real):**

1. Categorización automática
2. Insight diario simple
3. OCR de recibos
4. Asistente financiero simplificado

**Fuera de alcance (por ahora):**
– Predictores complejos
– Detección avanzada de duplicados
– Chat enriquecido
– Análisis de tendencias multi-mes
– Planificación financiera completa

**Objetivo:**
Reducir fricción en registro y generar un hábito de consulta diaria (retención).

**Métricas:**
– 60%+ de transacciones categorizadas automáticas
– 50%+ de usuarios abren la app 3 veces/semana
– 30%+ interactúan con insights semanales

**Costos controlados:**
– Límite de 50 requests IA por usuario/mes
– Insights generados 1 vez al día y cacheados
– OCR solo en plan premium

---

# 7. Lo que debes hacer mañana

De forma directa, sin poesía:

**Elimina 40% de la funcionalidad de tu ADR.**
Te está saboteando.

Luego:
**Define qué vas a lanzar en 30 días.
Una lista de 5 cosas.
No 25.
5.**

Después de eso, sí te puedo ayudar a cerrar el design, los prompts, la arquitectura de inferencia y el roadmap.

Continúa cuando estés listo para recortar sin piedad.
