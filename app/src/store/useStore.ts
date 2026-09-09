import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayKey, uid, yesterdayKey } from '../lib/format';

export type Profile = { id: string; name: string; color: string; kids: boolean; createdAt: number; pin?: string };

export type Settings = {
  autoplayNext: boolean;
  autoUnlock: boolean;
  speed: number;
  dataSaver: boolean;
  soundOnStart: boolean;
  notifyEpisodes: boolean;
  notifyCoins: boolean;
  notifyPromos: boolean;
  accent: string;
  language: string;
  subtitles: boolean;
  privacyScreen: boolean;
  blockCapture: boolean;
  incognito: boolean;
};

export type TxType = 'topup' | 'unlock' | 'reward' | 'vip' | 'bonus';
export type Transaction = { id: string; type: TxType; label: string; amount: number; at: number };
export type VipPlan = 'weekly' | 'monthly' | 'yearly';

export type Coupon = { id: string; kind: 'pack' | 'vip'; pct: number; expiresAt: number; label: string };
export type SpinPrize = { id: string; label: string; short: string; kind: 'coins' | 'freeEp' | 'coupon' | 'vipDay' | 'again'; amount?: number; pct?: number; couponKind?: 'pack' | 'vip'; weight: number };
export const SPIN_PRIZES: SpinPrize[] = [
  { id: 'c20', label: '+20 coins', short: '+20', kind: 'coins', amount: 20, weight: 22 },
  { id: 'ep', label: '1 free episode', short: 'Free EP', kind: 'freeEp', weight: 16 },
  { id: 'off10', label: '10% off your next top-up', short: '10% off', kind: 'coupon', pct: 10, couponKind: 'pack', weight: 14 },
  { id: 'c50', label: '+50 coins', short: '+50', kind: 'coins', amount: 50, weight: 10 },
  { id: 'again', label: 'Spin again', short: 'Again', kind: 'again', weight: 12 },
  { id: 'vip', label: 'VIP for 24 hours', short: 'VIP day', kind: 'vipDay', weight: 4 },
  { id: 'c10', label: '+10 coins', short: '+10', kind: 'coins', amount: 10, weight: 16 },
  { id: 'vip20', label: '20% off VIP', short: '20% VIP', kind: 'coupon', pct: 20, couponKind: 'vip', weight: 6 },
];

export type Tasks = { date: string; ads: number; watched: number; watchedClaimed: boolean; listClaimed: boolean; inviteClaimed: boolean };

export type ProfileState = {
  coins: number;
  bonus: { amount: number; expiresAt: number };
  vip: { plan: VipPlan; until: number; trial: boolean } | null;
  unlocked: Record<string, number[]>;
  progress: Record<string, { ep: number; pos: number; dur: number; updatedAt: number }>;
  finished: string[];
  myList: string[];
  likes: Record<string, true>;
  history: { seriesId: string; ep: number; at: number }[];
  recentSearches: string[];
  checkIn: { streak: number; lastDate: string | null };
  spin: { lastDate: string | null; extra: number; v?: number };
  vouchers: { freeEp: number; coupons: Coupon[] };
  tasks: Tasks;
  transactions: Transaction[];
  settings: Settings;
  notificationsRead: string[];
  soundOn: boolean;
};

export const EP_PRICE = 50;
export const CHECKIN_REWARDS = [10, 10, 15, 15, 20, 20, 50];
export const PACKS = [
  { id: 'p500', coins: 500, bonus: 0, price: 4.99 },
  { id: 'p1200', coins: 1090, bonus: 110, price: 9.99, tag: '+10%' },
  { id: 'p2500', coins: 2080, bonus: 420, price: 19.99, tag: '+20% · Popular', popular: true },
  { id: 'p6000', coins: 4440, bonus: 1560, price: 49.99, tag: '+35%' },
];
export const PLANS: { id: VipPlan; name: string; price: number; per: string; note: string; days: number }[] = [
  { id: 'weekly', name: 'Weekly', price: 4.99, per: 'week', note: 'Cancel anytime', days: 7 },
  { id: 'monthly', name: 'Monthly', price: 9.99, per: 'month', note: '7-day free trial', days: 30 },
  { id: 'yearly', name: 'Yearly', price: 59.99, per: 'year', note: 'Save 50%', days: 365 },
];

const DEFAULT_SETTINGS: Settings = {
  autoplayNext: true,
  autoUnlock: false,
  speed: 1,
  dataSaver: false,
  soundOnStart: false,
  notifyEpisodes: true,
  notifyCoins: true,
  notifyPromos: false,
  accent: '#FF3D8A',
  language: 'English',
  subtitles: true,
  privacyScreen: true,
  blockCapture: true,
  incognito: false,
};

function freshTasks(): Tasks {
  return { date: todayKey(), ads: 0, watched: 0, watchedClaimed: false, listClaimed: false, inviteClaimed: false };
}

const DAY = 86_400_000;

export function seedState(kind: 'maya' | 'dev' | 'kids' | 'new'): ProfileState {
  const now = Date.now();
  const base: ProfileState = {
    coins: 120,
    bonus: { amount: 0, expiresAt: 0 },
    vip: null,
    unlocked: {},
    progress: {},
    finished: [],
    myList: [],
    likes: {},
    history: [],
    recentSearches: [],
    checkIn: { streak: 0, lastDate: null },
    spin: { lastDate: null, extra: 2, v: 2 },
    vouchers: { freeEp: 0, coupons: [] },
    tasks: freshTasks(),
    transactions: [{ id: uid(), type: 'bonus', label: 'Welcome bonus', amount: 120, at: now }],
    settings: { ...DEFAULT_SETTINGS },
    notificationsRead: [],
    soundOn: false,
  };
  if (kind === 'maya') {
    return {
      ...base,
      coins: 1250,
      bonus: { amount: 80, expiresAt: now + 3 * DAY },
      unlocked: { heir: [11, 12], ceo: [11], moonlit: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
      progress: {
        heir: { ep: 12, pos: 18, dur: 34, updatedAt: now - 2 * 3600_000 },
        ceo: { ep: 7, pos: 5, dur: 30, updatedAt: now - DAY },
        moonlit: { ep: 24, pos: 12, dur: 28, updatedAt: now - 2 * DAY },
        heiress: { ep: 3, pos: 2, dur: 26, updatedAt: now - 3 * DAY },
        runaway: { ep: 41, pos: 20, dur: 30, updatedAt: now - 5 * DAY },
      },
      finished: ['paper'],
      myList: ['heir', 'moonlit', 'runaway', 'ceo', 'night', 'dragon', 'heiress', 'signal'],
      likes: { 'heir:12': true, 'heir:11': true, 'moonlit:24': true },
      history: [
        { seriesId: 'heir', ep: 12, at: now - 2 * 3600_000 },
        { seriesId: 'heir', ep: 11, at: now - 3 * 3600_000 },
        { seriesId: 'ceo', ep: 7, at: now - DAY },
        { seriesId: 'moonlit', ep: 24, at: now - 2 * DAY },
        { seriesId: 'heiress', ep: 3, at: now - 3 * DAY },
      ],
      recentSearches: ['married to the heir', 'revenge', 'second chance ceo'],
      checkIn: { streak: 2, lastDate: yesterdayKey() },
      transactions: [
        { id: uid(), type: 'topup', label: 'Top-up · 1,200 coins', amount: 1200, at: now - 4 * 3600_000 },
        { id: uid(), type: 'unlock', label: 'Unlocked EP 12 · Married to the Heir', amount: -50, at: now - DAY },
        { id: uid(), type: 'reward', label: 'Daily check-in', amount: 10, at: now - DAY },
        { id: uid(), type: 'unlock', label: 'Unlocked EP 11 · Married to the Heir', amount: -50, at: now - DAY - 3600_000 },
        { id: uid(), type: 'bonus', label: 'Welcome bonus', amount: 120, at: now - 12 * DAY },
      ],
    };
  }
  if (kind === 'dev') {
    return {
      ...base,
      coins: 340,
      progress: { revenge: { ep: 4, pos: 9, dur: 30, updatedAt: now - 6 * 3600_000 } },
      myList: ['revenge', 'night'],
      history: [{ seriesId: 'revenge', ep: 4, at: now - 6 * 3600_000 }],
      checkIn: { streak: 5, lastDate: yesterdayKey() },
      transactions: [
        { id: uid(), type: 'reward', label: 'Daily check-in', amount: 20, at: now - DAY },
        { id: uid(), type: 'topup', label: 'Top-up · 500 coins', amount: 500, at: now - 3 * DAY },
        { id: uid(), type: 'bonus', label: 'Welcome bonus', amount: 120, at: now - 20 * DAY },
      ],
    };
  }
  if (kind === 'kids') {
    return { ...base, coins: 60, myList: ['paper', 'dragon'], progress: { paper: { ep: 2, pos: 4, dur: 22, updatedAt: now - DAY } }, history: [{ seriesId: 'paper', ep: 2, at: now - DAY }] };
  }
  return base;
}

export const isVip = (p: ProfileState) => !!p.vip && p.vip.until > Date.now();
export const bonusLeft = (p: ProfileState) => (p.bonus.expiresAt > Date.now() ? p.bonus.amount : 0);
export const totalCoins = (p: ProfileState) => p.coins + bonusLeft(p);
export const isUnlocked = (p: ProfileState, seriesId: string, ep: number, freeUpTo: number) => ep <= freeUpTo || isVip(p) || (p.unlocked[seriesId] || []).includes(ep);
export const tasksToday = (p: ProfileState): Tasks => (p.tasks.date === todayKey() ? p.tasks : freshTasks());
export const checkedInToday = (p: ProfileState) => p.checkIn.lastDate === todayKey();
export const spinsLeft = (p: ProfileState) => (p.spin.lastDate === todayKey() ? 0 : 1) + p.spin.extra;
export const activeCoupon = (p: ProfileState, kind: 'pack' | 'vip') => p.vouchers.coupons.find((c) => c.kind === kind && c.expiresAt > Date.now());

type Store = {
  profiles: Profile[];
  activeId: string | null;
  /** Last selected profile; lets mounted screens keep rendering while a switch animates out. */
  lastId: string | null;
  data: Record<string, ProfileState>;
  booted: boolean;
  boot: () => void;
  selectProfile: (id: string | null) => void;
  addProfile: (name: string, color: string, kids: boolean) => string;
  removeProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setPin: (id: string, pin: string | null) => void;
  patch: (fn: (p: ProfileState) => Partial<ProfileState>) => void;
  // economy
  addCoins: (amount: number, label: string, type: TxType) => void;
  spendCoins: (amount: number, label: string) => boolean;
  unlockEpisode: (seriesId: string, ep: number, title: string, free?: boolean) => boolean;
  buyPack: (packId: string) => void;
  startVip: (plan: VipPlan, trial: boolean) => void;
  cancelVip: () => void;
  // playback
  setProgress: (seriesId: string, ep: number, pos: number, dur: number) => void;
  markWatched: (seriesId: string, ep: number, total: number) => void;
  pushHistory: (seriesId: string, ep: number) => void;
  // lists
  toggleMyList: (seriesId: string) => boolean;
  toggleLike: (key: string) => boolean;
  addRecentSearch: (q: string) => void;
  clearRecent: () => void;
  clearHistory: () => void;
  // rewards
  doCheckIn: () => number;
  completeAd: () => number;
  claimWatched: () => number;
  claimList: () => number;
  claimInvite: () => number;
  // lucky spin
  useSpin: () => boolean;
  addSpin: (n?: number) => void;
  claimSpin: (prizeId: string) => void;
  useFreeEpisode: (seriesId: string, ep: number, title: string) => boolean;
  useCoupon: (id: string) => void;
  // settings
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setSound: (on: boolean) => void;
  markNotificationRead: (id: string) => void;
  resetProfileData: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const active = () => {
        const { activeId, data } = get();
        return activeId ? data[activeId] : undefined;
      };
      const patch: Store['patch'] = (fn) =>
        set((s) => {
          if (!s.activeId) return s;
          const p = s.data[s.activeId];
          return { data: { ...s.data, [s.activeId]: { ...p, ...fn(p) } } };
        });
      const tx = (p: ProfileState, type: TxType, label: string, amount: number): Transaction[] => [{ id: uid(), type, label, amount, at: Date.now() }, ...p.transactions].slice(0, 60);

      return {
        profiles: [],
        activeId: null,
        lastId: null,
        data: {},
        booted: false,
        boot: () => {
          if (get().booted) return;
          const now = Date.now();
          const profiles: Profile[] = [
            { id: 'maya', name: 'Maya', color: 'teal', kids: false, createdAt: now - 30 * DAY },
            { id: 'dev', name: 'Dev', color: 'amber', kids: false, createdAt: now - 20 * DAY },
            { id: 'kids', name: 'Kids', color: 'violet', kids: true, createdAt: now - 10 * DAY },
          ];
          set({ profiles, data: { maya: seedState('maya'), dev: seedState('dev'), kids: seedState('kids') }, booted: true, activeId: null });
        },
        selectProfile: (id) => set((s) => ({ activeId: id, lastId: id ?? s.activeId ?? s.lastId })),
        addProfile: (name, color, kids) => {
          const id = uid();
          set((s) => ({ profiles: [...s.profiles, { id, name, color, kids, createdAt: Date.now() }], data: { ...s.data, [id]: seedState('new') } }));
          return id;
        },
        removeProfile: (id) =>
          set((s) => {
            const data = { ...s.data };
            delete data[id];
            return { profiles: s.profiles.filter((p) => p.id !== id), data, activeId: s.activeId === id ? null : s.activeId };
          }),
        renameProfile: (id, name) => set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, name } : p)) })),
        setPin: (id, pin) => set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, pin: pin || undefined } : p)) })),
        patch,

        addCoins: (amount, label, type) => patch((p) => ({ coins: p.coins + amount, transactions: tx(p, type, label, amount) })),
        spendCoins: (amount, label) => {
          const p = active();
          if (!p || totalCoins(p) < amount) return false;
          patch((q) => {
            let rest = amount;
            let bonus = { ...q.bonus };
            if (bonusLeft(q) > 0) {
              const useB = Math.min(bonus.amount, rest);
              bonus = { ...bonus, amount: bonus.amount - useB };
              rest -= useB;
            }
            return { coins: q.coins - rest, bonus, transactions: tx(q, 'unlock', label, -amount) };
          });
          return true;
        },
        unlockEpisode: (seriesId, ep, title, free = false) => {
          const p = active();
          if (!p) return false;
          if (!free && !get().spendCoins(EP_PRICE, `Unlocked EP ${ep} · ${title}`)) return false;
          patch((q) => ({ unlocked: { ...q.unlocked, [seriesId]: Array.from(new Set([...(q.unlocked[seriesId] || []), ep])).sort((a, b) => a - b) }, transactions: free ? tx(q, 'unlock', `Ad unlock EP ${ep} · ${title}`, 0) : q.transactions }));
          return true;
        },
        buyPack: (packId) => {
          const pack = PACKS.find((x) => x.id === packId);
          if (!pack) return;
          patch((q) => ({
            coins: q.coins + pack.coins,
            bonus: pack.bonus ? { amount: bonusLeft(q) + pack.bonus, expiresAt: Date.now() + 30 * DAY } : q.bonus,
            transactions: tx(q, 'topup', `Top-up · ${(pack.coins + pack.bonus).toLocaleString('en-US')} coins`, pack.coins + pack.bonus),
          }));
        },
        startVip: (plan, trial) => {
          const meta = PLANS.find((x) => x.id === plan)!;
          patch((q) => ({ vip: { plan, until: Date.now() + (trial ? 7 : meta.days) * DAY, trial }, transactions: tx(q, 'vip', trial ? `VIP ${meta.name} · free trial` : `VIP ${meta.name}`, 0) }));
        },
        cancelVip: () => patch(() => ({ vip: null })),

        useSpin: () => {
          const p = active();
          if (!p) return false;
          if (p.spin.lastDate !== todayKey()) { patch((q) => ({ spin: { ...q.spin, lastDate: todayKey() } })); return true; }
          if (p.spin.extra > 0) { patch((q) => ({ spin: { ...q.spin, extra: q.spin.extra - 1 } })); return true; }
          return false;
        },
        addSpin: (n = 1) => patch((q) => ({ spin: { ...q.spin, extra: q.spin.extra + n } })),
        claimSpin: (prizeId) => {
          const prize = SPIN_PRIZES.find((x) => x.id === prizeId);
          if (!prize) return;
          switch (prize.kind) {
            case 'coins': get().addCoins(prize.amount || 0, 'Lucky spin', 'reward'); break;
            case 'freeEp': patch((q) => ({ vouchers: { ...q.vouchers, freeEp: q.vouchers.freeEp + 1 } })); break;
            case 'coupon': patch((q) => ({ vouchers: { ...q.vouchers, coupons: [...q.vouchers.coupons, { id: uid(), kind: prize.couponKind || 'pack', pct: prize.pct || 10, expiresAt: Date.now() + 7 * DAY, label: prize.label }] } })); break;
            case 'vipDay': patch((q) => ({ vip: { plan: q.vip?.plan || 'weekly', until: Math.max(Date.now(), q.vip?.until || 0) + DAY, trial: q.vip ? q.vip.trial : true }, transactions: tx(q, 'vip', 'Lucky spin · VIP 24h pass', 0) })); break;
            case 'again': get().addSpin(1); break;
          }
        },
        useFreeEpisode: (seriesId, ep, title) => {
          const p = active();
          if (!p || p.vouchers.freeEp <= 0) return false;
          patch((q) => ({
            vouchers: { ...q.vouchers, freeEp: q.vouchers.freeEp - 1 },
            unlocked: { ...q.unlocked, [seriesId]: Array.from(new Set([...(q.unlocked[seriesId] || []), ep])).sort((a, b) => a - b) },
            transactions: tx(q, 'unlock', `Voucher unlock EP ${ep} · ${title}`, 0),
          }));
          return true;
        },
        useCoupon: (id) => patch((q) => ({ vouchers: { ...q.vouchers, coupons: q.vouchers.coupons.filter((c) => c.id !== id) } })),

        setProgress: (seriesId, ep, pos, dur) => patch((q) => ({ progress: { ...q.progress, [seriesId]: { ep, pos, dur, updatedAt: Date.now() } } })),
        markWatched: (seriesId, ep, total) =>
          patch((q) => {
            const t = tasksToday(q);
            const finished = ep >= total && !q.finished.includes(seriesId) ? [...q.finished, seriesId] : q.finished;
            return { tasks: { ...t, watched: Math.min(t.watched + 1, 99) }, finished };
          }),
        pushHistory: (seriesId, ep) =>
          patch((q) => {
            if (q.settings.incognito) return {};
            const rest = q.history.filter((h) => !(h.seriesId === seriesId && h.ep === ep));
            return { history: [{ seriesId, ep, at: Date.now() }, ...rest].slice(0, 100) };
          }),

        toggleMyList: (seriesId) => {
          const p = active();
          const has = !!p?.myList.includes(seriesId);
          patch((q) => ({ myList: has ? q.myList.filter((x) => x !== seriesId) : [seriesId, ...q.myList] }));
          return !has;
        },
        toggleLike: (key) => {
          const p = active();
          const has = !!p?.likes[key];
          patch((q) => {
            const likes = { ...q.likes };
            if (has) delete likes[key];
            else likes[key] = true;
            return { likes };
          });
          return !has;
        },
        addRecentSearch: (query) => patch((q) => ({ recentSearches: [query, ...q.recentSearches.filter((x) => x !== query)].slice(0, 6) })),
        clearRecent: () => patch(() => ({ recentSearches: [] })),
        clearHistory: () => patch(() => ({ history: [] })),

        doCheckIn: () => {
          const p = active();
          if (!p || checkedInToday(p)) return 0;
          const cont = p.checkIn.lastDate === yesterdayKey();
          const streak = cont ? (p.checkIn.streak % 7) + 1 : 1;
          const reward = CHECKIN_REWARDS[streak - 1];
          patch((q) => ({ checkIn: { streak, lastDate: todayKey() }, coins: q.coins + reward, transactions: tx(q, 'reward', `Daily check-in · day ${streak}`, reward) }));
          return reward;
        },
        completeAd: () => {
          const p = active();
          if (!p) return 0;
          const t = tasksToday(p);
          if (t.ads >= 5) return 0;
          patch((q) => ({ tasks: { ...t, ads: t.ads + 1 }, coins: q.coins + 10, transactions: tx(q, 'reward', 'Watched an ad', 10) }));
          return 10;
        },
        claimWatched: () => {
          const p = active();
          if (!p) return 0;
          const t = tasksToday(p);
          if (t.watched < 3 || t.watchedClaimed) return 0;
          patch((q) => ({ tasks: { ...t, watchedClaimed: true }, coins: q.coins + 20, transactions: tx(q, 'reward', 'Watched 3 episodes', 20) }));
          return 20;
        },
        claimList: () => {
          const p = active();
          if (!p) return 0;
          const t = tasksToday(p);
          if (t.listClaimed || p.myList.length === 0) return 0;
          patch((q) => ({ tasks: { ...t, listClaimed: true }, coins: q.coins + 5, transactions: tx(q, 'reward', 'Added a series to My List', 5) }));
          return 5;
        },
        claimInvite: () => {
          const p = active();
          if (!p) return 0;
          const t = tasksToday(p);
          if (t.inviteClaimed) return 0;
          patch((q) => ({ tasks: { ...t, inviteClaimed: true }, coins: q.coins + 100, transactions: tx(q, 'reward', 'Invited a friend', 100) }));
          return 100;
        },

        setSetting: (key, value) => patch((q) => ({ settings: { ...q.settings, [key]: value } })),
        setSound: (on) => patch(() => ({ soundOn: on })),
        markNotificationRead: (id) => patch((q) => ({ notificationsRead: q.notificationsRead.includes(id) ? q.notificationsRead : [...q.notificationsRead, id] })),
        resetProfileData: () =>
          set((s) => {
            if (!s.activeId) return s;
            const kind = (['maya', 'dev', 'kids'] as const).find((k) => k === s.activeId) || 'new';
            return { data: { ...s.data, [s.activeId]: seedState(kind) } };
          }),
      };
    },
    {
      name: 'showbox-v1',
      version: 1,
      // Older saves may lack newer settings keys: fill them from the defaults on load.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<typeof current>;
        const data = Object.fromEntries(Object.entries(p.data ?? {}).map(([k, v]) => [k, { ...v, settings: { ...DEFAULT_SETTINGS, ...v.settings }, spin: v.spin?.v === 2 ? v.spin : { lastDate: null, extra: Math.max(2, v.spin?.extra ?? 0), v: 2 }, vouchers: v.vouchers ?? { freeEp: 0, coupons: [] } }]));
        return { ...current, ...p, data: { ...current.data, ...data } };
      },
    }
  )
);

/** Active profile state (always defined once a profile is selected). */
export function useP(): ProfileState {
  return useStore((s) => s.data[s.activeId ?? s.lastId ?? Object.keys(s.data)[0]]) as ProfileState;
}
export function useProfile(): Profile | undefined {
  return useStore((s) => s.profiles.find((p) => p.id === s.activeId));
}
