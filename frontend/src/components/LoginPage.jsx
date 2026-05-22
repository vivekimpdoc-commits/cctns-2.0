import React, { useState, useEffect } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  
  // Registration form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [successMessage, setSuccessMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Simulated OTP alert notifications
  const [simulatedMailAlert, setSimulatedMailAlert] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError("Kripya valid email address enter karein.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "OTP send karne mein failure.");

      setStep(2);
      setTimer(60);
      
      setSimulatedMailAlert({
        title: "SIMULATION MAIL DEPLOYED",
        body: `CCTNS Mail Hub sent verification code to ${email}:`,
        otp: data.simulatedOtp
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError("Kripya 6-digit OTP code type karein.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "OTP verification failed.");

      localStorage.setItem('cctns_user', JSON.stringify(data.user));
      localStorage.setItem('cctns_token', data.token);

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regEmail.includes('@')) {
      setError("Sabhi details valid format mein fill karein.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          role: regRole
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Registration failed.");

      setSuccessMessage(data.message);
      
      // Clear inputs
      setRegName('');
      setRegEmail('');
      setRegRole('user');
      setIsRegistering(false); // Switch to login screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setError(null);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, var(--bg-tertiary), var(--bg-primary))',
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative'
      }}>
        
        {/* Government Emblem Symbol */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #ff9933, #ffffff, #128807)', 
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.25rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            🦁
          </div>
          <span className="badge-gov">CCTNS SECURITY HUB</span>
          <h2 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'Space Grotesk' }}>
            {isRegistering ? 'Officer Registration' : 'Upgrade Command Center'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isRegistering ? 'Submit validation request for new officer account' : 'System logs and deployment board access dashboard'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--danger-glow)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--success-glow)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-sm)',
            color: '#86efac',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {isRegistering ? (
          // ================= REGISTRATION FORM =================
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Full Officer Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Constable Rajesh Kumar"
                className="chat-input"
                style={{ width: '100%' }}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Official Email Address
              </label>
              <input 
                type="email" 
                placeholder="rajesh.kumar@cctns.gov.in"
                className="chat-input"
                style={{ width: '100%' }}
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Requested Role
              </label>
              <select 
                className="chat-input" 
                style={{ width: '100%', cursor: 'pointer' }}
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="user">👮 Field Constable / User (Read-Only Board)</option>
                <option value="admin">🔑 Command Center Admin / Admin (Full Access)</option>
              </select>
            </div>

            <button type="submit" className="btn-calculate" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting Registration...' : 'Register Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => { setIsRegistering(false); setError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                Pehle se registered hai? Log In karein
              </button>
            </div>
          </form>
        ) : (
          // ================= LOGIN FORM =================
          <div>
            {step === 1 ? (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Enter Registered Email ID
                  </label>
                  <input 
                    type="email" 
                    placeholder="officer@cctns.gov.in"
                    className="chat-input"
                    style={{ width: '100%' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-calculate" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Dispatched OTP...' : 'Send Login OTP'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setIsRegistering(true); setError(null); setSuccessMessage(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                  >
                    Naya Account register karein (Needs Approval)
                  </button>
                </div>

                {/* Quick Testing accounts filler */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--bg-tertiary)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    DEFAULT APPROVED TESTING ACCOUNTS:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      className="suggested-btn" 
                      style={{ textAlign: 'left', width: '100%', justifyContent: 'space-between', display: 'flex' }}
                      onClick={() => handleQuickSelect('admin@cctns.gov.in')}
                    >
                      <span>🔑 Admin (IPS Admin Master)</span>
                      <span style={{ opacity: 0.6 }}>admin@cctns.gov.in</span>
                    </button>
                    <button 
                      type="button" 
                      className="suggested-btn" 
                      style={{ textAlign: 'left', width: '100%', justifyContent: 'space-between', display: 'flex' }}
                      onClick={() => handleQuickSelect('user@cctns.gov.in')}
                    >
                      <span>👮 User (Field Constable)</span>
                      <span style={{ opacity: 0.6 }}>user@cctns.gov.in</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>OTP Sent To:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '0.95rem' }}>{email}</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="######"
                    className="chat-input"
                    style={{ width: '100%', textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                    required
                  />
                </div>

                <button type="submit" className="btn-calculate" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Authorize'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change Email
                  </button>
                  {timer > 0 ? (
                    <span>Resend in {timer}s</span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleRequestOtp}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Simulated Email Pop Up Notification */}
      {simulatedMailAlert && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#0f172a',
          border: '2px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.75rem',
          maxWidth: '380px',
          boxShadow: '0 12px 30px rgba(6, 182, 212, 0.25)',
          animation: 'slideUp 0.3s ease-out',
          zIndex: 999
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
              ✉️ {simulatedMailAlert.title}
            </span>
            <button 
              onClick={() => setSimulatedMailAlert(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
            >
              &times;
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {simulatedMailAlert.body}
          </p>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '0.75rem',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.25em',
            borderRadius: '4px',
            border: '1px dashed var(--border-glow)'
          }}>
            {simulatedMailAlert.otp}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            This box mock simulates checking your mail dashboard. Click values above to log in.
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
