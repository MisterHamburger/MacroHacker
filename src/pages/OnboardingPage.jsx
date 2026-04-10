import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../services/profile'

const STEPS = ['name', 'age_sex', 'height_weight', 'activity']
const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

export default function OnboardingPage({ onComplete }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    age: '',
    sex: 'male',
    height_feet: '',
    height_inches: '',
    weight_lbs: '',
    activity_level: 'moderate',
  })

  const totalInches = (parseInt(form.height_feet) || 0) * 12 + (parseInt(form.height_inches) || 0)

  async function handleFinish() {
    if (!user) return
    setLoading(true)
    try {
      await updateProfile(user.id, {
        name: form.name,
        age: parseInt(form.age),
        sex: form.sex,
        height_inches: totalInches,
        weight_lbs: parseFloat(form.weight_lbs),
        activity_level: form.activity_level,
      })
      onComplete?.()
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setLoading(false)
    }
  }

  function next() { if (step < STEPS.length - 1) setStep(step + 1) }
  function back() { if (step > 0) setStep(step - 1) }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(240,240,250,0.05)',
    border: '1px solid rgba(240,240,250,0.2)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontFamily: DIN,
    fontSize: '13px',
    letterSpacing: '0.02em',
    textTransform: 'none',
    outline: 'none',
  }

  const chipActive = {
    flex: 1,
    padding: '12px',
    background: 'var(--text-primary)',
    color: '#000000',
    border: '1px solid var(--text-primary)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: DIN_BOLD,
    fontWeight: 700,
    fontSize: '10px',
    letterSpacing: '1.17px',
    textTransform: 'uppercase',
    textAlign: 'center',
  }

  const chipInactive = {
    flex: 1,
    padding: '12px',
    background: 'var(--ghost-bg)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(240,240,250,0.15)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: DIN,
    fontSize: '10px',
    letterSpacing: '1.17px',
    textTransform: 'uppercase',
    textAlign: 'center',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '64px 24px 32px', background: 'var(--bg-base)' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '48px' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: '2px', background: i <= step ? 'var(--text-primary)' : 'var(--border)' }} />
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {STEPS[step] === 'name' && (
          <div>
            <h2 style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '32px', letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '32px' }}>
              What's your name?
            </h2>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              style={inputStyle}
              autoFocus
            />
          </div>
        )}

        {STEPS[step] === 'age_sex' && (
          <div>
            <h2 style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '32px', letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '32px' }}>
              Age & Sex
            </h2>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="Age"
              style={{ ...inputStyle, marginBottom: '12px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {['male', 'female'].map((s) => (
                <button key={s} onClick={() => setForm({ ...form, sex: s })} style={form.sex === s ? chipActive : chipInactive}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {STEPS[step] === 'height_weight' && (
          <div>
            <h2 style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '32px', letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '32px' }}>
              Height & Weight
            </h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input type="number" value={form.height_feet} onChange={(e) => setForm({ ...form, height_feet: e.target.value })} placeholder="Feet" style={{ ...inputStyle, flex: 1 }} autoFocus />
              <input type="number" value={form.height_inches} onChange={(e) => setForm({ ...form, height_inches: e.target.value })} placeholder="Inches" style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input type="number" value={form.weight_lbs} onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })} placeholder="Weight (lbs)" style={inputStyle} />
          </div>
        )}

        {STEPS[step] === 'activity' && (
          <div>
            <h2 style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '32px', letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '32px' }}>
              Activity Level
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                { value: 'light', label: 'Light', desc: '1–3 days/week' },
                { value: 'moderate', label: 'Moderate', desc: '3–5 days/week' },
                { value: 'active', label: 'Active', desc: '6–7 days/week' },
                { value: 'very_active', label: 'Very Active', desc: 'Twice daily' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, activity_level: value })}
                  style={{
                    ...(form.activity_level === value ? chipActive : chipInactive),
                    flex: 'unset',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontFamily: DIN, fontSize: '10px', letterSpacing: '0.5px', opacity: 0.6, textTransform: 'none', fontWeight: 400 }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
        {step > 0 && (
          <button
            onClick={back}
            style={{ padding: '14px 24px', background: 'var(--ghost-bg)', color: 'var(--text-secondary)', border: '1px solid var(--ghost-border)', borderRadius: '32px', cursor: 'pointer', fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.17px', textTransform: 'uppercase' }}
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            style={{ flex: 1, padding: '14px', background: 'var(--text-primary)', color: '#000000', border: '1px solid var(--text-primary)', borderRadius: '32px', cursor: 'pointer', fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.17px', textTransform: 'uppercase' }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading || !form.name || !form.age || !totalInches || !form.weight_lbs}
            style={{ flex: 1, padding: '14px', background: 'var(--text-primary)', color: '#000000', border: '1px solid var(--text-primary)', borderRadius: '32px', cursor: 'pointer', fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.17px', textTransform: 'uppercase', opacity: (loading || !form.name || !form.age || !totalInches || !form.weight_lbs) ? 0.35 : 1 }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  )
}
