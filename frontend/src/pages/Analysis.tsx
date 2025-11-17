import { Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon, ListChecks, Target, AlertTriangle, Clock, Zap } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  AreaChart, Area, BarChart, Bar, LineChart, Line, Treemap, RadialBarChart, RadialBar 
} from 'recharts';
import { useCurrentCycle, useCategoryAnalysis, useTrends, useAnalysisSummary, useBudgetComparison } from '../lib/hooks/useApi';
import CategoryIcon from '../components/CategoryIcon';
import BudgetComparisonSection from '../components/BudgetComparisonSection';
import ChartCard from '../components/ChartCard';
import { Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { exchangeRateApi } from '../lib/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { useDemoMode } from '../lib/hooks/useDemoMode';
import { formatCurrencyISO, formatBudget } from '@/lib/format';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#8B5CF6'];

type TabType = 'summary' | 'charts' | 'details';


export default function Analysis() {
  const { data: currentCycle } = useCurrentCycle();
  const [selectedCycleOffset, setSelectedCycleOffset] = useState(0); // 0 = current, -1 = previous, etc.
  const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const { applyDemoScale } = useDemoMode();
  

  // Required chart ids (ensure new charts get appended if missing in saved order)
  const REQUIRED_CHART_IDS = ['gauge', 'savings', 'budgetVsReal', 'treemap', 'pie', 'trends'];

  // Chart order state with localStorage persistence (auto-adding missing ids)
  const [chartOrder, setChartOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('analysis-chart-order');
    let order = saved ? JSON.parse(saved) : [...REQUIRED_CHART_IDS];
    // Append any newly introduced chart ids not present in saved order
    REQUIRED_CHART_IDS.forEach(id => {
      if (!order.includes(id)) order.push(id);
    });
    return order;
  });

  // Save chart order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('analysis-chart-order', JSON.stringify(chartOrder));
  }, [chartOrder]);

  // Fetch exchange rate when switching to USD
  useEffect(() => {
    if (displayCurrency === 'USD') {
      setRateLoading(true);
      exchangeRateApi.getRate()
        .then(data => setExchangeRate(data.rate))
        .catch(err => console.error('Error fetching exchange rate:', err))
        .finally(() => setRateLoading(false));
    }
  }, [displayCurrency]);

  // Convert amount based on display currency
  const convertAmount = (amountPEN: number) => {
    if (displayCurrency === 'USD' && exchangeRate) {
      return amountPEN / exchangeRate;
    }
    return amountPEN;
  };



  // Handle drag end for chart reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setChartOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        
        const newOrder = [...items];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id as string);
        
        return newOrder;
      });
    }
  };
  
  // Calculate cycle dates based on selection
  const cycleParams = useMemo(() => {
    if (!currentCycle) return undefined;
    
    if (selectedCycleOffset === 0) {
      return {
        startDate: currentCycle.start_date,
        endDate: currentCycle.end_date,
        cycleName: currentCycle.cycle_name
      };
    }
    
    // Calculate offset cycle dates
    const startDate = new Date(currentCycle.start_date);
    const endDate = new Date(currentCycle.end_date);
    
    // Move back by number of months (each cycle is approximately 1 month)
    const monthsOffset = selectedCycleOffset;
    startDate.setMonth(startDate.getMonth() + monthsOffset);
    endDate.setMonth(endDate.getMonth() + monthsOffset);
    
    // Calculate cycle name (month of end date)
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const cycleName = monthNames[endDate.getMonth()];
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      cycleName: cycleName
    };
  }, [currentCycle, selectedCycleOffset]);
  
  const { data: categoryData, isLoading: categoryLoading } = useCategoryAnalysis(
    cycleParams?.startDate, 
    cycleParams?.endDate
  );
  const { data: trendsData, isLoading: trendsLoading } = useTrends(6);
  const { data: summary, isLoading: summaryLoading } = useAnalysisSummary(
    cycleParams?.startDate,
    cycleParams?.endDate
  );
  const { data: budgetComparison } = useBudgetComparison(cycleParams?.cycleName || '');

  // Calculate days in current cycle
  const daysInCycle = useMemo(() => {
    if (!cycleParams) return 30; // default fallback
    const start = new Date(cycleParams.startDate);
    const end = new Date(cycleParams.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
    return diffDays;
  }, [cycleParams]);

  // Prepare pie chart data (only expenses, top 10)
  const expenseData = categoryData?.filter(c => c.category_type === 'expense')
    .sort((a, b) => b.total - a.total) || [];
  const pieData = expenseData.slice(0, 10).map(c => ({
    name: c.category_name,
    value: c.total,
    icon: c.category_icon,
  }));

  // Prepare line chart data
  const lineData = trendsData?.map(t => ({
    name: t.cycle_name,
    Ingresos: t.income,
    Gastos: t.expense,
  })).reverse() || [];

  // Top categories (all categories sorted by total descending)
  const topCategories = categoryData?.sort((a, b) => b.total - a.total) || [];
  // Top expense categories only (for gasto section)
  const topExpenseCategories = categoryData?.filter(c => c.category_type === 'expense').sort((a, b) => b.total - a.total) || [];
  // Income categories only
  const incomeCategories = categoryData?.filter(c => c.category_type === 'income') || [];

  // Prepare Budget vs Real Bar Chart data
  const budgetVsRealData = budgetComparison?.categories
    ?.filter(c => c.budgeted > 0 || c.actual > 0)
    .slice(0, 8)
    .map(c => ({
      name: c.category_name.length > 15 ? c.category_name.substring(0, 15) + '...' : c.category_name,
      Presupuesto: convertAmount(c.budgeted),
      Real: convertAmount(c.actual),
      type: c.category_type,
    })) || [];

  // Prepare Savings Evolution data
  const savingsEvolutionData = trendsData?.map(t => ({
    name: t.cycle_name,
    Ahorro: convertAmount(t.income - t.expense),
    Meta: convertAmount((t.income * 0.2)), // 20% savings goal
  })).reverse() || [];

  // Prepare Treemap data
  const treemapData = expenseData.slice(0, 12).map((c, index) => ({
    name: c.category_name,
    size: c.total,
    fill: COLORS[index % COLORS.length],
  }));

  // Calculate budget compliance percentage for gauge
  const budgetCompliance = budgetComparison?.summary 
    ? (budgetComparison.summary.total_actual_expense / budgetComparison.summary.total_budgeted_expense) * 100 
    : 0;

  // Projections and Alerts calculations
  const projections = useMemo(() => {
    if (!cycleParams || !summary || !budgetComparison) return null;

    const today = new Date();
    const cycleStart = new Date(cycleParams.startDate);
    const cycleEnd = new Date(cycleParams.endDate);
    
    // Days elapsed and remaining
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((cycleEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Current daily average
    const currentDailyAvg = summary.total_expense / daysElapsed;
    
    // Projected end of cycle spending
    const projectedTotal = currentDailyAvg * daysInCycle;
    
    // Budget remaining
    const budgetRemaining = budgetComparison.summary.total_budgeted_expense - summary.total_expense;
    
    // Suggested daily spending to stay on budget
    const suggestedDaily = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;

    return {
      daysElapsed,
      daysRemaining,
      currentDailyAvg,
      projectedTotal,
      budgetRemaining,
      suggestedDaily,
      isOverBudget: budgetRemaining < 0,
      projectionVsBudget: projectedTotal - budgetComparison.summary.total_budgeted_expense
    };
  }, [cycleParams, summary, budgetComparison, daysInCycle]);

  // Budget alerts (categories near or over limit)
  const budgetAlerts = useMemo(() => {
    if (!budgetComparison) return [];
    
    return budgetComparison.categories
      .filter(c => c.category_type === 'expense' && c.budgeted > 0)
      .map(c => {
        const percentage = (c.actual / c.budgeted) * 100;
        let status: 'safe' | 'warning' | 'danger' = 'safe';
        
        if (percentage >= 100) status = 'danger';
        else if (percentage >= 80) status = 'warning';
        
        return {
          ...c,
          percentage: Math.round(percentage),
          status
        };
      })
      .filter(c => c.status !== 'safe')
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [budgetComparison]);

  // Weekly trend data for mini chart
  const weeklyTrendData = useMemo(() => {
    if (!categoryData || !cycleParams) return [];
    
    // This is a simplified version - ideally you'd fetch daily transactions
    // For now, we'll create a mock weekly trend based on available data
    const weeks = Math.ceil(daysInCycle / 7);
    const avgPerWeek = (summary?.total_expense || 0) / weeks;
    
    return Array.from({ length: weeks }, (_, i) => ({
      name: `Sem ${i + 1}`,
      Gastos: avgPerWeek * (0.8 + Math.random() * 0.4) // Simulate variation
    }));
  }, [categoryData, cycleParams, daysInCycle, summary]);

  // Actual amounts: always show 2 decimals + ISO code
  const formatAmount = (value: number) => {
    const demoValue = applyDemoScale(value);
    const amount = convertAmount(demoValue);
    return formatCurrencyISO(amount, displayCurrency, { decimals: 2 });
  };


  // Budget (planned) amounts: integer only
  const formatBudgetAmount = (value: number) => {
    const demoValue = applyDemoScale(value);
    const amount = convertAmount(demoValue);
    return formatBudget(amount, displayCurrency);
  };

  // Chart components mapping
  const chartComponents: Record<string, React.ReactElement> = {
    gauge: (
      <ChartCard key="gauge" id="gauge">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-purple-200 bg-white/50">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-extrabold text-text-primary">Cumplimiento de Presupuesto</h2>
            </div>
            <p className="text-sm text-text-secondary mt-1">Porcentaje del presupuesto utilizado</p>
          </div>
          <div className="p-6">
            {budgetComparison?.summary ? (
              <div className="flex flex-col items-center">
                <div className={budgetCompliance > 100 ? "animate-pulse" : ""}>
                  <div 
                    className="relative"
                    style={budgetCompliance > 100 ? {
                      filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 40px rgba(251, 146, 60, 0.4))'
                    } : {}}
                  >
                    <ResponsiveContainer width="100%" height={280}>
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="80%" 
                        outerRadius="100%" 
                        barSize={30}
                        data={[{ name: 'Uso', value: Math.min(budgetCompliance, 150), fill: budgetCompliance > 100 ? '#FB923C' : budgetCompliance > 80 ? '#F97316' : '#10B981' }]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar background dataKey="value" cornerRadius={15} />
                        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-5xl font-black fill-text-primary">
                          {budgetCompliance.toFixed(0)}%
                        </text>
                        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-text-secondary font-semibold">
                          {budgetCompliance > 100 ? 'Sobre presupuesto' : budgetCompliance > 80 ? 'Cerca del límite' : 'Dentro del presupuesto'}
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <div className="text-center p-3 bg-white/70 rounded-xl">
                    <p className="text-xs text-text-secondary font-semibold">Presupuestado</p>
                    <p className="text-lg font-bold text-text-primary">{formatBudgetAmount(budgetComparison.summary.total_budgeted_expense)}</p>
                  </div>
                  <div className="text-center p-3 bg-white/70 rounded-xl">
                    <p className="text-xs text-text-secondary font-semibold">Gastado</p>
                    <p className="text-lg font-bold text-orange-600">{formatAmount(budgetComparison.summary.total_actual_expense)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-text-secondary">
                No hay datos de presupuesto
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    savings: (
      <ChartCard key="savings" id="savings">
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Evolución del Ahorro</h2>
            <p className="text-sm text-text-secondary mt-1">Comparación con meta del 20%</p>
          </div>
          <div className="p-6">
            {savingsEvolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={savingsEvolutionData}>
                  <defs>
                    <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => formatAmount(value as number)}
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #E5E7EB', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Ahorro" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="Meta" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#F59E0B', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-text-secondary">
                No hay datos de tendencias
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    budgetVsReal: (
      <ChartCard key="budgetVsReal" id="budgetVsReal">
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Presupuesto vs Real</h2>
            <p className="text-sm text-text-secondary mt-1">Top 8 categorías</p>
          </div>
          <div className="p-6">
            {budgetVsRealData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={budgetVsRealData} margin={{ left: 10, right: 10, top: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => name === 'Presupuesto' ? formatBudgetAmount(value as number) : formatAmount(value as number)}
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #E5E7EB', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="Presupuesto" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Real" fill="#EC4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos de comparación
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    treemap: (
      <ChartCard key="treemap" id="treemap">
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Distribución de Gastos</h2>
            <p className="text-sm text-text-secondary mt-1">Vista jerárquica por categoría</p>
          </div>
          <div className="p-6">
            {treemapData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  stroke="#fff"
                  content={({ x, y, width, height, name, size }) => {
                    if (width < 60 || height < 40) return <g />;
                    return (
                      <g>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          style={{
                            fill: treemapData.find(d => d.name === name)?.fill || '#8B5CF6',
                            stroke: '#fff',
                            strokeWidth: 2,
                          }}
                        />
                        <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={width > 120 ? 12 : 10} fontWeight="600" style={{ pointerEvents: 'none' }}>
                          {name}
                        </text>
                        <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="#fff" fontSize={width > 120 ? 11 : 9} fontWeight="500" style={{ pointerEvents: 'none' }}>
                          {formatAmount(size as number)}
                        </text>
                      </g>
                    );
                  }}
                />
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos de gastos
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    pie: (
      <ChartCard key="pie" id="pie">
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Top 10 Categorías</h2>
          </div>
          <div className="p-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={(entry: any) => `${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={110}
                    innerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos de gastos
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    trends: (
      <ChartCard key="trends" id="trends">
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Tendencias por Ciclo</h2>
          </div>
          <div className="p-6">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Area type="monotone" dataKey="Ingresos" stackId="1" stroke="#10B981" fill="url(#colorIngresos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Gastos" stackId="1" stroke="#EF4444" fill="url(#colorGastos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos de tendencias
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Análisis Financiero</h1>
          {cycleParams ? (
            <p className="text-body-sm text-text-secondary mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ciclo: {cycleParams.cycleName} ({new Date(cycleParams.startDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {new Date(cycleParams.endDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })})
            </p>
          ) : (
            <p className="text-body-sm text-text-secondary mt-1">
              Visualiza tus patrones de gasto e ingresos
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setDisplayCurrency('PEN')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                displayCurrency === 'PEN'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              PEN
            </button>
            <button
              onClick={() => setDisplayCurrency('USD')}
              disabled={rateLoading}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                displayCurrency === 'USD'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              } disabled:opacity-50`}
            >
              {rateLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'USD'}
            </button>
          </div>

          {/* Cycle Selector */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setSelectedCycleOffset(0)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedCycleOffset === 0
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Este ciclo
            </button>
            <button
              onClick={() => setSelectedCycleOffset(-1)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedCycleOffset === -1
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setSelectedCycleOffset(-2)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedCycleOffset === -2
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Hace 2 ciclos
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'summary'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
            RESUMEN
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'charts'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <PieChartIcon className="w-4 h-4" strokeWidth={2.5} />
            GRÁFICOS
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'details'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <ListChecks className="w-4 h-4" strokeWidth={2.5} />
            DETALLE
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {(categoryLoading || summaryLoading) ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Ingresos</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ArrowUpRight className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {formatAmount(summary?.total_income || 0)}
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              Total del ciclo
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Gastos</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ArrowDownRight className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {formatAmount(summary?.total_expense || 0)}
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              {summary?.transaction_count || 0} transacciones
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className={`bg-gradient-to-br ${(summary?.balance || 0) >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-400 to-orange-500'} rounded-3xl p-8 shadow-card text-white`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Balance</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <DollarSign className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {formatAmount(summary?.balance || 0)}
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              Ingresos - Gastos
            </div>
          </div>
        </div>

        {/* Avg Daily Expense */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Gasto Diario</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {formatAmount(summary?.avg_daily_expense || 0)}
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              Promedio por día
            </div>
          </div>
        </div>
      </div>

          {/* Top 5 Categories by Spending */}
          <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
            <h2 className="text-xl font-bold text-text-primary mb-6">Top 5 Categorías de Gasto</h2>
            {topExpenseCategories.length > 0 ? (
              <div className="space-y-3">
                {topExpenseCategories.slice(0, 5).map((cat, index) => (
                  <div key={`expense-${cat.category_id}-${index}`} className="flex items-center justify-between p-4 bg-surface-soft rounded-xl hover:bg-background transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                        <CategoryIcon iconName={cat.category_icon} size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{cat.category_name}</p>
                        <p className="text-xs text-text-secondary">{cat.count} transacciones</p>
                      </div>
                    </div>
                    <p className="font-bold text-text-primary text-lg">{formatAmount(cat.total)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">No hay datos de gastos</div>
            )}
          </div>

          {/* Projections and Alerts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Projections Card */}
            <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-8 shadow-card hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-button">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Proyecciones</h3>
              </div>
              {projections ? (
                <div className="space-y-4">
                  <div className="p-5 bg-blue-500/10 backdrop-blur-md border border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Proyección Fin de Ciclo</span>
                    </div>
                    <p className="text-3xl font-extrabold text-text-primary">{formatAmount(projections.projectedTotal)}</p>
                    <p className={`text-sm font-bold mt-2 ${projections.projectionVsBudget > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {projections.projectionVsBudget > 0 ? '⚠️ +' : '✓ '}{formatAmount(Math.abs(projections.projectionVsBudget))} vs presupuesto
                    </p>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-surface-soft rounded-2xl border border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-text-primary">Días restantes</span>
                    </div>
                    <span className="font-extrabold text-text-primary text-2xl">{projections.daysRemaining}</span>
                  </div>

                  <div className="p-5 bg-emerald-500/10 backdrop-blur-md border border-emerald-200 rounded-2xl">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Gasto Diario Sugerido</span>
                    <p className="text-2xl font-extrabold text-text-primary mt-2">{formatAmount(projections.suggestedDaily)}</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1">
                      Para cumplir tu presupuesto
                    </p>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-surface-soft rounded-2xl border border-border">
                    <span className="text-sm font-bold text-text-primary">Presupuesto restante</span>
                    <span className={`font-extrabold text-xl ${projections.isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatAmount(projections.budgetRemaining)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">No hay datos suficientes</div>
              )}
            </div>

            {/* Budget Alerts Card */}
            <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-8 shadow-card hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-button">
                  <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Alertas de Presupuesto</h3>
              </div>
              {budgetAlerts.length > 0 ? (
                <div className="space-y-3">
                  {budgetAlerts.map((alert, index) => (
                    <div 
                      key={`alert-${alert.category_id}-${index}`}
                      className={`p-4 rounded-2xl border ${
                        alert.status === 'danger' 
                          ? 'bg-red-500/10 backdrop-blur-sm border-red-200' 
                          : 'bg-orange-500/10 backdrop-blur-sm border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon iconName={alert.category_icon} size={18} />
                            <span className="font-bold text-base text-text-primary">{alert.category_name}</span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 bg-surface-soft rounded-full h-3 overflow-hidden border border-border">
                              <div 
                                className={`h-full transition-all ${
                                  alert.status === 'danger' ? 'bg-red-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-extrabold min-w-[50px] text-right ${
                              alert.status === 'danger' ? 'text-red-600' : 'text-orange-600'
                            }`}>
                              {alert.percentage}%
                            </span>
                          </div>
                          <p className="text-sm font-bold text-text-primary">
                            {formatAmount(alert.actual)} <span className="text-text-secondary font-normal">de</span> {formatAmount(alert.budgeted)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
                    <span className="text-3xl">✓</span>
                  </div>
                  <p className="text-sm font-medium text-green-600">¡Todo bajo control!</p>
                  <p className="text-xs text-text-secondary mt-1">Todas las categorías dentro del presupuesto</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl shadow-button">
                <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Tendencia Semanal</h3>
                <p className="text-xs text-text-secondary">Distribución de gastos a lo largo del ciclo</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: number) => formatAmount(value)}
                />
                <Area type="monotone" dataKey="Gastos" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Gráficos */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {(categoryLoading || trendsLoading) ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chartOrder} strategy={rectSortingStrategy}>
              <div className="grid gap-6 md:grid-cols-2">
                {chartOrder.map(chartId => chartComponents[chartId])}
              </div>
            </SortableContext>
          </DndContext>
          )}
        </div>
      )}

      {/* Tab: Detalle */}
      {activeTab === 'details' && (
        <div className="space-y-8">
          {categoryLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
          {/* Budget Comparison Section */}
          {cycleParams && (
            <div className="bg-surface border border-border rounded-3xl p-8 shadow-card overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-text-primary">Presupuesto vs Real</h2>
                  <p className="text-sm text-text-secondary mt-2">Compara tu planificación contra la ejecución del ciclo</p>
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <BudgetComparisonSection cycleName={cycleParams.cycleName} displayCurrency={displayCurrency} />
              </div>
            </div>
          )}

          {/* Top 10 Categories - Full width */}
          <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
            <div className="p-8 border-b border-border bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-xl font-extrabold text-text-primary">Todas las Categorías</h2>
              <p className="text-sm text-text-secondary mt-2">Detalle completo de cada categoría con actividad durante el ciclo</p>
            </div>
            <div className="p-8">
              {topCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topCategories.map((cat, index) => (
                    <div key={`category-${cat.category_id}-${index}`} className="flex items-center justify-between p-5 bg-surface-soft rounded-2xl hover:bg-surface transition-colors border border-border shadow-sm group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                          <CategoryIcon iconName={cat.category_icon} size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary tracking-tight">{cat.category_name}</p>
                          <p className="text-xs text-text-secondary font-medium">{cat.count} transacciones</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-extrabold text-text-primary text-lg">{formatAmount(cat.total)}</p>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">No hay categorías</div>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      )}


    </div>
  );
}
