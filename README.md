# Circuit — Amex AI Hackathon 2026, Round 1 prototype

Built with React + TypeScript + Vite.

A working prototype of the three-pronged SME growth idea: one merchant
graph built from Amex's closed-loop transaction data, powering merchant
matching, gap-driven outreach, and prospect acquisition previews.

**This is a demo, not a production build.** All merchants, customers,
scores, and uplift figures are synthetic — invented for the purpose of
showing the system's reasoning, not real Amex data.

## What it shows

The app has five views, reachable from the top nav, all reading from the
same underlying merchant graph (`src/data/graphEngineData.ts` for match/
prospect data, `src/data/graphSceneConfigs.ts` for the 3D graph layout):

- **Overview** — a one-page explanation of the graph model and links into
  the graph and the three prongs below.
- **Graph** — the full merchant graph as an interactive, self-rotating
  three.js scene (drag to rotate manually). Node shade indicates industry;
  dashed nodes are structural gaps; the faint dashed bridge between the
  two clusters is a cross-cluster signal too weak for Prong 1 to act on
  yet, kept visible rather than discarded.
- **Matching (Prong 1)** — a swipe-card queue of merchants already
  accepting Amex, ranked by graph signal strength. Each card shows the
  transaction-based reasoning behind the match and a value-symmetry
  check. The symmetry score exists specifically to avoid the failure mode
  that sank Amex's earlier Plenti coalition-loyalty program: a match
  where value flows mostly one way is flagged, even if the raw customer
  overlap looks strong. Swipe right (or click the check button) to match
  and add to the pipeline; swipe left to pass. The "It's a match" dialog's
  AI explainability layer calls a small Express backend (`server/`) which
  asks OpenAI to explain the match in plain language, grounded in the
  card's own numbers — see "Running it" below for the extra setup step.
  Before the queue, an optional four-question partnership-preferences
  questionnaire adds a secondary, self-reported signal: it can nudge
  ranking by up to 30% and color the AI explanation, but the real
  closed-loop transaction data — customer overlap, sequential-visit
  signal, uplift — stays the dominant 70% weight, and the questionnaire is
  fully skippable, so the app works the same without it.
- **Gap Radar (Prong 3)** — a 3D graph per cluster showing a tight,
  mutually overlapping merchant group with a structural hole (a category
  that's clearly missing), plus a ranked table of recruit targets that
  would fill each gap and why.
- **Recruit Pitch (Prong 2)** — pick a prospect from the Gap Radar table
  (or the pill selector) to see the pitch a not-yet-Amex business would
  be shown. Since prospects have no Amex transaction history, this is a
  category-level projection drawn from patterns in the existing graph,
  honestly labeled as predictive rather than a live computed match.

## Running it

```bash
npm install
cp .env.example .env   # then fill in OPENAI_API_KEY
npm run dev
```

`npm run dev` runs the Vite dev server and the AI backend together
(`vite` + `node server/index.js`, via `concurrently`); the frontend
proxies `/api/*` to the backend on port 8787. To run either alone, use
`npm run dev:web` or `npm run dev:server`. Without a valid
`OPENAI_API_KEY`, the AI backend refuses to start, and the "It's a
match" dialog falls back to the card's static sequential-signal text.

Then open the local URL Vite prints (usually `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  data/
    graphEngineData.ts       synthetic match candidates + recruit prospects
                              (typed: MatchCandidate, ProspectTarget)
    graphSceneConfigs.ts      node/edge/gap layout for the three.js graphs
                              (typed: GraphSceneConfig)
    personalityQuiz.ts        the four partnership-preference questions +
                              profile builder (typed: PersonalityQuestion,
                              PersonalityProfile)
  utils/
    personalityFit.ts         local heuristic blending questionnaire answers
                              with the transaction overlap score — no model call
  components/
    Nav.tsx                 top navigation between the five views
    CornerBrackets.tsx       shared corner-crosshair card decoration
    MatchModal.tsx           "it's a match" confirmation dialog + AI
                              explainability layer
    PersonalityQuiz.tsx       optional partnership-preferences questionnaire
                              shown before the matching queue
    GraphCanvas.tsx           reusable three.js node-link graph (mount/
                              rotate/dispose lifecycle), used by both
                              Graph and Gap Radar
  views/
    OverviewView.tsx         landing page, links into the graph + prongs
    GraphView.tsx             full interactive 3D merchant graph
    MatchingView.tsx          Prong 1 — swipe-card matching queue
    GapRadarView.tsx          Prong 3 — 3D cluster graphs + target table
    RecruitPitchView.tsx      Prong 2 — projected pitch for a prospect
  App.tsx                    view state + routing; Graph and Gap Radar are
                              lazy-loaded so three.js only ships when opened
server/
  index.js                   Express backend; POST /api/explain-match
                              calls OpenAI to generate the match
                              explanation shown in MatchModal
```

## What would change for a real build

- `graphEngineData.ts` would be replaced by real, anonymised, aggregated
  transaction data, subject to Amex's PDPA-compliant aggregation
  thresholds and per-merchant consent for matching.
- The matching, symmetry-scoring, and gap-detection logic here is
  simplified/illustrative — a production version would need a real
  collaborative-filtering model for Prong 1 and a real graph-completion
  approach for Prong 3.
- The graph and gap-radar node positions in `graphSceneConfigs.ts` are
  hand-placed for a stable, legible demo rather than computed from a live
  force-directed graph-layout algorithm over the full merchant network.
