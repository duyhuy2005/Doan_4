import React from 'react';
import { BOOKING_STATUS_MAP, CAR_STATUS_MAP, PAYMENT_STATUS_MAP } from '../../utils/format';

export default function Badge({
  status,
  type = 'booking', // 'booking' | 'car' | 'payment' | 'custom'
  children,
  className = '',
}) {
  let config = { label: children || status, color: 'bg-slate-100 text-slate-800 border-slate-200' };

  if (type === 'booking' && BOOKING_STATUS_MAP[status]) {
    config = BOOKING_STATUS_MAP[status];
  } else if (type === 'car' && CAR_STATUS_MAP[status]) {
    config = CAR_STATUS_MAP[status];
  } else if (type === 'payment' && PAYMENT_STATUS_MAP[status]) {
    config = PAYMENT_STATUS_MAP[status];
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5 shrink-0" />
      {children || config.label}
    </span>
  );
}
