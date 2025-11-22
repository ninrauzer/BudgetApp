// POC - Nivo Charts
// Este componente es una prueba de concepto y puede ser eliminado fácilmente
// sin afectar el código principal de Analysis.tsx

import { useState, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBump } from '@nivo/bump';
import { formatCurrencyISO } from '@/lib/format';

interface NivoPOCProps {
  pieData: Array<{ name: string; value: number }>;
  budgetComparisonData: {
    total_budgeted_income: number;
    total_budgeted_expense: number;
    total_actual_income: number;
    total_actual_expense: number;
  } | null;
  displayCurrency: 'PEN' | 'USD';
  // Nuevos datos para gráficos adicionales
  categoryData?: Array<{ 
    category_id: number;
    category_name: string;
    category_icon?: string;
    category_type: string;
    total: number;
    count: number;
  }>;
  trendsData?: Array<{
    cycle_name: string;
    start_date: string;
    end_date: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}

export default function NivoPOC({ pieData, budgetComparisonData, displayCurrency, categoryData = [], trendsData = [] }: NivoPOCProps) {
  const [animatedPieData, setAnimatedPieData] = useState<Array<{ id: string; label: string; value: number }>>([]);

  useEffect(() => {
    // Start with data at value 0, then transition to real values
    const initialData = pieData.map(item => ({
      id: item.name,
      label: item.name,
      value: 0,
    }));
    setAnimatedPieData(initialData);

    // After a brief delay, set real values to trigger animation
    const timer = setTimeout(() => {
      setAnimatedPieData(pieData.map(item => ({
        id: item.name,
        label: item.name,
        value: item.value,
      })));
    }, 100);

    return () => clearTimeout(timer);
  }, [pieData]);

  // Helper to format amounts
  const formatAmount = (amount: number) => formatCurrencyISO(amount, displayCurrency, { decimals: 2 });
  // Transform pie data for Nivo
  const nivoPieData = animatedPieData;

  // Transform budget comparison data for Nivo Bar Chart
  const nivoBarData = budgetComparisonData ? [
    {
      category: 'Ingresos',
      Presupuestado: budgetComparisonData.total_budgeted_income,
      Real: budgetComparisonData.total_actual_income,
    },
    {
      category: 'Gastos',
      Presupuestado: budgetComparisonData.total_budgeted_expense,
      Real: budgetComparisonData.total_actual_expense,
    },
  ] : [];

  // Custom theme matching your design system
  const theme = {
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

  // Colors matching your COLORS array
  const colors = [
    '#10B981', '#F43F5E', '#EC4899', '#8B5CF6', 
    '#3B82F6', '#F59E0B', '#06B6D4', '#84CC16'
  ];

  // Prepare data for Line Chart (Trends)
  const nivoLineData = trendsData.length > 0 ? [
    {
      id: 'Ingresos',
      color: '#10B981',
      data: trendsData.map(d => ({
        x: d.cycle_name,
        y: d.income
      }))
    },
    {
      id: 'Gastos',
      color: '#F43F5E',
      data: trendsData.map(d => ({
        x: d.cycle_name,
        y: d.expense
      }))
    }
  ] : [];

  // Prepare data for Bump Chart (Category Ranking)
  const topExpenses = categoryData
    .filter(c => c.category_type === 'expense')
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const nivoBumpData = topExpenses.map((cat, index) => ({
    id: cat.category_name,
    data: [
      { x: 'Ranking', y: index + 1 },
      { x: 'Monto', y: cat.total }
    ]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-md">
        <h2 className="text-2xl font-black mb-2">🚀 Prueba de Concepto - Nivo</h2>
        <p className="text-white/90 text-sm">
          Visualizaciones con animaciones fluidas y diseño moderno. Estos gráficos son independientes 
          y pueden ser removidos sin afectar la versión actual.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* 1. Nivo Pie Chart - Top Categories with Glass Design */}
        <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-rose-50/80 to-pink-50/80 backdrop-blur-sm">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-rose-600">Expenses</span> Distribution
            </h3>
            <p className="text-xs text-text-secondary mt-1">Visualización interactiva con Nivo + Glass Design</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm">
            {nivoPieData.length > 0 ? (
              <div style={{ height: '420px' }}>
                <ResponsivePie
                  data={nivoPieData}
                  margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
                  startAngle={-104}
                  innerRadius={0.5}
                  padAngle={2}
                  cornerRadius={0}
                  colors={colors}
                  defs={[
                    {
                      id: 'gradientGreen',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#6EE7B7' },
                        { offset: 100, color: '#10B981' },
                      ],
                    },
                    {
                      id: 'gradientRose',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#FDA4AF' },
                        { offset: 100, color: '#F43F5E' },
                      ],
                    },
                    {
                      id: 'gradientPink',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#F9A8D4' },
                        { offset: 100, color: '#EC4899' },
                      ],
                    },
                    {
                      id: 'gradientPurple',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#C4B5FD' },
                        { offset: 100, color: '#8B5CF6' },
                      ],
                    },
                    {
                      id: 'gradientBlue',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#93C5FD' },
                        { offset: 100, color: '#3B82F6' },
                      ],
                    },
                    {
                      id: 'gradientAmber',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#FCD34D' },
                        { offset: 100, color: '#F59E0B' },
                      ],
                    },
                    {
                      id: 'gradientCyan',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#67E8F9' },
                        { offset: 100, color: '#06B6D4' },
                      ],
                    },
                    {
                      id: 'gradientLime',
                      type: 'radialGradient',
                      colors: [
                        { offset: 0, color: '#BEF264' },
                        { offset: 100, color: '#84CC16' },
                      ],
                    },
                  ]}
                  fill={[
                    { match: (d) => d.data.id === nivoPieData[0]?.id, id: 'gradientGreen' },
                    { match: (d) => d.data.id === nivoPieData[1]?.id, id: 'gradientRose' },
                    { match: (d) => d.data.id === nivoPieData[2]?.id, id: 'gradientPink' },
                    { match: (d) => d.data.id === nivoPieData[3]?.id, id: 'gradientPurple' },
                    { match: (d) => d.data.id === nivoPieData[4]?.id, id: 'gradientBlue' },
                    { match: (d) => d.data.id === nivoPieData[5]?.id, id: 'gradientAmber' },
                    { match: (d) => d.data.id === nivoPieData[6]?.id, id: 'gradientCyan' },
                    { match: (d) => d.data.id === nivoPieData[7]?.id, id: 'gradientLime' },
                  ]}
                  borderColor={{ from: 'color', modifiers: [['opacity', 0.3]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  arcLabel={(d) => `${((d.value / nivoPieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
                  theme={theme}
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
                        {formatAmount(datum.value)} ({((datum.value / nivoPieData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
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

        {/* 2. Nivo Bar Chart - Budget vs Real with Glass Design */}
        <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 backdrop-blur-sm">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Presupuesto vs Real
            </h3>
            <p className="text-xs text-text-secondary mt-1">Comparación animada con Glass Design</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm">
            {nivoBarData.length > 0 ? (
              <div style={{ height: '420px' }}>
                <ResponsiveBar
                  data={nivoBarData}
                  keys={['Presupuestado', 'Real']}
                  indexBy="category"
                  margin={{ top: 20, right: 140, bottom: 60, left: 90 }}
                  padding={0.3}
                  innerPadding={2}
                  groupMode="grouped"
                  layout="vertical"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={({ id }) => {
                    return id === 'Presupuestado' ? '#06B6D4' : '#EC4899';
                  }}
                  borderRadius={0}
                  borderWidth={0}
                  defs={[
                    {
                      id: 'gradientPresupuestado',
                      type: 'linearGradient',
                      colors: [
                        { offset: 0, color: '#22D3EE' },
                        { offset: 100, color: '#0891B2' },
                      ],
                    },
                    {
                      id: 'gradientReal',
                      type: 'linearGradient',
                      colors: [
                        { offset: 0, color: '#F9A8D4' },
                        { offset: 100, color: '#EC4899' },
                      ],
                    },
                  ]}
                  fill={[
                    { match: { id: 'Presupuestado' }, id: 'gradientPresupuestado' },
                    { match: { id: 'Real' }, id: 'gradientReal' },
                  ]}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    tickRotation: 0,
                    legend: 'Categoría',
                    legendPosition: 'middle',
                    legendOffset: 45,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    tickRotation: 0,
                    legend: `Monto (${displayCurrency})`,
                    legendPosition: 'middle',
                    legendOffset: -70,
                    format: (value) => `${(value / 1000).toFixed(0)}k`,
                  }}
                  enableLabel={true}
                  label={(d) => `${((d.value || 0) / 1000).toFixed(1)}k`}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  theme={theme}
                  tooltip={({ id, value, indexValue }) => (
                    <div className="bg-white/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl">
                      <div className="font-bold text-text-primary mb-1">
                        {indexValue} - {id}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {formatAmount(value)}
                      </div>
                    </div>
                  )}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 6,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 16,
                      symbolShape: 'circle',
                      itemTextColor: '#666',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000'
                          }
                        }
                      ]
                    },
                  ]}
                  animate={true}
                  motionConfig={{
                    mass: 1,
                    tension: 170,
                    friction: 26,
                    clamp: false,
                    precision: 0.01,
                    velocity: 0
                  }}
                  role="application"
                  ariaLabel="Budget vs Real comparison bar chart"
                />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-secondary">
                No hay datos de presupuesto
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Nivo Line Chart - Tendencias de Ingresos vs Gastos */}
      <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
          <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Tendencias por Ciclo
          </h3>
          <p className="text-xs text-text-secondary mt-1">Evolución de Ingresos y Gastos en los últimos 6 ciclos</p>
        </div>
        <div className="p-6 bg-white/50 backdrop-blur-sm">
          {nivoLineData.length > 0 ? (
            <div style={{ height: '350px' }}>
              <ResponsiveLine
                data={nivoLineData}
                margin={{ top: 20, right: 120, bottom: 60, left: 70 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
                curve="catmullRom"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 8,
                  tickRotation: -45,
                  legend: 'Ciclo',
                  legendOffset: 50,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 8,
                  tickRotation: 0,
                  legend: `Monto (${displayCurrency})`,
                  legendOffset: -55,
                  legendPosition: 'middle',
                  format: (value) => `${(value / 1000).toFixed(0)}k`
                }}
                pointSize={8}
                pointColor={{ from: 'color' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor', modifiers: [] }}
                pointLabelYOffset={-12}
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
                theme={theme}
                colors={({ id }) => id === 'Ingresos' ? '#10B981' : '#F43F5E'}
                tooltip={({ point }) => (
                  <div className="bg-white/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: point.color }}
                      />
                      <span className="font-bold text-text-primary">{point.seriesId}</span>
                    </div>
                    <div className="text-xs text-text-secondary mb-1">{point.data.xFormatted}</div>
                    <div className="text-sm font-bold text-text-primary">
                      {formatAmount(Number(point.data.y))}
                    </div>
                  </div>
                )}
                legends={[
                  {
                    anchor: 'right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 6,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 16,
                    symbolShape: 'circle',
                    itemTextColor: '#666',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemTextColor: '#000'
                        }
                      }
                    ]
                  }
                ]}
                animate={true}
                motionConfig="gentle"
              />
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-text-secondary">
              No hay datos de tendencias
            </div>
          )}
        </div>
      </div>

      {/* 4. Nivo Bump Chart - Ranking de Categorías */}
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
                    borderTopColor: colors[index % colors.length],
                    borderTopWidth: '4px'
                  }}
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      >
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary truncate">{cat.category_name}</p>
                      <p className="text-lg font-extrabold mt-1" style={{ color: colors[index % colors.length] }}>
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

      {/* Features Comparison */}
      <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
        <h3 className="text-lg font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Características de Nivo vs Recharts
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-600 flex items-center gap-2">
              <span>✅</span> Ventajas de Nivo
            </h4>
            <ul className="space-y-1 text-text-secondary ml-6 bg-emerald-50/50 backdrop-blur-sm rounded-lg p-3 border border-emerald-100/50">
              <li>• Animaciones fluidas y suaves</li>
              <li>• Diseño moderno por defecto</li>
              <li>• Interactividad superior</li>
              <li>• Efectos glass y visuales avanzados</li>
              <li>• Tooltips altamente personalizables</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-amber-600 flex items-center gap-2">
              <span>⚠️</span> Consideraciones
            </h4>
            <ul className="space-y-1 text-text-secondary ml-6 bg-amber-50/50 backdrop-blur-sm rounded-lg p-3 border border-amber-100/50">
              <li>• Bundle +150KB (~600KB total)</li>
              <li>• API más compleja</li>
              <li>• Migración requiere tiempo</li>
              <li>• Curva de aprendizaje mayor</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Removal Instructions */}
      <div className="bg-purple-50/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-sm font-extrabold text-purple-900 mb-2 flex items-center gap-2">
          <span>🗑️</span> Instrucciones de Eliminación
        </h3>
        <p className="text-xs text-purple-800 mb-3">
          Si decides no usar Nivo, elimina fácilmente sin afectar el código actual:
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 font-mono text-xs space-y-2 text-purple-900 shadow-inner border border-purple-100/50">
          <div>1. Eliminar archivo: <code className="bg-purple-100/70 px-2 py-1 rounded">frontend/src/components/NivoPOC.tsx</code></div>
          <div>2. En <code className="bg-purple-100/70 px-2 py-1 rounded">Analysis.tsx</code>: Remover import y tab "POC - Nivo"</div>
          <div>3. Desinstalar: <code className="bg-purple-100/70 px-2 py-1 rounded">npm uninstall @nivo/core @nivo/pie @nivo/bar</code></div>
        </div>
      </div>
    </div>
  );
}
