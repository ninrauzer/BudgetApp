/**
 * UI Kit Showcase
 * 
 * Página completa que muestra todos los componentes, estilos, colores y patrones
 * utilizados en BudgetApp. Útil para referencia de diseño y desarrollo.
 * 
 * Se puede activar/desactivar desde Settings.
 */

import { useState } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Check,
  Copy,
  Home,
  ShoppingCart,
  Utensils,
  Zap,
  PiggyBank,
  CreditCard,
  Wallet,
  Target,
  Activity,
  Bell,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { SectionHeader } from '@/components/ui/section-header';

export default function UIKit() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full space-y-12 py-8">
      {/* Header */}
      <div className="px-8">
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
          UI Kit - BudgetApp
        </h1>
        <p className="text-lg text-text-secondary mt-2">
          Catálogo completo de componentes, estilos y patrones de diseño utilizados en la aplicación.
        </p>
      </div>

      {/* ============ TYPOGRAPHY ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Tipografía"
          subtitle="Sistema de tipografía y escalas de texto"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {/* Headings */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                  Headings
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-black text-text-primary tracking-tight">
                      Heading 1 - text-4xl font-black
                    </p>
                    <code className="text-xs text-text-secondary">text-4xl font-black tracking-tight</code>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-text-primary tracking-tight">
                      Heading 2 - text-3xl font-extrabold
                    </p>
                    <code className="text-xs text-text-secondary">text-3xl font-extrabold tracking-tight</code>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-text-primary">
                      Heading 3 - text-2xl font-extrabold
                    </p>
                    <code className="text-xs text-text-secondary">text-2xl font-extrabold</code>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-text-primary">
                      Heading 4 - text-xl font-bold
                    </p>
                    <code className="text-xs text-text-secondary">text-xl font-bold</code>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                  Body Text
                </p>
                <div className="space-y-2">
                  <p className="text-base text-text-primary">
                    Body Regular - text-base (16px)
                  </p>
                  <p className="text-sm text-text-secondary">
                    Body Secondary - text-sm (14px)
                  </p>
                  <p className="text-xs text-text-muted">
                    Body Small - text-xs (12px)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ COLORS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Sistema de Colores"
          subtitle="Paleta semántica utilizada en componentes"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Semantic Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colores Semánticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500"></div>
                <div>
                  <p className="font-semibold text-text-primary">Ingresos (Income)</p>
                  <code className="text-xs text-text-secondary">from-emerald-400 to-emerald-500</code>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500"></div>
                <div>
                  <p className="font-semibold text-text-primary">Gastos (Expense)</p>
                  <code className="text-xs text-text-secondary">from-rose-400 to-rose-500</code>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500"></div>
                <div>
                  <p className="font-semibold text-text-primary">Saldo Positivo</p>
                  <code className="text-xs text-text-secondary">from-amber-400 to-orange-500</code>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600"></div>
                <div>
                  <p className="font-semibold text-text-primary">Saldo Negativo</p>
                  <code className="text-xs text-text-secondary">from-red-500 to-red-600</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colores Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-500"></div>
                <div>
                  <p className="font-semibold text-text-primary">Positivo/Balance</p>
                  <code className="text-xs text-text-secondary">from-cyan-400 to-cyan-500</code>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500"></div>
                <div>
                  <p className="font-semibold text-text-primary">Acción/Premium</p>
                  <code className="text-xs text-text-secondary">from-purple-400 to-purple-500</code>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500"></div>
                <div>
                  <p className="font-semibold text-text-primary">Info/Datos</p>
                  <code className="text-xs text-text-secondary">from-blue-400 to-blue-500</code>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface border-2 border-border"></div>
                <div>
                  <p className="font-semibold text-text-primary">Neutral/Fondo</p>
                  <code className="text-xs text-text-secondary">bg-surface</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============ BUTTONS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Botones"
          subtitle="Variantes y tamaños de botones"
        />

        <Card>
          <CardContent className="pt-6 space-y-8">
            {/* Variants */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Variantes
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">
                  <Plus className="w-4 h-4" />
                  Primary
                </Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Tamaños
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Estados
              </p>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Outline Disabled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ BADGES ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Badges"
          subtitle="Etiquetas y estados"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ STAT CARDS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Stat Cards"
          subtitle="Tarjetas de métricas con glass morphism"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            variant="success"
            icon={TrendingUp}
            label="Ingresos"
            value="45,500"
            currency="PEN"
            subtitle="Este mes"
          />
          <StatCard
            variant="danger"
            icon={TrendingDown}
            label="Gastos"
            value="32,200"
            currency="PEN"
            subtitle="Este mes"
          />
          <StatCard
            variant="warning"
            icon={PiggyBank}
            label="Saldo"
            value="13,300"
            currency="PEN"
            subtitle="Disponible"
          />
        </div>
      </section>

      {/* ============ CARDS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Cards"
          subtitle="Contenedores principales"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Estándar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Este es un contenedor estándar con header, titulo y contenido.
              </p>
            </CardContent>
          </Card>

          {/* Glass Card */}
          <div className="relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-white/80" strokeWidth={2} />
            </div>
            <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">
              Glass Card
            </p>
            <p className="text-3xl font-black text-white tracking-tight mb-1">
              S/ 50,000
            </p>
            <p className="text-white/60 text-sm">
              Tarjeta con efecto glass morphism
            </p>
          </div>
        </div>
      </section>

      {/* ============ GRID LAYOUTS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Grid Layouts"
          subtitle="Patrones responsive de maquetación"
        />

        <Card>
          <CardContent className="pt-6 space-y-8">
            {/* 1x3 Grid */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Grid 1 → 3 (md: grid-cols-1 md:grid-cols-3)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border-2 border-border rounded-xl p-4 h-24"></div>
                <div className="bg-surface border-2 border-border rounded-xl p-4 h-24"></div>
                <div className="bg-surface border-2 border-border rounded-xl p-4 h-24"></div>
              </div>
            </div>

            {/* 1x2 Grid */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Grid 1 → 2 (md: grid-cols-1 md:grid-cols-2)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border-2 border-border rounded-xl p-4 h-24"></div>
                <div className="bg-surface border-2 border-border rounded-xl p-4 h-24"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ SPACING ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Espaciado"
          subtitle="Sistema de espaciado vertical (space-y) y gaps"
        />

        <Card>
          <CardContent className="pt-6 space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Espaciado Vertical (space-y)
              </p>
              <div className="space-y-1 text-sm text-text-secondary">
                <div className="font-semibold">space-y-6: 24px (1.5rem)</div>
                <p>Espaciado estándar entre secciones</p>
              </div>
              <div className="space-y-1 text-sm text-text-secondary mt-4">
                <div className="font-semibold">space-y-8: 32px (2rem)</div>
                <p>Espaciado grande entre secciones mayores (usado en Dashboard)</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Espaciado de Grids (gap)
              </p>
              <div className="space-y-1 text-sm text-text-secondary">
                <div className="font-semibold">gap-2: 8px (0.5rem)</div>
                <p>Espaciado comprimido (tabs, botones seguidos)</p>
              </div>
              <div className="space-y-1 text-sm text-text-secondary mt-4">
                <div className="font-semibold">gap-6: 24px (1.5rem)</div>
                <p>Espaciado estándar en grids de contenido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ BORDER RADIUS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Border Radius"
          subtitle="Valores de esquinas redondeadas"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg"></div>
                <p className="text-xs text-text-secondary font-semibold">rounded-lg (8px)</p>
                <p className="text-xs text-text-secondary">Botones pequeños</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl"></div>
                <p className="text-xs text-text-secondary font-semibold">rounded-xl (12px)</p>
                <p className="text-xs text-text-secondary">Cards pequeñas</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl"></div>
                <p className="text-xs text-text-secondary font-semibold">rounded-2xl (16px)</p>
                <p className="text-xs text-text-secondary">Cards principales</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full"></div>
                <p className="text-xs text-text-secondary font-semibold">rounded-full (50%)</p>
                <p className="text-xs text-text-secondary">Avatares, badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ SHADOWS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Sombras"
          subtitle="Efectos de elevación"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="w-full h-20 bg-white rounded-xl shadow-sm border border-border"></div>
                <p className="text-xs text-text-secondary font-semibold">shadow-sm</p>
                <p className="text-xs text-text-muted">Sombra sutil</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 bg-white rounded-xl shadow-card border border-border"></div>
                <p className="text-xs text-text-secondary font-semibold">shadow-card</p>
                <p className="text-xs text-text-muted">Sombra estándar</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 bg-white rounded-xl shadow-lg border border-border"></div>
                <p className="text-xs text-text-secondary font-semibold">shadow-lg</p>
                <p className="text-xs text-text-muted">Sombra elevada</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 bg-white rounded-xl shadow-xl border border-border"></div>
                <p className="text-xs text-text-secondary font-semibold">shadow-xl</p>
                <p className="text-xs text-text-muted">Sombra hover</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ ICONS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Iconografía"
          subtitle="Lucide React - Todos los íconos de la aplicación"
        />

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Íconos Disponibles (Lucide React)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                {[
                  { icon: Home, label: 'Home' },
                  { icon: ShoppingCart, label: 'Cart' },
                  { icon: Utensils, label: 'Utensils' },
                  { icon: Zap, label: 'Zap' },
                  { icon: PiggyBank, label: 'Piggy' },
                  { icon: CreditCard, label: 'CC' },
                  { icon: Wallet, label: 'Wallet' },
                  { icon: Target, label: 'Target' },
                  { icon: TrendingUp, label: 'Up' },
                  { icon: TrendingDown, label: 'Down' },
                  { icon: Plus, label: 'Plus' },
                  { icon: AlertCircle, label: 'Alert' },
                  { icon: Check, label: 'Check' },
                  { icon: Activity, label: 'Activity' },
                  { icon: Bell, label: 'Bell' },
                  { icon: Settings, label: 'Settings' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-lg bg-surface border-2 border-border">
                      <item.icon className="w-5 h-5 text-text-primary" strokeWidth={2.5} />
                    </div>
                    <p className="text-xs text-text-secondary">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">
                Tamaños de Íconos
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-4 h-4 text-text-primary" strokeWidth={2.5} />
                  <p className="text-xs text-text-secondary">w-4 h-4 (16px)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-5 h-5 text-text-primary" strokeWidth={2.5} />
                  <p className="text-xs text-text-secondary">w-5 h-5 (20px)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-6 h-6 text-text-primary" strokeWidth={2.5} />
                  <p className="text-xs text-text-secondary">w-6 h-6 (24px)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8 text-text-primary" strokeWidth={2} />
                  <p className="text-xs text-text-secondary">w-8 h-8 (32px)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ GLASS MORPHISM EXAMPLES ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Glass Morphism"
          subtitle="Efecto premium con backdrop-blur y gradientes"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Emerald */}
          <div className="relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <TrendingUp className="w-8 h-8 text-white/80 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">
              Ingresos
            </p>
            <p className="text-3xl font-black text-white tracking-tight mb-1">
              S/ 45,500
            </p>
            <p className="text-white/60 text-xs">
              ~S/ 3,791/mes
            </p>
          </div>

          {/* Rose */}
          <div className="relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-rose-400/90 to-rose-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <TrendingDown className="w-8 h-8 text-white/80 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">
              Gastos
            </p>
            <p className="text-3xl font-black text-white tracking-tight mb-1">
              S/ 32,200
            </p>
            <p className="text-white/60 text-xs">
              ~S/ 2,683/mes
            </p>
          </div>

          {/* Amber with Glow */}
          <div className="relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-amber-400/90 to-orange-500/90 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <DollarSign className="w-8 h-8 text-white/80 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">
              Saldo
            </p>
            <p className="text-3xl font-black text-white tracking-tight mb-1">
              S/ 13,300
            </p>
            <p className="text-white/60 text-xs">
              Disponible
            </p>
          </div>
        </div>
      </section>

      {/* ============ TAB NAVIGATION ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Tab Navigation"
          subtitle="Patrón de navegación por tabs"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-2 shadow-sm w-fit">
                <div className="flex gap-2">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all bg-primary text-white shadow-button">
                    <Activity className="w-4 h-4" strokeWidth={2.5} />
                    ACTIVO
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all text-text-secondary hover:text-text-primary hover:bg-surface-soft">
                    <Settings className="w-4 h-4" strokeWidth={2.5} />
                    INACTIVO
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all text-text-secondary hover:text-text-primary hover:bg-surface-soft">
                    <Bell className="w-4 h-4" strokeWidth={2.5} />
                    OTRO
                  </button>
                </div>
              </div>

              <div className="text-xs text-text-secondary space-y-1 mt-4">
                <code className="block">{'<div className="bg-surface border border-border rounded-2xl p-2 shadow-sm">'}</code>
                <code className="block ml-4">{'<div className="flex gap-2">'}</code>
                <code className="block ml-8">{'<button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isActive ? \'bg-primary text-white shadow-button\' : \'text-text-secondary hover:text-text-primary hover:bg-surface-soft\'}">'}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ FORM INPUTS ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Form Inputs"
          subtitle="Componentes de entrada de datos"
        />

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Input de Texto
              </label>
              <input
                type="text"
                placeholder="Escribe algo..."
                className="w-full px-4 py-2 rounded-lg border-2 border-border bg-white text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Input Disabled
              </label>
              <input
                type="text"
                placeholder="Deshabilitado"
                disabled
                className="w-full px-4 py-2 rounded-lg border-2 border-border bg-surface text-text-muted placeholder-text-muted opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Input de Cantidad
                </label>
                <input
                  type="number"
                  placeholder="1,000"
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-white text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Selector de Fecha
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-white text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============ RESPONSIVE EXAMPLE ============ */}
      <section className="px-8 space-y-6">
        <SectionHeader
          title="Ejemplo Responsive"
          subtitle="Layout que se adapta de mobile a desktop"
        />

        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Grid que cambia de 1 columna (mobile) a 3 columnas (desktop):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 text-center">
              <p className="font-semibold text-text-primary">Mobile</p>
              <p className="text-xs text-text-secondary">1 columna</p>
              <p className="text-2xl font-black text-emerald-600 mt-2">100%</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 text-center">
              <p className="font-semibold text-text-primary">Tablet</p>
              <p className="text-xs text-text-secondary">2 columnas</p>
              <p className="text-2xl font-black text-blue-600 mt-2">50%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 text-center">
              <p className="font-semibold text-text-primary">Desktop</p>
              <p className="text-xs text-text-secondary">3 columnas</p>
              <p className="text-2xl font-black text-purple-600 mt-2">33.33%</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ UTILITIES ============ */}
      <section className="px-8 space-y-6 pb-8">
        <SectionHeader
          title="Utilidades"
          subtitle="Clases de utilidad frecuentes"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-text-primary mb-2">Flexbox Centering</p>
                <code className="text-xs bg-surface p-2 rounded-lg block text-text-secondary">
                  flex items-center justify-center gap-2
                </code>
              </div>

              <div>
                <p className="font-semibold text-text-primary mb-2">Full Width + Spacing</p>
                <code className="text-xs bg-surface p-2 rounded-lg block text-text-secondary">
                  w-full space-y-6
                </code>
              </div>

              <div>
                <p className="font-semibold text-text-primary mb-2">Text Truncate</p>
                <code className="text-xs bg-surface p-2 rounded-lg block text-text-secondary">
                  truncate text-ellipsis overflow-hidden
                </code>
              </div>

              <div>
                <p className="font-semibold text-text-primary mb-2">Transition Smooth</p>
                <code className="text-xs bg-surface p-2 rounded-lg block text-text-secondary">
                  transition-all duration-200
                </code>
              </div>

              <div>
                <p className="font-semibold text-text-primary mb-2">Opacity Hover</p>
                <code className="text-xs bg-surface p-2 rounded-lg block text-text-secondary">
                  hover:opacity-80 opacity-100 transition-opacity
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
