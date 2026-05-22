import React from 'react';

const DashboardOverview = ({ challenges, onNavigate, readinessScore, t }) => {
  const total = challenges.length;
  const todo = challenges.filter(c => c.status === 'todo').length;
  const inProgress = challenges.filter(c => c.status === 'inprogress').length;
  const resolved = challenges.filter(c => c.status === 'resolved').length;
  
  const highRisk = challenges.filter(c => c.risk === 'High').length;
  const mediumRisk = challenges.filter(c => c.risk === 'Medium').length;
  const lowRisk = challenges.filter(c => c.risk === 'Low').length;

  const resolvedPercentVal = total > 0 ? (resolved / total * 100) : 0;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card risk-high">
          <div className="stat-title">{t.overview.highRisk}</div>
          <div className="stat-value">{highRisk}</div>
          <div className="stat-desc">{t.overview.highRiskDesc}</div>
        </div>
        <div className="stat-card risk-medium">
          <div className="stat-title">{t.overview.mediumRisk}</div>
          <div className="stat-value">{mediumRisk}</div>
          <div className="stat-desc">{t.overview.mediumRiskDesc}</div>
        </div>
        <div className="stat-card risk-resolved">
          <div className="stat-title">{t.overview.resolvedChallenges}</div>
          <div className="stat-value">{resolved} / {total}</div>
          <div className="stat-desc">{t.overview.resolvedDesc}</div>
        </div>
        <div className="stat-card readiness">
          <div className="stat-title">{t.overview.currentReadiness}</div>
          <div className="stat-value">{readinessScore}%</div>
          <div className="stat-desc">{t.overview.readinessDesc}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
        <div className="calculator-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontFamily: 'Space Grotesk' }}>{t.overview.focusAreas}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {t.overview.focusDesc}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                <span>{t.overview.area1}</span>
                <span style={{ color: 'var(--accent)' }}>{resolvedPercentVal.toFixed(0)}% {t.overview.resolvedPercent}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${resolvedPercentVal}%`, height: '100%', background: 'var(--accent)', transition: 'var(--transition)' }}></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                <span>{t.overview.area2}</span>
                <span style={{ color: 'var(--primary)' }}>33% Setup</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '33%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                <span>{t.overview.area3}</span>
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
            {t.overview.btnManageBoard}
          </button>
        </div>

        <div className="results-card" style={{ position: 'static' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>{t.overview.quickTips}</h3>
          <ul className="recommendations-list" style={{ listStyle: 'none' }}>
            <li className="rec-item">
              <strong>{t.overview.tip1Title}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {t.overview.tip1Desc}
              </div>
            </li>
            <li className="rec-item" style={{ borderLeftColor: 'var(--warning)' }}>
              <strong>{t.overview.tip2Title}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {t.overview.tip2Desc}
              </div>
            </li>
            <li className="rec-item" style={{ borderLeftColor: 'var(--primary)' }}>
              <strong>{t.overview.tip3Title}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {t.overview.tip3Desc}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
