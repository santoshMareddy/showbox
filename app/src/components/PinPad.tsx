import { motion } from 'framer-motion';
import { useState } from 'react';
import { Icon } from './Icon';
import { success, tap } from '../lib/haptics';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

/**
 * Four-digit PIN pad, used to open a locked profile and to set or change a profile PIN.
 *  - verify: the PIN that must be matched (wrong entry shakes and clears)
 *  - confirm: ask for the PIN twice (used when setting a new one)
 */
export function PinModal({ title, sub, verify, confirm = false, onDone, onClose }: { title: string; sub?: string; verify?: string; confirm?: boolean; onDone: (pin: string) => void; onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [hint, setHint] = useState<string | null>(null);

  const fail = (msg: string) => { tap(); setShake((n) => n + 1); setHint(msg); setPin(''); };

  const complete = (value: string) => {
    if (verify !== undefined) {
      if (value === verify) { success(); onDone(value); } else fail('Wrong PIN, try again');
      return;
    }
    if (confirm) {
      if (first === null) { setFirst(value); setPin(''); setHint(null); return; }
      if (value === first) { success(); onDone(value); } else { setFirst(null); fail('PINs did not match, start again'); }
      return;
    }
    success();
    onDone(value);
  };

  const press = (k: string) => {
    tap();
    if (k === 'del') { setPin((p) => p.slice(0, -1)); return; }
    if (!k || pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) window.setTimeout(() => complete(next), 120);
  };

  const heading = confirm && first !== null ? 'Confirm your PIN' : title;

  return (
    <div className="pin-wrap" onClick={onClose}>
      <motion.div className="pin-card" initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} onClick={(e) => e.stopPropagation()}>
        <div className="pin-lock"><Icon name="lock" size={22} /></div>
        <div className="display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{heading}</div>
        <div className="muted small" style={{ minHeight: 16, textAlign: 'center' }}>{hint ?? sub ?? ' '}</div>
        <motion.div key={shake} className="pin-dots" animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : undefined} transition={{ duration: 0.42 }}>
          {[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}
        </motion.div>
        <div className="pin-keys">
          {KEYS.map((k, i) => (
            <button key={i} className={k === '' ? 'blank' : ''} disabled={k === ''} onClick={() => press(k)} aria-label={k === 'del' ? 'Delete' : k}>
              {k === 'del' ? <Icon name="back" size={22} /> : k}
            </button>
          ))}
        </div>
        <button className="btn ghost block" onClick={() => { tap(); onClose(); }}>Cancel</button>
      </motion.div>
    </div>
  );
}
