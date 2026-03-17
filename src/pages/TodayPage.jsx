import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useDailyLog } from '../hooks/useDailyLog'
import MacroProgressBar from '../components/MacroProgressBar'
import FoodEntryCard from '../components/FoodEntryCard'
import FoodInputArea from '../components/FoodInputArea'
import WhatShouldIEat from '../components/WhatShouldIEat'

export default function TodayPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { log, entries, totals, loading, refresh } = useDailyLog()

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  const targets = {
    daily_calories: profile.daily_calories || 0,
    daily_protein: profile.daily_protein || 0,
    daily_fat: profile.daily_fat || 0,
    daily_carbs: profile.daily_carbs || 0,
  }

  const remaining = {
    calories: Math.max(0, targets.daily_calories - totals.calories),
    protein: Math.max(0, targets.daily_protein - totals.protein),
    fat: Math.max(0, targets.daily_fat - totals.fat),
    carbs: Math.max(0, targets.daily_carbs - totals.carbs),
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="pb-40 pt-6 px-4">
      <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        {today}
      </div>

      <MacroProgressBar totals={totals} targets={targets} />

      <div className="mt-4">
        <WhatShouldIEat remaining={remaining} />
      </div>

      {/* Food entries */}
      <div className="mt-6 flex flex-col gap-3">
        {entries.map((entry) => (
          <FoodEntryCard key={entry.id} entry={entry} onDelete={refresh} />
        ))}
        {entries.length === 0 && (
          <div className="text-center py-8">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              No food logged yet today
            </span>
          </div>
        )}
      </div>

      {/* Sticky input at bottom */}
      {log && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2" style={{ background: 'var(--bg-base)' }}>
          <FoodInputArea logId={log.id} userId={user.id} onSaved={refresh} />
        </div>
      )}
    </div>
  )
}
