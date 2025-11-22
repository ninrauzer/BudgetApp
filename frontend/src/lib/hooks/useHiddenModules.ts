import { useState, useEffect } from 'react';

const HIDDEN_MODULES_KEY = 'budgetapp_hidden_modules';

export interface ModuleConfig {
  id: string;
  name: string;
  canHide: boolean; // Dashboard y Settings no se pueden ocultar
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  { id: 'dashboard', name: 'Dashboard', canHide: false },
  { id: 'transactions', name: 'Transacciones', canHide: true },
  { id: 'budget', name: 'Presupuestos', canHide: true },
  { id: 'analysis', name: 'Análisis', canHide: true },
  { id: 'accounts', name: 'Cuentas', canHide: true },
  { id: 'debts', name: 'Préstamos', canHide: true },
  { id: 'credit-cards', name: 'Crédito', canHide: true },
  { id: 'ui-kit', name: 'UI Kit', canHide: true },
  { id: 'settings', name: 'Configuración', canHide: false },
];

export function useHiddenModules() {
  const [hiddenModules, setHiddenModules] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_MODULES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading hidden modules:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_MODULES_KEY, JSON.stringify(hiddenModules));
    } catch (error) {
      console.error('Error saving hidden modules:', error);
    }
  }, [hiddenModules]);

  const toggleModule = (moduleId: string) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (!module?.canHide) {
      console.warn(`Module ${moduleId} cannot be hidden`);
      return;
    }

    setHiddenModules(prev => {
      const newValue = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId];
      
      // Dispatch custom event to notify Sidebar
      window.dispatchEvent(new CustomEvent('hiddenModulesChanged', { detail: newValue }));
      return newValue;
    });
  };

  const isModuleHidden = (moduleId: string): boolean => {
    return hiddenModules.includes(moduleId);
  };

  const showModule = (moduleId: string) => {
    setHiddenModules(prev => prev.filter(id => id !== moduleId));
  };

  const hideModule = (moduleId: string) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (!module?.canHide) {
      console.warn(`Module ${moduleId} cannot be hidden`);
      return;
    }
    setHiddenModules(prev => [...prev.filter(id => id !== moduleId), moduleId]);
  };

  const resetModules = () => {
    setHiddenModules([]);
    // Dispatch custom event to notify Sidebar
    window.dispatchEvent(new CustomEvent('hiddenModulesChanged', { detail: [] }));
  };

  return {
    hiddenModules,
    toggleModule,
    isModuleHidden,
    showModule,
    hideModule,
    resetModules,
  };
}
