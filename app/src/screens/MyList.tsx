import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { Poster, TabBar } from '../components/ui';
import { byId, SERIES } from '../data/catalog';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { useP, useProfile } from '../store/useStore';

const FILTERS = ['All', 'Watching', 'Saved', 'Finished'] as const;

export function MyListScreen() {
  const p = useP();
  const profile = useProfile();
  const push = useNav((s) => s.push);
  const [f, setF] = useState<(typeof FILTERS)[number]>('All');
  const kids = !!profile?.kids;

  const items = useMemo(() => {
    const watching = Object.keys(p.progress).filter((id) => !p.finished.includes(id));
    const ids = new Set<string>();
    if (f === 'All' || f === 'Saved') p.myList.forEach((id) => ids.add(id));
    if (f === 'All' || f === 'Watching') watching.forEach((id) => ids.add(id));
    if (f === 'All' || f === 'Finished') p.finished.forEach((id) => ids.add(id));
    return Array.from(ids).map((id) => byId(id)!).filter((s) => s && (!kids || s.kids)).sort((a, b) => (p.progress[b.id]?.updatedAt || 0) - (p.progress[a.id]?.updatedAt || 0));
  }, [p.myList, p.progress, p.finished, f, kids]);

  return (
    <div className="screen">
      <div className="scroll tabbed">
        <div className="topbar" style={{ paddingRight: 10 }}>
          <div className="title-xl">My List</div>
          <button className="iconbtn" onClick={() => { tap(); push('search'); }} aria-label="Search"><Icon name="search" /></button>
        </div>
        <div className="chips">
          {FILTERS.map((x) => <button key={x} className={`chip${f === x ? ' on' : ''}`} onClick={() => { tap(); setF(x); }}>{x}</button>)}
        </div>
        {items.length === 0 ? (
          <div className="empty">
            <div className="ico"><Icon name="list" size={28} /></div>
            <b>Nothing here yet</b>
            <span>Save a series or start watching and it shows up here.</span>
            <button className="btn primary sm" style={{ marginTop: 6 }} onClick={() => push('search')}>Browse series</button>
          </div>
        ) : (
          <motion.div className="grid3" layout>
            <AnimatePresence initial={false}>
              {items.map((s) => {
                const pr = p.progress[s.id];
                const done = p.finished.includes(s.id);
                return (
                  <motion.div key={s.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
                    <Poster s={s} w="100%" h={165} badge={done ? 'Finished' : pr ? `EP ${pr.ep}` : undefined} progress={pr && !done ? pr.ep / s.episodes : undefined} onClick={() => { tap(); push('series', { id: s.id }); }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
        {items.length > 0 && items.length < 6 && (
          <div style={{ padding: '26px 20px 0' }}>
            <div className="section-h" style={{ padding: 0 }}>You might like</div>
            <div className="hrow" style={{ padding: '10px 0 0', gap: 9 }}>
              {SERIES.filter((s) => !items.includes(s) && (!kids || s.kids)).slice(0, 6).map((s) => <Poster key={s.id} s={s} w={110} h={165} onClick={() => { tap(); push('series', { id: s.id }); }} />)}
            </div>
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}
