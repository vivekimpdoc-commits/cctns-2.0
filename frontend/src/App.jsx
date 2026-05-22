import React, { useState, useEffect } from 'react';
import DashboardOverview from './components/DashboardOverview';
import KanbanBoard from './components/KanbanBoard';
import ReadinessCalculator from './components/ReadinessCalculator';
import MigrationAssistant from './components/MigrationAssistant';

const App = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [challenges, setChallenges] = useState([]);
  const [readinessScore, setReadinessScore] = useState(35);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch challenge list from backend APIs
  const fetchChallenges = async () => {
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

  // Update challenge status
  const updateChallengeStatus = async (challengeId, newStatus) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // Refresh local list
        fetchChallenges();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

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
        
        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glow)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROJECT STATE</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)', marginTop: '0.25rem' }}>1.0 &rarr; 2.0 Upgrade</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Frontend/Backend separated for modular edits.</div>
        </div>
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
                onUpdateStatus={updateChallengeStatus} 
              />
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
