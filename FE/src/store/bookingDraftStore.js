import { create } from 'zustand';

// Lấy ngày mai và ngày kia làm ngày mặc định tiện lợi cho người dùng
const getDefaultDates = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const afterTomorrow = new Date();
  afterTomorrow.setDate(afterTomorrow.getDate() + 3);
  afterTomorrow.setHours(18, 0, 0, 0);

  const formatInputDateTime = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return {
    startDate: formatInputDateTime(tomorrow),
    endDate: formatInputDateTime(afterTomorrow),
  };
};

const defaultDates = getDefaultDates();

export const useBookingDraftStore = create((set) => ({
  pickupLocation: 'Sân bay Quốc tế Tân Sơn Nhất (Ga Quốc nội)',
  returnLocation: 'Sân bay Quốc tế Tân Sơn Nhất (Ga Quốc nội)',
  startDate: defaultDates.startDate,
  endDate: defaultDates.endDate,
  selectedCarId: null,
  selectedServices: [1], // Mặc định gợi ý Bảo hiểm chuyến đi
  voucherCode: '',

  setSearchParams: (params) => set((state) => ({ ...state, ...params })),
  setSelectedCarId: (id) => set({ selectedCarId: id }),
  setSelectedServices: (services) => set({ selectedServices: services }),
  toggleService: (serviceId) =>
    set((state) => {
      const exists = state.selectedServices.includes(serviceId);
      return {
        selectedServices: exists
          ? state.selectedServices.filter((id) => id !== serviceId)
          : [...state.selectedServices, serviceId],
      };
    }),
  setVoucherCode: (code) => set({ voucherCode: code }),
  resetDraft: () =>
    set({
      selectedCarId: null,
      selectedServices: [1],
      voucherCode: '',
    }),
}));
