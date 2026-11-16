import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  Star,
  Search,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  Car,
  User,
  FileSpreadsheet,
  Reply,
  CheckCircle2,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import { exportToCsv } from '../../utils/exportExcel';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastStore();

  const loadReviews = () => {
    const list = storageService.getReviews();
    const formatted = list.map((r) => ({
      ...r,
      date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : r.date || '2026-10-25',
      isVisible: r.isVisible !== undefined ? r.isVisible : true,
    }));
    setReviews(formatted);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleVisible = (id) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, isVisible: !r.isVisible } : r));
    setReviews(updated);
    toast.success('Đã cập nhật trạng thái hiển thị đánh giá');
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      const updated = reviews.filter((r) => r.id !== id);
      setReviews(updated);
      toast.success('Đã xóa đánh giá thành công');
    }
  };

  const handleOpenReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || `Cảm ơn quý khách ${review.customerName} đã tin tưởng và sử dụng dịch vụ của AutoRental!`);
    setIsReplyModalOpen(true);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setIsSubmitting(true);
    try {
      await storageService.replyReview(selectedReview.id, replyText);
      toast.success('Đã gửi phản hồi đánh giá của khách hàng thành công!');
      setIsReplyModalOpen(false);
      loadReviews();
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi phản hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { key: '_index', label: 'STT' },
      { key: 'customerName', label: 'Khách hàng' },
      { key: 'carName', label: 'Phương tiện thuê' },
      { key: 'rating', label: 'Số sao (1-5)', formatter: (v) => `${v} sao` },
      { key: 'comment', label: 'Nội dung nhận xét' },
      { key: 'adminReply', label: 'Phản hồi từ Admin / CSKH' },
      { key: 'date', label: 'Ngày đánh giá' },
      {
        key: 'isVisible',
        label: 'Trạng thái hiển thị',
        formatter: (v) => (v ? 'Hiển thị' : 'Đang ẩn'),
      },
    ];

    const todayStr = new Date().toISOString().slice(0, 10);
    exportToCsv({
      filename: `Bao-cao-danh-gia-khach-hang-${todayStr}`,
      columns,
      data: filtered,
    });
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.carName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.adminReply?.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (ratingFilter === '5_STAR') return r.rating === 5;
    if (ratingFilter === '4_STAR') return r.rating === 4;
    if (ratingFilter === 'LOW_STAR') return r.rating < 4;
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '5.0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;
  const lowStarCount = reviews.filter((r) => r.rating < 4).length;
  const repliedCount = reviews.filter((r) => Boolean(r.adminReply)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Quản lý đánh giá của khách hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm duyệt nhận xét, chấm điểm sao phương tiện và phản hồi chăm sóc khách hàng 2 chiều
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
          >
            Xuất Excel ({filtered.length})
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm hài lòng TB</div>
          <div className="mt-1 text-2xl font-black text-amber-500 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dựa trên {reviews.length} đánh giá</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Đánh giá 5 sao</span>
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{fiveStarCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Rất hài lòng về xe & tài xế</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Đã phản hồi</span>
          </div>
          <div className="mt-1 text-2xl font-black text-blue-600">{repliedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tương tác CSKH chuyên nghiệp</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">Cần cải thiện (≤ 3★)</div>
          <div className="mt-1 text-2xl font-black text-rose-600">{lowStarCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cần liên hệ hỗ trợ riêng</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setRatingFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              ratingFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({reviews.length})
          </button>
          <button
            onClick={() => setRatingFilter('5_STAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              ratingFilter === '5_STAR' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            5 Sao ({fiveStarCount})
          </button>
          <button
            onClick={() => setRatingFilter('4_STAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              ratingFilter === '4_STAR' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            4 Sao ({fourStarCount})
          </button>
          <button
            onClick={() => setRatingFilter('LOW_STAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              ratingFilter === 'LOW_STAR' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1-3 Sao ({lowStarCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, tên xe, nội dung nhận xét..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Phương tiện</th>
                <th className="py-3.5 px-4">Số sao</th>
                <th className="py-3.5 px-4">Nội dung nhận xét & Phản hồi CSKH</th>
                <th className="py-3.5 px-4">Ngày đánh giá</th>
                <th className="py-3.5 px-4 text-center">Hiển thị</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không có đánh giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>{r.customerName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.carName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-md space-y-1.5">
                      <div className="text-slate-800 font-medium italic">"{r.comment}"</div>
                      {r.adminReply && (
                        <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-1.5">
                          <Reply className="w-3 h-3 text-blue-600 mt-0.5 shrink-0 transform -scale-x-100" />
                          <div>
                            <span className="font-bold text-blue-950 block">AutoRental CSKH:</span>
                            <span>{r.adminReply}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{r.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.isVisible ? 'Hiển thị' : 'Đang ẩn'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReply(r)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Phản hồi đánh giá"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVisible(r.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title={r.isVisible ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}
                        >
                          {r.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phản Hồi Đánh Giá */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title={`Phản hồi đánh giá của khách hàng: ${selectedReview?.customerName}`}
      >
        {selectedReview && (
          <form onSubmit={handleSubmitReply} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedReview.customerName}</span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-slate-500 text-xs">Phương tiện: {selectedReview.carName}</div>
              <p className="text-slate-700 italic pt-1">"{selectedReview.comment}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung phản hồi chính thức từ Ban Quản Trị / CSKH *
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                placeholder="Nhập lời cảm ơn hoặc giải đáp thắc mắc của khách..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsReplyModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
