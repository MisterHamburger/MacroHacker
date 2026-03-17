import { useState } from 'react'
import { getEatSuggestions } from '../services/ai'

export default function WhatShouldIEat({ remaining }) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const results = await getEatSuggestions(remaining)
      setSuggestions(results)
    } catch (err) {
      setError('Failed to get suggestions. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (suggestions) {
    return (
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)' }}>
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Suggestions
          </span>
          <button
            onClick={() => setSuggestions(null)}
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {suggestions.map((s, i) => (
            <div key={i} className="p-3 rounded-md" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-md)' }}>
              <div className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{s.food}</div>
              <div className="flex gap-3">
                <span className="font-mono text-[10px]" style={{ color: 'var(--accent)' }}>{s.calories} cal</span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {s.protein}p · {s.fat}f · {s.carbs}c
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (remaining.calories <= 200) return null

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 rounded-md font-mono text-xs uppercase tracking-widest"
      style={{
        background: 'var(--accent-dim)',
        color: 'var(--accent)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        borderRadius: 'var(--r-md)',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? 'Thinking...' : 'What should I eat?'}
    </button>
  )
}
