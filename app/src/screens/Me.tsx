import { motion } from 'framer-motion';
import { Coin, Icon, type IconName } from '../components/Icon';
import { CountUp, TabBar } from '../components/ui';
import { toast } from '../components/toast';
import { NOTIFICATIONS } from '../data/catalog';
import { bonusLeft, checkedInToday, isVip, totalCoins, useP, useProfile, useStore } from '../store/useStore';
import { fmtDate, fmtNum, todayKey } from '../lib/format';
import { success, tap } from '../lib/haptics';
import { useNav, type ScreenName } from '../nav/useNav';

const ROWS: { icon: IconName; label: string; to: ScreenName }[] = [
  { icon: 'history', label: 'Watch history', to: 'history' },
  { icon: 'unlock', label: 'Unlocked episodes', to: 'unlocked' },
  { icon: 'bell', label: 'Notifications', to: 'notifications' },
  { icon: 'settings', label: 'Settings', to: 'settings' },
  { icon: 'help', label: 'Help and feedback', to: 'help' },
];

// Level system: XP is earned by watching, unlocking, saving, liking and keeping a streak.
const RANKS = ['Newcomer', 'Viewer', 'Binger', 'Explorer', 'Insider', 'Legend'];
const LEVEL_XP = 400;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const parseKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

export function MeScreen() {
  const p = useP();
  const profile = useProfile();
  const push = useNav((s) => s.push);
  const setTab = useNav((s) => s.setTab);
  const openSheet = useNav((s) => s.openSheet);
  const selectProfile = useStore((s) => s.selectProfile);
  const doCheckIn = useStore((s) => s.doCheckIn);
  const vip = isVip(p);
  const unread = NOTIFICATIONS.filter((n) => !p.notificationsRead.includes(n.id)).length;
  const unlockedCount = Object.values(p.unlocked).reduce((a, x) => a + x.length, 0);

  const xp = p.history.length * 60 + unlockedCount * 25 + p.checkIn.streak * 40 + p.myList.length * 15 + Object.keys(p.likes).length * 10 + p.finished.length * 120;
  const level = Math.floor(xp / LEVEL_XP) + 1;
  const pct = ((xp - (level - 1) * LEVEL_XP) / LEVEL_XP) * 100;
  const rank = RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))];

  // This week's check-ins, derived from the streak that ends on the last check-in date.
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const monday = shift(today, -dow);
  const done = new Set<string>();
  if (p.checkIn.lastDate) {
    const last = parseKey(p.checkIn.lastDate);
    for (let i = 0; i < p.checkIn.streak; i++) done.add(todayKey(shift(last, -i)));
  }
  const todayDone = checkedInToday(p);
  const alive = todayDone || done.has(todayKey(shift(today, -1)));
  const streak = alive ? p.checkIn.streak : 0;

  const checkIn = () => {
    tap();
    const r = doCheckIn();
    if (r) { success(); toast(`+${r} coins for today's check-in`, { coin: true }); }
  };

  return (
    <div className="screen">
      <div className="scroll tabbed">
        <div className="me-head">
          <div className="me-ring" onClick={() => { tap(); openSheet('profile'); }}>
            <div className={`avatar av-${profile?.color || 'teal'} me-avatar`}>{profile?.name.slice(0, 1).toUpperCase()}</div>
          </div>
          <div className="me-info">
            <div className="me-name" onClick={() => { tap(); openSheet('profile'); }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name}</span>
              <span className={`me-badge${vip ? ' vip' : ''}`}>{vip ? 'VIP' : 'FREE'}</span>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>Level {level} {rank}{profile?.kids ? ' · Kids' : ''}</div>
            <div className="me-xp">
              <div className="bar"><i style={{ width: `${Math.max(3, pct)}%` }} /></div>
              <span className="muted small" style={{ whiteSpace: 'nowrap' }}>{fmtNum(xp)} / {fmtNum(level * LEVEL_XP)} XP</span>
            </div>
          </div>
        </div>

        <div className="me-stats">
          <button className="me-stat" onClick={() => { tap(); setTab('mylist'); }}><span className="n">{p.myList.length}</span><span className="l">Watchlist</span></button>
          <button className="me-stat" onClick={() => { tap(); push('unlocked'); }}><span className="n">{unlockedCount}</span><span className="l">Unlocked</span></button>
          <button className="me-stat" onClick={() => { tap(); push('history'); }}><span className="n">{p.history.length}</span><span className="l">Watched</span></button>
        </div>

        <div className="streak">
          <div className="h" onClick={() => { tap(); setTab('rewards'); }}>
            <span className="t">Keep the stories going</span>
            <Icon name="chevron" size={18} style={{ color: 'var(--muted)' }} />
          </div>
          <div className="s">
            {streak > 0 ? <><span>You're on a {streak}-day streak!</span><Icon name="flame" size={16} fill className="flame" /></> : <span>Check in today to start a streak</span>}
          </div>
          <div className="week">
            {DAYS.map((d, i) => {
              const key = todayKey(shift(monday, i));
              const isToday = i === dow;
              const isDone = done.has(key);
              const future = i > dow;
              return (
                <div key={d} className="wk">
                  <span className="wk-l">{d}</span>
                  <button className={`wk-c${isDone ? ' done' : ''}${isToday ? ' today' : ''}${future ? ' future' : ''}`} disabled={!isToday || todayDone} onClick={checkIn} aria-label={isToday && !todayDone ? 'Check in today' : `${d}${isDone ? ', checked in' : ''}`}>
                    {isDone ? <Icon name="check" size={16} stroke={2.4} /> : isToday ? <Coin size={18} /> : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ margin: '12px 20px 0', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Coin size={16} />Coins</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <CountUp value={totalCoins(p)} className="display" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }} />
              {bonusLeft(p) > 0 && <span className="muted small">incl. {bonusLeft(p)} bonus</span>}
            </div>
          </div>
          <button className="btn primary sm" style={{ height: 36, borderRadius: 18 }} onClick={() => { tap(); push('wallet'); }}>Top up</button>
          <button className="btn ghost sm" style={{ height: 36, borderRadius: 18 }} onClick={() => { tap(); setTab('rewards'); }}>Earn</button>
        </div>

        <motion.div whileTap={{ scale: 0.98 }} className="vipcard" style={{ margin: '12px 20px 0' }} onClick={() => { tap(); push('vip'); }}>
          <div className="ico"><Icon name="crown" size={20} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{vip ? `VIP · ${p.vip!.plan[0].toUpperCase()}${p.vip!.plan.slice(1)}` : 'Go VIP'}</div>
            <div className="muted small">{vip ? `${p.vip!.trial ? 'Free trial' : 'Active'} until ${fmtDate(p.vip!.until)}` : 'Every episode unlocked, no ads'}</div>
          </div>
          <span className="btn primary sm" style={{ height: 32, padding: '0 12px' }}>{vip ? 'Manage' : 'Try free'}</span>
        </motion.div>

        <div style={{ padding: '18px 20px 0' }}>
          {ROWS.map((r, i) => (
            <div key={r.to} className={`list-row${i === ROWS.length - 1 ? ' last' : ''}`} onClick={() => { tap(); push(r.to); }}>
              <Icon name={r.icon} size={22} grad />
              <span>{r.label}</span>
              {r.to === 'notifications' && unread > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
              {r.to === 'unlocked' && unlockedCount > 0 && <span className="muted small">{unlockedCount}</span>}
              <Icon name="chevron" size={18} className="chev" />
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn outline block" onClick={() => { tap(); selectProfile(null); }}><Icon name="logout" size={18} /><span>Switch profile</span></button>
          <div className="muted" style={{ fontSize: 11, textAlign: 'center', lineHeight: '16px' }}>ShowBox demo 1.3 · Placeholder clips by Mixkit · No real payments</div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
