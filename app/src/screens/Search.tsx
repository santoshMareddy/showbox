import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Poster } from '../components/ui';
import { GENRES, SERIES, TOP_SEARCHES, backdropUrl, genreTint, searchSeries, type Genre } from '../data/catalog';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { useP, useProfile, useStore } from '../store/useStore';

export function SearchScreen({ initialGenre }: { initialGenre?: string }) {
  const p = useP();
  const profile = useProfile();
  const kids = !!profile?.kids;
  const pop = useNav((s) => s.pop);
  const push = useNav((s) => s.push);
  const addRecent = useStore((s) => s.addRecentSearch);
  const clearRecent = useStore((s) => s.clearRecent);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [genre, setGenre] = useState<Genre | null>((initialGenre as Genre) || null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => setDebounced(q), 140); return () => clearTimeout(t); }, [q]);
  useEffect(() => { if (!initialGenre) setTimeout(() => input.current?.focus(), 380); }, [initialGenre]);

  const results = useMemo(() => (genre ? SERIES.filter((s) => s.genre === genre && (!kids || s.kids)) : searchSeries(debounced, kids)), [debounced, genre, kids]);
  const showResults = genre !== null || debounced.trim().length > 0;

  const open = (id: string) => {
    tap();
    if (q.trim()) addRecent(q.trim().toLowerCase());
    push('series', { id });
  };

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 'var(--sat) 20px 0 12px', flex: 'none' }}>
        <button className="iconbtn" onClick={() => { tap(); pop(); }} aria-label="Back"><Icon name="back" /></button>
        <div className="field" style={{ flex: 1 }}>
          <Icon name="search" size={20} style={{ color: 'var(--muted)' }} />
          <input ref={input} value={genre ? genre : q} onChange={(e) => { setGenre(null); setQ(e.target.value); }} placeholder="Series, genres, actors" enterKeyHint="search" autoCapitalize="none" onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { addRecent(q.trim().toLowerCase()); input.current?.blur(); } }} />
          {(q || genre) && <button onClick={() => { setQ(''); setGenre(null); input.current?.focus(); }} aria-label="Clear"><Icon name="close" size={18} style={{ color: 'var(--muted)' }} /></button>}
        </div>
      </div>

      <div className="scroll plain">
        <AnimatePresence mode="wait" initial={false}>
          {showResults ? (
            <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ paddingTop: 10 }}>
              <div className="muted small" style={{ padding: '4px 20px 6px' }}>{results.length} {results.length === 1 ? 'result' : 'results'}{genre ? ` in ${genre}` : ''}</div>
              {results.length === 0 ? (
                <div className="empty">
                  <div className="ico"><Icon name="search" size={26} /></div>
                  <b>No matches for "{debounced}"</b>
                  <span>Try a title, a genre like Revenge, or an actor's name.</span>
                </div>
              ) : results.map((s) => (
                <div key={s.id} className="result" onClick={() => open(s.id)}>
                  <Poster s={s} w={56} h={84} title={false} radius={8} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                    <div className="muted small">{s.genre} · {s.episodes} EP · {s.status}</div>
                    <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="star" size={12} fill style={{ color: 'var(--accent)' }} />{s.rating.toFixed(1)} · {s.cast[0]}</div>
                  </div>
                  <Icon name="chevron" size={18} style={{ color: 'var(--dim)' }} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {p.recentSearches.length > 0 && (
                <div style={{ padding: '22px 20px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="section-h" style={{ padding: 0 }}>
                    <span>Recent</span>
                    <button className="more" onClick={() => { tap(); clearRecent(); }}>Clear</button>
                  </div>
                  {p.recentSearches.map((r) => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 44, color: 'var(--text-2)' }} onClick={() => { tap(); setQ(r); }}>
                      <Icon name="clock" size={20} style={{ color: 'var(--muted-2)' }} />
                      <span style={{ flex: 1, fontSize: 15 }}>{r}</span>
                      <Icon name="chevronUp" size={18} style={{ color: 'var(--muted-2)', transform: 'rotate(45deg)' }} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: '22px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="section-h" style={{ padding: 0 }}>Browse by genre</div>
                <div className="grid2" style={{ padding: 0 }}>
                  {GENRES.filter((g) => SERIES.some((s) => s.genre === g && (!kids || s.kids))).map((g) => {
                    const sample = SERIES.find((s) => s.genre === g && (!kids || s.kids))!;
                    return (
                      <motion.div key={g} className="tile photo" style={{ background: genreTint(g) }} whileTap={{ scale: 0.97 }} onClick={() => { tap(); setGenre(g); setQ(''); }}>
                        <img className="bg" src={backdropUrl(sample)} alt="" loading="lazy" decoding="async" draggable={false} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <div className="shade" />
                        <div className="lbl">{g === 'CEO' ? 'CEO and billionaire' : g}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <div style={{ padding: '22px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="section-h" style={{ padding: 0 }}>Top searches</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TOP_SEARCHES.map((t, i) => (
                    <button key={t} className="chip" style={{ height: 32 }} onClick={() => { tap(); setQ(t); }}>
                      <span style={{ color: i < 2 ? 'var(--accent)' : 'var(--muted)', fontWeight: 700 }}>{i + 1}</span>{t}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
