// Prueba simple de conexión a la API
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function TestAPI() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Intentando conectar a:', apiClient.defaults.baseURL);
        const response = await apiClient.get('/api/dashboard/summary?year=2025&month=11');
        console.log('Respuesta exitosa:', response.data);
        setData(response.data);
      } catch (err: any) {
        console.error('Error al conectar:', err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-h1 mb-4">Test de Conexión API</h1>
      <div className="bg-surface p-4 rounded">
        <h2 className="text-h3 mb-2">Base URL:</h2>
        <p className="text-body-sm mb-4">{apiClient.defaults.baseURL}</p>
        
        {error && (
          <div className="bg-expense/10 p-4 rounded mb-4">
            <p className="text-expense font-bold">Error:</p>
            <p className="text-body-sm">{error}</p>
          </div>
        )}
        
        {data && (
          <div className="bg-income/10 p-4 rounded">
            <p className="text-income font-bold">Datos recibidos:</p>
            <pre className="text-body-sm mt-2 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        {!data && !error && (
          <p className="text-text-secondary">Cargando...</p>
        )}
      </div>
    </div>
  );
}
