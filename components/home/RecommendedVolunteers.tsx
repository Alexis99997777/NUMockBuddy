// 前端展示组件：fetch 接口 渲染卡片
// 数据流：
//   1) 挂载 → fetch /api/auth/me 拿 nuid
//   2) 用 nuid → fetch /api/recommendations?userId=nuid
//   3) 拿到推荐结果 → 渲染卡片（按 source 切换标题与文案）
//   4) 未登录 / 无推荐 → 整段不渲染

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// 直接从 lib 导入类型 —— 前后端共享同一份定义
import type { Recommendation } from '@/lib/recommend';


// 描述 /api/recommendations 这个 HTTP 接口的返回值形状
type ApiResponse = {
  recommendations: Recommendation[];
  source: 'personalized' | 'popular' | 'newcomers';
};


// 三种 source → 各自的 eyebrow + headline + subtext
const COPY: Record<ApiResponse['source'], {
  eyebrow: string;
  headline: React.ReactNode;
  subtext: string;
}> = {
  personalized: {
    eyebrow: 'Recommended for You',
    headline: (
      <>
        Mentors{' '}
        <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>matched to you</span>{' '}
        by AI.
      </>
    ),
    subtext: 'Picked from your recent practice — companies, roles, interview types you cared about.',
  },
  popular: {
    eyebrow: 'Trending on Campus',
    headline: (
      <>
        Most{' '}
        <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>booked</span>{' '}
        mentors this week.
      </>
    ),
    subtext: 'Start with the volunteers your peers found most helpful.',
  },
  newcomers: {
    eyebrow: 'Just Joined',
    headline: (
      <>
        New{' '}
        <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>NU voices</span>{' '}
        on the platform.
      </>
    ),
    subtext: 'Be among the first to connect with these mentors.',
  },
};


export default function RecommendedVolunteers() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // 防止组件卸载后还往 state 写 → React 内存泄漏警告
    let cancelled = false;

    async function load() {
      try {
        // 1) 拿当前登录用户的 nuid
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { if (!cancelled) setHidden(true); return; }
        const me = await meRes.json();
        if (!me?.nuid) { if (!cancelled) setHidden(true); return; }

        // 2) 用 nuid 拿推荐
        const recRes = await fetch(`/api/recommendations?userId=${me.nuid}`, {
          cache: 'no-store',
        });
        if (!recRes.ok) throw new Error('Failed to load recommendations');
        const recData: ApiResponse = await recRes.json();
        if (!cancelled) setData(recData);
      } catch (err) {
        console.error('RecommendedVolunteers load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // 三种隐藏情况：未登录 / 加载中（显示骨架屏）/ 无推荐结果
  if (hidden) return null;
  if (loading) return <SectionSkeleton />;
  if (!data || data.recommendations.length === 0) return null;

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      // 顶部贴紧 Hero —— 上 12px，下 80px，左右 24px
      padding: '12px 24px 80px',
      background: '#fff',
    }}>
      <style>{`
        @media (max-width: 1024px) { .rec-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  {
          .rec-grid { grid-template-columns: 1fr !important; }
          .rec-section { padding: 24px 16px 60px !important; }
        }
      `}</style>

      <div className="rec-section" style={{
        maxWidth: 1200,             // 跟 Hero 保持一致
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Cards Grid：桌面 3 列、平板 2 列、手机 1 列 */}
        <div className="rec-grid animate-fade-up animate-delay-1" style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {data.recommendations.map((rec, i) => (
            <VolunteerCard key={rec.volunteer.id} rec={rec} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}


// 单张推荐卡片
function VolunteerCard({ rec, index }: { rec: Recommendation; index: number }) {
  const v = rec.volunteer;
  // 把姓名拆首字母做头像（例如 "Alice Wei" → "AW"）
  const initials = v.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  // 把逗号分隔的 skills 字符串拆成数组，最多显示 3 个
  const skills = (v.skills ?? '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);

  return (
    <div style={{
      position: 'relative',
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      padding: 26,
      border: '1px solid var(--color-gray-200)',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(200,16,46,0.15)';
        e.currentTarget.style.borderColor = 'var(--color-red)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-gray-200)';
      }}
    >
      {/* 顶部 4px 红色 accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 4,
        background: 'linear-gradient(90deg, var(--color-red) 0%, #E63E5F 100%)',
      }} />

      {/* 右上角排名角标 */}
      <div style={{
        position: 'absolute',
        top: 16, right: 18,
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--color-red)',
        letterSpacing: '1px',
      }}>
        #{index + 1}
      </div>

      {/* 头像 + 姓名 + 匹配度 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, marginTop: 6 }}>
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-red) 0%, #E63E5F 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '0.5px',
          boxShadow: 'var(--shadow-red)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 400,
            color: 'var(--color-black)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {v.name}
          </h3>
          {/* 匹配度 pill：浅红底 + 红字 + 五角星 */}
          {rec.score > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-red)',
              background: 'var(--color-red-muted)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              marginTop: 4,
            }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0l1.8 5.5H16l-5 3.7 1.9 5.8L8 11.6 3.1 15l1.9-5.8-5-3.7h6.2z" />
              </svg>
              {(rec.score * 100).toFixed(0)}% MATCH
            </div>
          )}
        </div>
      </div>

      {/* 公司 · 角色 */}
      <p style={{
        fontSize: 14,
        color: 'var(--color-gray-600)',
        marginBottom: 14,
        fontWeight: 600,
      }}>
        {[v.company, v.role].filter(Boolean).join(' · ') || 'NU Mentor'}
      </p>

      {/* 技能 chips（红底浅色，醒目但不抢戏） */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {skills.map(s => (
            <span key={s} style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-red)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-red-muted)',
              border: '1px solid var(--color-red-border)',
            }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* 推荐理由（每条带红色圆形勾选） */}
      {rec.reasons.length > 0 && (
        <ul style={{
          listStyle: 'none',
          marginBottom: 20,
          flex: 1,
          padding: 0,
        }}>
          {rec.reasons.map((r, i) => (
            <li key={i} style={{
              display: 'flex',
              gap: 8,
              fontSize: 13,
              color: 'var(--color-gray-600)',
              lineHeight: 1.5,
              marginBottom: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-red)' }}>
                <circle cx="8" cy="8" r="7" fill="var(--color-red-muted)" />
                <path d="M4.5 8L7 10.5L11.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA：胶囊红按钮 + 红色阴影 + 箭头 */}
      <Link
        href={`/volunteers?highlight=${v.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 18px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-red)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          boxShadow: 'var(--shadow-red)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-red-dark)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-red)'; }}
      >
        Book a Session
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}


// 加载骨架屏：避免主页"咯噔一下"突然冒出一段
function SectionSkeleton() {
  return (
    <section style={{
      padding: '12px 24px 80px',
      background: 'linear-gradient(180deg, var(--color-red-muted) 0%, #fff 35%)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 320, background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }} />
          ))}
        </div>
      </div>
    </section>
  );
}
