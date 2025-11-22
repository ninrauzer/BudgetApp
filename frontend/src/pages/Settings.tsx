import { useState } from 'react';
import { Upload, Download, Database, FileText, Settings as SettingsIcon, Tag, Zap, Calendar, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import ImportExcelModal from '../components/ImportExcelModal';
import CategoryCRUD from '../components/CategoryCRUD';
import QuickTemplateCRUD from '../components/QuickTemplateCRUD';
import BillingCycleSettings from '../components/BillingCycleSettings';
import BillingCycleGrid from '../components/BillingCycleGrid';
import EditCycleModal from '../components/EditCycleModal';
import TimezoneSelector from '../components/TimezoneSelector';
import { useDefaultCurrency } from '../contexts/DefaultCurrencyContext';
import { useHiddenModules, AVAILABLE_MODULES } from '@/contexts/HiddenModulesContext';

type SettingsTab = 'general' | 'categories' | 'templates' | 'billing-cycle' | 'modules';

interface MonthCycleInfo {
  month: number;
  month_name: string;
  start_date: string;
  end_date: string;
  days: number;
  has_override: boolean;
  override_reason: string | null;
  is_current: boolean;
  is_past: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditCycleModalOpen, setIsEditCycleModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCycleInfo, setSelectedCycleInfo] = useState<MonthCycleInfo | null>(null);
  const { defaultCurrency, setDefaultCurrency } = useDefaultCurrency();
  const { toggleModule, isModuleHidden, resetModules } = useHiddenModules();

  const handleEditMonth = (month: number, year: number, cycleInfo: MonthCycleInfo) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedCycleInfo(cycleInfo);
    setIsEditCycleModalOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Configuración</h1>
        <p className="text-text-secondary">Gestiona tus preferencias y datos de la aplicación</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'general'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <SettingsIcon className="w-4 h-4" strokeWidth={2.5} />
            GENERAL
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'categories'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <Tag className="w-4 h-4" strokeWidth={2.5} />
            CATEGORÍAS
          </button>
          <button
            onClick={() => setActiveTab('billing-cycle')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'billing-cycle'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <Calendar className="w-4 h-4" strokeWidth={2.5} />
            CICLO
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'templates'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <Zap className="w-4 h-4" strokeWidth={2.5} />
            PLANTILLAS
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'modules'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" strokeWidth={2.5} />
            MÓDULOS
          </button>
        </div>
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <>
{/* Data Management Section */}
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-button">
            <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Gestión de Datos</h2>
            <p className="text-sm text-text-secondary">Importa y exporta tus transacciones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Import Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="group bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Importar desde Excel</h3>
                <p className="text-sm text-white/80">Carga transacciones masivamente desde un archivo .xlsm</p>
              </div>
            </div>
          </button>

          {/* Export Data */}
          <button
            className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                <Download className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Exportar Datos</h3>
                <p className="text-sm text-white/80">Descarga tus transacciones en formato Excel</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* General Settings Section */}
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-button">
            <SettingsIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Preferencias Generales</h2>
            <p className="text-sm text-text-secondary">Configura el comportamiento de la aplicación</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Currency Preference */}
          <div className="p-4 bg-surface-soft rounded-xl border border-border">
            <h3 className="font-bold text-text-primary mb-3">Moneda por defecto</h3>
            <p className="text-sm text-text-secondary mb-4">
              Esta moneda se usará por defecto al crear nuevas transacciones
            </p>
            <div className="inline-flex bg-surface border-2 border-border rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setDefaultCurrency('PEN')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  defaultCurrency === 'PEN'
                    ? 'bg-primary text-white shadow-button'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                S/ Soles
              </button>
              <button
                onClick={() => setDefaultCurrency('USD')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  defaultCurrency === 'USD'
                    ? 'bg-primary text-white shadow-button'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                $ Dólares
              </button>
            </div>
          </div>

          {/* Timezone Selector */}
          <TimezoneSelector />

          {/* Theme (placeholder) */}
          <div className="flex items-center justify-between p-4 bg-surface-soft rounded-xl border border-border">
            <div>
              <h3 className="font-bold text-text-primary">Tema de la aplicación</h3>
              <p className="text-sm text-text-secondary">Sistema (claro/oscuro automático)</p>
            </div>
            <span className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg font-bold text-sm">Sistema</span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-text-secondary" strokeWidth={2.5} />
          <h2 className="text-xl font-bold text-text-primary">Acerca de</h2>
        </div>
        <p className="text-text-secondary">
          <strong className="text-text-primary">BudgetApp</strong> - Gestión de finanzas personales
          <br />
          Versión 1.0.0
        </p>
      </div>
        </>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-button">
              <Tag className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Gestión de Categorías</h2>
              <p className="text-sm text-text-secondary">Crea, edita y elimina categorías personalizadas</p>
            </div>
          </div>

          <CategoryCRUD />
        </div>
      )}

      {/* BILLING CYCLE TAB */}
      {activeTab === 'billing-cycle' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-3xl p-8 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Ciclo de Facturación</h2>
                <p className="text-text-secondary mt-1">Administra tus ciclos de pago mensuales y ajustes personalizados</p>
              </div>
            </div>
          </div>

          {/* Current Cycle Info */}
          <BillingCycleSettings />

          {/* Annual Grid */}
          <BillingCycleGrid onEditMonth={handleEditMonth} />

          {/* Edit Cycle Modal */}
          <EditCycleModal
            isOpen={isEditCycleModalOpen}
            onClose={() => setIsEditCycleModalOpen(false)}
            month={selectedMonth}
            year={selectedYear}
            cycleInfo={selectedCycleInfo}
          />
        </div>
      )}

      {/* TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl shadow-button">
              <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Plantillas Rápidas</h2>
              <p className="text-sm text-text-secondary">Crea plantillas para transacciones frecuentes</p>
            </div>
          </div>

          <QuickTemplateCRUD />
        </div>
      )}

      {/* MODULES TAB */}
      {activeTab === 'modules' && (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-button">
              <LayoutDashboard className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-text-primary">Visibilidad de Módulos</h2>
              <p className="text-sm text-text-secondary">Personaliza qué módulos aparecen en el sidebar</p>
            </div>
            {AVAILABLE_MODULES.filter(m => m.canHide && isModuleHidden(m.id)).length > 0 && (
              <button
                onClick={resetModules}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                Mostrar Todos
              </button>
            )}
          </div>

          <div className="space-y-3">
            {AVAILABLE_MODULES.map((module) => {
              const hidden = isModuleHidden(module.id);
              const disabled = !module.canHide;

              return (
                <div
                  key={module.id}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    ${disabled 
                      ? 'bg-gray-50 border-gray-200 opacity-60' 
                      : hidden
                        ? 'bg-rose-50 border-rose-200 hover:border-rose-300'
                        : 'bg-white border-border hover:border-primary/30 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {hidden ? (
                      <EyeOff className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                    ) : (
                      <Eye className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                    )}
                    <div>
                      <p className={`font-bold text-sm ${disabled ? 'text-gray-500' : 'text-text-primary'}`}>
                        {module.name}
                      </p>
                      {disabled && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Este módulo no se puede ocultar
                        </p>
                      )}
                      {!disabled && hidden && (
                        <p className="text-xs text-rose-600 mt-0.5">
                          Oculto del sidebar
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleModule(module.id)}
                    disabled={disabled}
                    className={`
                      px-4 py-2 rounded-lg font-bold text-xs transition-all
                      ${disabled 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : hidden
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                          : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg hover:scale-105'
                      }
                    `}
                  >
                    {hidden ? 'Mostrar' : 'Ocultar'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info card */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1">Nota</h3>
                <p className="text-xs text-blue-700">
                  Los módulos ocultos no aparecerán en el sidebar, pero seguirán siendo accesibles mediante URL directa. 
                  Dashboard y Configuración no se pueden ocultar para mantener funcionalidad esencial.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
