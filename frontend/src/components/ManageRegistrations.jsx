import React, { useState, useEffect } from 'react';

const ManageRegistrations = ({ t, onActionSuccess }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      const cachedUser = JSON.parse(localStorage.getItem('cctns_user') || '{}');
      const response = await fetch('/api/admin/pending-users', {
        headers: {
          'x-user-role': cachedUser.role || ''
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load registrations.");
      }
      setPendingUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (email, action) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const cachedUser = JSON.parse(localStorage.getItem('cctns_user') || '{}');
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': cachedUser.role || ''
        },
        body: JSON.stringify({ email, action })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Action failed.");
      }

      const template = action === 'approve' ? t.registrations.successApprove : t.registrations.successReject;
      setSuccessMsg(template.replace('{email}', email));
      fetchPendingUsers();
      if (onActionSuccess) {
        onActionSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>{t.registrations.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t.registrations.desc}
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--success-glow)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          ✅ {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
          {t.registrations.loading}
        </div>
      ) : pendingUsers.length === 0 ? (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-glow)', 
          borderRadius: 'var(--radius-md)', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.5rem' }}>{t.registrations.noRequestsTitle}</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t.registrations.noRequestsDesc}
          </p>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-glow)', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glow)' }}>
                <th style={{ padding: '1rem' }}>{t.registrations.thName}</th>
                <th style={{ padding: '1rem' }}>{t.registrations.thEmail}</th>
                <th style={{ padding: '1rem' }}>{t.registrations.thRole}</th>
                <th style={{ padding: '1rem' }}>{t.registrations.thStatus}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{t.registrations.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent)' }}>{item.email}</td>
                  <td style={{ padding: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      backgroundColor: item.role === 'admin' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                      color: item.role === 'admin' ? '#4f46e5' : '#0891b2',
                      border: item.role === 'admin' ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)'
                    }}>
                      {item.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--warning)', fontSize: '0.85rem' }}>
                    {t.registrations.pendingLabel}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleAction(item.email, 'approve')}
                        style={{
                          backgroundColor: 'var(--success-glow)',
                          color: 'var(--success)',
                          border: '1px solid rgba(15, 118, 110, 0.3)',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--success)';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--success-glow)';
                          e.target.style.color = 'var(--success)';
                        }}
                      >
                        {t.registrations.btnApprove}
                      </button>
                      <button 
                        onClick={() => handleAction(item.email, 'reject')}
                        style={{
                          backgroundColor: 'var(--danger-glow)',
                          color: 'var(--danger)',
                          border: '1px solid rgba(190, 18, 60, 0.3)',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--danger)';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--danger-glow)';
                          e.target.style.color = 'var(--danger)';
                        }}
                      >
                        {t.registrations.btnReject}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRegistrations;
