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
  return (
    <nav className="top-nav">
      <span className="brand">
        Concord <span className="brand-slash">/</span> Merchant Graph
      </span>
      {NAV_ITEMS.map((item) => (
        <span
          key={item.id}
          className={`nav-link ${view === item.id ? 'is-active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </span>
      ))}
    </nav>
  )
}
