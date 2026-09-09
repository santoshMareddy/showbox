import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Poster, Row, Segments } from '../components/ui';
import { toast } from '../components/toast';
import { SERIES, backdropUrl, byId } from '../data/catalog';
import { fmtCompact } from '../lib/format';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { isUnlocked, isVip, useP, useProfile, useStore } from '../store/useStore';

export function SeriesScreen({ id }: { id: string }) {
  const s = byId(id)!;
  const p = useP();
  const profile = useProfile();
  const push = useNav((st) => st.push);
  const pop = useNav((st) => st.pop);
  const openSheet = useNav((st) => st.openSheet);
  const toggleMyList = useStore((st) => st.toggleMyList);
  const [tab, setTab] = useState('Episodes');
  const [range, setRange] = useState(() => Math.floor(((p.progress[id]?.ep || 1) - 1) / 30));
  const [expanded, setExpanded] = useState(false);
  const cover = useRef<HTMLDivElement>(null);

  const pr = p.progress[id];
  const done = p.finished.includes(id);
  const inList = p.myList.includes(id);
  const vip = isVip(p);
  const ranges = useMemo(() => Array.from({ length: Math.ceil(s.episodes / 30) }, (_, i) => [i * 30 + 1, Math.min(s.episodes, (i + 1) * 30)] as const), [s.episodes]);
  const similar = useMemo(() => SERIES.filter((x) => x.id !== s.id && (!profile?.kids || x.kids)).sort((a, b) => (a.genre === s.genre ? -1 : 0) - (b.genre === s.genre ? -1 : 0) || b.rating - a.rating).slice(0, 8), [s, profile?.kids]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    if (cover.current) cover.current.style.transform = `translateY(${Math.max(-40, -y * 0.35)}px) scale(${1 + Math.max(0, -y) / 400})`;
  };

  const openEp = (ep: number) => {
    tap();
    if (isUnlocked(p, id, ep, s.freeUpTo)) push('player', { seriesId: id, ep });
    else openSheet('unlock', { seriesId: id, ep });
  };

  const share = async () => {
    tap();
    try {
      if (navigator.share) await navigator.share({ title: s.title, text: `${s.title} on ShowBox`, url: location.href });
      else { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
    } catch { /* cancelled */ }
  };

  return (
    <div className="screen">
      <div className="scroll plain" onScroll={onScroll} style={{ position: 'relative' }}>
        <div className="cover" ref={cover} style={{ background: s.art, willChange: 'transform' }}>
          <img src={backdropUrl(s)} alt="" draggable={false} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <div className="fade" />
        </div>

        <div style={{ position: 'sticky', top: 0, zIndex: 3, padding: 'var(--sat) 16px 0', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          <button className="circ" style={{ pointerEvents: 'auto' }} onClick={() => { tap(); pop(); }} aria-label="Back"><Icon name="back" /></button>
          <button className="circ" style={{ pointerEvents: 'auto' }} onClick={share} aria-label="Share"><Icon name="share" /></button>
        </div>

        <div style={{ position: 'relative', padding: '176px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="display" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: '#fff' }}>{s.title}</motion.div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
            <span>{s.episodes} episodes</span><span>·</span><span>{s.genre}</span><span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={14} />{fmtCompact(s.likes)}</span>
            <span className="badge-outline">{s.status}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="star" size={12} fill style={{ color: 'var(--accent)' }} />{s.rating.toFixed(1)}</span>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} className="btn primary lg block" onClick={() => openEp(done ? 1 : pr?.ep || 1)}>
            <Icon name="play" size={20} fill />
            <span>{done ? 'Watch again from EP 1' : pr ? `Continue EP ${pr.ep}` : 'Play EP 1'}</span>
          </motion.button>

          <div className="actions">
            <button className={`action${inList ? ' on' : ''}`} onClick={() => { tap(); const a = toggleMyList(id); toast(a ? 'Added to My List' : 'Removed from My List', { icon: a ? 'check' : undefined }); }}>
              <motion.span key={String(inList)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} style={{ display: 'flex' }}><Icon name={inList ? 'check' : 'plus'} /></motion.span>
              <span>{inList ? 'In list' : 'My List'}</span>
            </button>
            <button className="action" onClick={share}><Icon name="share" /><span>Share</span></button>
            <button className="action" onClick={() => { tap(); openSheet('rate', { seriesId: id }); }}><Icon name="star" /><span>Rate</span></button>
            <button className="action" onClick={() => { tap(); push('vip'); }}><Icon name={vip ? 'unlock' : 'lock'} /><span>{vip ? 'VIP' : 'Unlock all'}</span></button>
          </div>

          <div style={{ fontSize: 14, lineHeight: '20px', color: 'var(--text-2)' }} onClick={() => setExpanded((e) => !e)}>
            <span style={expanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.synopsis} Starring {s.cast.join(', ')}. {s.tags.join(' · ')}.</span>
            <span className="muted small" style={{ display: 'block', marginTop: 4 }}>{expanded ? 'Less' : 'More'}</span>
          </div>

          <Segments items={['Episodes', 'More like this']} value={tab} onChange={setTab} />

          {tab === 'Episodes' ? (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto' }}>
                {ranges.map(([a, b], i) => <button key={a} className={`range${range === i ? ' on' : ''}`} onClick={() => { tap(); setRange(i); }}>{a} to {b}</button>)}
                <span className="muted small" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>{vip ? 'VIP · all unlocked' : `Free up to EP ${s.freeUpTo}`}</span>
              </div>
              <motion.div key={range} className="epgrid" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.012 } } }}>
                {Array.from({ length: ranges[range][1] - ranges[range][0] + 1 }, (_, i) => ranges[range][0] + i).map((ep) => {
                  const locked = !isUnlocked(p, id, ep, s.freeUpTo);
                  const current = pr?.ep === ep && !done;
                  const watched = done || (pr ? ep < pr.ep : false);
                  return (
                    <motion.button key={ep} variants={{ hide: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }} className={`ep-tile${current ? ' current' : locked ? ' locked' : watched ? ' watched' : ''}`} onClick={() => openEp(ep)}>
                      {ep}
                      {locked && <Icon name="lock" size={11} stroke={2.2} className="lk" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '0 -20px' }}>
              <Row title={`More ${s.genre}`} top={4}>
                {similar.filter((x) => x.genre === s.genre).map((x) => <Poster key={x.id} s={x} w={110} h={165} onClick={() => { tap(); push('series', { id: x.id }); }} />)}
              </Row>
              <Row title="Because you watched this">
                {similar.filter((x) => x.genre !== s.genre).map((x) => <Poster key={x.id} s={x} w={110} h={165} onClick={() => { tap(); push('series', { id: x.id }); }} />)}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
