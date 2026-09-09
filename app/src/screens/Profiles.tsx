import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Header, Toggle, Wordmark } from '../components/ui';
import { toast } from '../components/toast';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { useStore, type Profile } from '../store/useStore';
import { PinModal } from '../components/PinPad';

const COLORS = ['teal', 'amber', 'violet', 'coral', 'sky', 'lime'];

function AddForm({ onDone }: { onDone: () => void }) {
  const addProfile = useStore((s) => s.addProfile);
  const [name, setName] = useState('');
  const [color, setColor] = useState('coral');
  const [kids, setKids] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className={`avatar av-${color}`} style={{ width: 56, height: 56, fontSize: 24 }}>{(name || '?').slice(0, 1).toUpperCase()}</div>
        <div className="field" style={{ flex: 1 }}><input autoFocus value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="Name" /></div>
      </div>
      <div className="swatches">{COLORS.map((c) => <button key={c} className={`swatch av-${c}${color === c ? ' on' : ''}`} onClick={() => setColor(c)} aria-label={c} />)}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontSize: 15, fontWeight: 500 }}>Kids profile</div><div className="muted small">Only family-friendly series</div></div><Toggle on={kids} onChange={setKids} /></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn ghost" style={{ flex: 1 }} onClick={onDone}>Cancel</button>
        <button className="btn primary" style={{ flex: 1 }} disabled={!name.trim()} onClick={() => { addProfile(name.trim(), color, kids); toast(`Profile ${name.trim()} added`, { icon: 'check' }); onDone(); }}>Add</button>
      </div>
    </motion.div>
  );
}

export function ProfilesScreen({ manage = false }: { manage?: boolean }) {
  const profiles = useStore((s) => s.profiles);
  const activeId = useStore((s) => s.activeId);
  const selectProfile = useStore((s) => s.selectProfile);
  const [lockFor, setLockFor] = useState<Profile | null>(null);
  const removeProfile = useStore((s) => s.removeProfile);
  const renameProfile = useStore((s) => s.renameProfile);
  const openSheet = useNav((s) => s.openSheet);
  const [adding, setAdding] = useState(false);

  if (manage) {
    return (
      <div className="screen">
        <Header title="Manage profiles" />
        <div className="scroll plain" style={{ padding: '8px 20px 0' }}>
          {profiles.map((pr) => (
            <div key={pr.id} className="list-row">
              <div className={`avatar av-${pr.color}`} style={{ width: 40, height: 40, borderRadius: 12, fontSize: 18 }}>{pr.name.slice(0, 1).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div>{pr.name}{pr.id === activeId ? <span className="muted small"> · current</span> : ''}</div><div className="muted small">{pr.kids ? 'Kids' : 'Full catalog'}</div></div>
              <button className="iconbtn" onClick={() => { const n = prompt('Rename profile', pr.name); if (n && n.trim()) renameProfile(pr.id, n.trim().slice(0, 16)); }} aria-label="Rename"><Icon name="edit" size={18} /></button>
              <button className="iconbtn" disabled={profiles.length <= 1} onClick={() => openSheet('confirm', { title: `Remove ${pr.name}?`, body: 'Their coins, progress and lists are deleted from this device.', confirmLabel: 'Remove', danger: true, onConfirm: () => removeProfile(pr.id) })} aria-label="Remove"><Icon name="trash" size={18} style={{ color: profiles.length <= 1 ? 'var(--dim)' : 'var(--danger)' }} /></button>
            </div>
          ))}
          <div style={{ paddingTop: 16 }}>
            <AnimatePresence>{adding ? <AddForm onDone={() => setAdding(false)} /> : <button className="btn outline block" onClick={() => { tap(); setAdding(true); }}><Icon name="plus" size={18} /><span>Add profile</span></button>}</AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="profiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.3 }}>
      <Wordmark size={28} />
      <div className="display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 56 }}>Who is watching?</div>
      <AnimatePresence mode="wait">
        {adding ? (
          <motion.div key="add" style={{ width: '100%', marginTop: 28 }}><AddForm onDone={() => setAdding(false)} /></motion.div>
        ) : (
          <motion.div key="grid" className="pgrid" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
            {profiles.map((pr) => (
              <motion.button key={pr.id} className="ptile" variants={{ hide: { opacity: 0, y: 14, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }} whileTap={{ scale: 0.95 }} onClick={() => { tap(); if (pr.pin) setLockFor(pr); else selectProfile(pr.id); }}>
                <div className={`avatar av-${pr.color}`}>{pr.name.slice(0, 1).toUpperCase()}{pr.kids && <span className="kidsbadge">Kids</span>}{pr.pin && <span className="lockbadge"><Icon name="lock" size={13} stroke={2.2} /></span>}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{pr.name}</div>
              </motion.button>
            ))}
            {profiles.length < 6 && (
              <motion.button className="ptile" variants={{ hide: { opacity: 0, y: 14, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }} whileTap={{ scale: 0.95 }} onClick={() => { tap(); setAdding(true); }}>
                <div className="avatar add"><Icon name="plus" size={32} stroke={1.6} /></div>
                <div className="muted" style={{ fontSize: 15, fontWeight: 500 }}>Add profile</div>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {lockFor && <PinModal title={`Enter PIN for ${lockFor.name}`} verify={lockFor.pin} onDone={() => { const id = lockFor.id; setLockFor(null); selectProfile(id); }} onClose={() => setLockFor(null)} />}
      <div style={{ marginTop: 'auto' }} className="muted small">Demo profiles. Everything is stored on this device.</div>
    </motion.div>
  );
}
