import { Eye, X } from 'lucide-react';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { useState } from 'react';

export default function DemoBanner() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-b-2 border-amber-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
            <div>
              <p className="font-bold text-sm">
                🎭 Modo Demo Activo
              </p>
              <p className="text-xs opacity-90">
                Todos los montos están reducidos 10x y las descripciones ofuscadas para proteger tu privacidad
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDemoMode}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-bold text-xs transition-all"
            >
              Desactivar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
              aria-label="Cerrar banner"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
