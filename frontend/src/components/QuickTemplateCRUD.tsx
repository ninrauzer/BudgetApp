import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Zap } from 'lucide-react';
import type { QuickTemplate } from '@/lib/api';
import CategoryIcon from './CategoryIcon';
import CategorySelect from './CategorySelect';
import { 
  useQuickTemplates, 
  useCreateQuickTemplate, 
  useUpdateQuickTemplate, 
  useDeleteQuickTemplate,
  useCategories 
} from '@/lib/hooks/useApi';

interface TemplateFormData {
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number | undefined;
}

export default function QuickTemplateCRUD() {
  const { data: templates = [], isLoading } = useQuickTemplates();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateQuickTemplate();
  const updateMutation = useUpdateQuickTemplate();
  const deleteMutation = useDeleteQuickTemplate();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    amount: 0,
    type: 'expense',
    category_id: undefined
  });

  const handleStartAdd = () => {
    setFormData({ name: '', description: '', amount: 0, type: 'expense', category_id: undefined });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (template: QuickTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      amount: template.amount,
      type: template.type,
      category_id: template.category_id
    });
    setEditingId(template.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim() || formData.amount <= 0 || !formData.category_id) return;

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
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      try {
        await deleteMutation.mutateAsync(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', amount: 0, type: 'expense', category_id: undefined });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-text-secondary">Cargando plantillas...</div>;
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-text-secondary">
          {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-button transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Plantilla
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/30 rounded-2xl p-6 mb-4">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {editingId ? 'Editar Plantilla' : 'Nueva Plantilla'}
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
                placeholder="Ej: Almuerzo, Transporte..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Descripción *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-text-primary font-medium focus:outline-none focus:border-primary transition-colors"
                placeholder="Descripción de la transacción..."
              />
            </div>

            {/* Amount and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-text-primary font-medium focus:outline-none focus:border-primary transition-colors"
                  placeholder="0.00"
                />
              </div>

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
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Categoría *
              </label>
              <CategorySelect
                categories={categories.filter(c => c.type === formData.type)}
                value={formData.category_id}
                onChange={(value) => setFormData({ ...formData, category_id: value })}
                placeholder="Selecciona una categoría"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.description.trim() || formData.amount <= 0 || !formData.category_id || createMutation.isPending || updateMutation.isPending}
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

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              editingId === template.id
                ? 'bg-primary/5 border-primary shadow-sm'
                : 'bg-surface-soft border-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-3 rounded-xl ${
                template.type === 'income'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                <CategoryIcon iconName={template.category_icon || 'tag'} size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-text-primary">{template.name}</h4>
                <p className="text-sm text-text-secondary">{template.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-text-primary">
                    {template.amount.toFixed(2)} PEN
                  </span>
                  <span className="text-xs text-text-secondary">•</span>
                  <span className="text-xs text-text-secondary">{template.category_name}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartEdit(template)}
                className="p-2 rounded-lg bg-surface hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-border hover:border-blue-300 transition-all"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className={`p-2 rounded-lg transition-all ${
                  deleteConfirm === template.id
                    ? 'bg-red-500 text-white shadow-button'
                    : 'bg-surface hover:bg-red-50 text-red-600 hover:text-red-700 border border-border hover:border-red-300'
                }`}
                title={deleteConfirm === template.id ? 'Confirmar eliminación' : 'Eliminar'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !isAdding && (
        <div className="text-center py-12 text-text-secondary">
          <Zap className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <p className="mb-4">No hay plantillas creadas</p>
          <button
            onClick={handleStartAdd}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-button transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear primera plantilla
          </button>
        </div>
      )}
    </div>
  );
}
