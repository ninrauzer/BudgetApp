import { Pencil, Trash2, TrendingUp, TrendingDown, Copy, StickyNote } from 'lucide-react';
import type { TransactionWithDetails } from '@/lib/api';
import CategoryIcon from './CategoryIcon';
import type { ReactNode } from 'react';

interface TransactionTableProps {
  transactions: TransactionWithDetails[];
  isLoading?: boolean;
  onEdit?: (transaction: TransactionWithDetails) => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (transaction: TransactionWithDetails) => void;
  deleteConfirm?: number | null;
  quickAddRow?: ReactNode;
  applyDemoScale?: (amount: number) => number;
  obfuscateDescription?: (description: string, categoryName?: string) => string;
}

export default function TransactionTable({ 
  transactions, 
  isLoading, 
  onEdit, 
  onDelete,
  onDuplicate,
  deleteConfirm,
  quickAddRow,
  applyDemoScale = (amount) => amount,
  obfuscateDescription = (desc) => desc
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-surface-soft rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-12 text-center">
        <p className="text-text-secondary text-lg">No hay transacciones para mostrar</p>
        <p className="text-text-muted text-sm mt-2">Ajusta los filtros o crea una nueva transacción</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-soft border-b border-border">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Descripción
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Categoría
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Cuenta
              </th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Monto
              </th>
              <th className="text-center px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Moneda
              </th>
              <th className="text-center px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Tipo
              </th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {quickAddRow}
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id}
                className="hover:bg-surface-soft/60 transition-colors"
              >
                <td className="px-6 py-4 text-text-primary font-medium text-sm">
                  {new Date(transaction.date).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary font-semibold text-sm">{obfuscateDescription(transaction.description, transaction.category_name)}</span>
                    {transaction.notes && (
                      <div className="group relative">
                        <StickyNote className="w-4 h-4 text-amber-600/70 hover:text-amber-500 cursor-help transition-colors" />
                        <div className="absolute left-0 top-6 z-50 hidden group-hover:block">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap max-w-xs">
                            {obfuscateDescription(transaction.notes, transaction.category_name)}
                            <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CategoryIcon iconName={transaction.category_icon} className="text-purple-500" size={18} />
                    <span className="text-text-primary font-medium text-sm">{transaction.category_name || '-'}</span>
                    {transaction.type === 'expense' && transaction.category_expense_type && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          transaction.category_expense_type === 'fixed'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                        }`}
                        title={
                          transaction.category_expense_type === 'fixed'
                            ? 'Gasto fijo recurrente'
                            : 'Gasto variable / controlable'
                        }
                      >
                        {transaction.category_expense_type === 'fixed' ? 'Fijo' : 'Variable'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-text-primary font-medium text-sm">{transaction.account_name || '-'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-bold text-base ${
                    transaction.type === 'income' 
                      ? 'text-emerald-500' 
                      : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {applyDemoScale(Math.abs(transaction.amount)).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.currency}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                    transaction.currency === 'USD' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {transaction.currency === 'USD' ? 'USD' : 'PEN'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {transaction.type === 'income' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold bg-emerald-500 text-white">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Ingreso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold bg-red-500 text-white">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Gasto
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onDuplicate && (
                      <button
                        onClick={() => onDuplicate(transaction)}
                        className="p-2 hover:bg-purple-500/10 text-purple-500 rounded-xl transition-all"
                        title="Duplicar transacción"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className={`p-2 rounded-xl transition-all ${
                          deleteConfirm === transaction.id
                            ? 'bg-danger text-white shadow-button'
                            : 'hover:bg-danger/10 text-danger'
                        }`}
                        title={deleteConfirm === transaction.id ? 'Confirmar eliminación' : 'Eliminar'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
