import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CreditCard {
  id?: number;
  name: string;
  bank: string;
  credit_limit: number;
  statement_close_day: number;
  payment_due_day: number;
  tea_revolvente: number;
}

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Omit<CreditCard, 'id'>) => void;
  card?: CreditCard;
  isPending?: boolean;
}

export default function CreditCardModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  card, 
  isPending = false 
}: CreditCardModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    credit_limit: '',
    statement_close_day: '10',
    payment_due_day: '5',
    tea_revolvente: '44.99'
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        bank: card.bank,
        credit_limit: card.credit_limit.toString(),
        statement_close_day: card.statement_close_day.toString(),
        payment_due_day: card.payment_due_day.toString(),
        tea_revolvente: card.tea_revolvente.toString()
      });
    } else {
      setFormData({
        name: '',
        bank: '',
        credit_limit: '',
        statement_close_day: '10',
        payment_due_day: '5',
        tea_revolvente: '44.99'
      });
    }
  }, [card, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      bank: formData.bank,
      credit_limit: parseFloat(formData.credit_limit),
      statement_close_day: parseInt(formData.statement_close_day),
      payment_due_day: parseInt(formData.payment_due_day),
      tea_revolvente: parseFloat(formData.tea_revolvente)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {card ? 'Editar Tarjeta' : 'Nueva Tarjeta de Crédito'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Tarjeta *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: BBVA Visa Signature"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isPending}
            />
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco *
            </label>
            <input
              type="text"
              required
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              placeholder="Ej: BBVA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isPending}
            />
          </div>

          {/* Línea de Crédito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea de Crédito (S/) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
              placeholder="13000.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Día de Corte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día de Corte *
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.statement_close_day}
                onChange={(e) => setFormData({ ...formData, statement_close_day: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isPending}
              />
            </div>

            {/* Día de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día de Pago *
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.payment_due_day}
                onChange={(e) => setFormData({ ...formData, payment_due_day: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isPending}
              />
            </div>
          </div>

          {/* TEA Revolvente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TEA Revolvente (%) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              max="100"
              value={formData.tea_revolvente}
              onChange={(e) => setFormData({ ...formData, tea_revolvente: e.target.value })}
              placeholder="44.99"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isPending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tasa de interés anual cuando pagas el mínimo
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isPending ? 'Guardando...' : (card ? 'Actualizar' : 'Crear Tarjeta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
