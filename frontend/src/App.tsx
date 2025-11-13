import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

type HealthResponse = {
  status: string
  uptime: number
  timestamp: string
}

type UpdateItem = {
  id: number
  title: string
  message: string
}

type EchoResponse = {
  received: boolean
  data: unknown
  timestamp: string
}

const resolveApiBase = () => {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

function App() {
  const apiBase = useMemo(() => resolveApiBase(), [])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [updates, setUpdates] = useState<UpdateItem[]>([])
  const [updatesError, setUpdatesError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [echo, setEcho] = useState<EchoResponse | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  function buildUrl(path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${apiBase}${normalizedPath}`
  }

  useEffect(() => {
    let cancelled = false

    async function fetchHealth() {
      try {
        const response = await fetch(buildUrl('/api/health'))

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload: HealthResponse = await response.json()
        if (!cancelled) {
          setHealth(payload)
          setHealthError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setHealth(null)
          setHealthError(error instanceof Error ? error.message : 'Unable to load health check')
        }
      }
    }

    fetchHealth()

    const id = window.setInterval(fetchHealth, 30000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [apiBase])

  useEffect(() => {
    let cancelled = false

    async function fetchUpdates() {
      try {
        const response = await fetch(buildUrl('/api/updates'))

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload: { updates: UpdateItem[] } = await response.json()
        if (!cancelled) {
          setUpdates(payload.updates)
          setUpdatesError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setUpdates([])
          setUpdatesError(error instanceof Error ? error.message : 'Unable to load updates')
        }
      }
    }

    fetchUpdates()

    return () => {
      cancelled = true
    }
  }, [apiBase])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!message.trim()) {
      setSubmitStatus('error')
      setSubmitError('Please enter a message before submitting.')
      return
    }

    setSubmitStatus('sending')
    setSubmitError(null)

    try {
      const response = await fetch(buildUrl('/api/data'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload: EchoResponse = await response.json()
      setEcho(payload)
      setSubmitStatus('success')
      setMessage('')
    } catch (error) {
      setSubmitStatus('error')
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit message')
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Deploy Ecosystem Dashboard</h1>
        <p className="app__subtitle">
          Frontend and backend run as independent services. API base: <code>{apiBase}</code>
        </p>
      </header>

      <section className="card">
        <h2>Health Check</h2>
        {health && !healthError ? (
          <div className="health-grid">
            <div>
              <span className="label">Status</span>
              <span className={`value value--${health.status.toLowerCase()}`}>{health.status}</span>
            </div>
            <div>
              <span className="label">Uptime</span>
              <span className="value">{Math.round(health.uptime)} seconds</span>
            </div>
            <div>
              <span className="label">Timestamp</span>
              <span className="value">{new Date(health.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <p className="error">{healthError ?? 'Loading health information...'}</p>
        )}
      </section>

      <section className="card">
        <h2>Platform Updates</h2>
        {updatesError ? (
          <p className="error">{updatesError}</p>
        ) : (
          <ul className="updates">
            {updates.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Send a Message</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="message">Payload</label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message to POST to the backend..."
            rows={4}
          />
          <button type="submit" disabled={submitStatus === 'sending'}>
            {submitStatus === 'sending' ? 'Sending…' : 'Send to backend'}
          </button>
        </form>
        {submitError && <p className="error">{submitError}</p>}
        {submitStatus === 'success' && echo && (
          <pre className="response" aria-live="polite">
            {JSON.stringify(echo, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}

export default App
