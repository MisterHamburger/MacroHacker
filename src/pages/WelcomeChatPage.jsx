import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { sendWelcomeMessage, parseActions } from '../services/coach'
import { updateProfile } from '../services/profile'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', padding: '0 16px' }}>
      {isUser ? (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {msg.content}
        </div>
      ) : (
        <div style={{ maxWidth: '92%' }}>
          {msg.actions?.length > 0 && (
            <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '10px', marginBottom: '8px', fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              {msg.actions.map((a, i) => (
                <div key={i}>
                  {a.type === 'update_targets' && `✓ Targets set · ${a.daily_calories} cal / ${a.daily_protein}g protein`}
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WelcomeChatPage({ onComplete }) {
  const { user } = useAuth()
  const { profile, refresh: refreshProfile } = useProfile()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [targetsSet, setTargetsSet] = useState(false)
  const bottomRef = useRef(null)
  const openingFiredRef = useRef(false)

  useEffect(() => {
    if (!profile || openingFiredRef.current) return
    openingFiredRef.current = true

    const trigger = [{ role: 'user', content: 'Hi' }]
    setSending(true)
    sendWelcomeMessage({ messages: trigger, profile })
      .then(text => {
        const { cleanText, actions } = parseActions(text)
        setMessages([{ role: 'assistant', content: cleanText, actions }])
      })
      .catch(err => {
        console.error('Welcome opening failed:', err)
        setMessages([{ role: 'assistant', content: `Hey ${profile.name}! What's your main goal — lose fat, build muscle, or stay lean?` }])
      })
      .finally(() => setSending(false))
  }, [profile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    setSending(true)

    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    try {
      const raw = await sendWelcomeMessage({ messages: newMessages, profile })
      const { cleanText, actions } = parseActions(raw)

      for (const action of actions) {
        if (action.type === 'update_targets' && user) {
          await updateProfile(user.id, {
            goal: action.goal,
            daily_calories: action.daily_calories,
            daily_protein: action.daily_protein,
            daily_fat: action.daily_fat,
            daily_carbs: action.daily_carbs,
          })
          await refreshProfile()
          setTargetsSet(true)
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanText, actions }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '28px', color: 'var(--accent)', letterSpacing: '0.05em', lineHeight: 1 }}>
          MACRO HACKER
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>
          Setup · Goal
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '20px', paddingBottom: '8px' }}>
        {sending && messages.length === 0 && (
          <div style={{ padding: '0 16px', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>···</div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {sending && messages.length > 0 && (
          <div style={{ padding: '0 16px 16px', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>···</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input or Start button */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        {targetsSet ? (
          <button
            onClick={onComplete}
            style={{ width: '100%', padding: '14px', background: 'var(--accent)', color: 'var(--bg-base)', border: 'none', borderRadius: 'var(--r-sm)', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Start Tracking →
          </button>
        ) : (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me your goal..."
              rows={1}
              autoFocus
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: '14px', color: 'var(--text-primary)', fontFamily: "'DM Sans',sans-serif", lineHeight: '1.5', maxHeight: '120px', overflow: 'auto' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{ background: input.trim() && !sending ? 'var(--accent)' : 'var(--bg-card)', border: 'none', borderRadius: '8px', cursor: input.trim() && !sending ? 'pointer' : 'default', padding: '6px 14px', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: input.trim() && !sending ? 'var(--bg-base)' : 'var(--text-muted)', transition: 'background 150ms', flexShrink: 0 }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
