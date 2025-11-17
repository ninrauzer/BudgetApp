import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Plus, Edit2, Trash2, X, Check, Calendar, TrendingUp } from 'lucide-react';
import type { Category } from '../lib/api';
import CategoryIcon from './CategoryIcon';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../lib/hooks/useApi';

// Common Lucide icon names for categories
const ICON_OPTIONS = [
  'utensils', 'shopping-cart', 'car', 'home', 'zap', 'heart', 'book', 
  'briefcase', 'coffee', 'film', 'gift', 'smartphone', 'tv', 'wifi',
  'credit-card', 'dollar-sign', 'percent', 'trending-up', 'trending-down',
  'shopping-bag', 'shirt', 'package', 'truck', 'plane', 'train',
  'hotel', 'umbrella', 'music', 'headphones', 'gamepad', 'dumbbell',
  'stethoscope', 'pill', 'syringe', 'dog', 'cat', 'leaf', 'flower'
];

interface CategoryFormData {
  name: string;
  type: 'income' | 'expense' | 'saving';
  icon: string;
  description?: string;
  expense_type?: 'fixed' | 'variable';
}

export default function CategoryCRUD() {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    icon: 'tag',
    description: '',
    expense_type: 'variable'
  });
  const formRef = useRef<HTMLDivElement | null>(null);
  const { pushToast } = useToast();

  const handleStartAdd = () => {
    setFormData({ name: '', type: 'expense', icon: 'tag', description: '', expense_type: 'variable' });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type as 'income' | 'expense' | 'saving',
      icon: category.icon || 'tag',
      description: (category as any).description || '',
      expense_type: category.type === 'expense' ? (category as any).expense_type : undefined
    });
    setEditingId(category.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      const payload: any = { ...formData };
      if (payload.type !== 'expense') delete payload.expense_type; // limpiar si no aplica
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        pushToast({ title: 'Categoría actualizada', message: `Se guardó ${payload.name}`, type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        pushToast({ title: 'Categoría creada', message: `Se creó ${payload.name}`, type: 'success' });
      }
      // Pequeño delay para permitir refetch antes de cerrar
      setTimeout(() => handleCancel(), 50);
    } catch (error) {
      console.error('Error saving category:', error);
      pushToast({ title: 'Error', message: 'No se pudo guardar la categoría', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      try {
        await deleteMutation.mutateAsync(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', type: 'expense', icon: 'tag', description: '', expense_type: 'variable' });
  };

  // Auto scroll when starting add or edit (must be before any conditional returns to keep hook order stable)
  useEffect(() => {
    if ((isAdding || editingId) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isAdding, editingId]);

  // Loading state rendered inline (avoid early return after hooks)
  const loadingBlock = isLoading && (
    <div className="text-center py-8 text-text-secondary">Cargando categorías...</div>
  );

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-text-secondary">
          {categories.length} categoría{categories.length !== 1 ? 's' : ''}
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-button transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {loadingBlock}
      {(isAdding || editingId) && !isLoading && (
        <div ref={formRef} className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/30 rounded-2xl p-6 mb-4">
          <h3 className="font-bold text-text-primary mb-4">
            {editingId ? 'Editando Categoría' : 'Nueva Categoría'}
          </h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-text-primary font-medium focus:outline-none focus:border-primary transition-colors"
                placeholder="Ej: Alimentación, Transporte..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tipo *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense', expense_type: prev.expense_type || 'variable' }))}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white shadow-button'
                      : 'bg-surface border-2 border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  Gasto
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income', expense_type: undefined }))}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-button'
                      : 'bg-surface border-2 border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  Ingreso
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'saving', expense_type: undefined }))}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    formData.type === 'saving'
                      ? 'bg-amber-500 text-white shadow-button'
                      : 'bg-surface border-2 border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  Ahorro
                </button>
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Icono *
              </label>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-surface rounded-xl border border-border">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`p-3 rounded-lg transition-all ${
                      formData.icon === iconName
                        ? 'bg-primary text-white shadow-button'
                        : 'bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary'
                    }`}
                    title={iconName}
                  >
                    <CategoryIcon iconName={iconName} size={20} />
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                <span>Seleccionado:</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-surface rounded-lg border border-border">
                  <CategoryIcon iconName={formData.icon} size={16} />
                  <span className="font-medium">{formData.icon}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-text-primary font-medium focus:outline-none focus:border-primary transition-colors"
                placeholder="Descripción adicional..."
              />
            </div>
            {/* Expense Type (only for expense categories) */}
            {formData.type === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tipo de Gasto
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, expense_type: 'fixed' }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.expense_type === 'fixed'
                        ? 'border-blue-600 bg-blue-600/10 text-blue-700'
                        : 'border-border bg-surface hover:border-blue-400'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-semibold text-sm">Fijo</p>
                      <p className="text-[11px] text-text-secondary">Recurrente y predecible</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, expense_type: 'variable' }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.expense_type === 'variable'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                        : 'border-border bg-surface hover:border-orange-400'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-semibold text-sm">Variable</p>
                      <p className="text-[11px] text-text-secondary">Ocasional o controlable</p>
                    </div>
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-text-secondary">
                  Esto afecta el orden y análisis en la vista anual de presupuesto.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-3 bg-success hover:bg-success-hover text-white rounded-xl font-bold shadow-button transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-surface border-2 border-border text-text-primary hover:bg-surface-soft rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List agrupadas */}
      <div className="space-y-6">
        {(() => {
          const income = categories.filter(c => c.type === 'income');
          const expensesFixed = categories.filter(c => c.type === 'expense' && (c as any).expense_type === 'fixed');
          const expensesVariable = categories.filter(c => c.type === 'expense' && (c as any).expense_type === 'variable');
          const expensesUnspecified = categories.filter(c => c.type === 'expense' && !(c as any).expense_type);
          const savings = categories.filter(c => c.type === 'saving');

          const section = (title: string, items: Category[], colorClasses: string) => (
            items.length > 0 && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wide mb-2 ${colorClasses}`}>{title}</h3>
                <div className="space-y-2">
                  {items.map(category => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        editingId === category.id
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : 'bg-surface-soft border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${
                          category.type === 'income'
                            ? 'bg-emerald-100 text-emerald-600'
                            : category.type === 'saving'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-600'
                        }`}>
                          <CategoryIcon iconName={category.icon || 'tag'} size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-text-primary flex items-center gap-2">
                            {category.name}
                            {category.type === 'expense' && (category as any).expense_type && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                (category as any).expense_type === 'fixed'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : 'bg-orange-50 text-orange-600 border-orange-200'
                              }`}>
                                {(category as any).expense_type === 'fixed' ? 'Fijo' : 'Variable'}
                              </span>
                            )}
                            {category.type === 'expense' && !(category as any).expense_type && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">Sin tipo</span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <span className={`px-2 py-0.5 rounded-md font-medium ${
                              category.type === 'income'
                                ? 'bg-emerald-100 text-emerald-700'
                                : category.type === 'saving'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {category.type === 'income' ? 'Ingreso' : category.type === 'saving' ? 'Ahorro' : 'Gasto'}
                            </span>
                            {(category as any).description && (
                              <span className="italic truncate max-w-[200px]" title={(category as any).description}>{(category as any).description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(category)}
                          className="p-2 rounded-lg bg-surface hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-border hover:border-blue-300 transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className={`p-2 rounded-lg transition-all ${
                            deleteConfirm === category.id
                              ? 'bg-red-500 text-white shadow-button'
                              : 'bg-surface hover:bg-red-50 text-red-600 hover:text-red-700 border border-border hover:border-red-300'
                          }`}
                          title={deleteConfirm === category.id ? 'Confirmar eliminación' : 'Eliminar'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          );
          return (
            <>
              {section('Ingresos', income, 'text-emerald-600')}
              {section('Gastos Fijos', expensesFixed, 'text-blue-600')}
              {section('Gastos Variables', expensesVariable, 'text-orange-600')}
              {section('Gastos Sin Tipo', expensesUnspecified, 'text-slate-600')}
              {section('Ahorros', savings, 'text-amber-600')}
            </>
          );
        })()}
      </div>

      {categories.length === 0 && !isAdding && (
        <div className="text-center py-12 text-text-secondary">
          <p className="mb-4">No hay categorías creadas</p>
          <button
            onClick={handleStartAdd}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-button transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear primera categoría
          </button>
        </div>
      )}
    </div>
  );
}
