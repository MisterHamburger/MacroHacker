import { useState, useRef } from 'react'
import { parseFoodText, parseFoodPhoto } from '../services/ai'
import { addFoodEntry } from '../services/logs'

export default function FoodInputArea({ logId, userId, onSaved }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('text') // text | voice | photo
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)

  async function handleTextSubmit() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const items = await parseFoodText(text.trim())
      setParsed({ rawInput: text.trim(), items })
    } catch (err) {
      setError('Failed to parse food. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice not supported in this browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setText(transcript)
      setListening(false)
      // Auto-submit after transcription
      setTimeout(() => {
        handleTextSubmitWithValue(transcript)
      }, 100)
    }

    recognition.onerror = () => {
      setListening(false)
      setError('Voice recognition failed. Try again.')
    }

    recognition.onend = () => setListening(false)

    setListening(true)
    setMode('voice')
    recognition.start()
  }

  async function handleTextSubmitWithValue(value) {
    if (!value.trim()) return
    setLoading(true)
    setError(null)
    try {
      const items = await parseFoodText(value.trim())
      setParsed({ rawInput: value.trim(), items })
    } catch (err) {
      setError('Failed to parse food. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setMode('photo')
    try {
      const base64 = await fileToBase64(file)
      const items = await parseFoodPhoto(base64, file.type)
      setParsed({ rawInput: '[photo]', items })
    } catch (err) {
      setError('Failed to analyze photo. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleConfirm() {
    if (!parsed) return
    setLoading(true)
    try {
      await addFoodEntry(logId, userId, parsed.rawInput, parsed.items)
      setParsed(null)
      setText('')
      onSaved?.()
    } catch (err) {
      setError('Failed to save. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setParsed(null)
    setText('')
    setError(null)
  }

  // Confirmation card
  if (parsed) {
    const totals = parsed.items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    )

    return (
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)' }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Confirm Entry
        </div>
        {parsed.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {item.quantity} {item.unit} {item.name}
            </span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {item.calories} cal
            </span>
          </div>
        ))}
        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {totals.calories} cal
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            {totals.protein}p · {totals.fat}f · {totals.carbs}c
          </span>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-md font-mono text-xs uppercase tracking-widest"
            style={{ background: 'var(--accent)', color: 'var(--bg-base)', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)' }}
          >
            {loading ? 'Saving...' : 'Confirm'}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: 'var(--r-sm)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)' }}>
      {error && (
        <div className="text-xs mb-2 font-mono" style={{ color: 'var(--status-over)' }}>
          {error}
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you eat? e.g. 3 eggs, 2 strips bacon, black coffee"
        rows={2}
        className="w-full resize-none text-sm p-3 rounded-md outline-none"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleTextSubmit()
          }
        }}
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleTextSubmit}
          disabled={loading || !text.trim()}
          className="flex-1 py-2 rounded-md font-mono text-xs uppercase tracking-widest"
          style={{
            background: text.trim() ? 'var(--accent)' : 'var(--accent-dim)',
            color: 'var(--bg-base)',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            borderRadius: 'var(--r-sm)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Parsing...' : 'Log Food'}
        </button>
        <button
          onClick={startVoice}
          disabled={loading || listening}
          className="px-3 py-2 rounded-md font-mono text-xs uppercase tracking-widest"
          style={{
            background: listening ? 'var(--accent-dim)' : 'transparent',
            color: listening ? 'var(--accent)' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            borderRadius: 'var(--r-sm)',
          }}
        >
          {listening ? 'REC' : 'MIC'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="px-3 py-2 rounded-md font-mono text-xs uppercase tracking-widest"
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            borderRadius: 'var(--r-sm)',
          }}
        >
          CAM
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
      </div>
    </div>
  )
}
