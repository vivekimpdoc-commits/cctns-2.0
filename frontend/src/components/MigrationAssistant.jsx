import React, { useState, useRef, useEffect } from 'react';

const MigrationAssistant = ({ t }) => {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isEn = t.assistant.btnSend === 'Send';

  const suggestedQuestions = [
    t.assistant.q1,
    t.assistant.q2,
    t.assistant.q3,
    t.assistant.q4,
    t.assistant.q5
  ];

  // Keep welcome message translated dynamically
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: t.assistant.welcomeMsg
        }
      ]);
    } else {
      setMessages(prev => prev.map(msg => msg.id === 'welcome' ? { ...msg, text: t.assistant.welcomeMsg } : msg));
    }
  }, [t.assistant.welcomeMsg]);

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
        text: data.answer || (isEn ? "Sorry, I cannot find an answer to this right now." : "क्षमा करें, मैं अभी इसका उत्तर नहीं ढूंढ पा रहा हूँ।")
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: isEn 
          ? 'API Server connectivity check failed. Make sure server is running on port 5000.' 
          : 'API सर्वर कनेक्टिविटी जांच विफल रही। सुनिश्चित करें कि सर्वर पोर्ट 5000 पर चल रहा है।'
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
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>{t.assistant.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t.assistant.desc}
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-avatar"></div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{t.assistant.expertSystem}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{t.assistant.activeHelp}</span>
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
            placeholder={t.assistant.placeholder}
            className="chat-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="chat-send-btn" disabled={loading}>
            {t.assistant.btnSend}
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
