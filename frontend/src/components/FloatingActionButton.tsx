import { Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import CategoryIcon from './CategoryIcon';

interface Template {
  name: string;
  icon: string;
  amount: number;
  category_id: number;
  description: string;
}

interface FloatingActionButtonProps {
  onQuickAdd: () => void;
  onTemplateSelect?: (template: Template) => void;
  templates?: Template[];
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
                    <CategoryIcon iconName={template.icon} className="text-purple-500" size={20} />
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
        className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white rounded-3xl shadow-button hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title={hasTemplates ? "Opciones rápidas" : "Agregar transacción (Ctrl+N)"}
      >
        <Plus className={`w-7 h-7 transition-transform ${showMenu ? 'rotate-45' : 'group-hover:scale-110'}`} />
      </button>
    </div>
  );
}
