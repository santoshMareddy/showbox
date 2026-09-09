import { MotionGlobalConfig, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { toast } from './toast';
import { spring } from './ui';
import { success, tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { SPIN_PRIZES, spinsLeft, useP, useStore, type SpinPrize } from '../store/useStore';

const COLORS = ['#ff3d8a', '#7c3aed', '#2c2250', '#ffb43c'];
const INK = ['#fff', '#fff', '#fff', '#1a1030'];
const N = SPIN_PRIZES.length;
const SEG = 360 / N;
const C = 140; // centre of the 280×280 wheel
const R = 128; // wedge radius

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 0° = top, clockwise
const wedge = (i: number) => {
  const a0 = rad(i * SEG);
  const a1 = rad((i + 1) * SEG);
  return `M${C} ${C} L${(C + R * Math.cos(a0)).toFixed(2)} ${(C + R * Math.sin(a0)).toFixed(2)} A${R} ${R} 0 0 1 ${(C + R * Math.cos(a1)).toFixed(2)} ${(C + R * Math.sin(a1)).toFixed(2)} Z`;
};
const pick = () => {
  const total = SPIN_PRIZES.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < N; i++) { r -= SPIN_PRIZES[i].weight; if (r <= 0) return i; }
  return N - 1;
};

function WheelFace({ labels = true }: { labels?: boolean }) {
  return (
    <svg viewBox="0 0 280 280" aria-hidden="true">
      {SPIN_PRIZES.map((pz, i) => <path key={pz.id} d={wedge(i)} fill={COLORS[i % COLORS.length]} stroke="#1a1030" strokeWidth={labels ? 2 : 6} />)}
      {labels && SPIN_PRIZES.map((pz, i) => {
        const mid = i * SEG + SEG / 2;
        const x = C + 86 * Math.cos(rad(mid));
        const y = C + 86 * Math.sin(rad(mid));
        return (
          <text key={pz.id} x={x} y={y} fontSize="13" fontWeight="800" fill={INK[i % INK.length]} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${mid} ${x} ${y})`} style={{ fontFamily: 'var(--display)', letterSpacing: '0.01em' }}>{pz.short}</text>
        );
      })}
      {labels && Array.from({ length: 16 }, (_, k) => {
        const a = rad(k * (360 / 16));
        return <circle key={k} cx={C + 136 * Math.cos(a)} cy={C + 136 * Math.sin(a)} r="3" fill="#fff" opacity={k % 2 ? 0.9 : 0.45} />;
      })}
      <circle cx={C} cy={C} r="40" fill="#1a1030" />
    </svg>
  );
}

/** Small spinning wheel used on the side tab and the Rewards card. */
export function MiniWheel() {
  return <WheelFace labels={false} />;
}

/** Floating side tab that opens the Lucky Spin pop-up. */
export function SpinTab() {
  const p = useP();
  const openSheet = useNav((n) => n.openSheet);
  const spins = spinsLeft(p);
  return (
    <motion.button className="spin-tab" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }} whileTap={{ scale: 0.94 }} onClick={() => { tap(); openSheet('spin'); }} aria-label="Lucky spin">
      <span className="wheel-mini"><MiniWheel /></span>
      <span className="lbl">Spin</span>
      {spins > 0 && <i className="dot" />}
    </motion.button>
  );
}

/** The pop-up game: one free spin a day, extra spins from the wheel itself or from an ad. */
export function SpinPopup() {
  const p = useP();
  const close = useNav((n) => n.closeSheet);
  const push = useNav((n) => n.push);
  const showAd = useNav((n) => n.showAd);
  const hideAd = useNav((n) => n.hideAd);
  const useSpin = useStore((s) => s.useSpin);
  const claimSpin = useStore((s) => s.claimSpin);
  const addSpin = useStore((s) => s.addSpin);
  const spins = spinsLeft(p);
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinPrize | null>(null);
  const [nudge, setNudge] = useState(0); // shakes the ad button when someone taps SPIN with nothing left
  const pending = useRef<SpinPrize | null>(null);
  const live = useRef(false); // true while a spin is in flight (refs, so the timer and the animation callback agree)
  const ticker = useRef(0);
  const doneTimer = useRef(0);
  useEffect(() => () => { window.clearInterval(ticker.current); window.clearTimeout(doneTimer.current); }, []);

  const spin = () => {
    if (spinning || result) return;
    tap();
    if (!useSpin()) { setNudge((n) => n + 1); toast('No spins left today · watch an ad for one', { icon: 'info' }); return; }
    const i = pick();
    pending.current = SPIN_PRIZES[i];
    const target = 360 - (i * SEG + SEG / 2); // wheel angle that puts wedge i under the pointer
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const next = rot + 5 * 360 + ((target - (rot % 360) + 360) % 360) + jitter;
    live.current = true;
    setSpinning(true);
    setRot(next);
    window.clearInterval(ticker.current);
    ticker.current = window.setInterval(() => tap(4), 140);
    window.setTimeout(() => window.clearInterval(ticker.current), 2800);
    // Fallback in case the animation callback never fires (reduced motion, background tab).
    window.clearTimeout(doneTimer.current);
    doneTimer.current = window.setTimeout(landed, MotionGlobalConfig.skipAnimations ? 80 : 4700);
  };
  const landed = () => {
    if (!live.current) return;
    live.current = false;
    window.clearTimeout(doneTimer.current);
    window.clearInterval(ticker.current);
    setSpinning(false);
    if (pending.current) { success(); setResult(pending.current); }
  };
  const claim = () => {
    if (!result) return;
    tap();
    claimSpin(result.id);
    toast(result.kind === 'again' ? 'Extra spin added' : `${result.label} · claimed`, { coin: result.kind === 'coins', icon: result.kind === 'coins' ? undefined : result.kind === 'vipDay' ? 'crown' : 'check' });
    setResult(null);
  };
  const adSpin = () => {
    tap();
    showAd({ seconds: 6, label: 'Earn a spin', onDone: () => { hideAd(); addSpin(1); success(); toast('+1 spin', { icon: 'check' }); } });
  };
  const dismiss = () => { if (!spinning) { tap(); close(); } };

  return (
    <motion.div className="popup-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={dismiss}>
      <motion.div className="spin-card" initial={{ scale: 0.86, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 12, opacity: 0 }} transition={spring} onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={dismiss} aria-label="Close" disabled={spinning}><Icon name="close" size={18} /></button>
        <div className="display" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Lucky Spin</div>
        <div className="muted" style={{ fontSize: 13, marginTop: -6 }}>{spinning ? 'Spinning…' : spins > 0 ? `${spins} spin${spins > 1 ? 's' : ''} ready · 1 free spin every day` : 'Next free spin tomorrow'}</div>

        <div className="wheel-wrap">
          <svg className="wheel-pointer" viewBox="0 0 26 32" aria-hidden="true"><path d="M13 32L1.5 9a12 12 0 1 1 23 0z" fill="#fff" /><circle cx="13" cy="11.5" r="4" fill="#ff3d8a" /></svg>
          <motion.div className="wheel" animate={{ rotate: rot }} transition={{ duration: spinning ? 4.4 : 0, ease: [0.12, 0.8, 0.12, 1] }} onAnimationComplete={landed}>
            <WheelFace />
          </motion.div>
          <button className="wheel-hub" onClick={spin} disabled={spinning || !!result} aria-label="Spin the wheel">{spinning ? '…' : 'SPIN'}</button>
          {result && Array.from({ length: 16 }, (_, k) => {
            const a = (k / 16) * Math.PI * 2;
            const d = 100 + (k % 3) * 34;
            return <motion.i key={k} className="confetti" style={{ background: COLORS[k % COLORS.length] }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 30, opacity: 0, rotate: 300, scale: 0.6 }} transition={{ duration: 1.1, ease: 'easeOut' }} />;
          })}
        </div>

        <motion.div key={result ? `result-${result.id}` : spinning ? 'spinning' : spins === 0 ? 'empty' : 'hint'} className={result || (spins === 0 && !spinning) ? 'spin-result' : 'muted small'} style={result || (spins === 0 && !spinning) ? undefined : { textAlign: 'center' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          {spinning ? (
            <>Good luck…</>
          ) : result ? (
            <>
              <div className="muted small">You won</div>
              <div className="display gtext" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center' }}>{result.label}</div>
              <button className="btn primary block" onClick={claim}>{result.kind === 'again' ? 'Take the extra spin' : 'Claim'}</button>
            </>
          ) : spins === 0 ? (
            <>
              <div className="muted small" style={{ textAlign: 'center' }}>Your free spin comes back at midnight.</div>
              <motion.button key={nudge} className="btn ghost block" animate={nudge ? { x: [0, -8, 8, -6, 6, 0] } : undefined} transition={{ duration: 0.4 }} onClick={adSpin}><Icon name="ad" size={18} /><span>Watch an ad for +1 spin</span></motion.button>
            </>
          ) : (
            <>Free episodes, coins, top-up and VIP discounts, a VIP day pass</>
          )}
        </motion.div>

        {(p.vouchers.freeEp > 0 || p.vouchers.coupons.length > 0) && (
          <button className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { tap(); close(); push('wallet'); }}>
            <Icon name="gift" size={14} style={{ color: 'var(--accent)' }} />
            <span>{p.vouchers.freeEp > 0 ? `${p.vouchers.freeEp} free episode voucher${p.vouchers.freeEp > 1 ? 's' : ''}` : ''}{p.vouchers.freeEp > 0 && p.vouchers.coupons.length > 0 ? ' · ' : ''}{p.vouchers.coupons.length > 0 ? `${p.vouchers.coupons.length} coupon${p.vouchers.coupons.length > 1 ? 's' : ''}` : ''}</span>
            <Icon name="chevron" size={12} />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
