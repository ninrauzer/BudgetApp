import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'demo' | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'budgetapp_auth';

interface AuthData {
  username: string;
  password: string;
  userType: 'admin' | 'demo';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthData;
        setAuthData(parsed);
      } catch (e) {
        console.error('Failed to parse stored auth:', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Test credentials against backend
    const credentials = btoa(`${username}:${password}`);
    
    try {
      const response = await fetch('/api/health', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.status === 401) {
        throw new Error('Credenciales inválidas');
      }

      if (!response.ok) {
        throw new Error('Error al verificar credenciales');
      }

      // Determine user type based on username
      const userType: 'admin' | 'demo' = username === 'demo' ? 'demo' : 'admin';

      const data: AuthData = { username, password, userType };
      setAuthData(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));

      // Auto-enable demo mode for demo users
      if (userType === 'demo') {
        localStorage.setItem('budgetapp_demo_mode', 'true');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Also clear demo mode
    localStorage.removeItem('budgetapp_demo_mode');
  };

  const value: AuthContextType = {
    isAuthenticated: authData !== null,
    userType: authData?.userType || null,
    username: authData?.username || null,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Get stored credentials for API requests
export function getStoredCredentials(): string | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const { username, password } = JSON.parse(stored) as AuthData;
    return btoa(`${username}:${password}`);
  } catch {
    return null;
  }
}
