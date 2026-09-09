import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Icon, type IconName } from '../components/Icon';
import { Header, Poster } from '../components/ui';
import { toast } from '../components/toast';
import { NOTIFICATIONS, byId, epTitle } from '../data/catalog';
import { timeAgo } from '../lib/format';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { isVip, useP, useProfile, useStore } from '../store/useStore';

export function HistoryScreen() {
  const p = useP();
  const push = useNav((s) => s.push);
  const openSheet = useNav((s) => s.openSheet);
  const clearHistory = useStore((s) => s.clearHistory);
  return (
    <div className="screen">
      <Header title="Watch history" right={p.history.length > 0 && <button className="iconbtn" onClick={() => openSheet('confirm', { title: 'Clear watch history?', body: 'Your progress stays. Only the history list is cleared.', confirmLabel: 'Clear', danger: true, onConfirm: () => { clearHistory(); toast('History cleared'); } })} aria-label="Clear"><Icon name="trash" /></button>} />
      <div className="scroll plain">
        {p.history.length === 0 ? (
          <div className="empty"><div className="ico"><Icon name="history" size={26} /></div><b>No history yet</b><span>Episodes you watch show up here.</span></div>
        ) : p.history.map((h) => {
          const s = byId(h.seriesId);
          if (!s) return null;
          return (
            <div key={`${h.seriesId}-${h.ep}-${h.at}`} className="hist" onClick={() => { tap(); push('player', { seriesId: s.id, ep: h.ep }); }}>
              <Poster s={s} w={48} h={72} title={false} radius={8} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                <div className="muted small">EP {h.ep} · {epTitle(s, h.ep)}</div>
                <div className="muted small">{timeAgo(h.at)}</div>
              </div>
              <Icon name="play" size={20} fill style={{ color: 'var(--muted)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UnlockedScreen() {
  const p = useP();
  const push = useNav((s) => s.push);
  const entries = Object.entries(p.unlocked).filter(([, eps]) => eps.length > 0);
  return (
    <div className="screen">
      <Header title="Unlocked episodes" />
      <div className="scroll plain">
        {isVip(p) && <div className="vipcard" style={{ margin: '8px 20px 0' }}><div className="ico"><Icon name="crown" size={20} /></div><div style={{ fontSize: 14 }}>VIP is active, so every episode is unlocked.</div></div>}
        {entries.length === 0 && !isVip(p) ? (
          <div className="empty"><div className="ico"><Icon name="unlock" size={26} /></div><b>Nothing unlocked yet</b><span>Episodes you unlock with coins or ads are listed here.</span></div>
        ) : entries.map(([id, eps]) => {
          const s = byId(id);
          if (!s) return null;
          return (
            <div key={id} className="hist" style={{ alignItems: 'flex-start' }} onClick={() => { tap(); push('series', { id }); }}>
              <Poster s={s} w={48} h={72} title={false} radius={8} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</div>
                <div className="muted small">{eps.length} {eps.length === 1 ? 'episode' : 'episodes'} unlocked</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{eps.slice(0, 14).map((e) => <span key={e} className="meta-chip">EP {e}</span>)}{eps.length > 14 && <span className="meta-chip">+{eps.length - 14}</span>}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NOTIF_ICON: Record<string, IconName> = { film: 'film', coin: 'gift', gift: 'gift', crown: 'crown' };

export function NotificationsScreen() {
  const p = useP();
  const markRead = useStore((s) => s.markNotificationRead);
  const push = useNav((s) => s.push);
  const setTab = useNav((s) => s.setTab);
  const popAll = useNav((s) => s.popAll);
  const unread = NOTIFICATIONS.filter((n) => !p.notificationsRead.includes(n.id));
  const go = (id: string) => {
    markRead(id);
    if (id === 'n1') push('series', { id: 'heir' });
    else if (id === 'n5') push('series', { id: 'dragon' });
    else if (id === 'n2') push('wallet');
    else if (id === 'n4') push('vip');
    else { popAll(); setTab('rewards'); }
  };
  return (
    <div className="screen">
      <Header title="Notifications" right={unread.length > 0 && <button className="more" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, padding: '0 8px' }} onClick={() => { tap(); unread.forEach((n) => markRead(n.id)); }}>Mark all read</button>} />
      <div className="scroll plain">
        {NOTIFICATIONS.map((n) => {
          const isUnread = !p.notificationsRead.includes(n.id);
          return (
            <div key={n.id} className={`notif${isUnread ? ' unread' : ''}`} onClick={() => { tap(); go(n.id); }}>
              <div className="i"><Icon name={NOTIF_ICON[n.icon]} size={18} /></div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 14, fontWeight: isUnread ? 700 : 500 }}>{n.title}</div>
                <div className="muted small" style={{ lineHeight: '16px' }}>{n.body}</div>
                <div className="muted small">{timeAgo(n.at)}</div>
              </div>
              {isUnread && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', marginTop: 6 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FAQ = [
  ['How do coins work?', 'The first episodes of every series are free. Later episodes cost 50 coins each. Earn coins with the daily check-in, tasks and ads, or top up in the Wallet.'],
  ['What does VIP include?', 'VIP unlocks every episode of every series, removes ads and coin unlocks, and adds early access to new series.'],
  ['Why is a video muted?', 'Phones block sound until you interact. Tap the speaker icon in the player or the For You feed once, and sound stays on.'],
  ['Does my progress sync?', 'In this demo everything is stored on this device per profile. A real release would sync with an account.'],
  ['Is anything charged?', 'No. Purchases and subscriptions are simulated. Prices are sample values.'],
];

export function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="screen">
      <Header title="Help and feedback" />
      <div className="scroll plain" style={{ padding: '0 20px' }}>
        {FAQ.map(([q, a], i) => (
          <div key={q} className="faq">
            <button onClick={() => { tap(); setOpen(open === i ? null : i); }}>
              <span>{q}</span>
              <motion.span animate={{ rotate: open === i ? 180 : 0 }} style={{ display: 'flex', color: 'var(--muted)' }}><Icon name="chevronDown" size={18} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                  <p>{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 24 }}>
          <button className="btn primary block" onClick={() => toast('Thanks, feedback noted (demo)', { icon: 'check' })}>Send feedback</button>
          <button className="btn outline block" onClick={() => toast('Report sent (demo)', { icon: 'check' })}>Report a problem</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Privacy & data ---------- */
export function PrivacyScreen() {
  const p = useP();
  const profile = useProfile();
  const openSheet = useNav((s) => s.openSheet);
  const pop = useNav((s) => s.pop);
  const st = p.settings;
  const rows: { icon: IconName; label: string; on: boolean; sub: string }[] = [
    { icon: 'shield', label: 'Privacy screen', on: st.privacyScreen !== false, sub: 'Covers the app in the app switcher and whenever it loses focus' },
    { icon: 'noshot', label: 'Screenshot and recording block', on: st.blockCapture !== false, sub: 'Blanks the app on screenshot keys, clears the clipboard, disables save, cast and picture-in-picture' },
    { icon: 'lock', label: 'Profile lock', on: !!profile?.pin, sub: profile?.pin ? 'A 4-digit PIN opens this profile' : 'Anyone on this device can open this profile' },
    { icon: 'incognito', label: 'Incognito viewing', on: !!st.incognito, sub: st.incognito ? 'Watch history is not being saved' : 'Watch history is saved on this device only' },
  ];
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, data: p }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `showbox-${(profile?.name || 'profile').toLowerCase()}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Your data is downloading', { icon: 'check' });
  };
  const wipe = () => openSheet('confirm', {
    title: 'Delete everything on this device?',
    body: 'All profiles, coins, progress and lists stored in this browser are erased and the app restarts as new.',
    confirmLabel: 'Delete all',
    danger: true,
    onConfirm: () => { try { localStorage.removeItem('showbox-v1'); } catch { /* ignore */ } location.reload(); },
  });
  return (
    <div className="screen">
      <Header title="Privacy & data" />
      <div className="scroll plain">
        <div className="card" style={{ margin: '8px 20px 0', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}><Icon name="shield" size={20} grad />Everything stays on this device</div>
          <div className="muted" style={{ fontSize: 13, lineHeight: '19px' }}>Profiles, coins, unlocks, lists and watch progress live only in this browser. Nothing is sent to a server, nothing is shared with advertisers, and there is no account that could leak.</div>
        </div>
        <div className="set-h">Protection on this profile</div>
        <div className="set-group">
          {rows.map((r) => (
            <div key={r.label} className="set-row">
              <Icon name={r.icon} size={20} style={{ color: r.on ? 'var(--accent)' : 'var(--muted-2)' }} />
              <div className="l"><b>{r.label}</b><span>{r.sub}</span></div>
              <span className="badge-outline" style={r.on ? { color: 'var(--accent)', borderColor: 'rgba(255,61,138,.5)' } : undefined}>{r.on ? 'On' : 'Off'}</span>
            </div>
          ))}
          <div className="set-row tappable" onClick={() => { tap(); pop(); }}>
            <Icon name="settings" size={20} style={{ color: 'var(--text-2)' }} />
            <div className="l"><b>Change these in Settings</b><span>Privacy section</span></div>
            <Icon name="chevron" size={16} style={{ color: 'var(--muted)' }} />
          </div>
        </div>
        <div className="set-h">About screenshots</div>
        <div className="muted" style={{ padding: '0 20px', fontSize: 13, lineHeight: '19px' }}>A web app cannot cancel a phone's hardware screenshot. The store version of ShowBox would flag its screens as secure and stream with DRM, which is why captures of Netflix come out black. Here the app hides itself the moment it goes to the background and reacts to screenshot keys on a computer.</div>
        <div className="set-h">Your data</div>
        <div className="set-group">
          <div className="set-row tappable" onClick={() => { tap(); exportData(); }}>
            <Icon name="share" size={20} style={{ color: 'var(--text-2)' }} />
            <div className="l"><b>Download my data</b><span>Everything this profile has stored, as a file</span></div>
          </div>
          <div className="set-row tappable" onClick={() => { tap(); wipe(); }}>
            <Icon name="trash" size={20} style={{ color: 'var(--danger)' }} />
            <div className="l"><b style={{ color: 'var(--danger)' }}>Delete all data on this device</b><span>Profiles, coins, progress and lists</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
