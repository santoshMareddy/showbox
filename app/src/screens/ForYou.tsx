import { useCallback, useMemo, useRef, useState } from 'react';
import { Feed, LikeBurst, VideoPage } from '../components/Feed';
import { Coin, Icon } from '../components/Icon';
import { CoinPill, TabBar } from '../components/ui';
import { toast } from '../components/toast';
import { SERIES, epCaption, episodeSource, type Series } from '../data/catalog';
import { fmtCompact } from '../lib/format';
import { tap } from '../lib/haptics';
import { warmClip } from '../lib/video';
import { useNav } from '../nav/useNav';
import { useP, useProfile, useStore } from '../store/useStore';

export function ForYouScreen({ active }: { active: boolean }) {
  const p = useP();
  const profile = useProfile();
  const push = useNav((s) => s.push);
  const toggleLike = useStore((s) => s.toggleLike);
  const toggleMyList = useStore((s) => s.toggleMyList);
  const setSound = useStore((s) => s.setSound);
  const kids = !!profile?.kids;
  const feed = useMemo(() => {
    const pool = SERIES.filter((s) => !kids || s.kids);
    return [...pool].sort(() => Math.random() - 0.5).map((s) => ({ s, ep: 1 }));
  }, [kids]);
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const muted = !p.soundOn;

  const onIndex = useCallback((i: number) => {
    setIndex(i);
    const next = feed[i + 1];
    if (next) warmClip(episodeSource(next.s, next.ep).src);
    void profile;
  }, [feed]);

  const soundBlocked = useCallback(() => {
    setSound(false);
    toast('Tap the speaker for sound');
  }, [setSound]);

  const onSave = (s: Series) => {
    tap();
    const added = toggleMyList(s.id);
    toast(added ? 'Saved to My List' : 'Removed from My List', { icon: added ? 'check' : undefined });
  };
  const onShare = async (s: Series) => {
    tap();
    try {
      if (navigator.share) await navigator.share({ title: s.title, text: `${s.title} on ShowBox`, url: location.href });
      else { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
    } catch { /* cancelled */ }
  };
  const like = (key: string, x: number, y: number) => {
    const liked = toggleLike(key);
    if (liked) { tap(12); setBurst({ x, y, id: Date.now() }); }
  };
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div className="screen" style={{ background: '#000' }} ref={pageRef}>
      <Feed
        count={feed.length}
        onIndexChange={onIndex}
        renderItem={(i, isActive) => {
          const { s, ep } = feed[i];
          const key = `${s.id}:${ep}`;
          const liked = !!p.likes[key];
          const saved = p.myList.includes(s.id);
          const es = episodeSource(s, ep);
          return (
            <VideoPage
              src={es.src}
              poster={es.poster}
              start={es.start}
              end={es.end}
              seekable={es.seekable}
              active={active && isActive}
              muted={muted}
              loop
              rate={p.settings.speed}
              onBlockedSound={soundBlocked}
              onDoubleTap={() => { const r = pageRef.current?.getBoundingClientRect(); like(key, (r?.width || 390) / 2, (r?.height || 844) / 2); }}
              progressBottom="calc(var(--tabbar) + var(--sab))"
            >
              <div className="rail" style={{ bottom: 'calc(var(--tabbar) + var(--sab) + 132px)' }} onClick={(e) => e.stopPropagation()}>
                <button className={liked ? 'liked' : ''} onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const pr = pageRef.current?.getBoundingClientRect(); like(key, r.left - (pr?.left || 0) + 22, r.top - (pr?.top || 0) + 22); }}>
                  <span className="ico"><Icon name="heart" size={30} fill={liked} /></span>
                  <span>{fmtCompact(s.likes + (liked ? 1 : 0))}</span>
                </button>
                <button className={saved ? 'liked' : ''} style={saved ? { color: 'var(--accent)' } : undefined} onClick={() => onSave(s)}>
                  <span className="ico"><Icon name="list" size={30} fill={saved} /></span>
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
                <button onClick={() => onShare(s)}>
                  <span className="ico"><Icon name="share" size={30} /></span>
                  <span>Share</span>
                </button>
              </div>
              <div className="vinfo" style={{ bottom: 'calc(var(--tabbar) + var(--sab) + 24px)' }} onClick={(e) => e.stopPropagation()}>
                <div className="chips-inline">
                  <span className="chip-s acc">{s.genre}</span>
                  <span className="chip-s">{s.episodes} episodes</span>
                  <span className="chip-s">EP {ep}</span>
                </div>
                <div className="vt">{s.title}</div>
                <div className="vc">{epCaption(s, ep)}</div>
                <button className="btn ghost" style={{ alignSelf: 'flex-start', height: 40, padding: '0 14px 0 12px', borderRadius: 10, fontSize: 13, backdropFilter: 'blur(12px)' }} onClick={() => { tap(); push('series', { id: s.id }); }}>
                  <Icon name="episodes" size={18} /><span>Watch full series</span><Icon name="chevron" size={16} />
                </button>
              </div>
            </VideoPage>
          );
        }}
      />
      <div className="vtop" onClick={(e) => e.stopPropagation()}>
        <div className="display" style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>For You</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CoinPill glass plus />
          <button className="circ" onClick={() => { tap(); setSound(muted); }} aria-label={muted ? 'Unmute' : 'Mute'}><Icon name={muted ? 'mute' : 'speaker'} size={20} /></button>
          <button className="circ" onClick={() => { tap(); push('search'); }} aria-label="Search"><Icon name="search" size={20} /></button>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 16, top: 'calc(var(--sat) + 48px)', zIndex: 6, fontSize: 11, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Coin size={12} /><span>{index + 1} / {feed.length}</span>
      </div>
      <LikeBurst at={burst} />
      <TabBar overlay />
    </div>
  );
}
