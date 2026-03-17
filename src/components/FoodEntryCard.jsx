import { deleteFoodEntry } from '../services/logs'

export default function FoodEntryCard({ entry, onDelete }) {
  const items = entry.items || []

  async function handleDelete() {
    try {
      await deleteFoodEntry(entry.id)
      onDelete?.()
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  return (
    <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)' }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {items.map((item, i) => (
            <div key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {item.quantity} {item.unit} {item.name}
            </div>
          ))}
        </div>
        <button
          onClick={handleDelete}
          className="text-xs font-mono uppercase tracking-widest px-2 py-1 rounded"
          style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      <div className="flex gap-4 mt-2">
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
          {entry.total_calories} cal
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {entry.total_protein}p
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {entry.total_fat}f
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {entry.total_carbs}c
        </span>
      </div>
    </div>
  )
}
