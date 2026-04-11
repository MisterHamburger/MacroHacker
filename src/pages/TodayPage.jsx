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
const TODAY_LABEL = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="rgba(240,240,250,0.4)" strokeWidth="1.25"/>
      <line x1="10" y1="5.5" x2="10" y2="14.5" stroke="rgba(240,240,250,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5.5" y1="10" x2="14.5" y2="10" stroke="rgba(240,240,250,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconMic({ active }) {
  const c = active ? 'var(--text-primary)' : 'rgba(240,240,250,0.55)'
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="6" y="1.5" width="6" height="9" rx="3" stroke={c} strokeWidth="1.3"/>
      <path d="M3 9C3 12.314 5.686 15 9 15C12.314 15 15 12.314 15 9" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="9" y1="15" x2="9" y2="17.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.5" y1="17.5" x2="11.5" y2="17.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function IconStop() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4" y="4" width="10" height="10" rx="1.5" fill="rgba(240,240,250,0.7)"/>
    </svg>
  )
}

function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="2" y1="9" x2="16" y2="9" stroke="rgba(240,240,250,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="10,3 16,9 10,15" fill="none" stroke="rgba(240,240,250,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCamera({ size = 18 }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="4.5" width="15" height="11" rx="2" stroke="rgba(240,240,250,0.55)" strokeWidth="1.3"/>
      <circle cx="9" cy="10" r="2.8" stroke="rgba(240,240,250,0.55)" strokeWidth="1.3"/>
      <path d="M6.5 4.5L7.5 2.5H10.5L11.5 4.5" stroke="rgba(240,240,250,0.55)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCameraLarge() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="7" width="22" height="16" rx="2.5" stroke="rgba(240,240,250,0.8)" strokeWidth="1.4"/>
      <circle cx="14" cy="15" r="4" stroke="rgba(240,240,250,0.8)" strokeWidth="1.4"/>
      <path d="M10 7L11.5 4.5H16.5L18 7" stroke="rgba(240,240,250,0.8)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconPhotos() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="5" width="22" height="18" rx="2.5" stroke="rgba(240,240,250,0.8)" strokeWidth="1.4"/>
      <circle cx="9.5" cy="11" r="2" stroke="rgba(240,240,250,0.8)" strokeWidth="1.3"/>
      <path d="M3 19L8 14L12 18L17 12L25 19" stroke="rgba(240,240,250,0.8)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Macro Bar ────────────────────────────────────────────────────────────────

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
    <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 20px 12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px' }}>
        {macros.map(({ key, label, val, target }) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: DIN_BOLD, fontSize: '42px', lineHeight: 1, letterSpacing: '-0.5px', color: over(val, target) ? 'var(--status-over)' : 'var(--text-primary)', fontWeight: 700 }}>
              {val}
            </div>
            <div style={{ fontFamily: DIN, fontSize: '11px', letterSpacing: '0.5px', color: 'rgba(240,240,250,0.5)', textTransform: 'uppercase', marginTop: '6px' }}>
              {label} <span style={{ color: 'rgba(240,240,250,0.35)' }}>/ {target}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {macros.map(({ key, val, target }) => (
          <div key={key} style={{ flex: 1, height: '2px', background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct(val, target)}%`, background: over(val, target) ? 'var(--status-over)' : 'rgba(240,240,250,0.5)', transition: 'width 300ms' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Render markdown-ish text ─────────────────────────────────────────────────

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

// ─── Message bubble ───────────────────────────────────────────────────────────

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const time = new Date(msg.created_at || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '28px', padding: '0 20px' }}>
      {isUser ? (
        <div style={{
          background: 'rgba(240,240,250,0.1)',
          border: '1px solid rgba(240,240,250,0.14)',
          borderRadius: '20px 20px 4px 20px',
          padding: '12px 16px',
          maxWidth: '82%',
          fontSize: '16px',
          fontFamily: DIN,
          color: 'var(--text-primary)',
          lineHeight: '1.55',
          textTransform: 'none',
          letterSpacing: '0.01em',
          fontWeight: 400,
        }}>
          {msg.imagePreview && (
            <img src={msg.imagePreview} alt="food" style={{ width: '100%', maxWidth: '240px', borderRadius: '10px', display: 'block', marginBottom: msg.content ? '8px' : 0 }} />
          )}
          {msg.content && msg.content !== '[photo]' && msg.content}
        </div>
      ) : (
        <div style={{ maxWidth: '96%' }}>
          {msg.actions?.length > 0 && (
            <div style={{ borderLeft: '1px solid rgba(240,240,250,0.2)', paddingLeft: '12px', marginBottom: '10px', fontFamily: DIN, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              {msg.actions.map((a, i) => (
                <div key={i}>
                  {a.type === 'log_food' && `✓ Logged · ${a.totals?.calories || 0} cal`}
                  {a.type === 'log_workout' && `✓ Workout logged · ${a.session_name}`}
                  {a.type === 'update_targets' && `✓ Targets updated`}
                </div>
              ))}
            </div>
          )}
          <div style={{
            fontSize: '16px',
            fontFamily: DIN,
            color: 'var(--text-primary)',
            lineHeight: '1.65',
            textTransform: 'none',
            letterSpacing: '0.01em',
            fontWeight: 400,
          }}>
            {renderText(msg.content)}
          </div>
        </div>
      )}
      <div style={{ fontFamily: DIN, fontSize: '9px', color: 'rgba(240,240,250,0.2)', marginTop: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
        {time}
      </div>
    </div>
  )
}

// ─── Add to Chat sheet ────────────────────────────────────────────────────────

function MediaPicker({ onCamera, onPhotos, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '768px',
        background: '#1a1a1a',
        borderRadius: '20px 20px 0 0',
        padding: '12px 20px 40px',
        zIndex: 101,
        animation: 'slideUp 200ms ease',
      }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'rgba(240,240,250,0.2)', borderRadius: '2px', margin: '0 auto 16px' }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={onClose} style={{ background: 'rgba(240,240,250,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="rgba(240,240,250,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="rgba(240,240,250,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '15px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', marginRight: '32px' }}>
            Add to Chat
          </div>
        </div>

        {/* Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Camera', icon: <IconCameraLarge />, action: onCamera },
            { label: 'Photos', icon: <IconPhotos />, action: onPhotos },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={action} style={{
              background: 'rgba(240,240,250,0.07)',
              border: '1px solid rgba(240,240,250,0.1)',
              borderRadius: '16px',
              padding: '24px 16px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}>
              {icon}
              <span style={{ fontFamily: DIN, fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(240,240,250,0.8)', fontWeight: 400 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const { user } = useAuth()
  const { profile, refresh: refreshProfile } = useProfile()
  const { log, entries, totals, refresh: refreshLog } = useDailyLog(TODAY)
  const [messages, setMessages] = useState([])
  const [hasInput, setHasInput] = useState(false)
  const [sending, setSending] = useState(false)
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [listening, setListening] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const photosInputRef = useRef(null)

  // Restore draft
  useEffect(() => {
    const draft = localStorage.getItem('draft_input')
    if (draft && inputRef.current) {
      inputRef.current.innerText = draft
      setHasInput(true)
    }
  }, [])

  function getInputText() {
    return (inputRef.current?.innerText || '').replace(/\n+$/, '').trim()
  }

  function clearInput() {
    if (inputRef.current) inputRef.current.innerText = ''
    setHasInput(false)
    localStorage.removeItem('draft_input')
  }

  function onInputChange() {
    const val = getInputText()
    setHasInput(!!val)
    localStorage.setItem('draft_input', inputRef.current?.innerText || '')
  }

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
    const content = (text || getInputText()).trim()
    if (!content || sending) return
    clearInput()
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
  }, [sending, messages, profile, totals, entries, recentWorkouts, todayWorkout, log, user, refreshLog, refreshProfile])

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file || sending) return
    if (e.target.value !== undefined) e.target.value = ''
    setShowPicker(false)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'
      const remaining = {
        calories: (targets.daily_calories || 0) - totals.calories,
        protein: (targets.daily_protein || 0) - totals.protein,
        fat: (targets.daily_fat || 0) - totals.fat,
        carbs: (targets.daily_carbs || 0) - totals.carbs,
      }
      const promptText = `Remaining today: ${remaining.calories} cal, ${remaining.protein}g protein, ${remaining.fat}g fat, ${remaining.carbs}g carbs.`
      const photoMsg = { role: 'user', content: promptText, imageData: { base64, mimeType }, imagePreview: dataUrl, created_at: new Date().toISOString() }
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

  function handlePasteInInput(e) {
    const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'))
    if (item) {
      const file = item.getAsFile()
      if (file) { e.preventDefault(); handlePhoto({ target: { files: [file] } }); return }
    }
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    handlePhoto({ target: { files: [file] } })
  }

  if (!profile) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Locked top — macro bar */}
      <div style={{ flexShrink: 0 }}>
        <MacroBar totals={totals} targets={targets} />
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '8px' }}>
        {/* Date label */}
        <div style={{ textAlign: 'center', fontFamily: DIN, fontSize: '11px', letterSpacing: '0.5px', color: 'rgba(240,240,250,0.25)', marginBottom: '28px', textTransform: 'none' }}>
          {TODAY_LABEL}
        </div>

        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 32px', fontFamily: DIN, fontSize: '15px', color: 'rgba(240,240,250,0.3)', lineHeight: '1.8', textTransform: 'none', letterSpacing: '0.01em' }}>
            Log food, record a workout,<br />or ask anything.
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {sending && (
          <div style={{ padding: '0 20px 20px', fontFamily: DIN, fontSize: '22px', letterSpacing: '0.2em', color: 'rgba(240,240,250,0.3)', textTransform: 'none' }}>···</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ flexShrink: 0, background: 'var(--bg-base)', borderTop: '1px solid rgba(240,240,250,0.07)', padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            background: dragOver ? 'rgba(240,240,250,0.1)' : 'rgba(240,240,250,0.06)',
            border: `1px solid ${dragOver ? 'rgba(240,240,250,0.35)' : 'rgba(240,240,250,0.12)'}`,
            borderRadius: '24px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            minHeight: '48px',
            transition: 'all 150ms',
          }}
        >
          {/* Text input */}
          <div
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onInput={onInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePasteInInput}
            data-placeholder="Log food or workout..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)',
              fontFamily: DIN,
              lineHeight: '1.5',
              maxHeight: '140px',
              overflow: 'auto',
              textTransform: 'none',
              letterSpacing: '0.01em',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              fontWeight: 400,
              padding: '12px 0',
            }}
          />

          {/* Camera — plain icon button */}
          <button
            onClick={() => setShowPicker(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.55 }}
          >
            <IconCamera />
          </button>

          {/* Mic / Send — plain icon button, same style as camera */}
          <button
            onClick={hasInput ? () => handleSend() : toggleVoice}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: hasInput || listening ? 1 : 0.55, transition: 'opacity 150ms' }}
          >
            {hasInput && !sending
              ? <IconSend />
              : listening
                ? <IconStop />
                : <IconMic active={false} />
            }
          </button>
        </div>
      </div>

      {/* Hidden file inputs for camera/photos */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
      <input ref={photosInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

      {/* Media picker sheet */}
      {showPicker && (
        <MediaPicker
          onCamera={() => { setShowPicker(false); cameraInputRef.current?.click() }}
          onPhotos={() => { setShowPicker(false); photosInputRef.current?.click() }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
