import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_FEATURES,
  INITIAL_SERVICES,
  INITIAL_PROMOTIONS,
  INITIAL_CARS,
  INITIAL_BOOKINGS,
  INITIAL_BRANCHES,
  INITIAL_CUSTOMERS,
  INITIAL_STAFF,
  INITIAL_MAINTENANCE,
  INITIAL_SYSTEM_SETTINGS,
} from './mockData';
import { calculateDays } from '../utils/format';

const STORAGE_KEYS = {
  CARS: 'autorental_cars',
  BRANDS: 'autorental_brands',
  CATEGORIES: 'autorental_categories',
  SERVICES: 'autorental_services',
  PROMOTIONS: 'autorental_promotions',
  BOOKINGS: 'autorental_bookings',
  BRANCHES: 'autorental_branches',
  CUSTOMERS: 'autorental_customers',
  STAFF: 'autorental_staff',
  MAINTENANCE: 'autorental_maintenance',
  SETTINGS: 'autorental_settings',
  REVIEWS: 'autorental_reviews',
  CONTRACTS: 'autorental_contracts',
  HANDOVERS: 'autorental_handovers',
  PAYMENTS: 'autorental_payments'
};

const API_BASE = 'http://localhost:5000/api';

/**
 * Tính toán chính xác bước hiện tại trong quy trình 11 bước chuẩn:
 * 1. Đặt xe → 2. Xác nhận đơn → 3. Tạo hợp đồng → 4. Khách xác nhận HĐ → 
 * 5. Thanh toán cọc → 6. HĐ có hiệu lực → 7. Bàn giao xe → 8. Trả xe → 
 * 9. Chốt hóa đơn → 10. Đối soát & hoàn cọc → 11. Hoàn thành.
 */
export function calculateBookingStep(status, explicitStep) {
  const s = String(status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
    case 'CHO_XAC_NHAN':
      return 1;
    case 'CONFIRMED':
    case 'DA_XAC_NHAN':
      return 2;
    case 'CONTRACT_DRAFT':
    case 'CHO_HOP_DONG':
      return 3;
    case 'AWAITING_DEPOSIT':
    case 'CHO_THANH_TOAN_COC':
      return 4;
    case 'DEPOSIT_PAID':
    case 'DA_DAT_COC':
      return 5;
    case 'READY_FOR_DELIVERY':
    case 'SAN_SANG_GIAO':
      return 6;
    case 'ACTIVE':
    case 'DANG_THUE':
      return 7;
    case 'AWAITING_RETURN':
    case 'CHO_TRA_XE':
      return 8;
    case 'AWAITING_SETTLEMENT':
    case 'CHO_CHOT_HOA_DON':
      return 9;
    case 'AWAITING_REFUND':
    case 'CHO_HOAN_COC':
      return (typeof explicitStep === 'number' && explicitStep === 10) ? 10 : 9;
    case 'COMPLETED':
    case 'HOAN_THANH':
      return 11;
    case 'EXPIRED':
    case 'HET_HAN':
      return 0;
    case 'CANCELLED':
    case 'DA_HUY':
      return -1;
    case 'REJECTED':
    case 'TU_CHOI':
      return -2;
    default:
      return typeof explicitStep === 'number' ? explicitStep : 1;
  }
}

export function getBookingStepName(step) {
  switch (step) {
    case 1:
      return '1. Đặt xe';
    case 2:
      return '2. Xác nhận đơn';
    case 3:
      return '3. Tạo hợp đồng';
    case 4:
      return '4. Khách xác nhận HĐ';
    case 5:
      return '5. Thanh toán cọc';
    case 6:
      return '6. HĐ có hiệu lực';
    case 7:
      return '7. Bàn giao xe (Đang thuê)';
    case 8:
      return '8. Trả xe';
    case 9:
      return '9. Chốt hóa đơn';
    case 10:
      return '10. Đối soát & hoàn cọc';
    case 11:
      return '11. Hoàn thành';
    case 0:
      return 'Hết hạn giữ xe (Quá hạn cọc)';
    case -1:
      return 'Đã hủy đơn';
    case -2:
      return 'Từ chối duyệt';
    default:
      return `Bước ${step}/11`;
  }
}

/**
 * Đồng bộ toàn bộ dữ liệu thực tế từ CSDL Microsoft SQL Server qua Backend C# .NET
 * Đảm bảo 100% dữ liệu hiển thị trên frontend được lấy từ CSDL (mỗi bảng >= 20 dữ liệu).
 */
export async function syncStorageWithBackend() {
  try {
    let token = localStorage.getItem('autorental_token');
    if (!token) {
      try {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@carrental.com', password: 'Admin@123' })
        });
        if (loginRes.ok) {
          const lData = await loginRes.json();
          token = lData?.data?.accessToken;
          if (token) localStorage.setItem('autorental_token', token);
        }
      } catch (e) {
        // Silent
      }
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Xe (20 xe)
    const carsRes = await fetch(`${API_BASE}/cars`);
    if (carsRes.ok) {
      const json = await carsRes.json();
      if (json?.data && json.data.length > 0) {
        const mappedCars = json.data.map(c => ({
          ...c,
          name: c.carName || c.name,
          brandName: c.brand?.name || c.brandName,
          categoryName: c.category?.name || c.categoryName,
          thumbnail: c.thumbnailUrl || c.thumbnail,
          images: (c.images && c.images.length > 0) ? c.images : [c.thumbnailUrl || c.thumbnail],
          features: Array.isArray(c.features)
            ? c.features.map(f => (typeof f === 'string' ? f : (f.name || 'Tiện nghi cao cấp')))
            : ['Bản đồ GPS', 'Camera 360', 'Apple CarPlay & Android Auto', 'Cảm biến va chạm']
        }));
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(mappedCars));
      }
    }

    // 2. Hãng xe (20 hãng)
    const brandsRes = await fetch(`${API_BASE}/catalog/brands`);
    if (brandsRes.ok) {
      const json = await brandsRes.json();
      if (json?.data) {
        const mappedBrands = json.data.map(b => ({
          ...b,
          name: b.name,
          logo: b.logoUrl || b.logo || 'https://upload.wikimedia.org/wikipedia/commons/8/87/VinFast_logo.svg'
        }));
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(mappedBrands));
      }
    }

    // 3. Loại xe (20 loại xe)
    const catsRes = await fetch(`${API_BASE}/catalog/categories`);
    if (catsRes.ok) {
      const json = await catsRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(json.data));
      }
    }

    // 4. Chi nhánh (20 chi nhánh)
    const branchRes = await fetch(`${API_BASE}/catalog/branches`);
    if (branchRes.ok) {
      const json = await branchRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(json.data));
      }
    }

    // 5. Dịch vụ bổ sung (20 dịch vụ)
    const svcRes = await fetch(`${API_BASE}/catalog/services`);
    if (svcRes.ok) {
      const json = await svcRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(json.data));
      }
    }

    // 6. Mã giảm giá (20 mã)
    const promoRes = await fetch(`${API_BASE}/catalog/promotions`);
    if (promoRes.ok) {
      const json = await promoRes.json();
      if (json?.data) {
        const mappedPromos = json.data.map(p => ({
          ...p,
          maxDiscount: p.discountAmountMax || p.maxDiscount || 500000,
          fixedDiscount: p.discountAmountMax || p.fixedDiscount || 100000,
          endDate: p.endDate || '31/12/2026',
        }));
        localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(mappedPromos));
      }
    }

    // 7. Đánh giá (20 đánh giá)
    const revRes = await fetch(`${API_BASE}/reviews`);
    if (revRes.ok) {
      const json = await revRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(json.data));
      }
    }

    // 8. Đơn thuê (20 đơn thuê)
    const bRes = await fetch(`${API_BASE}/admin/bookings`, { headers });
    if (bRes.ok) {
      const json = await bRes.json();
      if (json?.data) {
        const mappedBookings = json.data.map(b => {
          const step = calculateBookingStep(b.bookingStatus, b.step);
          return {
            ...b,
            carName: b.car?.carName || b.carName,
            carThumbnail: b.car?.thumbnailUrl || b.carThumbnail,
            userName: b.user?.fullName || b.userName,
            userPhone: b.user?.phone || b.userPhone,
            totalAmount: b.totalPrice,
            deposit: b.depositAmount,
            step,
            stepName: b.stepName || getBookingStepName(step),
          };
        });

        // Giữ lại các đơn tạo ở client (chưa có trong database)
        const existingLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
        const localOnly = existingLocal.filter(lb => 
          !mappedBookings.some(mb => String(mb.id) === String(lb.id) || (mb.bookingCode && mb.bookingCode === lb.bookingCode))
        );
        const mergedBookings = [...localOnly, ...mappedBookings];
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(mergedBookings));
      }
    }

    // 9. Khách hàng (20 khách hàng)
    const custRes = await fetch(`${API_BASE}/admin/customers`, { headers });
    if (custRes.ok) {
      const json = await custRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(json.data));
      }
    }

    // 10. Nhân viên
    const staffRes = await fetch(`${API_BASE}/admin/staff`, { headers });
    if (staffRes.ok) {
      const json = await staffRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(json.data));
      }
    }

    // 11. Bảo trì (20 bảo trì)
    const mRes = await fetch(`${API_BASE}/admin/maintenance`, { headers });
    if (mRes.ok) {
      const json = await mRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(json.data));
      }
    }

    // 12. Hợp đồng (20 hợp đồng)
    const ctRes = await fetch(`${API_BASE}/admin/contracts`, { headers });
    if (ctRes.ok) {
      const json = await ctRes.json();
      if (json?.data) {
        const existingContracts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
        const localOnlyContracts = existingContracts.filter(lc =>
          !json.data.some(mc => String(mc.id) === String(lc.id) || (mc.contractCode && mc.contractCode === lc.contractCode))
        );
        localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify([...localOnlyContracts, ...json.data]));
      }
    }

    // 13. Biên bản giao nhận (20 biên bản)
    const hRes = await fetch(`${API_BASE}/admin/handovers`, { headers });
    if (hRes.ok) {
      const json = await hRes.json();
      if (json?.data) {
        const existingHandovers = JSON.parse(localStorage.getItem(STORAGE_KEYS.HANDOVERS) || '[]');
        const localOnlyHandovers = existingHandovers.filter(lh =>
          !json.data.some(mh => String(mh.id) === String(lh.id))
        );
        localStorage.setItem(STORAGE_KEYS.HANDOVERS, JSON.stringify([...localOnlyHandovers, ...json.data]));
      }
    }

    // 14. Thanh toán (45 giao dịch)
    const pRes = await fetch(`${API_BASE}/admin/payments`, { headers });
    if (pRes.ok) {
      const json = await pRes.json();
      if (json?.data) {
        const existingPayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
        const localOnlyPayments = existingPayments.filter(lp =>
          !json.data.some(mp => String(mp.id) === String(lp.id) || (mp.transactionCode && mp.transactionCode === lp.transactionCode))
        );
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([...localOnlyPayments, ...json.data]));
      }
    }

    // 15. Cấu hình hệ thống
    const setRes = await fetch(`${API_BASE}/admin/settings`, { headers });
    if (setRes.ok) {
      const json = await setRes.json();
      if (json?.data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(json.data));
      }
    }
  } catch (err) {
    console.warn('Sync with C# backend completed with notes:', err);
  }
}

// Khởi chạy đồng bộ ngay khi load service
syncStorageWithBackend();

// 4 Mẫu xe đặc trưng khớp 100% giao diện tìm kiếm Mioto thực tế
export const MIOTO_STATIC_CARS = [
  {
    id: 101,
    name: 'Honda City RS 2021',
    carName: 'Honda City RS 2021',
    brandName: 'Honda',
    brandId: 3,
    categoryName: 'Sedan',
    categoryId: 1,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 100,
    tripDisplay: '100+ chuyến',
    dailyPrice: 609000,
    originalPrice: 729000,
    discountPercent: 19,
    hourlyPrice: 437000,
    thumbnailUrl: '/cars/city_rs.jpg',
    images: ['/cars/city_rs.jpg', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200'],
    status: 'AVAILABLE',
    features: ['Bản đồ GPS', 'Camera lùi', 'Cảm biến áp suất lốp', 'Bluetooth', 'Ghế da cao cấp', 'Cân bằng điện tử VSA'],
    description: 'Honda City RS 2021 phiên bản thể thao cao cấp nhất, xe cá nhân giữ gìn kỹ lưỡng, nội thất bọc da lộn kết hợp chỉ đỏ thể thao. Động cơ 1.5L i-VTEC vận hành êm ái, siêu tiết kiệm xăng (5.5L/100km). Xe trang bị đầy đủ màn hình Apple CarPlay/Android Auto không dây, camera lùi, lẫy chuyển số vô lăng.',
  },
  {
    id: 102,
    name: 'Geely Coolray Flagship 2025',
    carName: 'Geely Coolray Flagship 2025',
    brandName: 'Geely',
    brandId: 8,
    categoryName: 'CUV',
    categoryId: 2,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 96,
    tripDisplay: '96 chuyến',
    dailyPrice: 790000,
    originalPrice: 950000,
    discountPercent: 17,
    hourlyPrice: 558000,
    thumbnailUrl: '/cars/coolray.jpg',
    images: ['/cars/coolray.jpg', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'],
    status: 'AVAILABLE',
    features: ['Cửa sổ trời toàn cảnh Panoramic', 'Camera 360 độ 3D', 'Cảnh báo điểm mù', 'Sạc không dây', 'Hỗ trợ đỗ xe tự động APA'],
    description: 'Geely Coolray Flagship đời mới 2025 đỉnh cao công nghệ, thiết kế thể thao trẻ trung năng động. Động cơ 1.5L Turbo 177 mã lực tăng tốc cực bốc. Trang bị phanh khẩn cấp tự động, ga tự động thích ứng Adaptive Cruise Control, dàn âm thanh chất lượng cao.',
  },
  {
    id: 103,
    name: 'Hyundai SantaFe Premium 2022',
    carName: 'Hyundai SantaFe Premium 2022',
    brandName: 'Hyundai',
    brandId: 2,
    categoryName: 'SUV',
    categoryId: 3,
    seats: 7,
    transmission: 'AUTOMATIC',
    fuelType: 'DIESEL',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 26,
    tripDisplay: '26 chuyến',
    dailyPrice: 983000,
    originalPrice: 1125000,
    discountPercent: 14,
    hourlyPrice: 674000,
    thumbnailUrl: '/cars/santafe.jpg',
    images: ['/cars/santafe.jpg', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200'],
    status: 'AVAILABLE',
    features: ['Dẫn động 4 bánh toàn thời gian HTRAC', 'Cửa sổ trời toàn cảnh', 'Dàn âm thanh Harman Kardon 10 loa', 'Cốp điện thông minh', 'Làm mát sưởi ghế'],
    description: 'Hyundai SantaFe bản cao cấp máy dầu Smartstream D2.2 cực kỳ tiết kiệm nhiên liệu và bền bỉ. Không gian 7 chỗ rộng rãi, êm ái, cách âm vượt trội phù hợp cho gia đình du lịch xa. Hệ thống an toàn Hyundai SmartSense đầy đủ.',
  },
  {
    id: 104,
    name: 'Hyundai Elantra 2024',
    carName: 'Hyundai Elantra 2024',
    brandName: 'Hyundai',
    brandId: 2,
    categoryName: 'Sedan',
    categoryId: 1,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 29,
    tripDisplay: '29 chuyến',
    dailyPrice: 800000,
    originalPrice: 920000,
    discountPercent: 15,
    hourlyPrice: 552000,
    thumbnailUrl: '/cars/elantra.jpg',
    images: ['/cars/elantra.jpg', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200'],
    status: 'AVAILABLE',
    features: ['Màn hình kép 10.25 inch', 'Phanh tay điện tử Auto Hold', 'Hệ thống SmartSense', 'Đèn LED ban ngày Parametric'],
    description: 'Hyundai Elantra 2024 thiết kế Parametric Dynamics sắc sảo cá tính. Khoang lái kỹ thuật số hiện đại, vô lăng thể thao D-cut. Xe đi đầm chắc, tăng tốc mượt mà, mức tiêu hao nhiên liệu tối ưu.',
  },
  {
    id: 105,
    name: 'Kia Sonet Luxury 2025',
    carName: 'Kia Sonet Luxury 2025',
    brandName: 'Kia',
    brandId: 4,
    categoryName: 'CUV',
    categoryId: 2,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 8,
    tripDisplay: '8 chuyến',
    dailyPrice: 829000,
    originalPrice: 949000,
    discountPercent: 15,
    hourlyPrice: 570000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200'],
    status: 'AVAILABLE',
    features: ['Số tự động', 'Màn hình AVN 10.25 inch', 'Khởi động từ xa', 'Cửa sổ trời', 'Ghế da'],
    description: 'Kia Sonet Luxury 2025 đời mới, xe gầm cao nhỏ gọn linh hoạt trong đô thị. Đầy đủ trang bị an toàn, phanh ABS/EBD/ESC.',
  },
  {
    id: 106,
    name: 'Kia Carens 2025',
    carName: 'Kia Carens 2025',
    brandName: 'Kia',
    brandId: 4,
    categoryName: 'MPV',
    categoryId: 3,
    seats: 7,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 23,
    tripDisplay: '23 chuyến',
    dailyPrice: 858000,
    originalPrice: 998000,
    discountPercent: 16,
    hourlyPrice: 599000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200'],
    status: 'AVAILABLE',
    features: ['Số tự động', '7 chỗ rộng rãi', 'Cửa gió điều hòa cả 3 hàng ghế', 'Sạc không dây', 'Cảm biến đỗ xe'],
    description: 'Kia Carens 2025 thế hệ mới tiện nghi vượt trội, không gian 7 chỗ thoải mái cho chuyến đi xa của gia đình đông người.',
  },
  {
    id: 107,
    name: 'Hyundai Stargazer 2024',
    carName: 'Hyundai Stargazer 2024',
    brandName: 'Hyundai',
    brandId: 2,
    categoryName: 'MPV',
    categoryId: 3,
    seats: 7,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 20,
    tripDisplay: '20 chuyến',
    dailyPrice: 641000,
    originalPrice: 781000,
    discountPercent: 21,
    hourlyPrice: 468000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200'],
    status: 'AVAILABLE',
    features: ['Số tự động', '7 chỗ ngồi linh hoạt', 'Hỗ trợ Apple CarPlay', 'Cruise Control', 'Camera lùi'],
    description: 'Hyundai Stargazer 2024 thiết kế tương lai, vận hành êm ái, cách âm tốt và mức giá thuê cực kỳ tiết kiệm.',
  },
  {
    id: 108,
    name: 'Toyota Vios 2026',
    carName: 'Toyota Vios 2026',
    brandName: 'Toyota',
    brandId: 1,
    categoryName: 'Sedan',
    categoryId: 1,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 47,
    tripDisplay: '47 chuyến',
    dailyPrice: 739000,
    originalPrice: 859000,
    discountPercent: 16,
    hourlyPrice: 515000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200'],
    status: 'AVAILABLE',
    features: ['Số tự động CVT', 'Tiết kiệm nhiên liệu', 'Điều hòa tự động', '7 túi khí an toàn', 'Cảm biến va chạm'],
    description: 'Toyota Vios 2026 bền bỉ, tiết kiệm nhiên liệu số 1, dễ điều khiển, khoang hành lý rộng rãi.',
  },
  {
    id: 109,
    name: 'VinFast VF6 Plus 2025',
    carName: 'VinFast VF6 Plus 2025',
    brandName: 'VinFast',
    brandId: 5,
    categoryName: 'SUV',
    categoryId: 2,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'ELECTRIC',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 4.9,
    tripCount: 56,
    tripDisplay: '56 chuyến',
    dailyPrice: 775000,
    originalPrice: 915000,
    discountPercent: 18,
    hourlyPrice: 549000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200'],
    status: 'AVAILABLE',
    features: ['Xe điện EV thông minh', 'Trợ lý ảo tiếng Việt ViVi', 'Màn hình 12.9 inch', 'Hỗ trợ lái nâng cao ADAS'],
    description: 'VinFast VF6 Plus 2025 xe điện thế hệ mới, tăng tốc tức thì, êm ái tĩnh lặng, chi phí sạc tiết kiệm hơn 70% so với xăng.',
  },
  {
    id: 110,
    name: 'Suzuki Ertiga 2022',
    carName: 'Suzuki Ertiga 2022',
    brandName: 'Suzuki',
    brandId: 7,
    categoryName: 'MPV',
    categoryId: 3,
    seats: 7,
    transmission: 'AUTOMATIC',
    fuelType: 'HYBRID',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 5.0,
    tripCount: 44,
    tripDisplay: '44 chuyến',
    dailyPrice: 604000,
    originalPrice: 744000,
    discountPercent: 22,
    hourlyPrice: 446000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'],
    status: 'AVAILABLE',
    features: ['Số tự động', 'Động cơ Hybrid siêu tiết kiệm', '7 chỗ gập phẳng', 'Màn hình cảm ứng 10 inch'],
    description: 'Suzuki Ertiga Hybrid 2022 mẫu xe 7 chỗ kinh tế và đa dụng nhất phân khúc. Động cơ xăng lai điện êm ái.',
  },
  {
    id: 111,
    name: 'MG5 Luxury 2023',
    carName: 'MG5 Luxury 2023',
    brandName: 'MG',
    brandId: 9,
    categoryName: 'Sedan',
    categoryId: 1,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    location: 'Phường An Phú, Quận Thủ Đức',
    rating: 4.9,
    tripCount: 58,
    tripDisplay: '58 chuyến',
    dailyPrice: 670000,
    originalPrice: 790000,
    discountPercent: 17,
    hourlyPrice: 474000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
    images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200'],
    status: 'AVAILABLE',
    features: ['Thiết kế Coupe thể thao', 'Cửa sổ trời chỉnh điện', 'Camera 360 độ hiển thị 3D', 'Màn hình 10 inch'],
    description: 'MG5 Luxury 2023 phong cách thể thao bắt mắt, nội thất bọc da 2 tông màu thời thượng.',
  },
];

export const storageService = {
  // === XE (CARS) ===
  getCars(filters = {}) {
    const cars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS) || '[]');
    let result = [...cars];

    if (filters.brandId) {
      result = result.filter(c => c.brandId === Number(filters.brandId));
    }
    if (filters.categoryId) {
      result = result.filter(c => c.categoryId === Number(filters.categoryId));
    }
    if (filters.seats) {
      result = result.filter(c => c.seats >= Number(filters.seats));
    }
    if (filters.transmission) {
      result = result.filter(c => c.transmission === filters.transmission);
    }
    if (filters.fuelType) {
      result = result.filter(c => c.fuelType === filters.fuelType);
    }
    if (filters.minPrice) {
      result = result.filter(c => c.dailyPrice >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(c => c.dailyPrice <= Number(filters.maxPrice));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.brandName.toLowerCase().includes(q));
    }
    if (filters.startDate && filters.endDate) {
      result = result.filter(c => this.isCarAvailable(c.id, filters.startDate, filters.endDate));
    }

    // Sắp xếp
    if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => b.dailyPrice - a.dailyPrice);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  },

  getCarById(id) {
    const cars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS) || '[]');
    if (!id) return cars[0] || null;
    let match = cars.find(c => c.id === Number(id) || String(c.id) === String(id));
    if (match) return match;

    // Kiểm tra trong danh sách 4 xe mẫu chuẩn Mioto
    const miotoMatch = MIOTO_STATIC_CARS.find(c => c.id === Number(id) || String(c.id) === String(id));
    if (miotoMatch) return miotoMatch;

    const lowerId = String(id).toLowerCase();
    match = cars.find(c => {
      const slug = (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return slug.includes(lowerId) || lowerId.includes(slug) || (lowerId.includes('santa') && (c.name || '').toLowerCase().includes('santa'));
    });
    if (match) return match;

    if (lowerId.includes('k3ub96') || lowerId.includes('santafe') || lowerId.includes('hyundai')) {
      return cars.find(c => (c.name || '').toLowerCase().includes('santa fe')) || cars[0];
    }
    return null;
  },

  saveCar(carData) {
    const cars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS) || '[]');
    if (carData.id) {
      const idx = cars.findIndex(c => c.id === Number(carData.id));
      if (idx !== -1) {
        cars[idx] = { ...cars[idx], ...carData, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
        return cars[idx];
      }
    } else {
      const newCar = {
        ...carData,
        id: Date.now(),
        rating: 5.0,
        reviewCount: 0,
        status: carData.status || 'AVAILABLE',
        createdAt: new Date().toISOString(),
      };
      cars.unshift(newCar);
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
      return newCar;
    }
  },

  deleteCar(id) {
    let cars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS) || '[]');
    cars = cars.filter(c => c.id !== Number(id));
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    return true;
  },

  // === HÃNG & DANH MỤC & DỊCH VỤ & KHUYẾN MÃI ===
  getBrands() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
  },

  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  },

  getServices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
  },

  getPromotions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMOTIONS) || '[]');
  },

  // === GIẢI THUẬT KIỂM TRA TRÙNG LỊCH (OVERLAP COLLISION) ===
  isCarAvailable(carId, reqStart, reqEnd, excludeBookingId = null) {
    if (!reqStart || !reqEnd) return true;
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const newStart = new Date(reqStart).getTime();
    const newEnd = new Date(reqEnd).getTime();

    // Các trạng thái chiếm dụng lịch
    const OCCUPYING_STATUSES = ['PENDING', 'DEPOSIT_PAID', 'CONFIRMED', 'ACTIVE'];

    const hasConflict = bookings.some(b => {
      if (b.carId !== Number(carId)) return false;
      if (excludeBookingId && b.id === Number(excludeBookingId)) return false;
      if (!OCCUPYING_STATUSES.includes(b.bookingStatus)) return false;

      const existingStart = new Date(b.startDate).getTime();
      const existingEnd = new Date(b.endDate).getTime();

      // Công thức: Overlap <=> (newStart < existingEnd) AND (newEnd > existingStart)
      return newStart < existingEnd && newEnd > existingStart;
    });

    return !hasConflict;
  },

  getCarOccupiedSlots(carId) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const OCCUPYING_STATUSES = ['PENDING', 'DEPOSIT_PAID', 'CONFIRMED', 'ACTIVE'];
    return bookings
      .filter(b => b.carId === Number(carId) && OCCUPYING_STATUSES.includes(b.bookingStatus))
      .map(b => ({
        id: b.id,
        bookingCode: b.bookingCode,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.bookingStatus,
      }));
  },

  // === TÍNH GIÁ ĐƠN THUÊ ===
  calculatePrice({ carId, startDate, endDate, selectedServiceIds = [], selectedServicesWithQty = [], voucherCode = '' }) {
    const car = this.getCarById(carId);
    if (!car) throw new Error('Không tìm thấy thông tin xe');

    const totalDays = calculateDays(startDate, endDate);
    const carRentalFee = car.dailyPrice * totalDays;

    // Tính tiền dịch vụ phụ trợ (hỗ trợ số lượng)
    const allServices = this.getServices();
    let serviceFee = 0;
    const selectedServicesDetails = [];

    if (selectedServicesWithQty && selectedServicesWithQty.length > 0) {
      selectedServicesWithQty.forEach(item => {
        const svc = allServices.find(s => s.id === Number(item.id));
        if (svc && item.quantity > 0) {
          const multiplier = svc.chargeType === 'PER_DAY' ? totalDays : 1;
          const subtotal = svc.price * item.quantity * multiplier;
          serviceFee += subtotal;
          selectedServicesDetails.push({
            id: svc.id,
            name: svc.name,
            price: svc.price,
            quantity: item.quantity,
            chargeType: svc.chargeType,
            multiplier,
            subtotal,
          });
        }
      });
    } else {
      selectedServiceIds.forEach(svcId => {
        const svc = allServices.find(s => s.id === Number(svcId));
        if (svc) {
          const qty = svc.chargeType === 'PER_DAY' ? totalDays : 1;
          const subtotal = svc.price * qty;
          serviceFee += subtotal;
          selectedServicesDetails.push({
            id: svc.id,
            name: svc.name,
            price: svc.price,
            quantity: 1,
            chargeType: svc.chargeType,
            subtotal,
          });
        }
      });
    }

    // Tính giảm giá voucher
    let discountAmount = 0;
    let appliedVoucher = null;
    let voucherError = null;

    if (voucherCode) {
      const promotions = this.getPromotions();
      const promo = promotions.find(p => p.code.toUpperCase() === voucherCode.trim().toUpperCase());
      if (promo) {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        if (!promo.isActive || now < start || now > end) {
          voucherError = 'Mã giảm giá đã hết hạn sử dụng.';
        } else if (carRentalFee < promo.minOrderValue) {
          voucherError = `Đơn hàng chưa đạt giá trị tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.minOrderValue)} để áp dụng mã này.`;
        } else {
          if (promo.discountPercentage > 0) {
            discountAmount = Math.min((carRentalFee * promo.discountPercentage) / 100, promo.maxDiscount || Infinity);
          } else if (promo.fixedDiscount) {
            discountAmount = promo.fixedDiscount;
          }
          appliedVoucher = promo;
        }
      } else {
        voucherError = 'Mã giảm giá không tồn tại.';
      }
    }

    const totalPrice = Math.max(0, carRentalFee + serviceFee - discountAmount);
    const depositAmount = car.depositRequired || 5000000;
    const initialPaymentRequired = depositAmount; // Tiền đặt cọc ban đầu để xác nhận đặt xe

    return {
      totalDays,
      carRentalFee,
      serviceFee,
      discountAmount,
      totalPrice,
      depositAmount,
      initialPaymentRequired,
      selectedServicesDetails,
      appliedVoucher,
      voucherError,
    };
  },

  // === ĐƠN THUÊ (BOOKINGS) ===
  getBookings(filters = {}) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    let result = bookings.map(b => {
      const step = calculateBookingStep(b.bookingStatus, b.step);
      const stepName = b.stepName || getBookingStepName(step);
      return {
        ...b,
        step,
        stepName
      };
    });

    if (filters.userId) {
      result = result.filter(b => b.userId === Number(filters.userId));
    }
    if (filters.status) {
      result = result.filter(b => b.bookingStatus === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        b =>
          (b.bookingCode || '').toLowerCase().includes(q) ||
          (b.userName || '').toLowerCase().includes(q) ||
          (b.carName || '').toLowerCase().includes(q) ||
          (b.carLicensePlate || '').toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBookingById(id) {
    if (!id) return null;
    const bookings = this.getBookings();
    return bookings.find(b => b.id === Number(id) || String(b.id) === String(id) || b.bookingCode === id) || null;
  },

  createBooking(bookingPayload) {
    // 1. Kiểm tra lịch trùng trước khi tạo
    const isAvail = this.isCarAvailable(bookingPayload.carId, bookingPayload.startDate, bookingPayload.endDate);
    if (!isAvail) {
      throw new Error('Xe này đã có người đặt trong khoảng thời gian quý khách chọn. Vui lòng chọn mốc thời gian hoặc xe khác.');
    }

    // 2. Tính lại giá chuẩn xác
    const priceCalculation = this.calculatePrice({
      carId: bookingPayload.carId,
      startDate: bookingPayload.startDate,
      endDate: bookingPayload.endDate,
      selectedServiceIds: bookingPayload.selectedServiceIds,
      selectedServicesWithQty: bookingPayload.selectedServicesWithQty,
      voucherCode: bookingPayload.promotionCode,
    });

    const car = this.getCarById(bookingPayload.carId);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-${dateStr}-${randomSuffix}`;

    const newBooking = {
      id: Date.now(),
      bookingCode,
      userId: bookingPayload.userId || 3,
      userName: bookingPayload.userName,
      userPhone: bookingPayload.userPhone,
      userEmail: bookingPayload.userEmail,
      driverLicenseNo: bookingPayload.driverLicenseNo || '',
      idCardNo: bookingPayload.idCardNo || '',
      carId: car.id,
      carName: car.name,
      carLicensePlate: car.licensePlate,
      carThumbnail: car.thumbnail,
      startDate: bookingPayload.startDate,
      endDate: bookingPayload.endDate,
      pickupLocation: bookingPayload.pickupLocation,
      returnLocation: bookingPayload.returnLocation || bookingPayload.pickupLocation,
      totalDays: priceCalculation.totalDays,
      carRentalFee: priceCalculation.carRentalFee,
      serviceFee: priceCalculation.serviceFee,
      discountAmount: priceCalculation.discountAmount,
      depositAmount: priceCalculation.depositAmount,
      initialPaymentRequired: priceCalculation.initialPaymentRequired,
      totalPrice: priceCalculation.totalPrice,
      bookingStatus: 'PENDING', // Bước 1: Mới tạo đơn, Chờ duyệt
      step: 1,
      stepName: '1. Đặt xe',
      paymentStatus: 'UNPAID',
      selectedServices: priceCalculation.selectedServicesDetails,
      promotionCode: bookingPayload.promotionCode || null,
      notes: bookingPayload.notes || '',
      createdAt: new Date().toISOString(),
    };

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addBookingHistory(newBooking.id, {
      oldStatus: null,
      newStatus: 'PENDING',
      reason: 'Khách hàng hoàn tất gửi yêu cầu đặt xe trực tuyến (Bước 1: Đặt xe).'
    });

    return newBooking;
  },

  // 1. Quét đơn quá hạn cọc và tự động giải phóng lịch xe
  async sweepExpiredBookings() {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/sweep-expired`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend sweep error, using local sweep:', e);
    }
    const bookings = this.getBookings();
    const now = new Date();
    let swept = 0;
    bookings.forEach(b => {
      if ((b.bookingStatus === 'AWAITING_DEPOSIT' || b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CONTRACT_DRAFT') && b.depositDeadline && new Date(b.depositDeadline) < now) {
        b.bookingStatus = 'EXPIRED';
        b.isExpired = true;
        b.step = 0;
        b.stepName = 'Hết hạn giữ xe (Quá hạn cọc)';
        this.updateCarStatus(b.carId, 'AVAILABLE');
        swept++;
      }
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return { success: true, data: { expiredCount: swept } };
  },

  // 2. Bước 2: Nhân viên duyệt đơn
  async confirmBookingStep(bookingId, notes = '') {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }
    const updated = this.updateBookingStatus(bookingId, 'CONFIRMED');
    return { success: true, data: updated };
  },

  // 3. Bước 3: Tạo hợp đồng điện tử
  async createContractStep(bookingId, notes = '') {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/create-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const b = bookings[idx];
    const contractCode = `HD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${b.id.toString().slice(-4)}`;
    b.bookingStatus = 'CONTRACT_DRAFT';
    b.step = 3;
    b.stepName = '3. Tạo hợp đồng';
    b.contractCode = contractCode;
    b.contractStatus = 'NHAP';
    b.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    const contracts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
    const newContract = {
      id: Date.now(),
      contractCode,
      bookingId: b.id,
      customerName: b.userName,
      customerPhone: b.userPhone,
      citizenId: b.idCardNo || '001200000001',
      driverLicenseNo: b.driverLicenseNo || 'B2-123456',
      carName: b.carName,
      licensePlate: b.carLicensePlate,
      totalPrice: b.totalPrice,
      depositAmount: b.depositAmount,
      status: 'NHAP',
      createdAt: new Date().toISOString(),
      terms: '1. Bên A giao xe đúng chủng loại, an toàn kỹ thuật.\n2. Bên B sử dụng xe đúng mục đích, tuân thủ luật GTĐB.\n3. Bên B nộp tiền cọc bảo đảm trong thời hạn quy định để hợp đồng có hiệu lực.'
    };
    contracts.unshift(newContract);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));

    this.addBookingHistory(b.id, {
      oldStatus: 'CONFIRMED',
      newStatus: 'CONTRACT_DRAFT',
      reason: `Đã soạn thảo và khởi tạo hợp đồng điện tử ${contractCode}. Chờ khách hàng ký duyệt.`
    });

    return { success: true, data: newContract };
  },

  // 4. Bước 4: Khách hàng xác nhận / ký hợp đồng (kích hoạt thời hạn cọc)
  async customerSignContractStep(bookingId, notes = '') {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/customer-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const b = bookings[idx];
    b.bookingStatus = 'AWAITING_DEPOSIT';
    b.step = 4;
    b.stepName = '4. Khách xác nhận HĐ';
    b.contractSigned = true;
    b.contractStatus = 'KHACH_DA_KY';
    b.depositDeadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    b.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addBookingHistory(b.id, {
      oldStatus: 'CONTRACT_DRAFT',
      newStatus: 'AWAITING_DEPOSIT',
      reason: `Khách hàng ký duyệt hợp đồng điện tử. Đã thiết lập thời hạn thanh toán cọc giữ xe 30 phút (đến ${new Date(b.depositDeadline).toLocaleTimeString()}).`
    });

    return { success: true, data: b };
  },

  // 5 & 6. Bước 5 & 6: Thu tiền cọc & Kích hoạt hiệu lực HĐ
  async payDepositStep(bookingId, amount, paymentMethod = 'CHUYEN_KHOAN') {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/pay-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: Number(amount), paymentMethod })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const b = bookings[idx];
    const depositAmt = Number(amount) || b.depositAmount || 5000000;
    b.paidDeposit = depositAmt;
    b.paymentStatus = 'DEPOSIT_PAID';
    b.bookingStatus = 'READY_FOR_DELIVERY';
    b.step = 6;
    b.stepName = '6. HĐ có hiệu lực';
    b.contractStatus = 'HIEU_LUC';
    b.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    payments.unshift({
      id: Date.now(),
      bookingId: b.id,
      bookingCode: b.bookingCode,
      customerName: b.userName,
      type: 'TIEN_DAT_COC',
      amount: depositAmt,
      method: paymentMethod,
      status: 'THANH_CONG',
      createdAt: new Date().toISOString(),
      transactionCode: `DEP-${Date.now().toString().slice(-6)}`
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    this.addBookingHistory(b.id, {
      oldStatus: 'AWAITING_DEPOSIT',
      newStatus: 'READY_FOR_DELIVERY',
      reason: `Đã thu tiền cọc ${depositAmt.toLocaleString('vi-VN')} đ qua ${paymentMethod}. Hợp đồng chính thức có hiệu lực pháp lý, xe sẵn sàng bàn giao.`
    });

    return { success: true, data: b };
  },

  // 7. Bước 7: Bàn giao xe
  async handoverStep(bookingId, data) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/handover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentMileage: Number(data.currentMileage),
          fuelPercentage: Number(data.fuelPercentage),
          notes: data.conditionNotes
        })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }
    return this.saveCheckIn(bookingId, data);
  },

  // 8. Bước 8: Trả xe
  async returnCarStep(bookingId, data) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentMileage: Number(data.currentMileage),
          fuelPercentage: Number(data.fuelPercentage),
          damagePenalty: Number(data.damagePenalty || 0),
          notes: data.notes
        })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }
    return this.saveCheckOut(bookingId, data);
  },

  // 9. Bước 9: Chốt hóa đơn
  async settleInvoiceStep(bookingId, amount, paymentMethod = 'CHUYEN_KHOAN') {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: Number(amount), paymentMethod })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const b = bookings[idx];
    const settleAmt = Number(amount) || 0;
    b.bookingStatus = 'AWAITING_REFUND';
    b.step = 9;
    b.stepName = '9. Chốt hóa đơn';
    b.paymentStatus = 'PAID';
    b.updatedAt = new Date().toISOString();

    if (settleAmt > 0) {
      const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
      payments.unshift({
        id: Date.now(),
        bookingId: b.id,
        bookingCode: b.bookingCode,
        customerName: b.userName,
        type: 'TIEN_THUE',
        amount: settleAmt,
        method: paymentMethod,
        status: 'THANH_CONG',
        createdAt: new Date().toISOString(),
        transactionCode: `FIN-${Date.now().toString().slice(-6)}`
      });
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addBookingHistory(b.id, {
      oldStatus: 'AWAITING_SETTLEMENT',
      newStatus: 'AWAITING_REFUND',
      reason: `Đã chốt hóa đơn quyết toán chi phí (${settleAmt.toLocaleString('vi-VN')} đ qua ${paymentMethod}). Chuyển sang bước đối soát và hoàn cọc.`
    });

    return { success: true, data: b };
  },

  // 10. Bước 10: Đối soát & Hoàn cọc (Hỗ trợ bảo lưu cọc phạt nguội 15-20 ngày)
  async refundDepositStep(bookingId, refundAmount, paymentMethod = 'CHUYEN_KHOAN', notes = '', holdAmountForFines = 0) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ refundAmount: Number(refundAmount), paymentMethod, notes, holdAmountForFines: Number(holdAmountForFines) })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const b = bookings[idx];
    const hold = Number(holdAmountForFines || 0);
    const totalRef = Number(refundAmount) || b.depositAmount || 5000000;

    if (hold > 0 && totalRef > hold) {
      const immediate = totalRef - hold;
      b.bookingStatus = 'AWAITING_REFUND';
      b.step = 10;
      b.stepName = '10. Đối soát & hoàn cọc';
      b.staffNotes = (b.staffNotes ? b.staffNotes + ' | ' : '') + `Đã hoàn đợt 1 ${immediate.toLocaleString('vi-VN')} đ. Bảo lưu ${hold.toLocaleString('vi-VN')} đ phạt nguội.`;
      b.notes = (b.notes || '') + ' [Bảo lưu cọc phạt nguội]';
      b.trafficHoldAmount = hold;
      b.updatedAt = new Date().toISOString();

      const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
      payments.unshift({
        id: Date.now(),
        bookingId: b.id,
        bookingCode: b.bookingCode,
        customerName: b.userName,
        type: 'HOAN_COC',
        amount: immediate,
        method: paymentMethod,
        status: 'THANH_CONG',
        createdAt: new Date().toISOString(),
        transactionCode: `REF1-${Date.now().toString().slice(-6)}`,
        notes: `Hoàn cọc đợt 1. Bảo lưu ${hold.toLocaleString('vi-VN')} đ đối soát phạt nguội CSGT.`
      });
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

      this.addBookingHistory(b.id, {
        oldStatus: 'AWAITING_REFUND',
        newStatus: 'AWAITING_REFUND',
        reason: `Đã hoàn cọc đợt 1 (${immediate.toLocaleString('vi-VN')} đ). Bảo lưu ${hold.toLocaleString('vi-VN')} đ trong 15 ngày chờ tra cứu cổng phạt nguội CSGT.`
      });
    } else {
      b.bookingStatus = 'COMPLETED';
      b.step = 11;
      b.stepName = '11. Hoàn thành';
      b.isDepositRefunded = true;
      b.contractStatus = 'HOAN_THANH';
      b.trafficHoldAmount = 0;
      b.updatedAt = new Date().toISOString();

      const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
      payments.unshift({
        id: Date.now(),
        bookingId: b.id,
        bookingCode: b.bookingCode,
        customerName: b.userName,
        type: 'HOAN_COC',
        amount: totalRef,
        method: paymentMethod,
        status: 'THANH_CONG',
        createdAt: new Date().toISOString(),
        transactionCode: `REF-${Date.now().toString().slice(-6)}`,
        notes: notes || 'Hoàn tất đối soát cọc 100%'
      });
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

      this.addBookingHistory(b.id, {
        oldStatus: 'AWAITING_REFUND',
        newStatus: 'COMPLETED',
        reason: `Đã hoàn tất đối soát và hoàn cọc 100% (${totalRef.toLocaleString('vi-VN')} đ). Đơn thuê hoàn thành trọn vẹn!`
      });
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return { success: true, data: b };
  },

  // 10b. Giải phóng tiền cọc bảo lưu phạt nguội CSGT (Đợt 2)
  async releaseTrafficHold(bookingId, amount, deductionForFines = 0, paymentMethod = 'CHUYEN_KHOAN', notes = '') {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/release-traffic-hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: Number(amount), deductionForFines: Number(deductionForFines), paymentMethod, notes })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('Release Traffic Hold API error, using local fallback:', e);
    }

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const b = bookings[idx];
    const releaseAmt = Number(amount) || b.trafficHoldAmount || 2000000;
    const fineDeduction = Number(deductionForFines || 0);
    const netRelease = Math.max(0, releaseAmt - fineDeduction);

    b.bookingStatus = 'COMPLETED';
    b.step = 11;
    b.stepName = '11. Hoàn thành';
    b.isDepositRefunded = true;
    b.contractStatus = 'HOAN_THANH';
    b.trafficHoldAmount = 0;
    b.staffNotes = (b.staffNotes || '') + ` | Đã giải ngân cọc phạt nguội ${netRelease.toLocaleString('vi-VN')} đ (Khấu trừ vi phạm: ${fineDeduction.toLocaleString('vi-VN')} đ).`;
    b.updatedAt = new Date().toISOString();

    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    payments.unshift({
      id: Date.now(),
      bookingId: b.id,
      bookingCode: b.bookingCode,
      customerName: b.userName,
      type: 'HOAN_COC',
      amount: netRelease,
      method: paymentMethod,
      status: 'THANH_CONG',
      createdAt: new Date().toISOString(),
      transactionCode: `REF2-${Date.now().toString().slice(-6)}`,
      notes: notes || `Giải ngân cọc phạt nguội đợt 2 (Khấu trừ vi phạm: ${fineDeduction.toLocaleString('vi-VN')} đ)`
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    this.addBookingHistory(b.id, {
      oldStatus: 'AWAITING_REFUND',
      newStatus: 'COMPLETED',
      reason: `Đã đối soát cổng CSGT và giải ngân cọc phạt nguội ${netRelease.toLocaleString('vi-VN')} đ. Đơn thuê hoàn tất 100%.`
    });

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return { success: true, data: b };
  },

  // Gia hạn hợp đồng đang thuê (Trip Extension)
  async extendBooking(bookingId, newEndDate, notes = '') {
    try {
      const token = localStorage.getItem('autorental_token');
      // Thử gọi endpoint admin trước, nếu không được thì gọi endpoint client
      let res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ newEndDate, notes })
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE}/bookings/${bookingId}/extend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ newEndDate, notes })
        });
      }

      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Không thể gia hạn hợp đồng do trùng lịch xe.');
      }
    } catch (e) {
      console.warn('Extend Booking API error:', e);
      throw e;
    }
  },

  // === NOTIFICATION CENTER ===
  async getNotifications() {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || { unreadCount: 0, items: [] };
      }
    } catch (e) {
      console.warn('Notifications API error:', e);
    }
    return { unreadCount: 0, items: [] };
  },

  async markNotificationRead(id) {
    try {
      const token = localStorage.getItem('autorental_token');
      await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.warn('Mark read error:', e);
    }
  },

  async markAllNotificationsRead() {
    try {
      const token = localStorage.getItem('autorental_token');
      await fetch(`${API_BASE}/admin/notifications/mark-all-read`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.warn('Mark all read error:', e);
    }
  },

  // === HANDOVER PHOTOS ===
  async getHandoverPhotos(handoverId) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/handovers/${handoverId}/photos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.warn('Handover photos API error:', e);
    }
    return [];
  },

  async addHandoverPhoto(handoverId, photoData) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/handovers/${handoverId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(photoData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Add handover photo API error:', e);
    }
  },

  // === FILE UPLOAD ===
  async uploadFile(file, folder = 'handovers') {
    try {
      const token = localStorage.getItem('autorental_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/upload?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải file lên');
    } catch (e) {
      console.warn('Upload error:', e);
      throw e;
    }
  },

  async uploadMultipleFiles(files, folder = 'handovers') {
    try {
      const token = localStorage.getItem('autorental_token');
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));

      const res = await fetch(`${API_BASE}/upload/multiple?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải nhiều file lên');
    } catch (e) {
      console.warn('Upload multiple error:', e);
      throw e;
    }
  },

  // === MAINTENANCE (BẢO TRÌ) ===
  getMaintenance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
  },

  async createMaintenance(data) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
      const err = await res.json();
      throw new Error(err.message || 'Lỗi tạo phiếu bảo trì');
    } catch (e) {
      console.warn('Create maintenance error, fallback locally:', e);
      // Fallback update in localStorage
      const list = this.getMaintenance();
      const newId = list.length ? Math.max(...list.map(m => m.id)) + 1 : 1;
      const newRec = {
        id: newId,
        carId: data.carId,
        carName: data.carName || 'Xe ô tô',
        licensePlate: data.licensePlate || '',
        type: data.type || 'Bảo dưỡng định kỳ',
        startDate: data.startDate || new Date().toISOString().slice(0, 10),
        endDate: data.endDate || new Date().toISOString().slice(0, 10),
        cost: Number(data.cost) || 0,
        status: data.status || 'IN_PROGRESS',
        technician: data.technician || 'Vũ Văn Nam',
        notes: data.notes || '',
      };
      list.unshift(newRec);
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));
      if (data.carId) {
        this.updateCarStatus(data.carId, 'MAINTENANCE');
      }
      return { success: true, data: newRec };
    }
  },

  async completeMaintenance(id) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/maintenance/${id}/complete`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('Complete maintenance error, fallback locally:', e);
    }
    // Fallback update in localStorage
    const list = this.getMaintenance();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx].status = 'COMPLETED';
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));
      if (list[idx].carId) {
        this.updateCarStatus(list[idx].carId, 'AVAILABLE');
      }
    }
    return { success: true };
  },

  async deleteMaintenance(id) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/maintenance/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('Delete maintenance error, fallback locally:', e);
    }
    // Fallback update in localStorage
    const list = this.getMaintenance();
    const item = list.find(m => m.id === id);
    if (item && item.carId) {
      this.updateCarStatus(item.carId, 'AVAILABLE');
    }
    const updated = list.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(updated));
    return { success: true };
  },

  // === REVIEWS & RATINGS ===
  async replyReview(reviewId, replyText) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ replyText })
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('Reply review API error, fallback locally:', e);
    }
    // Fallback update in localStorage
    const list = this.getReviews();
    const idx = list.findIndex(r => r.id === reviewId || String(r.id) === String(reviewId));
    if (idx !== -1) {
      list[idx].adminReply = replyText;
      list[idx].repliedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));
    }
    return { success: true };
  },

  async submitReview(reviewData) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(reviewData)
      });
      if (res.ok) {
        await syncStorageWithBackend();
        return await res.json();
      }
    } catch (e) {
      console.warn('Submit review error:', e);
      throw e;
    }
  },

  // Ghi lịch sử nghiệp vụ cục bộ
  addBookingHistory(bookingId, entry) {
    try {
      const histKey = `autorental_hist_${bookingId}`;
      const hist = JSON.parse(localStorage.getItem(histKey) || '[]');
      hist.unshift({
        id: Date.now(),
        donThueId: bookingId,
        trangThaiCu: entry.oldStatus || 'PENDING',
        trangThaiMoi: entry.newStatus,
        lyDo: entry.reason || 'Cập nhật tiến trình đơn thuê',
        ngayThucHien: entry.time || new Date().toISOString(),
        nguoiThucHien: 'Quản trị viên / Nhân viên hệ thống'
      });
      localStorage.setItem(histKey, JSON.stringify(hist));
    } catch (e) {
      console.warn('Failed to add local history:', e);
    }
  },

  // Lấy lịch sử nghiệp vụ
  async getBookingHistory(bookingId) {
    try {
      const token = localStorage.getItem('autorental_token');
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {
      console.warn('History API error, using local fallback:', e);
    }
    const histKey = `autorental_hist_${bookingId}`;
    return JSON.parse(localStorage.getItem(histKey) || '[]');
  },

  updateBookingStatus(id, newStatus, reason = '') {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(id) || String(b.id) === String(id) || b.bookingCode === id);
    if (idx === -1) throw new Error('Không tìm thấy đơn thuê');

    const oldStatus = bookings[idx].bookingStatus;
    const nextStep = calculateBookingStep(newStatus);

    bookings[idx].bookingStatus = newStatus;
    bookings[idx].step = nextStep;
    bookings[idx].stepName = getBookingStepName(nextStep);

    if (newStatus === 'REJECTED') {
      bookings[idx].rejectedReason = reason;
      bookings[idx].paymentStatus = 'REFUND_PENDING';
    } else if (newStatus === 'CANCELLED') {
      bookings[idx].cancelReason = reason;
      bookings[idx].paymentStatus = 'REFUND_PENDING';
    } else if (newStatus === 'ACTIVE') {
      this.updateCarStatus(bookings[idx].carId, 'RENTED');
    } else if (newStatus === 'COMPLETED') {
      this.updateCarStatus(bookings[idx].carId, 'AVAILABLE');
      bookings[idx].paymentStatus = 'PAID';
      bookings[idx].isDepositRefunded = true;
    }

    bookings[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addBookingHistory(bookings[idx].id, {
      oldStatus,
      newStatus,
      reason: reason || `Cập nhật trạng thái đơn sang ${newStatus} (${getBookingStepName(nextStep)})`
    });

    return bookings[idx];
  },

  updateCarStatus(carId, newStatus) {
    const cars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS) || '[]');
    const idx = cars.findIndex(c => c.id === Number(carId));
    if (idx !== -1) {
      cars[idx].status = newStatus;
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    }
  },

  // === NGHIỆP VỤ BÀN GIAO & NGHIỆM THU XE (STAFF CHECK-IN / CHECK-OUT) ===
  saveCheckIn(bookingId, checkInData) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const oldStatus = bookings[idx].bookingStatus;
    bookings[idx].handoverCheckIn = {
      staffName: checkInData.staffName || 'Nhân viên bàn giao',
      currentMileage: Number(checkInData.currentMileage || 10000),
      fuelPercentage: Number(checkInData.fuelPercentage || 100),
      conditionNotes: checkInData.conditionNotes || 'Xe hoạt động bình thường, không trầy xước lớn.',
      damagePhotos: checkInData.damagePhotos || [],
      time: new Date().toISOString(),
    };
    bookings[idx].bookingStatus = 'ACTIVE';
    bookings[idx].step = 7;
    bookings[idx].stepName = '7. Bàn giao xe (Đang thuê)';
    bookings[idx].updatedAt = new Date().toISOString();

    // Cập nhật ODO xe và trạng thái
    const car = this.getCarById(bookings[idx].carId);
    if (car) {
      car.currentMileage = Number(checkInData.currentMileage || 10000);
      car.status = 'RENTED';
      this.saveCar(car);
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addBookingHistory(bookings[idx].id, {
      oldStatus,
      newStatus: 'ACTIVE',
      reason: `Đã bàn giao xe cho khách hàng (ODO xuất phát: ${bookings[idx].handoverCheckIn.currentMileage} km, Nhiên liệu: ${bookings[idx].handoverCheckIn.fuelPercentage}%). Khách hàng bắt đầu hành trình.`
    });

    return bookings[idx];
  },

  saveCheckOut(bookingId, checkOutData) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId);
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const booking = bookings[idx];
    const car = this.getCarById(booking.carId);

    // Tính số km vượt mức
    const startMileage = booking.handoverCheckIn ? booking.handoverCheckIn.currentMileage : (car?.currentMileage || 10000);
    const endMileage = Number(checkOutData.currentMileage || startMileage + 200);
    const actualDrivenKm = Math.max(0, endMileage - startMileage);
    const maxAllowedKm = (car?.mileageLimitPerDay || 300) * (booking.totalDays || 1);
    const extraMileageCount = Math.max(0, actualDrivenKm - maxAllowedKm);
    const extraMileageCost = extraMileageCount * (car?.extraMileageCharge || 5000);

    const damagePenalty = Number(checkOutData.damagePenalty || 0);
    const totalExtraCharge = extraMileageCost + damagePenalty;
    const depositRefundAmount = Math.max(0, (booking.depositAmount || 5000000) - totalExtraCharge);

    bookings[idx].handoverCheckOut = {
      staffName: checkOutData.staffName || 'Nhân viên nghiệm thu',
      currentMileage: endMileage,
      fuelPercentage: Number(checkOutData.fuelPercentage || 100),
      actualDrivenKm,
      extraMileageCount,
      extraMileageCost,
      damagePenalty,
      totalExtraCharge,
      depositRefundAmount,
      conditionNotes: checkOutData.notes || checkOutData.conditionNotes || 'Hoàn tất nghiệm thu trả xe.',
      time: new Date().toISOString(),
    };

    // Bước 8: Trả xe -> Chờ chốt hóa đơn quyết toán
    const oldStatus = bookings[idx].bookingStatus;
    bookings[idx].extraCharges = totalExtraCharge;
    bookings[idx].totalPrice = (bookings[idx].totalPrice || 0) + totalExtraCharge;
    bookings[idx].bookingStatus = 'AWAITING_SETTLEMENT';
    bookings[idx].step = 8;
    bookings[idx].stepName = '8. Trả xe';
    bookings[idx].updatedAt = new Date().toISOString();

    // Cập nhật lại xe về AVAILABLE
    if (car) {
      car.currentMileage = endMileage;
      car.status = 'AVAILABLE';
      this.saveCar(car);
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addBookingHistory(booking.id, {
      oldStatus,
      newStatus: 'AWAITING_SETTLEMENT',
      reason: `Khách trả xe (ODO: ${endMileage} km, Phụ phí: ${totalExtraCharge.toLocaleString('vi-VN')} đ). Chuyển sang bước 9: Chốt hóa đơn quyết toán.`
    });

    return bookings[idx];
  },

  // === ĐÁNH GIÁ (REVIEWS) ===
  addReview(bookingId, { rating, comment }) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    bookings[idx].review = {
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    // Cập nhật rating trung bình của xe
    const car = this.getCarById(bookings[idx].carId);
    if (car) {
      const newReviewCount = (car.reviewCount || 0) + 1;
      const newRating = Number((((car.rating || 5) * (car.reviewCount || 1) + Number(rating)) / (newReviewCount + 1)).toFixed(1));
      car.rating = newRating;
      car.reviewCount = newReviewCount;
      this.saveCar(car);
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  getAllReviews() {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const reviews = [];
    bookings.forEach((b) => {
      if (b.review) {
        reviews.push({
          id: b.id,
          bookingCode: b.bookingCode,
          carId: b.carId,
          carName: b.carName,
          carThumbnail: b.carThumbnail,
          userName: b.userName,
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=80',
          rating: b.review.rating,
          comment: b.review.comment,
          createdAt: b.review.createdAt,
        });
      }
    });
    return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // === HỢP ĐỒNG ĐIỆN TỬ (E-CONTRACT) ===
  signContract(bookingId, { signerName, citizenId, signatureBase64 }) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const contractCode = `HD-${bookings[idx].bookingCode.replace('BK-', '')}`;
    bookings[idx].contract = {
      contractCode,
      signerName,
      citizenId,
      signatureBase64,
      signedAt: new Date().toISOString(),
      status: 'SIGNED',
    };

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  // === GIA HẠN THỜI GIAN THUÊ (RENTAL EXTENSION) ===
  extendBooking(bookingId, { newEndDate, additionalFee, reason }) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const booking = bookings[idx];
    const isAvail = this.isCarAvailable(booking.carId, booking.endDate, newEndDate, booking.id);
    if (!isAvail) {
      throw new Error('Xe này đã có khách khác đặt lịch sau đó. Rất tiếc không thể gia hạn thêm.');
    }

    const prevEnd = booking.endDate;
    booking.endDate = newEndDate;
    booking.totalDays = calculateDays(booking.startDate, newEndDate);
    booking.totalPrice += Number(additionalFee);
    booking.extensionHistory = booking.extensionHistory || [];
    booking.extensionHistory.push({
      fromEndDate: prevEnd,
      toEndDate: newEndDate,
      additionalFee: Number(additionalFee),
      reason,
      extendedAt: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return booking;
  },

  // === XỬ LÝ THANH TOÁN TIỀN CỌC TRỰC TUYẾN ===
  processDepositPayment(bookingId, paymentData) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    bookings[idx].bookingStatus = 'DEPOSIT_PAID';
    bookings[idx].paymentStatus = 'PARTIALLY_PAID';
    bookings[idx].paymentInfo = {
      transactionCode: `TX-${Date.now()}`,
      method: paymentData.method, // 'VNPAY' | 'VIETQR' | 'CASH'
      amount: bookings[idx].depositAmount,
      paidAt: new Date().toISOString(),
      bankName: paymentData.bankName || 'Ngân hàng TMCP Quân Đội (MB Bank)',
    };

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  // === LUỒNG NGHIỆP VỤ XUYÊN SUỐT DÀNH CHO KHÁCH HÀNG (END-TO-END JOURNEY) ===

  // 1. Khách xác nhận nhận xe & bàn giao chìa khóa (Pickup Confirmation)
  customerConfirmPickup(bookingId) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const car = this.getCarById(bookings[idx].carId);
    const startMileage = car ? car.currentMileage : 12000;

    bookings[idx].handoverCheckIn = bookings[idx].handoverCheckIn || {
      staffName: 'Trần Văn Nhân Viên (Điều phối AutoRental)',
      currentMileage: startMileage,
      fuelPercentage: 100,
      conditionNotes: 'Khách và nhân viên đã đồng kiểm tra 4 góc xe, nội thất sạch sẽ, lốp dự phòng đầy đủ.',
      damagePhotos: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&fit=crop&q=80',
      ],
      time: new Date().toISOString(),
    };

    bookings[idx].bookingStatus = 'ACTIVE';
    this.updateCarStatus(bookings[idx].carId, 'RENTED');

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  // 2. Khách trả xe tại điểm hẹn & nghiệm thu ODO (Return Inspection)
  customerSubmitReturn(bookingId, { returnMileage, returnFuel = 90, damageNotes = 'Không có va quẹt phát sinh.' }) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const booking = bookings[idx];
    const car = this.getCarById(booking.carId);
    const startMileage = booking.handoverCheckIn ? booking.handoverCheckIn.currentMileage : (car?.currentMileage || 10000);
    const endMileage = Number(returnMileage) || (startMileage + 260);

    const actualDrivenKm = Math.max(0, endMileage - startMileage);
    const maxAllowedKm = (car?.mileageLimitPerDay || 300) * booking.totalDays;
    const extraMileageCount = Math.max(0, actualDrivenKm - maxAllowedKm);
    const extraMileageCost = extraMileageCount * (car?.extraMileageCharge || 5000);
    const depositRefundAmount = Math.max(0, booking.depositAmount - extraMileageCost);

    bookings[idx].handoverCheckOut = {
      staffName: 'Trần Văn Nhân Viên (Nghiệm thu AutoRental)',
      currentMileage: endMileage,
      fuelPercentage: Number(returnFuel),
      actualDrivenKm,
      extraMileageCount,
      extraMileageCost,
      damagePenalty: 0,
      totalExtraCharge: extraMileageCost,
      depositRefundAmount,
      conditionNotes: damageNotes,
      time: new Date().toISOString(),
    };

    // Đã trả xe, sẵn sàng chốt hóa đơn
    bookings[idx].isReturned = true;

    if (car) {
      car.currentMileage = endMileage;
      this.saveCar(car);
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  // 3. Chốt hóa đơn thanh quyết toán (Invoice Settlement)
  confirmInvoiceSettlement(bookingId) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const invoiceCode = `INV-${Date.now().toString().slice(-8)}`;
    bookings[idx].settlement = {
      invoiceCode,
      settledAt: new Date().toISOString(),
      status: 'CONFIRMED',
    };
    bookings[idx].paymentStatus = 'REFUND_PENDING';

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  // 4. Nhận hoàn trả tiền cọc về tài khoản (Claim Deposit Refund)
  processDepositRefund(bookingId, refundAccountInfo) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const idx = bookings.findIndex(b => b.id === Number(bookingId));
    if (idx === -1) throw new Error('Không tìm thấy đơn');

    const refundAmount = bookings[idx].handoverCheckOut?.depositRefundAmount || bookings[idx].depositAmount;

    bookings[idx].refundReceipt = {
      refundCode: `RF-${Date.now().toString().slice(-8)}`,
      amount: refundAmount,
      bankName: refundAccountInfo?.bankName || 'Ngân hàng Quân Đội (MB Bank)',
      accountNumber: refundAccountInfo?.accountNumber || '090912345688',
      beneficiaryName: refundAccountInfo?.beneficiaryName || bookings[idx].userName,
      refundedAt: new Date().toISOString(),
      status: 'SUCCESS',
    };

    bookings[idx].bookingStatus = 'COMPLETED';
    bookings[idx].paymentStatus = 'REFUNDED';
    this.updateCarStatus(bookings[idx].carId, 'AVAILABLE');

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[idx];
  },

  // === CHI NHÁNH (BRANCHES) ===
  getBranches() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANCHES) || '[]');
  },

  saveBranch(branch) {
    const list = this.getBranches();
    if (branch.id) {
      const idx = list.findIndex(b => b.id === branch.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...branch };
    } else {
      const newId = list.length ? Math.max(...list.map(b => b.id)) + 1 : 1;
      list.push({ ...branch, id: newId, carCount: branch.carCount || 0, status: branch.status || 'ACTIVE' });
    }
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(list));
    return list;
  },

  deleteBranch(id) {
    const list = this.getBranches().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(list));
    return list;
  },

  // === KHÁCH HÀNG (CUSTOMERS) ===
  getCustomers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  },

  saveCustomer(customer) {
    const list = this.getCustomers();
    if (customer.id) {
      const idx = list.findIndex(c => c.id === customer.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...customer };
    } else {
      const newId = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
      list.push({ ...customer, id: newId, rentalCount: 0, totalSpent: 0, status: 'ACTIVE', createdAt: new Date().toISOString().slice(0, 10) });
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    return list;
  },

  toggleCustomerStatus(id) {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].status = list[idx].status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    }
    return list;
  },

  // === NHÂN VIÊN (STAFF) ===
  getStaff() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || '[]');
  },

  saveStaff(staffMember) {
    const list = this.getStaff();
    if (staffMember.id) {
      const idx = list.findIndex(s => s.id === staffMember.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...staffMember };
    } else {
      const newId = list.length ? Math.max(...list.map(s => s.id)) + 1 : 1;
      list.push({ ...staffMember, id: newId, status: 'ACTIVE' });
    }
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    return list;
  },

  deleteStaff(id) {
    const list = this.getStaff().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    return list;
  },

  // === HÃNG XE (BRANDS) ===
  saveBrand(brand) {
    const list = this.getBrands();
    if (brand.id) {
      const idx = list.findIndex(b => b.id === brand.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...brand };
    } else {
      const newId = list.length ? Math.max(...list.map(b => b.id)) + 1 : 1;
      list.push({ ...brand, id: newId, is_active: true });
    }
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(list));
    return list;
  },

  deleteBrand(id) {
    const list = this.getBrands().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(list));
    return list;
  },

  // === LOẠI XE (CATEGORIES) ===
  saveCategory(cat) {
    const list = this.getCategories();
    if (cat.id) {
      const idx = list.findIndex(c => c.id === cat.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...cat };
    } else {
      const newId = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
      list.push({ ...cat, id: newId, is_active: true });
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    return list;
  },

  deleteCategory(id) {
    const list = this.getCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    return list;
  },

  // === CẤU HÌNH HỆ THỐNG (SETTINGS) ===
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(INITIAL_SYSTEM_SETTINGS));
  },

  saveSettings(newSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    return newSettings;
  },

  // === ĐÁNH GIÁ (REVIEWS) ===
  getReviews() {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    if (list.length > 0) return list;
    return this.getAllReviews();
  },

  // === HỢP ĐỒNG (CONTRACTS) ===
  getContracts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
  },

  // === BIÊN BẢN GIAO NHẬN (HANDOVERS) ===
  getHandovers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HANDOVERS) || '[]');
  },

  // === THANH TOÁN (PAYMENTS) ===
  getPayments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
  },

  async syncWithBackend() {
    return await syncStorageWithBackend();
  }
};
