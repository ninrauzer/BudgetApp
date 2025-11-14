import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
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
  type: 'income' | 'expense';
  icon: string;
  description?: string;
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
    description: ''
  });

  const handleStartAdd = () => {
    setFormData({ name: '', type: 'expense', icon: 'tag', description: '' });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || 'tag',
      description: category.description || ''
    });
    setEditingId(category.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: formData
        });
      } else {
        await createMutation.mutateAsync(formData as any);
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving category:', error);
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
    setFormData({ name: '', type: 'expense', icon: 'tag', description: '' });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-text-secondary">Cargando categorías...</div>;
  }

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
      {(isAdding || editingId) && (
        <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/30 rounded-2xl p-6 mb-4">
          <h3 className="font-bold text-text-primary mb-4">
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
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
              <div className="flex gap-2">
                <button
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white shadow-button'
                      : 'bg-surface border-2 border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  Gasto
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-button'
                      : 'bg-surface border-2 border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  Ingreso
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

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((category) => (
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
                  : 'bg-red-100 text-red-600'
              }`}>
                <CategoryIcon iconName={category.icon || 'tag'} size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-text-primary">{category.name}</h4>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <span className={`px-2 py-0.5 rounded-md font-medium ${
                    category.type === 'income'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                  </span>
                  {category.description && (
                    <span className="italic">{category.description}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
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
