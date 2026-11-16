import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (msg) => useToastStore.getState().addToast(msg, 'success'),
  error: (msg) => useToastStore.getState().addToast(msg, 'error'),
  warning: (msg) => useToastStore.getState().addToast(msg, 'warning'),
  info: (msg) => useToastStore.getState().addToast(msg, 'info'),
}));
