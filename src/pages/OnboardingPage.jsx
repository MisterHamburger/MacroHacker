import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../services/profile'
import { calculateTargets } from '../services/macros'

const STEPS = ['name', 'age_sex', 'height_weight', 'activity', 'goal', 'confirm']

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
    goal: 'recomp',
  })

  const totalInches = (parseInt(form.height_feet) || 0) * 12 + (parseInt(form.height_inches) || 0)

  const targets = form.age && form.weight_lbs && totalInches > 0
    ? calculateTargets({
        sex: form.sex,
        age: parseInt(form.age),
        height_inches: totalInches,
        weight_lbs: parseFloat(form.weight_lbs),
        activity_level: form.activity_level,
        goal: form.goal,
      })
    : null

  async function handleFinish() {
    if (!targets || !user) return
    setLoading(true)
    try {
      await updateProfile(user.id, {
        name: form.name,
        age: parseInt(form.age),
        sex: form.sex,
        height_inches: totalInches,
        weight_lbs: parseFloat(form.weight_lbs),
        activity_level: form.activity_level,
        goal: form.goal,
        ...targets,
      })
      onComplete?.()
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
  }
  function back() {
    if (step > 0) setStep(step - 1)
  }

  const inputStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
  }

  const activeChip = {
    background: 'var(--accent)',
    color: 'var(--bg-base)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--r-sm)',
  }

  const inactiveChip = {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8" style={{ background: 'var(--bg-base)' }}>
      {/* Progress */}
      <div className="flex gap-1 mb-12">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full"
            style={{ background: i <= step ? 'var(--accent)' : 'var(--border)' }}
          />
        ))}
      </div>

      <div className="flex-1">
        {STEPS[step] === 'name' && (
          <div>
            <h2 className="font-bebas text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>What's your name?</h2>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full px-4 py-3 text-sm rounded-md outline-none mt-4"
              style={inputStyle}
              autoFocus
            />
          </div>
        )}

        {STEPS[step] === 'age_sex' && (
          <div>
            <h2 className="font-bebas text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Age & Sex</h2>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="Age"
              className="w-full px-4 py-3 text-sm rounded-md outline-none mt-4"
              style={inputStyle}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, sex: s })}
                  className="flex-1 py-2 font-mono text-xs uppercase tracking-widest"
                  style={form.sex === s ? activeChip : inactiveChip}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {STEPS[step] === 'height_weight' && (
          <div>
            <h2 className="font-bebas text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Height & Weight</h2>
            <div className="flex gap-2 mt-4">
              <input
                type="number"
                value={form.height_feet}
                onChange={(e) => setForm({ ...form, height_feet: e.target.value })}
                placeholder="Feet"
                className="flex-1 px-4 py-3 text-sm rounded-md outline-none"
                style={inputStyle}
                autoFocus
              />
              <input
                type="number"
                value={form.height_inches}
                onChange={(e) => setForm({ ...form, height_inches: e.target.value })}
                placeholder="Inches"
                className="flex-1 px-4 py-3 text-sm rounded-md outline-none"
                style={inputStyle}
              />
            </div>
            <input
              type="number"
              value={form.weight_lbs}
              onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })}
              placeholder="Weight (lbs)"
              className="w-full px-4 py-3 text-sm rounded-md outline-none mt-2"
              style={inputStyle}
            />
          </div>
        )}

        {STEPS[step] === 'activity' && (
          <div>
            <h2 className="font-bebas text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Activity Level</h2>
            <div className="flex flex-col gap-2 mt-4">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                { value: 'light', label: 'Light', desc: '1-3 days/week' },
                { value: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
                { value: 'active', label: 'Active', desc: '6-7 days/week' },
                { value: 'very_active', label: 'Very Active', desc: 'Twice daily' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, activity_level: value })}
                  className="flex justify-between items-center px-4 py-3 font-mono text-xs uppercase tracking-widest"
                  style={form.activity_level === value ? activeChip : inactiveChip}
                >
                  <span>{label}</span>
                  <span className="text-[10px] normal-case" style={{ opacity: 0.6, letterSpacing: '0' }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {STEPS[step] === 'goal' && (
          <div>
            <h2 className="font-bebas text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Goal</h2>
            <div className="flex flex-col gap-2 mt-4">
              {[
                { value: 'cut', label: 'Cut', desc: 'Lose fat' },
                { value: 'recomp', label: 'Recomp', desc: 'Maintain weight' },
                { value: 'bulk', label: 'Bulk', desc: 'Build muscle' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, goal: value })}
                  className="flex justify-between items-center px-4 py-3 font-mono text-xs uppercase tracking-widest"
                  style={form.goal === value ? activeChip : inactiveChip}
                >
                  <span>{label}</span>
                  <span className="text-[10px] normal-case" style={{ opacity: 0.6, letterSpacing: '0' }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {STEPS[step] === 'confirm' && targets && (
          <div>
            <h2 className="font-bebas text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Your Daily Targets</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              Based on your info, here are your daily targets:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Calories', value: targets.daily_calories, unit: 'kcal' },
                { label: 'Protein', value: targets.daily_protein, unit: 'g' },
                { label: 'Fat', value: targets.daily_fat, unit: 'g' },
                { label: 'Carbs', value: targets.daily_carbs, unit: 'g' },
              ].map(({ label, value, unit }) => (
                <div
                  key={label}
                  className="p-4 rounded-md text-center"
                  style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-md)' }}
                >
                  <div className="font-bebas text-3xl" style={{ color: label === 'Calories' ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {value}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                    {label} ({unit})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-8">
        {step > 0 && (
          <button
            onClick={back}
            className="px-6 py-3 rounded-md font-mono text-xs uppercase tracking-widest"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: 'var(--r-sm)' }}
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 py-3 rounded-md font-mono text-xs uppercase tracking-widest"
            style={{ background: 'var(--accent)', color: 'var(--bg-base)', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)' }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex-1 py-3 rounded-md font-mono text-xs uppercase tracking-widest"
            style={{ background: 'var(--accent)', color: 'var(--bg-base)', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Saving...' : "Let's Go"}
          </button>
        )}
      </div>
    </div>
  )
}
