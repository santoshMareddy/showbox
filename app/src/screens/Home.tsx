import { useEffect, useMemo, useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { SpinTab } from '../components/SpinWheel';
import { Icon } from '../components/Icon';
import { CoinPill, Poster, Row, Skel, TabBar, Wordmark } from '../components/ui';
import { toast } from '../components/toast';
import { GENRES, SERIES, byId, type Genre } from '../data/catalog';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { useP, useProfile, useStore } from '../store/useStore';

export function HomeScreen({ active }: { active: boolean }) {
  const p = useP();
  const profile = useProfile();
  const push = useNav((s) => s.push);
  const toggleMyList = useStore((s) => s.toggleMyList);
  const kids = !!profile?.kids;
  const [genre, setGenre] = useState<'All' | Genre>('All');
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 420); return () => clearTimeout(t); }, []);

  const list = useMemo(() => SERIES.filter((s) => !kids || s.kids), [kids]);
  const filtered = useMemo(() => (genre === 'All' ? list : list.filter((s) => s.genre === genre)), [list, genre]);
  const hero = useMemo(() => [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 5), [filtered]);

  const continueList = useMemo(
    () =>
      Object.entries(p.progress)
        .map(([id, pr]) => ({ s: byId(id)!, pr }))
        .filter((x) => x.s && (!kids || x.s.kids) && !p.finished.includes(x.s.id))
        .sort((a, b) => b.pr.updatedAt - a.pr.updatedAt),
    [p.progress, p.finished, kids]
  );
  const trending = useMemo(() => [...list].sort((a, b) => b.likes - a.likes).slice(0, 8), [list]);
  const fresh = useMemo(() => list.filter((s) => s.status === 'Ongoing').slice(0, 12), [list]);
  const genresHere = GENRES.filter((g) => list.some((s) => s.genre === g));

  return (
    <div className="screen">
      <div className="scroll tabbed">
        <div className="topbar">
          <Wordmark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CoinPill />
            <button className="iconbtn" onClick={() => { tap(); push('search'); }} aria-label="Search"><Icon name="search" /></button>
          </div>
        </div>

        {!ready ? (
          <div style={{ padding: '6px 16px 0' }}><Skel w="100%" h={330} r={20} /></div>
        ) : (
          <HeroBanner
            key={genre}
            items={hero}
            paused={!active}
            onOpen={(s) => push('series', { id: s.id })}
            onPlay={(s) => push('player', { seriesId: s.id, ep: p.progress[s.id]?.ep || 1 })}
            onToggleList={(s) => { const added = toggleMyList(s.id); toast(added ? 'Added to My List' : 'Removed from My List', { icon: added ? 'check' : 'info' }); }}
            continueEp={(s) => p.progress[s.id]?.ep}
            inList={(s) => p.myList.includes(s.id)}
          />
        )}

        <div className="section-h" style={{ paddingTop: 20 }}>
          <span>Categories</span>
          <button className="more" onClick={() => { tap(); push('search'); }}>View all<Icon name="chevron" size={14} /></button>
        </div>
        <div className="chips" style={{ padding: '10px 20px 4px' }}>
          {(['All', ...genresHere] as const).map((g) => (
            <button key={g} className={`chip${genre === g ? ' on' : ''}`} onClick={() => { tap(); setGenre(g); }}>{g}</button>
          ))}
        </div>

        {continueList.length > 0 && (
          <Row title="Continue watching" gap={10} top={18} onMore={() => useNav.getState().setTab('mylist')}>
            {continueList.map(({ s, pr }) => (
              <div key={s.id} className="cont-card" onClick={() => { tap(); push('player', { seriesId: s.id, ep: pr.ep }); }}>
                <Poster s={s} w={104} h={156} title={false} progress={pr.ep / s.episodes}>
                  <div className="ep">EP {pr.ep} / {s.episodes}</div>
                </Poster>
                <div className="name">{s.title}</div>
              </div>
            ))}
          </Row>
        )}

        <Row title="Trending now" onMore={() => push('search', { genre: '' })}>
          {ready ? trending.map((s) => <Poster key={s.id} s={s} w={110} h={165} onClick={() => { tap(); push('series', { id: s.id }); }} />) : [1, 2, 3, 4].map((i) => <Skel key={i} w={110} h={165} />)}
        </Row>

        {fresh.length > 0 && (
          <Row title="New episodes">
            {fresh.map((s) => <Poster key={s.id} s={s} w={110} h={165} badge="New" onClick={() => { tap(); push('series', { id: s.id }); }} />)}
          </Row>
        )}

        {genresHere.slice(0, 4).map((g) => (
          <Row key={g} title={g} onMore={() => push('search', { genre: g })}>
            {list.filter((s) => s.genre === g).slice(0, 12).map((s) => <Poster key={s.id} s={s} w={110} h={165} onClick={() => { tap(); push('series', { id: s.id }); }} />)}
          </Row>
        ))}
        <div style={{ height: 12 }} />
      </div>
      <SpinTab />
      <TabBar />
    </div>
  );
}
