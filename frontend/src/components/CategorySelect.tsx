import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Category } from '../lib/api';
import CategoryIcon from './CategoryIcon';

interface CategorySelectProps {
  categories: Category[];
  value?: number | null;
  onChange: (categoryId: number | undefined) => void;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
}

const getCategoryColor = (type?: string) => {
  switch (type) {
    case 'income':
      return 'text-emerald-600';
    case 'fixed_expense':
      return 'text-rose-600';
    case 'variable_expense':
      return 'text-pink-600';
    default:
      return 'text-text-secondary';
  }
};

export default function CategorySelect({ 
  categories, 
  value, 
  onChange, 
  placeholder = 'Seleccionar categoría',
  className = '',
  allowClear = false
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(cat => cat.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (categoryId: number | undefined) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface border border-border rounded-xl px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <CategoryIcon 
              iconName={selectedCategory.icon} 
              className={getCategoryColor(selectedCategory.type)} 
              size={18} 
            />
            <span className="text-text-primary font-medium">{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-text-muted">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {allowClear && (
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className={`w-full px-4 py-3 flex items-center gap-2 hover:bg-surface-soft transition-colors text-left font-medium text-sm ${
                !value ? 'bg-primary/10 text-primary' : 'text-text-primary'
              }`}
            >
              Todas las categorías
            </button>
          )}
          {categories.length === 0 ? (
            <div className="px-4 py-3 text-text-muted text-sm">No hay categorías disponibles</div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={`w-full px-4 py-3 flex items-center gap-2 hover:bg-surface-soft transition-colors text-left ${
                  cat.id === value ? 'bg-primary/10' : ''
                }`}
              >
                <CategoryIcon 
                  iconName={cat.icon} 
                  className={getCategoryColor(cat.type)} 
                  size={18} 
                />
                <span className="text-text-primary font-medium text-sm">{cat.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
