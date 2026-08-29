import type { Role } from '../App'
import AmexCard3D from '../components/AmexCard3D'
import CornerBrackets from '../components/CornerBrackets'
import './RoleSelectView.css'

interface RoleSelectViewProps {
  onSelect: (role: Role) => void
}

export default function RoleSelectView({ onSelect }: RoleSelectViewProps) {
  return (
    <main className="role-select-main">
      <div className="role-select-card">
        <AmexCard3D height={300} rpm={4.2} holder="Connexion Member" />
      </div>

      <div className="role-select-intro">
        <div className="eyebrow">Connexion by American Express</div>
        <h1>Who's viewing?</h1>
        <p>Pick the interface for this session. You can switch back from the nav bar at any time.</p>
      </div>

      <div className="role-grid">
        <div className="role-card" onClick={() => onSelect('amex')}>
          <CornerBrackets />
          <div className="role-card-label">Internal</div>
          <div className="role-card-title">Amex Admin</div>
          <p className="role-card-description">
            The full toolset: the region's fastest growing merchants, the graph behind them, the matching queue, gap radar and the recruit pitch generator.
          </p>
          <span className="role-card-link">
            Enter admin view
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>

        <div className="role-card" onClick={() => onSelect('sme')}>
          <CornerBrackets />
          <div className="role-card-label">Merchant</div>
          <div className="role-card-title">SME</div>
          <p className="role-card-description">
            Where your business stands against merchants like you, and a queue of partners worth matching with.
          </p>
          <span className="role-card-link">
            Enter matching
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>
    </main>
  )
}
