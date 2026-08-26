import { useState } from 'react'
import type { View } from '../App'
import './Nav.css'

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'graph', label: 'Graph' },
  { id: 'match', label: 'Matching' },
  { id: 'gaps', label: 'Gap Radar' },
  { id: 'pitch', label: 'Recruit Pitch' },
]

interface NavProps {
  view: View
  onChange: (view: View) => void
}

export default function Nav({ view, onChange }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function select(id: View) {
    onChange(id)
    setMobileOpen(false)
  }

  return (
    <div className="nav-wrap">
      <nav className="top-nav">
        <span className="brand">
          Circuit <span className="brand-slash">/</span> Merchant Graph
        </span>

        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <span
              key={item.id}
              className={`nav-link ${view === item.id ? 'is-active' : ''}`}
              onClick={() => select(item.id)}
            >
              {item.label}
            </span>
          ))}
        </div>

        <button
          className={`nav-toggle ${mobileOpen ? 'is-open' : ''}`}
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {mobileOpen && (
        <div className="nav-mobile-menu">
          {NAV_ITEMS.map((item) => (
            <span
              key={item.id}
              className={`nav-mobile-link ${view === item.id ? 'is-active' : ''}`}
              onClick={() => select(item.id)}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
