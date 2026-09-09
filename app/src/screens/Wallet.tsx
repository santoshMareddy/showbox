import { motion } from 'framer-motion';
import { Coin, Icon, type IconName } from '../components/Icon';
import { CountUp, Header } from '../components/ui';
import { toast } from '../components/toast';
import { daysUntil, fmtNum, timeAgo } from '../lib/format';
import { tap } from '../lib/haptics';
import { useNav } from '../nav/useNav';
import { PACKS, bonusLeft, isVip, totalCoins, useP, type TxType } from '../store/useStore';

const TX_ICON: Record<TxType, IconName> = { topup: 'plus', unlock: 'lock', reward: 'check', vip: 'crown', bonus: 'sparkle' };

export function WalletScreen() {
  const p = useP();
  const push = useNav((s) => s.push);
  const openSheet = useNav((s) => s.openSheet);
  const bonus = bonusLeft(p);

  return (
    <div className="screen">
      <Header title="Wallet" right={<button className="iconbtn" onClick={() => { tap(); push('history'); }} aria-label="History"><Icon name="clock" /></button>} />
      <div className="scroll plain">
        <div className="card" style={{ margin: '8px 20px 0', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><Coin size={22} />Balance</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <CountUp value={totalCoins(p)} className="display" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }} />
            <span className="muted" style={{ fontSize: 15 }}>coins</span>
          </div>
          <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: bonus ? 'var(--accent)' : 'var(--dim)' }} />
            <span>{bonus ? `includes ${fmtNum(bonus)} bonus coins · expire in ${daysUntil(p.bonus.expiresAt)} days` : 'No bonus coins right now'}</span>
          </div>
        </div>

        {(p.vouchers.freeEp > 0 || p.vouchers.coupons.some((c) => c.expiresAt > Date.now())) && (
          <div className="card" style={{ margin: '14px 20px 0', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="gift" size={18} style={{ color: 'var(--accent)' }} />Vouchers from Lucky spin</div>
            {p.vouchers.freeEp > 0 && <div className="muted small">{p.vouchers.freeEp} free episode{p.vouchers.freeEp > 1 ? 's' : ''} · use on any locked episode</div>}
            {p.vouchers.coupons.filter((c) => c.expiresAt > Date.now()).map((c) => <div key={c.id} className="muted small">{c.pct}% off your next {c.kind === 'pack' ? 'top-up' : 'VIP plan'} · applied at checkout · {daysUntil(c.expiresAt)} days left</div>)}
          </div>
        )}
        <div className="section-h" style={{ paddingTop: 22 }}>
          <span>Top up</span>
          <button className="more" onClick={() => { tap(); toast('Nothing to restore'); }}>Restore purchases</button>
        </div>
        <div className="grid2">
          {PACKS.map((pk) => (
            <motion.div key={pk.id} className={`pack${pk.popular ? ' popular' : ''}`} whileTap={{ scale: 0.97 }} onClick={() => { tap(); openSheet('purchase', { kind: 'pack', id: pk.id }); }}>
              {pk.tag && <div className="bonus">{pk.tag}</div>}
              <div className="display" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{fmtNum(pk.coins + pk.bonus)}</div>
              <div className="muted small">{pk.bonus ? `${fmtNum(pk.coins)} + ${fmtNum(pk.bonus)} bonus` : 'coins'}</div>
              <div className="price">${pk.price.toFixed(2)}</div>
            </motion.div>
          ))}
        </div>

        <motion.div whileTap={{ scale: 0.98 }} className="vipcard" style={{ margin: '14px 20px 0' }} onClick={() => { tap(); push('vip'); }}>
          <div className="ico"><Icon name="crown" size={20} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{isVip(p) ? 'VIP active' : 'Go VIP'}</div>
            <div className="muted small">{isVip(p) ? 'Every episode unlocked, no coins needed' : 'Every episode unlocked, no ads. From $9.99 a month.'}</div>
          </div>
          <Icon name="chevron" size={18} style={{ color: 'var(--muted)' }} />
        </motion.div>

        <div style={{ padding: '18px 20px 0' }}>
          <div className="section-h" style={{ padding: 0, height: 30 }}>Recent</div>
          {p.transactions.length === 0 && <div className="muted small" style={{ padding: '10px 0' }}>No transactions yet.</div>}
          {p.transactions.slice(0, 12).map((t) => (
            <div key={t.id} className="tx">
              <div className="i"><Icon name={TX_ICON[t.type]} size={18} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</div>
                <div className="muted small">{timeAgo(t.at)}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.amount > 0 ? 'var(--accent)' : t.amount < 0 ? 'var(--text-2)' : 'var(--muted)' }}>{t.amount > 0 ? `+${fmtNum(t.amount)}` : t.amount < 0 ? `−${fmtNum(-t.amount)}` : 'VIP'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
