'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.endsWith('@northeastern.edu') && !email.endsWith('@husky.neu.edu')) {
      setError('Must use a Northeastern email (@northeastern.edu or @husky.neu.edu).')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    //显示加载中 按钮转圈
    setLoading(true)
    try {
      //发请求给后端的登陆接口
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      //把后端 返回的数据解析出来
      const data = await res.json()
      //判断登陆成不成功
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.')
      } else {
        window.location.href = '/'
      }
    } catch {
      //网络断了服务器挂了 才走这里
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        {/* Background photo */}
        <div className="auth-left-photo" />
        {/* Red overlay */}
        <div className="auth-left-overlay" />
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-logo-mark">N</div>
            <span className="auth-brand-name">NUMockBuddy</span>
          </div>
          <div className="auth-left-content">
            <h1 className="auth-headline">
              Your co-op career<br />
              <em>starts here.</em>
            </h1>
            <p className="auth-subtext">
              AI-powered interview prep built exclusively for Northeastern students. Practice with real company patterns, get instant feedback, and land your dream co-op.
            </p>
            <div className="auth-stats">
              <div className="auth-stat">
                <span className="auth-stat-num">2,400+</span>
                <span className="auth-stat-label">NU Students</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <span className="auth-stat-num">94%</span>
                <span className="auth-stat-label">Co-op Placement</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <span className="auth-stat-num">50+</span>
                <span className="auth-stat-label">Companies</span>
              </div>
            </div>
          </div>
          <div className="auth-left-bg-circle" />
          <div className="auth-left-bg-circle2" />
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Sign in with your Northeastern credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Northeastern Email
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <path d="M3 8l9 6 9-6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@northeastern.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input auth-input-pw"
                  autoComplete="current-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link href="/signup" className="auth-switch-link">Create one</Link>
          </p>

          <div className="auth-footer-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            For Northeastern University students only
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family: var(--font-body);
        }

        /* LEFT */
        .auth-left {
          width: 44%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: stretch;
        }
        .auth-left-photo {
          position: absolute;
          inset: 0;
          background: url('/nuStudents.jpg') center center / cover no-repeat;
          z-index: 0;
        }
        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: rgba(200, 16, 46, 0.82);
          z-index: 1;
          transition: opacity 0.5s ease;
        }
        .auth-left:hover .auth-left-overlay {
          opacity: 0;
        }
        .auth-left-inner {
          position: relative;
          z-index: 3;
          padding: 48px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
        }
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-logo-mark {
          width: 40px;
          height: 40px;
          background: white;
          color: var(--color-red);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }
        .auth-brand-name {
          color: white;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.3px;
        }
        .auth-left-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 0;
        }
        .auth-headline {
          font-family: var(--font-display);
          font-size: clamp(36px, 3.5vw, 52px);
          color: white;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
        }
        .auth-headline em {
          font-style: italic;
          opacity: 0.85;
        }
        .auth-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 15px;
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 48px;
        }
        .auth-stats {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .auth-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .auth-stat-num {
          color: white;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .auth-stat-label {
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .auth-stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.2);
        }
        .auth-left-bg-circle {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          bottom: -180px;
          right: -140px;
          z-index: 1;
        }
        .auth-left-bg-circle2 {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -80px;
          right: 40px;
          z-index: 1;
        }

        /* RIGHT */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 48px 32px;
        }
        .auth-form-wrapper {
          width: 100%;
          max-width: 420px;
        }
        .auth-form-header {
          margin-bottom: 36px;
        }
        .auth-form-title {
          font-family: var(--font-display);
          font-size: 32px;
          color: var(--color-black);
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .auth-form-subtitle {
          color: var(--color-gray-400);
          font-size: 15px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-black);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .auth-label-hint {
          font-weight: 400;
          color: var(--color-gray-400);
          font-size: 12px;
        }
        .auth-label-link {
          font-weight: 400;
          color: var(--color-red);
          font-size: 13px;
          text-decoration: none;
        }
        .auth-label-link:hover { text-decoration: underline; }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: var(--color-gray-400);
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-black);
          background: var(--color-gray-100);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .auth-input::placeholder { color: var(--color-gray-400); }
        .auth-input-pw { padding-right: 44px; }
        .auth-eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-gray-400);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .auth-eye-btn:hover { color: var(--color-black); }
        .auth-input:focus {
          border-color: var(--color-red);
          background: #fff;
          box-shadow: 0 0 0 3px var(--color-red-muted);
        }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-red-muted);
          border: 1px solid var(--color-red-border);
          color: var(--color-red);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
        }
        .auth-btn {
          width: 100%;
          padding: 14px;
          background: var(--color-red);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: var(--shadow-red);
          margin-top: 4px;
        }
        .auth-btn:hover:not(:disabled) {
          background: var(--color-red-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(200,16,46,0.35);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-switch {
          text-align: center;
          font-size: 14px;
          color: var(--color-gray-400);
          margin-bottom: 24px;
        }
        .auth-switch-link {
          color: var(--color-red);
          font-weight: 600;
          text-decoration: none;
        }
        .auth-switch-link:hover { text-decoration: underline; }
        .auth-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-gray-400);
          border-top: 1px solid var(--color-gray-200);
          padding-top: 20px;
        }

        @media (max-width: 768px) {
          .auth-page { flex-direction: column; }
          .auth-left { width: 100%; min-height: 280px; }
          .auth-left-inner { padding: 32px 24px; }
          .auth-left-content { padding: 24px 0; }
          .auth-right { padding: 40px 24px; }
        }
      `}</style>
    </div>
  )
}