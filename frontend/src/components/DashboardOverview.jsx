import React from 'react';

const DashboardOverview = ({ challenges, onNavigate, readinessScore }) => {
  const total = challenges.length;
  const todo = challenges.filter(c => c.status === 'todo').length;
  const inProgress = challenges.filter(c => c.status === 'inprogress').length;
  const resolved = challenges.filter(c => c.status === 'resolved').length;
  
  const highRisk = challenges.filter(c => c.risk === 'High').length;
  const mediumRisk = challenges.filter(c => c.risk === 'Medium').length;
  const lowRisk = challenges.filter(c => c.risk === 'Low').length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card risk-high">
          <div className="stat-title">High Risk Issues</div>
          <div className="stat-value">{highRisk}</div>
          <div className="stat-desc">Require immediate architectural patches</div>
        </div>
        <div className="stat-card risk-medium">
          <div className="stat-title">Medium Risk Issues</div>
          <div className="stat-value">{mediumRisk}</div>
          <div className="stat-desc">Integrations and user-flow friction</div>
        </div>
        <div className="stat-card risk-resolved">
          <div className="stat-title">Resolved Challenges</div>
          <div className="stat-value">{resolved} / {total}</div>
          <div className="stat-desc">Upgrades successfully verified</div>
        </div>
        <div className="stat-card readiness">
          <div className="stat-title">Current Readiness</div>
          <div className="stat-value">{readinessScore}%</div>
          <div className="stat-desc">Based on police station diagnostics</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
        <div className="calculator-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontFamily: 'Space Grotesk' }}>CCTNS 2.0 Upgrade Focus Areas</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Upgrading from CCTNS 1.0 (built on old desktop/monolith technology) to CCTNS 2.0 (built on web-first APIs, cloud services, and microservices) introduces critical gaps. Click on any section below to start implementing fixes.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                <span>Data Schema & Encoding Conversion</span>
                <span style={{ color: 'var(--accent)' }}>{(resolved / total * 100).toFixed(0)}% Resolved</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(resolved / total * 100)}%`, height: '100%', background: 'var(--accent)', transition: 'var(--transition)' }}></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                <span>Offline-Online Replication Config</span>
                <span style={{ color: 'var(--primary)' }}>33% Setup</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '33%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                <span>MFA, Audit Chains & Compliance</span>
                <span style={{ color: 'var(--success)' }}>100% Configured</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--success)' }}></div>
              </div>
            </div>
          </div>
          
          <button 
            className="btn-calculate" 
            style={{ marginTop: '2rem', width: '100%' }}
            onClick={() => onNavigate('board')}
          >
            Manage Migration Board & View Code Changes
          </button>
        </div>

        <div className="results-card" style={{ position: 'static' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Quick Migration Tips</h3>
          <ul className="recommendations-list" style={{ listStyle: 'none' }}>
            <li className="rec-item">
              <strong>Tip 1: Avoid Serial Keys</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Always replace integer auto-increment IDs with UUIDs in 2.0 schema to avoid collisions during offline station sync.
              </div>
            </li>
            <li className="rec-item" style={{ borderLeftColor: 'var(--warning)' }}>
              <strong>Tip 2: Clean Regional Fonts</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Ensure KrutiDev or standard Devnagari local fonts are mapped into clean UTF-8 strings before writing into the central database.
              </div>
            </li>
            <li className="rec-item" style={{ borderLeftColor: 'var(--primary)' }}>
              <strong>Tip 3: Asynchronous APIs</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                For ICJS (e-Prisons, e-Courts) transactions, route queries via Message Queues to prevent delays in UI interactions.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
