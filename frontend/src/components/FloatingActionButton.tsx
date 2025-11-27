import { Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import CategoryIcon from './CategoryIcon';
import type { QuickTemplate } from '@/lib/api/types';

interface FloatingActionButtonProps {
  onQuickAdd: () => void;
  onTemplateSelect?: (template: QuickTemplate) => void;
  templates?: QuickTemplate[];
}

export default function FloatingActionButton({ 
  onQuickAdd, 
  onTemplateSelect,
  templates = [] 
}: FloatingActionButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const hasTemplates = templates.length > 0;

  const handleClick = () => {
    if (hasTemplates) {
      setShowMenu(!showMenu);
    } else {
      onQuickAdd();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Template Menu */}
      {showMenu && hasTemplates && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-20 right-0 bg-surface border border-border rounded-3xl shadow-card p-2 min-w-[280px] animate-slide-up">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 text-text-primary">
                <Zap className="w-4 h-4 text-warning" />
                <span className="font-bold">Plantillas Rápidas</span>
              </div>
            </div>
            
            <div className="py-2 space-y-1 max-h-[400px] overflow-y-auto">
              {/* Quick Add Option */}
              <button
                onClick={() => {
                  onQuickAdd();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-2xl transition-colors flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Agregar Manual</p>
                  <p className="text-xs text-text-muted bg-surface-soft px-2 py-0.5 rounded-lg">Ctrl+N</p>
                </div>
              </button>

              {/* Template Options */}
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onTemplateSelect?.(template);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-purple-500/10 rounded-2xl transition-colors flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <CategoryIcon iconName={template.category_icon || 'HelpCircle'} className="text-purple-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text-primary">{template.name}</p>
                    <p className="text-xs text-text-muted">{template.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500">-{template.amount.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleClick}
        className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white rounded-3xl shadow-lg shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/60 hover:scale-110 transition-all duration-300 flex items-center justify-center group overflow-hidden"
        title={hasTemplates ? "Opciones rápidas" : "Agregar transacción (Ctrl+N)"}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon */}
        <Plus className={`relative z-10 w-7 h-7 transition-transform duration-300 ${showMenu ? 'rotate-45' : 'group-hover:scale-110 group-hover:rotate-90'}`} />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
      </button>
    </div>
  );
}
