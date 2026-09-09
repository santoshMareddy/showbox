import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LogoMark } from './ui';
import { toast } from './toast';
import { useStore } from '../store/useStore';

// Test hook: ?noshield=1 keeps the shield away (the browser pane used for screenshots is always "hidden").
const DISABLED = new URLSearchParams(location.search).has('noshield');

/**
 * Privacy layer, in the spirit of what streaming and banking apps do:
 *  - privacy screen: the moment the app goes to the background or loses focus, the content is
 *    covered by a branded panel, so the OS app switcher and any screen-capture tool that steals
 *    focus only see the logo;
 *  - capture deterrent: PrintScreen / macOS screenshot keys blank the app for a moment and empty
 *    the clipboard; right-click, drag-to-save and picture-in-picture are disabled.
 * A browser cannot intercept a phone's hardware screenshot; the installed store app would use
 * FLAG_SECURE / DRM for that. This is the best a web app can do, and it is explained in Settings.
 */
export function PrivacyShield() {
  const privacyScreen = useStore((s) => (s.activeId ? s.data[s.activeId]?.settings.privacyScreen !== false : true));
  const blockCapture = useStore((s) => (s.activeId ? s.data[s.activeId]?.settings.blockCapture !== false : true));
  const [away, setAway] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!privacyScreen || DISABLED) { setAway(false); return; }
    const hide = () => setAway(true);
    const show = () => setAway(false);
    const onVis = () => (document.visibilityState === 'hidden' ? hide() : show());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', show);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', show);
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
    };
  }, [privacyScreen]);

  useEffect(() => {
    if (!blockCapture || DISABLED) return;
    let t = 0;
    const trip = () => {
      setFlash(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setFlash(false), 1400);
      toast('Screenshots are blocked in ShowBox', { icon: 'shield' });
      navigator.clipboard?.writeText(' ').catch(() => { /* not allowed, fine */ });
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'PrintScreen') trip(); };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && ['3', '4', '5', '6'].includes(e.key))) { e.preventDefault(); trip(); }
    };
    const block = (e: Event) => e.preventDefault();
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, [blockCapture]);

  const on = away || flash;
  return (
    <AnimatePresence>
      {on && (
        <motion.div key="shield" className="shield" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
          <div className="shield-glow" />
          <LogoMark size={48} />
          <div className="wordmark" style={{ fontSize: 28 }}><span>Show<span className="g">Box</span></span></div>
          <div className="muted" style={{ fontSize: 13 }}>{flash ? 'Screenshots are blocked' : 'Content hidden for your privacy'}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
