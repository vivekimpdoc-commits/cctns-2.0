import React, { useState } from 'react';

const ReadinessCalculator = ({ onReadinessCalculated, t }) => {
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

  const translateDetail = (detail) => {
    if (!t.calculator || t.calculator.title === "Police Station Readiness Diagnostic") {
      // English mode
      return detail;
    }
    // Hindi mode conversions
    if (detail.includes("Database Backup: Completed")) {
      return "डेटाबेस बैकअप: पूर्ण। SDC सिंक पथ सत्यापित है।";
    }
    if (detail.includes("Database Backup: MISSING")) {
      return "डेटाबेस बैकअप: अनुपलब्ध। गंभीर खतरा! आगे बढ़ने से पहले सभी CCTNS 1.0 स्कीमा का बैकअप लें।";
    }
    if (detail.includes("Network Bandwidth: Adequate")) {
      return "नेटवर्क बैंडविड्थ: पर्याप्त (>= 2 Mbps स्थिर लिंक कॉन्फ़िगर)।";
    }
    if (detail.includes("Network Bandwidth: WEAK")) {
      return "नेटवर्क बैंडविड्थ: कमजोर। क्षेत्रीय ऑफ़लाइन प्रतिकृति सर्वर (लोकल CAS) सेटअप करें।";
    }
    if (detail.includes("Staff Training: Over 75%")) {
      return "कर्मचारी प्रशिक्षण: 75% से अधिक कांस्टेबलों को प्रशिक्षित किया गया है।";
    }
    if (detail.includes("Staff Training: LOW")) {
      return "कर्मचारी प्रशिक्षण: कम। पंजीकरण वर्कफ़्लो पर 3 दिवसीय प्रशिक्षण आयोजित करें।";
    }
    if (detail.includes("Legacy Fonts: Standardized")) {
      return "स्थानीय फ़ॉन्ट्स: मानक UTF-8 यूनिकोड में परिवर्तित।";
    }
    if (detail.includes("Legacy Fonts: UNCLEANED")) {
      return "स्थानीय फ़ॉन्ट्स: अपरिष्कृत। पुराने फ़ॉन्ट (KrutiDev) डेटाबेस में ख़राब हो जाएंगे। UTF-8 कनवर्टर चलाएं।";
    }
    if (detail.includes("MFA & Security: Multi-factor")) {
      return "MFA और सुरक्षा: अधिकारियों के लिए मल्टी-फैक्टर ऑथेंटिकेशन सक्रिय है।";
    }
    if (detail.includes("MFA & Security: INACTIVE")) {
      return "MFA और सुरक्षा: निष्क्रिय। क्रेडेंशियल दुरुपयोग का खतरा। JWT + आधार MFA सक्षम करें।";
    }
    if (detail.includes("Biometric Hardware: Connected")) {
      return "बायोमेट्रिक हार्डवेयर: कनेक्टेड और लॉगिंग मॉड्यूल के साथ एकीकृत।";
    }
    if (detail.includes("Biometric Hardware: NOT DETECTED")) {
      return "बायोमेट्रिक हार्डवेयर: पता नहीं चला। फिंगरप्रिंट/आईरिस स्कैनर कनेक्ट करें।";
    }
    return detail;
  };

  const translateStatus = (status) => {
    if (!t.calculator || t.calculator.title === "Police Station Readiness Diagnostic") {
      return status;
    }
    if (status === "Critical Risk") return "गंभीर जोखिम (Critical Risk)";
    if (status === "Warning Mode") return "चेतावनी मोड (Warning Mode)";
    if (status === "Production Ready") return "उत्पादन के लिए तैयार (Production Ready)";
    return status;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>{t.calculator.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t.calculator.desc}
        </p>
      </div>

      <div className="calculator-container">
        <div className="calculator-card">
          <h2>{t.calculator.auditTitle}</h2>
          <form onSubmit={runEvaluation} className="survey-form">
            
            <label className="survey-item">
              <input 
                type="checkbox" 
                className="survey-checkbox" 
                checked={formData.databaseBackup} 
                onChange={() => handleCheckboxChange('databaseBackup')}
              />
              <div className="survey-info">
                <h4>{t.calculator.dbBackupTitle}</h4>
                <p>{t.calculator.dbBackupDesc}</p>
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
                <h4>{t.calculator.networkTitle}</h4>
                <p>{t.calculator.networkDesc}</p>
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
                <h4>{t.calculator.trainingTitle}</h4>
                <p>{t.calculator.trainingDesc}</p>
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
                <h4>{t.calculator.fontsTitle}</h4>
                <p>{t.calculator.fontsDesc}</p>
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
                <h4>{t.calculator.mfaTitle}</h4>
                <p>{t.calculator.mfaDesc}</p>
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
                <h4>{t.calculator.biometricTitle}</h4>
                <p>{t.calculator.biometricDesc}</p>
              </div>
            </label>

            <button type="submit" className="btn-calculate">
              {loading ? t.calculator.btnEvaluating : t.calculator.btnRunAudit}
            </button>
          </form>
        </div>

        <div>
          {results ? (
            <div className="results-card" style={{ borderLeft: `5px solid ${results.color}`, background: `linear-gradient(135deg, #ffffff 0%, ${results.color}08 100%)` }}>
              <h2 style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '0.75rem' }}>{t.calculator.auditResults}</h2>
              
              <div className="radial-score-container">
                <div className="score-circle" style={{ borderColor: results.color }}>
                  <span className="score-num" style={{ color: results.color }}>{results.score}%</span>
                  <span className="score-lbl">{t.calculator.scoreLabel}</span>
                </div>
              </div>

              <div 
                className="readiness-status" 
                style={{ backgroundColor: `${results.color}22`, color: results.color, border: `1px solid ${results.color}` }}
              >
                {translateStatus(results.status)}
              </div>

              <div>
                <h4 style={{ marginBottom: '0.75rem', fontFamily: 'Space Grotesk' }}>{t.calculator.actionItems}</h4>
                <div className="recommendations-list">
                  {results.details.map((detail, index) => (
                    <div 
                      key={index} 
                      className="rec-item"
                      style={{ 
                        borderLeftColor: detail.includes('MISSING') || detail.includes('WEAK') || detail.includes('UNCLEANED') || detail.includes('INACTIVE') || detail.includes('NOT') ? 'var(--danger)' : 'var(--success)'
                      }}
                    >
                      {translateDetail(detail)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="results-card" style={{ justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
              <p style={{ textAlign: 'center' }}>
                {t.calculator.title === "Police Station Readiness Diagnostic"
                  ? "Fill out the infrastructure and data checklist on the left and run the audit to generate readiness scores and custom technical guidelines."
                  : "ऑडिट शुरू करने और तैयारी रिपोर्ट देखने के लिए बाईं ओर इन्फ्रास्ट्रक्चर और डेटा चेकलिस्ट भरें और बटन दबाएं।"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadinessCalculator;
