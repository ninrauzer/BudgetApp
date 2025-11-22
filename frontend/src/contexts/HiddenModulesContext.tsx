import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const HIDDEN_MODULES_KEY = 'budgetapp_hidden_modules';

export interface ModuleConfig {
  id: string;
  name: string;
  canHide: boolean;
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

interface HiddenModulesContextType {
  hiddenModules: string[];
  toggleModule: (moduleId: string) => void;
  isModuleHidden: (moduleId: string) => boolean;
  showModule: (moduleId: string) => void;
  hideModule: (moduleId: string) => void;
  resetModules: () => void;
}

const HiddenModulesContext = createContext<HiddenModulesContextType | undefined>(undefined);

export function HiddenModulesProvider({ children }: { children: ReactNode }) {
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
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
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
  };

  return (
    <HiddenModulesContext.Provider
      value={{
        hiddenModules,
        toggleModule,
        isModuleHidden,
        showModule,
        hideModule,
        resetModules,
      }}
    >
      {children}
    </HiddenModulesContext.Provider>
  );
}

export function useHiddenModules() {
  const context = useContext(HiddenModulesContext);
  if (context === undefined) {
    throw new Error('useHiddenModules must be used within a HiddenModulesProvider');
  }
  return context;
}
