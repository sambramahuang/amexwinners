import { getMerchant, matchesForMerchant, otherSide } from '../data/mockData'

interface MatchDetailPanelProps {
  merchantId: string | null
  onSelectMerchant: (id: string) => void
}

function SymmetryBar({ score }: { score: number }) {
  return (
    <div className="symmetry-bar">
      <div className="symmetry-track">
        <div className="symmetry-fill" style={{ width: `${score}%` }} />
      </div>
      <span className="mono symmetry-value">{score}/100</span>
    </div>
  )
}

export default function MatchDetailPanel({ merchantId, onSelectMerchant }: MatchDetailPanelProps) {
  if (!merchantId) {
    return (
      <div className="panel">
        <p className="panel-empty">
          Select a merchant on the graph to see its complementary matches,
          the reasoning behind each one, and its value-symmetry score.
        </p>
      </div>
    )
  }

  const merchant = getMerchant(merchantId)
  const matches = matchesForMerchant(merchantId)

  if (!merchant) return null

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="eyebrow">{merchant.category} · Amex merchant since {merchant.sinceAmex}</span>
        <h3>{merchant.name}</h3>
      </div>

      <div className="panel-list">
        {matches.map((m) => {
          const partnerId = otherSide(m, merchantId)
          const partner = getMerchant(partnerId)
          if (!partner) return null
          return (
            <div key={m.id} className="match-card">
              <div className="match-card-head">
                <button className="link-button" onClick={() => onSelectMerchant(partnerId)}>
                  {partner.name}
                </button>
                <span className="mono match-stat">{m.sequencePct}% within 14 days</span>
              </div>
              <p className="match-explanation">{m.explanation}</p>
              <SymmetryBar score={m.symmetryScore} />
              <div className="uplift-row">
                <span>Projected uplift · {merchant.name.split(' ')[0]}: <strong>{m.a === merchantId ? m.upliftA : m.upliftB}</strong></span>
                <span>{partner.name.split(' ')[0]}: <strong>{m.a === merchantId ? m.upliftB : m.upliftA}</strong></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
