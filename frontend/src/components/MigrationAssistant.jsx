import React, { useState, useRef, useEffect } from 'react';

const MigrationAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaskar! Main CCTNS 2.0 Migration Assistant hoon. CCTNS 1.0 se 2.0 upgrade karte samay databases, offline replication sync pipelines, security protocols aur UI forms se relative problems ke bare mein aap mujhse questions pooch sakte hain.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Offline database sync kaise hota hai?",
    "Legacy character font clean kaise karein?",
    "ICJS system ke sath APIs kaise work karti hain?",
    "Data tampering aur security ke kya upgrades hain?",
    "Constables ke user interface mein kya updates hain?"
  ];

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await response.json();
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.answer || "Kshama karein, main iska uttar abhi nahi dhoond pa raha hoon."
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'API Server connectivity check failed. Make sure server is running on port 5000.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>CCTNS Upgrade Chat Assistant</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Ask dynamic questions in Hinglish or English about schema mapping, offline sync, data validation, and deployment issues.
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-avatar"></div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>CCTNS 2.0 Expert System</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Active Online Helpdesk</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bot" style={{ display: 'flex', gap: '4px', padding: '0.75rem 1.25rem' }}>
              <span style={{ animation: 'pulse 1s infinite', content: '""', width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%' }}></span>
              <span style={{ animation: 'pulse 1s infinite 0.2s', content: '""', width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%' }}></span>
              <span style={{ animation: 'pulse 1s infinite 0.4s', content: '""', width: '8px', height: '8px', background: 'var(--text-secondary)', borderRadius: '50%' }}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-suggested">
          {suggestedQuestions.map((q, idx) => (
            <button key={idx} className="suggested-btn" onClick={() => handleSend(q)}>
              {q}
            </button>
          ))}
        </div>

        <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}>
          <input 
            type="text" 
            placeholder="Type question here... (e.g. offline, security, database)"
            className="chat-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="chat-send-btn" disabled={loading}>
            Send
          </button>
        </form>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default MigrationAssistant;
