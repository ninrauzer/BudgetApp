import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Category } from '@/lib/api';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(cat => cat.id === value);

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim() === '' 
    ? sortedCategories 
    : sortedCategories.filter(cat => cat.name.toLowerCase().startsWith(searchQuery.toLowerCase()));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard input for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Alphanumeric keys trigger search
      if (/^[a-záéíóúñü]$/i.test(e.key)) {
        e.preventDefault();
        const newQuery = searchQuery + e.key;
        setSearchQuery(newQuery);

        // Clear search after 1 second of inactivity
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
          setSearchQuery('');
        }, 1000);
        setSearchTimeout(timeout);

        // Scroll to first matching item
        setTimeout(() => {
          const firstItem = listRef.current?.querySelector('[data-search-match="true"]');
          if (firstItem) {
            firstItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 0);
      }

      // Escape key closes dropdown
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }

      // ArrowDown/ArrowUp for navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = listRef.current?.querySelectorAll('[role="button"]');
        if (!items) return;

        const currentIndex = Array.from(items).findIndex(item => 
          item === document.activeElement
        );
        
        let nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
        nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
        
        (items[nextIndex] as HTMLElement).focus();
      }

      // Enter key selects focused item
      if (e.key === 'Enter' && document.activeElement?.hasAttribute('data-category-id')) {
        const categoryId = parseInt(
          (document.activeElement as HTMLElement).getAttribute('data-category-id') || '0'
        );
        if (categoryId) {
          handleSelect(categoryId);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchQuery, searchTimeout]);

  const handleSelect = (categoryId: number | undefined) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchQuery('');
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
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto" ref={listRef}>
          {/* Search indicator (show when typing) */}
          {searchQuery && (
            <div className="px-4 py-2 text-xs text-text-secondary bg-surface-soft border-b border-border">
              Buscando: "<span className="font-semibold">{searchQuery}</span>"
            </div>
          )}

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
          {filteredCategories.length === 0 ? (
            <div className="px-4 py-3 text-text-muted text-sm">
              {searchQuery ? 'No hay categorías que coincidan' : 'No hay categorías disponibles'}
            </div>
          ) : (
            filteredCategories.map((cat, index) => (
              <button
                key={cat.id}
                type="button"
                role="button"
                data-category-id={cat.id}
                data-search-match={!searchQuery || cat.name.toLowerCase().startsWith(searchQuery.toLowerCase())}
                tabIndex={index === 0 ? 0 : -1}
                onClick={() => handleSelect(cat.id)}
                className={`w-full px-4 py-3 flex items-center gap-2 hover:bg-surface-soft transition-colors text-left focus:bg-surface-soft focus:outline-none ${
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
