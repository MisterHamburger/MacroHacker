import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { isBasicProfileComplete, isProfileComplete } from './services/profile'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import WelcomeChatPage from './pages/WelcomeChatPage'
import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import BottomNav from './components/BottomNav'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, refresh } = useProfile()

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (!isBasicProfileComplete(profile)) {
    return <OnboardingPage onComplete={refresh} />
  }

  if (!isProfileComplete(profile)) {
    return <WelcomeChatPage onComplete={refresh} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-lg mx-auto">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
