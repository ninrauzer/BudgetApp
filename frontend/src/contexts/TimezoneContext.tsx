import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Try to load from localStorage, fallback to browser timezone
    const saved = localStorage.getItem('userTimezone');
    return saved || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem('userTimezone', tz);
    
    // Dispatch custom event to notify components of timezone change
    window.dispatchEvent(new CustomEvent('timezoneChanged', { detail: tz }));
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
