"""Script to create the new Settings.tsx with tabs"""
settings_content = r'''import { useState } from 'react';
import { Upload, Download, Database, FileText, Settings as SettingsIcon, Wallet, Tag, X, Zap, Calendar, Eye, EyeOff } from 'lucide-react';
import ImportExcelModal from '../components/ImportExcelModal';
import CategoryCRUD from '../components/CategoryCRUD';
import QuickTemplateCRUD from '../components/QuickTemplateCRUD';
import BillingCycleSettings from '../components/BillingCycleSettings';
import CategoryIcon from '../components/CategoryIcon';
import { useAccounts } from '../lib/hooks/useApi';
import { useDefaultAccount } from '../contexts/DefaultAccountContext';
import { useDefaultCurrency } from '../contexts/DefaultCurrencyContext';
import { useDemoMode } from '../lib/hooks/useDemoMode';

type SettingsTab = 'general' | 'categories' | 'templates';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { data: accounts = [] } = useAccounts();
  const { defaultAccountId, setDefaultAccountId } = useDefaultAccount();
  const { defaultCurrency, setDefaultCurrency } = useDefaultCurrency();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

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
'''

import os

# Read original file to get GENERAL tab content
with open(r"E:\Desarrollo\BudgetApp\frontend\src\pages\Settings_backup.tsx", 'r', encoding='utf-8') as f:
    original = f.read()

# Find where the sections start
data_mgmt_start = original.find("      {/* Data Management Section */}")
about_end = original.find("      {/* Import Excel Modal */}")

# Extract the GENERAL tab content
general_content = original[data_mgmt_start:about_end].strip()

# Insert GENERAL tab content into new structure
insert_point = settings_content.find("      {/* CATEGORIES TAB */}")
final_content = settings_content[:insert_point] + f"      {{/* GENERAL TAB */}}\n      {{activeTab === 'general' && (\n        <>\n{general_content}\n        </>\n      )}}\n\n" + settings_content[insert_point:]

# Write new file
with open(r"E:\Desarrollo\BudgetApp\frontend\src\pages\Settings.tsx", 'w', encoding='utf-8') as f:
    f.write(final_content)

print("✓ Settings.tsx updated successfully with tabs!")
