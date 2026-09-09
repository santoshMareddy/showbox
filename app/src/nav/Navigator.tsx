import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNav, type Route, type Tab } from './useNav';
import { spring, ToastHost } from '../components/ui';
import { HomeScreen } from '../screens/Home';
import { ForYouScreen } from '../screens/ForYou';
import { MyListScreen } from '../screens/MyList';
import { RewardsScreen } from '../screens/Rewards';
import { MeScreen } from '../screens/Me';
import { SearchScreen } from '../screens/Search';
import { SeriesScreen } from '../screens/Series';
import { PlayerScreen } from '../screens/Player';
import { WalletScreen } from '../screens/Wallet';
import { VipScreen } from '../screens/Vip';
import { SettingsScreen } from '../screens/Settings';
import { HistoryScreen, UnlockedScreen, NotificationsScreen, HelpScreen, PrivacyScreen } from '../screens/Misc';
import { ProfilesScreen } from '../screens/Profiles';
import { SheetHost } from '../sheets/SheetHost';
import { AdOverlay } from '../sheets/AdOverlay';

const TAB_ORDER: Tab[] = ['home', 'foryou', 'mylist', 'rewards', 'me'];

function useHistorySync() {
  const depth = useNav((s) => s.stack.length + (s.sheet ? 1 : 0));
  const hist = useRef(0);
  const fromPop = useRef(false);
  const suppress = useRef(0);
  useEffect(() => {
    const onPop = () => {
      if (suppress.current > 0) { suppress.current--; return; }
      const s = useNav.getState();
      if (s.ad) { history.pushState({ d: hist.current }, ''); return; }
      if (s.sheet || s.stack.length) { fromPop.current = true; s.pop(); }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    if (depth > hist.current) {
      for (let i = hist.current; i < depth; i++) history.pushState({ d: i + 1 }, '');
      hist.current = depth;
    } else if (depth < hist.current) {
      const diff = hist.current - depth;
      hist.current = depth;
      if (fromPop.current) {
        fromPop.current = false;
        if (diff > 1) { suppress.current += diff - 1; history.go(-(diff - 1)); }
      } else {
        suppress.current += diff;
        history.go(-diff);
      }
    }
  }, [depth]);
}

function TabScreen({ tab, active }: { tab: Tab; active: boolean }) {
  switch (tab) {
    case 'home': return <HomeScreen active={active} />;
    case 'foryou': return <ForYouScreen active={active} />;
    case 'mylist': return <MyListScreen />;
    case 'rewards': return <RewardsScreen />;
    case 'me': return <MeScreen />;
  }
}

function renderRoute(r: Route) {
  const P = (r.params || {}) as Record<string, string | number>;
  switch (r.name) {
    case 'search': return <SearchScreen initialGenre={P.genre as string | undefined} />;
    case 'series': return <SeriesScreen id={String(P.id)} />;
    case 'player': return <PlayerScreen seriesId={String(P.seriesId)} ep={Number(P.ep || 1)} />;
    case 'wallet': return <WalletScreen />;
    case 'vip': return <VipScreen />;
    case 'settings': return <SettingsScreen />;
    case 'history': return <HistoryScreen />;
    case 'unlocked': return <UnlockedScreen />;
    case 'notifications': return <NotificationsScreen />;
    case 'help': return <HelpScreen />;
    case 'privacy': return <PrivacyScreen />;
    case 'profiles': return <ProfilesScreen manage />;
  }
}

function StackScreen({ route, top }: { route: Route; top: boolean }) {
  const pop = useNav((s) => s.pop);
  const x = useMotionValue(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    start.current = { x: e.clientX, y: e.clientY };
    dragging.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!dragging.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) dragging.current = true;
    if (dragging.current) x.set(Math.max(0, dx));
  };
  const onUp = () => {
    if (!start.current) return;
    const dx = x.get();
    start.current = null;
    if (dragging.current && dx > 90) {
      animate(x, window.innerWidth, { duration: 0.22, ease: 'easeOut' }).then(() => pop());
    } else animate(x, 0, spring);
    dragging.current = false;
  };

  return (
    <motion.div
      className="layer"
      style={{ x, zIndex: 10 }}
      initial={{ x: '100%' }}
      animate={{ x: top ? 0 : '-24%', opacity: top ? 1 : 0.55 }}
      exit={{ x: '100%', opacity: 1 }}
      transition={spring}
    >
      {renderRoute(route)}
      {top && route.name !== 'player' && (
        <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, zIndex: 50, touchAction: 'pan-y' }} />
      )}
    </motion.div>
  );
}

export function Navigator() {
  const tab = useNav((s) => s.tab);
  const stack = useNav((s) => s.stack);
  const sheet = useNav((s) => s.sheet);
  const ad = useNav((s) => s.ad);
  const [visited, setVisited] = useState<Tab[]>(['home']);
  useEffect(() => { setVisited((v) => (v.includes(tab) ? v : [...v, tab])); }, [tab]);
  useHistorySync();
  const depth = stack.length;

  return (
    <motion.div className="layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div className="layer" animate={{ x: depth ? '-24%' : '0%', opacity: depth ? 0.55 : 1 }} transition={spring} style={{ pointerEvents: depth ? 'none' : 'auto' }}>
        {TAB_ORDER.filter((t) => visited.includes(t)).map((t) => (
          <motion.div key={t} className="layer" initial={false} animate={{ opacity: t === tab ? 1 : 0 }} transition={{ duration: 0.18 }} style={{ visibility: t === tab ? 'visible' : 'hidden' }} aria-hidden={t !== tab}>
            <TabScreen tab={t} active={t === tab && depth === 0 && !sheet} />
          </motion.div>
        ))}
      </motion.div>
      <AnimatePresence initial={false}>
        {stack.map((r, i) => <StackScreen key={r.key} route={r} top={i === depth - 1} />)}
      </AnimatePresence>
      <AnimatePresence>{sheet && <SheetHost key={sheet.name} sheet={sheet} />}</AnimatePresence>
      <AnimatePresence>{ad && <AdOverlay key="ad" req={ad} />}</AnimatePresence>
      <ToastHost raised={depth > 0} />
    </motion.div>
  );
}
