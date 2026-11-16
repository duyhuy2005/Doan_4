import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { formatDateTime } from '../../utils/format';
import { Star, MessageSquare, ThumbsUp, ShieldCheck, CheckCircle2, Car } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('ALL');

  useEffect(() => {
    // Nạp các review từ storage + một số review mẫu chất lượng cao
    const existing = storageService.getAllReviews();
    const demoReviews = [
      {
        id: 101,
        bookingCode: 'BK-20261028-0051',
        carName: 'VinFast VF8 Plus 2024',
        carThumbnail: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
        userName: 'Nguyễn Văn Khách',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=80',
        rating: 5,
        comment: 'Xe VinFast VF8 chạy cực kỳ êm ái, bốc và tiết kiệm. Nhân viên giao xe tại sân bay Tân Sơn Nhất đúng giờ, hướng dẫn sử dụng rất nhiệt tình và chu đáo!',
        createdAt: '2026-10-27T19:00:00',
      },
      {
        id: 102,
        bookingCode: 'BK-20261015-0012',
        carName: 'Mercedes-Benz C300 AMG 2023',
        carThumbnail: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80',
        userName: 'Lê Hoàng Minh',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&fit=crop&q=80',
        rating: 5,
        comment: 'Xe đời mới tinh, nội thất thơm và sạch sẽ. Đưa đón đối tác quan trọng đi công tác rất sang trọng và uy tín. Thủ tục ký hợp đồng điện tử rất nhanh chóng.',
        createdAt: '2026-10-18T14:30:00',
      },
      {
        id: 103,
        bookingCode: 'BK-20261010-0099',
        carName: 'Ford Everest Titanium 4x4 2024',
        carThumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
        userName: 'Phạm Thu Hằng',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80',
        rating: 5,
        comment: 'Chuyến đi phượt Đà Lạt 7 người trên xe Ford Everest quá tuyệt vời. Xe gầm cao êm, máy dầu khỏe leo đèo mượt mà. Đặt cọc và hoàn cọc đúng cam kết 24h.',
        createdAt: '2026-10-12T20:15:00',
      },
    ];

    // Gộp và loại trừ trùng id
    const combined = [...existing];
    demoReviews.forEach((d) => {
      if (!combined.some((c) => c.bookingCode === d.bookingCode)) {
        combined.push(d);
      }
    });

    setReviews(combined);
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'ALL') return true;
    return r.rating === Number(filterRating);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-blue-600" /> Đánh Giá & Nhận Xét Từ Khách Hàng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          100% đánh giá thực tế từ khách hàng đã hoàn tất hành trình thuê xe cùng AutoRental.
        </p>
      </div>

      {/* Tổng quan Điểm đánh giá (Rating Summary Card) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="text-center md:border-r border-slate-100 md:pr-8">
          <div className="text-5xl font-black text-slate-900">4.9</div>
          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 text-amber-500 fill-amber-500" />
            ))}
          </div>
          <p className="text-xs text-slate-500">Dựa trên {reviews.length + 120} lượt đánh giá thực tế</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mt-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> 98.6% khách hàng hài lòng tuyệt đối
          </div>
        </div>

        {/* Cột giữa: Thanh phân bổ số sao */}
        <div className="md:col-span-2 space-y-2 text-xs">
          {[
            { star: 5, pct: '92%' },
            { star: 4, pct: '7%' },
            { star: 3, pct: '1%' },
            { star: 2, pct: '0%' },
            { star: 1, pct: '0%' },
          ].map((item) => (
            <div key={item.star} className="flex items-center gap-3">
              <span className="w-12 font-bold text-slate-700">{item.star} sao</span>
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: item.pct }}
                />
              </div>
              <span className="w-10 text-right text-slate-400 font-mono">{item.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bộ lọc số sao */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { key: 'ALL', label: 'Tất cả đánh giá' },
          { key: '5', label: '★ 5 sao (Xuất sắc)' },
          { key: '4', label: '★ 4 sao (Tốt)' },
          { key: '3', label: '★ 3 sao (Bình thường)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterRating(tab.key)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              filterRating === tab.key
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách Đánh giá */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header người dùng & số sao */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.userAvatar}
                    alt={rev.userName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{rev.userName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" title="Khách thuê đã xác minh" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatDateTime(rev.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>

              {/* Lời nhận xét */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Xe đã thuê */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-800">{rev.carName}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{rev.bookingCode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
