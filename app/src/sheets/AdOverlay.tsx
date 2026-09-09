import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { tap } from '../lib/haptics';
import type { AdRequest } from '../nav/useNav';

export function AdOverlay({ req }: { req: AdRequest }) {
  const [left, setLeft] = useState(req.seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const r = 18;
  const c = 2 * Math.PI * r;
  const done = left <= 0;

  return (
    <motion.div className="ad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="creative">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 18, ease: 'linear' }} style={{ position: 'absolute', width: 520, height: 520, borderRadius: 260, border: '1px dashed rgba(255,61,138,.25)', top: '50%', left: '50%', marginLeft: -260, marginTop: -260 }} />
        <div className="muted" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Sponsored</div>
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2.2 }} style={{ width: 88, height: 88, borderRadius: 44, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="crown" size={44} /></motion.div>
        <div className="display" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>ShowBox VIP</div>
        <div className="muted" style={{ fontSize: 14, lineHeight: '20px', maxWidth: 260 }}>Every episode unlocked. No ads, ever. Seven days free.</div>
        <div className="ring">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={r} fill="rgba(0,0,0,.4)" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
            <circle cx="22" cy="22" r={r} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (left / req.seconds)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <b>{done ? <Icon name="check" size={16} stroke={2.4} /> : left}</b>
        </div>
      </div>
      <div style={{ padding: '16px 20px calc(var(--sab) + 20px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="muted small" style={{ textAlign: 'center' }}>{req.label || 'Reward after the ad'}</div>
        <motion.button whileTap={{ scale: 0.97 }} className="btn primary lg block" disabled={!done} onClick={() => { tap(); req.onDone(); }}>{done ? 'Claim reward' : `Reward in ${left}s`}</motion.button>
      </div>
    </motion.div>
  );
}
