import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditCardsApi, type CreditCard, type Installment, type Statement, type CreateCreditCardPayload, type CreateInstallmentPayload, type CreateStatementPayload } from '@/lib/api/creditCards';

// Credit Cards
export const useCreditCards = () => {
  return useQuery<CreditCard[]>({
    queryKey: ['credit-cards'],
    queryFn: () => creditCardsApi.list()
  });
};

export const useCreateCreditCard = () => {
  const qc = useQueryClient();
  return useMutation<CreditCard, unknown, CreateCreditCardPayload>({
    mutationFn: (payload) => creditCardsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
    }
  });
};

export const useUpdateCreditCard = () => {
  const qc = useQueryClient();
  return useMutation<CreditCard, unknown, { id: number; data: Partial<CreateCreditCardPayload>}>({
    mutationFn: ({ id, data }) => creditCardsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
    }
  });
};

export const useDeleteCreditCard = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, unknown, number>({
    mutationFn: (id) => creditCardsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
    }
  });
};

// Installments
export const useInstallments = (cardId: number) => {
  return useQuery<Installment[]>({
    queryKey: ['credit-cards', cardId, 'installments'],
    queryFn: () => creditCardsApi.listInstallments(cardId),
    enabled: !!cardId
  });
};

export const useCreateInstallment = () => {
  const qc = useQueryClient();
  return useMutation<Installment, unknown, CreateInstallmentPayload>({
    mutationFn: (payload) => creditCardsApi.createInstallment(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['credit-cards', data.credit_card_id, 'installments'] });
      qc.invalidateQueries({ queryKey: ['credit-cards'] }); // saldo se actualiza
    }
  });
};

export const useUpdateInstallment = () => {
  const qc = useQueryClient();
  return useMutation<Installment, unknown, { id: number; data: Partial<CreateInstallmentPayload>}>({
    mutationFn: ({ id, data }) => creditCardsApi.updateInstallment(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['credit-cards', data.credit_card_id, 'installments'] });
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
    }
  });
};

// Statements
export const useStatements = (cardId: number) => {
  return useQuery<Statement[]>({
    queryKey: ['credit-cards', cardId, 'statements'],
    queryFn: () => creditCardsApi.listStatements(cardId),
    enabled: !!cardId
  });
};

export const useCreateStatement = () => {
  const qc = useQueryClient();
  return useMutation<Statement, unknown, CreateStatementPayload>({
    mutationFn: (payload) => creditCardsApi.createStatement(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['credit-cards', data.credit_card_id, 'statements'] });
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
    }
  });
};
