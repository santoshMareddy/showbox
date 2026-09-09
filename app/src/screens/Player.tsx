import { useCallback, useEffect, useRef, useState } from 'react';
import { Feed, LikeBurst, VideoPage, type FeedHandle } from '../components/Feed';
import { Coin, Icon } from '../components/Icon';
import { toast } from '../components/toast';
import { byId, epCaption, epTitle, episodeSource } from '../data/catalog';
import { fmtCompact, fmtTime } from '../lib/format';
import { success, tap } from '../lib/haptics';
import { warmClip } from '../lib/video';
import { useNav } from '../nav/useNav';
import { EP_PRICE, isUnlocked, totalCoins, useP, useStore } from '../store/useStore';

const SPEEDS = [1, 1.25, 1.5, 2];

export function PlayerScreen({ seriesId, ep }: { seriesId: string; ep: number }) {
  const s = byId(seriesId)!;
  const p = useP();
  const pop = useNav((n) => n.pop);
  const push = useNav((n) => n.push);
  const openSheet = useNav((n) => n.openSheet);
  const sheet = useNav((n) => n.sheet);
  const ad = useNav((n) => n.ad);
  const setProgress = useStore((st) => st.setProgress);
  const markWatched = useStore((st) => st.markWatched);
  const pushHistory = useStore((st) => st.pushHistory);
  const toggleLike = useStore((st) => st.toggleLike);
  const toggleMyList = useStore((st) => st.toggleMyList);
  const unlockEpisode = useStore((st) => st.unlockEpisode);
  const setSound = useStore((st) => st.setSound);
  const setSetting = useStore((st) => st.setSetting);
  const feed = useRef<FeedHandle>(null);
  const [index, setIndex] = useState(ep - 1);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const [rate, setRate] = useState(p.settings.speed);
  const root = useRef<HTMLDivElement>(null);
  const lastSave = useRef(0);
  const autoOpened = useRef<number>(0);
  const muted = !p.soundOn;
  const paused = !!sheet || !!ad;

  const canWatch = useCallback((n: number) => isUnlocked(p, seriesId, n, s.freeUpTo), [p, seriesId, s.freeUpTo]);

  const arrive = useCallback((i: number) => {
    const n = i + 1;
    if (canWatch(n)) {
      pushHistory(seriesId, n);
      const prev = useStore.getState();
      const pr = prev.activeId ? prev.data[prev.activeId].progress[seriesId] : undefined;
      if (!pr || pr.ep !== n) setProgress(seriesId, n, 0, 0);
      const next = n + 1;
      if (next <= s.episodes && isUnlocked(p, seriesId, next, s.freeUpTo)) warmClip(episodeSource(s, next).src);
    } else if (p.settings.autoUnlock && totalCoins(p) >= EP_PRICE) {
      if (unlockEpisode(seriesId, n, s.title)) { success(); toast(`EP ${n} unlocked · ${totalCoins(p) - EP_PRICE} coins left`, { coin: true }); }
    } else if (autoOpened.current !== n) {
      autoOpened.current = n;
      setTimeout(() => openSheet('unlock', { seriesId, ep: n }), 350);
    }
  }, [canWatch, p, s, seriesId, pushHistory, setProgress, unlockEpisode, openSheet]);

  useEffect(() => { arrive(ep - 1); /* initial */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onIndex = useCallback((i: number) => { setIndex(i); arrive(i); }, [arrive]);

  const like = (key: string, x: number, y: number) => { if (toggleLike(key)) { tap(12); setBurst({ x, y, id: Date.now() }); } };

  const cycleSpeed = () => {
    tap();
    const nx = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
    setRate(nx);
    setSetting('speed', nx);
    toast(`Speed ${nx}×`);
  };

  return (
    <div className="screen" style={{ background: '#000' }} ref={root}>
      <Feed
        ref={feed}
        count={s.episodes}
        initialIndex={ep - 1}
        onIndexChange={onIndex}
        renderItem={(i, isActive) => {
          const n = i + 1;
          const key = `${seriesId}:${n}`;
          const liked = !!p.likes[key];
          const saved = p.myList.includes(seriesId);
          if (!canWatch(n)) {
            return (
              <div className="paywall">
                <img className="art" src={episodeSource(s, n).poster} alt="" />
                <div className="lk"><Icon name="lock" size={28} /></div>
                <b>EP {n} is locked</b>
                <span className="muted" style={{ fontSize: 13 }}>{EP_PRICE} coins, or free with VIP</span>
                <button className="btn primary" style={{ marginTop: 6 }} onClick={() => { tap(); openSheet('unlock', { seriesId, ep: n }); }}><Coin size={18} dark /><span>Unlock for {EP_PRICE} coins</span></button>
                <button className="muted" style={{ fontSize: 13, fontWeight: 600, padding: 8 }} onClick={() => { tap(); push('vip'); }}>Try VIP free</button>
              </div>
            );
          }
          const es = episodeSource(s, n);
          return (
            <VideoPage
              src={es.src}
              poster={es.poster}
              start={es.start}
              end={es.end}
              seekable={es.seekable}
              active={isActive && !paused}
              muted={muted}
              rate={rate}
              onBlockedSound={() => { setSound(false); toast('Tap the speaker for sound'); }}
              onEnded={() => {
                markWatched(seriesId, n, s.episodes);
                if (n >= s.episodes) { toast('You finished the series', { icon: 'check' }); return; }
                if (p.settings.autoplayNext) feed.current?.scrollTo(i + 1);
              }}
              onProgress={(pos, dur) => { const now = Date.now(); if (now - lastSave.current > 1500) { lastSave.current = now; setProgress(seriesId, n, pos, dur); } }}
              onDoubleTap={() => { const r = root.current?.getBoundingClientRect(); like(key, (r?.width || 390) / 2, (r?.height || 844) / 2); }}
              showProgress={false}
              renderControls={({ time, dur, seek }) => (
                <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--sab) + 36px)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 5, color: '#fff' }}>
                  <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 34 }}>{fmtTime(time)}</span>
                  <div className="range" style={{ flex: 1, background: 'none', padding: 0, height: 24 }}>
                    <input type="range" min={0} max={Math.max(1, dur)} step={0.1} value={Math.min(time, dur || 0)} style={{ ['--p' as string]: `${dur ? (time / dur) * 100 : 0}%` }} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" />
                  </div>
                  <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 34, textAlign: 'right', color: 'var(--text-2)' }}>{fmtTime(dur)}</span>
                </div>
              )}
            >
              <div className="rail" style={{ bottom: 'calc(var(--sab) + 190px)' }} onClick={(e) => e.stopPropagation()}>
                <button className={liked ? 'liked' : ''} onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const pr = root.current?.getBoundingClientRect(); like(key, r.left - (pr?.left || 0) + 22, r.top - (pr?.top || 0) + 22); }}>
                  <span className="ico"><Icon name="heart" size={30} fill={liked} /></span><span>{fmtCompact(s.likes + (liked ? 1 : 0))}</span>
                </button>
                <button className={saved ? 'saved' : ''} onClick={() => { tap(); const a = toggleMyList(seriesId); toast(a ? 'Saved to My List' : 'Removed from My List', { icon: a ? 'check' : undefined }); }}>
                  <span className="ico"><Icon name="list" size={30} fill={saved} /></span><span>{saved ? 'Saved' : 'Save'}</span>
                </button>
                <button onClick={async () => { tap(); try { if (navigator.share) await navigator.share({ title: s.title, text: `${s.title} EP ${n} on ShowBox`, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast('Link copied'); } } catch { /* cancelled */ } }}>
                  <span className="ico"><Icon name="share" size={30} /></span><span>Share</span>
                </button>
                <button onClick={() => { tap(); openSheet('episodes', { seriesId, current: n, onPick: (target: number) => feed.current?.scrollTo(target - 1, false) }); }}>
                  <span className="ico"><Icon name="episodes" size={30} /></span><span>{s.episodes} EP</span>
                </button>
              </div>
              <div className="vinfo" style={{ bottom: 'calc(var(--sab) + 74px)' }} onClick={(e) => e.stopPropagation()}>
                <div className="vt" style={{ fontSize: 17 }}>EP {n} · {epTitle(s, n)}</div>
                <div className="vc">{epCaption(s, n)}</div>
              </div>
              {n < s.episodes && (
                <div className="swipe-hint" style={{ bottom: 'calc(var(--sab) + 8px)' }}>
                  <Icon name="swipeUp" size={14} /><span>Swipe up for EP {n + 1}{!isUnlocked(p, seriesId, n + 1, s.freeUpTo) ? ' · locked' : ''}</span>
                </div>
              )}
            </VideoPage>
          );
        }}
      />
      <div className="vtop">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <button className="circ" onClick={() => { tap(); pop(); }} aria-label="Back"><Icon name="back" /></button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 16, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>EP {index + 1} of {s.episodes}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="pill glass" style={{ height: 32, padding: '0 10px' }} onClick={cycleSpeed}>{rate}×</button>
          <button className="circ" onClick={() => { tap(); setSound(muted); }} aria-label={muted ? 'Unmute' : 'Mute'}><Icon name={muted ? 'mute' : 'speaker'} size={20} /></button>
          <button className="circ" onClick={() => { tap(); openSheet('episodes', { seriesId, current: index + 1, onPick: (target: number) => feed.current?.scrollTo(target - 1, false) }); }} aria-label="Episodes"><Icon name="more" size={20} /></button>
        </div>
      </div>
      <LikeBurst at={burst} />
    </div>
  );
}
