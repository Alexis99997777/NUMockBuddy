'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

function InterviewLobbyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [interviewType, setInterviewType] = useState('')
  const [jobType, setJobType] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending')

  const 
  videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream>(null)

  // Load params from URL
  useEffect(() => {
    const c = searchParams.get('company') || 'General'
    const r = searchParams.get('role') || 'SWE'
    const it = searchParams.get('interviewType') || 'Technical'
    const jt = searchParams.get('jobType') || 'Internship / Co-op'

    setCompany(c)
    setRole(r)
    setInterviewType(it)
    setJobType(jt)
  }, [searchParams])

  // Stop camera on unmount (e.g. navigating to session without clicking Stop Camera)
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.srcObject = null
      }
      const tracks = streamRef.current?.getTracks() ?? []
      tracks.forEach(track => {
        track.enabled = false
        track.stop()
      })
      streamRef.current = null
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.warn('Autoplay failed, video will play on user interaction:', playErr)
        }
        setCameraActive(true)
        setCameraPermission('granted')
      }
    } catch (err) {
      console.error('Camera access denied:', err)
      setCameraPermission('denied')
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    const tracks = streamRef.current?.getTracks() ?? []
    tracks.forEach(track => {
      track.enabled = false
      track.stop()
    })
    streamRef.current = null
    setCameraActive(false)
  }

  const handleBeginInterview = () => {
    // Explicitly stop lobby camera before navigating — useEffect cleanup is
    // unreliable because Next.js router cache may keep this component alive.
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    const tracks = streamRef.current?.getTracks() ?? []
    tracks.forEach(track => {
      track.enabled = false
      track.stop()
    })
    streamRef.current = null

    const params = new URLSearchParams({
      company,
      role,
      interviewType,
      jobType,
    })
    router.push(`/practice/session?${params.toString()}`)
  }

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'var(--space-3xl)',
      paddingBottom: 'var(--space-3xl)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      background: '#fff',
      minHeight: '100vh',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .lobby-two-col { grid-template-columns: 1fr !important; gap: 20px !important; }
          .lobby-details-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lobby-section { padding-top: 40px !important; padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--color-gray-200) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-gray-200) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      {/* Red glow orb */}
      <div style={{
        position: 'absolute',
        top: -120,
        right: '15%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 600,
              color: 'var(--color-black)',
              marginBottom: 8,
            }}>
              Ready for your interview?
            </h1>
            <p style={{
              fontSize: 16,
              color: 'var(--color-gray-600)',
              maxWidth: 700,
              margin: '0 auto',
            }}>
              Take a moment to set up your camera and review the instructions before beginning.
            </p>
          </div>

          {/* Interview details summary */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            background: '#fff',
            marginBottom: 32,
          }}>
            <h2 style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-black)',
              marginBottom: 16,
            }}>
              Interview Details
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                  Company
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-black)' }}>
                  {company}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                  Role
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-black)' }}>
                  {role}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                  Interview Type
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-black)' }}>
                  {interviewType}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                  Job Type
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-black)' }}>
                  {jobType}
                </div>
              </div>
            </div>
          </div>

          {/* Middle section - Camera and Instructions */}
          <div className="lobby-two-col" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            marginBottom: 48,
          }}>
            {/* Camera setup */}
            <div style={{
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              background: '#fff',
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--color-black)',
                marginBottom: 16,
              }}>
                Camera Setup
              </h3>

              {/* Camera preview */}
              <div style={{
                width: '100%',
                height: 240,
                borderRadius: 'var(--radius-md)',
                background: cameraActive ? '#000' : 'var(--color-gray-100)',
                position: 'relative',
                marginBottom: 16,
                overflow: 'hidden',
              }}>
                {/* Video element always in DOM so ref is available before camera starts */}
                {/**camera standard write**/}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    display: cameraActive ? 'block' : 'none',
                  }}
                />

                {/* Placeholder shown when camera is off */}
                {!cameraActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'var(--color-gray-500)',
                  }}>
                    <div>
                      <div style={{ fontSize: 48, marginBottom: 8, opacity: 0.5 }}>
                        📹
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {cameraPermission === 'denied' ? 'Camera access denied' : 'Camera preview'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div style={{ display: 'flex', gap: 12 }}>
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    style={{
                      flex: 1,
                      padding: '9px 22px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid var(--color-red)',
                      background: 'var(--color-red)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    style={{
                      flex: 1,
                      padding: '9px 22px',
                      borderRadius: 'var(--radius-full)',
                      border: '1.5px solid var(--color-gray-200)',
                      background: 'transparent',
                      color: 'var(--color-black)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Stop Camera
                  </button>
                )}
              </div>

              {cameraPermission === 'denied' && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-red-50, #fef2f2)',
                  border: '1px solid var(--color-red-200, #fecaca)',
                }}>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--color-red-700, #b91c1c)',
                    fontWeight: 500,
                  }}>
                    Camera permission is required for the interview. Please allow camera access and try again.
                  </div>
                </div>
              )}
            </div>

            {/* Instructions panel */}
            <div style={{
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              background: '#fff',
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--color-black)',
                marginBottom: 20,
              }}>
                Before you begin
              </h3>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {[
                  'Your session will be recorded for review',
                  'You have 5 questions to answer',
                  'Timer starts when you click Begin',
                  'Do not switch tabs during the interview',
                  'Make sure your camera and mic are working',
                ].map((instruction, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      marginBottom: 16,
                      fontSize: 14,
                      color: 'var(--color-gray-700)',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--color-red)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      {idx + 1}
                    </div>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom button */}
          <div style={{ textAlign: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleBeginInterview}
              disabled={!cameraActive}
              style={{
                padding: '16px 32px',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              I'm Ready, Begin Interview
            </Button>

            {!cameraActive && (
              <div style={{
                marginTop: 12,
                fontSize: 14,
                color: 'var(--color-gray-500)',
              }}>
                Please start your camera to begin the interview
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function InterviewLobbyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewLobbyContent />
    </Suspense>
  )
}