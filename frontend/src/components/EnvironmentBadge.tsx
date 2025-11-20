import { useEffect, useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';

type Environment = 'development' | 'production' | 'loading' | 'unknown';

interface HealthResponse {
  environment?: string;
  status: string;
}

export default function EnvironmentBadge() {
  const [environment, setEnvironment] = useState<Environment>('loading');

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data: HealthResponse = await response.json();
          const env = data.environment as Environment;
          if (env === 'development' || env === 'production') {
            setEnvironment(env);
          } else {
            setEnvironment('unknown');
          }
        }
      } catch (error) {
        console.error('Failed to fetch environment:', error);
        setEnvironment('unknown');
      }
    };

    checkEnvironment();
    // Check every 30 seconds
    const interval = setInterval(checkEnvironment, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't render while loading
  if (environment === 'loading' || environment === 'unknown') {
    return null;
  }

  const isDevelopment = environment === 'development';
  const bgColor = isDevelopment ? 'bg-yellow-100' : 'bg-green-100';
  const textColor = isDevelopment ? 'text-yellow-700' : 'text-green-700';
  const borderColor = isDevelopment ? 'border-yellow-300' : 'border-green-300';
  const Icon = isDevelopment ? AlertCircle : Info;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${bgColor} ${borderColor} ${textColor}`}>
      <Icon size={16} className="flex-shrink-0" />
      <span className="text-xs font-bold">
        {isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}
      </span>
    </div>
  );
}
