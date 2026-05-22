import React, { useState } from 'react';

const KanbanBoard = ({ challenges, userRole, onUpdateStatus }) => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const todoCards = challenges.filter(c => c.status === 'todo');
  const inProgressCards = challenges.filter(c => c.status === 'inprogress');
  const resolvedCards = challenges.filter(c => c.status === 'resolved');

  const handleCardClick = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };

  const handleStatusChange = async (challengeId, newStatus) => {
    await onUpdateStatus(challengeId, newStatus);
    // Sync the local modal state
    setSelectedChallenge(prev => prev ? { ...prev, status: newStatus } : null);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>Migration Kanban Board</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Upgradation tasks are categorized into three stages. Click on any card to view detailed explanations, impact reports, and code comparisons.
        </p>
      </div>

      <div className="kanban-container">
        {/* TO DO COLUMN */}
        <div className="kanban-column">
          <div className="column-header">
            <h3 style={{ color: 'var(--danger)' }}>To Do</h3>
            <span className="column-count">{todoCards.length}</span>
          </div>
          <div className="kanban-cards">
            {todoCards.map(c => (
              <div key={c.id} className="kanban-card" onClick={() => handleCardClick(c)}>
                <div className="card-category">{c.category}</div>
                <div className="card-title">{c.title}</div>
                <div className="card-meta">
                  <span className={`card-badge ${c.risk.toLowerCase()}`}>{c.risk} Risk</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Details &rarr;</span>
                </div>
              </div>
            ))}
            {todoCards.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No tasks here
              </div>
            )}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="kanban-column">
          <div className="column-header">
            <h3 style={{ color: 'var(--warning)' }}>In Progress</h3>
            <span className="column-count">{inProgressCards.length}</span>
          </div>
          <div className="kanban-cards">
            {inProgressCards.map(c => (
              <div key={c.id} className="kanban-card" onClick={() => handleCardClick(c)}>
                <div className="card-category">{c.category}</div>
                <div className="card-title">{c.title}</div>
                <div className="card-meta">
                  <span className={`card-badge ${c.risk.toLowerCase()}`}>{c.risk} Risk</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Details &rarr;</span>
                </div>
              </div>
            ))}
            {inProgressCards.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* RESOLVED COLUMN */}
        <div className="kanban-column">
          <div className="column-header">
            <h3 style={{ color: 'var(--success)' }}>Resolved</h3>
            <span className="column-count">{resolvedCards.length}</span>
          </div>
          <div className="kanban-cards">
            {resolvedCards.map(c => (
              <div key={c.id} className="kanban-card" onClick={() => handleCardClick(c)}>
                <div className="card-category">{c.category}</div>
                <div className="card-title">{c.title}</div>
                <div className="card-meta">
                  <span className={`card-badge ${c.risk.toLowerCase()}`}>{c.risk} Risk</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Details &rarr;</span>
                </div>
              </div>
            ))}
            {resolvedCards.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No tasks resolved yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedChallenge && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            
            <div className="modal-header">
              <span className="category">{selectedChallenge.category}</span>
              <h2>{selectedChallenge.title}</h2>
              <div className="modal-meta-row">
                <span className={`card-badge ${selectedChallenge.risk.toLowerCase()}`}>
                  {selectedChallenge.risk} Risk Level
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Status: <strong style={{ color: 'var(--accent)', textTransform: 'uppercase' }}>{selectedChallenge.status}</strong>
                </span>
              </div>
            </div>

            <div className="modal-body-sections">
              <div className="modal-section danger-section">
                <h4>CCTNS 1.0 Upgrade Problem Description</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{selectedChallenge.description}</p>
              </div>

              <div className="modal-section" style={{ borderLeftColor: 'var(--warning)' }}>
                <h4>Impact of Legacy System Constraint</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{selectedChallenge.impact}</p>
              </div>

              <div className="modal-section success-section">
                <h4>CCTNS 2.0 Modern Solution</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{selectedChallenge.solution}</p>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.5rem' }}>Implementation Code/Schema Difference</h4>
                <div className="code-comparison-grid">
                  <div className="code-panel old">
                    <div className="code-panel-header">CCTNS 1.0 (Old Relational / JSP / File Logs)</div>
                    <pre><code>{selectedChallenge.oldCode}</code></pre>
                  </div>
                  <div className="code-panel new">
                    <div className="code-panel-header">CCTNS 2.0 (New REST API / React / Crypto Audit)</div>
                    <pre><code>{selectedChallenge.newCode}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="status-update-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Move challenge status in workflow:</span>
                {userRole !== 'admin' && (
                  <span style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600 }}>
                    ⚠️ Admin authorization (admin@cctns.gov.in) required to modify state.
                  </span>
                )}
              </div>
              <div className="status-btn-group">
                <button 
                  className={`btn-status ${selectedChallenge.status === 'todo' ? 'active-todo' : ''}`}
                  onClick={() => handleStatusChange(selectedChallenge.id, 'todo')}
                  disabled={userRole !== 'admin'}
                  style={userRole !== 'admin' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  To Do
                </button>
                <button 
                  className={`btn-status ${selectedChallenge.status === 'inprogress' ? 'active-inprogress' : ''}`}
                  onClick={() => handleStatusChange(selectedChallenge.id, 'inprogress')}
                  disabled={userRole !== 'admin'}
                  style={userRole !== 'admin' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  In Progress
                </button>
                <button 
                  className={`btn-status ${selectedChallenge.status === 'resolved' ? 'active-resolved' : ''}`}
                  onClick={() => handleStatusChange(selectedChallenge.id, 'resolved')}
                  disabled={userRole !== 'admin'}
                  style={userRole !== 'admin' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Resolved
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
