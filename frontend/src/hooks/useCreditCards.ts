/**
 * React Query Hooks para Credit Cards
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  creditCardsApi,
  type CreateCreditCardPayload,
  type CreateInstallmentPayload,
  type CreateStatementPayload
} from '@/lib/api/creditCards';

// ============================================================================
// Query Keys
// ============================================================================

export const creditCardKeys = {
  all: ['credit-cards'] as const,
  lists: () => [...creditCardKeys.all, 'list'] as const,
  list: () => [...creditCardKeys.lists()] as const,
  details: () => [...creditCardKeys.all, 'detail'] as const,
  detail: (id: number) => [...creditCardKeys.details(), id] as const,
  summaries: () => [...creditCardKeys.all, 'summary'] as const,
  summary: (id: number) => [...creditCardKeys.summaries(), id] as const,
  installments: (cardId: number) => [...creditCardKeys.all, 'installments', cardId] as const,
  statements: (cardId: number) => [...creditCardKeys.all, 'statements', cardId] as const,
  cycleTimeline: (cardId: number, month?: number, year?: number) => 
    [...creditCardKeys.all, 'cycle-timeline', cardId, month, year] as const,
  purchaseAdvisor: (cardId: number, amount?: number, installments?: number) =>
    [...creditCardKeys.all, 'purchase-advisor', cardId, amount, installments] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lista todas las tarjetas de crédito
 */
export function useCreditCards() {
  return useQuery({
    queryKey: creditCardKeys.list(),
    queryFn: () => creditCardsApi.list(),
  });
}

/**
 * Obtiene detalles de una tarjeta específica
 */
export function useCreditCard(id: number) {
  return useQuery({
    queryKey: creditCardKeys.detail(id),
    queryFn: () => creditCardsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Obtiene resumen completo de una tarjeta (con cuotas y último estado)
 */
export function useCreditCardSummary(id: number) {
  return useQuery({
    queryKey: creditCardKeys.summary(id),
    queryFn: () => creditCardsApi.getSummary(id),
    enabled: !!id,
  });
}

/**
 * Obtiene todas las cuotas activas de una tarjeta
 */
export function useCreditCardInstallments(cardId: number) {
  return useQuery({
    queryKey: creditCardKeys.installments(cardId),
    queryFn: () => creditCardsApi.listInstallments(cardId),
    enabled: !!cardId,
  });
}

/**
 * Obtiene historial de estados de cuenta
 */
export function useCreditCardStatements(cardId: number, limit?: number) {
  return useQuery({
    queryKey: creditCardKeys.statements(cardId),
    queryFn: () => creditCardsApi.listStatements(cardId, limit),
    enabled: !!cardId,
  });
}

/**
 * 📅 TIMELINE DEL CICLO DE FACTURACIÓN
 * 
 * Muestra:
 * - Fechas del ciclo actual (corte, pago)
 * - Ventana óptima de compra (máximo float)
 * - Zona de riesgo (cerca del vencimiento)
 * - Fases del ciclo (óptimo/normal/warning)
 * - Calculadora de días de crédito gratis
 * 
 * @param cardId - ID de la tarjeta
 * @param targetMonth - Mes objetivo (opcional, default: actual)
 * @param targetYear - Año objetivo (opcional, default: actual)
 */
export function useCycleTimeline(
  cardId: number,
  targetMonth?: number,
  targetYear?: number
) {
  return useQuery({
    queryKey: creditCardKeys.cycleTimeline(cardId, targetMonth, targetYear),
    queryFn: () => creditCardsApi.getCycleTimeline(cardId, targetMonth, targetYear),
    enabled: !!cardId,
    staleTime: 1000 * 60 * 60, // 1 hora (el timeline no cambia frecuentemente)
  });
}

/**
 * 💡 ASESOR DE COMPRAS: ¿Cuotas o Revolvente?
 * 
 * Compara:
 * - Opción revolvente (sin intereses si pagas total)
 * - Opción cuotas (con intereses TEA)
 * - Recomendación basada en ahorro vs liquidez
 * - Impacto en utilización de crédito
 * 
 * @param cardId - ID de la tarjeta
 * @param amount - Monto de la compra
 * @param installments - Número de cuotas (opcional)
 * @param teaInstallments - TEA para cuotas (opcional, usa el de la tarjeta)
 */
export function usePurchaseAdvisor(
  cardId: number,
  amount?: number,
  installments?: number,
  teaInstallments?: number
) {
  return useQuery({
    queryKey: creditCardKeys.purchaseAdvisor(cardId, amount, installments),
    queryFn: () => creditCardsApi.getPurchaseAdvisor(cardId, amount!, installments, teaInstallments),
    enabled: !!cardId && !!amount && amount > 0,
    staleTime: 1000 * 30, // 30 segundos (cambios frecuentes al ajustar monto)
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Crea una nueva tarjeta de crédito
 */
export function useCreateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCreditCardPayload) => creditCardsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
    },
  });
}

/**
 * Actualiza una tarjeta existente
 */
export function useUpdateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateCreditCardPayload> }) =>
      creditCardsApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.summary(id) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
    },
  });
}

/**
 * Elimina (desactiva) una tarjeta
 */
export function useDeleteCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => creditCardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
    },
  });
}

/**
 * Agrega una compra en cuotas
 */
export function useCreateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInstallmentPayload) => creditCardsApi.createInstallment(payload),
    onSuccess: (_, { credit_card_id }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.installments(credit_card_id) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.summary(credit_card_id) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.detail(credit_card_id) });
    },
  });
}

/**
 * Actualiza el número de cuota actual (marca como pagada)
 */
export function useUpdateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, current_installment }: { 
      id: number; 
      current_installment: number;
      cardId: number;
    }) => creditCardsApi.updateInstallment(id, current_installment),
    onSuccess: (_, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.installments(cardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.summary(cardId) });
    },
  });
}

/**
 * Elimina una cuota
 */
export function useDeleteInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; cardId: number }) => 
      creditCardsApi.deleteInstallment(id),
    onSuccess: (_, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.installments(cardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.summary(cardId) });
    },
  });
}

/**
 * Agrega un nuevo estado de cuenta
 */
export function useCreateStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStatementPayload) => creditCardsApi.createStatement(payload),
    onSuccess: (_, { credit_card_id }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statements(credit_card_id) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.summary(credit_card_id) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.detail(credit_card_id) });
    },
  });
}
