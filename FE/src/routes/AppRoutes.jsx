import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import CarListPage from '../pages/customer/CarListPage';
import CarDetailPage from '../pages/customer/CarDetailPage';
import BookingCheckoutPage from '../pages/customer/BookingCheckoutPage';
import MyBookingsPage from '../pages/customer/MyBookingsPage';
import UserProfilePage from '../pages/customer/UserProfilePage';
import PaymentPage from '../pages/customer/PaymentPage';
import ContractPage from '../pages/customer/ContractPage';
import TrackingPage from '../pages/customer/TrackingPage';
import PickupCarPage from '../pages/customer/PickupCarPage';
import ReturnCarPage from '../pages/customer/ReturnCarPage';
import InvoiceSettlementPage from '../pages/customer/InvoiceSettlementPage';
import DepositRefundPage from '../pages/customer/DepositRefundPage';
import TripReviewPage from '../pages/customer/TripReviewPage';
import RentalHistoryPage from '../pages/customer/RentalHistoryPage';
import ReviewsPage from '../pages/customer/ReviewsPage';

// Admin & Staff Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminCarsPage from '../pages/admin/AdminCarsPage';
import AdminBranchesPage from '../pages/admin/AdminBranchesPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminStaffPage from '../pages/admin/AdminStaffPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminContractsPage from '../pages/admin/AdminContractsPage';
import StaffHandoverPage from '../pages/admin/StaffHandoverPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminMaintenancePage from '../pages/admin/AdminMaintenancePage';
import AdminPromotionsPage from '../pages/admin/AdminPromotionsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Phân hệ Khách hàng (Customer Portal) */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<CarListPage />} />
        <Route path="/find/filter" element={<CarListPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/car/:id" element={<CarDetailPage />} />
        <Route path="/car/:slug/:code" element={<CarDetailPage />} />
        <Route path="/checkout" element={<BookingCheckoutPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/contract/:bookingId" element={<ContractPage />} />
        <Route path="/pickup/:bookingId" element={<PickupCarPage />} />
        <Route path="/tracking/:bookingId" element={<TrackingPage />} />
        <Route path="/return/:bookingId" element={<ReturnCarPage />} />
        <Route path="/settlement/:bookingId" element={<InvoiceSettlementPage />} />
        <Route path="/refund/:bookingId" element={<DepositRefundPage />} />
        <Route path="/review-trip/:bookingId" element={<TripReviewPage />} />
        <Route path="/history" element={<RentalHistoryPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Route>

      {/* 2. Trang Đăng nhập & Đăng ký */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 3. Phân hệ Quản trị & Vận hành (Admin & Staff Console) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="cars" element={<AdminCarsPage />} />
        <Route path="brands" element={<Navigate to="/admin/cars" replace />} />
        <Route path="categories" element={<Navigate to="/admin/cars" replace />} />
        <Route path="branches" element={<AdminBranchesPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="contracts" element={<AdminContractsPage />} />
        <Route path="handovers" element={<StaffHandoverPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="maintenance" element={<AdminMaintenancePage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 4. Điều hướng mặc định */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
