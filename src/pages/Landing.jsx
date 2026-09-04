import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

const SriLankaMap = lazy(() => import('../components/SriLankaMap.jsx'))
const WeatherPanel = lazy(() => import('../components/WeatherPanel.jsx'))

function Landing() {
  return (
    <div className="landing">
      <section className="hero-section">
        <h1>Report. Verify. Respond.</h1>
        <p>
          One connected platform for reporting, tracking and coordinating
          flood and disaster relief across Sri Lanka.
        </p>
      </section>

      <section className="emergency-banner">
        <strong>Latest Emergency:</strong> No active emergency alerts.
      </section>

      <section className="problem-section">
        <h2>The Problem</h2>
        <ul>
          <li>
            Residents have no single place to see which areas are currently
            affected or at risk.
          </li>
          <li>
            Official flood/road/shelter updates are slow, scattered across
            bulletins, news and word of mouth.
          </li>
          <li>
            Relief coordination is ad hoc — requests for help and the teams
            who can respond aren't matched systematically.
          </li>
        </ul>
      </section>

      <section className="disaster-areas-section">
        <h2>Disaster Areas</h2>
        <Suspense fallback={<p className="placeholder">Loading map…</p>}>
          <SriLankaMap />
        </Suspense>
        <Link to="/disaster-areas" className="landing-link">
          Browse all disaster areas →
        </Link>
      </section>

      <section className="weather-section">
        <h2>Weather by District</h2>
        <p>
          The latest forecast published for each district. Heavy rain and
          thunderstorms are highlighted.
        </p>
        <Suspense fallback={<p className="placeholder">Loading forecasts…</p>}>
          <WeatherPanel />
        </Suspense>
      </section>

      <section className="news-section">
        <h2>News &amp; Alerts</h2>
        <p>
          Verified updates on flooding, landslides and relief efforts across
          the country.
        </p>
        <Link to="/news" className="landing-link">
          Read the news feed →
        </Link>
      </section>
    </div>
  )
}

export default Landing
