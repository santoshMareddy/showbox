import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Coin, Icon } from '../components/Icon';
import { CoinPill, TabBar } from '../components/ui';
import { toast } from '../components/toast';
import { success, tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { CHECKIN_REWARDS, checkedInToday, spinsLeft, tasksToday, useP, useStore } from '../store/useStore';
import { MiniWheel } from '../components/SpinWheel';
import { yesterdayKey } from '../lib/format';

function Flyer({ items }: { items: { id: number; amount: number }[] }) {
  return (
    <AnimatePresence>
      {items.map((f) => (
        <motion.div key={f.id} initial={{ opacity: 0, y: 0, scale: 0.8 }} animate={{ opacity: [0, 1, 1, 0], y: [0, -24, -60, -110], scale: [0.8, 1.1, 1, 0.9] }} transition={{ duration: 1.1, times: [0, 0.2, 0.6, 1] }} style={{ position: 'absolute', left: '50%', top: 0, marginLeft: -40, width: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22, color: 'var(--accent)', pointerEvents: 'none' }}>
          <Coin size={18} />+{f.amount}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export function RewardsScreen() {
  const p = useP();
  const doCheckIn = useStore((s) => s.doCheckIn);
  const completeAd = useStore((s) => s.completeAd);
  const claimWatched = useStore((s) => s.claimWatched);
  const claimList = useStore((s) => s.claimList);
  const claimInvite = useStore((s) => s.claimInvite);
  const showAd = useNav((s) => s.showAd);
  const openSheet = useNav((s) => s.openSheet);
  const spins = spinsLeft(p);
  const hideAd = useNav((s) => s.hideAd);
  const setTab = useNav((s) => s.setTab);
  const [fly, setFly] = useState<{ id: number; amount: number }[]>([]);

  const t = tasksToday(p);
  const done = checkedInToday(p);
  const streakBase = done ? p.checkIn.streak : p.checkIn.lastDate === yesterdayKey() ? p.checkIn.streak : 0;
  const todayDay = done ? p.checkIn.streak : (streakBase % 7) + 1;
  const earnedToday = p.transactions.filter((x) => x.type === 'reward' && x.at > Date.now() - 86_400_000 && new Date(x.at).getDate() === new Date().getDate()).reduce((a, x) => a + x.amount, 0);

  const pop = (amount: number) => {
    setFly((f) => [...f, { id: Date.now(), amount }]);
    setTimeout(() => setFly((f) => f.slice(1)), 1200);
  };

  return (
    <div className="screen">
      <div className="scroll tabbed">
        <div className="topbar">
          <div className="title-xl">Rewards</div>
          <CoinPill />
        </div>

        <div className="card" style={{ margin: '14px 20px 0', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Daily check-in</div>
            <div className="muted small">{done ? `Day ${todayDay} done` : `Day ${todayDay} of 7`}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {CHECKIN_REWARDS.map((r, i) => {
              const day = i + 1;
              const isDone = day < todayDay || (done && day === todayDay);
              const isToday = !done && day === todayDay;
              return (
                <motion.div key={day} className={`day${isDone ? ' done' : ''}${isToday ? ' today' : ''}`} animate={isToday ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={isToday ? { repeat: Infinity, duration: 1.6 } : undefined}>
                  {isDone ? <Icon name="check" size={16} stroke={2.4} style={{ color: 'var(--accent)' }} /> : day === 7 ? <Icon name="gift" size={16} style={{ color: isToday ? 'var(--accent-ink)' : 'var(--accent)' }} /> : <Coin size={16} dark={isToday} />}
                  <span>+{r}</span>
                  <span className="d">{isToday ? 'Today' : `Day ${day}`}</span>
                </motion.div>
              );
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <Flyer items={fly} />
            <motion.button whileTap={{ scale: 0.97 }} className="btn primary block" disabled={done} onClick={() => { const r = doCheckIn(); if (r) { success(); pop(r); toast(`+${r} coins · day ${todayDay} checked in`, { coin: true }); } }}>
              {done ? 'Checked in · come back tomorrow' : `Check in · +${CHECKIN_REWARDS[todayDay - 1]} coins`}
            </motion.button>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.98 }} className="spin-promo" onClick={() => { tap(); openSheet('spin'); }}>
          <span className="wheel-mini"><MiniWheel /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Lucky spin</div>
            <div className="muted small">{spins > 0 ? `${spins} spin${spins > 1 ? 's' : ''} ready · free episodes, coins, discounts` : 'Next free spin tomorrow · or watch an ad for one'}</div>
          </div>
          <span className="btn primary sm">Spin</span>
        </motion.div>

        <div className="section-h" style={{ paddingTop: 22 }}>
          <span>Tasks</span>
          <span className="more">Reset at midnight</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 20px 0' }}>
          <div className="task">
            <div className="i"><Icon name="ad" size={18} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Watch an ad</div>
              <div className="muted small">{t.ads} of 5 today</div>
            </div>
            <div className="reward"><Coin size={14} />+10</div>
            <button className="btn primary sm" disabled={t.ads >= 5} onClick={() => { tap(); showAd({ seconds: 6, label: 'Earn 10 coins', onDone: () => { hideAd(); const r = completeAd(); if (r) { success(); toast(`+${r} coins for watching an ad`, { coin: true }); } } }); }}>Go</button>
          </div>
          <div className="task">
            <div className="i"><Icon name="foryou" size={18} /></div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Watch 3 episodes</div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.12)' }}><motion.div style={{ height: 4, borderRadius: 2, background: 'var(--accent)' }} animate={{ width: `${Math.min(100, (t.watched / 3) * 100)}%` }} /></div>
            </div>
            <div className="reward"><Coin size={14} />+20</div>
            {t.watchedClaimed ? <button className="btn ghost sm" disabled>Claimed</button> : t.watched >= 3 ? <button className="btn primary sm" onClick={() => { const r = claimWatched(); if (r) { success(); toast(`+${r} coins claimed`, { coin: true }); } }}>Claim</button> : <button className="btn ghost sm" onClick={() => setTab('foryou')}>{t.watched} / 3</button>}
          </div>
          <div className="task">
            <div className="i"><Icon name="list" size={18} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Add a series to My List</div>
              <div className="muted small">{p.myList.length ? `${p.myList.length} saved` : 'Save any series'}</div>
            </div>
            <div className="reward"><Coin size={14} />+5</div>
            {t.listClaimed ? <button className="btn ghost sm" disabled>Claimed</button> : <button className="btn primary sm" disabled={p.myList.length === 0} onClick={() => { const r = claimList(); if (r) { success(); toast(`+${r} coins claimed`, { coin: true }); } }}>Claim</button>}
          </div>
          <div className="task">
            <div className="i"><Icon name="invite" size={18} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Invite a friend</div>
              <div className="muted small">You both get coins when they join</div>
            </div>
            <div className="reward"><Coin size={14} />+100</div>
            {t.inviteClaimed ? <button className="btn ghost sm" disabled>Sent</button> : (
              <button className="btn ghost sm" onClick={async () => {
                tap();
                const url = location.href;
                try { if (navigator.share) await navigator.share({ title: 'ShowBox', text: 'Join me on ShowBox', url }); else await navigator.clipboard.writeText(url); } catch { /* cancelled */ }
                const r = claimInvite();
                if (r) { success(); toast(`Invite sent · +${r} coins`, { coin: true }); }
              }}>Share</button>
            )}
          </div>
        </div>
        <div className="muted" style={{ padding: '18px 20px 0', textAlign: 'center', fontSize: 13 }}>Earned today: {earnedToday} coins</div>
      </div>
      <TabBar />
    </div>
  );
}
