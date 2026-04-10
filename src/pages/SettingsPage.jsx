import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { updateProfile } from '../services/profile'
import { calculateTargets } from '../services/macros'
import { signOut } from '../services/auth'

const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <span style={{ fontFamily: DIN, fontSize: '9px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Loading...</span>
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
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(240,240,250,0.05)',
    border: '1px solid rgba(240,240,250,0.15)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontFamily: DIN,
    fontSize: '13px',
    letterSpacing: '0.02em',
    textTransform: 'none',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontFamily: DIN,
    fontSize: '8px',
    letterSpacing: '1.17px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  }

  return (
    <div style={{ paddingTop: '28px', paddingBottom: '96px', paddingLeft: '16px', paddingRight: '16px' }}>
      <div style={{ fontFamily: DIN, fontSize: '8px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
        Profile
      </div>
      <h2 style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '36px', letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '32px' }}>
        Settings
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={labelStyle}>Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sex</label>
            <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div>
            <label style={labelStyle}>Feet</label>
            <input type="number" value={form.height_feet} onChange={(e) => setForm({ ...form, height_feet: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Inches</label>
            <input type="number" value={form.height_inches_rem} onChange={(e) => setForm({ ...form, height_inches_rem: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Weight</label>
            <input type="number" value={form.weight_lbs} onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Activity Level</label>
          <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Goal</label>
          <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="cut">Cut</option>
            <option value="recomp">Recomp</option>
            <option value="bulk">Bulk</option>
          </select>
        </div>

        {message && (
          <div style={{ fontFamily: DIN, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: message === 'Saved' ? 'var(--text-primary)' : 'var(--status-over)' }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '14px', background: saving ? 'var(--ghost-bg)' : 'var(--text-primary)', color: saving ? 'var(--text-muted)' : '#000000', border: `1px solid ${saving ? 'var(--ghost-border)' : 'var(--text-primary)'}`, borderRadius: '32px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.17px', textTransform: 'uppercase', opacity: saving ? 0.5 : 1 }}
        >
          {saving ? 'Saving...' : 'Save & Recalculate'}
        </button>

        <button
          onClick={signOut}
          style={{ width: '100%', padding: '14px', background: 'var(--ghost-bg)', color: 'var(--status-over)', border: '1px solid rgba(255,64,64,0.3)', borderRadius: '32px', cursor: 'pointer', fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.17px', textTransform: 'uppercase', marginTop: '8px' }}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
