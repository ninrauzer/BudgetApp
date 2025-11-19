import React from 'react';
import { cn } from '@/lib/utils';

interface CardType {
  id: number;
  name: string;
  bank: string;
  card_type?: string;
  last_four_digits?: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  revolving_debt: number;
  is_active: boolean;
}

interface Props {
  card: CardType;
  onSelect?: (id: number) => void;
  selected?: boolean;
}

function getGradient(usage: number) {
  if (usage < 0.5) return 'from-emerald-400/90 to-emerald-500/90';
  if (usage < 0.85) return 'from-amber-400/90 to-orange-500/90';
  return 'from-rose-400/90 to-rose-500/90';
}

export const CreditCardCard: React.FC<Props> = ({ card, onSelect, selected }) => {
  const usage = Number(card.current_balance) / Number(card.credit_limit);
  const availablePercent = 1 - usage;
  const gradient = getGradient(usage);

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer',
        `bg-gradient-to-br ${gradient}`,
        selected && 'ring-2 ring-white/70'
      )}
      onClick={() => onSelect?.(card.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/70 font-medium">{card.bank}</p>
          <h3 className="text-2xl font-black tracking-tight">{card.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">•••• {card.last_four_digits || '----'}</p>
          <p className="text-xs text-white/60">Límite: S/ {Number(card.credit_limit).toFixed(2)}</p>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">Saldo Actual</p>
        <p className="text-3xl font-black tracking-tight mb-1">S/ {Number(card.current_balance).toFixed(2)}</p>
        <p className="text-xs text-white/60">Disponible: S/ {Number(card.available_credit).toFixed(2)} ({(availablePercent*100).toFixed(0)}%)</p>
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
          <div
            className={cn('h-3 rounded-full transition-all', usage < 0.85 ? 'bg-white/70' : 'bg-white')}
            style={{ width: `${usage*100}%` }}
          />
        </div>
        <p className="text-[11px] text-white/60">Uso de línea: {(usage*100).toFixed(1)}%</p>
      </div>
    </div>
  );
};
