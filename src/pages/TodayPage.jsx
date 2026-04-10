import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useDailyLog } from '../hooks/useDailyLog'
import { sendMessage, parseActions, generateDailyOpening } from '../services/coach'
import {
  getChatMessages, saveChatMessage, saveWorkoutLog,
  getRecentWorkouts, getTodayWorkout, addFoodEntry, getOrCreateDailyLog
} from '../services/logs'
import { updateProfile } from '../services/profile'

const TODAY = new Date().toISOString().split('T')[0]
const TODAY_LABEL = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()

function MacroBar({ totals, targets }) {
  const pct = (val, target) => target > 0 ? Math.min((val / target) * 100, 100) : 0
  const over = (val, target) => target > 0 && val > target
  const macros = [
    { key: 'calories', label: 'CAL', val: totals.calories, target: targets.daily_calories },
    { key: 'protein', label: 'PRO', val: totals.protein, target: targets.daily_protein },
    { key: 'fat', label: 'FAT', val: totals.fat, target: targets.daily_fat },
    { key: 'carbs', label: 'CARB', val: totals.carbs, target: targets.daily_carbs },
  ]
  return (
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '10px 16px 8px', flexShrink: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '8px' }}>
        {macros.map(({ key, label, val, target }) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '24px', lineHeight: 1, color: over(val, target) ? 'var(--status-over)' : key === 'calories' ? 'var(--accent)' : 'var(--text-primary)' }}>
              {val}
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '8px', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
              {label} <span style={{ color: 'var(--text-secondary)' }}>/ {target}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {macros.map(({ key, val, target }) => (
          <div key={key} style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct(val, target)}%`, background: over(val, target) ? 'var(--status-over)' : 'var(--accent)', transition: 'width 300ms', borderRadius: '2px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const time = new Date(msg.created_at || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', padding: '0 16px' }}>
      {isUser ? (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {msg.imagePreview && (
            <img src={msg.imagePreview} alt="food" style={{ width: '100%', maxWidth: '220px', borderRadius: '8px', display: 'block', marginBottom: msg.content ? '8px' : 0 }} />
          )}
          {msg.content && msg.content !== '[photo]' && msg.content}
        </div>
      ) : (
        <div style={{ maxWidth: '92%' }}>
          {msg.actions?.length > 0 && (
            <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '10px', marginBottom: '8px', fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              {msg.actions.map((a, i) => (
                <div key={i}>
                  {a.type === 'log_food' && `✓ Logged · ${a.totals?.calories || 0} cal`}
                  {a.type === 'log_workout' && `✓ Workout logged · ${a.session_name}`}
                  {a.type === 'update_targets' && `✓ Targets updated`}
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </div>
        </div>
      )}
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em' }}>
        {time}
      </div>
    </div>
  )
}

export default function TodayPage() {
  const { user } = useAuth()
  const { profile, refresh: refreshProfile } = useProfile()
  const { log, entries, totals, refresh: refreshLog } = useDailyLog(TODAY)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  const targets = profile ? {
    daily_calories: profile.daily_calories || 2000,
    daily_protein: profile.daily_protein || 150,
    daily_fat: profile.daily_fat || 65,
    daily_carbs: profile.daily_carbs || 200,
  } : { daily_calories: 2000, daily_protein: 150, daily_fat: 65, daily_carbs: 200 }

  const openingFiredRef = useRef(false)

  useEffect(() => {
    if (!user || !profile) return
    Promise.all([
      getChatMessages(user.id, TODAY),
      getRecentWorkouts(user.id),
      getTodayWorkout(user.id, TODAY),
    ]).then(([msgs, workouts, workout]) => {
      setMessages(msgs.filter(m => m.content !== '__opening__'))
      setRecentWorkouts(workouts)
      setTodayWorkout(workout)

      // Auto-fire opening if no chat yet today
      if (msgs.length === 0 && !openingFiredRef.current) {
        openingFiredRef.current = true
        generateDailyOpening({ profile, totals, entries: [], recentWorkouts: workouts, todayWorkout: workout })
          .then(async (text) => {
            const msg = { role: 'assistant', content: text, created_at: new Date().toISOString() }
            setMessages([msg])
            await saveChatMessage(user.id, TODAY, 'user', '__opening__')
            await saveChatMessage(user.id, TODAY, 'assistant', text)
          })
          .catch(err => console.error('Opening failed:', err))
      }
    })
  }, [user, profile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (text) => {
    const content = (text || input).trim()
    if (!content || sending) return
    setInput('')
    setSending(true)
    const userMsg = { role: 'user', content, created_at: new Date().toISOString() }
    const optimisticMessages = [...messages, userMsg]
    setMessages(optimisticMessages)
    try {
      await saveChatMessage(user.id, TODAY, 'user', content)
      const raw = await sendMessage({ messages: optimisticMessages, profile, totals, entries, recentWorkouts, todayWorkout })
      const { cleanText, actions } = parseActions(raw)
      for (const action of actions) {
        if (action.type === 'log_food') {
          const dailyLog = log || await getOrCreateDailyLog(user.id, TODAY)
          await addFoodEntry(dailyLog.id, user.id, action.raw || content, action.items)
          refreshLog()
        }
        if (action.type === 'log_workout') {
          await saveWorkoutLog(user.id, TODAY, action.session_name, { type: action.workout_type, session_name: action.session_name, exercises: action.exercises })
          setTodayWorkout({ raw_input: action.session_name, exercises: { type: action.workout_type } })
          getRecentWorkouts(user.id).then(setRecentWorkouts)
          if (action.calorie_adjustment > 0 && profile) {
            await updateProfile(user.id, { daily_calories: (profile.daily_calories || 2000) + action.calorie_adjustment })
            refreshProfile()
          }
        }
        if (action.type === 'update_targets' && profile) {
          await updateProfile(user.id, action)
          refreshProfile()
        }
      }
      const assistantMsg = { role: 'assistant', content: cleanText, actions, created_at: new Date().toISOString() }
      setMessages(prev => [...prev, assistantMsg])
      await saveChatMessage(user.id, TODAY, 'assistant', cleanText, actions.length ? actions : null)
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.', created_at: new Date().toISOString() }])
    } finally {
      setSending(false)
    }
  }, [input, sending, messages, profile, totals, entries, recentWorkouts, todayWorkout, log, user, refreshLog, refreshProfile])

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file || sending) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'

      const remaining = {
        calories: (profile.daily_calories || 0) - totals.calories,
        protein: (profile.daily_protein || 0) - totals.protein,
        fat: (profile.daily_fat || 0) - totals.fat,
        carbs: (profile.daily_carbs || 0) - totals.carbs,
      }

      const promptText = `Remaining today: ${remaining.calories} cal, ${remaining.protein}g protein, ${remaining.fat}g fat, ${remaining.carbs}g carbs.`

      const photoMsg = {
        role: 'user',
        content: promptText,
        imageData: { base64, mimeType },
        imagePreview: dataUrl,
        created_at: new Date().toISOString(),
      }

      setSending(true)
      const optimisticMessages = [...messages, photoMsg]
      setMessages(optimisticMessages)

      try {
        await saveChatMessage(user.id, TODAY, 'user', '[photo] ' + promptText)
        const raw = await sendMessage({ messages: optimisticMessages, profile, totals, entries, recentWorkouts, todayWorkout })
        const { cleanText, actions } = parseActions(raw)

        for (const action of actions) {
          if (action.type === 'log_food') {
            const dailyLog = log || await getOrCreateDailyLog(user.id, TODAY)
            await addFoodEntry(dailyLog.id, user.id, '[photo] ' + (action.raw || 'food photo'), action.items)
            refreshLog()
          }
          if (action.type === 'log_workout') {
            await saveWorkoutLog(user.id, TODAY, action.session_name, { type: action.workout_type, session_name: action.session_name, exercises: action.exercises })
            setTodayWorkout({ raw_input: action.session_name, exercises: { type: action.workout_type } })
            getRecentWorkouts(user.id).then(setRecentWorkouts)
          }
        }

        const assistantMsg = { role: 'assistant', content: cleanText, actions, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, assistantMsg])
        await saveChatMessage(user.id, TODAY, 'assistant', cleanText, actions.length ? actions : null)
      } catch (err) {
        console.error(err)
        setMessages(prev => [...prev, { role: 'assistant', content: 'Could not analyze photo. Try again.', created_at: new Date().toISOString() }])
      } finally {
        setSending(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function toggleVoice() {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Voice not supported in this browser')
    const r = new SR()
    recognitionRef.current = r
    r.continuous = false
    r.interimResults = false
    r.onresult = (e) => { handleSend(e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    setListening(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  if (!profile) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg-base)' }}>
      <MacroBar totals={totals} targets={targets} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '16px', paddingBottom: '8px' }}>
        <div style={{ textAlign: 'center', fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {TODAY_LABEL}
        </div>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 32px', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            Log food, record a workout,<br />or ask anything.
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {sending && (
          <div style={{ padding: '0 16px 16px', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>···</div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Log food, record a workout, ask anything..."
            rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: '14px', color: 'var(--text-primary)', fontFamily: "'DM Sans',sans-serif", lineHeight: '1.5', maxHeight: '120px', overflow: 'auto' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={toggleVoice} style={{ background: listening ? 'var(--accent-dim)' : 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: listening ? 'var(--accent)' : 'var(--text-muted)', fontSize: '16px', lineHeight: 1 }}>
              {listening ? '⏹' : '🎤'}
            </button>
            <label style={{ cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1 }}>
              📷<input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
            <button onClick={() => handleSend()} disabled={!input.trim() || sending}
              style={{ background: input.trim() && !sending ? 'var(--accent)' : 'var(--bg-card)', border: 'none', borderRadius: '8px', cursor: input.trim() && !sending ? 'pointer' : 'default', padding: '6px 14px', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: input.trim() && !sending ? 'var(--bg-base)' : 'var(--text-muted)', transition: 'background 150ms' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
