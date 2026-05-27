'use client'

import { useState, useEffect } from 'react'

//给typecript做类型检查 给自己和团队看的 作为文档的作用
interface User {
  fullName: string
  nuid: string
  program: string
  gradYear: string
  email: string
}

interface Session {
  id: string
  createdAt: string
  company: string
  role: string
  interviewType: string
  overallScore: number
  eyeContact: number | null
  confidence: number | null
  engagement: number | null
  totalFillers: number
  verdict: string
  answeredCount: number
  skippedCount: number
}


const scoreColor = (s: number) => s >= 7 ? '#16a34a' : s >= 4 ? '#d97706' : '#dc2626'
const scoreBg = (s: number) => s >= 7 ? '#f0fdf4' : s >= 4 ? '#fffbeb' : '#fef2f2'
const FILTER_OPTIONS = ['All Time', 'This Month', 'Technical Only', 'Behavioral Only']

function RadialScore({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ
  const color = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="700">{score}</text>
    </svg>
  )
}

function BarChart({ sessions, filter }: { sessions: Session[]; filter: string }) {
  const filtered = sessions.filter(s => {
    if (filter === 'Technical Only') return s.interviewType?.toLowerCase().includes('technical')
    if (filter === 'Behavioral Only') return s.interviewType?.toLowerCase().includes('behavioral')
    if (filter === 'This Month') {
      const d = new Date(s.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  }).slice(-6)

  if (filtered.length === 0) {
    return <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>No sessions match this filter</div>
  }

  const max = 10
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, padding: '0 4px' }}>
      {filtered.map((s, i) => {
        const val = s.overallScore
        const label = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: scoreColor(val) }}>{val}</span>
            <div style={{
              width: '100%',
              height: `${(val / max) * 90}px`,
              minHeight: 4,
              background: `linear-gradient(to top, ${scoreColor(val)}, ${scoreColor(val)}88)`,
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.4s ease',
            }} />
            <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All Time')
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('overview')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setUser(data.user)
          setSessions(data.sessions || [])
        }
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: 'var(--color-red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#888', fontSize: 14 }}>Loading your dashboard…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3' }}>
      <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>{error}</p>
        <a href="/login" style={{ color: 'var(--color-red)', fontSize: 14 }}>Sign in to view your dashboard →</a>
      </div>
    </div>
  )

  if (!user) return null

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.overallScore, 0) / sessions.length * 10) / 10
    : 0
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.overallScore)) : 0
  const avgFillerWords = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.totalFillers, 0) / sessions.length)
    : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user.fullName.split(' ')[0]

  const latestSession = sessions[0]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: 'var(--font-body)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '32px 40px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 500,
                flexShrink: 0,
              }}>
                {firstName[0]}
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{greeting},</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--color-black)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                  {user.fullName}
                </h1>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                  NUID: {user.nuid} · {user.program || 'NU Student'} · {user.gradYear ? `Class of ${user.gradYear}` : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Avg Score', value: sessions.length > 0 ? `${avgScore}/10` : '—', color: sessions.length > 0 ? scoreColor(avgScore) : '#aaa' },
                { label: 'Sessions', value: sessions.length, color: '#111' },
                { label: 'Best Score', value: sessions.length > 0 ? `${bestScore}/10` : '—', color: sessions.length > 0 ? scoreColor(bestScore) : '#aaa' },
                { label: 'Avg Filler Words', value: sessions.length > 0 ? avgFillerWords : '—', color: '#d97706' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#F7F6F3', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            {(['overview', 'sessions', ] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '10px 24px', border: 'none', background: 'transparent',
                fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--color-red)' : '#888',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--color-red)' : '2px solid transparent',
                transition: 'all 0.15s', textTransform: 'capitalize',
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Score trend */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 2 }}>Score Trend</h2>
                  <p style={{ fontSize: 12, color: '#aaa' }}>Overall score across your {sessions.length} sessions</p>
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, color: '#444', background: '#FAFAFA', cursor: 'pointer', outline: 'none' }}>
                  {FILTER_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              {sessions.length === 0
                ? <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>No practice sessions yet — start practicing!</div>
                : <BarChart sessions={sessions} filter={filter} />
              }
            </div>

            {/* Latest session scores */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>Latest Session Scores</h2>
              {!latestSession ? (
                <p style={{ color: '#aaa', fontSize: 13 }}>No sessions yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                    {latestSession.company} — {latestSession.role} · {new Date(latestSession.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {[
                    { label: 'Overall Score', val: latestSession.overallScore },
                    { label: 'Eye Contact', val: Math.round(latestSession.eyeContact ?? 0) },
                    { label: 'Confidence', val: Math.round(latestSession.confidence ?? 0) },
                    { label: 'Engagement', val: Math.round(latestSession.engagement ?? 0) },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: '#555' }}>{m.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor(m.val) }}>{m.val}/10</span>
                      </div>
                      <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${(m.val / 10) * 100}%`, background: scoreColor(m.val), borderRadius: 99, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Focus areas */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>Focus Areas</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '🎯', title: 'Reduce filler words', desc: sessions.length > 0 ? `Avg ${avgFillerWords} per session — aim for under 5` : 'Start a session to track filler words', color: '#fef2f2', border: '#fecaca' },
                  { icon: '💻', title: 'Strengthen technical skills', desc: 'Practice coding problems daily on LeetCode', color: '#eff6ff', border: '#bfdbfe' },
                  { icon: '📢', title: 'Use STAR format', desc: 'Structure behavioral answers clearly', color: '#f0fdf4', border: '#bbf7d0' },
                ].map(tip => (
                  <div key={tip.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: tip.color, border: `1px solid ${tip.border}`, borderRadius: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{tip.title}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', fontFamily: 'var(--font-display)' }}>
                Practice Sessions
              </h2>
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, color: '#444', background: '#FAFAFA', cursor: 'pointer', outline: 'none' }}>
                {FILTER_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {sessions.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                <p style={{ fontWeight: 600, color: '#111', marginBottom: 8 }}>No sessions yet</p>
                <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Complete a mock interview to see your results here</p>
                <a href="/practice" style={{ background: 'var(--color-red)', color: '#fff', padding: '10px 24px', borderRadius: 99, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  Start Practicing →
                </a>
              </div>
            ) : (
              sessions
                .filter(s => {
                  if (filter === 'Technical Only') return s.interviewType?.toLowerCase().includes('technical')
                  if (filter === 'Behavioral Only') return s.interviewType?.toLowerCase().includes('behavioral')
                  if (filter === 'This Month') {
                    const d = new Date(s.createdAt)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  }
                  return true
                })
                .map(s => (
                  <div key={s.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <RadialScore score={s.overallScore} size={60} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{s.company} — {s.role}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: s.verdict === 'Pass' ? '#f0fdf4' : '#fef2f2', color: s.verdict === 'Pass' ? '#16a34a' : '#dc2626' }}>
                          {s.verdict}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {[
                          { label: 'Type', val: s.interviewType },
                          { label: 'Date', val: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                          { label: 'Answered', val: `${s.answeredCount} / ${s.answeredCount + s.skippedCount}` },
                          { label: 'Filler Words', val: s.totalFillers },
                        ].map(item => (
                          <span key={item.label} style={{ fontSize: 12, color: '#888' }}>
                            <span style={{ color: '#bbb' }}>{item.label}: </span>{item.val}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[
                        { label: 'Score', val: s.overallScore },
                        { label: 'Eye', val: Math.round(s.eyeContact ?? 0) },
                        { label: 'Conf', val: Math.round(s.confidence ?? 0) },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: 'center' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: scoreBg(m.val), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: scoreColor(m.val) }}>
                            {m.val}
                          </div>
                          <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        
          
        
      </div>
    </div>
  )
}