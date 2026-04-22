import React, { useState, useRef, useEffect } from 'react';
import { CHATBOT_QA } from '../data/dummyData';

const SUGGESTIONS = [
  'What are autism signs?',
  'What is M-CHAT?',
  'When to see a doctor?',
  'What therapies help?',
];

function getBotReply(text) {
  const lower = text.toLowerCase();
  for (const qa of CHATBOT_QA) {
    if (qa.keywords.some(k => lower.includes(k))) return qa.answer;
  }
  return "I'm not sure about that. Please consult a pediatrician or try rephrasing your question. 🩺";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m the AutiSense AI assistant. 🧡 Ask me anything about autism, screening, or early development!' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setShowSuggestions(false);
    setMessages(m => [...m, { from: 'user', text: msg }]);
    setTyping(true);
    const delay = 900 + Math.random() * 400;
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: 'bot', text: getBotReply(msg) }]);
    }, delay);
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem' }}>
                  AutiSense AI
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-msg bot" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}

            {/* Suggestion chips */}
            {showSuggestions && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding: '6px 13px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid var(--border)',
                      background: 'white',
                      color: 'var(--orange)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.2s',
                    }}
                  >{s}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              style={{
                flex: 1, padding: '10px 14px',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem', fontFamily: 'var(--font-body)', outline: 'none',
                background: 'var(--cream)',
              }}
            />
            <button
              onClick={() => sendMessage()}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--orange)', border: 'none',
                color: 'white', fontSize: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >➤</button>
          </div>
        </div>
      )}

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 400 }}>
        {!open && <div className="chatbot-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%' }} />}
        <div style={{ position: 'relative' }}>
          <button
            className="chatbot-fab"
            onClick={() => setOpen(o => !o)}
            title="Ask AutiSense AI"
          >
            {open ? '✕' : '🤖'}
          </button>
          <div className="chatbot-online" />
        </div>
      </div>
    </>
  );
}
