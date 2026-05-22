import React, { useState, useEffect } from 'react';

/**
 * SuperAdminPanel — Exclusive control panel for IPS Director (superadmin)
 * Features:
 *  1. System-wide CCTNS 2.0 deployment statistics
 *  2. All registered users overview (by role)
 *  3. Pending admin & user approvals with full approve/reject capability
 *  4. State deployment readiness tracker
 *  5. Recent system activity log
 */
const SuperAdminPanel = ({ challenges, t, lang, IS_GITHUB_PAGES }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Static demo data for GitHub Pages
  const DEMO_USERS = [
    { email: 'superadmin@cctns.gov.in', name: 'CCTNS Super Administrator (IPS Director)', role: 'superadmin', status: 'approved' },
    { email: 'admin@cctns.gov.in',      name: 'Command Center Admin (IPS)',              role: 'admin',      status: 'approved' },
    { email: 'user@cctns.gov.in',       name: 'Field Constable (Sharma)',               role: 'user',       status: 'approved' },
    { email: 'sp.delhi@cctns.gov.in',   name: 'SP Delhi District (Kumar)',              role: 'admin',      status: 'pending'  },
    { email: 'constable.raj@cctns.gov.in', name: 'Constable Rajesh Verma',             role: 'user',       status: 'pending'  },
  ];

  const STATES_READINESS = [
    { state: 'Uttar Pradesh',   stations: 1843, migrated: 620,  percent: 34 },
    { state: 'Maharashtra',     stations: 1098, migrated: 759,  percent: 69 },
    { state: 'Delhi',           stations: 229,  migrated: 194,  percent: 85 },
    { state: 'Rajasthan',       stations: 897,  migrated: 312,  percent: 35 },
    { state: 'Tamil Nadu',      stations: 1243, migrated: 1080, percent: 87 },
    { state: 'Gujarat',         stations: 712,  migrated: 498,  percent: 70 },
    { state: 'West Bengal',     stations: 884,  migrated: 221,  percent: 25 },
    { state: 'Karnataka',       stations: 1064, migrated: 745,  percent: 70 },
  ];

  const ACTIVITY_LOG = [
    { time: '14:02', action: 'Admin registration approved', actor: 'superadmin@cctns.gov.in', type: 'approve' },
    { time: '13:48', action: 'Challenge C5 status → Resolved', actor: 'admin@cctns.gov.in', type: 'update' },
    { time: '13:21', action: 'New admin registration request', actor: 'sp.delhi@cctns.gov.in', type: 'pending' },
    { time: '12:55', action: 'Readiness audit completed — Delhi 85%', actor: 'user@cctns.gov.in', type: 'audit' },
    { time: '12:10', action: 'System sync triggered', actor: 'admin@cctns.gov.in', type: 'sync' },
    { time: '11:44', action: 'New user registration', actor: 'constable.raj@cctns.gov.in', type: 'pending' },
  ];

  const fetchAllUsers = async () => {
    setLoading(true);
    if (IS_GITHUB_PAGES) {
      setAllUsers(DEMO_USERS);
      setPendingAdmins(DEMO_USERS.filter(u => u.status === 'pending' && u.role === 'admin'));
      setPendingUsers(DEMO_USERS.filter(u => u.status === 'pending' && u.role === 'user'));
      setLoading(false);
      return;
    }
    try {
      const cachedUser = JSON.parse(localStorage.getItem('cctns_user') || '{}');
      const res = await fetch('/api/superadmin/all-users', {
        headers: { 'x-user-role': cachedUser.role || '' }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAllUsers(data);
      setPendingAdmins(data.filter(u => u.status === 'pending' && u.role === 'admin'));
      setPendingUsers(data.filter(u => u.status === 'pending' && u.role === 'user'));
    } catch {
      // Fallback to pending-users endpoint
      try {
        const cachedUser = JSON.parse(localStorage.getItem('cctns_user') || '{}');
        const res = await fetch('/api/admin/pending-users', {
          headers: { 'x-user-role': 'superadmin' }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingAdmins(data.filter(u => u.role === 'admin'));
          setPendingUsers(data.filter(u => u.role === 'user'));
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (email, action) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (IS_GITHUB_PAGES) {
      const name = action === 'approve' ? 'स्वीकृत' : 'अस्वीकृत';
      setSuccessMsg(`Demo Mode: ${email} ko ${name} kar diya gaya (Demo).`);
      setPendingAdmins(prev => prev.filter(u => u.email !== email));
      setPendingUsers(prev => prev.filter(u => u.email !== email));
      setTimeout(() => setSuccessMsg(null), 4000);
      return;
    }
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'superadmin' },
        body: JSON.stringify({ email, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg(`${email} successfully ${action === 'approve' ? 'approved' : 'rejected'}!`);
      fetchAllUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // ---- Computed stats ----
  const totalChallenges = challenges.length;
  const resolved = challenges.filter(c => c.status === 'resolved').length;
  const highRisk = challenges.filter(c => c.risk === 'High').length;
  const totalAdmins = allUsers.filter(u => u.role === 'admin').length;
  const totalUsers = allUsers.filter(u => u.role === 'user').length;
  const totalPending = pendingAdmins.length + pendingUsers.length;
  const avgReadiness = Math.round(STATES_READINESS.reduce((s, st) => s + st.percent, 0) / STATES_READINESS.length);

  // Colors
  const COLOR = {
    purple: '#7c3aed', purpleGlow: 'rgba(124,58,237,0.12)',
    blue: '#1e40af', blueGlow: 'rgba(30,64,175,0.1)',
    green: '#0f766e', greenGlow: 'rgba(15,118,110,0.1)',
    amber: '#b45309', amberGlow: 'rgba(180,83,9,0.1)',
    red: '#be123c', redGlow: 'rgba(190,18,60,0.1)',
    cyan: '#0891b2', cyanGlow: 'rgba(8,145,178,0.1)',
  };

  const tabStyle = (tab) => ({
    padding: '0.7rem 1.4rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.88rem',
    borderBottom: activeTab === tab ? `3px solid ${COLOR.purple}` : '3px solid transparent',
    background: activeTab === tab ? COLOR.purpleGlow : 'transparent',
    color: activeTab === tab ? COLOR.purple : 'var(--text-secondary)',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  });

  const statCard = (icon, label, value, color, glow, sub) => (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${color}30`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: `0 2px 12px ${glow}`
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: glow, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '1.85rem', fontWeight: '800', color: color, lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
      </div>
    </div>
  );

  const badgeRole = (role) => {
    const cfg = {
      superadmin: { bg: COLOR.purpleGlow, color: COLOR.purple, label: '⭐ Super Admin' },
      admin:      { bg: COLOR.blueGlow,   color: COLOR.blue,   label: '🔑 Admin' },
      user:       { bg: COLOR.cyanGlow,   color: COLOR.cyan,   label: '👮 Field Constable' },
    }[role] || { bg: '#f1f5f9', color: '#64748b', label: role };
    return (
      <span style={{
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700'
      }}>{cfg.label}</span>
    );
  };

  const badgeStatus = (status) => {
    const cfg = {
      approved: { bg: COLOR.greenGlow, color: COLOR.green, label: '✅ Approved' },
      pending:  { bg: COLOR.amberGlow, color: COLOR.amber, label: '⌛ Pending' },
      rejected: { bg: COLOR.redGlow,   color: COLOR.red,   label: '❌ Rejected' },
    }[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
    return (
      <span style={{
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700'
      }}>{cfg.label}</span>
    );
  };

  const ActionBtns = ({ email }) => (
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      <button onClick={() => handleAction(email, 'approve')} style={{
        background: COLOR.greenGlow, color: COLOR.green, border: `1px solid ${COLOR.green}50`,
        padding: '0.35rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem'
      }}>✅ {lang === 'hi' ? 'स्वीकृत' : 'Approve'}</button>
      <button onClick={() => handleAction(email, 'reject')} style={{
        background: COLOR.redGlow, color: COLOR.red, border: `1px solid ${COLOR.red}50`,
        padding: '0.35rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem'
      }}>❌ {lang === 'hi' ? 'अस्वीकृत' : 'Reject'}</button>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* ===== HEADER BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #3b0764, #7c3aed, #1e40af)',
        borderRadius: 'var(--radius-md)',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(124,58,237,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.12em', opacity: 0.75, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            {lang === 'hi' ? '⭐ सुपर एडमिन कंट्रोल पैनल' : '⭐ Super Admin Control Panel'}
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
            {lang === 'hi' ? 'CCTNS 2.0 — IPS डायरेक्टर डैशबोर्ड' : 'CCTNS 2.0 — IPS Director Dashboard'}
          </h2>
          <p style={{ margin: '0.4rem 0 0', opacity: 0.82, fontSize: '0.95rem' }}>
            {lang === 'hi'
              ? 'राष्ट्रीय स्तर पर CCTNS तैनाती, एडमिन प्रबंधन और सिस्टम ऑडिट का पूर्ण नियंत्रण'
              : 'Full control over national CCTNS deployment, admin management, and system audit'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-2px' }}>{avgReadiness}%</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{lang === 'hi' ? 'औसत राष्ट्रीय तैयारी' : 'Avg National Readiness'}</div>
        </div>
      </div>

      {/* ===== ALERTS ===== */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: COLOR.greenGlow, border: `1px solid ${COLOR.green}`, borderRadius: 'var(--radius-sm)', color: COLOR.green, marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: COLOR.redGlow, border: `1px solid ${COLOR.red}`, borderRadius: 'var(--radius-sm)', color: COLOR.red, marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ===== TABS ===== */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid var(--border-glow)', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { key: 'dashboard', icon: '📊', label: lang === 'hi' ? 'सिस्टम डैशबोर्ड' : 'System Dashboard' },
          { key: 'approvals', icon: '🔐', label: `${lang === 'hi' ? 'पेंडिंग अनुरोध' : 'Pending Approvals'}${totalPending > 0 ? ` (${totalPending})` : ''}` },
          { key: 'users',     icon: '👥', label: lang === 'hi' ? 'सभी उपयोगकर्ता' : 'All Users' },
          { key: 'states',    icon: '🗺️', label: lang === 'hi' ? 'राज्य तैनाती' : 'State Deployment' },
          { key: 'activity',  icon: '📋', label: lang === 'hi' ? 'गतिविधि लॉग' : 'Activity Log' },
        ].map(tab => (
          <button key={tab.key} style={tabStyle(tab.key)} onClick={() => setActiveTab(tab.key)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: SYSTEM DASHBOARD ===== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {statCard('⭐', lang === 'hi' ? 'कुल एडमिन' : 'Total Admins', totalAdmins, COLOR.purple, COLOR.purpleGlow, lang === 'hi' ? 'स्वीकृत कमांड सेंटर एडमिन' : 'Approved Command Admins')}
            {statCard('👮', lang === 'hi' ? 'कुल उपयोगकर्ता' : 'Total Officers', totalUsers, COLOR.cyan, COLOR.cyanGlow, lang === 'hi' ? 'फील्ड कांस्टेबल' : 'Field Constables')}
            {statCard('⌛', lang === 'hi' ? 'लंबित अनुरोध' : 'Pending Requests', totalPending, COLOR.amber, COLOR.amberGlow, lang === 'hi' ? 'स्वीकृति की प्रतीक्षा' : 'Awaiting your approval')}
            {statCard('✅', lang === 'hi' ? 'हल चुनौतियाँ' : 'Resolved Issues', resolved + '/' + totalChallenges, COLOR.green, COLOR.greenGlow, lang === 'hi' ? 'माइग्रेशन प्रगति' : 'Migration progress')}
            {statCard('🔴', lang === 'hi' ? 'उच्च जोखिम' : 'High Risk Issues', highRisk, COLOR.red, COLOR.redGlow, lang === 'hi' ? 'तत्काल ध्यान आवश्यक' : 'Require immediate action')}
            {statCard('🗺️', lang === 'hi' ? 'राज्य कवर' : 'States Covered', STATES_READINESS.length, COLOR.blue, COLOR.blueGlow, lang === 'hi' ? 'CCTNS 2.0 में माइग्रेट हो रहे' : 'Migrating to CCTNS 2.0')}
          </div>

          {/* Migration challenges status breakdown */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', fontSize: '1.1rem', color: COLOR.purple }}>
              📋 {lang === 'hi' ? 'माइग्रेशन चुनौती स्थिति अवलोकन' : 'Migration Challenge Status Overview'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {challenges.map(c => {
                const statusColor = { todo: COLOR.red, inprogress: COLOR.amber, resolved: COLOR.green }[c.status] || '#64748b';
                const riskColor = { High: COLOR.red, Medium: COLOR.amber, Low: COLOR.green }[c.risk] || '#64748b';
                const pct = c.status === 'resolved' ? 100 : c.status === 'inprogress' ? 55 : 10;
                return (
                  <div key={c.id} style={{ background: 'var(--bg-tertiary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${statusColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>{c.title}</span>
                        <span style={{ marginLeft: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: riskColor, background: `${riskColor}15`, border: `1px solid ${riskColor}40`, padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                          {c.risk} Risk
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}40`, padding: '0.15rem 0.5rem', borderRadius: '20px', textTransform: 'uppercase' }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: statusColor, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: PENDING APPROVALS ===== */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pending Admin Registrations */}
          <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${COLOR.purple}30`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glow)', background: COLOR.purpleGlow, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔐</span>
              <div>
                <h3 style={{ margin: 0, color: COLOR.purple, fontSize: '1rem', fontWeight: '800' }}>
                  {lang === 'hi' ? 'एडमिन पंजीकरण अनुरोध' : 'Admin Registration Requests'}
                  {pendingAdmins.length > 0 && <span style={{ marginLeft: '0.5rem', background: COLOR.purple, color: '#fff', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{pendingAdmins.length}</span>}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {lang === 'hi' ? 'केवल Super Admin ही Admin को स्वीकृत कर सकता है' : 'Only you (Super Admin) can approve Admin-role registrations'}
                </p>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : pendingAdmins.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                {lang === 'hi' ? 'कोई लंबित एडमिन अनुरोध नहीं' : 'No pending admin requests'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    {[lang === 'hi' ? 'नाम' : 'Officer Name',
                      lang === 'hi' ? 'ईमेल' : 'Email',
                      lang === 'hi' ? 'भूमिका' : 'Role',
                      lang === 'hi' ? 'कार्रवाई' : 'Action'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingAdmins.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{u.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: COLOR.purple }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{badgeRole(u.role)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}><ActionBtns email={u.email} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pending User Registrations */}
          <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${COLOR.cyan}30`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glow)', background: COLOR.cyanGlow, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>👮</span>
              <h3 style={{ margin: 0, color: COLOR.cyan, fontSize: '1rem', fontWeight: '800' }}>
                {lang === 'hi' ? 'कांस्टेबल / यूजर पंजीकरण अनुरोध' : 'Constable / User Registration Requests'}
                {pendingUsers.length > 0 && <span style={{ marginLeft: '0.5rem', background: COLOR.cyan, color: '#fff', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{pendingUsers.length}</span>}
              </h3>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : pendingUsers.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                {lang === 'hi' ? 'कोई लंबित यूजर अनुरोध नहीं' : 'No pending user requests'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    {[lang === 'hi' ? 'नाम' : 'Name',
                      lang === 'hi' ? 'ईमेल' : 'Email',
                      lang === 'hi' ? 'भूमिका' : 'Role',
                      lang === 'hi' ? 'कार्रवाई' : 'Action'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{u.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: COLOR.cyan }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{badgeRole(u.role)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}><ActionBtns email={u.email} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: ALL USERS ===== */}
      {activeTab === 'users' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glow)' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: '1rem' }}>
              👥 {lang === 'hi' ? 'सभी पंजीकृत उपयोगकर्ता' : 'All Registered Users'} — {allUsers.length} {lang === 'hi' ? 'कुल' : 'Total'}
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                {[lang === 'hi' ? 'नाम' : 'Name',
                  lang === 'hi' ? 'ईमेल' : 'Email',
                  lang === 'hi' ? 'भूमिका' : 'Role',
                  lang === 'hi' ? 'स्थिति' : 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...allUsers].sort((a, b) => {
                const ord = { superadmin: 0, admin: 1, user: 2 };
                return (ord[a.role] ?? 3) - (ord[b.role] ?? 3);
              }).map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{u.name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--accent)', fontSize: '0.82rem' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{badgeRole(u.role)}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{badgeStatus(u.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== TAB: STATE DEPLOYMENT ===== */}
      {activeTab === 'states' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              🗺️ {lang === 'hi' ? 'राज्य-वार CCTNS 2.0 तैनाती स्थिति' : 'State-wise CCTNS 2.0 Deployment Status'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
              {STATES_READINESS.map(st => {
                const color = st.percent >= 70 ? COLOR.green : st.percent >= 40 ? COLOR.amber : COLOR.red;
                return (
                  <div key={st.state} style={{ background: 'var(--bg-tertiary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{st.state}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {st.migrated} / {st.stations} {lang === 'hi' ? 'थाने माइग्रेट' : 'Stations Migrated'}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: color }}>{st.percent}%</div>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${st.percent}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: ACTIVITY LOG ===== */}
      {activeTab === 'activity' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glow)' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: '1rem' }}>
              📋 {lang === 'hi' ? 'हाल की सिस्टम गतिविधि' : 'Recent System Activity'} {IS_GITHUB_PAGES && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '400' }}>(Demo Data)</span>}
            </h3>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {ACTIVITY_LOG.map((log, i) => {
              const iconCfg = {
                approve: { icon: '✅', color: COLOR.green },
                update:  { icon: '🔄', color: COLOR.blue },
                pending: { icon: '⌛', color: COLOR.amber },
                audit:   { icon: '📊', color: COLOR.purple },
                sync:    { icon: '🔁', color: COLOR.cyan },
              }[log.type] || { icon: '📌', color: '#64748b' };
              return (
                <div key={i} style={{
                  padding: '0.85rem 1.5rem',
                  borderBottom: i < ACTIVITY_LOG.length - 1 ? '1px solid var(--bg-tertiary)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: `${iconCfg.color}15`, border: `1px solid ${iconCfg.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                  }}>{iconCfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{log.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{log.actor}</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', flexShrink: 0 }}>Today {log.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPanel;
