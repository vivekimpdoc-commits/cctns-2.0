import React, { useState } from 'react';

const ReadinessCalculator = ({ onReadinessCalculated }) => {
  const [formData, setFormData] = useState({
    databaseBackup: false,
    networkBandwidth: false,
    staffTraining: false,
    legacyFontCleaned: false,
    mfaEnabled: false,
    biometricDevices: false
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const runEvaluation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/readiness-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResults(data);
      if (onReadinessCalculated) {
        onReadinessCalculated(data.score);
      }
    } catch (err) {
      console.error("Failed to run readiness evaluation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>Police Station Readiness Diagnostic</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Evaluate whether a specific local police station infrastructure is prepared to shift from CCTNS 1.0 to CCTNS 2.0.
        </p>
      </div>

      <div className="calculator-container">
        <div className="calculator-card">
          <h2>Infrastructure & Data Audit</h2>
          <form onSubmit={runEvaluation} className="survey-form">
            
            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.databaseBackup} 
                onChange={() => handleCheckboxChange('databaseBackup')}
              />
              <div className="survey-info">
                <h4>Database Backup Completed</h4>
                <p>All local relational database tables and attachments (1.0) backed up securely to offline disk.</p>
              </div>
            </label>

            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.networkBandwidth} 
                onChange={() => handleCheckboxChange('networkBandwidth')}
              />
              <div className="survey-info">
                <h4>Stable High-Speed Connectivity (&gt; 2 Mbps)</h4>
                <p>Internet leased line or VPN tunnel configured to connect with the State Data Centre (SDC) without package loss.</p>
              </div>
            </label>

            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.staffTraining} 
                onChange={() => handleCheckboxChange('staffTraining')}
              />
              <div className="survey-info">
                <h4>Staff Training & User Wizard Adoption</h4>
                <p>Station officers and case writers have completed training workshops for CCTNS 2.0 web-app steppers.</p>
              </div>
            </label>

            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.legacyFontCleaned} 
                onChange={() => handleCheckboxChange('legacyFontCleaned')}
              />
              <div className="survey-info">
                <h4>Legacy Character Font Cleanup (Devnagari/Unicode)</h4>
                <p>Local state fonts (e.g. KrutiDev) processed through character encoders to prevent text corruption in Unicode database.</p>
              </div>
            </label>

            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.mfaEnabled} 
                onChange={() => handleCheckboxChange('mfaEnabled')}
              />
              <div className="survey-info">
                <h4>Multi-Factor Authentication (MFA) Configured</h4>
                <p>Aadhaar biometric sync or mobile OTP authentication enabled for police station user accounts.</p>
              </div>
            </label>

            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.biometricDevices} 
                onChange={() => handleCheckboxChange('biometricDevices')}
              />
              <div className="survey-info">
                <h4>Biometric Logging Devices Connected</h4>
                <p>Fingerprint scanner and verification hardware connected and tested with 2.0 system drivers.</p>
              </div>
            </label>

            <button type="submit" className="btn-calculate">
              {loading ? 'Evaluating...' : 'Run Readiness Audit'}
            </button>
          </form>
        </div>

        <div>
          {results ? (
            <div className="results-card">
              <h2 style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '0.75rem' }}>Audit Results</h2>
              
              <div className="radial-score-container">
                <div className="score-circle" style={{ borderColor: results.color }}>
                  <span className="score-num" style={{ color: results.color }}>{results.score}%</span>
                  <span className="score-lbl">Score</span>
                </div>
              </div>

              <div 
                className="readiness-status" 
                style={{ backgroundColor: `${results.color}22`, color: results.color, border: `1px solid ${results.color}` }}
              >
                {results.status}
              </div>

              <div>
                <h4 style={{ marginBottom: '0.75rem', fontFamily: 'Space Grotesk' }}>Action Items & Logs</h4>
                <div className="recommendations-list">
                  {results.details.map((detail, index) => (
                    <div 
                      key={index} 
                      className="rec-item"
                      style={{ 
                        borderLeftColor: detail.includes('MISSING') || detail.includes('WEAK') || detail.includes('UNCLEANED') || detail.includes('INACTIVE') || detail.includes('NOT') ? 'var(--danger)' : 'var(--success)'
                      }}
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="results-card" style={{ justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
              <p style={{ textAlign: 'center' }}>
                Fill out the infrastructure and data checklist on the left and run the audit to generate readiness scores and custom technical guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadinessCalculator;
