import React from 'react';
import { Car, SearchX, Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'Không tìm thấy dữ liệu',
  description = 'Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.',
  icon: Icon = SearchX,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
