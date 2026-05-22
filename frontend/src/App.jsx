import React, { useState, useEffect } from 'react';
import DashboardOverview from './components/DashboardOverview';
import KanbanBoard from './components/KanbanBoard';
import ReadinessCalculator from './components/ReadinessCalculator';
import MigrationAssistant from './components/MigrationAssistant';
import LoginPage from './components/LoginPage';
import ManageRegistrations from './components/ManageRegistrations';
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

  // Check active session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('cctns_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch challenge list from backend APIs
  const fetchChallenges = async () => {
    if (!user) return;
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
    if (!user || user.role !== 'admin') return;
    try {
      const response = await fetch('/api/admin/pending-users', {
        headers: {
          'x-user-role': user.role
        }
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
      if (user.role === 'admin') {
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
          {user.role === 'admin' && (
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
        </ul>

        {/* Logged in Officer Profile Card */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '1rem', 
          background: 'var(--bg-tertiary)', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--border-glow)',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.sidebar.loggedOfficer}:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginTop: '0.15rem', textTransform: 'uppercase' }}>
            {t.sidebar.role}: {user.role}
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
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
