import { create } from 'zustand';
import { uid } from '../lib/format';

export type Tab = 'home' | 'foryou' | 'mylist' | 'rewards' | 'me';
export type ScreenName = 'search' | 'series' | 'player' | 'wallet' | 'vip' | 'settings' | 'history' | 'unlocked' | 'notifications' | 'help' | 'privacy' | 'profiles';
export type SheetName = 'unlock' | 'episodes' | 'purchase' | 'profile' | 'rate' | 'confirm' | 'choice' | 'spin';

export type Route = { key: string; name: ScreenName; params?: Record<string, unknown> };
export type Sheet = { name: SheetName; params?: Record<string, unknown> };
export type AdRequest = { seconds: number; onDone: () => void; label?: string };

type Nav = {
  tab: Tab;
  stack: Route[];
  sheet: Sheet | null;
  ad: AdRequest | null;
  setTab: (t: Tab) => void;
  push: (name: ScreenName, params?: Record<string, unknown>) => void;
  replaceTop: (name: ScreenName, params?: Record<string, unknown>) => void;
  pop: () => void;
  popAll: () => void;
  openSheet: (name: SheetName, params?: Record<string, unknown>) => void;
  closeSheet: () => void;
  showAd: (req: AdRequest) => void;
  hideAd: () => void;
};

export const useNav = create<Nav>((set, get) => ({
  tab: 'home',
  stack: [],
  sheet: null,
  ad: null,
  setTab: (tab) => set({ tab, stack: [], sheet: null }),
  push: (name, params) => set((s) => ({ stack: [...s.stack, { key: uid(), name, params }], sheet: null })),
  replaceTop: (name, params) => set((s) => ({ stack: [...s.stack.slice(0, -1), { key: uid(), name, params }] })),
  pop: () => {
    const s = get();
    if (s.sheet) return set({ sheet: null });
    if (s.stack.length) set({ stack: s.stack.slice(0, -1) });
  },
  popAll: () => set({ stack: [], sheet: null }),
  openSheet: (name, params) => set({ sheet: { name, params } }),
  closeSheet: () => set({ sheet: null }),
  showAd: (ad) => set({ ad }),
  hideAd: () => set({ ad: null }),
}));

export const nav = useNav.getState;
