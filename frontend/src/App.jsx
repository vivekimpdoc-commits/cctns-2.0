import React, { useState, useEffect } from 'react';
import DashboardOverview from './components/DashboardOverview';
import KanbanBoard from './components/KanbanBoard';
import ReadinessCalculator from './components/ReadinessCalculator';
import MigrationAssistant from './components/MigrationAssistant';
import LoginPage from './components/LoginPage';
import ManageRegistrations from './components/ManageRegistrations';
import HelpGuide from './components/HelpGuide';
import SuperAdminPanel from './components/SuperAdminPanel';
import { locales } from './locales';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [challenges, setChallenges] = useState([]);
  const [readinessScore, setReadinessScore] = useState(35);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  
  // Bilingual support state
  const [lang, setLang] = useState(() => localStorage.getItem('cctns_lang') || 'en');
  const [pendingCount, setPendingCount] = useState(0);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('cctns_lang', newLang);
  };

  const t = locales[lang] || locales.en;

  // Detect if running on GitHub Pages (static, no backend available)
  const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

  // Static mock data for GitHub Pages demo mode
  const MOCK_CHALLENGES = [
    { id: 'c1', title: 'Database Schema & Legacy Data Migration', category: 'Data Migration', risk: 'High', status: 'inprogress',
      description: 'CCTNS 1.0 states use regional databases with varying local schema extensions and missing integrity constraints.', 
      impact: 'Data loss during ingestion, unsearchable records, and broken foreign keys in CAS database.',
      solution: 'Establish an automated ETL pipeline using standard Python schemas or Node streams.',
      oldCode: '// Legacy JDBC with direct SQL\nStatement stmt = conn.createStatement();\nstmt.executeUpdate(query);',
      newCode: '// Clean ORM, UTF-8 encoding\nconst fir = new FIRModel({ name: Buffer.from(name, "utf-8").toString() });\nawait fir.save();' },
    { id: 'c2', title: 'Offline-Online Data Sync & Conflicts', category: 'Offline Sync', risk: 'High', status: 'todo',
      description: 'Remote police stations face frequent internet outages. Data synchronization causes conflicts.',
      impact: 'Two stations offline-registering the same case causes major conflict errors in SDC.',
      solution: 'Implement Progressive Offline sync engine with IndexDB cache and UUID primary keys.',
      oldCode: 'CREATE TABLE t_fir (\n  fir_serial_id SERIAL PRIMARY KEY -- Conflicts!\n);',
      newCode: 'CREATE TABLE t_fir (\n  fir_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid()\n);' },
    { id: 'c3', title: 'ICJS System Interoperability API', category: 'ICJS Integration', risk: 'Medium', status: 'todo',
      description: 'CCTNS 2.0 requires seamless communication with e-Prisons, e-Courts, and Forensic Labs.',
      impact: 'Manual file transfers and delayed criminal record access in court hearings.',
      solution: 'Develop microservices gateway with REST/gRPC endpoints and OAuth2 authentication.',
      oldCode: '// Manual CSV export & SFTP upload\nSFTPClient.upload("sftp://courts.gov.in", csvFile);',
      newCode: '// Real-time async via RabbitMQ\nawait channel.sendToQueue("icjs-sync", Buffer.from(message));' },
    { id: 'c4', title: 'Complex UI & Training Resistance', category: 'UI/UX & Training', risk: 'Medium', status: 'inprogress',
      description: 'CCTNS 1.0 has 100+ input fields per FIR form. Constables find it extremely difficult.',
      impact: 'High error rates, FIR registration delays, officers writing on paper first.',
      solution: 'Redesign into a responsive web app with step-by-step form wizards and bilingual support.',
      oldCode: '<!-- Giant JSP page with 80+ fields -->\n<table><tr><td>Name:</td><td><input/></td></tr></table>',
      newCode: '// Stepper component in React\nconst [step, setStep] = useState(1);\nreturn <Stepper step={step} />;' },
    { id: 'c5', title: 'Security, Audit Logging & Tampering', category: 'Security & Auditing', risk: 'High', status: 'resolved',
      description: 'CCTNS 1.0 stores logs in plain text files without cryptographic verification.',
      impact: 'Risk of FIR tampering, no chain-of-custody for electronic evidence.',
      solution: 'Implement SHA-256 cryptographic audit chain. Every change is digitally signed.',
      oldCode: '# Plain text log - vulnerable\nlog_file.write(f"[{datetime.now()}] Updated FIR {fir_id}")',
      newCode: '// Cryptographic audit trail\nconst hash = crypto.createHash("sha256").update(payload).digest("hex");\nawait AuditLogModel.save({ hash });' }
  ];

  // Check active session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('cctns_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch challenge list from backend APIs (or use mock data on GitHub Pages)
  const fetchChallenges = async () => {
    if (!user) return;
    if (IS_GITHUB_PAGES) {
      setChallenges(MOCK_CHALLENGES);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/challenges');
      if (!response.ok) throw new Error('API server status check failed');
      const data = await response.json();
      setChallenges(data);
      setError(null);
    } catch (err) {
      console.error("Error connecting to backend:", err);
      setError("Cannot connect to CCTNS backend. Please ensure the Express server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending registration requests count for admin
  const fetchPendingCount = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return;
    if (IS_GITHUB_PAGES) { setPendingCount(0); return; }
    try {
      const response = await fetch('/api/admin/pending-users', {
        headers: { 'x-user-role': user.role }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.length);
      }
    } catch (err) {
      console.error("Error fetching pending users count:", err);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchChallenges();
      if (user.role === 'admin' || user.role === 'superadmin') {
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 15000);
        return () => clearInterval(interval);
      }
    }
  }, [user]);

  // Update challenge status (role-protected)
  const updateChallengeStatus = async (challengeId, newStatus) => {
    if (!user) return;
    setActionError(null);
    // In GitHub Pages demo mode, update state locally
    if (IS_GITHUB_PAGES) {
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        setActionError("Demo Mode: Only Admin/Super Admin can update status.");
        setTimeout(() => setActionError(null), 5000);
        return;
      }
      setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status: newStatus } : c));
      return;
    }
    try {
      const response = await fetch(`/api/challenges/${challengeId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': user.role 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Status update failed.");
      }
      
      fetchChallenges();
    } catch (err) {
      console.error("Failed to update status:", err);
      setActionError(err.message);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cctns_user');
    localStorage.removeItem('cctns_token');
    setUser(null);
    setChallenges([]);
    setCurrentView('overview');
    setPendingCount(0);
  };

  if (!user) {
    return (
      <LoginPage 
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} 
        lang={lang} 
        toggleLang={toggleLang} 
        t={t}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '1.75rem' }}>🚔</span>
          <div>
            <h2 className="sidebar-logo">CCTNS 2.0</h2>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {t.sidebar.upgradeTitle}
            </span>
          </div>
        </div>
        
        <ul className="sidebar-menu">
          {/* Super Admin exclusive top link */}
          {user.role === 'superadmin' && (
            <li
              className={`sidebar-item ${currentView === 'superadmin' ? 'active' : ''}`}
              onClick={() => setCurrentView('superadmin')}
              style={{
                background: currentView === 'superadmin'
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(30,64,175,0.12))'
                  : 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(30,64,175,0.05))',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 'var(--radius-sm)',
                color: '#7c3aed',
                fontWeight: '800',
                marginBottom: '0.5rem'
              }}
            >
              ⭐ {lang === 'hi' ? 'सुपर एडमिन पैनल' : 'Super Admin Panel'}
            </li>
          )}
          <li 
            className={`sidebar-item ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentView('overview')}
          >
            {t.sidebar.overview}
          </li>
          <li 
            className={`sidebar-item ${currentView === 'board' ? 'active' : ''}`}
            onClick={() => setCurrentView('board')}
          >
            {t.sidebar.board}
          </li>
          
          {/* Admin Registration Moderation Tab (Highlighted dashboard styling) */}
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <li 
              className={`sidebar-item highlight-tab ${currentView === 'registrations' ? 'active' : ''}`}
              onClick={() => setCurrentView('registrations')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {t.sidebar.approveRequests}
              </span>
              {pendingCount > 0 && (
                <span className="pending-badge-count" style={{
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(190, 18, 60, 0.3)'
                }}>
                  {pendingCount}
                </span>
              )}
            </li>
          )}

          <li 
            className={`sidebar-item ${currentView === 'calculator' ? 'active' : ''}`}
            onClick={() => setCurrentView('calculator')}
          >
            {t.sidebar.calculator}
          </li>
          <li 
            className={`sidebar-item ${currentView === 'assistant' ? 'active' : ''}`}
            onClick={() => setCurrentView('assistant')}
          >
            {t.sidebar.assistant}
          </li>
          <li 
            className={`sidebar-item ${currentView === 'help' ? 'active' : ''}`}
            onClick={() => setCurrentView('help')}
            style={{ fontWeight: 'bold' }}
          >
            {t.sidebar.helpGuide}
          </li>
        </ul>

        {/* Logged in Officer Profile Card */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '1rem', 
          background: user.role === 'superadmin'
            ? 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(30,64,175,0.08))'
            : 'var(--bg-tertiary)', 
          borderRadius: 'var(--radius-sm)', 
          border: user.role === 'superadmin' ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border-glow)',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.sidebar.loggedOfficer}:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: user.role === 'superadmin' ? '#7c3aed' : 'var(--accent)', fontWeight: 'bold', marginTop: '0.15rem', textTransform: 'uppercase' }}>
            {user.role === 'superadmin' ? '⭐ Super Admin' : user.role === 'admin' ? '🔑 Admin' : '👮 ' + user.role}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user.email}
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%',
            backgroundColor: 'var(--bg-tertiary)', 
            border: '1px solid var(--danger-glow)', 
            color: 'var(--danger)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--danger)';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--bg-tertiary)';
            e.target.style.color = 'var(--danger)';
          }}
        >
          {t.sidebar.logout}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{t.header.title}</h1>
            <p>{t.header.desc}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Elegant Language switcher button */}
            <button 
              onClick={toggleLang} 
              style={{ 
                background: 'var(--primary-glow)', 
                border: '1px solid var(--primary)', 
                color: 'var(--primary)', 
                padding: '0.5rem 1.25rem', 
                borderRadius: 'var(--radius-sm)', 
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--primary-glow)';
                e.target.style.color = 'var(--primary)';
              }}
            >
              🌐 {lang === 'en' ? 'हिन्दी (Hindi)' : 'English'}
            </button>

            <button 
              onClick={fetchChallenges} 
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glow)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              {t.header.syncBtn}
            </button>
          </div>
        </header>

        {error && (
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            ⚠️ <strong>Backend Offline:</strong> {error}
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Start backend: <code>cd backend && npm start</code> on port 5000.
            </div>
          </div>
        )}

        {actionError && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--danger-glow)', 
            border: '1px solid var(--danger)', 
            borderRadius: 'var(--radius-sm)', 
            color: 'var(--danger)', 
            marginBottom: '2rem', 
            fontSize: '0.88rem',
            animation: 'fadeIn 0.3s'
          }}>
            🚫 <strong>Action Denied:</strong> {actionError}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-muted)' }}>
            Loading challenge dashboard metrics...
          </div>
        ) : (
          <div>
            {currentView === 'overview' && (
              <DashboardOverview 
                challenges={challenges} 
                onNavigate={setCurrentView} 
                readinessScore={readinessScore} 
                t={t}
              />
            )}
            
            {currentView === 'board' && (
              <KanbanBoard 
                challenges={challenges} 
                userRole={user.role} 
                onUpdateStatus={updateChallengeStatus} 
                t={t}
              />
            )}

            {/* Super Admin exclusive panel */}
            {currentView === 'superadmin' && user.role === 'superadmin' && (
              <SuperAdminPanel
                challenges={challenges}
                t={t}
                lang={lang}
                IS_GITHUB_PAGES={IS_GITHUB_PAGES}
              />
            )}

            {currentView === 'registrations' && (
              <ManageRegistrations t={t} onActionSuccess={fetchPendingCount} />
            )}
            
            {currentView === 'calculator' && (
              <ReadinessCalculator 
                onReadinessCalculated={setReadinessScore} 
                t={t}
              />
            )}
            
            {currentView === 'assistant' && (
              <MigrationAssistant t={t} />
            )}
            
            {currentView === 'help' && (
              <HelpGuide t={t} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
