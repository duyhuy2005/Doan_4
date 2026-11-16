import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

export const JOURNEY_STEPS = [
  { id: 1, key: 'SEARCH', label: '1. Tìm xe', path: '/cars' },
  { id: 2, key: 'DETAIL', label: '2. Chi tiết xe', path: null },
  { id: 3, key: 'BOOKING', label: '3. Đặt xe', path: null },
  { id: 4, key: 'PAYMENT', label: '4. Thanh toán cọc', path: '/payment' },
  { id: 5, key: 'CONTRACT', label: '5. Ký hợp đồng', path: '/contract' },
  { id: 6, key: 'PICKUP', label: '6. Nhận xe', path: '/pickup' },
  { id: 7, key: 'TRACKING', label: '7. Theo dõi thuê', path: '/tracking' },
  { id: 8, key: 'RETURN', label: '8. Trả xe', path: '/return' },
  { id: 9, key: 'SETTLEMENT', label: '9. Chốt hóa đơn', path: '/settlement' },
  { id: 10, key: 'REFUND', label: '10. Hoàn cọc', path: '/refund' },
  { id: 11, key: 'REVIEW', label: '11. Đánh giá', path: '/review-trip' },
];

export default function JourneyStepper({ currentStepId = 1, bookingId = null }) {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs overflow-x-auto">
      <div className="flex items-center min-w-max gap-1 sm:gap-2">
        {JOURNEY_STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStepId;
          const isCurrent = step.id === currentStepId;
          const isFuture = step.id > currentStepId;

          // Tạo link điều hướng nếu có bookingId và bước này đã hoàn thành hoặc hiện tại
          let linkPath = null;
          if (bookingId && step.path) {
            if (step.id >= 4) {
              linkPath = `${step.path}/${bookingId}`;
            } else if (step.id === 1) {
              linkPath = '/cars';
            }
          }

          const content = (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : isCurrent
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-200'
                  : 'bg-slate-50 text-slate-400 border border-slate-200/60'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-white text-blue-600 font-black'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
              </span>
              <span>{step.label.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );

          return (
            <React.Fragment key={step.id}>
              {linkPath && isCompleted ? (
                <Link to={linkPath} className="cursor-pointer">
                  {content}
                </Link>
              ) : (
                <div>{content}</div>
              )}
              {idx < JOURNEY_STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
