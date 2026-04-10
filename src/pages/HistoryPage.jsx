import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { getHistoryDays } from '../services/logs'

const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

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
    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 0', marginBottom: '4px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.17px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          {dateLabel}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {workoutLabel && (
            <span style={{ fontFamily: DIN, fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)', border: '1px solid var(--ghost-border)', padding: '2px 8px', borderRadius: '32px' }}>
              {workoutLabel}
            </span>
          )}
          {hasFood && (
            <span style={{
              fontFamily: DIN,
              fontSize: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: calHit && proHit ? 'var(--text-primary)' : 'var(--text-muted)',
              border: `1px solid ${calHit && proHit ? 'var(--ghost-border)' : 'rgba(240,240,250,0.08)'}`,
              padding: '2px 8px',
              borderRadius: '32px',
            }}>
              {calHit && proHit ? 'On Target' : 'Off Target'}
            </span>
          )}
        </div>
      </div>

      {hasFood ? (
        <>
          {/* Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', marginBottom: '10px' }}>
            {macros.map(({ label, val, target }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '20px', lineHeight: 1, letterSpacing: '0.96px', color: val > target && target > 0 ? 'var(--status-over)' : 'var(--text-primary)' }}>
                  {val}
                </div>
                <div style={{ fontFamily: DIN, fontSize: '7px', letterSpacing: '1px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                  {label} <span style={{ color: 'var(--text-secondary)' }}>/{target}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {macros.map(({ label, val, target }) => (
              <div key={label} style={{ flex: 1, height: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct(val, target)}%`, background: val > target && target > 0 ? 'var(--status-over)' : 'var(--text-primary)' }} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: DIN, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {workout ? 'Workout logged · No food tracked' : 'No data'}
        </div>
      )}

      {/* Workout detail */}
      {workout?.raw_input && (
        <div style={{ marginTop: '12px', fontFamily: DIN, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: '0.02em', lineHeight: 1.5 }}>
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
      <div style={{ padding: '28px 16px 8px' }}>
        <div style={{ fontFamily: DIN, fontSize: '8px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Log
        </div>
        <div style={{ fontFamily: DIN_BOLD, fontWeight: 700, fontSize: '36px', letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '24px' }}>
          History
        </div>

        {loading ? (
          <div style={{ fontFamily: DIN, fontSize: '9px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            Loading...
          </div>
        ) : days.length === 0 ? (
          <div style={{ fontFamily: DIN, fontSize: '9px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            No history yet
          </div>
        ) : (
          days.map(day => <DayCard key={day.date} day={day} targets={targets} />)
        )}
      </div>
    </div>
  )
}
