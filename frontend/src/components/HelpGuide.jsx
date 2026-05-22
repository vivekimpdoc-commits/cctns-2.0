import React, { useState } from 'react';

const HelpGuide = ({ t }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTable, setSelectedTable] = useState('fir');
  const [fontInput, setFontInput] = useState('jkt_k Fkkuk vijk/k');
  const [copiedKey, setCopiedKey] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState({});

  // Helper dictionary to mock KrutiDev-to-Unicode conversion
  const simulateKrutiDevConversion = (text) => {
    if (!text) return '';
    
    // Check exact matches for typing common terms
    const lowerText = text.trim();
    if (lowerText === 'jkt_k') return 'राकेश';
    if (lowerText === 'cax') return 'उत्तर';
    if (lowerText === 'jke') return 'राम';
    if (lowerText === 'egkjk"Vª') return 'महाराष्ट्र';
    if (lowerText === 'Fkkuk') return 'थाना';
    if (lowerText === 'vijk/k') return 'अपराध';
    
    // Simple character map to simulate a real typing conversion layout
    const charMap = {
      'j': 'र', 'a': 'ा', 'k': 'क', 't': 'े', '_': 'श',
      'F': 'थ', 'u': 'न', 'v': 'अ', 'i': 'प',
      'd': 'ध', 'e': 'म', 'g': 'ह', 'M': 'श', 'R': '्',
      'ª': 'ट्र', ' ': ' ', 'c': 'उ', 'x': 'त', '\"': 'ष',
      'H': 'ी', 'h': 'ी', 's': 'ए', 'o': 'ो', 'y': 'य'
    };
    
    return text.split('').map(char => charMap[char] || char).join('');
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Content for DB Mapping
  const dbTables = t.help.schema.tables;

  return (
    <div className="help-guide-container" style={{
      animation: 'fadeIn 0.4s ease-out',
      color: 'var(--text-primary)'
    }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px rgba(30, 64, 175, 0.15)'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          ❔ {t.help.title}
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '800px', fontSize: '1.05rem', fontWeight: '500' }}>
          {t.help.subtitle}
        </p>
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-glow)',
        marginBottom: '2rem',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {Object.entries(t.help.tabs).map(([tabKey, label]) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === tabKey ? 'var(--primary-glow)' : 'transparent',
              borderBottom: activeTab === tabKey ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === tabKey ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              transition: 'var(--transition)'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="tab-content" style={{ minHeight: '400px' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '1rem' }}>
                {t.help.overview.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
                {t.help.overview.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Pillar 1 */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  borderLeft: '4px solid var(--primary)',
                  transition: 'var(--transition)'
                }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: '700' }}>
                    {t.help.overview.p1Title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {t.help.overview.p1Desc}
                  </p>
                </div>

                {/* Pillar 2 */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  borderLeft: '4px solid var(--accent)',
                  transition: 'var(--transition)'
                }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem', fontWeight: '700' }}>
                    {t.help.overview.p2Title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {t.help.overview.p2Desc}
                  </p>
                </div>

                {/* Pillar 3 */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  borderLeft: '4px solid var(--success)',
                  transition: 'var(--transition)'
                }}>
                  <h4 style={{ color: 'var(--success)', marginBottom: '0.75rem', fontWeight: '700' }}>
                    {t.help.overview.p3Title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {t.help.overview.p3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATABASE SCHEMA MAPPER TAB */}
        {activeTab === 'schema' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                {t.help.schema.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {t.help.schema.desc}
              </p>

              {/* Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {t.help.schema.selectPlaceholder}
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-glow)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="fir">📋 {dbTables.fir.name}</option>
                  <option value="accused">👤 {dbTables.accused.name}</option>
                  <option value="evidence">📎 {dbTables.evidence.name}</option>
                </select>
              </div>

              {/* Schema Compare Block */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* CCTNS 1.0 */}
                <div style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  border: '1px dashed var(--danger)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--danger)', backgroundColor: 'var(--danger-glow)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      CCTNS 1.0 Schema
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Relational (JSP/Oracle)</span>
                  </div>
                  <pre style={{
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    overflowX: 'auto',
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {dbTables[selectedTable].oldSchema}
                  </pre>
                </div>

                {/* Arrow indicator for visual flow */}
                <div style={{
                  backgroundColor: 'var(--primary-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  border: '1px solid var(--primary)',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      CCTNS 2.0 Schema
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>JSONB / UUID / Postgres</span>
                  </div>
                  <pre style={{
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    overflowX: 'auto',
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {dbTables[selectedTable].newSchema}
                  </pre>
                </div>
              </div>

              {/* Mapping Description */}
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '700' }}>
                  🔄 Migration & Mapping Strategy
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {dbTables[selectedTable].mapping}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FONT CONVERTER PLAYGROUND TAB */}
        {activeTab === 'font' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                {t.help.font.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {t.help.font.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Input area */}
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {t.help.font.inputLabel}
                  </label>
                  <textarea
                    value={fontInput}
                    onChange={(e) => setFontInput(e.target.value)}
                    placeholder={t.help.font.inputPlaceholder}
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glow)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontFamily: 'Consolas, monospace',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'var(--transition)'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Try words:</span>
                    {['jkt_k', 'Fkkuk', 'vijk/k', 'cax', 'egkjk"Vª'].map(word => (
                      <button
                        key={word}
                        onClick={() => setFontInput(word)}
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-glow)',
                          borderRadius: '4px',
                          padding: '0.1rem 0.5rem',
                          cursor: 'pointer',
                          color: 'var(--primary)',
                          fontWeight: '600'
                        }}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Converted Output preview */}
                <div style={{
                  backgroundColor: 'var(--primary-glow)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', backgroundColor: 'rgba(30, 64, 175, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'inline-block', marginBottom: '1rem' }}>
                      {t.help.font.outputLabel}
                    </span>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      minHeight: '80px',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glow)',
                      lineHeight: '1.6',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {simulateKrutiDevConversion(fontInput) || <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '400' }}>[Waiting for input]</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <span>{t.help.font.convertedText}</span>
                    <span>{t.help.font.charCount}: {fontInput.length}</span>
                  </div>
                </div>
              </div>

              {/* Developer guide section */}
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚙️ {t.help.font.instructionsTitle}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.help.font.instructionsDesc}
                </p>
                <pre style={{
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  overflowX: 'auto',
                  fontSize: '0.8rem',
                  fontFamily: 'Consolas, monospace',
                  marginTop: '1rem',
                  whiteSpace: 'pre'
                }}>
{`// Example controller sanitizer in Node.js backend
const { sanitizeRegionalText } = require('../utils/fontConverter');

router.post('/api/cases', (req, res) => {
  // Convert KrutiDev complainant name to unicode before DB write
  const sanitizedComplainant = sanitizeRegionalText(req.body.complainant);
  req.body.complainant = sanitizedComplainant;
  
  // Proceed with DB insert...
});`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM CONFIGURATIONS TAB */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                {t.help.config.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {t.help.config.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* JVM Config */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '700' }}>
                      ☕ {t.help.config.jvmTitle}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {t.help.config.jvmDesc}
                    </p>
                    <pre style={{
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontFamily: 'Consolas, monospace',
                      overflowX: 'auto'
                    }}>
                      {t.help.config.jvmParams}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy(t.help.config.jvmParams, 'jvm')}
                    style={{
                      marginTop: '1rem',
                      alignSelf: 'flex-start',
                      background: 'var(--primary-glow)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      transition: 'var(--transition)'
                    }}
                  >
                    {copiedKey === 'jvm' ? '✅ Copied!' : '📋 Copy Parameters'}
                  </button>
                </div>

                {/* Offline Sync Parameter */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: '700' }}>
                      ⚡ {t.help.config.syncTitle}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {t.help.config.syncDesc}
                    </p>
                    <pre style={{
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontFamily: 'Consolas, monospace',
                      overflowX: 'auto'
                    }}>
                      {t.help.config.syncParams}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy(t.help.config.syncParams, 'sync')}
                    style={{
                      marginTop: '1rem',
                      alignSelf: 'flex-start',
                      background: 'rgba(2, 132, 199, 0.08)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      transition: 'var(--transition)'
                    }}
                  >
                    {copiedKey === 'sync' ? '✅ Copied!' : '📋 Copy Properties'}
                  </button>
                </div>

                {/* Biometric Credentials */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '700' }}>
                      🔑 {t.help.config.mfaTitle}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {t.help.config.mfaDesc}
                    </p>
                    <pre style={{
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontFamily: 'Consolas, monospace',
                      overflowX: 'auto'
                    }}>
                      {t.help.config.mfaParams}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy(t.help.config.mfaParams, 'mfa')}
                    style={{
                      marginTop: '1rem',
                      alignSelf: 'flex-start',
                      background: 'rgba(15, 118, 110, 0.08)',
                      border: '1px solid var(--success)',
                      color: 'var(--success)',
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      transition: 'var(--transition)'
                    }}
                  >
                    {copiedKey === 'mfa' ? '✅ Copied!' : '📋 Copy Settings'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* FAQ ACCORDION TAB */}
        {activeTab === 'faq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                💡 {t.help.faq.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4].map(idx => {
                  const qKey = `q${idx}`;
                  const aKey = `a${idx}`;
                  const isExpanded = expandedFaq[idx];

                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--border-glow)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isExpanded ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                        transition: 'var(--transition)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Question Header */}
                      <div
                        onClick={() => toggleFaq(idx)}
                        style={{
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '1rem',
                          color: isExpanded ? 'var(--primary)' : 'var(--text-primary)',
                          userSelect: 'none'
                        }}
                      >
                        <span style={{ paddingRight: '1rem' }}>{t.help.faq[qKey]}</span>
                        <span style={{
                          fontSize: '1.2rem',
                          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                          transition: 'var(--transition)',
                          color: isExpanded ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          ➕
                        </span>
                      </div>

                      {/* Answer Body */}
                      <div style={{
                        maxHeight: isExpanded ? '500px' : '0px',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s cubic-bezier(0, 1, 0, 1)',
                        borderTop: isExpanded ? '1px solid var(--border-glow)' : 'none'
                      }}>
                        <div style={{
                          padding: '1.25rem 1.5rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.95rem',
                          lineHeight: '1.6',
                          backgroundColor: 'var(--bg-secondary)'
                        }}>
                          {t.help.faq[aKey]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HelpGuide;
