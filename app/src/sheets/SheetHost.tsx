import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Coin, Icon } from '../components/Icon';
import { Sheet, Toggle } from '../components/ui';
import { toast } from '../components/toast';
import { byId } from '../data/catalog';
import { fmtNum } from '../lib/format';
import { success, tap } from '../lib/haptics';
import { useNav, type Sheet as SheetT } from '../nav/useNav';
import { EP_PRICE, PACKS, PLANS, activeCoupon, isUnlocked, totalCoins, useP, useStore, type VipPlan } from '../store/useStore';
import { SpinPopup } from '../components/SpinWheel';

export function SheetHost({ sheet }: { sheet: SheetT }) {
  const P = (sheet.params || {}) as Record<string, unknown>;
  switch (sheet.name) {
    case 'unlock': return <UnlockSheet seriesId={String(P.seriesId)} ep={Number(P.ep)} />;
    case 'episodes': return <EpisodesSheet seriesId={String(P.seriesId)} current={Number(P.current)} onPick={P.onPick as (ep: number) => void} />;
    case 'purchase': return <PurchaseSheet kind={P.kind as 'pack' | 'vip'} id={P.id as string} plan={P.plan as VipPlan} trial={!!P.trial} />;
    case 'profile': return <ProfileSheet />;
    case 'rate': return <RateSheet />;
    case 'confirm': return <ConfirmSheet title={String(P.title)} body={String(P.body || '')} confirmLabel={String(P.confirmLabel || 'Confirm')} danger={!!P.danger} onConfirm={P.onConfirm as () => void} />;
    case 'spin': return <SpinPopup />;
    case 'choice': return <ChoiceSheet title={String(P.title)} options={P.options as string[]} value={String(P.value)} onPick={P.onPick as (v: string) => void} />;
  }
}

function UnlockSheet({ seriesId, ep }: { seriesId: string; ep: number }) {
  const s = byId(seriesId)!;
  const p = useP();
  const close = useNav((n) => n.closeSheet);
  const push = useNav((n) => n.push);
  const showAd = useNav((n) => n.showAd);
  const hideAd = useNav((n) => n.hideAd);
  const unlockEpisode = useStore((st) => st.unlockEpisode);
  const useFreeEpisode = useStore((st) => st.useFreeEpisode);
  const setSetting = useStore((st) => st.setSetting);
  const voucher = p.vouchers.freeEp;
  const balance = totalCoins(p);
  const enough = balance >= EP_PRICE;

  const unlock = () => {
    tap();
    if (!enough) { close(); push('wallet'); toast(`You need ${EP_PRICE - balance} more coins`); return; }
    if (unlockEpisode(seriesId, ep, s.title)) { success(); close(); toast(`EP ${ep} unlocked · ${fmtNum(balance - EP_PRICE)} coins left`, { coin: true }); }
  };
  const viaAd = () => {
    tap();
    showAd({ seconds: 6, label: `Unlock EP ${ep} free`, onDone: () => { hideAd(); unlockEpisode(seriesId, ep, s.title, true); success(); close(); toast(`Ad watched · EP ${ep} unlocked`, { icon: 'unlock' }); } });
  };

  return (
    <Sheet onClose={close} title={`Unlock EP ${ep}`} sub={`${s.title} · ${s.episodes - ep + 1} episodes left`}>
      <div className="card2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Coin size={24} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><div className="muted small">Your balance</div><div style={{ fontSize: 15, fontWeight: 600 }}>{fmtNum(balance)} coins</div></div>
        </div>
        <button style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }} onClick={() => { tap(); close(); push('wallet'); }}>Get coins</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Episode price</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Coin size={18} /><span className="display" style={{ fontSize: 20, fontWeight: 800 }}>{EP_PRICE}</span></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><div style={{ fontSize: 14, fontWeight: 500 }}>Auto-unlock next episodes</div><div className="muted small">Spends {EP_PRICE} coins each time, no interruptions</div></div>
        <Toggle on={p.settings.autoUnlock} onChange={(v) => setSetting('autoUnlock', v)} label="Auto-unlock" />
      </div>
      {voucher > 0 && (
        <motion.button whileTap={{ scale: 0.97 }} className="btn primary lg block" onClick={() => { tap(); if (useFreeEpisode(seriesId, ep, s.title)) { success(); close(); toast(`Voucher used · EP ${ep} unlocked`, { icon: 'unlock' }); } }}>
          <Icon name="gift" size={20} /><span>Use free episode voucher · {voucher} left</span>
        </motion.button>
      )}
      <motion.button whileTap={{ scale: 0.97 }} className={`btn ${voucher > 0 ? 'ghost' : 'primary'} lg block`} onClick={unlock}><Coin size={20} dark={voucher === 0} /><span>{enough ? `Unlock for ${EP_PRICE} coins` : 'Get coins to unlock'}</span></motion.button>
      <button className="btn ghost block" onClick={viaAd}><Icon name="ad" size={18} /><span>Watch an ad to unlock free</span></button>
      <div className="muted small" style={{ textAlign: 'center' }}>VIP watches every episode ad-free. <button style={{ color: 'var(--accent)', fontWeight: 600 }} onClick={() => { tap(); close(); push('vip'); }}>Try VIP</button></div>
    </Sheet>
  );
}

function EpisodesSheet({ seriesId, current, onPick }: { seriesId: string; current: number; onPick: (ep: number) => void }) {
  const s = byId(seriesId)!;
  const p = useP();
  const close = useNav((n) => n.closeSheet);
  const openSheet = useNav((n) => n.openSheet);
  const pr = p.progress[seriesId];
  return (
    <Sheet onClose={close} title="Episodes" sub={`${s.title} · ${s.episodes} episodes`}>
      <div className="epgrid" style={{ overflowY: 'auto', maxHeight: 360, paddingBottom: 4 }}>
        {Array.from({ length: s.episodes }, (_, i) => i + 1).map((ep) => {
          const locked = !isUnlocked(p, seriesId, ep, s.freeUpTo);
          const watched = pr ? ep < pr.ep : false;
          return (
            <button key={ep} className={`ep-tile${ep === current ? ' current' : locked ? ' locked' : watched ? ' watched' : ''}`} onClick={() => { tap(); if (locked) { openSheet('unlock', { seriesId, ep }); return; } close(); setTimeout(() => onPick(ep), 60); }}>
              {ep}{locked && <Icon name="lock" size={11} stroke={2.2} className="lk" />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function PurchaseSheet({ kind, id, plan, trial }: { kind: 'pack' | 'vip'; id?: string; plan?: VipPlan; trial: boolean }) {
  const p = useP();
  const close = useNav((n) => n.closeSheet);
  const buyPack = useStore((st) => st.buyPack);
  const startVip = useStore((st) => st.startVip);
  const useCoupon = useStore((st) => st.useCoupon);
  const [stage, setStage] = useState<'idle' | 'paying' | 'done'>('idle');
  const pack = kind === 'pack' ? PACKS.find((x) => x.id === id) : undefined;
  const pl = kind === 'vip' ? PLANS.find((x) => x.id === plan) : undefined;
  const title = pack ? `${fmtNum(pack.coins + pack.bonus)} coins` : `VIP ${pl?.name}`;
  const full = trial ? 0 : pack ? pack.price : pl?.price || 0;
  const coupon = trial ? undefined : activeCoupon(p, kind);
  const price = coupon ? Math.round(full * (1 - coupon.pct / 100) * 100) / 100 : full;

  const pay = () => {
    tap();
    setStage('paying');
    setTimeout(() => {
      if (pack) buyPack(pack.id);
      else if (pl) startVip(pl.id, trial);
      if (coupon) useCoupon(coupon.id);
      success();
      setStage('done');
      setTimeout(() => { close(); toast(pack ? `+${fmtNum(pack.coins + pack.bonus)} coins added` : trial ? 'VIP trial started · every episode unlocked' : `VIP ${pl?.name} active`, { coin: !!pack, icon: pack ? undefined : 'crown' }); }, 900);
    }, 1200);
  };

  return (
    <Sheet onClose={stage === 'idle' ? close : () => {}} title={stage === 'done' ? 'Done' : 'Confirm purchase'} sub="Simulated checkout, nothing is charged">
      <AnimatePresence mode="wait">
        {stage === 'done' ? (
          <motion.div key="done" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0 20px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={36} stroke={2.6} /></div>
            <div className="title-l">{pack ? `${fmtNum(pack.coins + pack.bonus)} coins added` : 'Welcome to VIP'}</div>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card2" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>{pack ? <Coin size={24} /> : <Icon name="crown" />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
                <div className="muted small">{pack ? (pack.bonus ? `${fmtNum(pack.coins)} coins + ${fmtNum(pack.bonus)} bonus` : 'One-time top-up') : trial ? `Free for 7 days, then $${pl?.price.toFixed(2)} / ${pl?.per}` : `Renews every ${pl?.per}`}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {coupon && <span className="muted small" style={{ textDecoration: 'line-through' }}>${full.toFixed(2)}</span>}
                <div className="display" style={{ fontSize: 20, fontWeight: 800 }}>{price ? `$${price.toFixed(2)}` : '$0.00'}</div>
              </div>
            </div>
            {coupon && (
              <div className="coupon-line"><Icon name="gift" size={16} /><span>Lucky spin coupon · {coupon.pct}% off applied</span></div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
              <div style={{ width: 36, height: 24, borderRadius: 5, background: 'linear-gradient(135deg, #3b3b3b, #1a1a1a)', border: '1px solid rgba(255,255,255,.12)' }} />
              <span>Demo card ending 4242</span>
              <span className="muted" style={{ marginLeft: 'auto' }}>Change</span>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} className="btn primary lg block" disabled={stage === 'paying'} onClick={pay}>
              {stage === 'paying' ? <span className="spin" /> : <span>{trial ? 'Start free trial' : `Pay $${price.toFixed(2)}`}</span>}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

function ProfileSheet() {
  const profiles = useStore((s) => s.profiles);
  const activeId = useStore((s) => s.activeId);
  const selectProfile = useStore((s) => s.selectProfile);
  const close = useNav((n) => n.closeSheet);
  const push = useNav((n) => n.push);
  const popAll = useNav((n) => n.popAll);
  const setTab = useNav((n) => n.setTab);
  return (
    <Sheet onClose={close} title="Switch profile">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {profiles.map((pr) => (
          <div key={pr.id} className="list-row" onClick={() => { tap(); close(); if (pr.id !== activeId) { selectProfile(pr.id); popAll(); setTab('home'); toast(`Switched to ${pr.name}`, { icon: 'check' }); } }}>
            <div className={`avatar av-${pr.color}`} style={{ width: 40, height: 40, borderRadius: 12, fontSize: 18 }}>{pr.name.slice(0, 1).toUpperCase()}</div>
            <div style={{ flex: 1 }}>{pr.name}{pr.kids && <span className="muted small"> · Kids</span>}</div>
            {pr.id === activeId && <Icon name="check" size={18} style={{ color: 'var(--accent)' }} />}
          </div>
        ))}
      </div>
      <button className="btn outline block" onClick={() => { tap(); close(); push('profiles'); }}><Icon name="edit" size={18} /><span>Manage profiles</span></button>
    </Sheet>
  );
}

function RateSheet() {
  const close = useNav((n) => n.closeSheet);
  const [v, setV] = useState(0);
  return (
    <Sheet onClose={close} title="Rate this series">
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '6px 0' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.button key={i} whileTap={{ scale: 0.8 }} animate={{ scale: v >= i ? 1.1 : 1 }} onClick={() => { tap(); setV(i); }} style={{ color: v >= i ? 'var(--accent)' : 'var(--dim)' }}><Icon name="star" size={40} fill={v >= i} /></motion.button>
        ))}
      </div>
      <button className="btn primary block" disabled={!v} onClick={() => { close(); toast(v >= 4 ? 'Thanks for the love' : 'Thanks for rating', { icon: 'check' }); }}>Submit</button>
    </Sheet>
  );
}

function ConfirmSheet({ title, body, confirmLabel, danger, onConfirm }: { title: string; body: string; confirmLabel: string; danger: boolean; onConfirm: () => void }) {
  const close = useNav((n) => n.closeSheet);
  return (
    <Sheet onClose={close} title={title}>
      {body && <div className="muted" style={{ fontSize: 14, lineHeight: '20px' }}>{body}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn ghost" style={{ flex: 1 }} onClick={close}>Keep</button>
        <button className="btn primary" style={{ flex: 1, background: danger ? 'var(--danger)' : undefined, color: danger ? '#fff' : undefined }} onClick={() => { tap(); close(); onConfirm?.(); }}>{confirmLabel}</button>
      </div>
    </Sheet>
  );
}

function ChoiceSheet({ title, options, value, onPick }: { title: string; options: string[]; value: string; onPick: (v: string) => void }) {
  const close = useNav((n) => n.closeSheet);
  return (
    <Sheet onClose={close} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {options.map((o) => (
          <div key={o} className="list-row" onClick={() => { tap(); onPick(o); close(); }}>
            <span style={{ flex: 1 }}>{o}</span>
            {o === value && <Icon name="check" size={18} style={{ color: 'var(--accent)' }} />}
          </div>
        ))}
      </div>
    </Sheet>
  );
}
