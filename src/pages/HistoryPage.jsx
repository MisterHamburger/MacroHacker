import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { getDailyLogs } from '../services/logs'
import DaySummary from '../components/DaySummary'
import MacroProgressBar from '../components/MacroProgressBar'
import FoodEntryCard from '../components/FoodEntryCard'

export default function HistoryPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const data = await getDailyLogs(user.id)
        setLogs(data)
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  const targets = {
    daily_calories: profile?.daily_calories || 0,
    daily_protein: profile?.daily_protein || 0,
    daily_fat: profile?.daily_fat || 0,
    daily_carbs: profile?.daily_carbs || 0,
  }

  return (
    <div className="pb-24 pt-6 px-4">
      <h2 className="font-bebas text-3xl mb-6" style={{ color: 'var(--text-primary)' }}>History</h2>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            No history yet
          </span>
        </div>
      ) : (
        <div>
          {logs.map((log) => (
            <div key={log.id}>
              <button
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                className="w-full text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <DaySummary
                  date={log.date}
                  entries={log.food_entries || []}
                  targets={targets}
                />
              </button>

              {expanded === log.id && (
                <div className="py-4 flex flex-col gap-3">
                  {(log.food_entries || []).length > 0 ? (
                    <>
                      <MacroProgressBar
                        totals={(log.food_entries || []).reduce(
                          (acc, e) => ({
                            calories: acc.calories + (e.total_calories || 0),
                            protein: acc.protein + (e.total_protein || 0),
                            fat: acc.fat + (e.total_fat || 0),
                            carbs: acc.carbs + (e.total_carbs || 0),
                          }),
                          { calories: 0, protein: 0, fat: 0, carbs: 0 }
                        )}
                        targets={targets}
                      />
                      {(log.food_entries || []).map((entry) => (
                        <FoodEntryCard key={entry.id} entry={entry} />
                      ))}
                    </>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-widest py-2" style={{ color: 'var(--text-muted)' }}>
                      No entries
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
