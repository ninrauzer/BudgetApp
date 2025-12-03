import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Wallet, AlertCircle } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login('demo', 'demo123');
      navigate('/');
    } catch (err) {
      setError('Error al acceder al modo demo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      // Send Google token to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });

      if (!response.ok) {
        throw new Error('Error al autenticar con Google');
      }

      const data = await response.json();
      
      // Store JWT token and user data
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('[Login] Token saved:', data.access_token.substring(0, 20) + '...');
      console.log('[Login] User saved:', data.user);
      
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to home WITHOUT reload - let React Router handle it
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al autenticar con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Error al conectar con Google. Inténtalo de nuevo.');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "607479490776-2gpb3se5btqd0gkskju8ukv5mc8bv29c.apps.googleusercontent.com"}>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-2xl mb-4 shadow-xl">
            <Wallet className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-2">BudgetApp</h1>
          <p className="text-text-secondary">Control total de tus finanzas</p>
        </div>

        {/* Login form */}
        <div className="bg-white border-2 border-border rounded-3xl shadow-lg p-8">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-danger/10 border border-danger/30 rounded-xl text-danger">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-text-primary">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" strokeWidth={2} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface border-2 border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="admin o demo"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" strokeWidth={2} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-surface border-2 border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-bold text-base hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-muted font-medium">O continuar con</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="space-y-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              locale="es"
            />

            {/* Apple Sign In (Coming Soon) */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 py-3 bg-black/5 border-2 border-border text-text-muted rounded-xl font-semibold cursor-not-allowed opacity-60"
              title="Apple Sign-In requiere Apple Developer Account ($99/año)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Sign in with Apple (Próximamente)
            </button>

            {/* Demo mode button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3 bg-surface border-2 border-border text-text-primary rounded-xl font-semibold hover:bg-surface-soft hover:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎭 Acceder como Demo
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          Versión 2.0 • Hecho con ❤️
        </p>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
