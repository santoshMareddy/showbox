import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Navigator } from './nav/Navigator';
import { ProfilesScreen } from './screens/Profiles';
import { PrivacyShield } from './components/Privacy';
import { useStore } from './store/useStore';
import { isNative, setSecure } from './lib/native';
import { nav } from './nav/useNav';

// The phone mockup is only for desktop browsers. Any touch device (phone, tablet,
// even in "desktop site" mode) gets the app full-screen. ?frame=1 / ?frame=0 force
// it either way and the choice is remembered on the device.
const FRAME_KEY = 'showbox-frame';
const isTouch = () =>
  navigator.maxTouchPoints > 0 ||
  window.matchMedia('(pointer: coarse)').matches ||
  window.matchMedia('(hover: none)').matches ||
  /Android|iPhone|iPad|iPod|Mobile|Silk|Tablet/i.test(navigator.userAgent);
const remember = (v: boolean) => { try { localStorage.setItem(FRAME_KEY, v ? '1' : '0'); } catch { /* private mode */ } };
const wantsFrame = () => {
  if (isNative) return false; // the installed app is the frame
  const q = new URLSearchParams(location.search);
  if (q.has('frame')) { const v = q.get('frame') !== '0'; remember(v); return v; }
  try { const s = localStorage.getItem(FRAME_KEY); if (s === '0') return false; if (s === '1') return true; } catch { /* ignore */ }
  return !isTouch() && window.innerWidth >= 700;
};

export default function App() {
  const booted = useStore((s) => s.booted);
  const boot = useStore((s) => s.boot);
  const activeId = useStore((s) => s.activeId);
  const accent = useStore((s) => (s.activeId ? s.data[s.activeId]?.settings.accent : undefined));
  const soundOnStart = useStore((s) => (s.activeId ? s.data[s.activeId]?.settings.soundOnStart : false));
  const blockCapture = useStore((s) => (s.activeId ? s.data[s.activeId]?.settings.blockCapture !== false : true));
  const setSound = useStore((s) => s.setSound);
  const [desk, setDesk] = useState(wantsFrame);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    boot();
    // Earlier builds cached a media-server catalogue on the device; it is no longer read.
    try { localStorage.removeItem('showbox-jf-catalog-v1'); } catch { /* private mode */ }
  }, [boot]);
  // Installed app: Android itself refuses screenshots and screen recording while this is on.
  useEffect(() => { if (isNative) setSecure(blockCapture); }, [blockCapture]);
  // The phone's back button closes a sheet, then pops a screen, then returns to Home; only
  // after that does Android get the press and offer to leave the app.
  useEffect(() => {
    if (!isNative) return;
    const w = window as unknown as { showboxBack?: () => boolean };
    w.showboxBack = () => {
      const n = nav();
      if (n.ad) return true;
      if (n.sheet) { n.closeSheet(); return true; }
      if (n.stack.length) { n.pop(); return true; }
      if (n.tab !== 'home') { n.setTab('home'); return true; }
      return false;
    };
    return () => { delete w.showboxBack; };
  }, []);
  useEffect(() => { document.documentElement.style.setProperty('--accent', accent && accent !== '#F2B441' ? accent : '#FF3D8A'); }, [accent]);
  useEffect(() => { if (activeId && !soundOnStart) setSound(false); }, [activeId, soundOnStart, setSound]);
  useEffect(() => {
    const f = () => {
      const d = wantsFrame();
      setDesk(d);
      setScale(d ? Math.min(1, (window.innerHeight - 40) / 868) : 1);
    };
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  if (!booted) return null;

  return (
    <div id="stage" className={desk ? 'desk' : ''}>
      {desk && (
        <button className="desk-full" onClick={() => { remember(false); setDesk(false); }}>Full screen</button>
      )}
      {desk && (
        <div className="desk-side">
          <b>Show<span>Box</span></b>
          Portrait short dramas with coins, unlocks and VIP. Open this link on your phone for the full-screen version, or click around here. Keyboard: Esc goes back.
          <br /><br />
          <a href="?frame=0">Full screen</a> · <a href="get.html">Android app</a> · <a href="canvas.html" target="_blank" rel="noopener">Design canvas</a> · <a href="proto/" target="_blank" rel="noopener">Click-through prototype</a>
        </div>
      )}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="sb-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--accent)' }} />
            <stop offset="1" style={{ stopColor: 'var(--accent-2)' }} />
          </linearGradient>
        </defs>
      </svg>
      <div id="frame" style={desk ? { transform: `scale(${scale})` } : undefined}>
        <AnimatePresence mode="wait">
          {!activeId ? <ProfilesScreen key="profiles" /> : <Navigator key={activeId} />}
        </AnimatePresence>
        <PrivacyShield />
      </div>
    </div>
  );
}
