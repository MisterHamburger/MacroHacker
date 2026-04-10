import { useState } from 'react'
import { signIn, signUp } from '../services/auth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccess('Account created — logging you in...')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Email not confirmed')) {
        setError('Check your email and click the confirmation link, then try logging in.')
      } else if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password.')
      } else if (msg.includes('User already registered')) {
        setError('An account with that email already exists. Try logging in instead.')
      } else if (msg.includes('rate limit') || msg.includes('after')) {
        setError('Too many attempts — wait a moment and try again.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-base)' }}>
      <h1 className="font-bebas text-5xl tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
        MACRO HACKER
      </h1>
      <p className="font-mono text-[10px] uppercase tracking-widest mb-12" style={{ color: 'var(--text-muted)' }}>
        Precision Nutrition Tracking
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        {error && (
          <div className="text-xs font-mono p-3" style={{ color: 'var(--status-over)', background: 'rgba(255,107,107,0.1)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,107,107,0.2)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs font-mono p-3" style={{ color: 'var(--accent)', background: 'var(--accent-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(200,241,53,0.2)' }}>
            {success}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)' }}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)' }}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-mono text-xs uppercase tracking-widest"
          style={{
            background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : 'var(--bg-base)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: 'var(--r-sm)',
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
        </button>

        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null) }}
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
