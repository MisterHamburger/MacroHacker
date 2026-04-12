import { NavLink } from 'react-router-dom'

const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

const tabs = [
  { to: '/', label: 'Today', icon: '⊕' },
  { to: '/history', label: 'History', icon: '☰' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '64px', maxWidth: '768px', margin: '0 auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: isActive ? DIN_BOLD : DIN,
              fontWeight: isActive ? 700 : 400,
              fontSize: '11px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              transition: 'color 150ms',
            })}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
