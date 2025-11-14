import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DefaultAccountContextType {
  defaultAccountId: number | null;
  setDefaultAccountId: (id: number | null) => void;
}

const DefaultAccountContext = createContext<DefaultAccountContextType | undefined>(undefined);

export function DefaultAccountProvider({ children }: { children: ReactNode }) {
  const [defaultAccountId, setDefaultAccountIdState] = useState<number | null>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('defaultAccountId');
    return saved ? parseInt(saved, 10) : null;
  });

  const setDefaultAccountId = (id: number | null) => {
    setDefaultAccountIdState(id);
    // Save to localStorage
    if (id !== null) {
      localStorage.setItem('defaultAccountId', id.toString());
    } else {
      localStorage.removeItem('defaultAccountId');
    }
  };

  return (
    <DefaultAccountContext.Provider value={{ defaultAccountId, setDefaultAccountId }}>
      {children}
    </DefaultAccountContext.Provider>
  );
}

export function useDefaultAccount() {
  const context = useContext(DefaultAccountContext);
  if (context === undefined) {
    throw new Error('useDefaultAccount must be used within a DefaultAccountProvider');
  }
  return context;
}
