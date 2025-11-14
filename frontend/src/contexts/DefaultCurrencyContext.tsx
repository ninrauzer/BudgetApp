import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Currency = 'PEN' | 'USD';

interface DefaultCurrencyContextType {
  defaultCurrency: Currency;
  setDefaultCurrency: (currency: Currency) => void;
}

const DefaultCurrencyContext = createContext<DefaultCurrencyContextType | undefined>(undefined);

export function DefaultCurrencyProvider({ children }: { children: ReactNode }) {
  const [defaultCurrency, setDefaultCurrencyState] = useState<Currency>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('defaultCurrency') as Currency;
    return saved || 'PEN';
  });

  const setDefaultCurrency = (currency: Currency) => {
    setDefaultCurrencyState(currency);
    localStorage.setItem('defaultCurrency', currency);
  };

  return (
    <DefaultCurrencyContext.Provider value={{ defaultCurrency, setDefaultCurrency }}>
      {children}
    </DefaultCurrencyContext.Provider>
  );
}

export function useDefaultCurrency() {
  const context = useContext(DefaultCurrencyContext);
  if (context === undefined) {
    throw new Error('useDefaultCurrency must be used within a DefaultCurrencyProvider');
  }
  return context;
}
