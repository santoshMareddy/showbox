import { Icon, type IconName } from '../components/Icon';
import { useState } from 'react';
import { PinModal } from '../components/PinPad';
import { SERIES } from '../data/catalog';
import { isNative, nativeVersion } from '../lib/native';
import { Header, Toggle } from '../components/ui';
import { toast } from '../components/toast';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { useP, useProfile, useStore, type Settings } from '../store/useStore';

const ACCENTS = ['#FF3D8A', '#8B5CF6', '#22D3EE', '#FFB43C'];
const LANGS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Spanish', 'Portuguese', 'Indonesian'];
const QUALITY = ['Auto', '480p', '720p', '1080p'];

function Row({ icon, label, sub, right, onClick }: { icon: IconName; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void }) {
  return (
    <div className={`set-row${onClick ? ' tappable' : ''}`} onClick={onClick ? () => { tap(); onClick(); } : undefined}>
      <Icon name={icon} size={20} style={{ color: 'var(--text-2)' }} />
      <div className="l"><b>{label}</b>{sub && <span>{sub}</span>}</div>
      {right}
    </div>
  );
}

export function SettingsScreen() {
  const p = useP();
  const profile = useProfile();
  const set = useStore((s) => s.setSetting);
  const clearHistory = useStore((s) => s.clearHistory);
  const resetProfileData = useStore((s) => s.resetProfileData);
  const addCoins = useStore((s) => s.addCoins);
  const selectProfile = useStore((s) => s.selectProfile);
  const setPin = useStore((s) => s.setPin);
  const [pinMode, setPinMode] = useState<null | 'set' | 'change' | 'remove'>(null);
  const push = useNav((s) => s.push);
  const openSheet = useNav((s) => s.openSheet);
  const st = p.settings;
  const T = (k: keyof Settings) => <Toggle on={!!st[k]} onChange={(v) => set(k, v as never)} label={String(k)} />;
  const choose = (title: string, options: string[], value: string, onPick: (v: string) => void) => openSheet('choice', { title, options, value, onPick });

  return (
    <div className="screen">
      <Header title="Settings" />
      <div className="scroll plain">
        <div className="set-h">Playback</div>
        <div className="set-group">
          <Row icon="foryou" label="Autoplay next episode" sub="Continue to the next episode when one ends" right={T('autoplayNext')} />
          <Row icon="unlock" label="Auto-unlock episodes" sub="Spend 50 coins on each locked episode without asking" right={T('autoUnlock')} />
          <div className="set-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="time" size={20} style={{ color: 'var(--text-2)' }} /><div className="l"><b>Default speed</b></div></div>
            <div className="seg">{[1, 1.25, 1.5, 2].map((v) => <button key={v} className={st.speed === v ? 'on' : ''} onClick={() => { tap(); set('speed', v); }}>{v}×</button>)}</div>
          </div>
          <Row icon="hd" label="Video quality" sub="Higher quality uses more data" right={<span className="v">{st.dataSaver ? '480p' : 'Auto'}<Icon name="chevron" size={16} /></span>} onClick={() => choose('Video quality', QUALITY, st.dataSaver ? '480p' : 'Auto', (v) => set('dataSaver', v === '480p'))} />
          <Row icon="data" label="Data saver" sub="Lower quality on mobile data" right={T('dataSaver')} />
          <Row icon="speaker" label="Start with sound on" sub="Otherwise videos start muted until you tap the speaker" right={T('soundOnStart')} />
          <Row icon="episodes" label="Subtitles" sub="Show captions when available" right={T('subtitles')} />
        </div>

        <div className="set-h">Notifications</div>
        <div className="set-group">
          <Row icon="film" label="New episodes" sub="From series in your list" right={T('notifyEpisodes')} />
          <Row icon="gift" label="Coins and rewards" sub="Check-in reminders, expiring bonus coins" right={T('notifyCoins')} />
          <Row icon="sparkle" label="Offers" sub="VIP deals and top-up bonuses" right={T('notifyPromos')} />
        </div>

        <div className="set-h">Appearance</div>
        <div className="set-group">
          <div className="set-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="sparkle" size={20} style={{ color: 'var(--text-2)' }} /><div className="l"><b>Accent colour</b><span>Used for buttons, coins and highlights</span></div></div>
            <div className="swatches">{ACCENTS.map((c) => <button key={c} className={`swatch${st.accent === c ? ' on' : ''}`} style={{ background: c }} onClick={() => { tap(); set('accent', c); }} aria-label={c} />)}</div>
          </div>
          <Row icon="globe" label="Language" right={<span className="v">{st.language}<Icon name="chevron" size={16} /></span>} onClick={() => choose('Language', LANGS, st.language, (v) => set('language', v))} />
        </div>

        <div className="set-h">Account</div>
        <div className="set-group">
          <Row icon="user" label="Profile" sub={`${profile?.name}${profile?.kids ? ' · Kids' : ''}`} right={<span className="v">Switch<Icon name="chevron" size={16} /></span>} onClick={() => openSheet('profile')} />
          <Row icon="edit" label="Manage profiles" sub="Add, rename or remove profiles" right={<Icon name="chevron" size={16} style={{ color: 'var(--muted)' }} />} onClick={() => push('profiles')} />
          <Row icon="shield" label="Sign in" sub="Sync coins and progress across devices" right={<Icon name="chevron" size={16} style={{ color: 'var(--muted)' }} />} onClick={() => toast('Sign-in is not part of the demo')} />
        </div>

        <div className="set-h">Privacy</div>
        <div className="set-group">
          <Row icon="lock" label="Profile lock" sub={profile?.pin ? 'PIN required to open this profile' : 'Anyone on this device can open this profile'} right={<Toggle on={!!profile?.pin} onChange={(v) => setPinMode(v ? 'set' : 'remove')} label="Profile lock" />} />
          {profile?.pin && <Row icon="edit" label="Change PIN" right={<Icon name="chevron" size={16} style={{ color: 'var(--muted)' }} />} onClick={() => setPinMode('change')} />}
          <Row icon="shield" label="Privacy screen" sub="Hide the app in the app switcher and when it loses focus" right={T('privacyScreen')} />
          <Row icon="noshot" label="Block screenshots and recording" sub={isNative ? 'Android blocks the screenshot and the screen recorder outright' : 'Blanks the app on screenshot keys, disables save, cast and picture-in-picture'} right={T('blockCapture')} />
          <Row icon="incognito" label="Incognito viewing" sub="Don't save watch history on this profile" right={T('incognito')} />
          <Row icon="info" label="Privacy & data" sub="What is stored, download or delete it" right={<Icon name="chevron" size={16} style={{ color: 'var(--muted)' }} />} onClick={() => push('privacy')} />
        </div>

        <div className="set-h">Data</div>
        <div className="set-group">
          <Row icon="history" label="Clear watch history" sub={`${p.history.length} entries`} onClick={() => openSheet('confirm', { title: 'Clear watch history?', body: 'Your progress stays. Only the history list is cleared.', confirmLabel: 'Clear', danger: true, onConfirm: () => { clearHistory(); toast('History cleared'); } })} />
          <Row icon="plus" label="Add 1,000 demo coins" sub="Demo control" onClick={() => { addCoins(1000, 'Demo coins', 'bonus'); toast('+1,000 demo coins', { coin: true }); }} />
          <Row icon="refresh" label="Reset this profile" sub="Back to the demo starting state" onClick={() => openSheet('confirm', { title: 'Reset this profile?', body: 'Coins, unlocks, lists and history go back to the demo defaults.', confirmLabel: 'Reset', danger: true, onConfirm: () => { resetProfileData(); toast('Profile reset'); } })} />
          <Row icon="logout" label="Switch profile" onClick={() => selectProfile(null)} />
        </div>

        <div className="set-h">About</div>
        <div className="set-group">
          <Row icon="info" label="Version" right={<span className="v">{isNative ? `${nativeVersion()} Android` : '1.3 demo'}</span>} />
          <Row icon="film" label="Content" sub={`${SERIES.length} demo titles · placeholder clips by Mixkit, free licence`} />
          <Row icon="shield" label="Privacy" sub="Everything is stored on this device only" />
        </div>
        <div className="muted" style={{ padding: '18px 20px 0', fontSize: 11, textAlign: 'center' }}>ShowBox demo · no real payments · no real accounts</div>
      </div>
      {pinMode === 'set' && profile && <PinModal title="Set a profile PIN" sub="4 digits, asked whenever this profile is opened" confirm onDone={(pin) => { setPin(profile.id, pin); setPinMode(null); toast('Profile lock is on', { icon: 'lock' }); }} onClose={() => setPinMode(null)} />}
      {pinMode === 'change' && profile?.pin && <PinModal title="Enter your current PIN" verify={profile.pin} onDone={() => setPinMode('set')} onClose={() => setPinMode(null)} />}
      {pinMode === 'remove' && profile?.pin && <PinModal title="Enter your PIN to turn the lock off" verify={profile.pin} onDone={() => { setPin(profile.id, null); setPinMode(null); toast('Profile lock is off', { icon: 'unlock' }); }} onClose={() => setPinMode(null)} />}
    </div>
  );
}
