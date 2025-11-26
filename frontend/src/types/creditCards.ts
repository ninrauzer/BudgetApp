// Credit Cards Types

export interface CycleTimeline {
  start_date: string;
  end_date: string;
  payment_date: string;
  days_until_payment: number;
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
