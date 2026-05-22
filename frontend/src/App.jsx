import React, { useState, useEffect } from 'react';
import DashboardOverview from './components/DashboardOverview';
import KanbanBoard from './components/KanbanBoard';
import ReadinessCalculator from './components/ReadinessCalculator';
import MigrationAssistant from './components/MigrationAssistant';
import LoginPage from './components/LoginPage';
import ManageRegistrations from './components/ManageRegistrations';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [challenges, setChallenges] = useState([]);
  const [readinessScore, setReadinessScore] = useState(35);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

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

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchChallenges();
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
  };

  if (!user) {
    return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '1.75rem' }}>🚔</span>
          <div>
            <h2 className="sidebar-logo">CCTNS 2.0</h2>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Migration Planner</span>
          </div>
        </div>
        
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentView('overview')}
          >
            <span>📊</span> Overview Dashboard
          </li>
          <li 
            className={`sidebar-item ${currentView === 'board' ? 'active' : ''}`}
            onClick={() => setCurrentView('board')}
          >
            <span>📋</span> Migration Board
          </li>
          
          {/* Admin Registration Moderation Tab */}
          {user.role === 'admin' && (
            <li 
              className={`sidebar-item ${currentView === 'registrations' ? 'active' : ''}`}
              onClick={() => setCurrentView('registrations')}
            >
              <span>👤</span> Approve Requests
            </li>
          )}

          <li 
            className={`sidebar-item ${currentView === 'calculator' ? 'active' : ''}`}
            onClick={() => setCurrentView('calculator')}
          >
            <span>🎛️</span> Readiness Calculator
          </li>
          <li 
            className={`sidebar-item ${currentView === 'assistant' ? 'active' : ''}`}
            onClick={() => setCurrentView('assistant')}
          >
            <span>💬</span> Expert Assistant
          </li>
        </ul>

        {/* Logged in Officer Profile Card */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--border-glow)',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Logged In Officer:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginTop: '0.15rem', textTransform: 'uppercase' }}>
            Role: {user.role}
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
            color: '#fca5a5', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--danger-glow)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
        >
          🚪 Safe Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span className="badge-gov">GOVERNMENT OF INDIA</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>MHA Initiative</span>
            </div>
            <h1>CCTNS Upgrade Command Center</h1>
            <p>Track, resolve, and audit system transitions across police hubs</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={fetchChallenges} 
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glow)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              Sync DB
            </button>
          </div>
        </header>

        {error && (
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '2rem', fontSize: '0.9rem' }}>
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
            color: '#fca5a5', 
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
              />
            )}
            
            {currentView === 'board' && (
              <KanbanBoard 
                challenges={challenges} 
                userRole={user.role} 
                onUpdateStatus={updateChallengeStatus} 
              />
            )}

            {currentView === 'registrations' && (
              <ManageRegistrations />
            )}
            
            {currentView === 'calculator' && (
              <ReadinessCalculator 
                onReadinessCalculated={setReadinessScore} 
              />
            )}
            
            {currentView === 'assistant' && (
              <MigrationAssistant />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
