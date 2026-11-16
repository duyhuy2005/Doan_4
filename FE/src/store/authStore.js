import { create } from 'zustand';

const DEMO_USERS = {
  CUSTOMER: {
    id: 3,
    role: 'CUSTOMER',
    fullName: 'Nguyễn Văn Khách',
    email: 'customer@example.com',
    phone: '0909123456',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    driverLicenseNo: 'B2-790123849',
    isLicenseVerified: true,
  },
  STAFF: {
    id: 2,
    role: 'STAFF',
    fullName: 'Trần Văn Nhân Viên',
    email: 'staff@autorental.vn',
    phone: '0918776655',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    driverLicenseNo: 'C-881239912',
    isLicenseVerified: true,
  },
  ADMIN: {
    id: 1,
    role: 'ADMIN',
    fullName: 'Quản Trị Viên Hệ Thống',
    email: 'admin@autorental.vn',
    phone: '0988999888',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    driverLicenseNo: 'B2-99882211',
    isLicenseVerified: true,
  },
};

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('autorental_current_user') || 'null') || DEMO_USERS.CUSTOMER,
  isAuthenticated: true,

  login: (email, password) => {
    let matchedUser = DEMO_USERS.CUSTOMER;
    if (email.includes('admin')) matchedUser = DEMO_USERS.ADMIN;
    else if (email.includes('staff')) matchedUser = DEMO_USERS.STAFF;
    else {
      matchedUser = {
        ...DEMO_USERS.CUSTOMER,
        email,
        fullName: email.split('@')[0],
      };
    }

    localStorage.setItem('autorental_current_user', JSON.stringify(matchedUser));
    set({ user: matchedUser, isAuthenticated: true });
    return matchedUser;
  },

  register: (data) => {
    const newUser = {
      id: Date.now(),
      role: 'CUSTOMER',
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      driverLicenseNo: data.driverLicenseNo || '',
      isLicenseVerified: false,
    };
    localStorage.setItem('autorental_current_user', JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true });
    return newUser;
  },

  logout: () => {
    localStorage.removeItem('autorental_current_user');
    set({ user: null, isAuthenticated: false });
  },

  switchRole: (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      const user = DEMO_USERS[roleKey];
      localStorage.setItem('autorental_current_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    }
  },

  updateProfile: (profileData) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...profileData };
    localStorage.setItem('autorental_current_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));
