import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Check for JWT token (OAuth) - this persists across page refreshes
  const hasJWTToken = !!localStorage.getItem('token');
  
  // If we have a JWT token, user is authenticated (OAuth/Google or Demo)
  // No need to wait for AuthContext loading
  if (hasJWTToken) {
    return <>{children}</>;
  }

  // Otherwise, check HTTP Basic Auth (dev mode with username/password)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner />
      </div>
    );
  }

  // No JWT token and not authenticated via Basic Auth - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
