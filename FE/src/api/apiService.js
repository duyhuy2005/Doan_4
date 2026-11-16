import axiosClient from './axiosClient';
import { storageService } from '../services/storageService';

export const apiService = {
  // ---- 1. AUTHENTICATION ----
  async login(email, password) {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      if (res.data?.accessToken) {
        localStorage.setItem('autorental_token', res.data.accessToken);
      }
      return res.data;
    } catch (err) {
      // Fallback
      return null;
    }
  },

  async register(userData) {
    try {
      const res = await axiosClient.post('/auth/register', userData);
      if (res.data?.accessToken) {
        localStorage.setItem('autorental_token', res.data.accessToken);
      }
      return res.data;
    } catch (err) {
      return null;
    }
  },

  async getCurrentUser() {
    try {
      const res = await axiosClient.get('/auth/me');
      return res.data;
    } catch (err) {
      return null;
    }
  },

  // ---- 2. CARS & CATALOG ----
  async getCars(filters = {}) {
    try {
      const res = await axiosClient.get('/cars', { params: filters });
      return res.data;
    } catch (err) {
      return storageService.getCars(filters);
    }
  },

  async getCarById(id) {
    try {
      const res = await axiosClient.get(`/cars/${id}`);
      return res.data;
    } catch (err) {
      return storageService.getCarById(id);
    }
  },

  async checkAvailability(carId, startDate, endDate) {
    try {
      const res = await axiosClient.get(`/cars/${carId}/availability`, {
        params: { startDate, endDate }
      });
      return res.data?.isAvailable;
    } catch (err) {
      return storageService.checkCarAvailability(carId, startDate, endDate);
    }
  },

  async getBrands() {
    try {
      const res = await axiosClient.get('/catalog/brands');
      return res.data;
    } catch (err) {
      return storageService.getBrands();
    }
  },

  async getCategories() {
    try {
      const res = await axiosClient.get('/catalog/categories');
      return res.data;
    } catch (err) {
      return storageService.getCategories();
    }
  },

  async getFeatures() {
    try {
      const res = await axiosClient.get('/catalog/features');
      return res.data;
    } catch (err) {
      return storageService.getFeatures();
    }
  },

  async getServices() {
    try {
      const res = await axiosClient.get('/catalog/services');
      return res.data;
    } catch (err) {
      return storageService.getServices();
    }
  },

  async getPromotions() {
    try {
      const res = await axiosClient.get('/catalog/promotions');
      return res.data;
    } catch (err) {
      return storageService.getPromotions();
    }
  },

  async validatePromo(code, orderAmount = 0) {
    try {
      const res = await axiosClient.post('/catalog/validate-promo', { code, orderAmount });
      return res.data;
    } catch (err) {
      return storageService.validatePromotion(code, orderAmount);
    }
  },

  // ---- 3. BOOKINGS ----
  async calculatePrice(payload) {
    try {
      const res = await axiosClient.post('/bookings/calculate-price', payload);
      return res.data;
    } catch (err) {
      return storageService.calculatePricing(payload);
    }
  },

  async createBooking(bookingData) {
    try {
      const res = await axiosClient.post('/bookings', bookingData);
      return res.data;
    } catch (err) {
      return storageService.createBooking(bookingData);
    }
  },

  async getMyBookings() {
    try {
      const res = await axiosClient.get('/bookings/my-bookings');
      return res.data;
    } catch (err) {
      return storageService.getMyBookings();
    }
  },

  async getBookingById(id) {
    try {
      const res = await axiosClient.get(`/bookings/${id}`);
      return res.data;
    } catch (err) {
      return storageService.getBookingById(id);
    }
  },

  async cancelBooking(id, reason) {
    try {
      const res = await axiosClient.post(`/bookings/${id}/cancel`, { reason });
      return res.data;
    } catch (err) {
      return storageService.cancelBooking(id, reason);
    }
  },

  async extendBooking(id, newEndDate) {
    try {
      const res = await axiosClient.post(`/bookings/${id}/extend`, { newEndDate });
      return res.data;
    } catch (err) {
      return storageService.extendBooking(id, newEndDate);
    }
  },

  // ---- 4. PAYMENTS ----
  async createPaymentIntent(payload) {
    try {
      const res = await axiosClient.post('/payments/intent', payload);
      return res.data;
    } catch (err) {
      return storageService.createPaymentIntent(payload);
    }
  },

  async confirmPayment(payload) {
    try {
      const res = await axiosClient.post('/payments/confirm', payload);
      return res.data;
    } catch (err) {
      return storageService.confirmPayment(payload);
    }
  },

  // ---- 5. CONTRACTS ----
  async signContract(bookingId, signatureName) {
    try {
      const res = await axiosClient.post(`/contracts/${bookingId}/sign`, {
        signatureName,
        confirmedTerms: true
      });
      return res.data;
    } catch (err) {
      return storageService.signContract(bookingId, signatureName);
    }
  },

  // ---- 6. HANDOVERS (CHECK-IN & CHECK-OUT) ----
  async checkIn(bookingId, data) {
    try {
      const res = await axiosClient.post(`/handovers/${bookingId}/check-in`, data);
      return res.data;
    } catch (err) {
      return storageService.saveCheckIn(bookingId, data);
    }
  },

  async checkOut(bookingId, data) {
    try {
      const res = await axiosClient.post(`/handovers/${bookingId}/check-out`, data);
      return res.data;
    } catch (err) {
      return storageService.saveCheckOut(bookingId, data);
    }
  },

  // ---- 7. SETTLEMENT & REFUND ----
  async getSettlement(bookingId) {
    try {
      const res = await axiosClient.get(`/settlements/${bookingId}`);
      return res.data;
    } catch (err) {
      return storageService.getSettlement(bookingId);
    }
  },

  async refundDeposit(bookingId, data) {
    try {
      const res = await axiosClient.post(`/settlements/${bookingId}/refund`, data);
      return res.data;
    } catch (err) {
      return storageService.processDepositRefund(bookingId, data);
    }
  },

  // ---- 8. REVIEWS ----
  async submitReview(bookingId, data) {
    try {
      const res = await axiosClient.post(`/reviews/${bookingId}`, data);
      return res.data;
    } catch (err) {
      return storageService.submitTripReview(bookingId, data);
    }
  },

  // ---- 9. ADMIN & STAFF CONSOLE ----
  async getAdminStats() {
    try {
      const res = await axiosClient.get('/admin/dashboard');
      return res.data;
    } catch (err) {
      return storageService.getAdminKPIs();
    }
  },

  async getAllBookings(filters) {
    try {
      const res = await axiosClient.get('/admin/bookings', { params: filters });
      return res.data;
    } catch (err) {
      return storageService.getBookings(filters);
    }
  },

  async updateBookingStatus(bookingId, status, note) {
    try {
      const res = await axiosClient.patch(`/admin/bookings/${bookingId}/status`, { status, note });
      return res.data;
    } catch (err) {
      return storageService.updateBookingStatus(bookingId, status, note);
    }
  }
};
