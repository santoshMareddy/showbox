import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Coin, Icon, type IconName } from './Icon';
import { useToast } from './toast';
import { tap } from '../lib/haptics';
import { useNav, type Tab } from '../nav/useNav';
import { totalCoins, useP } from '../store/useStore';
import { fmtNum } from '../lib/format';
import { posterUrl, type Series } from '../data/catalog';

export const spring = { type: 'spring', stiffness: 320, damping: 32, mass: 0.9 } as const;
export const softSpring = { type: 'spring', stiffness: 260, damping: 28 } as const;

/* ---------- Tab bar ---------- */
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'foryou', label: 'For You', icon: 'foryou' },
  { id: 'mylist', label: 'My List', icon: 'list' },
  { id: 'rewards', label: 'Rewards', icon: 'gift' },
  { id: 'me', label: 'Me', icon: 'user' },
];

export function TabBar({ overlay = false }: { overlay?: boolean }) {
  const tab = useNav((s) => s.tab);
  const setTab = useNav((s) => s.setTab);
  return (
    <nav className={`tabbar${overlay ? ' overlay' : ''}`}>
      {TABS.map((t) => (
        <button key={t.id} className={`tab${tab === t.id ? ' on' : ''}`} onClick={() => { if (tab !== t.id) { tap(); setTab(t.id); } }} aria-label={t.label}>
          <motion.span animate={{ scale: tab === t.id ? 1 : 0.94, y: tab === t.id ? -1 : 0 }} transition={softSpring} style={{ display: 'flex' }}>
            <Icon name={t.icon} grad={tab === t.id} />
          </motion.span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------- Logo ---------- */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 3.2a1.4 1.4 0 0 1 2.1-1.2l13.2 8.4a1.4 1.4 0 0 1 0 2.4L7.6 21.2a1.4 1.4 0 0 1-2.1-1.2z" fill="url(#sb-grad)" />
      <circle cx="8.2" cy="7" r="1.1" fill="var(--bg)" />
      <circle cx="8.2" cy="12" r="1.1" fill="var(--bg)" />
      <circle cx="8.2" cy="17" r="1.1" fill="var(--bg)" />
    </svg>
  );
}

export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <div className="wordmark" style={{ fontSize: size }}>
      <LogoMark size={size + 2} />
      <span>Show<span className="g">Box</span></span>
    </div>
  );
}

/* ---------- Header ---------- */
export function Header({ title, right, onBack, transparent = false }: { title?: ReactNode; right?: ReactNode; onBack?: () => void; transparent?: boolean }) {
  const pop = useNav((s) => s.pop);
  return (
    <div className="topbar plainbar" style={transparent ? { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 3, padding: 'var(--sat) 16px 0 16px' } : undefined}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
        <button className={transparent ? 'circ' : 'iconbtn'} onClick={() => { tap(); (onBack || pop)(); }} aria-label="Back">
          <Icon name="back" />
        </button>
        {title && <div className="title-l" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{right}</div>
    </div>
  );
}

/* ---------- Coin pill ---------- */
export function CountUp({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const c = animate(from, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [value]);
  return <span className={className} style={style}>{fmtNum(shown)}</span>;
}

export function CoinPill({ glass = false, plus = false }: { glass?: boolean; plus?: boolean }) {
  const p = useP();
  const push = useNav((s) => s.push);
  const total = totalCoins(p);
  return (
    <motion.button className={`pill${glass ? ' glass' : ''}`} whileTap={{ scale: 0.95 }} onClick={() => { tap(); push('wallet'); }} aria-label="Wallet">
      <Coin size={glass ? 18 : 16} />
      <CountUp value={total} />
      {plus && (
        <span style={{ width: 22, height: 22, borderRadius: 11, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={14} stroke={2.2} />
        </span>
      )}
    </motion.button>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button className={`toggle${on ? ' on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => { tap(); onChange(!on); }}>
      <i />
    </button>
  );
}

/* ---------- Lazy image: loads only when within ~one screen of view (rows are long, relays are slow) ---------- */
export function LazyImg({ src, alt = '', className, style, draggable = false }: { src: string; alt?: string; className?: string; style?: React.CSSProperties; draggable?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near || !('IntersectionObserver' in window)) { if (!near) setNear(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: '360px 480px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return <img ref={ref} src={near ? src : undefined} alt={alt} className={className} style={style} draggable={draggable} decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />;
}

/* ---------- Poster ---------- */
export function Poster({ s, w, h, badge, progress, title = true, onClick, radius = 10, style, children }: { s: Series; w: number | string; h: number; badge?: string; progress?: number; title?: boolean; onClick?: () => void; radius?: number; style?: React.CSSProperties; children?: ReactNode }) {
  return (
    <div className="poster" style={{ width: w, height: h, borderRadius: radius, background: s.art, ...style }} onClick={onClick} role={onClick ? 'button' : undefined}>
      <LazyImg src={posterUrl(s)} />
      <div className="shade" />
      {badge && <div className="badge">{badge}</div>}
      {title && <div className="t">{s.title}</div>}
      {children}
      {typeof progress === 'number' && (
        <div className="prog"><i style={{ width: `${Math.max(2, Math.min(100, progress * 100))}%` }} /></div>
      )}
    </div>
  );
}

/* ---------- Row ---------- */
export function Row({ title, onMore, children, gap = 9, top = 18 }: { title: string; onMore?: () => void; children: ReactNode; gap?: number; top?: number }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: top }}>
      <div className="section-h">
        <span>{title}</span>
        {onMore && (
          <button className="more" onClick={onMore}>
            See all <Icon name="chevron" size={16} />
          </button>
        )}
      </div>
      <div className="hrow" style={{ gap }}>{children}</div>
    </section>
  );
}

/* ---------- Skeleton ---------- */
export function Skel({ w, h, r = 10, style }: { w: number | string; h: number; r?: number; style?: React.CSSProperties }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, flex: 'none', ...style }} />;
}

/* ---------- Toasts ---------- */
export function ToastHost({ raised = false }: { raised?: boolean }) {
  const items = useToast((s) => s.items);
  return (
    <div className="toast-host" style={raised ? { bottom: 'calc(var(--sab) + 96px)' } : undefined}>
      <AnimatePresence>
        {items.map((t) => (
          <motion.div key={t.id} className="toast" initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={softSpring}>
            {t.coin ? <Coin size={14} /> : t.icon ? <Icon name={t.icon} size={16} style={{ color: 'var(--accent)' }} /> : null}
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Sheet ---------- */
export function Sheet({ children, onClose, title, sub }: { children: ReactNode; onClose: () => void; title?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="sheet-wrap">
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
      <motion.div
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={spring}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 600) onClose(); }}
      >
        <div className="handle" />
        {(title || sub) && (
          <div className="sheet-h">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              {title && <div className="title-l">{title}</div>}
              {sub && <div className="muted" style={{ fontSize: 13 }}>{sub}</div>}
            </div>
            <button className="close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- Press wrapper ---------- */
export function Press({ children, onClick, className, style, scale = 0.97 }: { children: ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties; scale?: number }) {
  return (
    <motion.div className={className} style={style} whileTap={{ scale }} onClick={onClick}>
      {children}
    </motion.div>
  );
}

/* ---------- Segmented tabs with animated underline ---------- */
export function Segments({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)' }}>
      {items.map((it) => (
        <button key={it} onClick={() => { tap(); onChange(it); }} style={{ position: 'relative', padding: '0 0 10px', fontSize: 15, fontWeight: value === it ? 600 : 500, color: value === it ? 'var(--text)' : 'var(--muted-2)' }}>
          {it}
          {value === it && <motion.div layoutId="seg-underline" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: 'var(--accent)' }} transition={softSpring} />}
        </button>
      ))}
    </div>
  );
}
