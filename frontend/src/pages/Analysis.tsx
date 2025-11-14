import { Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { useCurrentCycle, useCategoryAnalysis, useTrends, useAnalysisSummary } from '../lib/hooks/useApi';
import CategoryIcon from '../components/CategoryIcon';
import { Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { exchangeRateApi } from '../lib/api';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#8B5CF6'];

export default function Analysis() {
  const { data: currentCycle } = useCurrentCycle();
  const [selectedCycleOffset, setSelectedCycleOffset] = useState(0); // 0 = current, -1 = previous, etc.
  const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

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

  if (categoryLoading || trendsLoading || summaryLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare pie chart data (only expenses, top 10)
  const expenseData = categoryData?.filter(c => c.category_type === 'expense') || [];
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

  // Top 10 categories
  const topCategories = expenseData.slice(0, 10);

  const formatCurrency = (value: number) => {
    const amount = convertAmount(value);
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
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
                  ? 'bg-emerald-500 text-white shadow-sm'
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
                  ? 'bg-emerald-500 text-white shadow-sm'
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
              {formatCurrency(summary?.total_income || 0)} <span className="text-2xl opacity-80">{displayCurrency}</span>
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              Total del ciclo
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Gastos</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ArrowDownRight className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {formatCurrency(summary?.total_expense || 0)} <span className="text-2xl opacity-80">{displayCurrency}</span>
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
              {formatCurrency(summary?.balance || 0)} <span className="text-2xl opacity-80">{displayCurrency}</span>
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
              {formatCurrency(summary?.avg_daily_expense || 0)} <span className="text-2xl opacity-80">{displayCurrency}</span>
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              Promedio por día
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Expense Distribution */}
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Top 10 Categorías</h2>
          </div>
          <div className="p-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={(entry: any) => 
                      `${(entry.percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    innerRadius={55}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${formatCurrency(value as number)} ${displayCurrency}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-text-secondary">
                No hay datos de gastos
              </div>
            )}
          </div>
        </div>

        {/* Area Chart - Trends */}
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Tendencias por Ciclo</h2>
          </div>
          <div className="p-6">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
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
                  <Tooltip 
                    formatter={(value) => `${formatCurrency(value as number)} ${displayCurrency}`}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Area 
                    type="monotone" 
                    dataKey="Ingresos" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="url(#colorIngresos)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Gastos" 
                    stackId="1"
                    stroke="#EF4444" 
                    fill="url(#colorGastos)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-text-secondary">
                No hay datos de tendencias
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Categories & Largest Expense */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top 10 Categories */}
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Detalle por Categoría</h2>
          </div>
          <div className="p-6">
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map((cat, index) => (
                  <div key={cat.category_id} className="flex items-center justify-between p-4 bg-surface-soft rounded-xl hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" 
                           style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                        <CategoryIcon iconName={cat.category_icon} size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">{cat.category_name}</p>
                        <p className="text-sm text-text-secondary">{cat.count} transacciones</p>
                      </div>
                    </div>
                    <p className="font-extrabold text-text-primary">{formatCurrency(cat.total)} <span className="text-sm opacity-70">{displayCurrency}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">No hay categorías</div>
            )}
          </div>
        </div>

        {/* Largest Expense & Stats */}
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Estadísticas</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Largest Expense */}
            {summary?.largest_expense && (
              <div className="p-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl text-white">
                <p className="text-sm font-bold uppercase tracking-wide opacity-90 mb-3">Mayor Gasto</p>
                <p className="font-extrabold text-3xl mb-2">
                  {formatCurrency(summary.largest_expense.amount)} <span className="text-xl opacity-80">{displayCurrency}</span>
                </p>
                <p className="text-sm font-bold mb-1">{summary.largest_expense.description}</p>
                <p className="text-xs opacity-80">Categoría: {summary.largest_expense.category}</p>
              </div>
            )}

            {/* Transaction Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-surface-soft rounded-xl border border-border">
                <p className="text-sm text-text-secondary mb-1">Total Transacciones</p>
                <p className="text-2xl font-extrabold text-text-primary">{summary?.transaction_count || 0}</p>
              </div>
              <div className="p-4 bg-surface-soft rounded-xl border border-border">
                <p className="text-sm text-text-secondary mb-1">Promedio por Transacción</p>
                <p className="text-xl font-extrabold text-text-primary">
                  {formatCurrency(summary?.avg_transaction || 0)} <span className="text-sm opacity-70">{displayCurrency}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
