import { useState } from 'react'
import { signIn, signUp } from '../services/auth'

const DIN = "'D-DIN', Arial, Verdana, sans-serif"
const DIN_BOLD = "'D-DIN-Bold', 'D-DIN', Arial, Verdana, sans-serif"

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

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(240,240,250,0.05)',
    border: '1px solid rgba(240,240,250,0.2)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontFamily: DIN,
    fontSize: '13px',
    letterSpacing: '0.02em',
    textTransform: 'none',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: 'var(--bg-base)' }}>
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{ fontFamily: DIN_BOLD, fontSize: '42px', fontWeight: 700, letterSpacing: '0.96px', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1, textAlign: 'center' }}>
          Macro Hacker
        </h1>
      </div>
      <p style={{ fontFamily: DIN, fontSize: '10px', letterSpacing: '1.17px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '48px', textAlign: 'center' }}>
        Precision Nutrition Tracking
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {error && (
          <div style={{ fontFamily: DIN, fontSize: '11px', letterSpacing: '0.5px', padding: '12px 14px', color: 'var(--status-over)', background: 'rgba(255,64,64,0.08)', borderRadius: '4px', border: '1px solid rgba(255,64,64,0.2)', textTransform: 'none' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ fontFamily: DIN, fontSize: '11px', letterSpacing: '0.5px', padding: '12px 14px', color: 'var(--text-primary)', background: 'var(--ghost-bg)', borderRadius: '4px', border: '1px solid var(--ghost-border)', textTransform: 'none' }}>
            {success}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? 'var(--ghost-bg)' : 'var(--text-primary)',
            color: loading ? 'var(--text-muted)' : '#000000',
            border: loading ? '1px solid var(--ghost-border)' : '1px solid var(--text-primary)',
            borderRadius: '32px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: DIN_BOLD,
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '1.17px',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
        </button>

        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null) }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: DIN, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
