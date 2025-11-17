import { useToast } from './ToastContext';
import { X } from 'lucide-react';

export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`group relative border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm bg-surface/90 animate-fade-in
            ${t.type === 'success' ? 'border-emerald-500/40' : ''}
            ${t.type === 'error' ? 'border-red-500/40' : ''}
            ${t.type === 'info' ? 'border-blue-500/40' : ''}`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-2 h-10 rounded-full mt-0.5
              ${t.type === 'success' ? 'bg-emerald-500' : ''}
              ${t.type === 'error' ? 'bg-red-500' : ''}
              ${t.type === 'info' ? 'bg-blue-500' : ''}`}
            />
            <div className="flex-1">
              <p className="font-semibold text-text-primary leading-tight">{t.title}</p>
              {t.message && (
                <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-3">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-background"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}
