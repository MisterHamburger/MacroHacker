import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '⊕' },
  { to: '/history', label: 'History', icon: '☰' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-mono uppercase tracking-widest transition-colors ${
                isActive ? 'text-accent' : 'text-text-secondary'
              }`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' })}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
