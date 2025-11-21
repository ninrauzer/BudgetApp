import { useState } from 'react';
import { Upload, Download, Database, FileText, Settings as SettingsIcon, Wallet, Tag, X, Zap, Calendar } from 'lucide-react';
import ImportExcelModal from '../components/ImportExcelModal';
import CategoryCRUD from '../components/CategoryCRUD';
import QuickTemplateCRUD from '../components/QuickTemplateCRUD';
import BillingCycleSettings from '../components/BillingCycleSettings';
import TimezoneSelector from '../components/TimezoneSelector';
import CategoryIcon from '../components/CategoryIcon';
import { useAccounts } from '@/lib/hooks/useApi';
import { useDefaultAccount } from '../contexts/DefaultAccountContext';
import { useDefaultCurrency } from '../contexts/DefaultCurrencyContext';

type SettingsTab = 'general' | 'categories' | 'templates';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { data: accounts = [] } = useAccounts();
  const { defaultAccountId, setDefaultAccountId } = useDefaultAccount();
  const { defaultCurrency, setDefaultCurrency } = useDefaultCurrency();

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
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'templates'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <Zap className="w-4 h-4" strokeWidth={2.5} />
            PLANTILLAS RÁPIDAS
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
          {/* Default Account */}
          <div className="p-4 bg-surface-soft rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-5 h-5 text-primary" strokeWidth={2.5} />
              <h3 className="font-bold text-text-primary">Cuenta por defecto</h3>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Esta cuenta se usará automáticamente al crear nuevas transacciones
            </p>
            
            {/* Account Toggle Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* No default option */}
              <button
                onClick={() => setDefaultAccountId(null)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  defaultAccountId === null
                    ? 'bg-primary/10 border-primary shadow-sm'
                    : 'bg-surface border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    defaultAccountId === null ? 'bg-primary/20' : 'bg-surface-soft'
                  }`}>
                    <X className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text-primary text-sm truncate">
                      Sin cuenta
                    </div>
                    <div className="text-xs text-text-secondary">
                      Manual
                    </div>
                  </div>
                  {defaultAccountId === null && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Account options */}
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setDefaultAccountId(account.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    defaultAccountId === account.id
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-surface border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      defaultAccountId === account.id ? 'bg-primary/20' : 'bg-surface-soft'
                    }`}>
                      <CategoryIcon iconName={account.icon || 'wallet'} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-text-primary text-sm truncate">
                        {account.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {account.type}
                      </div>
                    </div>
                    {defaultAccountId === account.id && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

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

      {/* Billing Cycle Section */}
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-button">
            <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Ciclo de Facturación</h2>
            <p className="text-sm text-text-secondary">Configura el inicio de tu ciclo de pagos personalizado</p>
          </div>
        </div>

        <BillingCycleSettings />
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
