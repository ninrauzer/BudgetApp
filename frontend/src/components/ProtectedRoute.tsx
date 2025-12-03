import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Check for JWT token (OAuth) or HTTP Basic Auth
  const hasJWTToken = !!localStorage.getItem('token');
  const isAuthenticatedViaOAuth = hasJWTToken;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner />
      </div>
    );
  }

  // Allow access if authenticated via HTTP Basic Auth OR has JWT token
  if (!isAuthenticated && !isAuthenticatedViaOAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
