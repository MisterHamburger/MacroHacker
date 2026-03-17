export default function DaySummary({ date, entries, targets }) {
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.total_calories || 0),
      protein: acc.protein + (e.total_protein || 0),
    }),
    { calories: 0, protein: 0 }
  )

  const calHit = targets.daily_calories > 0 && totals.calories <= targets.daily_calories
  const proHit = targets.daily_protein > 0 && totals.protein >= targets.daily_protein * 0.9

  const formatted = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex justify-between items-center py-3 px-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatted}</span>
      <div className="flex gap-3 items-center">
        <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {totals.calories} cal
        </span>
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: calHit && proHit ? 'var(--accent)' : 'var(--status-over)' }}
        >
          {calHit && proHit ? 'HIT' : 'MISS'}
        </span>
      </div>
    </div>
  )
}
