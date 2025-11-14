import { useState } from 'react';
import { Copy, Trash2, X, Loader2, Calendar } from 'lucide-react';
import { useCopyCycle, useClearCycle } from '@/lib/hooks/useApi';

interface BudgetActionsProps {
  currentCycle: string;
  onSuccess?: () => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function BudgetActions({ currentCycle, onSuccess }: BudgetActionsProps) {
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedCycles, setSelectedCycles] = useState<string[]>([]);

  const copyCycle = useCopyCycle();
  const clearCycle = useClearCycle();

  // Handle copy cycle
  const handleCopy = async () => {
    if (selectedCycles.length === 0) return;

    try {
      await copyCycle.mutateAsync({
        sourceCycle: currentCycle,
        targetCycles: selectedCycles,
      });
      setShowCopyModal(false);
      setSelectedCycles([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error copying cycle:', error);
    }
  };

  // Handle clear cycle
  const handleClear = async () => {
    try {
      await clearCycle.mutateAsync(currentCycle);
      setShowClearModal(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error clearing cycle:', error);
    }
  };

  // Toggle cycle selection
  const toggleCycle = (cycle: string) => {
    setSelectedCycles(prev =>
      prev.includes(cycle)
        ? prev.filter(c => c !== cycle)
        : [...prev, cycle]
    );
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowCopyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-info to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Copy className="w-4 h-4" />
          Copiar Ciclo
        </button>

        <button
          onClick={() => setShowClearModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-error to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar Ciclo
        </button>
      </div>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-info/10 to-blue-50">
              <div>
                <h2 className="text-h3 font-bold text-text-primary">Copiar Presupuesto</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Origen: <span className="font-bold text-info">{currentCycle}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedCycles([]);
                }}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <p className="text-sm text-text-secondary mb-4">
                Selecciona los ciclos destino donde quieres copiar el presupuesto de <strong>{currentCycle}</strong>:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MONTHS.filter(m => m !== currentCycle).map((month) => (
                  <button
                    key={month}
                    onClick={() => toggleCycle(month)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedCycles.includes(month)
                        ? 'bg-info/10 border-info text-info font-bold shadow-md'
                        : 'bg-white border-border text-text-secondary hover:border-info/50 hover:bg-info/5'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{month}</span>
                  </button>
                ))}
              </div>

              {selectedCycles.length > 0 && (
                <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
                  <p className="text-sm text-success">
                    ✓ {selectedCycles.length} ciclo{selectedCycles.length > 1 ? 's' : ''} seleccionado{selectedCycles.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface">
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedCycles([]);
                }}
                className="px-4 py-2 border-2 border-border rounded-xl font-bold text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCopy}
                disabled={selectedCycles.length === 0 || copyCycle.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-info to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {copyCycle.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Copiando...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar a {selectedCycles.length} ciclo{selectedCycles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-error/10 to-red-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-error/20 rounded-lg">
                  <Trash2 className="w-5 h-5 text-error" />
                </div>
                <h2 className="text-h3 font-bold text-text-primary">Limpiar Ciclo</h2>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <p className="text-sm font-bold text-warning">⚠️ Acción irreversible</p>
              </div>
              <p className="text-text-secondary">
                ¿Estás seguro de que quieres eliminar <strong className="text-text-primary">todos los presupuestos</strong> del ciclo{' '}
                <strong className="text-error">{currentCycle}</strong>?
              </p>
              <p className="text-sm text-text-muted mt-3">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border-2 border-border rounded-xl font-bold text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleClear}
                disabled={clearCycle.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-error to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {clearCycle.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sí, Limpiar Ciclo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
