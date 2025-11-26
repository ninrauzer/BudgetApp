// Credit Cards Types

export interface CycleTimeline {
  current_cycle: {
    statement_date: string;
    due_date: string;
    days_in_cycle: number;
    days_until_close: number;
    days_until_payment: number;
  };
  timeline: {
    best_purchase_window: {
      start: string;
      end: string;
      float_days: number;
      reason: string;
    };
    risk_zone: {
      start: string;
      end: string;
      reason: string;
    };
    cycle_phases: Array<{
      phase: 'optimal' | 'normal' | 'warning';
      date_range: [string, string];
      description: string;
    }>;
  };
  float_calculator: {
    if_buy_today: {
      purchase_date: string;
      will_appear_on_statement: string;
      payment_due: string;
      float_days: number;
      message: string;
    };
  };
}

export interface PurchaseAdvisor {
  can_afford: boolean;
  message: string;
  recommendation?: string;
  error?: {
    title: string;
    message: string;
  };
  warning?: {
    title: string;
    message: string;
    details: {
      requested_amount: number;
      available_credit: number;
      short_by: number;
      action: string;
    };
  };
}
