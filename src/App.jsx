import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from './api/index.js';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lato:wght@300;400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #04091a; font-family: 'Lato', sans-serif; -webkit-font-smoothing: antialiased; overscroll-behavior: none; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.3); border-radius: 2px; }
  input::placeholder { color: rgba(143,163,188,0.4); }
  input:focus { outline: none; }
  button { outline: none; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes slideUp  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes scaleIn  { from{transform:scale(0.93);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes crossGlow{ 0%,100%{opacity:0.03} 50%{opacity:0.07} }
  .fade-up  { animation: fadeUp  0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in  { animation: fadeIn  0.3s ease both; }
  .scale-in { animation: scaleIn 0.35s cubic-bezier(0.34,1.4,0.64,1) both; }
  .s1{animation-delay:0.05s} .s2{animation-delay:0.1s} .s3{animation-delay:0.15s}
  .s4{animation-delay:0.2s}  .s5{animation-delay:0.25s}
  .btn-press:active { transform:scale(0.96); }
`;

const C = {
  bg: '#04091a', bgCard: 'rgba(255,255,255,0.035)', bgCard2: 'rgba(255,255,255,0.06)',
  navy: '#0b1630', navyMid: '#0f1e3a',
  gold: '#d4a843', goldLt: '#f0cc78', goldDim: 'rgba(212,168,67,0.15)', goldBdr: 'rgba(212,168,67,0.28)',
  white: '#f0f4ff', gray: '#8fa3bc', grayLt: '#b8cde0',
  red: '#f87171', redDim: 'rgba(248,113,113,0.1)', redBdr: 'rgba(248,113,113,0.3)',
  green: '#4ade80', greenDim: 'rgba(74,222,128,0.1)', greenBdr: 'rgba(74,222,128,0.3)',
  glass: 'rgba(255,255,255,0.04)', glassBdr: 'rgba(255,255,255,0.08)',
  blue: '#60a5fa', blueDim: 'rgba(96,165,250,0.12)', blueBdr: 'rgba(96,165,250,0.3)',
};

const CREDS = { user: 'admin', pass: 'loveofgod@123' };
const INSTRUCTIONS_URL = 'https://santhosh72744.github.io/instructions/';

const ICON_MAP = {
  'sound': '🔊', 'instrument': '🎸', 'generator': '⚡', 'parking': '🅿️',
  'carpet': '🏮', 'footwear': '👟', 'offering': '💝', 'announcement': '📢',
  'stage clean': '🧹', 'stage': '🎭', 'lead vocal': '🎤', 'vocal': '🎤',
  'seating': '💺', 'seat': '💺', 'water': '💧', 'church clean': '⛪',
  'washroom': '🚿', 'worship': '🎵', 'usher': '🤝', 'children': '👶',
  'hospitality': '🍽️', 'media': '🎬', 'prayer': '🙏', 'bible': '📖',
  'choir': '🎼', 'drum': '🥁', 'keyboard': '🎹', 'guitar': '🎸', 'bathroom': '🚽', 'carpets': '🟫'
};
const getAutoIcon = (name = '') => {
  const l = name.toLowerCase();
  for (const [k, v] of Object.entries(ICON_MAP)) if (l.includes(k)) return v;
  return '✝️';
};
const ALL_ICONS = ['🔊', '🎸', '⚡', '🅿️', '🏮', '👟', '🚽', '🟫', '🎭', '💝', '📢', '🧹', '🎤', '💺', '💧', '🚿', '⛪', '🎭', '🎵', '🤝', '👶', '🍽️', '🎬', '🙏', '📖', '🎼', '🥁', '🎹', '💒', '🕊️', '✝️', '📿', '🎨'];

const nextSunday = () => {
  const d = new Date(), diff = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};

/* ── UI Primitives ── */
const GoldBtn = ({ children, onClick, disabled = false, style = {} }) => (
  <button className="btn-press" onClick={disabled ? undefined : onClick} style={{
    background: disabled ? 'rgba(212,168,67,0.3)' : `linear-gradient(135deg,${C.gold},${C.goldLt})`,
    color: '#0a1020', border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Cinzel,Georgia,serif', fontWeight: '700', fontSize: '14px', padding: '12px 20px',
    letterSpacing: '0.5px', transition: 'all 0.2s', boxShadow: disabled ? 'none' : '0 4px 20px rgba(212,168,67,0.3)',
    opacity: disabled ? 0.6 : 1, ...style,
  }}>{children}</button>
);
const GhostBtn = ({ children, onClick, style = {} }) => (
  <button className="btn-press" onClick={onClick} style={{
    background: 'transparent', color: C.gold, border: `1.5px solid ${C.goldBdr}`, borderRadius: '12px',
    cursor: 'pointer', fontFamily: 'Lato,sans-serif', fontWeight: '700', fontSize: '13px',
    padding: '11px 18px', transition: 'all 0.2s', ...style,
  }}>{children}</button>
);
const DangerBtn = ({ children, onClick, style = {} }) => (
  <button className="btn-press" onClick={onClick} style={{
    background: C.redDim, color: C.red, border: `1px solid ${C.redBdr}`, borderRadius: '12px',
    cursor: 'pointer', fontFamily: 'Lato,sans-serif', fontWeight: '700', fontSize: '13px',
    padding: '11px 18px', transition: 'all 0.2s', ...style,
  }}>{children}</button>
);
const EditBtn = ({ children, onClick, style = {} }) => (
  <button className="btn-press" onClick={onClick} style={{
    background: 'rgba(212,168,67,0.08)', color: C.gold, border: `1px solid rgba(212,168,67,0.2)`,
    borderRadius: '10px', cursor: 'pointer', fontFamily: 'Lato,sans-serif', fontWeight: '700',
    fontSize: '12px', padding: '8px 12px', transition: 'all 0.2s', ...style,
  }}>{children}</button>
);
const SuccessBtn = ({ children, onClick, disabled = false, style = {} }) => (
  <button className="btn-press" onClick={disabled ? undefined : onClick} style={{
    background: disabled ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg,#166534,#22c55e)',
    color: '#fff', border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Cinzel,Georgia,serif', fontWeight: '700', fontSize: '14px', padding: '12px 20px',
    transition: 'all 0.2s', opacity: disabled ? 0.6 : 1, ...style,
  }}>{children}</button>
);
const GlassCard = ({ children, style = {}, className = '' }) => (
  <div className={className} style={{
    background: C.bgCard, border: `1px solid ${C.glassBdr}`, borderRadius: '16px',
    padding: '18px', marginBottom: '12px', backdropFilter: 'blur(12px)', ...style,
  }}>{children}</div>
);
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ color: C.white, fontSize: '22px', fontFamily: 'Cinzel,Georgia,serif', fontWeight: '700', letterSpacing: '0.5px' }}>{children}</div>
    {sub && <div style={{ color: C.gray, fontSize: '13px', marginTop: '4px' }}>{sub}</div>}
  </div>
);
const Badge = ({ children, color = C.gold, bg = C.goldDim }) => (
  <span style={{ background: bg, color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', fontFamily: 'Lato,sans-serif', letterSpacing: '0.3px' }}>{children}</span>
);
const Spinner = ({ size = 28 }) => (
  <div style={{ width: size, height: size, border: `2.5px solid rgba(212,168,67,0.15)`, borderTop: `2.5px solid ${C.gold}`, borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
);

/* ── Confirm Dialog ── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, padding: '24px'
    }}>
      <div className="scale-in" style={{
        background: `linear-gradient(145deg,${C.navyMid},#0a1628)`,
        border: `1px solid ${C.glassBdr}`, borderRadius: '20px', padding: '28px',
        maxWidth: '340px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: '36px', textAlign: 'center', marginBottom: '12px' }}>⚠️</div>
        <p style={{ color: C.white, fontSize: '17px', textAlign: 'center', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '8px' }}>Are you sure?</p>
        <p style={{ color: C.gray, fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <GhostBtn onClick={onCancel} style={{ flex: 1, textAlign: 'center' }}>Cancel</GhostBtn>
          <DangerBtn onClick={onConfirm} style={{ flex: 1, textAlign: 'center' }}>Delete</DangerBtn>
        </div>
      </div>
    </div>
  );
}

/* ── Login Screen ── */
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setErr('');
    if (!user.trim() || !pass) { setErr('Please fill in both fields'); return; }
    setBusy(true);
    setTimeout(() => {
      if (user.trim() === CREDS.user && pass === CREDS.pass) {
        sessionStorage.setItem('cmr_auth', '1'); onLogin();
      } else { setErr('Invalid username or password'); setBusy(false); }
    }, 700);
  };

  return (
    <div style={{
      minHeight: '100vh', background: `radial-gradient(ellipse at 50% 0%,#12284a 0%,${C.bg} 65%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      {[['8%', '18%', '60px', '15deg', '0'], ['82%', '12%', '40px', '-10deg', '0.8s'],
      ['15%', '78%', '80px', '5deg', '1.6s'], ['78%', '72%', '50px', '-20deg', '2.4s'],
      ['48%', '48%', '130px', '0deg', '3.2s']].map(([l, t, fs, rot, del], i) => (
        <div key={i} style={{
          position: 'absolute', left: l, top: t, fontSize: fs, opacity: 0.04,
          transform: `rotate(${rot})`, pointerEvents: 'none',
          animation: `crossGlow 4s ease-in-out infinite`, animationDelay: del
        }}>✝</div>
      ))}
      <div className="scale-in" style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%', margin: '0 auto 16px',
            background: 'radial-gradient(circle,rgba(212,168,67,0.18),rgba(212,168,67,0.03))',
            border: `2px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', boxShadow: '0 0 50px rgba(212,168,67,0.18)'
          }}>✝</div>
          <h1 style={{
            fontFamily: 'Cinzel,Georgia,serif', fontSize: '26px', fontWeight: '900',
            color: C.white, letterSpacing: '2px', marginBottom: '6px'
          }}>AMOR DEI MINISTRIES</h1>
          <p style={{ color: C.gray, fontSize: '12px', letterSpacing: '2px' }}>CHURCH ASSIGNMENT MANAGER</p>
        </div>
        <div style={{
          background: 'linear-gradient(145deg,rgba(15,30,60,0.9),rgba(8,16,36,0.97))',
          border: `1px solid ${C.glassBdr}`, borderRadius: '22px', padding: '32px',
          backdropFilter: 'blur(20px)', boxShadow: '0 32px 100px rgba(0,0,0,0.55)'
        }}>
          <p style={{ color: C.gray, fontSize: '13px', marginBottom: '24px', textAlign: 'center' }}>Sign in to continue</p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: C.gray, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>👤</span>
              <input value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="admin"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${err ? C.redBdr : C.glassBdr}`, borderRadius: '12px', padding: '14px 14px 14px 44px', color: C.white, fontSize: '15px', fontFamily: 'Lato,sans-serif' }} />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: C.gray, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
              <input value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type={show ? 'text' : 'password'} placeholder="••••••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${err ? C.redBdr : C.glassBdr}`, borderRadius: '12px', padding: '14px 44px 14px 44px', color: C.white, fontSize: '15px', fontFamily: 'Lato,sans-serif' }} />
              <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {err && <div style={{ background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: C.red, fontSize: '13px', textAlign: 'center' }}>⚠️ {err}</div>}
          <GoldBtn onClick={submit} disabled={busy} style={{ width: '100%', padding: '15px', fontSize: '15px', borderRadius: '14px' }}>
            {busy ? '⏳ Signing in…' : '✝ Sign In'}
          </GoldBtn>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(143,163,188,0.3)', fontSize: '11px', marginTop: '20px' }}>Authorized Access Only</p>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('cmr_auth') === '1');
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {authed
        ? <MainApp onLogout={() => { sessionStorage.removeItem('cmr_auth'); setAuthed(false); }} />
        : <LoginScreen onLogin={() => setAuthed(true)} />}
    </>
  );
}

/* ── Main App ── */
function MainApp({ onLogout }) {
  const [members, setMembers] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [interests, setInterests] = useState([]);
  const [roster, setRoster] = useState(null);   // latest/current roster
  const [history, setHistory] = useState([]);

  // CHANGE 2: viewRosterId — which roster is active in Roster tab
  // null = use `roster` (current/latest), string = editing a history item
  const [viewRosterId, setViewRosterId] = useState(null);

  const [churchName, setChurchName] = useState('AMOR DEI MINISTRIES');
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [actionLoad, setActionLoad] = useState(false);
  const [modal, setModal] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [posterImg, setPosterImg] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [mForm, setMForm] = useState('');
  const [mEditing, setMEditing] = useState(null);
  // CHANGE 1: minForm includes limit
  const [minForm, setMinForm] = useState({ name: '', icon: '✝️', limit: 1 });
  const [minEditing, setMinEditing] = useState(null);

  const bgRef = useRef(null);

  // CHANGE 2: computed active roster
  const activeRoster = viewRosterId
    ? (history.find(h => h._id === viewRosterId) ?? roster)
    : roster;

  const isViewingHistory = viewRosterId !== null;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, mn, i, r, h] = await Promise.all([
        api.getMembers(), api.getMinistries(), api.getInterests(),
        api.getLatestRoster(), api.getRosters(),
      ]);
      setMembers(m); setMinistries(mn); setInterests(i);
      setRoster(r); setHistory(h.slice(1));
    } catch { showToast('Failed to connect to server ❌', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  /* ── Helper to update a roster in state wherever it lives ── */
  const syncRoster = (updated) => {
    if (roster && updated._id === roster._id) {
      setRoster(updated);
    } else {
      setHistory(h => h.map(r => r._id === updated._id ? updated : r));
    }
  };

  /* ── Roster ops ── */
  const handleGenerate = async () => {
    if (ministries.length === 0) { showToast('Add ministries first!', 'error'); return; }
    setActionLoad(true);
    try {
      const nr = await api.generateRoster(nextSunday());
      if (roster) setHistory(h => [roster, ...h].slice(0, 20));
      setRoster(nr); setViewRosterId(null); setTab('roster'); showToast('Roster generated! ✨');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoad(false); }
  };

  const handleConfirm = async () => {
    if (!activeRoster) return;
    setActionLoad(true);
    try {
      const u = await api.confirmRoster(activeRoster._id);
      syncRoster(u); showToast('Roster confirmed ✅');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoad(false); }
  };

  const handleDeleteRoster = (id, isCurrent) => {
    setConfirm({
      message: 'This roster will be permanently deleted.',
      onConfirm: async () => {
        setConfirm(null); setActionLoad(true);
        try {
          await api.deleteRoster(id);
          if (isCurrent) { setRoster(null); setViewRosterId(null); }
          else {
            setHistory(h => h.filter(r => r._id !== id));
            if (viewRosterId === id) { setViewRosterId(null); }
          }
          showToast('Roster deleted', 'error');
          setTab('dashboard');
        } catch (e) { showToast(e.message, 'error'); }
        finally { setActionLoad(false); }
      },
    });
  };

  // CHANGE 1: check ministry limit before adding
  const handleAddMember = async (ministryId, memberId) => {
    if (!activeRoster) return;
    const assignment = (activeRoster.assignments || []).find(a => (a.ministryId?._id || a.ministryId)?.toString() === ministryId);
    const ministry = ministries.find(m => m._id === ministryId);
    const lim = ministry?.limit || 1;
    if ((assignment?.memberIds || []).length >= lim) {
      showToast(`Limit of ${lim} reached for ${ministry?.name || 'this ministry'}`, 'error');
      setModal(null); return;
    }
    setActionLoad(true);
    try {
      const u = await api.addMember(activeRoster._id, ministryId, memberId);
      syncRoster(u); setModal(null); showToast('Member added ✅');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoad(false); }
  };

  const handleRemoveMember = async (ministryId, memberId) => {
    if (!activeRoster) return;
    setActionLoad(true);
    try {
      const u = await api.removeMember(activeRoster._id, ministryId, memberId);
      syncRoster(u); showToast('Member removed 🔄');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoad(false); }
  };

  const getAddCandidates = (ministryId) => {
    const assignment = (activeRoster?.assignments || []).find(a => (a.ministryId?._id || a.ministryId)?.toString() === ministryId);
    const alreadyIn = new Set((assignment?.memberIds || []).map(m => (m?._id || m)?.toString()));
    const ministry = ministries.find(m => m._id === ministryId);
    const lim = ministry?.limit || 1;
    const currentCount = (assignment?.memberIds || []).length;
    if (currentCount >= lim) return []; // limit reached
    return interests
      .filter(i => (i.ministryId?._id || i.ministryId)?.toString() === ministryId)
      .map(i => members.find(m => m._id === (i.memberId?._id || i.memberId)?.toString() || m._id === i.memberId))
      .filter(m => m && !alreadyIn.has(m._id));
  };

  /* ── Members ── */
  const saveMember = async () => {
    const name = mForm.trim(); if (!name) return;
    setActionLoad(true);
    try {
      if (mEditing) { const u = await api.updateMember(mEditing, name); setMembers(p => p.map(m => m._id === mEditing ? u : m)); setMEditing(null); showToast('Member updated'); }
      else { const c = await api.createMember(name); setMembers(p => [...p, c]); showToast('Member added ✅'); }
      setMForm('');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoad(false); }
  };

  const deleteMember = (id) => {
    setConfirm({
      message: 'This member and their interests will be removed.', onConfirm: async () => {
        setConfirm(null); setActionLoad(true);
        try { await api.deleteMember(id); setMembers(p => p.filter(m => m._id !== id)); setInterests(p => p.filter(i => (i.memberId?._id || i.memberId) !== id)); showToast('Member removed', 'error'); }
        catch (e) { showToast(e.message, 'error'); }
        finally { setActionLoad(false); }
      }
    });
  };

  /* ── Ministries (CHANGE 1: includes limit) ── */
  const saveMinistry = async () => {
    const name = minForm.name.trim(); if (!name) return;
    const lim = Math.max(1, parseInt(minForm.limit) || 1);
    setActionLoad(true);
    try {
      if (minEditing) {
        const u = await api.updateMinistry(minEditing, name, minForm.icon, lim);
        setMinistries(p => p.map(m => m._id === minEditing ? u : m)); setMinEditing(null); showToast('Ministry updated');
      } else {
        const icon = minForm.icon !== '✝️' ? minForm.icon : getAutoIcon(name);
        const c = await api.createMinistry(name, icon, lim); setMinistries(p => [...p, c]); showToast('Ministry added ✅');
      }
      setMinForm({ name: '', icon: '✝️', limit: 1 });
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoad(false); }
  };

  const deleteMinistry = (id) => {
    setConfirm({
      message: 'This ministry and related interests will be removed.', onConfirm: async () => {
        setConfirm(null); setActionLoad(true);
        try { await api.deleteMinistry(id); setMinistries(p => p.filter(m => m._id !== id)); setInterests(p => p.filter(i => (i.ministryId?._id || i.ministryId) !== id)); showToast('Ministry removed', 'error'); }
        catch (e) { showToast(e.message, 'error'); }
        finally { setActionLoad(false); }
      }
    });
  };

  /* ── Interests ── */
  const handleToggleInterest = async (memberId, ministryId) => {
    try {
      const r = await api.toggleInterest(memberId, ministryId);
      if (r.action === 'removed') setInterests(p => p.filter(i => !((i.memberId?._id || i.memberId) === memberId && (i.ministryId?._id || i.ministryId) === ministryId)));
      else setInterests(p => [...p, r.interest]);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const isInterested = (mId, mnId) => interests.some(i => (i.memberId?._id || i.memberId)?.toString() === mId && (i.ministryId?._id || i.ministryId)?.toString() === mnId);

  /* ── CHANGE 3: Poster — fixed multi-member overlap ── */
  const generatePoster = (rosterToPrint) => {
    const r = rosterToPrint || activeRoster;
    if (!r) return;
    const W = 820;
    const asgn = r.assignments || [];
    const BASE_ROW = 48, MEMBER_LINE = 30, PAD = 16;

    // Pre-calculate row heights
    const rowHeights = asgn.map(a => {
      const cnt = Math.max(1, (a.memberIds || []).length);
      return BASE_ROW + cnt * MEMBER_LINE + PAD;
    });
    const totalRowH = rowHeights.reduce((s, h) => s + h, 0);
    const H = 300 + totalRowH + 100;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.strokeRect(14, 14, W - 28, H - 28);
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(212,168,67,0.35)'; ctx.strokeRect(26, 26, W - 52, H - 52);

      ctx.fillStyle = C.gold; ctx.font = 'bold 52px Georgia,serif'; ctx.textAlign = 'center'; ctx.fillText('✝', W / 2, 88);
      ctx.fillStyle = C.goldLt; ctx.font = 'bold 32px Georgia,serif'; ctx.fillText(churchName.toUpperCase(), W / 2, 144);
      ctx.fillStyle = 'rgba(240,244,255,0.9)'; ctx.font = '20px Georgia,serif'; ctx.fillText('SUNDAY MINISTRIES', W / 2, 178);
      ctx.fillStyle = C.gold; ctx.font = '14px Georgia,serif'; ctx.fillText(r.date, W / 2, 204);

      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(60, 222); ctx.lineTo(W - 60, 222); ctx.stroke(); ctx.setLineDash([]);

      let y = 244;
      asgn.forEach((a, i) => {
        const min = a.ministryId;
        const memberIds = a.memberIds || [];
        const rH = rowHeights[i];

        // Row background
        ctx.fillStyle = i % 2 === 0 ? 'rgba(212,168,67,0.08)' : 'rgba(255,255,255,0.02)';
        rr(ctx, 52, y, W - 104, rH - 6, 10); ctx.fill();

        // Ministry name — full width, left aligned
        ctx.fillStyle = C.goldLt; ctx.font = 'bold 17px Georgia,serif'; ctx.textAlign = 'left';
        ctx.fillText(`${min?.icon || '•'} ${min?.name || ''}`, 72, y + 28);

        // Members — right aligned, stacked vertically below ministry name
        if (memberIds.length === 0) {
          ctx.fillStyle = '#f87171'; ctx.font = '15px Georgia,serif'; ctx.textAlign = 'right';
          ctx.fillText('— Unassigned —', W - 72, y + 28);
        } else {
          memberIds.forEach((mem, mi) => {
            const my = y + 28 + mi * MEMBER_LINE + (mi === 0 ? 0 : 4);
            ctx.fillStyle = 'rgba(212,168,67,0.5)'; ctx.font = '13px Georgia,serif'; ctx.textAlign = 'right';
            ctx.fillText('•', W - 72, my);
            ctx.fillStyle = '#f0f4ff'; ctx.font = '15px Georgia,serif';
            ctx.fillText(mem?.name || '', W - 88, my);
          });
        }

        y += rH;
      });

      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(60, y + 8); ctx.lineTo(W - 60, y + 8); ctx.stroke(); ctx.setLineDash([]);

      ctx.fillStyle = C.gold; ctx.font = '14px Georgia,serif'; ctx.textAlign = 'center'; ctx.fillText('May God bless your service! 🙏', W / 2, H - 54);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '11px sans-serif'; ctx.fillText('AMOR DEI MINISTRIES', W / 2, H - 32);

      setPosterImg(canvas.toDataURL('image/png')); setShowPreview(true);
    };

    if (bgImage) { const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0, W, H); ctx.fillStyle = 'rgba(4,9,26,0.82)'; ctx.fillRect(0, 0, W, H); draw(); }; img.src = bgImage; }
    else { const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#04091a'); g.addColorStop(0.5, '#0a1628'); g.addColorStop(1, '#04091a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); draw(); }
  };

  /* ══ RENDER SECTIONS ══════════════════════════════════════════════════ */

  const renderDashboard = () => (
    <div style={{ padding: '20px' }}>
      <div className="fade-up" style={{
        textAlign: 'center', marginBottom: '24px',
        background: 'linear-gradient(145deg,rgba(15,30,60,0.6),rgba(10,20,40,0.4))',
        border: `1px solid ${C.glassBdr}`, borderRadius: '20px', padding: '28px 20px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '140px', opacity: 0.04, pointerEvents: 'none', animation: 'crossGlow 5s ease-in-out infinite'
        }}>✝</div>
        <div style={{ fontSize: '32px', marginBottom: '10px', filter: 'drop-shadow(0 0 18px rgba(212,168,67,0.5))' }}>✝</div>
        <input value={churchName} onChange={e => setChurchName(e.target.value)} style={{
          background: 'transparent', border: 'none', borderBottom: `2px solid ${C.goldBdr}`,
          color: C.white, fontSize: '24px', fontWeight: '900', textAlign: 'center',
          padding: '4px 16px', width: '100%', fontFamily: 'Cinzel,Georgia,serif', letterSpacing: '1px',
        }} />
        <div style={{ color: C.gray, fontSize: '10px', marginTop: '6px', letterSpacing: '1.5px' }}>JESUS LOVES YOU</div>
      </div>

      <div className="fade-up s1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '22px' }}>
        {[{ v: members.length, l: 'Members', i: '👥', bg: 'rgba(212,168,67,0.08)' }, { v: ministries.length, l: 'Ministries', i: '⛪', bg: 'rgba(74,222,128,0.06)' }, { v: history.length, l: 'History', i: '📅', bg: 'rgba(99,179,237,0.06)' }]
          .map(s => (
            <div key={s.l} style={{ background: s.bg, border: `1px solid ${C.glassBdr}`, borderRadius: '16px', padding: '16px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.i}</div>
              <div style={{ color: C.white, fontSize: '28px', fontWeight: '900', fontFamily: 'Cinzel,Georgia,serif' }}>{s.v}</div>
              <div style={{ color: C.gray, fontSize: '11px', letterSpacing: '0.5px' }}>{s.l}</div>
            </div>
          ))}
      </div>

      <button className="btn-press fade-up s2" onClick={handleGenerate} disabled={actionLoad} style={{
        width: '100%', padding: '22px', borderRadius: '18px', border: 'none',
        background: actionLoad ? 'rgba(212,168,67,0.35)' : `linear-gradient(135deg,${C.gold},${C.goldLt})`,
        color: '#07100a', fontSize: '18px', fontWeight: '900', fontFamily: 'Cinzel,Georgia,serif',
        letterSpacing: '1px', marginBottom: '12px', cursor: actionLoad ? 'not-allowed' : 'pointer',
        boxShadow: '0 8px 36px rgba(212,168,67,0.38)',
      }}>{actionLoad ? '⏳ Generating…' : 'Generate Sunday Poster'}</button>

      {roster && (
        <button className="btn-press fade-up s3" onClick={() => { setViewRosterId(null); setTab('roster'); }} style={{
          width: '100%', padding: '15px', borderRadius: '14px',
          background: 'transparent', border: `1.5px solid ${C.goldBdr}`,
          color: C.gold, fontSize: '14px', cursor: 'pointer', fontFamily: 'Cinzel,Georgia,serif',
          marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <span>📋 View Current Poster</span>
          <Badge>{roster.status === 'confirmed' ? '✅ Confirmed' : '📝 Draft'}</Badge>
        </button>
      )}

      {/* CHANGE 2: History with Edit button */}
      {history.length > 0 && (
        <div className="fade-up s4">
          <div style={{ color: C.gray, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700' }}>Past Posters</div>
          {history.map((h, idx) => (
            <GlassCard key={h._id} className={`fade-up s${Math.min(idx + 1, 5)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.white, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif' }}>{h.date}</div>
                  <div style={{ color: C.gray, fontSize: '12px', marginTop: '3px' }}>{h.assignments?.length} ministries</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <Badge color={h.status === 'confirmed' ? C.green : C.gold} bg={h.status === 'confirmed' ? C.greenDim : C.goldDim}>
                    {h.status === 'confirmed' ? '✅' : '📝'}
                  </Badge>
                  {/* CHANGE 2: Edit old poster button */}
                  <button onClick={() => { setViewRosterId(h._id); setTab('roster'); }} style={{
                    background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: '8px',
                    color: C.blue, cursor: 'pointer', padding: '5px 9px', fontSize: '12px', fontWeight: '700',
                  }}>✏️ Edit</button>
                  {/* Download old poster */}
                  <button onClick={() => generatePoster(h)} style={{
                    background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: '8px',
                    color: C.gold, cursor: 'pointer', padding: '5px 9px', fontSize: '12px', fontWeight: '700',
                  }}>🖼️</button>
                  <button onClick={() => handleDeleteRoster(h._id, false)} style={{
                    background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: '8px',
                    color: C.red, cursor: 'pointer', padding: '5px 9px', fontSize: '13px',
                  }}>🗑️</button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderMembers = () => (
    <div style={{ padding: '20px' }}>
      <div className="fade-up"><SectionTitle sub={`${members.length} total member${members.length !== 1 ? 's' : ''}`}>👥 Members</SectionTitle></div>
      <GlassCard className="fade-up s1">
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={mForm} onChange={e => setMForm(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveMember()}
            placeholder={mEditing ? 'Edit member name…' : 'New member name…'}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.glassBdr}`, borderRadius: '12px', padding: '13px 16px', color: C.white, fontSize: '15px', fontFamily: 'Lato,sans-serif' }} />
          <GoldBtn onClick={saveMember} disabled={actionLoad}>{mEditing ? '✓' : '+'}</GoldBtn>
          {mEditing && <DangerBtn onClick={() => { setMEditing(null); setMForm(''); }}>✕</DangerBtn>}
        </div>
      </GlassCard>
      {members.length === 0 && <div style={{ textAlign: 'center', color: C.gray, padding: '40px 20px', fontSize: '14px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>No members yet.</div>}
      {members.map((m, idx) => {
        const mints = interests.filter(i => (i.memberId?._id || i.memberId) === m._id || i.memberId === m._id)
          .map(i => ministries.find(mn => mn._id === (i.ministryId?._id || i.ministryId))).filter(Boolean);
        return (
          <GlassCard key={m._id} className={`fade-up s${Math.min(idx + 2, 5)}`} style={{ borderColor: mEditing === m._id ? C.goldBdr : C.glassBdr }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.white, fontSize: '16px', fontWeight: '700', fontFamily: 'Cinzel,Georgia,serif' }}>{m.name}</div>
                <div style={{ color: C.gray, fontSize: '12px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mints.length > 0 ? mints.map(mn => `${mn.icon} ${mn.name}`).join(' · ') : 'No interests set yet'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                <EditBtn onClick={() => { setMEditing(m._id); setMForm(m.name); }}>✏️</EditBtn>
                <DangerBtn onClick={() => deleteMember(m._id)} style={{ padding: '8px 12px' }}>🗑️</DangerBtn>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );

  /* CHANGE 1: Ministry form includes limit input */
  const renderMinistries = () => (
    <div style={{ padding: '20px' }}>
      <div className="fade-up"><SectionTitle sub={`${ministries.length} total ministr${ministries.length !== 1 ? 'ies' : 'y'}`}>⛪ Ministries</SectionTitle></div>
      <GlassCard className="fade-up s1">
        <div style={{ color: C.gray, fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '700' }}>Choose Icon</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {ALL_ICONS.map(ic => (
            <button key={ic} onClick={() => setMinForm(f => ({ ...f, icon: ic }))} style={{
              width: '38px', height: '38px', background: minForm.icon === ic ? C.gold : 'rgba(255,255,255,0.05)',
              border: `1px solid ${minForm.icon === ic ? C.gold : C.glassBdr}`, borderRadius: '10px',
              fontSize: '19px', cursor: 'pointer', transition: 'all 0.15s',
            }}>{ic}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input value={minForm.name} onChange={e => setMinForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && saveMinistry()}
            placeholder={minEditing ? 'Edit name…' : 'Ministry name…'}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.glassBdr}`, borderRadius: '12px', padding: '13px 16px', color: C.white, fontSize: '15px', fontFamily: 'Lato,sans-serif' }} />
          <GoldBtn onClick={saveMinistry} disabled={actionLoad}>{minEditing ? '✓' : '+'}</GoldBtn>
          {minEditing && <DangerBtn onClick={() => { setMinEditing(null); setMinForm({ name: '', icon: '✝️', limit: 1 }); }}>✕</DangerBtn>}
        </div>
        {/* CHANGE 1: Limit input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(212,168,67,0.06)', border: `1px solid ${C.goldBdr}`, borderRadius: '10px', padding: '10px 14px' }}>
          <span style={{ fontSize: '16px' }}>👥</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.goldLt, fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Person Limit</div>
            <div style={{ color: C.gray, fontSize: '11px', marginTop: '2px' }}>Max people assigned to this ministry</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setMinForm(f => ({ ...f, limit: Math.max(1, (parseInt(f.limit) || 1) - 1) }))} style={{
              width: '32px', height: '32px', background: 'rgba(212,168,67,0.15)', border: `1px solid ${C.goldBdr}`,
              borderRadius: '8px', color: C.gold, cursor: 'pointer', fontSize: '18px', fontWeight: '700',
            }}>−</button>
            <div style={{ color: C.white, fontSize: '20px', fontWeight: '900', fontFamily: 'Cinzel,Georgia,serif', minWidth: '28px', textAlign: 'center' }}>
              {minForm.limit || 1}
            </div>
            <button onClick={() => setMinForm(f => ({ ...f, limit: Math.min(20, (parseInt(f.limit) || 1) + 1) }))} style={{
              width: '32px', height: '32px', background: 'rgba(212,168,67,0.15)', border: `1px solid ${C.goldBdr}`,
              borderRadius: '8px', color: C.gold, cursor: 'pointer', fontSize: '18px', fontWeight: '700',
            }}>+</button>
          </div>
        </div>
      </GlassCard>

      {ministries.length === 0 && <div style={{ textAlign: 'center', color: C.gray, padding: '40px 20px', fontSize: '14px' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>⛪</div>No ministries yet.</div>}

      {/* CHANGE 1: Ministry card shows limit + edit sets limit */}
      {ministries.map((m, idx) => {
        const count = interests.filter(i => (i.ministryId?._id || i.ministryId) === m._id).length;
        return (
          <GlassCard key={m._id} className={`fade-up s${Math.min(idx + 2, 5)}`} style={{ borderColor: minEditing === m._id ? C.goldBdr : C.glassBdr }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', background: C.goldDim,
                  border: `1px solid rgba(212,168,67,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px'
                }}>
                  {m.icon}
                </div>
                <div>
                  <div style={{ color: C.white, fontSize: '16px', fontWeight: '700', fontFamily: 'Cinzel,Georgia,serif' }}>{m.name}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ color: C.gray, fontSize: '12px' }}>{count} interested</span>
                    <Badge color={C.goldLt} bg='rgba(212,168,67,0.1)'>Limit: {m.limit || 1}</Badge>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <EditBtn onClick={() => { setMinEditing(m._id); setMinForm({ name: m.name, icon: m.icon, limit: m.limit || 1 }); }}>✏️</EditBtn>
                <DangerBtn onClick={() => deleteMinistry(m._id)} style={{ padding: '8px 12px' }}>🗑️</DangerBtn>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );

  const renderInterests = () => (
    <div style={{ padding: '20px' }}>
      <div className="fade-up"><SectionTitle sub="Tap a ministry to toggle. Gold = interested.">💛 Interest Mapping</SectionTitle></div>
      {members.length === 0 && <GlassCard><div style={{ color: C.gray, fontSize: '14px', textAlign: 'center' }}>Add members first.</div></GlassCard>}
      {members.map((mem, idx) => {
        const ac = interests.filter(i => (i.memberId?._id || i.memberId) === mem._id || i.memberId === mem._id).length;
        return (
          <GlassCard key={mem._id} className={`fade-up s${Math.min(idx + 1, 5)}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ color: C.white, fontWeight: '700', fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px' }}>{mem.name}</div>
              <Badge color={ac > 0 ? C.green : C.gray} bg={ac > 0 ? C.greenDim : 'rgba(143,163,188,0.1)'}>{ac}/{ministries.length}</Badge>
            </div>
            {ministries.length === 0
              ? <div style={{ color: C.gray, fontSize: '13px' }}>No ministries yet.</div>
              : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ministries.map(min => {
                  const on = isInterested(mem._id, min._id);
                  return (
                    <button key={min._id} onClick={() => handleToggleInterest(mem._id, min._id)} className="btn-press" style={{
                      padding: '8px 14px', background: on ? C.gold : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${on ? C.gold : C.glassBdr}`, borderRadius: '20px',
                      color: on ? '#07100a' : C.gray, fontSize: '13px', cursor: 'pointer',
                      fontWeight: on ? '700' : '400', fontFamily: 'Lato,sans-serif', transition: 'all 0.15s',
                    }}>{min.icon} {min.name}</button>
                  );
                })}
              </div>
            }
          </GlassCard>
        );
      })}
    </div>
  );

  const renderRoster = () => {
    if (!activeRoster) return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
        <div style={{ color: C.white, fontSize: '22px', marginBottom: '8px', fontFamily: 'Cinzel,Georgia,serif' }}>No Roster Yet</div>
        <div style={{ color: C.gray, marginBottom: '28px' }}>Generate one from the Dashboard</div>
        <GoldBtn onClick={() => setTab('dashboard')} style={{ padding: '14px 32px', fontSize: '15px' }}>Go to Dashboard</GoldBtn>
      </div>
    );

    const asgn = activeRoster.assignments || [];
    const unassigned = asgn.filter(a => !a.memberIds || a.memberIds.length === 0).length;
    const isCurrent = !isViewingHistory;

    return (
      <div style={{ padding: '20px' }}>
        {/* CHANGE 2: Banner when editing historical roster */}
        {isViewingHistory && (
          <div className="fade-up" style={{
            background: C.blueDim, border: `1px solid ${C.blueBdr}`,
            borderRadius: '14px', padding: '12px 16px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📝</span>
              <div>
                <div style={{ color: C.blue, fontSize: '13px', fontWeight: '700' }}>Editing Past Poster</div>
                <div style={{ color: C.gray, fontSize: '11px', marginTop: '2px' }}>Changes are saved to this past roster</div>
              </div>
            </div>
            <button onClick={() => { setViewRosterId(null); }} className="btn-press" style={{
              background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.glassBdr}`,
              borderRadius: '8px', color: C.white, cursor: 'pointer', padding: '6px 12px',
              fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
            }}>← Current</button>
          </div>
        )}

        {/* Header */}
        <div className="fade-up" style={{
          background: 'linear-gradient(145deg,rgba(15,30,60,0.7),rgba(10,20,40,0.5))',
          border: `1px solid ${C.glassBdr}`, borderRadius: '18px', padding: '18px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: C.white, fontSize: '20px', fontFamily: 'Cinzel,Georgia,serif', fontWeight: '700' }}>
                {isCurrent ? 'Current Roster' : 'Past Roster'}
              </div>
              <div style={{ color: C.gray, fontSize: '13px', marginTop: '4px' }}>{activeRoster.date}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <Badge color={activeRoster.status === 'confirmed' ? C.green : C.gold} bg={activeRoster.status === 'confirmed' ? C.greenDim : C.goldDim}>
                {activeRoster.status === 'confirmed' ? '✅ Confirmed' : '📝 Draft'}
              </Badge>
              <button onClick={() => handleDeleteRoster(activeRoster._id, isCurrent)} style={{
                background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: '8px',
                color: C.red, cursor: 'pointer', padding: '5px 11px', fontSize: '12px', fontWeight: '700',
              }}>🗑️ Delete</button>
            </div>
          </div>
        </div>

        {unassigned > 0 && (
          <GlassCard className="fade-up" style={{ borderColor: C.redBdr, marginBottom: '14px' }}>
            <div style={{ color: C.red, fontSize: '13px' }}>⚠️ {unassigned} ministr{unassigned > 1 ? 'ies' : 'y'} unassigned — no interested members available.</div>
          </GlassCard>
        )}

        {asgn.map((a, idx) => {
          const min = a.ministryId;
          const minId = (min?._id || min)?.toString();
          const memberIds = a.memberIds || [];
          const hasMembers = memberIds.length > 0;
          const ministry = ministries.find(m => m._id === minId);
          const lim = ministry?.limit || (min?.limit) || 1;
          const atLimit = memberIds.length >= lim;

          return (
            <GlassCard key={minId} className={`fade-up s${Math.min(idx + 1, 5)}`} style={{ borderColor: hasMembers ? C.glassBdr : C.redBdr }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ color: C.goldLt, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
                    {min?.icon} {min?.name}
                  </div>
                  {/* CHANGE 1: show limit progress */}
                  <div style={{ color: atLimit ? C.green : C.gray, fontSize: '11px', marginTop: '2px' }}>
                    {memberIds.length}/{lim} {atLimit ? '✅ Full' : 'slots'}
                  </div>
                </div>
                {!atLimit && (
                  <button onClick={() => setModal({ type: 'add', ministryId: minId })}
                    className="btn-press" style={{
                      padding: '6px 12px', background: C.goldDim,
                      border: `1px solid ${C.goldBdr}`, borderRadius: '10px', color: C.gold,
                      cursor: 'pointer', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap'
                    }}>
                    ➕ Add
                  </button>
                )}
              </div>
              {!hasMembers && <div style={{ color: C.red, fontSize: '14px', fontWeight: '600', fontFamily: 'Cinzel,Georgia,serif' }}>⚠️ No one assigned</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {memberIds.map((mem, mi) => {
                  const memId = (mem?._id || mem)?.toString();
                  return (
                    <div key={memId || mi} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.06)', borderRadius: '20px',
                      padding: '6px 10px 6px 12px', border: `1px solid ${C.glassBdr}`
                    }}>
                      <span style={{
                        color: C.white, fontSize: '13px', fontWeight: '700',
                        fontFamily: 'Cinzel,Georgia,serif', whiteSpace: 'nowrap'
                      }}>
                        {mem?.name || 'Unknown'}
                      </span>
                      <button onClick={() => handleRemoveMember(minId, memId)}
                        className="btn-press" style={{
                          background: 'rgba(248,113,113,0.15)',
                          border: 'none', borderRadius: '50%', color: C.red, cursor: 'pointer',
                          width: '20px', height: '20px', fontSize: '11px', fontWeight: '700',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}

        <div className="fade-up" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeRoster.status !== 'confirmed' && (
            <SuccessBtn onClick={handleConfirm} disabled={actionLoad} style={{ padding: '16px', fontSize: '15px', borderRadius: '14px', width: '100%' }}>
              ✅ Confirm This Roster
            </SuccessBtn>
          )}
          <GlassCard style={{ marginBottom: 0 }}>
            <div style={{ color: C.gray, fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700' }}>
              📸 Background Image (optional)
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <GhostBtn onClick={() => bgRef.current?.click()} style={{ flex: 1, textAlign: 'center' }}>{bgImage ? '🖼️ Change BG' : '📂 Upload BG'}</GhostBtn>
              {bgImage && <DangerBtn onClick={() => setBgImage(null)} style={{ padding: '11px 14px' }}>✕</DangerBtn>}
            </div>
            {bgImage && <div style={{ color: C.green, fontSize: '12px', marginTop: '8px' }}>✓ Background ready</div>}
            <input ref={bgRef} type='file' accept='image/*' style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setBgImage(ev.target.result); r.readAsDataURL(f); } }} />
          </GlassCard>
          <GoldBtn onClick={() => generatePoster()} style={{ padding: '16px', fontSize: '15px', borderRadius: '14px', width: '100%' }}>
            🖼️ Generate Poster Image
          </GoldBtn>
          {!isViewingHistory && (
            <GhostBtn onClick={handleGenerate} style={{ padding: '14px', fontSize: '14px', width: '100%', textAlign: 'center' }}>
              🔁 Regenerate Roster
            </GhostBtn>
          )}
        </div>
      </div>
    );
  };

  /* ── Add member modal ── */
  const renderModal = () => {
    if (!modal) return null;
    const { ministryId } = modal;
    const min = ministries.find(m => m._id === ministryId);
    const candidates = getAddCandidates(ministryId);
    const ministry = ministries.find(m => m._id === ministryId);
    const lim = ministry?.limit || 1;
    const assignment = (activeRoster?.assignments || []).find(a => (a.ministryId?._id || a.ministryId)?.toString() === ministryId);
    const currentCount = (assignment?.memberIds || []).length;
    const atLimit = currentCount >= lim;

    return (
      <div className="fade-in" onClick={() => setModal(null)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: `linear-gradient(145deg,${C.navyMid},#0a1628)`,
          borderRadius: '24px 24px 0 0', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '72vh', overflowY: 'auto',
          boxShadow: '0 -12px 60px rgba(0,0,0,0.6)', border: `1px solid ${C.glassBdr}`, borderBottom: 'none',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) both'
        }}>
          <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '0 auto 22px' }} onClick={() => setModal(null)} />
          <div style={{ color: C.goldLt, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700' }}>
            {min?.icon} {min?.name}
          </div>
          <div style={{ color: C.white, fontSize: '20px', fontWeight: '700', fontFamily: 'Cinzel,Georgia,serif', marginTop: '4px', marginBottom: '4px' }}>Add Person</div>
          <div style={{ color: C.gray, fontSize: '13px', marginBottom: '8px' }}>Interested members not yet assigned here</div>
          {/* CHANGE 1: Show limit status in modal */}
          <div style={{
            background: atLimit ? C.redDim : C.goldDim, border: `1px solid ${atLimit ? C.redBdr : C.goldBdr}`,
            borderRadius: '8px', padding: '8px 14px', marginBottom: '16px', fontSize: '13px',
            color: atLimit ? C.red : C.goldLt, fontWeight: '700'
          }}>
            {currentCount}/{lim} slots filled {atLimit ? '— Limit reached!' : ''}
          </div>
          {atLimit ? (
            <GlassCard style={{ textAlign: 'center', borderColor: C.redBdr }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚫</div>
              <div style={{ color: C.red, fontSize: '14px', fontWeight: '700' }}>Limit of {lim} reached</div>
              <div style={{ color: C.gray, fontSize: '12px', marginTop: '4px' }}>Remove someone first to add a new person.</div>
            </GlassCard>
          ) : candidates.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', borderColor: C.redBdr }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>😔</div>
              <div style={{ color: C.red, fontSize: '14px', fontWeight: '700' }}>No one available to add</div>
              <div style={{ color: C.gray, fontSize: '12px', marginTop: '4px' }}>All interested members already added, or set more interests.</div>
            </GlassCard>
          ) : candidates.map(s => (
            <button key={s._id} onClick={() => handleAddMember(ministryId, s._id)} className="btn-press" style={{
              width: '100%', padding: '15px 18px', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.glassBdr}`, borderRadius: '14px', color: C.white, textAlign: 'left',
              cursor: 'pointer', marginBottom: '8px', fontSize: '16px', fontFamily: 'Cinzel,Georgia,serif', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}><span style={{ fontSize: '26px' }}>👤</span>{s.name}</button>
          ))}
          <GhostBtn onClick={() => setModal(null)} style={{ width: '100%', padding: '14px', marginTop: '6px', textAlign: 'center' }}>Cancel</GhostBtn>
        </div>
      </div>
    );
  };

  /* ── Poster preview ── */
  const renderPreview = () => {
    if (!showPreview || !posterImg) return null;
    return (
      <div className="fade-in" style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
      }}>
        <div className="scale-in" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ color: C.white, fontSize: '18px', fontWeight: '700', marginBottom: '16px', fontFamily: 'Cinzel,Georgia,serif' }}>🖼️ Poster Ready</div>
          <img src={posterImg} alt='Poster' style={{
            maxWidth: '100%', maxHeight: '52vh', borderRadius: '16px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.8)', marginBottom: '20px', border: `2px solid ${C.goldBdr}`
          }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { const a = document.createElement('a'); a.href = posterImg; a.download = `ministry-roster-${new Date().toISOString().split('T')[0]}.png`; a.click(); }}
              className="btn-press" style={{
                flex: 1, padding: '16px', background: `linear-gradient(135deg,${C.gold},${C.goldLt})`,
                border: 'none', borderRadius: '14px', color: '#07100a', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Cinzel,Georgia,serif'
              }}>
              ⬇️ Download
            </button>
            <button onClick={() => setShowPreview(false)} className="btn-press" style={{
              flex: 1, padding: '16px',
              background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.glassBdr}`, borderRadius: '14px',
              color: C.white, cursor: 'pointer', fontFamily: 'Lato,sans-serif'
            }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const renderToast = () => toast && (
    <div className="scale-in" style={{
      position: 'fixed', bottom: '84px', left: '50%', transform: 'translateX(-50%)',
      background: toast.type === 'error' ? 'rgba(185,28,28,0.97)' : 'rgba(20,83,45,0.97)',
      color: '#fff', padding: '11px 22px', borderRadius: '24px', fontSize: '14px', fontFamily: 'Lato,sans-serif',
      fontWeight: '700', zIndex: 3000, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      border: `1px solid ${toast.type === 'error' ? C.redBdr : 'rgba(74,222,128,0.3)'}`
    }}>
      {toast.msg}
    </div>
  );

  const TABS = [{ id: 'dashboard', icon: '🏠', label: 'Home' }, { id: 'members', icon: '👥', label: 'Members' },
  { id: 'ministries', icon: '⛪', label: 'Ministry' }, { id: 'interests', icon: '💛', label: 'Interests' }, { id: 'roster', icon: '📋', label: 'Roster' }];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '40px', filter: 'drop-shadow(0 0 20px rgba(212,168,67,0.5))' }}>✝</div>
      <Spinner size={36} />
      <div style={{ color: C.gray, fontSize: '12px', letterSpacing: '2px' }}>LOADING APP…</div>
    </div>
  );

  const content = tab === 'dashboard' ? renderDashboard() : tab === 'members' ? renderMembers() : tab === 'ministries' ? renderMinistries() : tab === 'interests' ? renderInterests() : renderRoster();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.white, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
      <div style={{
        background: 'rgba(4,9,26,0.97)', borderBottom: `1px solid ${C.glassBdr}`,
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '22px', filter: `drop-shadow(0 0 10px ${C.gold})` }}>✝</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.gold, fontSize: '15px', fontWeight: '900', fontFamily: 'Cinzel,Georgia,serif', letterSpacing: '1px' }}>MINISTRY POSTER</div>
          <div style={{ color: C.gray, fontSize: '10px', letterSpacing: '1.5px' }}>CHURCH ASSIGNMENT MANAGER</div>
        </div>
        <a href={INSTRUCTIONS_URL} target="_blank" rel="noreferrer" style={{
          background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: '8px', color: C.gold,
          textDecoration: 'none', padding: '6px 10px', fontSize: '11px', fontWeight: '700',
          letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
        }}>📖 Guide</a>
        {actionLoad ? <Spinner size={20} /> : (
          <button onClick={onLogout} style={{
            background: C.redDim, border: `1px solid ${C.redBdr}`,
            borderRadius: '8px', color: C.red, cursor: 'pointer', padding: '6px 10px', fontSize: '11px', fontWeight: '700'
          }}>
            🚪
          </button>
        )}
      </div>

      <div style={{ paddingBottom: '74px' }}>{content}</div>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', background: 'rgba(4,9,26,0.98)',
        borderTop: `1px solid ${C.glassBdr}`, display: 'flex', zIndex: 100,
        backdropFilter: 'blur(20px)', boxShadow: '0 -4px 30px rgba(0,0,0,0.5)'
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn-press" style={{
            flex: 1, padding: '10px 4px 8px', background: 'transparent', border: 'none',
            borderTop: `2px solid ${tab === t.id ? C.gold : 'transparent'}`,
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'border-color 0.2s',
          }}>
            <span style={{ fontSize: '18px', filter: tab === t.id ? `drop-shadow(0 0 6px ${C.gold})` : '' }}>{t.icon}</span>
            <span style={{
              fontSize: '10px', color: tab === t.id ? C.gold : C.gray, fontFamily: 'Lato,sans-serif',
              fontWeight: tab === t.id ? '700' : '400', letterSpacing: '0.3px'
            }}>{t.label}</span>
          </button>
        ))}
      </nav>

      {renderModal()}
      {renderPreview()}
      {renderToast()}
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
