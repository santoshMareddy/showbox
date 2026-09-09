import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { setKeepAwake } from '../lib/native';

/* ---------- Vertical snap feed ---------- */
export type FeedHandle = { scrollTo: (i: number, smooth?: boolean) => void };

export const Feed = forwardRef<FeedHandle, { count: number; renderItem: (i: number, active: boolean) => ReactNode; onIndexChange?: (i: number) => void; initialIndex?: number; className?: string }>(function Feed({ count, renderItem, onIndexChange, initialIndex = 0, className }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(initialIndex);
  const cb = useRef(onIndexChange);
  cb.current = onIndexChange;

  useImperativeHandle(ref, () => ({
    scrollTo: (i, smooth = true) => {
      const c = el.current;
      if (!c) return;
      c.scrollTo({ top: i * c.clientHeight, behavior: smooth ? 'smooth' : 'auto' });
    },
  }));

  useEffect(() => {
    const c = el.current;
    if (!c) return;
    if (initialIndex) c.scrollTop = initialIndex * c.clientHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const i = Number((e.target as HTMLElement).dataset.index);
            setActive(i);
            cb.current?.(i);
          }
        }
      },
      { root: c, threshold: [0.6] }
    );
    c.querySelectorAll('[data-index]').forEach((n) => io.observe(n));
    // Fallback for browsers that skip observer callbacks during fast flings: derive the index from the scroll position.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round(c.scrollTop / c.clientHeight);
        if (Math.abs(c.scrollTop - i * c.clientHeight) < 4) {
          setActive((a) => {
            if (a !== i) cb.current?.(i);
            return i;
          });
        }
      });
    };
    c.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); c.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [count, initialIndex]);

  return (
    <div ref={el} className={`feed${className ? ' ' + className : ''}`}>
      {Array.from({ length: count }, (_, i) => (
        <section key={i} data-index={i} className="feed-item">
          {Math.abs(i - active) <= 1 ? renderItem(i, i === active) : null}
        </section>
      ))}
    </div>
  );
});

/* ---------- Video page ---------- */
export type VideoPageProps = {
  src: string;
  poster?: string;
  active: boolean;
  muted: boolean;
  rate?: number;
  loop?: boolean;
  onEnded?: () => void;
  onProgress?: (pos: number, dur: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onBlockedSound?: () => void;
  children?: ReactNode;
  showProgress?: boolean;
  progressBottom?: number | string;
  renderControls?: (c: { time: number; dur: number; seek: (t: number) => void; paused: boolean }) => ReactNode;
  /** Play only the [start, end] window of the file (library chapters). `seekable` false means the server already starts at `start`. */
  start?: number;
  end?: number;
  seekable?: boolean;
};

export function VideoPage({ src, poster, active, muted, rate = 1, loop = false, onEnded, onProgress, onTap, onDoubleTap, onBlockedSound, children, showProgress = true, progressBottom = 0, renderControls, start = 0, end, seekable = true }: VideoPageProps) {
  const v = useRef<HTMLVideoElement>(null);
  const t0 = seekable ? start : 0; // file time where this window begins
  const endedRef = useRef(false);
  const endedCb = useRef(onEnded);
  endedCb.current = onEnded;
  const windowed = end !== undefined;
  const bar = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [flash, setFlash] = useState<'play' | 'pause' | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [clock, setClock] = useState({ time: 0, dur: 0 });
  const lastClock = useRef(0);
  const lastTap = useRef(0);
  const progressCb = useRef(onProgress);
  progressCb.current = onProgress;
  const seek = (t: number) => { const el = v.current; if (el) { el.currentTime = t + t0; setClock({ time: t, dur: windowed ? (end as number) - t0 : el.duration || 0 }); } };

  useEffect(() => { endedRef.current = false; }, [src, active, start]);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    el.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (active && !paused) {
      el.muted = muted;
      if (t0 > 0 && el.readyState >= 1 && el.currentTime < t0 - 0.5) el.currentTime = t0;
      const pr = el.play();
      if (pr) pr.catch(() => {
        if (!muted) {
          el.muted = true;
          onBlockedSound?.();
          el.play().catch(() => {});
        }
      });
    } else {
      el.pause();
    }
  }, [active, paused, muted, onBlockedSound]);

  useEffect(() => {
    if (!active) setPaused(false);
  }, [active]);

  const tapHandler = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      lastTap.current = 0;
      onDoubleTap?.();
      return;
    }
    lastTap.current = now;
    setTimeout(() => {
      if (lastTap.current === now) {
        setPaused((p) => {
          setFlash(p ? 'play' : 'pause');
          setTimeout(() => setFlash(null), 500);
          return !p;
        });
        onTap?.();
      }
    }, 280);
  };

  return (
    <div className="vpage" onClick={tapHandler}>
      <video
        ref={v}
        src={src}
        poster={poster}
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noremoteplayback noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        loop={loop && !windowed}
        preload={active ? 'auto' : 'metadata'}
        muted={muted}
        onEnded={onEnded}
        onPlay={() => setKeepAwake(true)}
        onPause={() => setKeepAwake(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          const rel = Math.max(0, el.currentTime - t0);
          const dur = windowed ? Math.max(0.1, (end as number) - t0) : Math.max(0, (el.duration || 0) - t0);
          if (bar.current && dur) bar.current.style.width = `${Math.min(100, (rel / dur) * 100)}%`;
          progressCb.current?.(rel, dur);
          if (renderControls) {
            const now = Date.now();
            if (now - lastClock.current > 240) { lastClock.current = now; setClock({ time: rel, dur }); }
          }
          if (windowed && el.currentTime >= (end as number) - 0.05) {
            if (loop) { el.currentTime = t0; return; }
            if (!endedRef.current) { endedRef.current = true; el.pause(); endedCb.current?.(); }
          }
        }}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          if (t0 > 0 && el.currentTime < t0 - 0.5) el.currentTime = t0;
          setClock({ time: Math.max(0, el.currentTime - t0), dur: windowed ? (end as number) - t0 : el.duration || 0 });
        }}
      />
      {renderControls && <div onClick={(e) => e.stopPropagation()}>{renderControls({ time: clock.time, dur: clock.dur, seek, paused })}</div>}
      <div className="fade-top" />
      <div className="fade-bottom" />
      <AnimatePresence>
        {flash && (
          <motion.div key={flash} className="flash" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }} transition={{ duration: 0.25 }}>
            <Icon name={flash} size={34} fill />
          </motion.div>
        )}
      </AnimatePresence>
      {paused && !flash && (
        <div className="flash still"><Icon name="play" size={34} fill /></div>
      )}
      {buffering && active && !paused && <div className="buffer"><div className="spin light" /></div>}
      {children}
      {showProgress && (
        <div className="vprog" style={{ bottom: progressBottom }}>
          <div ref={bar} />
        </div>
      )}
    </div>
  );
}

/* ---------- Like burst ---------- */
export function LikeBurst({ at }: { at: { x: number; y: number; id: number } | null }) {
  return (
    <AnimatePresence>
      {at && (
        <motion.div key={at.id} initial={{ opacity: 0, scale: 0.4, rotate: -12 }} animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 0.9], y: [0, -10, -30, -60] }} transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1] }} style={{ position: 'absolute', left: at.x - 40, top: at.y - 40, width: 80, height: 80, pointerEvents: 'none', color: '#ff4d6d', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6 }}>
          <Icon name="heart" size={80} fill />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
