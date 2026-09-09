import { create } from 'zustand';
import { uid } from '../lib/format';

export type ToastItem = { id: string; text: string; coin?: boolean; icon?: 'check' | 'heart' | 'lock' | 'unlock' | 'crown' | 'info' | 'star' | 'shield' };

type ToastStore = { items: ToastItem[]; show: (text: string, opts?: { coin?: boolean; icon?: ToastItem['icon']; ms?: number }) => void; dismiss: (id: string) => void };

export const useToast = create<ToastStore>((set) => ({
  items: [],
  show: (text, opts) => {
    const id = uid();
    set((s) => ({ items: [...s.items.slice(-1), { id, text, coin: opts?.coin, icon: opts?.icon }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), opts?.ms ?? 2200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const toast = (text: string, opts?: { coin?: boolean; icon?: ToastItem['icon']; ms?: number }) => useToast.getState().show(text, opts);
