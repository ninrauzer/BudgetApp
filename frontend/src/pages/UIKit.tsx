import { Plus, TrendingUp, TrendingDown, DollarSign, Home, ShoppingCart, Utensils, Zap, PiggyBank, CreditCard, Wallet, Target, Activity, Bell, Settings, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';

export default function UIKit() {
  return (
    <div className="w-full space-y-12 py-8">
      <div className="px-8">
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">UI Kit</h1>
        <p className="text-lg text-text-secondary mt-2">Catálogo de componentes, estilos y patrones</p>
      </div>

      {/* TYPOGRAPHY */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Tipografía</h2>
          <p className="text-sm text-text-secondary">Sistema de tipografía</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-4xl font-black">Heading 1 - text-4xl</p>
            <p className="text-3xl font-extrabold">Heading 2 - text-3xl</p>
            <p className="text-base">Body - text-base</p>
            <p className="text-sm text-text-secondary">Secondary - text-sm</p>
          </CardContent>
        </Card>
      </section>

      {/* COLORES */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Colores</h2>
          <p className="text-sm text-text-secondary">Paleta semántica</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="w-full h-24 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center"><p className="text-white font-bold text-sm">Ingresos</p></div>
          <div className="w-full h-24 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center"><p className="text-white font-bold text-sm">Gastos</p></div>
          <div className="w-full h-24 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"><p className="text-white font-bold text-sm">Positivo</p></div>
          <div className="w-full h-24 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"><p className="text-white font-bold text-sm">Negativo</p></div>
        </div>
      </section>

      {/* BUTTONS */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Botones</h2>
          <p className="text-sm text-text-secondary">Variantes y tamaños con efecto premium</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Variantes */}
            <div>
              <p className="text-sm font-bold text-text-primary mb-3">Variantes</p>
              <div className="flex flex-wrap gap-3">
                <Button><Plus className="w-4 h-4" />Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Tamaños */}
            <div>
              <p className="text-sm font-bold text-text-primary mb-3">Tamaños</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Plus className="w-5 h-5" /></Button>
              </div>
            </div>

            {/* Estados */}
            <div>
              <p className="text-sm font-bold text-text-primary mb-3">Estados</p>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Deshabilitado</Button>
                <Button size="lg"><Plus className="w-5 h-5" />Con Icon</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* BADGES */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Badges</h2>
          <p className="text-sm text-text-secondary">Etiquetas</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* STAT CARDS */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Stat Cards</h2>
          <p className="text-sm text-text-secondary">Tarjetas con glass morphism</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard variant="success" icon={TrendingUp} label="Ingresos" value="45,500" currency="PEN" subtitle="Este mes" />
          <StatCard variant="danger" icon={TrendingDown} label="Gastos" value="32,200" currency="PEN" subtitle="Este mes" />
          <StatCard variant="warning" icon={PiggyBank} label="Saldo" value="13,300" currency="PEN" subtitle="Disponible" />
        </div>
      </section>

      {/* CARDS */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Cards</h2>
          <p className="text-sm text-text-secondary">Contenedores</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Card Estándar</CardTitle></CardHeader>
            <CardContent><p className="text-text-secondary">Contenedor con header y contenido</p></CardContent>
          </Card>
          <div className="rounded-2xl p-6 text-white backdrop-blur-md bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 shadow-lg">
            <DollarSign className="w-8 h-8 text-white/80 mb-3" />
            <p className="text-white/70 text-xs uppercase">Glass Card</p>
            <p className="text-3xl font-black">S/ 50,000</p>
          </div>
        </div>
      </section>

      {/* GRIDS */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Grids</h2>
          <p className="text-sm text-text-secondary">Layouts responsive</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border-2 border-border rounded-xl h-24"></div>
          <div className="bg-surface border-2 border-border rounded-xl h-24"></div>
          <div className="bg-surface border-2 border-border rounded-xl h-24"></div>
        </div>
      </section>

      {/* ICONS */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Iconos</h2>
          <p className="text-sm text-text-secondary">Lucide React</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {[Home, ShoppingCart, Utensils, Zap, PiggyBank, CreditCard, Wallet, Target, TrendingUp, TrendingDown, Plus, AlertCircle, Check, Activity, Bell, Settings].map((Icon, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <Icon className="w-5 h-5 text-text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* GLASS MORPHISM */}
      <section className="px-8 space-y-6 pb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">Glass Morphism</h2>
          <p className="text-sm text-text-secondary">Efecto premium</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 text-white backdrop-blur-md bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 shadow-lg">
            <TrendingUp className="w-8 h-8 mb-3" />
            <p className="text-white/70 text-xs uppercase mb-2">Ingresos</p>
            <p className="text-3xl font-black mb-1">S/ 45,500</p>
          </div>
          <div className="rounded-2xl p-6 text-white backdrop-blur-md bg-gradient-to-br from-rose-400/90 to-rose-500/90 shadow-lg">
            <TrendingDown className="w-8 h-8 mb-3" />
            <p className="text-white/70 text-xs uppercase mb-2">Gastos</p>
            <p className="text-3xl font-black mb-1">S/ 32,200</p>
          </div>
          <div className="rounded-2xl p-6 text-white backdrop-blur-md bg-gradient-to-br from-amber-400/90 to-orange-500/90 shadow-lg shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <DollarSign className="w-8 h-8 mb-3" />
            <p className="text-white/70 text-xs uppercase mb-2">Saldo</p>
            <p className="text-3xl font-black mb-1">S/ 13,300</p>
          </div>
        </div>
      </section>
    </div>
  );
}
