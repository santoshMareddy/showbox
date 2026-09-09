import { motion } from 'framer-motion';
import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Header } from '../components/ui';
import { fmtDate } from '../lib/format';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { PLANS, isVip, useP, useStore, type VipPlan } from '../store/useStore';

const BENEFITS = ['Every episode unlocked', 'No ads, no coin unlocks', 'HD on every device', 'Early access to new series'];

export function VipScreen() {
  const p = useP();
  const openSheet = useNav((s) => s.openSheet);
  const cancelVip = useStore((s) => s.cancelVip);
  const [plan, setPlan] = useState<VipPlan>(p.vip?.plan || 'monthly');
  const active = isVip(p);
  const meta = PLANS.find((x) => x.id === plan)!;

  return (
    <div className="screen">
      <div style={{ position: 'absolute', left: 60, top: -120, width: 270, height: 270, borderRadius: 135, background: 'radial-gradient(circle, rgba(255,61,138,.28) 0%, rgba(255,61,138,0) 65%)', filter: 'blur(10px)', pointerEvents: 'none' }} />
      <Header title="ShowBox VIP" />
      <div className="scroll plain">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 20px 0' }}>
          <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Icon name="crown" /></motion.div>
          <div className="display" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>{active ? 'You are VIP.' : 'Watch everything.'}</div>
          <div className="muted" style={{ fontSize: 14, lineHeight: '20px' }}>{active ? `${p.vip!.trial ? 'Free trial' : `${meta.name} plan`} · renews ${fmtDate(p.vip!.until)}` : 'Every episode of every series unlocked, with no ads and no coins.'}</div>
        </div>

        <div style={{ padding: '16px 20px 0' }}>
          {BENEFITS.map((b, i) => (
            <motion.div key={b} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 28, fontSize: 14, color: 'var(--text-2)' }}>
              <Icon name="check" size={18} stroke={2.2} style={{ color: 'var(--accent)' }} /><span>{b}</span>
            </motion.div>
          ))}
        </div>

        {!active && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '22px 20px 0' }}>
            {PLANS.map((pl) => (
              <motion.div key={pl.id} whileTap={{ scale: 0.98 }} onClick={() => { tap(); setPlan(pl.id); }} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: plan === pl.id ? '#1a1710' : 'var(--surface)', border: `1px solid ${plan === pl.id ? 'var(--accent)' : 'var(--border)'}`, transition: 'border-color 160ms, background 160ms' }}>
                {pl.id === 'monthly' && <div style={{ position: 'absolute', right: 14, top: -10, height: 20, padding: '0 8px', borderRadius: 6, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center' }}>Best value</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${plan === pl.id ? 'var(--accent)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan === pl.id && <motion.div layoutId="dot" style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--accent)' }} />}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{pl.name}</div><div className="muted small">{pl.note}</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><span className="display" style={{ fontSize: 18, fontWeight: 800 }}>${pl.price.toFixed(2)}</span><span className="muted small">/ {pl.per}</span></div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ padding: '18px 20px 0' }}>
          {active ? (
            <button className="btn outline block" onClick={() => { tap(); openSheet('confirm', { title: 'Cancel VIP?', body: 'You keep VIP until the end of the current period in a real app. In this demo it ends right away.', confirmLabel: 'Cancel VIP', danger: true, onConfirm: () => cancelVip() }); }}>Cancel VIP</button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} className="btn primary lg block" onClick={() => { tap(); openSheet('purchase', { kind: 'vip', plan, trial: plan === 'monthly' }); }}>
              {plan === 'monthly' ? 'Start 7-day free trial' : `Subscribe · $${meta.price.toFixed(2)} / ${meta.per}`}
            </motion.button>
          )}
        </div>
        <div className="muted" style={{ padding: '12px 28px 0', fontSize: 11, lineHeight: '15px', textAlign: 'center' }}>Sample prices for the demo. Nothing is charged. A real app would renew automatically at the plan price until cancelled.</div>
      </div>
    </div>
  );
}
