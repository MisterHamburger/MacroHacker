export default function MacroProgressBar({ totals, targets }) {
  const macros = [
    { key: 'calories', label: 'CAL', unit: 'kcal' },
    { key: 'protein', label: 'PRO', unit: 'g' },
    { key: 'fat', label: 'FAT', unit: 'g' },
    { key: 'carbs', label: 'CARB', unit: 'g' },
  ]

  const getValue = (key) => totals[key] || 0
  const getTarget = (key) => {
    const map = { calories: 'daily_calories', protein: 'daily_protein', fat: 'daily_fat', carbs: 'daily_carbs' }
    return targets[map[key]] || 0
  }

  return (
    <div className="p-5 rounded-lg" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)' }}>
      {/* Big numbers grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {macros.map(({ key, label, unit }) => {
          const val = getValue(key)
          const target = getTarget(key)
          const over = val > target && target > 0
          return (
            <div key={key} className="text-center">
              <div
                className="font-bebas text-3xl leading-none"
                style={{ color: key === 'calories' && !over ? 'var(--accent)' : over ? 'var(--status-over)' : 'var(--text-primary)' }}
              >
                {val}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                {label}
              </div>
              <div className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                / {target}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-3">
        {macros.map(({ key, label }) => {
          const val = getValue(key)
          const target = getTarget(key)
          const pct = target > 0 ? Math.min((val / target) * 100, 100) : 0
          const over = val > target && target > 0
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {val} / {target}
                </span>
              </div>
              <div className="w-full h-[3px] rounded-full" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    background: over ? 'var(--status-over)' : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
