import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon, ListChecks, AlertTriangle, Clock, Zap, Eye, EyeOff } from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { useCurrentCycle, useCategoryAnalysis, useTrends, useAnalysisSummary, useBudgetComparison, useTransactions, useExchangeRate } from '@/lib/hooks/useApi';
import { CycleInfo } from '@/components/ui/cycle-info';
import CategoryIcon from '../components/CategoryIcon';
import BudgetComparisonSection from '../components/BudgetComparisonSection';
import ChartCard from '../components/ChartCard';
import { Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { exchangeRateApi } from '@/lib/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { formatCurrencyISO, formatBudget } from '@/lib/format';

const COLORS = ['#10B981', '#F43F5E', '#EC4899', '#8B5CF6', '#3B82F6', '#F59E0B', '#06B6D4', '#84CC16'];

type TabType = 'summary' | 'charts' | 'details';



export default function Analysis() {
  const { data: currentCycle } = useCurrentCycle();
  const { data: exchangeRate, isLoading: rateLoading } = useExchangeRate();
  const [selectedCycleOffset, setSelectedCycleOffset] = useState(0); // 0 = current, -1 = previous, etc.
  const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [exchangeRateState, setExchangeRateState] = useState<number | null>(null);
  const [rateLoadingState, setRateLoadingState] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const { applyDemoScale } = useDemoMode();
  const [animatedPieData, setAnimatedPieData] = useState<Array<{ id: string; label: string; value: number }>>([]);
  

  // Required chart ids (ensure new charts get appended if missing in saved order)
  const REQUIRED_CHART_IDS = ['pie', 'budgetVsReal', 'trends'];

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
      setRateLoadingState(true);
      exchangeRateApi.getRate()
        .then(data => setExchangeRateState(data.rate))
        .catch(err => console.error('Error fetching exchange rate:', err))
        .finally(() => setRateLoadingState(false));
    }
  }, [displayCurrency]);

  // Convert amount based on display currency
  const convertAmount = (amountPEN: number) => {
    if (displayCurrency === 'USD' && exchangeRateState) {
      return amountPEN / exchangeRateState;
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
    const currentStartDate = new Date(currentCycle.start_date);
    const currentEndDate = new Date(currentCycle.end_date);
    
    // Move back/forward by number of cycles
    const monthsOffset = selectedCycleOffset;
    currentStartDate.setMonth(currentStartDate.getMonth() + monthsOffset);
    currentEndDate.setMonth(currentEndDate.getMonth() + monthsOffset);
    
    // Calculate cycle name - use the month where the cycle ENDS
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const cycleName = monthNames[currentEndDate.getMonth()];
    
    return {
      startDate: currentStartDate.toISOString().split('T')[0],
      endDate: currentEndDate.toISOString().split('T')[0],
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

  // Prepare expense data (sorted) - memoized to prevent infinite loop
  const expenseData = useMemo(() => {
    return categoryData?.filter(c => c.category_type === 'expense')
      .sort((a, b) => b.total - a.total) || [];
  }, [categoryData]);

  // Prepare pie chart data (only expenses, top 10)
  const pieData = useMemo(() => {
    return expenseData.slice(0, 10).map(c => ({
      name: c.category_name,
      value: c.total,
      icon: c.category_icon,
    }));
  }, [expenseData]);

  // Prepare top 5 expenses for ranking display
  const topExpenses = useMemo(() => {
    return expenseData.slice(0, 5);
  }, [expenseData]);

  // Animate pie chart on data change OR when switching to charts tab
  useEffect(() => {
    // Only animate when on charts tab
    if (activeTab !== 'charts') return;
    
    if (pieData.length === 0) {
      setAnimatedPieData([]);
      return;
    }
    
    // Start with 0 values
    const initialData = pieData.map(item => ({
      id: item.name,
      label: item.name,
      value: 0,
    }));
    setAnimatedPieData(initialData);

    // Transition to real values after 30ms
    const timer = setTimeout(() => {
      setAnimatedPieData(pieData.map(item => ({
        id: item.name,
        label: item.name,
        value: item.value,
      })));
    }, 30);

    return () => clearTimeout(timer);
  }, [pieData, activeTab]); // Added activeTab dependency

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
    .sort((a, b) => (b.budgeted + b.actual) - (a.budgeted + a.actual)) // Mayor a menor
    .slice(0, 5) // Solo top 5
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

  // Nivo theme matching design system
  const nivoTheme = {
    fontSize: 12,
    fontFamily: 'inherit',
    textColor: '#1a1a1a',
    tooltip: {
      container: {
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '12px',
      },
    },
  };

  // Chart components mapping (now with Nivo)
  const chartComponents: Record<string, React.ReactElement> = {
    pie: (
      <ChartCard key="pie" id="pie">
        <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
          <div className="p-6 border-b-2 border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Distribución de Gastos</h2>
            <p className="text-xs text-text-secondary mt-1">Top 10 categorías de gastos</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm">
            {animatedPieData.length > 0 ? (
              <div style={{ height: '420px' }}>
                <ResponsivePie
                  data={animatedPieData}
                  margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
                  startAngle={-104}
                  innerRadius={0.5}
                  padAngle={2}
                  cornerRadius={0}
                  activeOuterRadiusOffset={8}
                  colors={COLORS}
                  defs={[
                    { id: 'gradientGreen', type: 'radialGradient', colors: [{ offset: 0, color: '#6EE7B7' }, { offset: 100, color: '#10B981' }] },
                    { id: 'gradientRose', type: 'radialGradient', colors: [{ offset: 0, color: '#FDA4AF' }, { offset: 100, color: '#F43F5E' }] },
                    { id: 'gradientPink', type: 'radialGradient', colors: [{ offset: 0, color: '#F9A8D4' }, { offset: 100, color: '#EC4899' }] },
                    { id: 'gradientPurple', type: 'radialGradient', colors: [{ offset: 0, color: '#C4B5FD' }, { offset: 100, color: '#8B5CF6' }] },
                    { id: 'gradientBlue', type: 'radialGradient', colors: [{ offset: 0, color: '#93C5FD' }, { offset: 100, color: '#3B82F6' }] },
                    { id: 'gradientAmber', type: 'radialGradient', colors: [{ offset: 0, color: '#FCD34D' }, { offset: 100, color: '#F59E0B' }] },
                    { id: 'gradientCyan', type: 'radialGradient', colors: [{ offset: 0, color: '#67E8F9' }, { offset: 100, color: '#06B6D4' }] },
                    { id: 'gradientLime', type: 'radialGradient', colors: [{ offset: 0, color: '#BEF264' }, { offset: 100, color: '#84CC16' }] },
                  ]}
                  fill={[
                    { match: (d) => d.data.id === animatedPieData[0]?.id, id: 'gradientGreen' },
                    { match: (d) => d.data.id === animatedPieData[1]?.id, id: 'gradientRose' },
                    { match: (d) => d.data.id === animatedPieData[2]?.id, id: 'gradientPink' },
                    { match: (d) => d.data.id === animatedPieData[3]?.id, id: 'gradientPurple' },
                    { match: (d) => d.data.id === animatedPieData[4]?.id, id: 'gradientBlue' },
                    { match: (d) => d.data.id === animatedPieData[5]?.id, id: 'gradientAmber' },
                    { match: (d) => d.data.id === animatedPieData[6]?.id, id: 'gradientCyan' },
                    { match: (d) => d.data.id === animatedPieData[7]?.id, id: 'gradientLime' },
                  ]}
                  borderColor={{ from: 'color', modifiers: [['opacity', 0.3]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  arcLabel={(d) => `${((d.value / animatedPieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
                  theme={nivoTheme}
                  tooltip={({ datum }) => (
                    <div className="bg-white/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: datum.color }}
                        />
                        <span className="font-bold text-text-primary">{datum.label}</span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {formatAmount(datum.value)} ({((datum.value / animatedPieData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  )}
                  animate={true}
                  motionConfig="wobbly"
                  transitionMode="pushIn"
                  activeInnerRadiusOffset={8}
                />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    budgetVsReal: (
      <ChartCard key="budgetVsReal" id="budgetVsReal">
        <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
          <div className="p-6 border-b-2 border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Presupuesto vs Real</h2>
            <p className="text-xs text-text-secondary mt-1">Comparación por categoría</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm">
            {budgetVsRealData && budgetVsRealData.length > 0 ? (
              <div style={{ height: '400px' }}>
                <ResponsiveBar
                  data={budgetVsRealData}
                  keys={['Presupuesto', 'Real']}
                  indexBy="name"
                  margin={{ top: 20, right: 140, bottom: 50, left: 150 }}
                  padding={0.3}
                  groupMode="grouped"
                  layout="horizontal"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={['#06B6D4', '#EC4899']}
                  borderRadius={0}
                  defs={[
                    {
                      id: 'gradientPresupuestado',
                      type: 'linearGradient',
                      colors: [
                        { offset: 0, color: '#22D3EE' },
                        { offset: 100, color: '#0891B2' }
                      ],
                    },
                    {
                      id: 'gradientReal',
                      type: 'linearGradient',
                      colors: [
                        { offset: 0, color: '#F9A8D4' },
                        { offset: 100, color: '#EC4899' }
                      ],
                    },
                  ]}
                  fill={[
                    { match: { id: 'Presupuesto' }, id: 'gradientPresupuestado' },
                    { match: { id: 'Real' }, id: 'gradientReal' },
                  ]}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legendPosition: 'middle',
                    legendOffset: 40,
                    format: (value) => `${(value / 1000).toFixed(0)}k`,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legendPosition: 'middle',
                    legendOffset: -140,
                  }}
                  enableLabel={true}
                  label={(d) => `${((d.value || 0) / 1000).toFixed(1)}k`}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      effects: [{ on: 'hover', style: { itemOpacity: 1 } }],
                    },
                  ]}
                  theme={nivoTheme}
                  tooltip={({ id, value, indexValue }) => (
                    <div className="bg-white/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl">
                      <div className="font-bold text-text-primary mb-1">{indexValue}</div>
                      <div className="text-sm text-text-secondary">
                        {id}: {formatAmount(value)}
                      </div>
                    </div>
                  )}
                  animate={true}
                  motionConfig={{
                    mass: 1,
                    tension: 170,
                    friction: 26,
                    clamp: false,
                    precision: 0.01,
                    velocity: 0,
                  }}
                />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos de comparación
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    ),
    trends: (
      <ChartCard key="trends" id="trends">
        <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
          <div className="p-6 border-b-2 border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Tendencias por Ciclo</h2>
            <p className="text-xs text-text-secondary mt-1">Últimos 6 ciclos</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm">
            {lineData.length > 0 ? (
              <div style={{ height: '400px' }}>
                <ResponsiveLine
                  data={[
                    {
                      id: 'Ingresos',
                      color: '#10B981',
                      data: lineData.map(d => ({ x: d.name, y: d.Ingresos }))
                    },
                    {
                      id: 'Gastos',
                      color: '#F43F5E',
                      data: lineData.map(d => ({ x: d.name, y: d.Gastos }))
                    }
                  ]}
                  margin={{ top: 20, right: 140, bottom: 60, left: 70 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                  curve="catmullRom"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legendOffset: 50,
                    legendPosition: 'middle',
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legendOffset: -50,
                    legendPosition: 'middle',
                    format: (value) => `${(value / 1000).toFixed(0)}k`,
                  }}
                  colors={{ datum: 'color' }}
                  pointSize={8}
                  pointColor={{ from: 'color' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  enableArea={true}
                  areaOpacity={0.1}
                  legends={[
                    {
                      anchor: 'right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemDirection: 'left-to-right',
                      itemWidth: 100,
                      itemHeight: 20,
                      itemOpacity: 0.85,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      effects: [{ on: 'hover', style: { itemOpacity: 1 } }],
                    },
                  ]}
                  theme={nivoTheme}
                  tooltip={({ point }) => (
                    <div className="bg-white/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: point.color }}
                        />
                        <span className="font-bold text-text-primary">{point.serieId}</span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {point.data.x}: {formatAmount(Number(point.data.y))}
                      </div>
                    </div>
                  )}
                  animate={true}
                  motionConfig="gentle"
                />
              </div>
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
            <CycleInfo 
              cycleData={{
                cycle_name: cycleParams.cycleName,
                start_date: cycleParams.startDate,
                end_date: cycleParams.endDate
              }} 
              isLoading={rateLoadingState} 
            />
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
                      <TrendingUp className="w-5 h-5 text-primary" strokeWidth={2.5} />
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
            <>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* 1. Nivo Pie Chart */}
                {chartComponents['pie']}

                {/* 2. Nivo Bar Chart */}
                {chartComponents['budgetVsReal']}
              </div>

              {/* 3. Nivo Line Chart */}
              {chartComponents['trends']}

              {/* 4. Top 5 Categorías de Gasto */}
              <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
                <div className="p-6 border-b border-border/50 bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm">
                  <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    Top 5 Categorías de Gasto
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">Ranking visual de las categorías con mayor gasto</p>
                </div>
                <div className="p-6 bg-white/50 backdrop-blur-sm">
                  {topExpenses.length > 0 ? (
                    <div className="grid md:grid-cols-5 gap-4">
                      {topExpenses.map((cat, index) => (
                        <div 
                          key={cat.category_id}
                          className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-xl border border-border/30 p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                          style={{ 
                            borderTopColor: COLORS[index % COLORS.length],
                            borderTopWidth: '4px'
                          }}
                        >
                          <div className="text-center space-y-3">
                            <div className="flex items-center justify-center">
                              <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              >
                                #{index + 1}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary truncate">{cat.category_name}</p>
                              <p className="text-lg font-extrabold mt-1" style={{ color: COLORS[index % COLORS.length] }}>
                                {formatAmount(cat.total)}
                              </p>
                              <p className="text-[10px] text-text-secondary mt-1">
                                {cat.count} {cat.count === 1 ? 'transacción' : 'transacciones'}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-border/20">
                              <p className="text-xs text-text-secondary">
                                {((cat.total / topExpenses.reduce((sum, c) => sum + c.total, 0)) * 100).toFixed(1)}% del top 5
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-text-secondary">
                      No hay datos de categorías
                    </div>
                  )}
                </div>
              </div>
            </>
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

          {/* All Categories - Full width */}
          <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
            <div className="p-8 border-b border-border bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-xl font-extrabold text-text-primary">Todas las Categorías</h2>
              <p className="text-sm text-text-secondary mt-2">Detalle completo de cada categoría con actividad durante el ciclo</p>
            </div>
            <div className="p-8">
              {topCategories.length > 0 ? (
                <div className="space-y-6">
                  {/* Income Categories */}
                  {topCategories.filter(cat => cat.category_type === 'income').length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3 px-2">Ingresos</h3>
                      <div className="space-y-3">
                        {topCategories.filter(cat => cat.category_type === 'income').map((cat, index) => (
                          <div key={`category-${cat.category_id}-${index}`} className="border border-border rounded-2xl overflow-hidden">
                            {/* Category Header - Clickeable */}
                            <div 
                              className="flex items-center justify-between p-5 bg-surface-soft hover:bg-surface transition-colors cursor-pointer group"
                              onClick={() => setExpandedCategory(expandedCategory === cat.category_id ? null : cat.category_id)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                  <CategoryIcon iconName={cat.category_icon} size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary tracking-tight">{cat.category_name}</p>
                                  <p className="text-xs text-text-secondary mt-0.5">
                                    {cat.count} {cat.count === 1 ? 'transacción' : 'transacciones'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-extrabold text-emerald-600 text-lg">{formatAmount(cat.total)}</p>
                                {expandedCategory === cat.category_id ? (
                                  <EyeOff className="w-5 h-5 text-text-secondary group-hover:text-emerald-600 transition-colors" />
                                ) : (
                                  <Eye className="w-5 h-5 text-text-secondary group-hover:text-emerald-600 transition-colors" />
                                )}
                              </div>
                            </div>
                            
                            {/* Transactions List - Expandible */}
                            {expandedCategory === cat.category_id && (
                              <CategoryTransactionsList 
                                categoryId={cat.category_id}
                                startDate={cycleParams?.startDate}
                                endDate={cycleParams?.endDate}
                                displayCurrency={displayCurrency}
                                applyDemoScale={applyDemoScale}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expense Categories */}
                  {topCategories.filter(cat => cat.category_type === 'expense').length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-3 px-2">Gastos</h3>
                      <div className="space-y-3">
                        {topCategories.filter(cat => cat.category_type === 'expense').map((cat, index) => (
                          <div key={`category-${cat.category_id}-${index}`} className="border border-border rounded-2xl overflow-hidden">
                            {/* Category Header - Clickeable */}
                            <div 
                              className="flex items-center justify-between p-5 bg-surface-soft hover:bg-surface transition-colors cursor-pointer group"
                              onClick={() => setExpandedCategory(expandedCategory === cat.category_id ? null : cat.category_id)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                  <CategoryIcon iconName={cat.category_icon} size={24} className="text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary tracking-tight">{cat.category_name}</p>
                                  <p className="text-xs text-text-secondary mt-0.5">
                                    {cat.count} {cat.count === 1 ? 'transacción' : 'transacciones'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-extrabold text-orange-600 text-lg">{formatAmount(cat.total)}</p>
                                {expandedCategory === cat.category_id ? (
                                  <EyeOff className="w-5 h-5 text-text-secondary group-hover:text-orange-600 transition-colors" />
                                ) : (
                                  <Eye className="w-5 h-5 text-text-secondary group-hover:text-orange-600 transition-colors" />
                                )}
                              </div>
                            </div>
                            
                            {/* Transactions List - Expandible */}
                            {expandedCategory === cat.category_id && (
                              <CategoryTransactionsList 
                                categoryId={cat.category_id}
                                startDate={cycleParams?.startDate}
                                endDate={cycleParams?.endDate}
                                displayCurrency={displayCurrency}
                                applyDemoScale={applyDemoScale}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

// Component for displaying transactions of a category
interface CategoryTransactionsListProps {
  categoryId: number;
  startDate?: string;
  endDate?: string;
  displayCurrency: 'PEN' | 'USD';
  applyDemoScale: (amount: number) => number;
}

function CategoryTransactionsList({ categoryId, startDate, endDate, displayCurrency, applyDemoScale }: CategoryTransactionsListProps) {
  const { data: transactionsResponse, isLoading } = useTransactions({
    category_id: categoryId,
    start_date: startDate,
    end_date: endDate,
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-white border-t border-border">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-text-secondary">Cargando transacciones...</span>
        </div>
      </div>
    );
  }

  const transactions = transactionsResponse?.items || [];

  if (transactions.length === 0) {
    return (
      <div className="p-6 bg-white border-t border-border">
        <p className="text-sm text-text-secondary text-center">No hay transacciones</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-border">
      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-surface-soft transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm truncate">{tx.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-secondary">
                    {new Date(tx.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                  </span>
                  {tx.account_name && (
                    <span className="text-xs text-text-secondary">• {tx.account_name}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${
                  tx.type === 'income' ? 'text-emerald-600' : 'text-orange-600'
                }`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrencyISO(applyDemoScale(tx.amount), displayCurrency, { decimals: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
