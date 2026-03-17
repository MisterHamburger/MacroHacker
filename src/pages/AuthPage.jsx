import { useState } from 'react'
import { signIn, signUp } from '../services/auth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError(err.message)
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
          <div className="text-xs font-mono p-3 rounded-md" style={{ color: 'var(--status-over)', background: 'rgba(255,107,107,0.1)', borderRadius: 'var(--r-sm)' }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 text-sm rounded-md outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 text-sm rounded-md outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-md font-mono text-xs uppercase tracking-widest"
          style={{
            background: 'var(--accent)',
            color: 'var(--bg-base)',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--r-sm)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '...' : isLogin ? 'Log In' : 'Sign Up'}
        </button>

        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(null) }}
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
