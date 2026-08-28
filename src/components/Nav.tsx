import { useState } from 'react'
import type { Role, View } from '../App'
import './Nav.css'

interface NavProps {
  view: View
  onChange: (view: View) => void
  items: { id: View; label: string }[]
  role: Role
  onSwitchRole: () => void
}

export default function Nav({ view, onChange, items, role, onSwitchRole }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function select(id: View) {
    onChange(id)
    setMobileOpen(false)
  }

  function switchRole() {
    setMobileOpen(false)
    onSwitchRole()
  }

  return (
    <div className="nav-wrap">
      <nav className="top-nav">
        <span className="brand">
          Circuit
          <span className="brand-role-badge">{role === 'amex' ? 'Amex Admin' : 'SME'}</span>
        </span>

        {items.length > 1 && (
          <div className="nav-links">
            {items.map((item) => (
              <span
                key={item.id}
                className={`nav-link ${view === item.id ? 'is-active' : ''}`}
                onClick={() => select(item.id)}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}

        <span className="nav-switch-role" onClick={switchRole}>
          Switch view
        </span>

        {items.length > 1 && (
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
        )}
      </nav>

      {mobileOpen && items.length > 1 && (
        <div className="nav-mobile-menu">
          {items.map((item) => (
            <span
              key={item.id}
              className={`nav-mobile-link ${view === item.id ? 'is-active' : ''}`}
              onClick={() => select(item.id)}
            >
              {item.label}
            </span>
          ))}
          <span className="nav-mobile-link" onClick={switchRole}>
            Switch view
          </span>
        </div>
      )}
    </div>
  )
}
