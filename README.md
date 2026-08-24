# Circuit — Amex AI Hackathon 2026, Round 1 prototype

Built with React + TypeScript + Vite.

A working prototype of the three-pronged SME growth idea: one merchant
graph built from Amex's closed-loop transaction data, powering merchant
matching, gap-driven outreach, and prospect acquisition previews.

**This is a demo, not a production build.** All merchants, customers,
scores, and uplift figures are synthetic — invented for the purpose of
showing the system's reasoning, not real Amex data.

## What it shows

The app has three tabs, each mapped to one prong of the idea, all reading
from the same underlying merchant graph (`src/data/mockData.js`):

- **Merchant Matches (Prong 1)** — click any merchant node to see its
  complementary matches, the transaction-based reasoning behind each one,
  and a value-symmetry score. The symmetry score exists specifically to
  avoid the failure mode that sank Amex's earlier Plenti coalition-loyalty
  program: a match where value flows mostly one way is scored low, even
  if the raw customer overlap looks strong.
- **Outreach Gaps (Prong 3)** — click a marked gap to see which merchant
  category is missing from a cluster despite cross-cluster demand evidence,
  and the target profile Amex's sales team should look for.
- **Prospect Preview (Prong 2)** — pick a business category to see the
  kind of pitch a not-yet-Amex prospect would be shown. Since prospects
  have no Amex transaction history, this is a category-level projection
  drawn from patterns in the existing graph, not a live computed match —
  visualised as a dashed "ghost node" attaching to the graph at the gap
  it would fill.

## Running it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  data/mockData.ts        synthetic merchant graph, matches, gaps, prospects
                           (typed: Merchant, Match, Gap, ProspectProfile)
  components/
    GraphView.tsx          the node-link graph (shared across all three tabs)
    MatchDetailPanel.tsx   Prong 1 side panel
    GapDetailPanel.tsx     Prong 3 side panel
    ProspectPanel.tsx      Prong 2 side panel
  App.tsx                  tab state, layout, ghost-node positioning
```

## What would change for a real build

- `mockData.ts` would be replaced by real, anonymised, aggregated
  transaction data, subject to Amex's PDPA-compliant aggregation
  thresholds and per-merchant consent for matching.
- The matching, symmetry-scoring, and gap-detection logic here is
  simplified/illustrative — a production version would need a real
  collaborative-filtering model for Prong 1 and a real graph-completion
  approach for Prong 3.
- Node positions are hand-placed for a stable, legible demo layout rather
  than computed from a live graph-layout algorithm.
