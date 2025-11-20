import { useEffect, useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';

type Environment = 'development' | 'production' | 'unknown';

interface HealthResponse {
  environment: Environment;
  status: string;
}

export default function EnvironmentBanner() {
  const [environment, setEnvironment] = useState<Environment>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data: HealthResponse = await response.json();
          setEnvironment(data.environment || 'unknown');
        }
      } catch (error) {
        console.error('Failed to fetch environment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnvironment();
    // Check every 30 seconds to ensure we're still on the right environment
    const interval = setInterval(checkEnvironment, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || environment === 'unknown') {
    return null;
  }

  const isDevelopment = environment === 'development';
  const bannerBg = isDevelopment 
    ? 'bg-yellow-50 border-l-4 border-yellow-400' 
    : 'bg-green-50 border-l-4 border-green-400';
  
  const textColor = isDevelopment ? 'text-yellow-800' : 'text-green-800';
  const iconColor = isDevelopment ? 'text-yellow-500' : 'text-green-500';
  const badgeBg = isDevelopment ? 'bg-yellow-100' : 'bg-green-100';
  const badgeText = isDevelopment ? 'text-yellow-700' : 'text-green-700';

  return (
    <div className={`${bannerBg} p-3 flex items-center gap-3 ${textColor}`}>
      {isDevelopment ? (
        <AlertCircle className={`${iconColor} flex-shrink-0`} size={20} />
      ) : (
        <Info className={`${iconColor} flex-shrink-0`} size={20} />
      )}
      
      <div className="flex-1">
        <p className="text-sm font-semibold">
          Base de Datos: 
          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${badgeBg} ${badgeText}`}>
            {environment === 'development' ? 'DESARROLLO (budgetapp_dev)' : 'PRODUCCIÓN (budgetapp_prod)'}
          </span>
        </p>
        {isDevelopment && (
          <p className="text-xs mt-1 opacity-75">
            ⚠️ Estás en ambiente de desarrollo. Los datos aquí NO están protegidos.
          </p>
        )}
      </div>
    </div>
  );
}
