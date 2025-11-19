import React, { useState } from 'react';
import { useCreditCards, useInstallments, useCreateCreditCard, useCreateInstallment } from '@/hooks/useCreditCards';
import { CreditCardCard } from '@/components/credit-cards/CreditCardCard';
import { InstallmentsList } from '@/components/credit-cards/InstallmentsList';
import { InstallmentModal, type FormData } from '@/components/credit-cards/InstallmentModal';
import { StatementUpload } from '@/components/credit-cards/StatementUpload';
import { Plus } from 'lucide-react';

export default function CreditCardsPage() {
  const { data: cards, isLoading } = useCreditCards();
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const { data: installments, isLoading: loadingInst } = useInstallments(selectedId || 0);
  const createCard = useCreateCreditCard();
  const createInstallment = useCreateInstallment();
  const [showModal, setShowModal] = useState(false);

  const handleCreate = () => {
    // Datos por defecto para agilizar creación inicial
    createCard.mutate({
      name: 'BBVA Visa Signature',
      bank: 'BBVA',
      card_type: 'Visa',
      last_four_digits: '0265',
      credit_limit: 13000,
      payment_due_day: 5,
      statement_close_day: 10,
      revolving_interest_rate: 44.99
    });
  };

  const handleAddInstallment = async (data: FormData) => {
    if (!selectedId) {
      throw new Error('Debe seleccionar una tarjeta primero');
    }
    return new Promise((resolve, reject) => {
      createInstallment.mutate(
        { ...data, credit_card_id: selectedId },
        {
          onSuccess: () => resolve(),
          onError: (err) => reject(err)
        }
      );
    });
  };

  const totalMonthlyInstallments = installments?.reduce((sum, inst) => sum + Number(inst.monthly_payment), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Tarjetas de Crédito</h1>
        <p className="text-sm text-text-secondary mt-1">Gestión de saldos, cuotas y estados de cuenta (ADR-004).</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 font-bold text-sm transition-all hover:scale-105 disabled:opacity-40"
          disabled={createCard.isPending}
        >
          Crear Tarjeta Demo
        </button>
        {createCard.isPending && <p className="text-xs text-text-secondary">Creando...</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && <p className="text-sm text-text-secondary">Cargando tarjetas...</p>}
        {cards?.map(card => (
          <CreditCardCard
            key={card.id}
            card={card}
            selected={selectedId === card.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Cuotas Activas</h2>
              {totalMonthlyInstallments > 0 && (
                <p className="text-xs text-text-secondary mt-1">Total mensual: S/ {totalMonthlyInstallments.toFixed(2)}</p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={!selectedId}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 font-bold text-xs transition-all hover:scale-105 disabled:opacity-40"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>
          <InstallmentsList installments={installments} loading={loadingInst} />
        </div>
        <div>
          <StatementUpload cardId={selectedId} />
        </div>
      </div>

      {showModal && (
        <InstallmentModal
          cardId={selectedId}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddInstallment}
          isLoading={createInstallment.isPending}
        />
      )}
    </div>
  );
}
