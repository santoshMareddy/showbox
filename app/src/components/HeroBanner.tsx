import { MotionGlobalConfig } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { tap } from '../lib/haptics';
import { backdropUrl, type Series } from '../data/catalog';

export type HeroBannerProps = {
  items: Series[];
  onOpen: (s: Series) => void;
  onPlay: (s: Series) => void;
  onToggleList: (s: Series) => void;
  continueEp: (s: Series) => number | undefined;
  inList: (s: Series) => boolean;
  paused?: boolean;
  interval?: number;
};

// First sentence of the synopsis, trimmed to a banner-sized line.
const tagline = (s: Series) => {
  const first = s.synopsis.split(/(?<=[.!?])\s/)[0] || s.synopsis;
  return first.length > 120 ? `${first.slice(0, 117).replace(/\s+\S*$/, '')}…` : first;
};

const tag = (s: Series, i: number, ep: number | undefined) => (ep ? 'Continue watching' : i === 0 ? 'Featured' : s.status === 'Ongoing' ? 'New episodes' : 'Top rated');

/**
 * Full-width landscape hero, dashboard style: one show per slide, image bleeding under a dark
 * fade, outlined tag, big uppercase title, tagline, Watch Now inside the banner, dots below.
 * Slides on its own every `interval`, loops, and holds while touched, off screen or paused.
 */
export function HeroBanner({ items, onOpen, onPlay, onToggleList, continueEp, inList, paused = false, interval = 4500 }: HeroBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [tick, setTick] = useState(0); // bumps when an auto-advance is postponed, restarting the timer
  const visible = useRef(true);
  const resumeAt = useRef(0); // auto-advance waits until this time after the viewer touches the banner

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const instant = MotionGlobalConfig.skipAnimations || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: instant ? 'auto' : 'smooth' });
  };

  // Which slide is in view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
      activeRef.current = i;
      setActive((a) => (a === i ? a : i));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [items.length]);

  // Hold while the viewer touches or wheels the banner; know when it is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(el);
    const hold = () => { resumeAt.current = Infinity; };
    const release = () => { resumeAt.current = Date.now() + 4000; };
    el.addEventListener('pointerdown', hold);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('touchstart', hold, { passive: true });
    el.addEventListener('touchend', release);
    el.addEventListener('wheel', release, { passive: true });
    return () => {
      io.disconnect();
      el.removeEventListener('pointerdown', hold);
      el.removeEventListener('pointerup', release);
      el.removeEventListener('pointercancel', release);
      el.removeEventListener('touchstart', hold);
      el.removeEventListener('touchend', release);
      el.removeEventListener('wheel', release);
    };
  }, []);

  // The slideshow timer.
  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = window.setTimeout(() => {
      if (!visible.current || document.visibilityState === 'hidden' || Date.now() < resumeAt.current) { setTick((n) => n + 1); return; }
      goTo((activeRef.current + 1) % items.length);
      setTick((n) => n + 1);
    }, interval);
    return () => window.clearTimeout(t);
  }, [active, tick, paused, interval, items.length]);

  return (
    <div className="hero">
      <div ref={ref} className="hero-track">
        {items.map((s, i) => {
          const ep = continueEp(s);
          const saved = inList(s);
          return (
            <div key={s.id} className="hero-slide" style={{ background: s.art }} onClick={() => { tap(); onOpen(s); }} role="button" aria-label={s.title}>
              {Math.abs(i - active) <= 1 && <img src={backdropUrl(s)} alt="" draggable={false} decoding="async" loading={i === 0 ? 'eager' : 'lazy'} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
              <div className="hero-fade" />
              <div className="hero-body">
                <span className="hero-tag">{tag(s, i, ep)}</span>
                <div className="hero-title">{s.title}</div>
                <div className="hero-sub">{tagline(s)}</div>
                <div className="hero-cta">
                  <button className="hero-play" onClick={(e) => { e.stopPropagation(); tap(); onPlay(s); }}>
                    <Icon name="play" size={18} fill />
                    <span>{ep ? `Continue EP ${ep}` : 'Watch Now'}</span>
                  </button>
                  <button className={`hero-list${saved ? ' on' : ''}`} aria-label={saved ? 'In My List' : 'Add to My List'} onClick={(e) => { e.stopPropagation(); tap(); onToggleList(s); }}>
                    <Icon name={saved ? 'check' : 'plus'} size={20} stroke={2.2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-dots">
        {items.map((s, i) => (
          <button key={s.id} className={i === active ? 'on' : ''} onClick={() => { tap(); goTo(i); }} aria-label={s.title}>
            {i === active && <i key={`${i}-${tick}`} style={{ animationDuration: `${interval}ms`, animationPlayState: paused ? 'paused' : 'running' }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
