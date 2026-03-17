import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { updateProfile } from '../services/profile'
import { calculateTargets } from '../services/macros'
import { signOut } from '../services/auth'

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, refresh } = useProfile()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        age: profile.age || '',
        sex: profile.sex || 'male',
        height_feet: profile.height_inches ? Math.floor(profile.height_inches / 12).toString() : '',
        height_inches_rem: profile.height_inches ? (profile.height_inches % 12).toString() : '',
        weight_lbs: profile.weight_lbs || '',
        activity_level: profile.activity_level || 'moderate',
        goal: profile.goal || 'recomp',
      })
    }
  }, [profile])

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  const totalInches = (parseInt(form.height_feet) || 0) * 12 + (parseInt(form.height_inches_rem) || 0)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setMessage(null)
    try {
      const targets = calculateTargets({
        sex: form.sex,
        age: parseInt(form.age),
        height_inches: totalInches,
        weight_lbs: parseFloat(form.weight_lbs),
        activity_level: form.activity_level,
        goal: form.goal,
      })

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

      await refresh()
      setMessage('Saved')
    } catch (err) {
      setMessage('Failed to save')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
  }

  return (
    <div className="pb-24 pt-6 px-4">
      <h2 className="font-bebas text-3xl mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h2>

      <div className="flex flex-col gap-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 text-sm rounded-md outline-none"
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-md outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Sex</label>
            <select
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-md outline-none"
              style={inputStyle}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Feet</label>
            <input
              type="number"
              value={form.height_feet}
              onChange={(e) => setForm({ ...form, height_feet: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-md outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Inches</label>
            <input
              type="number"
              value={form.height_inches_rem}
              onChange={(e) => setForm({ ...form, height_inches_rem: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-md outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Weight</label>
            <input
              type="number"
              value={form.weight_lbs}
              onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })}
              className="w-full px-4 py-3 text-sm rounded-md outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Activity Level</label>
          <select
            value={form.activity_level}
            onChange={(e) => setForm({ ...form, activity_level: e.target.value })}
            className="w-full px-4 py-3 text-sm rounded-md outline-none"
            style={inputStyle}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Goal</label>
          <select
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            className="w-full px-4 py-3 text-sm rounded-md outline-none"
            style={inputStyle}
          >
            <option value="cut">Cut</option>
            <option value="recomp">Recomp</option>
            <option value="bulk">Bulk</option>
          </select>
        </div>

        {message && (
          <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: message === 'Saved' ? 'var(--accent)' : 'var(--status-over)' }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-md font-mono text-xs uppercase tracking-widest"
          style={{ background: 'var(--accent)', color: 'var(--bg-base)', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)', opacity: saving ? 0.5 : 1 }}
        >
          {saving ? 'Saving...' : 'Save & Recalculate'}
        </button>

        <button
          onClick={signOut}
          className="w-full py-3 rounded-md font-mono text-xs uppercase tracking-widest mt-4"
          style={{ background: 'transparent', color: 'var(--status-over)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: 'var(--r-sm)' }}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
