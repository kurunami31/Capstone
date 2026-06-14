import { useState, useRef, useEffect } from 'react'
import './ChatWidget.css'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && !historyLoaded) {
      setHistoryLoaded(true)
      fetch('/api/chat/history?limit=50', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          if (data.history && data.history.length > 0) {
            setMessages(data.history)
          } else {
            setMessages([
              { role: 'bot', text: 'Hi! I\'m the DOrSU assistant. Ask me anything about the program recommender system, the assessment process, or DOrSU programs.' },
            ])
          }
        })
        .catch(() => {
          setMessages([
            { role: 'bot', text: 'Hi! I\'m the DOrSU assistant. Ask me anything about the program recommender system, the assessment process, or DOrSU programs.' },
          ])
        })
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg, history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chat error')
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)} title="Open chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.73-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
              DOrSU Assistant
            </h3>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && <div className="chat-msg typing">Typing...</div>}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button className="chat-send" onClick={handleSend} disabled={loading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
