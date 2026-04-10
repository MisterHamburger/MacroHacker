import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { getHistoryDays } from '../services/logs'

const WORKOUT_LABELS = {
  lifting: 'LIFT',
  skillmill: 'SKILLMILL',
  running: 'RUN',
  tennis: 'TENNIS',
  other: 'WORKOUT',
}

function pct(val, target) {
  if (!target) return 0
  return Math.min(Math.round((val / target) * 100), 100)
}

function hit(val, target) {
  return target > 0 && val >= target * 0.9
}

function DayCard({ day, targets }) {
  const entries = day.food_entries || []
  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + (e.total_calories || 0),
    protein: acc.protein + (e.total_protein || 0),
    fat: acc.fat + (e.total_fat || 0),
    carbs: acc.carbs + (e.total_carbs || 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 })

  const workout = day.workout
  const workoutType = workout?.exercises?.type || null
  const workoutLabel = workoutType ? (WORKOUT_LABELS[workoutType] || 'WORKOUT') : null
  const calHit = hit(totals.calories, targets.daily_calories)
  const proHit = hit(totals.protein, targets.daily_protein)
  const hasFood = entries.length > 0

  const dateLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  }).toUpperCase()

  const macros = [
    { label: 'CAL', val: totals.calories, target: targets.daily_calories },
    { label: 'PRO', val: totals.protein, target: targets.daily_protein },
    { label: 'FAT', val: totals.fat, target: targets.daily_fat },
    { label: 'CARB', val: totals.carbs, target: targets.daily_carbs },
  ]

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-lg)',
      padding: '16px',
      marginBottom: '8px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          {dateLabel}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {workoutLabel && (
            <span style={{
              fontFamily: "'DM Mono',monospace", fontSize: '8px', letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--accent)',
              background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: '4px',
            }}>
              {workoutLabel}
            </span>
          )}
          {hasFood && (
            <span style={{
              fontFamily: "'DM Mono',monospace", fontSize: '8px', letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: calHit && proHit ? 'var(--accent)' : 'var(--text-muted)',
              background: calHit && proHit ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              padding: '2px 7px', borderRadius: '4px',
            }}>
              {calHit && proHit ? 'ON TARGET' : 'OFF TARGET'}
            </span>
          )}
        </div>
      </div>

      {hasFood ? (
        <>
          {/* Big numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', marginBottom: '10px' }}>
            {macros.map(({ label, val, target }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: '22px', lineHeight: 1,
                  color: val > target && target > 0 ? 'var(--status-over)' : label === 'CAL' ? 'var(--accent)' : 'var(--text-primary)'
                }}>
                  {val}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '7px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '1px' }}>
                  {label} <span style={{ color: 'var(--text-secondary)' }}>/{target}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {macros.map(({ label, val, target }) => (
              <div key={label} style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct(val, target)}%`,
                  background: val > target && target > 0 ? 'var(--status-over)' : 'var(--accent)',
                  borderRadius: '2px',
                }} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {workout ? 'Workout logged · No food tracked' : 'No data'}
        </div>
      )}

      {/* Workout detail */}
      {workout?.raw_input && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
          {workout.raw_input}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getHistoryDays(user.id).then(setDays).catch(console.error).finally(() => setLoading(false))
  }, [user])

  const targets = {
    daily_calories: profile?.daily_calories || 0,
    daily_protein: profile?.daily_protein || 0,
    daily_fat: profile?.daily_fat || 0,
    daily_carbs: profile?.daily_carbs || 0,
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding: '24px 16px 8px' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Log
        </div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '32px', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '20px' }}>
          History
        </div>

        {loading ? (
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            Loading...
          </div>
        ) : days.length === 0 ? (
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            No history yet
          </div>
        ) : (
          days.map(day => <DayCard key={day.date} day={day} targets={targets} />)
        )}
      </div>
    </div>
  )
}
