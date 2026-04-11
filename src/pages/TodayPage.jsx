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

const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

function IconMic({ active }) {
  const c = active ? 'var(--text-primary)' : 'var(--text-muted)'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke={c} strokeWidth="1.25"/>
      <path d="M2.5 7.5C2.5 10.538 4.962 13 8 13C11.038 13 13.5 10.538 13.5 7.5" stroke={c} strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="8" y1="13" x2="8" y2="15.5" stroke={c} strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="5.5" y1="15.5" x2="10.5" y2="15.5" stroke={c} strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  )
}

function IconStop() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="3.5" width="9" height="9" rx="1" stroke="var(--text-primary)" strokeWidth="1.25"/>
    </svg>
  )
}

function IconCamera() {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2.5L5 4H2.5C1.948 4 1.5 4.448 1.5 5V13C1.5 13.552 1.948 14 2.5 14H14.5C15.052 14 15.5 13.552 15.5 13V5C15.5 4.448 15.052 4 14.5 4H12L11 2.5H6Z" stroke="var(--text-muted)" strokeWidth="1.25" strokeLinejoin="round"/>
      <circle cx="8.5" cy="9" r="2.5" stroke="var(--text-muted)" strokeWidth="1.25"/>
    </svg>
  )
}

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
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '12px 16px 10px', flexShrink: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '10px' }}>
        {macros.map(({ key, label, val, target }) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: DIN_BOLD, fontSize: '22px', lineHeight: 1, letterSpacing: '0.96px', color: over(val, target) ? 'var(--status-over)' : 'var(--text-primary)', fontWeight: 700 }}>
              {val}
            </div>
            <div style={{ fontFamily: DIN, fontSize: '8px', letterSpacing: '1.17px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '3px' }}>
              {label} <span style={{ color: 'var(--text-secondary)' }}>/ {target}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {macros.map(({ key, val, target }) => (
          <div key={key} style={{ flex: 1, height: '2px', background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct(val, target)}%`, background: over(val, target) ? 'var(--status-over)' : 'var(--accent)', transition: 'width 300ms' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function renderText(text) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ))
  })
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const time = new Date(msg.created_at || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '20px', padding: '0 16px' }}>
      {isUser ? (
        <div style={{ background: 'var(--ghost-bg)', border: '1px solid var(--ghost-border)', borderRadius: '4px 4px 0 4px', padding: '10px 14px', maxWidth: '82%', fontSize: '13px', fontFamily: DIN, color: 'var(--text-primary)', lineHeight: '1.6', letterSpacing: '0.02em', textTransform: 'none' }}>
          {msg.imagePreview && (
            <img src={msg.imagePreview} alt="food" style={{ width: '100%', maxWidth: '220px', borderRadius: '2px', display: 'block', marginBottom: msg.content ? '8px' : 0 }} />
          )}
          {msg.content && msg.content !== '[photo]' && msg.content}
        </div>
      ) : (
        <div style={{ maxWidth: '94%' }}>
          {msg.actions?.length > 0 && (
            <div style={{ borderLeft: '1px solid var(--ghost-border)', paddingLeft: '10px', marginBottom: '10px', fontFamily: DIN, fontSize: '9px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              {msg.actions.map((a, i) => (
                <div key={i}>
                  {a.type === 'log_food' && `✓ Logged · ${a.totals?.calories || 0} cal`}
                  {a.type === 'log_workout' && `✓ Workout logged · ${a.session_name}`}
                  {a.type === 'update_targets' && `✓ Targets updated`}
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: '13px', fontFamily: DIN, color: 'var(--text-primary)', lineHeight: '1.65', textTransform: 'none', letterSpacing: '0.02em' }}>
            {renderText(msg.content)}
          </div>
        </div>
      )}
      <div style={{ fontFamily: DIN, fontSize: '8px', color: 'var(--text-muted)', marginTop: '5px', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
  const [input, setInput] = useState(() => localStorage.getItem('draft_input') || '')
  const [sending, setSending] = useState(false)
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  const targets = (() => {
    if (!profile) return { daily_calories: 2000, daily_protein: 150, daily_fat: 65, daily_carbs: 200 }
    const sched = profile.workout_schedule
    if (sched) {
      const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const workoutKey = sched.schedule?.[dayName]
      const todayPlan = workoutKey ? sched.workouts?.[workoutKey] : null
      const dayType = todayPlan?.day_type || 'rest'
      const t = sched.macro_targets?.[dayType]
      if (t) return { daily_calories: t.calories, daily_protein: t.protein, daily_fat: t.fat, daily_carbs: t.carbs }
    }
    return {
      daily_calories: profile.daily_calories || 2000,
      daily_protein: profile.daily_protein || 150,
      daily_fat: profile.daily_fat || 65,
      daily_carbs: profile.daily_carbs || 200,
    }
  })()

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
    localStorage.removeItem('draft_input')
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

  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    handlePhoto({ target: { files: [file], value: '' } })
  }

  function handlePaste(e) {
    const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'))
    if (!item) return
    const file = item.getAsFile()
    if (!file) return
    e.preventDefault()
    handlePhoto({ target: { files: [file], value: '' } })
  }

  if (!profile) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', background: 'var(--bg-base)' }}>
      <MacroBar totals={totals} targets={targets} />

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '20px', paddingBottom: '8px' }}>
        <div style={{ textAlign: 'center', fontFamily: DIN, fontSize: '8px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {TODAY_LABEL}
        </div>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 32px', fontFamily: DIN, fontSize: '10px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: '2' }}>
            Log food, record a workout,<br />or ask anything.
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {sending && (
          <div style={{ padding: '0 16px 16px', fontFamily: DIN, fontSize: '10px', letterSpacing: '0.3em', color: 'var(--text-muted)' }}>···</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            background: dragOver ? 'rgba(240,240,250,0.18)' : 'rgba(240,240,250,0.07)',
            border: `1px solid ${dragOver ? 'var(--ghost-border)' : 'rgba(240,240,250,0.3)'}`,
            borderRadius: '4px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            transition: 'background 150ms, border-color 150ms',
          }}
        >
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); localStorage.setItem('draft_input', e.target.value) }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Log food or workout..."
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', color: 'var(--text-primary)', fontFamily: DIN, lineHeight: '1.5', maxHeight: '120px', overflow: 'auto', textTransform: 'none', letterSpacing: '0.02em' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={toggleVoice} style={{ background: listening ? 'rgba(240,240,250,0.15)' : 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {listening ? <IconStop /> : <IconMic active={false} />}
            </button>
            <label style={{ cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCamera /><input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              style={{
                background: input.trim() && !sending ? 'var(--text-primary)' : 'var(--ghost-bg)',
                border: `1px solid ${input.trim() && !sending ? 'var(--text-primary)' : 'var(--ghost-border)'}`,
                borderRadius: '32px',
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                padding: '5px 16px',
                fontFamily: DIN,
                fontWeight: 700,
                fontSize: '9px',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: input.trim() && !sending ? '#000000' : 'var(--text-muted)',
                transition: 'all 150ms',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
